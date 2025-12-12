const Idea = require('../models/Idea');
const Notification = require('../models/Notification');

// @desc    Get all ideas
// @route   GET /api/ideas
// @access  Public
const getIdeas = async (req, res) => {
  try {
    const { category, search, sort, userId } = req.query;
    let query = {};

    if (category && category !== 'All') {
      query.category = category;
    }

    if (userId) {
      query.author = userId;
    }

    if (search) {
      query.$or = [
        { title: { $regex: search, $options: 'i' } },
        { description: { $regex: search, $options: 'i' } },
        { tags: { $in: [new RegExp(search, 'i')] } }
      ];
    }

    let sortOption = { createdAt: -1 };
    if (sort === 'popular') {
      sortOption = { upvoteCount: -1 };
    } else if (sort === 'oldest') {
      sortOption = { createdAt: 1 };
    }

    const ideas = await Idea.find(query)
      .populate('author', 'name email avatar')
      .populate('comments.user', 'name avatar')
      .sort(sortOption);

    res.json(ideas);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Get single idea
// @route   GET /api/ideas/:id
// @access  Public
const getIdea = async (req, res) => {
  try {
    const idea = await Idea.findById(req.params.id)
      .populate('author', 'name email avatar bio skills')
      .populate('comments.user', 'name avatar')
      .populate('teamMembers.user', 'name email avatar skills');

    if (!idea) {
      return res.status(404).json({ message: 'Idea not found' });
    }

    res.json(idea);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Create new idea
// @route   POST /api/ideas
// @access  Private
const createIdea = async (req, res) => {
  try {
    const { title, description, category, requiredSkills, teamSize, stage, tags } = req.body;

    const idea = await Idea.create({
      title,
      description,
      category,
      requiredSkills,
      teamSize,
      stage,
      tags,
      author: req.user._id,
      teamMembers: [{
        user: req.user._id,
        role: 'Founder'
      }]
    });

    const populatedIdea = await Idea.findById(idea._id)
      .populate('author', 'name email avatar');

    res.status(201).json(populatedIdea);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Update idea
// @route   PUT /api/ideas/:id
// @access  Private
const updateIdea = async (req, res) => {
  try {
    const idea = await Idea.findById(req.params.id);

    if (!idea) {
      return res.status(404).json({ message: 'Idea not found' });
    }

    if (idea.author.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: 'Not authorized to update this idea' });
    }

    const updatedIdea = await Idea.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true, runValidators: true }
    ).populate('author', 'name email avatar');

    res.json(updatedIdea);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Delete idea
// @route   DELETE /api/ideas/:id
// @access  Private
const deleteIdea = async (req, res) => {
  try {
    const idea = await Idea.findById(req.params.id);

    if (!idea) {
      return res.status(404).json({ message: 'Idea not found' });
    }

    if (idea.author.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: 'Not authorized to delete this idea' });
    }

    await Idea.findByIdAndDelete(req.params.id);
    res.json({ message: 'Idea removed' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Upvote idea
// @route   POST /api/ideas/:id/upvote
// @access  Private
const upvoteIdea = async (req, res) => {
  try {
    const idea = await Idea.findById(req.params.id);

    if (!idea) {
      return res.status(404).json({ message: 'Idea not found' });
    }

    const alreadyUpvoted = idea.upvotes.includes(req.user._id);

    if (alreadyUpvoted) {
      // Remove upvote
      idea.upvotes = idea.upvotes.filter(
        userId => userId.toString() !== req.user._id.toString()
      );
      idea.upvoteCount = Math.max(0, idea.upvoteCount - 1);
    } else {
      // Add upvote
      idea.upvotes.push(req.user._id);
      idea.upvoteCount += 1;

      // Create notification
      if (idea.author.toString() !== req.user._id.toString()) {
        await Notification.create({
          recipient: idea.author,
          sender: req.user._id,
          type: 'upvote',
          idea: idea._id,
          message: `${req.user.name} upvoted your idea "${idea.title}"`
        });
      }
    }

    await idea.save();
    res.json(idea);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Add comment to idea
// @route   POST /api/ideas/:id/comments
// @access  Private
const addComment = async (req, res) => {
  try {
    const { text } = req.body;
    const idea = await Idea.findById(req.params.id);

    if (!idea) {
      return res.status(404).json({ message: 'Idea not found' });
    }

    const comment = {
      user: req.user._id,
      text
    };

    idea.comments.push(comment);
    await idea.save();

    // Create notification
    if (idea.author.toString() !== req.user._id.toString()) {
      await Notification.create({
        recipient: idea.author,
        sender: req.user._id,
        type: 'comment',
        idea: idea._id,
        message: `${req.user.name} commented on your idea "${idea.title}"`
      });
    }

    const updatedIdea = await Idea.findById(idea._id)
      .populate('author', 'name email avatar')
      .populate('comments.user', 'name avatar');

    res.json(updatedIdea);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Get user's ideas
// @route   GET /api/ideas/user/:userId
// @access  Public
const getUserIdeas = async (req, res) => {
  try {
    const ideas = await Idea.find({ author: req.params.userId })
      .populate('author', 'name email avatar')
      .sort({ createdAt: -1 });

    res.json(ideas);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

module.exports = {
  getIdeas,
  getIdea,
  createIdea,
  updateIdea,
  deleteIdea,
  upvoteIdea,
  addComment,
  getUserIdeas
};
