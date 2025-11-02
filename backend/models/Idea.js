const mongoose = require('mongoose');

const ideaSchema = new mongoose.Schema({
  title: {
    type: String,
    required: [true, 'Title is required'],
    trim: true,
    maxlength: 200
  },
  description: {
    type: String,
    required: [true, 'Description is required'],
    maxlength: 5000
  },
  category: {
    type: String,
    required: [true, 'Category is required'],
    enum: ['Technology', 'Healthcare', 'Finance', 'Education', 'E-commerce', 'Social', 'Entertainment', 'Other']
  },
  requiredSkills: [{
    type: String,
    trim: true
  }],
  teamSize: {
    type: Number,
    required: [true, 'Team size is required'],
    min: 1,
    max: 50
  },
  currentTeamSize: {
    type: Number,
    default: 1
  },
  stage: {
    type: String,
    enum: ['Idea', 'Planning', 'Development', 'MVP', 'Launched'],
    default: 'Idea'
  },
  tags: [{
    type: String,
    trim: true
  }],
  author: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  teamMembers: [{
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    },
    role: {
      type: String,
      trim: true
    },
    joinedAt: {
      type: Date,
      default: Date.now
    }
  }],
  upvotes: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  }],
  upvoteCount: {
    type: Number,
    default: 0
  },
  comments: [{
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true
    },
    text: {
      type: String,
      required: true,
      maxlength: 1000
    },
    createdAt: {
      type: Date,
      default: Date.now
    }
  }],
  status: {
    type: String,
    enum: ['Open', 'In Progress', 'Completed', 'Closed'],
    default: 'Open'
  },
  createdAt: {
    type: Date,
    default: Date.now
  },
  updatedAt: {
    type: Date,
    default: Date.now
  }
});

// Update updatedAt on save
ideaSchema.pre('save', function(next) {
  this.updatedAt = Date.now();
  next();
});

module.exports = mongoose.model('Idea', ideaSchema);
