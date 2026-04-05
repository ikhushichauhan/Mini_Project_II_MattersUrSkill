const express = require('express');
const router  = express.Router();
const { chat } = require('../controllers/chatController');
const { protect } = require('../middleware/authMiddleware');
const Message = require('../models/Message');
const Pusher = require('pusher');

const pusher = new Pusher({
  appId:   process.env.PUSHER_APP_ID,
  key:     process.env.PUSHER_KEY,
  secret:  process.env.PUSHER_SECRET,
  cluster: process.env.PUSHER_CLUSTER || 'ap2',
  useTLS:  true,
});

router.post('/', chat);

// Send a message and trigger Pusher event
router.post('/messages', protect, async (req, res) => {
  try {
    const { taskId, receiverId, message } = req.body;
    const newMessage = await Message.create({
      sender:   req.user._id,
      receiver: receiverId,
      task:     taskId,
      message,
    });
    const populated = await Message.findById(newMessage._id)
      .populate('sender',   'name profileImage')
      .populate('receiver', 'name profileImage');

    try {
      await pusher.trigger(`task-${taskId}`, 'new-message', populated.toObject());
    } catch (pusherErr) {
      console.error('Pusher trigger failed:', pusherErr.message);
    }

    res.json({ success: true, data: populated });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

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