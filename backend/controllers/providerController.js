const Provider = require('../models/Provider');
const Job = require('../models/Job');

const getProviderProfile = async (req, res) => {
  try {
    const provider = await Provider.findOne({ user: req.user._id })
      .populate('user', 'name email phone profileImage')
      .populate('jobsPosted');
    if (!provider) {
      return res.status(404).json({ message: 'Provider profile not found' });
    }
    res.json(provider);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const updateProviderProfile = async (req, res) => {
  try {
    const provider = await Provider.findOne({ user: req.user._id });
    if (!provider) {
      return res.status(404).json({ message: 'Provider profile not found' });
    }

    const { companyName, description, location, website } = req.body;

    provider.companyName = companyName || provider.companyName;
    provider.description = description || provider.description;
    provider.location = location || provider.location;
    provider.website = website || provider.website;

    const updated = await provider.save();
    res.json(updated);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const getAllProviders = async (req, res) => {
  try {
    const providers = await Provider.find({ isApproved: true }).populate('user', 'name email profileImage');
    res.json(providers);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const postJob = async (req, res) => {
  try {
    const provider = await Provider.findOne({ user: req.user._id });
    if (!provider) {
      return res.status(404).json({ message: 'Provider profile not found' });
    }

    const { title, description, category, skillsRequired, location, salary, jobType, deadline } = req.body;

    const job = await Job.create({
      title,
      description,
      category,
      skillsRequired,
      location,
      salary,
      jobType,
      deadline,
      provider: provider._id,
    });

    provider.jobsPosted.push(job._id);
    await provider.save();

    res.status(201).json(job);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const getMyJobs = async (req, res) => {
  try {
    const provider = await Provider.findOne({ user: req.user._id });
    const jobs = await Job.find({ provider: provider._id }).populate('applicants.worker');
    res.json(jobs);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const updateApplicationStatus = async (req, res) => {
  try {
    const job = await Job.findById(req.params.jobId);
    if (!job) {
      return res.status(404).json({ message: 'Job not found' });
    }

    const applicant = job.applicants.find(
      (a) => a.worker.toString() === req.params.workerId
    );
    if (!applicant) {
      return res.status(404).json({ message: 'Applicant not found' });
    }

    applicant.status = req.body.status || applicant.status;
    await job.save();

    res.json({ message: 'Application status updated', job });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const deleteJob = async (req, res) => {
  try {
    const job = await Job.findById(req.params.jobId);
    if (!job) {
      return res.status(404).json({ message: 'Job not found' });
    }
    await job.deleteOne();
    res.json({ message: 'Job removed' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

module.exports = {
  getProviderProfile,
  updateProviderProfile,
  getAllProviders,
  postJob,
  getMyJobs,
  updateApplicationStatus,
  deleteJob,
};