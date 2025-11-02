import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Plus, Search, TrendingUp, Clock, Filter } from 'lucide-react';
import axios from 'axios';
import IdeaCard from '../components/IdeaCard';
import './Ideas.css';

const Ideas = () => {
  const [ideas, setIdeas] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [category, setCategory] = useState('All');
  const [sort, setSort] = useState('latest');
  const { isAuthenticated } = useAuth();

  const categories = ['All', 'Technology', 'Healthcare', 'Finance', 'Education', 'E-commerce', 'Social', 'Entertainment', 'Other'];

  useEffect(() => {
    fetchIdeas();
  }, [category, sort]);

  const fetchIdeas = async () => {
    try {
      setLoading(true);
      const params = new URLSearchParams();
      if (category !== 'All') params.append('category', category);
      if (search) params.append('search', search);
      if (sort) params.append('sort', sort);

      const response = await axios.get(`/api/ideas?${params.toString()}`);
      setIdeas(response.data);
    } catch (error) {
      console.error('Error fetching ideas:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = (e) => {
    e.preventDefault();
    fetchIdeas();
  };

  return (
    <div className="ideas-page">
      <div className="container">
        <div className="ideas-header">
          <div className="ideas-title">
            <h1>Explore Startup Ideas</h1>
            <p>Discover innovative ideas and collaborate with talented founders</p>
          </div>
          {isAuthenticated && (
            <Link to="/create-idea" className="btn btn-primary">
              <Plus size={20} />
              Post Your Idea
            </Link>
          )}
        </div>

        <div className="ideas-filters">
          <form onSubmit={handleSearch} className="search-form">
            <Search size={20} className="search-icon" />
            <input
              type="text"
              placeholder="Search ideas..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="search-input"
            />
            <button type="submit" className="btn btn-primary">
              Search
            </button>
          </form>

          <div className="filter-group">
            <Filter size={18} />
            <select
              value={category}
              onChange={(e) => setCategory(e.target.value)}
              className="filter-select"
            >
              {categories.map(cat => (
                <option key={cat} value={cat}>{cat}</option>
              ))}
            </select>

            <select
              value={sort}
              onChange={(e) => setSort(e.target.value)}
              className="filter-select"
            >
              <option value="latest">
                <Clock size={16} /> Latest
              </option>
              <option value="popular">
                <TrendingUp size={16} /> Most Popular
              </option>
              <option value="oldest">Oldest</option>
            </select>
          </div>
        </div>

        {loading ? (
          <div className="loading">
            <div className="spinner"></div>
          </div>
        ) : ideas.length === 0 ? (
          <div className="no-ideas">
            <p>No ideas found. Be the first to share one!</p>
            {isAuthenticated && (
              <Link to="/create-idea" className="btn btn-primary">
                Post Your Idea
              </Link>
            )}
          </div>
        ) : (
          <div className="ideas-grid">
            {ideas.map(idea => (
              <IdeaCard key={idea._id} idea={idea} onUpdate={fetchIdeas} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default Ideas;
