import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import {
  ArrowLeft, ThumbsUp, MessageCircle, Users, Calendar, Send, Edit, Trash2, UserPlus
} from 'lucide-react';
import axios from 'axios';
import './IdeaDetail.css';

const IdeaDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user, isAuthenticated } = useAuth();
  const [idea, setIdea] = useState(null);
  const [loading, setLoading] = useState(true);
  const [comment, setComment] = useState('');
  const [showProposalForm, setShowProposalForm] = useState(false);
  const [proposalData, setProposalData] = useState({
    message: '',
    proposedRole: '',
    skills: ''
  });

  useEffect(() => {
    fetchIdea();
  }, [id]);

  const fetchIdea = async () => {
    try {
      const response = await axios.get(`/api/ideas/${id}`);
      setIdea(response.data);
    } catch (error) {
      console.error('Error fetching idea:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleUpvote = async () => {
    if (!isAuthenticated) {
      alert('Please login to upvote');
      return;
    }

    try {
      await axios.post(`/api/ideas/${id}/upvote`);
      fetchIdea();
    } catch (error) {
      console.error('Error upvoting:', error);
    }
  };

  const handleComment = async (e) => {
    e.preventDefault();
    if (!comment.trim()) return;

    try {
      await axios.post(`/api/ideas/${id}/comments`, { text: comment });
      setComment('');
      fetchIdea();
    } catch (error) {
      console.error('Error adding comment:', error);
    }
  };

  const handleProposalSubmit = async (e) => {
    e.preventDefault();

    try {
      const skillsArray = proposalData.skills
        .split(',')
        .map(s => s.trim())
        .filter(s => s);

      await axios.post('/api/proposals', {
        ideaId: id,
        message: proposalData.message,
        proposedRole: proposalData.proposedRole,
        skills: skillsArray
      });

      alert('Proposal submitted successfully!');
      setShowProposalForm(false);
      setProposalData({ message: '', proposedRole: '', skills: '' });
    } catch (error) {
      alert(error.response?.data?.message || 'Failed to submit proposal');
    }
  };

  const handleDelete = async () => {
    if (window.confirm('Are you sure you want to delete this idea?')) {
      try {
        await axios.delete(`/api/ideas/${id}`);
        navigate('/ideas');
      } catch (error) {
        alert('Failed to delete idea');
      }
    }
  };

  if (loading) {
    return (
      <div className="loading">
        <div className="spinner"></div>
      </div>
    );
  }

  if (!idea) {
    return <div className="container">Idea not found</div>;
  }

  const isAuthor = user?._id === idea.author?._id;
  const hasUpvoted = idea.upvotes?.includes(user?._id);

  return (
    <div className="idea-detail-page">
      <div className="container">
        <button onClick={() => navigate(-1)} className="back-btn">
          <ArrowLeft size={20} />
          Back
        </button>

        <div className="idea-detail-content">
          <div className="idea-main">
            <div className="idea-header-section">
              <div className="idea-title-row">
                <h1>{idea.title}</h1>
                {isAuthor && (
                  <div className="idea-actions">
                    <Link to={`/ideas/${id}/proposals`} className="btn btn-primary btn-sm">
                      <Users size={16} />
                      Manage Proposals
                    </Link>
                    <Link to={`/ideas/${id}/edit`} className="btn btn-secondary btn-sm">
                      <Edit size={16} />
                      Edit
                    </Link>
                    <button onClick={handleDelete} className="btn btn-danger btn-sm">
                      <Trash2 size={16} />
                      Delete
                    </button>
                  </div>
                )}
              </div>

              <div className="idea-meta-row">
                <span className={`badge badge-${idea.category?.toLowerCase()}`}>
                  {idea.category}
                </span>
                <span className={`status-badge status-${idea.status?.toLowerCase().replace(' ', '-')}`}>
                  {idea.status}
                </span>
                <span className="stage-badge">{idea.stage}</span>
              </div>

              <div className="idea-stats">
                <button onClick={handleUpvote} className={`stat-btn ${hasUpvoted ? 'active' : ''}`}>
                  <ThumbsUp size={20} />
                  <span>{idea.upvoteCount || 0} Upvotes</span>
                </button>
                <div className="stat-item">
                  <MessageCircle size={20} />
                  <span>{idea.comments?.length || 0} Comments</span>
                </div>
                <div className="stat-item">
                  <Users size={20} />
                  <span>{idea.currentTeamSize || 1}/{idea.teamSize} Team Members</span>
                </div>
                <div className="stat-item">
                  <Calendar size={16} />
                  <span>{new Date(idea.createdAt).toLocaleDateString()}</span>
                </div>
              </div>
            </div>

            <div className="idea-description-section">
              <h2>About This Idea</h2>
              <p>{idea.description}</p>
            </div>

            <div className="idea-skills-section">
              <h3>Required Skills</h3>
              <div className="skills-list">
                {idea.requiredSkills?.map((skill, index) => (
                  <span key={index} className="skill-tag">{skill}</span>
                ))}
              </div>
            </div>

            {idea.tags && idea.tags.length > 0 && (
              <div className="idea-tags-section">
                <h3>Tags</h3>
                <div className="tags-list">
                  {idea.tags.map((tag, index) => (
                    <span key={index} className="tag">{tag}</span>
                  ))}
                </div>
              </div>
            )}

            <div className="comments-section">
              <h2>Comments ({idea.comments?.length || 0})</h2>

              {isAuthenticated && (
                <form onSubmit={handleComment} className="comment-form">
                  <textarea
                    className="textarea"
                    placeholder="Share your thoughts..."
                    value={comment}
                    onChange={(e) => setComment(e.target.value)}
                    rows="3"
                  />
                  <button type="submit" className="btn btn-primary">
                    <Send size={16} />
                    Post Comment
                  </button>
                </form>
              )}

              <div className="comments-list">
                {idea.comments?.map((comment, index) => (
                  <div key={index} className="comment-item">
                    <img
                      src={comment.user?.avatar || 'https://via.placeholder.com/40'}
                      alt={comment.user?.name}
                      className="comment-avatar"
                    />
                    <div className="comment-content">
                      <div className="comment-header">
                        <span className="comment-author">{comment.user?.name}</span>
                        <span className="comment-date">
                          {new Date(comment.createdAt).toLocaleDateString()}
                        </span>
                      </div>
                      <p>{comment.text}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          <div className="idea-sidebar">
            <div className="sidebar-card">
              <h3>Founder</h3>
              <div className="founder-info">
                <img
                  src={idea.author?.avatar || 'https://via.placeholder.com/60'}
                  alt={idea.author?.name}
                  className="founder-avatar"
                />
                <div>
                  <h4>{idea.author?.name}</h4>
                  <p>{idea.author?.bio}</p>
                  {idea.author?.skills && (
                    <div className="founder-skills">
                      {idea.author.skills.slice(0, 3).map((skill, i) => (
                        <span key={i} className="skill-badge">{skill}</span>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            </div>

            {!isAuthor && isAuthenticated && (
              <div className="sidebar-card">
                <button
                  onClick={() => setShowProposalForm(!showProposalForm)}
                  className="btn btn-primary btn-full"
                >
                  <UserPlus size={20} />
                  Submit Proposal
                </button>

                {showProposalForm && (
                  <form onSubmit={handleProposalSubmit} className="proposal-form">
                    <div className="form-group">
                      <label>Proposed Role</label>
                      <input
                        type="text"
                        className="input"
                        placeholder="e.g., Frontend Developer"
                        value={proposalData.proposedRole}
                        onChange={(e) =>
                          setProposalData({ ...proposalData, proposedRole: e.target.value })
                        }
                        required
                      />
                    </div>
                    <div className="form-group">
                      <label>Your Skills</label>
                      <input
                        type="text"
                        className="input"
                        placeholder="React, TypeScript, etc."
                        value={proposalData.skills}
                        onChange={(e) =>
                          setProposalData({ ...proposalData, skills: e.target.value })
                        }
                      />
                    </div>
                    <div className="form-group">
                      <label>Message</label>
                      <textarea
                        className="textarea"
                        placeholder="Why do you want to join this project?"
                        value={proposalData.message}
                        onChange={(e) =>
                          setProposalData({ ...proposalData, message: e.target.value })
                        }
                        rows="4"
                        required
                      />
                    </div>
                    <button type="submit" className="btn btn-primary btn-full">
                      Submit
                    </button>
                  </form>
                )}
              </div>
            )}

            {idea.teamMembers && idea.teamMembers.length > 0 && (
              <div className="sidebar-card">
                <h3>Team Members</h3>
                <div className="team-list">
                  {idea.teamMembers.map((member, index) => (
                    <div key={index} className="team-member">
                      <img
                        src={member.user?.avatar || 'https://via.placeholder.com/40'}
                        alt={member.user?.name}
                        className="team-avatar"
                      />
                      <div>
                        <h4>{member.user?.name}</h4>
                        <span className="team-role">{member.role}</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default IdeaDetail;
