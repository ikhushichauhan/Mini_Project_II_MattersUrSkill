const https   = require('https');
const jwt     = require('jsonwebtoken');
const User    = require('../models/User');
const Task    = require('../models/Task');
const { JWT_SECRET } = require('../config/config');

function callOpenRouter(messages, systemPrompt) {
  return new Promise((resolve, reject) => {
    const apiKey = process.env.OPENROUTER_API_KEY;  
    if (!apiKey) {
      return reject(new Error('AI service is not configured. Please set OPENROUTER_API_KEY in your .env file.'));
    }

    const body = JSON.stringify({
      model:       process.env.OPENROUTER_MODEL || 'mistralai/mistral-7b-instruct:free',
      messages:    [{ role: 'system', content: systemPrompt }, ...messages.slice(-20)],
      max_tokens:  600,
      temperature: 0.7,
    });

    const options = {
      hostname: 'openrouter.ai',
      path:     '/api/v1/chat/completions',
      method:   'POST',
      headers:  {
        'Content-Type':   'application/json',
        'Authorization':  `Bearer ${apiKey}`,
        'HTTP-Referer':   process.env.CLIENT_URL || 'http://localhost:3000',
        'X-Title':        'MattersUrSkills',
        'Content-Length': Buffer.byteLength(body),
      },
    };

    const req = https.request(options, (httpRes) => {
      let data = '';
      httpRes.on('data', (chunk) => (data += chunk));
      httpRes.on('end', () => {
        try {
          const parsed = JSON.parse(data);
          if (parsed.error) {
            return reject(new Error(parsed.error.message || 'AI service returned an error'));
          }
          const content = parsed.choices?.[0]?.message?.content;
          if (!content) {
            return reject(new Error('No response from AI model'));
          }
          resolve(content.trim());
        } catch {
          reject(new Error('Failed to parse AI response'));
        }
      });
    });

    req.on('error', reject);
    req.setTimeout(30000, () => {
      req.destroy();
      reject(new Error('AI request timed out. Please try again.'));
    });
    req.write(body);
    req.end();
  });
}

function buildSystemPrompt(userContext) {
  const base = `You are a helpful AI assistant for MattersUrSkills, a platform that connects skilled workers with service providers across India.

About MattersUrSkills:
- Connects local skilled workers (plumbers, electricians, painters, cooks, delivery persons, data entry operators, etc.) with service providers
- Workers can register, upload their profile, list skills, and apply for tasks posted by providers
- Providers can post tasks/jobs with budgets, skill requirements, and deadlines
- Budget and payments are in INR (Indian Rupee)
- Supports full-time, part-time, home-based, and flexible work arrangements
- Task statuses: open, in-progress, completed, cancelled
- Users can register as worker, provider, or general user
- The platform values trust, transparency, and fair work opportunities

Guidelines:
- Be concise, friendly, and professional
- Only answer questions related to the platform or the user's own account
- If asked about something off-topic, politely redirect to platform-related topics
- Never reveal other users' private or sensitive information
- Keep responses focused and under 200 words unless a detailed explanation is genuinely needed`;

  if (!userContext) {
    return `${base}

The user is currently not logged in. Only answer general questions about the MattersUrSkills platform. For any account-specific queries (tasks, applications, profile), ask them to log in first.`;
  }

  const { profile, tasks } = userContext;
  const taskSummary =
    tasks.length === 0
      ? 'No tasks or applications on record yet.'
      : tasks
          .map(
            (t) =>
              `- "${t.title}" [${t.status}]${t.category ? `  ${t.category}` : ''}${
                t.budget ? `  ${t.budget.amount} (${t.budget.type})` : ''
              }  ${
                t.postedByMe
                  ? 'Posted by you'
                  : t.assignedToMe
                  ? 'Assigned to you'
                  : 'You applied'
              }`
          )
          .join('\n');

  return `${base}

You are speaking with a logged-in user. Their account details:
- Name: ${profile.name}
- Role: ${profile.role}
- Email: ${profile.email}
- Skills: ${profile.skills?.length ? profile.skills.join(', ') : 'None listed'}
- Location: ${[profile.location?.city, profile.location?.state].filter(Boolean).join(', ') || 'Not set'}
- Bio: ${profile.bio || 'Not provided'}
- Rating: ${profile.ratings?.average?.toFixed(1) || '0.0'}/5.0 (${profile.ratings?.count || 0} reviews)
- Availability: ${profile.availability?.isAvailable ? `Yes (${profile.availability?.workType || 'flexible'})` : 'Currently not available'}

Their tasks and applications (${tasks.length} total):
${taskSummary}

IMPORTANT: Only discuss and share this specific user's own data. Do not fabricate or assume any information not listed above. If you don't have the data to answer, say so honestly.`;
}

const chat = async (req, res, next) => {
  try {
    const { messages } = req.body;

    if (!Array.isArray(messages) || messages.length === 0) {
      res.status(400);
      return next(new Error('messages array is required'));
    }

    const sanitized = messages
      .filter(
        (m) =>
          m &&
          (m.role === 'user' || m.role === 'assistant') &&
          typeof m.content === 'string'
      )
      .map((m) => ({
        role:    m.role,
        content: m.content.slice(0, 500), // hard per-message limit
      }))
      .slice(-20); // keep only the last 20 turns

    if (sanitized.length === 0) {
      res.status(400);
      return next(new Error('No valid messages provided'));
    }

    let userContext = null;
    const authHeader = req.headers.authorization;
    if (authHeader && authHeader.startsWith('Bearer ')) {
      try {
        const token   = authHeader.split(' ')[1];
        const decoded = jwt.verify(token, JWT_SECRET);
        const user    = await User.findById(decoded.id).select('-password -otp');

        if (user && user.isActive) {
          const tasks = await Task.find({
            $or: [
              { postedBy:                user._id },
              { assignedTo:              user._id },
              { 'applications.applicant': user._id },
            ],
          })
            .select('title status budget category postedBy assignedTo applications')
            .limit(30)
            .lean();

          userContext = {
            profile: {
              name:         user.name,
              email:        user.email,
              role:         user.role,
              skills:       user.skills,
              location:     user.location,
              bio:          user.bio,
              ratings:      user.ratings,
              availability: user.availability,
            },
            tasks: tasks.map((t) => ({
              title:        t.title,
              status:       t.status,
              budget:       t.budget,
              category:     t.category,
              postedByMe:   t.postedBy?.toString()  === user._id.toString(),
              assignedToMe: t.assignedTo?.toString() === user._id.toString(),
              appliedByMe:  t.applications?.some(
                (a) => a.applicant?.toString() === user._id.toString()
              ),
            })),
          };
        }
      } catch {
      }
    }

    const systemPrompt = buildSystemPrompt(userContext);
    const reply        = await callOpenRouter(sanitized, systemPrompt);

    res.json({ message: reply });
  } catch (error) {
    next(error);
  }
};

module.exports = { chat };


