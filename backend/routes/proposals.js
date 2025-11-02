const express = require('express');
const router = express.Router();
const {
  createProposal,
  getIdeaProposals,
  getMyProposals,
  updateProposalStatus,
  deleteProposal
} = require('../controllers/proposalController');
const { protect } = require('../middleware/auth');

router.post('/', protect, createProposal);
router.get('/idea/:ideaId', protect, getIdeaProposals);
router.get('/my-proposals', protect, getMyProposals);
router.put('/:id', protect, updateProposalStatus);
router.delete('/:id', protect, deleteProposal);

module.exports = router;
