const nodemailer = require('nodemailer');

const buildOtpHtml = (toEmail, toName, otp) => `
  <div style="font-family:sans-serif;background:#111410;color:#e5e7eb;padding:40px;border-radius:12px;max-width:480px;margin:auto;">
    <h2 style="color:#7cbd67;margin-bottom:4px;">MattersUrSkills</h2>
    <p style="margin-top:0;color:#9ca3af;font-size:14px;">Verification Code</p>
    <hr style="border-color:#2a2f27;margin:20px 0;" />
    <p>Hi <strong>${toName || toEmail}</strong>,</p>
    <p>Use the code below to verify your account. It expires in <strong>5 minutes</strong>.</p>
    <div style="text-align:center;margin:32px 0;">
      <span style="font-size:40px;font-weight:900;letter-spacing:12px;color:#7cbd67;">${otp}</span>
    </div>
    <p style="color:#6b7280;font-size:13px;">If you didn't request this, you can safely ignore this email.</p>
  </div>`;

const sendOTPEmail = async (toEmail, toName, otp) => {
  const host        = process.env.EMAIL_HOST;
  const port        = parseInt(process.env.EMAIL_PORT || '587', 10);
  const secure      = process.env.EMAIL_SECURE === 'true';
  const user        = process.env.EMAIL_USER;
  const pass        = process.env.EMAIL_PASSWORD;
  const senderEmail = process.env.BREVO_SENDER_EMAIL;
  const senderName  = process.env.BREVO_SENDER_NAME || 'MattersUrSkills';

  if (!host || !user || !pass || !senderEmail) {
    throw new Error(
      'Email is not configured. Set EMAIL_HOST, EMAIL_USER, EMAIL_PASSWORD, and BREVO_SENDER_EMAIL in .env'
    );
  }

  console.log(`[Email] Connecting to SMTP: host=${host}, port=${port}, secure=${secure}, user=${user}, from=${senderEmail}`);

  const transporter = nodemailer.createTransport({
    host,
    port,
    secure,
    auth: { user, pass },
  });

  const info = await transporter.sendMail({
    from: `"${senderName}" <${senderEmail}>`,
    to: toName ? `"${toName}" <${toEmail}>` : toEmail,
    subject: 'Your MattersUrSkills Verification Code',
    html: buildOtpHtml(toEmail, toName, otp),
  });

  console.log(`[Email] OTP sent to ${toEmail} (messageId: ${info.messageId})`);
  return null; // never expose the OTP
};

module.exports = { sendOTPEmail };