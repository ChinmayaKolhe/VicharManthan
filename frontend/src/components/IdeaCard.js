import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { ThumbsUp, MessageCircle, Users, Calendar, ArrowRight } from 'lucide-react';
import axios from 'axios';
import './IdeaCard.css';

const IdeaCard = ({ idea, onUpdate }) => {
  const { user, isAuthenticated } = useAuth();
  const [upvoted, setUpvoted] = useState(
    isAuthenticated && idea.upvotes?.includes(user?._id)
  );
  const [upvoteCount, setUpvoteCount] = useState(idea.upvoteCount || 0);

  const handleUpvote = async (e) => {
    e.preventDefault();
    if (!isAuthenticated) {
      alert('Please login to upvote');
      return;
    }

    try {
      await axios.post(`/api/ideas/${idea._id}/upvote`);
      setUpvoted(!upvoted);
      setUpvoteCount(prev => upvoted ? prev - 1 : prev + 1);
      if (onUpdate) onUpdate();
    } catch (error) {
      console.error('Error upvoting idea:', error);
    }
  };

  const formatDate = (date) => {
    return new Date(date).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric'
    });
  };

  return (
    <div className="idea-card">
      <div className="idea-card-header">
        <div className="idea-author">
          <img
            src={idea.author?.avatar || 'https://via.placeholder.com/40'}
            alt={idea.author?.name}
            className="author-avatar"
          />
          <div>
            <h4>{idea.author?.name}</h4>
            <span className="idea-date">
              <Calendar size={14} />
              {formatDate(idea.createdAt)}
            </span>
          </div>
        </div>
        <span className={`badge badge-${idea.category?.toLowerCase()}`}>
          {idea.category}
        </span>
      </div>

      <Link to={`/ideas/${idea._id}`} className="idea-content">
        <h3>{idea.title}</h3>
        <p className="idea-description">
          {idea.description?.length > 150
            ? `${idea.description.substring(0, 150)}...`
            : idea.description}
        </p>

        <div className="idea-tags">
          {idea.requiredSkills?.slice(0, 3).map((skill, index) => (
            <span key={index} className="tag">
              {skill}
            </span>
          ))}
          {idea.requiredSkills?.length > 3 && (
            <span className="tag">+{idea.requiredSkills.length - 3} more</span>
          )}
        </div>

        <div className="idea-meta">
          <div className="meta-item">
            <Users size={16} />
            <span>{idea.currentTeamSize || 1}/{idea.teamSize}</span>
          </div>
          <div className="meta-item">
            <MessageCircle size={16} />
            <span>{idea.comments?.length || 0}</span>
          </div>
          <span className={`status-badge status-${idea.status?.toLowerCase().replace(' ', '-')}`}>
            {idea.status}
          </span>
        </div>
      </Link>

      <div className="idea-card-footer">
        <button
          onClick={handleUpvote}
          className={`upvote-btn ${upvoted ? 'upvoted' : ''}`}
        >
          <ThumbsUp size={18} />
          <span>{upvoteCount}</span>
        </button>
        <Link to={`/ideas/${idea._id}`} className="view-btn">
          View Details
          <ArrowRight size={16} />
        </Link>
      </div>
    </div>
  );
};

export default IdeaCard;
