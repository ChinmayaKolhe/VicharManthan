const express = require('express');
const router = express.Router();
const {
  getIdeas,
  getIdea,
  createIdea,
  updateIdea,
  deleteIdea,
  upvoteIdea,
  addComment,
  getUserIdeas
} = require('../controllers/ideaController');
const { protect } = require('../middleware/auth');

router.route('/').get(getIdeas).post(protect, createIdea);
router.route('/:id').get(getIdea).put(protect, updateIdea).delete(protect, deleteIdea);
router.post('/:id/upvote', protect, upvoteIdea);
router.post('/:id/comments', protect, addComment);
router.get('/user/:userId', getUserIdeas);

module.exports = router;
