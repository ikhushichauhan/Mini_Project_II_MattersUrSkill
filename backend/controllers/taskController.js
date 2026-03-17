const Task = require('../models/Task');
const User = require('../models/User');

const createTask = async (req, res, next) => {
  try {
    const {
      title,
      description,
      budget,
      location,
      duration,
      category,
      skillsRequired,
      deadline,
    } = req.body;

    if (!title || !description) {
      res.status(400);
      return next(new Error('Title and description are required'));
    }
    if (!budget?.amount && budget?.amount !== 0) {
      res.status(400);
      return next(new Error('Budget amount is required'));
    }
    if (!duration?.value) {
      res.status(400);
      return next(new Error('Duration value is required'));
    }

    const task = await Task.create({
      title,
      description,
      budget,
      location:      location      || {},
      duration,
      category:      category      || '',
      skillsRequired: skillsRequired || [],
      deadline:      deadline      || null,
      postedBy:      req.user._id,       // set from JWT  no spoofing
    });

    res.status(201).json({ success: true, data: task });
  } catch (error) {
    next(error);
  }
};

const updateTask = async (req, res, next) => {
  try {
    const task = await Task.findById(req.params.id);

    if (!task) {
      res.status(404);
      return next(new Error('Task not found'));
    }

    if (task.postedBy.toString() !== req.user._id.toString()) {
      res.status(403);
      return next(new Error('Not authorized  you did not post this task'));
    }

    if (['in-progress', 'completed'].includes(task.status)) {
      res.status(400);
      return next(new Error(`Cannot edit a task that is '${task.status}'`));
    }

    const allowedUpdates = [
      'title', 'description', 'budget', 'location',
      'duration', 'category', 'skillsRequired', 'deadline',
    ];

    allowedUpdates.forEach((field) => {
      if (req.body[field] !== undefined) task[field] = req.body[field];
    });

    const updated = await task.save();
    res.json({ success: true, data: updated });
  } catch (error) {
    next(error);
  }
};

const deleteTask = async (req, res, next) => {
  try {
    const task = await Task.findById(req.params.id);

    if (!task) {
      res.status(404);
      return next(new Error('Task not found'));
    }

    if (task.postedBy.toString() !== req.user._id.toString()) {
      res.status(403);
      return next(new Error('Not authorized  you did not post this task'));
    }

    if (task.status === 'completed') {
      res.status(400);
      return next(new Error('Cannot delete a completed task'));
    }

    task.isActive = false;
    task.status   = 'cancelled';
    await task.save();

    res.json({ success: true, message: 'Task cancelled and removed from listings' });
  } catch (error) {
    next(error);
  }
};

const getMyPostedTasks = async (req, res, next) => {
  try {
    const { status, page = 1, limit = 10 } = req.query;

    const filter = { postedBy: req.user._id };
    if (status) filter.status = status;

    const skip  = (Number(page) - 1) * Number(limit);
    const total = await Task.countDocuments(filter);

    const tasks = await Task.find(filter)
      .populate('assignedTo', 'name email phone profileImage ratings')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(Number(limit));

    res.json({
      success: true,
      total,
      page:  Number(page),
      pages: Math.ceil(total / Number(limit)),
      data:  tasks,
    });
  } catch (error) {
    next(error);
  }
};

const handleApplication = async (req, res, next) => {
  try {
    const { decision } = req.body; // 'accepted' | 'rejected'

    if (!['accepted', 'rejected'].includes(decision)) {
      res.status(400);
      return next(new Error("Decision must be 'accepted' or 'rejected'"));
    }

    const task = await Task.findById(req.params.id);
    if (!task) {
      res.status(404);
      return next(new Error('Task not found'));
    }

    if (task.postedBy.toString() !== req.user._id.toString()) {
      res.status(403);
      return next(new Error('Not authorized  you did not post this task'));
    }

    const application = task.applications.id(req.params.applicationId);
    if (!application) {
      res.status(404);
      return next(new Error('Application not found'));
    }

    application.status = decision;

    if (decision === 'accepted') {
      task.assignedTo = application.applicant;
      task.status     = 'in-progress';

      task.applications.forEach((app) => {
        if (
          app._id.toString() !== application._id.toString() &&
          app.status === 'pending'
        ) {
          app.status = 'rejected';
        }
      });
    }

    await task.save();

    res.json({
      success: true,
      message: `Application ${decision}`,
      data:    task,
    });
  } catch (error) {
    next(error);
  }
};

