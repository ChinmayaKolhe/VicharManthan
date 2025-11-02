import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { User, Mail, MapPin, Globe, Github, Linkedin, Edit2, Save } from 'lucide-react';
import axios from 'axios';
import './Profile.css';

const Profile = () => {
  const { user, updateUser } = useAuth();
  const [editing, setEditing] = useState(false);
  const [formData, setFormData] = useState({
    name: user?.name || '',
    bio: user?.bio || '',
    skills: user?.skills?.join(', ') || '',
    location: user?.location || '',
    website: user?.website || '',
    github: user?.github || '',
    linkedin: user?.linkedin || ''
  });
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setMessage('');

    try {
      const skillsArray = formData.skills
        .split(',')
        .map(skill => skill.trim())
        .filter(skill => skill);

      const response = await axios.put('/api/users/profile', {
        ...formData,
        skills: skillsArray
      });

      updateUser(response.data);
      setEditing(false);
      setMessage('Profile updated successfully!');
    } catch (error) {
      setMessage('Failed to update profile');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="profile-page">
      <div className="container">
        <div className="profile-container">
          <div className="profile-header">
            <div className="profile-avatar-section">
              <img
                src={user?.avatar || 'https://via.placeholder.com/120'}
                alt={user?.name}
                className="profile-avatar"
              />
              <div className="profile-info">
                <h1>{user?.name}</h1>
                <p className="profile-email">
                  <Mail size={16} />
                  {user?.email}
                </p>
              </div>
            </div>
            <button
              onClick={() => setEditing(!editing)}
              className="btn btn-secondary"
            >
              {editing ? (
                <>
                  <Save size={18} />
                  Cancel
                </>
              ) : (
                <>
                  <Edit2 size={18} />
                  Edit Profile
                </>
              )}
            </button>
          </div>

          {message && (
            <div className={`message ${message.includes('success') ? 'success-message' : 'error-message'}`}>
              {message}
            </div>
          )}

          {editing ? (
            <form onSubmit={handleSubmit} className="profile-form">
              <div className="form-group">
                <label htmlFor="name">
                  <User size={18} />
                  Name
                </label>
                <input
                  type="text"
                  id="name"
                  name="name"
                  className="input"
                  value={formData.name}
                  onChange={handleChange}
                  required
                />
              </div>

              <div className="form-group">
                <label htmlFor="bio">Bio</label>
                <textarea
                  id="bio"
                  name="bio"
                  className="textarea"
                  value={formData.bio}
                  onChange={handleChange}
                  rows="4"
                  placeholder="Tell us about yourself..."
                />
              </div>

              <div className="form-group">
                <label htmlFor="skills">Skills (comma-separated)</label>
                <input
                  type="text"
                  id="skills"
                  name="skills"
                  className="input"
                  value={formData.skills}
                  onChange={handleChange}
                  placeholder="React, Node.js, UI/UX Design"
                />
              </div>

              <div className="form-group">
                <label htmlFor="location">
                  <MapPin size={18} />
                  Location
                </label>
                <input
                  type="text"
                  id="location"
                  name="location"
                  className="input"
                  value={formData.location}
                  onChange={handleChange}
                  placeholder="City, Country"
                />
              </div>

              <div className="form-group">
                <label htmlFor="website">
                  <Globe size={18} />
                  Website
                </label>
                <input
                  type="url"
                  id="website"
                  name="website"
                  className="input"
                  value={formData.website}
                  onChange={handleChange}
                  placeholder="https://yourwebsite.com"
                />
              </div>

              <div className="form-group">
                <label htmlFor="github">
                  <Github size={18} />
                  GitHub
                </label>
                <input
                  type="text"
                  id="github"
                  name="github"
                  className="input"
                  value={formData.github}
                  onChange={handleChange}
                  placeholder="github.com/username"
                />
              </div>

              <div className="form-group">
                <label htmlFor="linkedin">
                  <Linkedin size={18} />
                  LinkedIn
                </label>
                <input
                  type="text"
                  id="linkedin"
                  name="linkedin"
                  className="input"
                  value={formData.linkedin}
                  onChange={handleChange}
                  placeholder="linkedin.com/in/username"
                />
              </div>

              <button type="submit" className="btn btn-primary" disabled={loading}>
                {loading ? 'Saving...' : 'Save Changes'}
              </button>
            </form>
          ) : (
            <div className="profile-details">
              {user?.bio && (
                <div className="detail-section">
                  <h3>About</h3>
                  <p>{user.bio}</p>
                </div>
              )}

              {user?.skills && user.skills.length > 0 && (
                <div className="detail-section">
                  <h3>Skills</h3>
                  <div className="skills-list">
                    {user.skills.map((skill, index) => (
                      <span key={index} className="skill-badge">{skill}</span>
                    ))}
                  </div>
                </div>
              )}

              <div className="detail-section">
                <h3>Contact & Links</h3>
                <div className="links-list">
                  {user?.location && (
                    <div className="link-item">
                      <MapPin size={18} />
                      <span>{user.location}</span>
                    </div>
                  )}
                  {user?.website && (
                    <div className="link-item">
                      <Globe size={18} />
                      <a href={user.website} target="_blank" rel="noopener noreferrer">
                        {user.website}
                      </a>
                    </div>
                  )}
                  {user?.github && (
                    <div className="link-item">
                      <Github size={18} />
                      <a href={`https://${user.github}`} target="_blank" rel="noopener noreferrer">
                        {user.github}
                      </a>
                    </div>
                  )}
                  {user?.linkedin && (
                    <div className="link-item">
                      <Linkedin size={18} />
                      <a href={`https://${user.linkedin}`} target="_blank" rel="noopener noreferrer">
                        {user.linkedin}
                      </a>
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Profile;
