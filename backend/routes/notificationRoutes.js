const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/authMiddleware');
const Notification = require('../models/Notification');

router.get('/', protect, async (req, res) => {
  try {
    // Only fetch unread notifications
    const notifications = await Notification.find({ 
      recipient: req.user._id,
      read: false 
    })
      .populate('sender', 'name profileImage')
      .populate('task', 'title')
      .sort({ createdAt: -1 })
      .limit(20);

    const unreadCount = notifications.length;

    res.json({
      success: true,
      data: notifications,
      unreadCount,
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

router.put('/:id/read', protect, async (req, res) => {
  try {
    const notification = await Notification.findOneAndUpdate(
      { _id: req.params.id, recipient: req.user._id },
      { read: true },
      { new: true }
    );

    if (!notification) {
      return res.status(404).json({ success: false, message: 'Notification not found' });
    }

    res.json({ success: true, data: notification });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

router.put('/mark-all-read', protect, async (req, res) => {
  try {
    await Notification.updateMany(
      { recipient: req.user._id, read: false },
      { read: true }
    );

    res.json({ success: true, message: 'All notifications marked as read' });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// Delete all read notifications on logout
router.delete('/cleanup-read', protect, async (req, res) => {
  try {
    const result = await Notification.deleteMany({
      recipient: req.user._id,
      read: true
    });

    res.json({ 
      success: true, 
      message: 'Read notifications deleted',
      deletedCount: result.deletedCount
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

module.exports = router;
