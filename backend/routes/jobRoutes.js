const express = require('express');
const router = express.Router();
const Job = require('../models/Job');
const { protect } = require('../middleware/authMiddleware');

router.get('/', async (req, res) => {
  try {
    const { category, location, jobType, search } = req.query;
    const filter = { status: 'open' };

    if (category) filter.category = category;
    if (location) filter.location = new RegExp(location, 'i');
    if (jobType) filter.jobType = jobType;
    if (search) filter.title = new RegExp(search, 'i');

    const jobs = await Job.find(filter).populate('provider', 'companyName location');
    res.json(jobs);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

router.get('/:id', async (req, res) => {
  try {
    const job = await Job.findById(req.params.id).populate('provider');
    if (!job) return res.status(404).json({ message: 'Job not found' });
    res.json(job);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

module.exports = router;