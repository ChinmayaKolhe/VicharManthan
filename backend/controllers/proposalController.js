const Proposal = require('../models/Proposal');
const Idea = require('../models/Idea');
const Notification = require('../models/Notification');

// @desc    Create proposal
// @route   POST /api/proposals
// @access  Private
const createProposal = async (req, res) => {
  try {
    const { ideaId, message, proposedRole, skills } = req.body;

    const idea = await Idea.findById(ideaId);
    if (!idea) {
      return res.status(404).json({ message: 'Idea not found' });
    }

    // Check if user already submitted a proposal
    const existingProposal = await Proposal.findOne({
      idea: ideaId,
      applicant: req.user._id
    });

    if (existingProposal) {
      return res.status(400).json({ message: 'You have already submitted a proposal for this idea' });
    }

    const proposal = await Proposal.create({
      idea: ideaId,
      applicant: req.user._id,
      message,
      proposedRole,
      skills
    });

    // Create notification for idea author
    await Notification.create({
      recipient: idea.author,
      sender: req.user._id,
      type: 'proposal',
      idea: idea._id,
      proposal: proposal._id,
      message: `${req.user.name} submitted a proposal to join your idea "${idea.title}"`
    });

    const populatedProposal = await Proposal.findById(proposal._id)
      .populate('applicant', 'name email avatar skills')
      .populate('idea', 'title');

    res.status(201).json(populatedProposal);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Get proposals for an idea
// @route   GET /api/proposals/idea/:ideaId
// @access  Private
const getIdeaProposals = async (req, res) => {
  try {
    const idea = await Idea.findById(req.params.ideaId);
    
    if (!idea) {
      return res.status(404).json({ message: 'Idea not found' });
    }

    // Only idea author can see proposals
    if (idea.author.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: 'Not authorized' });
    }

    const proposals = await Proposal.find({ idea: req.params.ideaId })
      .populate('applicant', 'name email avatar skills bio')
      .sort({ createdAt: -1 });

    res.json(proposals);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Get user's proposals
// @route   GET /api/proposals/my-proposals
// @access  Private
const getMyProposals = async (req, res) => {
  try {
    const proposals = await Proposal.find({ applicant: req.user._id })
      .populate('idea', 'title description author')
      .populate({
        path: 'idea',
        populate: {
          path: 'author',
          select: 'name email avatar'
        }
      })
      .sort({ createdAt: -1 });

    res.json(proposals);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Update proposal status
// @route   PUT /api/proposals/:id
// @access  Private
const updateProposalStatus = async (req, res) => {
  try {
    const { status } = req.body;
    const proposal = await Proposal.findById(req.params.id)
      .populate('idea')
      .populate('applicant', 'name email avatar skills');

    if (!proposal) {
      return res.status(404).json({ message: 'Proposal not found' });
    }

    const idea = await Idea.findById(proposal.idea._id);

    // Only idea author can update proposal status
    if (idea.author.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: 'Not authorized' });
    }

    proposal.status = status;
    proposal.respondedAt = Date.now();
    await proposal.save();

    // If accepted, add to team
    if (status === 'Accepted') {
      idea.teamMembers.push({
        user: proposal.applicant._id,
        role: proposal.proposedRole
      });
      idea.currentTeamSize += 1;
      await idea.save();

      // Create notification
      await Notification.create({
        recipient: proposal.applicant._id,
        sender: req.user._id,
        type: 'proposal_accepted',
        idea: idea._id,
        proposal: proposal._id,
        message: `Your proposal for "${idea.title}" has been accepted!`
      });
    } else if (status === 'Rejected') {
      // Create notification
      await Notification.create({
        recipient: proposal.applicant._id,
        sender: req.user._id,
        type: 'proposal_rejected',
        idea: idea._id,
        proposal: proposal._id,
        message: `Your proposal for "${idea.title}" was not accepted this time.`
      });
    }

    res.json(proposal);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Delete proposal
// @route   DELETE /api/proposals/:id
// @access  Private
const deleteProposal = async (req, res) => {
  try {
    const proposal = await Proposal.findById(req.params.id);

    if (!proposal) {
      return res.status(404).json({ message: 'Proposal not found' });
    }

    // Only applicant can delete their proposal
    if (proposal.applicant.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: 'Not authorized' });
    }

    await Proposal.findByIdAndDelete(req.params.id);
    res.json({ message: 'Proposal removed' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

module.exports = {
  createProposal,
  getIdeaProposals,
  getMyProposals,
  updateProposalStatus,
  deleteProposal
};
