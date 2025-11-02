import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Lightbulb, ArrowLeft } from 'lucide-react';
import axios from 'axios';
import './CreateIdea.css';

const CreateIdea = () => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    category: 'Technology',
    requiredSkills: '',
    teamSize: 5,
    stage: 'Idea',
    tags: ''
  });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const categories = ['Technology', 'Healthcare', 'Finance', 'Education', 'E-commerce', 'Social', 'Entertainment', 'Other'];
  const stages = ['Idea', 'Planning', 'Development', 'MVP', 'Launched'];

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const skillsArray = formData.requiredSkills
        .split(',')
        .map(skill => skill.trim())
        .filter(skill => skill);

      const tagsArray = formData.tags
        .split(',')
        .map(tag => tag.trim())
        .filter(tag => tag);

      await axios.post('/api/ideas', {
        ...formData,
        requiredSkills: skillsArray,
        tags: tagsArray,
        teamSize: parseInt(formData.teamSize)
      });

      navigate('/ideas');
    } catch (error) {
      setError(error.response?.data?.message || 'Failed to create idea');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="create-idea-page">
      <div className="container">
        <button onClick={() => navigate(-1)} className="back-btn">
          <ArrowLeft size={20} />
          Back
        </button>

        <div className="create-idea-card">
          <div className="create-idea-header">
            <Lightbulb size={40} className="header-icon" />
            <h1>Share Your Startup Idea</h1>
            <p>Tell the community about your innovative idea and find collaborators</p>
          </div>

          {error && <div className="error-message">{error}</div>}

          <form onSubmit={handleSubmit} className="create-idea-form">
            <div className="form-group">
              <label htmlFor="title">Idea Title *</label>
              <input
                type="text"
                id="title"
                name="title"
                className="input"
                placeholder="e.g., AI-Powered Personal Finance Assistant"
                value={formData.title}
                onChange={handleChange}
                required
              />
            </div>

            <div className="form-row">
              <div className="form-group">
                <label htmlFor="category">Category *</label>
                <select
                  id="category"
                  name="category"
                  className="input"
                  value={formData.category}
                  onChange={handleChange}
                  required
                >
                  {categories.map(cat => (
                    <option key={cat} value={cat}>{cat}</option>
                  ))}
                </select>
              </div>

              <div className="form-group">
                <label htmlFor="stage">Current Stage *</label>
                <select
                  id="stage"
                  name="stage"
                  className="input"
                  value={formData.stage}
                  onChange={handleChange}
                  required
                >
                  {stages.map(stage => (
                    <option key={stage} value={stage}>{stage}</option>
                  ))}
                </select>
              </div>

              <div className="form-group">
                <label htmlFor="teamSize">Team Size Needed *</label>
                <input
                  type="number"
                  id="teamSize"
                  name="teamSize"
                  className="input"
                  min="1"
                  max="50"
                  value={formData.teamSize}
                  onChange={handleChange}
                  required
                />
              </div>
            </div>

            <div className="form-group">
              <label htmlFor="description">Description *</label>
              <textarea
                id="description"
                name="description"
                className="textarea"
                placeholder="Describe your idea in detail. What problem does it solve? Who is your target audience?"
                value={formData.description}
                onChange={handleChange}
                rows="6"
                required
              />
            </div>

            <div className="form-group">
              <label htmlFor="requiredSkills">Required Skills (comma-separated)</label>
              <input
                type="text"
                id="requiredSkills"
                name="requiredSkills"
                className="input"
                placeholder="e.g., React, Node.js, UI/UX Design, Marketing"
                value={formData.requiredSkills}
                onChange={handleChange}
              />
            </div>

            <div className="form-group">
              <label htmlFor="tags">Tags (comma-separated)</label>
              <input
                type="text"
                id="tags"
                name="tags"
                className="input"
                placeholder="e.g., AI, FinTech, Mobile App"
                value={formData.tags}
                onChange={handleChange}
              />
            </div>

            <div className="form-actions">
              <button
                type="button"
                onClick={() => navigate(-1)}
                className="btn btn-secondary"
              >
                Cancel
              </button>
              <button type="submit" className="btn btn-primary" disabled={loading}>
                {loading ? 'Publishing...' : 'Publish Idea'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default CreateIdea;