const getAllOpenTasks = async (req, res, next) => {
  try {
    const {
      category,
      city,
      isRemote,
      minBudget,
      maxBudget,
      search,
      page  = 1,
      limit = 10,
    } = req.query;

    const filter = { status: 'open', isActive: true };

    if (category)  filter.category          = new RegExp(category, 'i');
    if (city)      filter['location.city']  = new RegExp(city, 'i');
    if (isRemote)  filter['location.isRemote'] = isRemote === 'true';
    if (search)    filter.title             = new RegExp(search, 'i');

    if (minBudget || maxBudget) {
      filter['budget.amount'] = {};
      if (minBudget) filter['budget.amount'].$gte = Number(minBudget);
      if (maxBudget) filter['budget.amount'].$lte = Number(maxBudget);
    }

    const skip  = (Number(page) - 1) * Number(limit);
    const total = await Task.countDocuments(filter);

    const tasks = await Task.find(filter)
      .populate('postedBy', 'name profileImage location ratings')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(Number(limit));

    res.json({
      success: true,
      total,
      page:  Number(page),
      pages: Math.ceil(total / Number(limit)),
      data:  tasks,
    });
  } catch (error) {
    next(error);
  }
};

const getTaskById = async (req, res, next) => {
  try {
    const task = await Task.findById(req.params.id)
      .populate('postedBy',   'name email phone profileImage location ratings')
      .populate('assignedTo', 'name email phone profileImage ratings')
      .populate('applications.applicant', 'name profileImage ratings skills');

    if (!task || !task.isActive) {
      res.status(404);
      return next(new Error('Task not found'));
    }

    res.json({ success: true, data: task });
  } catch (error) {
    next(error);
  }
};

const applyForTask = async (req, res, next) => {
  try {
    const task = await Task.findById(req.params.id);

    if (!task || !task.isActive) {
      res.status(404);
      return next(new Error('Task not found'));
    }

    if (task.status !== 'open') {
      res.status(400);
      return next(new Error(`Task is '${task.status}'  applications are closed`));
    }

    if (task.postedBy.toString() === req.user._id.toString()) {
      res.status(400);
      return next(new Error('You cannot apply for your own task'));
    }

    const alreadyApplied = task.applications.some(
      (app) => app.applicant.toString() === req.user._id.toString()
    );
    if (alreadyApplied) {
      res.status(400);
      return next(new Error('You have already applied for this task'));
    }

    task.applications.push({
      applicant: req.user._id,
      message:   req.body.message || '',
    });

    await task.save();

    res.status(201).json({
      success: true,
      message: 'Application submitted successfully',
    });
  } catch (error) {
    next(error);
  }
};

const getMyApplications = async (req, res, next) => {
  try {
    const { status, page = 1, limit = 10 } = req.query;

    const filter = {
      'applications.applicant': req.user._id,
      isActive: true,
    };

    const skip  = (Number(page) - 1) * Number(limit);
    const total = await Task.countDocuments(filter);

    const tasks = await Task.find(filter)
      .populate('postedBy', 'name profileImage location')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(Number(limit));

    const data = tasks.map((task) => {
      const myApp = task.applications.find(
        (app) => app.applicant.toString() === req.user._id.toString()
      );
      return {
        task: {
          _id:         task._id,
          title:       task.title,
          description: task.description,
          budget:      task.budget,
          location:    task.location,
          duration:    task.duration,
          status:      task.status,
          postedBy:    task.postedBy,
          createdAt:   task.createdAt,
        },
        application: myApp,
      };
    });

    const filtered = status
      ? data.filter((d) => d.application?.status === status)
      : data;

    res.json({
      success: true,
      total:  filtered.length,
      page:   Number(page),
      pages:  Math.ceil(total / Number(limit)),
      data:   filtered,
    });
  } catch (error) {
    next(error);
  }
};

const markTaskCompleted = async (req, res, next) => {
  try {
    const task = await Task.findById(req.params.id);

    if (!task) {
      res.status(404);
      return next(new Error('Task not found'));
    }

    if (!task.assignedTo || task.assignedTo.toString() !== req.user._id.toString()) {
      res.status(403);
      return next(new Error('Not authorized  you are not assigned to this task'));
    }

    if (task.status !== 'in-progress') {
      res.status(400);
      return next(new Error(`Task is '${task.status}'  only in-progress tasks can be completed`));
    }

    await task.markCompleted();

    if (req.body.rating !== undefined) {
      const worker = await User.findById(req.user._id);
      if (worker) await worker.updateRating(Number(req.body.rating));
    }

    res.json({
      success: true,
      message: 'Task marked as completed',
      data:    task,
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  createTask,
  updateTask,
  deleteTask,
  getMyPostedTasks,
  handleApplication,
  getAllOpenTasks,
  getTaskById,
  applyForTask,
  getMyApplications,
  markTaskCompleted,
};