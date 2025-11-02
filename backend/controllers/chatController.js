const Chat = require('../models/Chat');
const User = require('../models/User');

// @desc    Get user chats
// @route   GET /api/chats
// @access  Private
const getChats = async (req, res) => {
  try {
    const chats = await Chat.find({
      participants: req.user._id
    })
      .populate('participants', 'name avatar')
      .sort({ lastMessageAt: -1 });

    res.json(chats);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Get or create chat
// @route   POST /api/chats
// @access  Private
const createChat = async (req, res) => {
  try {
    const { userId } = req.body;

    if (!userId) {
      return res.status(400).json({ message: 'User ID is required' });
    }

    // Check if chat already exists
    let chat = await Chat.findOne({
      participants: { $all: [req.user._id, userId] }
    }).populate('participants', 'name avatar');

    if (chat) {
      return res.json(chat);
    }

    // Create new chat
    chat = await Chat.create({
      participants: [req.user._id, userId]
    });

    chat = await Chat.findById(chat._id).populate('participants', 'name avatar');
    res.status(201).json(chat);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Get chat messages
// @route   GET /api/chats/:id/messages
// @access  Private
const getChatMessages = async (req, res) => {
  try {
    const chat = await Chat.findById(req.params.id)
      .populate('participants', 'name avatar')
      .populate('messages.sender', 'name avatar');

    if (!chat) {
      return res.status(404).json({ message: 'Chat not found' });
    }

    // Check if user is participant
    if (!chat.participants.some(p => p._id.toString() === req.user._id.toString())) {
      return res.status(403).json({ message: 'Not authorized' });
    }

    res.json(chat);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Send message
// @route   POST /api/chats/:id/messages
// @access  Private
const sendMessage = async (req, res) => {
  try {
    const { text } = req.body;
    const chat = await Chat.findById(req.params.id);

    if (!chat) {
      return res.status(404).json({ message: 'Chat not found' });
    }

    // Check if user is participant
    if (!chat.participants.includes(req.user._id)) {
      return res.status(403).json({ message: 'Not authorized' });
    }

    const message = {
      sender: req.user._id,
      text
    };

    chat.messages.push(message);
    chat.lastMessage = text;
    chat.lastMessageAt = Date.now();
    await chat.save();

    const updatedChat = await Chat.findById(chat._id)
      .populate('participants', 'name avatar')
      .populate('messages.sender', 'name avatar');

    res.json(updatedChat);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

module.exports = {
  getChats,
  createChat,
  getChatMessages,
  sendMessage
};
