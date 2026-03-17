const express           = require('express');
const router            = express.Router();
const {
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
} = require('../controllers/taskController');
const { protect }          = require('../middleware/authMiddleware');
const { authorizeRoles }   = require('../middleware/roleMiddleware');

router.get('/', getAllOpenTasks);

router.post(
  '/',
  protect,
  authorizeRoles('provider'),
  createTask
);

router.get(
  '/my-posted',
  protect,
  authorizeRoles('provider'),
  getMyPostedTasks
);

router.put(
  '/:id',
  protect,
  authorizeRoles('provider'),
  updateTask
);

router.delete(
  '/:id',
  protect,
  authorizeRoles('provider'),
  deleteTask
);

router.put(
  '/:id/applications/:applicationId',
  protect,
  authorizeRoles('provider'),
  handleApplication
);

router.post(
  '/:id/apply',
  protect,
  authorizeRoles('worker'),
  applyForTask
);

router.get(
  '/my-applications',
  protect,
  authorizeRoles('worker'),
  getMyApplications
);

router.get('/:id', protect, getTaskById);

router.put(
  '/:id/complete',
  protect,
  authorizeRoles('worker'),
  markTaskCompleted
);

module.exports = router;