const express = require('express');
const router  = express.Router();
const { chat } = require('../controllers/chatController');
const { protect } = require('../middleware/authMiddleware');
const Message = require('../models/Message');

router.post('/', chat);

router.get('/messages/:taskId', protect, async (req, res) => {
  try {
    const messages = await Message.find({ task: req.params.taskId })
      .populate('sender', 'name profileImage')
      .populate('receiver', 'name profileImage')
      .sort({ createdAt: 1 });

    res.json({ success: true, data: messages });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

router.put('/messages/:messageId/read', protect, async (req, res) => {
  try {
    const message = await Message.findByIdAndUpdate(
      req.params.messageId,
      { isRead: true },
      { new: true }
    );
    res.json({ success: true, data: message });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

module.exports = router;