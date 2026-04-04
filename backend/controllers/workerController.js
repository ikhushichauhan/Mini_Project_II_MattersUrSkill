const Worker = require('../models/Worker');
const Job = require('../models/Job');

const ALLOWED_CV_MIME_TYPES = [
  'application/pdf',
  'application/msword',
  'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
];
const MAX_CV_SIZE_BYTES = 2 * 1024 * 1024; // 2 MB

const sanitizeWorkExperience = (entries = []) =>
  entries
    .filter((entry) => entry && typeof entry === 'object')
    .map((entry) => {
      const sanitized = {
        title: String(entry.title || '').trim(),
        company: String(entry.company || '').trim(),
        location: String(entry.location || '').trim(),
        startDate: String(entry.startDate || '').trim(),
        endDate: String(entry.endDate || '').trim(),
        currentlyWorking: Boolean(entry.currentlyWorking),
        description: String(entry.description || '').trim(),
      };

      if (sanitized.currentlyWorking) {
        sanitized.endDate = 'Present';
      }

      return sanitized;
    })
    .filter((entry) => entry.title || entry.company || entry.description);

const sanitizeCvPayload = (payload) => {
  if (!payload || typeof payload !== 'object') return null;

  const fileName = String(payload.fileName || '').trim();
  const fileType = String(payload.fileType || '').trim();
  const rawData = payload.fileData || '';
  const base64Segment = rawData.includes(',') ? rawData.split(',')[1] : '';
  const fileSize = Number(payload.fileSize || 0);

  if (!fileName || !rawData) return null;

  if (!ALLOWED_CV_MIME_TYPES.includes(fileType)) {
    const error = new Error('Only PDF or Word documents are allowed for CV upload');
    error.statusCode = 400;
    throw error;
  }

  if (!base64Segment) {
    const error = new Error('Invalid CV file data provided');
    error.statusCode = 400;
    throw error;
  }

  const bufferSize = Buffer.from(base64Segment, 'base64').length;
  if (bufferSize > MAX_CV_SIZE_BYTES) {
    const error = new Error('CV must be 2MB or smaller');
    error.statusCode = 400;
    throw error;
  }

  const effectiveSize = fileSize || bufferSize;

  return {
    fileName,
    fileType,
    fileSize: effectiveSize,
    fileData: rawData,
    uploadedAt: payload.uploadedAt ? new Date(payload.uploadedAt) : new Date(),
  };
};

const getWorkerProfile = async (req, res) => {
  try {
    const worker = await Worker.findOne({ user: req.user._id }).populate('user', 'name email phone profileImage');
    if (!worker) {
      return res.status(404).json({ message: 'Worker profile not found' });
    }
    res.json(worker);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const updateWorkerProfile = async (req, res) => {
  try {
    const worker = await Worker.findOne({ user: req.user._id });
    if (!worker) {
      return res.status(404).json({ message: 'Worker profile not found' });
    }

    const {
      skills,
      bio,
      category,
      availability,
      location,
      portfolio,
      isGraduate,
      cv,
      workExperience,
    } = req.body;

    if (skills !== undefined) worker.skills = skills;
    if (bio !== undefined) worker.bio = bio;
    if (category !== undefined) worker.category = category;
    if (availability !== undefined) worker.availability = availability;
    if (location !== undefined) worker.location = location;
    if (portfolio !== undefined) worker.portfolio = portfolio;

    if (typeof isGraduate === 'boolean') {
      worker.isGraduate = isGraduate;
      if (!isGraduate) {
        worker.cv = undefined;
      }
    }

    if (Array.isArray(workExperience)) {
      worker.workExperience = sanitizeWorkExperience(workExperience);
    }

    if (cv === null) {
      worker.cv = undefined;
    } else if (cv && worker.isGraduate) {
      const sanitizedCv = sanitizeCvPayload(cv);
      if (sanitizedCv) {
        worker.cv = sanitizedCv;
      }
    } else if (cv && !worker.isGraduate) {
      const error = new Error('CV upload is available only for graduate candidates');
      error.statusCode = 400;
      throw error;
    }

    const updated = await worker.save();
    res.json(updated);
  } catch (error) {
    const status = error.statusCode || 500;
    res.status(status).json({ message: error.message });
  }
};

const getAllWorkers = async (req, res) => {
  try {
    const workers = await Worker.find({ isApproved: true }).populate('user', 'name email profileImage');
    res.json(workers);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const getWorkerById = async (req, res) => {
  try {
    const worker = await Worker.findById(req.params.id).populate('user', 'name email profileImage phone');
    if (!worker) {
      return res.status(404).json({ message: 'Worker not found' });
    }
    res.json(worker);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const applyForJob = async (req, res) => {
  try {
    const job = await Job.findById(req.params.jobId);
    if (!job) {
      return res.status(404).json({ message: 'Job not found' });
    }

    const worker = await Worker.findOne({ user: req.user._id });

    const alreadyApplied = job.applicants.find(
      (a) => a.worker.toString() === worker._id.toString()
    );
    if (alreadyApplied) {
      return res.status(400).json({ message: 'Already applied for this job' });
    }

    job.applicants.push({ worker: worker._id });
    await job.save();

    res.status(201).json({ message: 'Application submitted successfully' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const getMyApplications = async (req, res) => {
  try {
    const worker = await Worker.findOne({ user: req.user._id });
    const jobs = await Job.find({ 'applicants.worker': worker._id }).populate('provider');
    res.json(jobs);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

module.exports = {
  getWorkerProfile,
  updateWorkerProfile,
  getAllWorkers,
  getWorkerById,
  applyForJob,
  getMyApplications,
};