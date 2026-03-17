const User = require('../models/User');
const Worker = require('../models/Worker');
const Provider = require('../models/Provider');
const Job = require('../models/Job');

const getAllUsers = async (req, res) => {
  try {
    const users = await User.find({});
    res.json(users);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const getUserById = async (req, res) => {
  try {
    const user = await User.findById(req.params.id);
    if (!user) return res.status(404).json({ message: 'User not found' });
    res.json(user);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const toggleUserStatus = async (req, res) => {
  try {
    const user = await User.findById(req.params.id);
    if (!user) return res.status(404).json({ message: 'User not found' });

    user.isActive = !user.isActive;
    await user.save();
    res.json({ message: `User ${user.isActive ? 'activated' : 'deactivated'}`, user });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const deleteUser = async (req, res) => {
  try {
    const user = await User.findById(req.params.id);
    if (!user) return res.status(404).json({ message: 'User not found' });

    await user.deleteOne();
    res.json({ message: 'User deleted' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const approveWorker = async (req, res) => {
  try {
    const worker = await Worker.findById(req.params.id);
    if (!worker) return res.status(404).json({ message: 'Worker not found' });

    worker.isApproved = req.body.isApproved !== undefined ? req.body.isApproved : true;
    await worker.save();
    res.json({ message: `Worker ${worker.isApproved ? 'approved' : 'rejected'}`, worker });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const approveProvider = async (req, res) => {
  try {
    const provider = await Provider.findById(req.params.id);
    if (!provider) return res.status(404).json({ message: 'Provider not found' });

    provider.isApproved = req.body.isApproved !== undefined ? req.body.isApproved : true;
    await provider.save();
    res.json({ message: `Provider ${provider.isApproved ? 'approved' : 'rejected'}`, provider });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const getDashboardStats = async (req, res) => {
  try {
    const totalUsers = await User.countDocuments();
    const totalWorkers = await Worker.countDocuments();
    const totalProviders = await Provider.countDocuments();
    const totalJobs = await Job.countDocuments();
    const openJobs = await Job.countDocuments({ status: 'open' });

    res.json({
      totalUsers,
      totalWorkers,
      totalProviders,
      totalJobs,
      openJobs,
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const getAllJobs = async (req, res) => {
  try {
    const jobs = await Job.find({}).populate('provider');
    res.json(jobs);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

module.exports = {
  getAllUsers,
  getUserById,
  toggleUserStatus,
  deleteUser,
  approveWorker,
  approveProvider,
  getDashboardStats,
  getAllJobs,
};