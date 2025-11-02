const express = require('express');
const router = express.Router();
const {
  getUserProfile,
  updateProfile,
  followUser,
  getUsers
} = require('../controllers/userController');
const { protect } = require('../middleware/auth');

router.get('/', getUsers);
router.get('/:id', getUserProfile);
router.put('/profile', protect, updateProfile);
router.post('/:id/follow', protect, followUser);

module.exports = router;
