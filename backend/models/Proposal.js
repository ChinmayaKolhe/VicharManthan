const mongoose = require('mongoose');

const proposalSchema = new mongoose.Schema({
  idea: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Idea',
    required: true
  },
  applicant: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  message: {
    type: String,
    required: [true, 'Message is required'],
    maxlength: 2000
  },
  proposedRole: {
    type: String,
    required: [true, 'Proposed role is required'],
    trim: true
  },
  skills: [{
    type: String,
    trim: true
  }],
  resume: {
    type: String,  // base64 encoded PDF
    default: null
  },
  resumeFileName: {
    type: String,
    default: null
  },
  status: {
    type: String,
    enum: ['Pending', 'Accepted', 'Rejected'],
    default: 'Pending'
  },
  createdAt: {
    type: Date,
    default: Date.now
  },
  respondedAt: {
    type: Date
  }
});

module.exports = mongoose.model('Proposal', proposalSchema);
