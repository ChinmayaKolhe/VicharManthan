const express = require('express');
const router = express.Router();
const {
  getChats,
  createChat,
  getChatMessages,
  sendMessage
} = require('../controllers/chatController');
const { protect } = require('../middleware/auth');

router.route('/').get(protect, getChats).post(protect, createChat);
router.get('/:id/messages', protect, getChatMessages);
router.post('/:id/messages', protect, sendMessage);

module.exports = router;
