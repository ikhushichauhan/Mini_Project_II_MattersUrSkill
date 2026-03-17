const Worker = require('../models/Worker');
const Job = require('../models/Job');

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

    const { skills, bio, category, availability, location, portfolio } = req.body;

    worker.skills = skills || worker.skills;
    worker.bio = bio || worker.bio;
    worker.category = category || worker.category;
    worker.availability = availability !== undefined ? availability : worker.availability;
    worker.location = location || worker.location;
    worker.portfolio = portfolio || worker.portfolio;

    const updated = await worker.save();
    res.json(updated);
  } catch (error) {
    res.status(500).json({ message: error.message });
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