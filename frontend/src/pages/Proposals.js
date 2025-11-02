import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { FileText, Clock, CheckCircle, XCircle } from 'lucide-react';
import axios from 'axios';
import './Proposals.css';

const Proposals = () => {
  const [proposals, setProposals] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchProposals();
  }, []);

  const fetchProposals = async () => {
    try {
      const response = await axios.get('/api/proposals/my-proposals');
      setProposals(response.data);
    } catch (error) {
      console.error('Error fetching proposals:', error);
    } finally {
      setLoading(false);
    }
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case 'Accepted':
        return <CheckCircle size={20} className="status-icon accepted" />;
      case 'Rejected':
        return <XCircle size={20} className="status-icon rejected" />;
      default:
        return <Clock size={20} className="status-icon pending" />;
    }
  };

  const getStatusClass = (status) => {
    return `status-${status.toLowerCase()}`;
  };

  if (loading) {
    return (
      <div className="loading">
        <div className="spinner"></div>
      </div>
    );
  }

  return (
    <div className="proposals-page">
      <div className="container">
        <div className="proposals-header">
          <div>
            <h1>My Proposals</h1>
            <p>Track your applications to join startup ideas</p>
          </div>
        </div>

        {proposals.length === 0 ? (
          <div className="no-proposals">
            <FileText size={48} />
            <h3>No proposals yet</h3>
            <p>Start exploring ideas and submit proposals to join exciting projects!</p>
            <Link to="/ideas" className="btn btn-primary">
              Explore Ideas
            </Link>
          </div>
        ) : (
          <div className="proposals-list">
            {proposals.map((proposal) => (
              <div key={proposal._id} className="proposal-card">
                <div className="proposal-header">
                  <div className="proposal-idea">
                    <h3>
                      <Link to={`/ideas/${proposal.idea._id}`}>
                        {proposal.idea.title}
                      </Link>
                    </h3>
                    <p className="proposal-role">Applied as: {proposal.proposedRole}</p>
                  </div>
                  <div className={`proposal-status ${getStatusClass(proposal.status)}`}>
                    {getStatusIcon(proposal.status)}
                    <span>{proposal.status}</span>
                  </div>
                </div>

                <div className="proposal-body">
                  <p className="proposal-message">{proposal.message}</p>
                  
                  {proposal.skills && proposal.skills.length > 0 && (
                    <div className="proposal-skills">
                      <strong>Skills:</strong>
                      <div className="skills-tags">
                        {proposal.skills.map((skill, index) => (
                          <span key={index} className="skill-tag">{skill}</span>
                        ))}
                      </div>
                    </div>
                  )}
                </div>

                <div className="proposal-footer">
                  <span className="proposal-date">
                    Submitted: {new Date(proposal.createdAt).toLocaleDateString()}
                  </span>
                  {proposal.respondedAt && (
                    <span className="proposal-date">
                      Responded: {new Date(proposal.respondedAt).toLocaleDateString()}
                    </span>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default Proposals;
