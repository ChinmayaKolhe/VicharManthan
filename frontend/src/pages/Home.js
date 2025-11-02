import React from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Lightbulb, Users, MessageCircle, TrendingUp, ArrowRight } from 'lucide-react';
import './Home.css';

const Home = () => {
  const { isAuthenticated } = useAuth();

  return (
    <div className="home-page">
      <section className="hero-section">
        <div className="container">
          <div className="hero-content">
            <h1 className="hero-title">
              Share Your Startup Ideas,
              <br />
              Build Amazing Teams
            </h1>
            <p className="hero-description">
              VicharManthan is the ultimate platform for founders and innovators to share startup ideas,
              connect with talented collaborators, and bring their visions to life.
            </p>
            <div className="hero-actions">
              {isAuthenticated ? (
                <>
                  <Link to="/ideas" className="btn btn-primary btn-lg">
                    Explore Ideas
                    <ArrowRight size={20} />
                  </Link>
                  <Link to="/create-idea" className="btn btn-secondary btn-lg">
                    Share Your Idea
                  </Link>
                </>
              ) : (
                <>
                  <Link to="/register" className="btn btn-primary btn-lg">
                    Get Started
                    <ArrowRight size={20} />
                  </Link>
                  <Link to="/ideas" className="btn btn-secondary btn-lg">
                    Explore Ideas
                  </Link>
                </>
              )}
            </div>
          </div>
        </div>
      </section>

      <section className="features-section">
        <div className="container">
          <h2 className="section-title">Why Choose VicharManthan?</h2>
          <div className="features-grid">
            <div className="feature-card">
              <div className="feature-icon">
                <Lightbulb size={32} />
              </div>
              <h3>Share Ideas</h3>
              <p>
                Post your startup ideas with detailed descriptions, required skills, and team size.
                Get feedback from the community.
              </p>
            </div>

            <div className="feature-card">
              <div className="feature-icon">
                <Users size={32} />
              </div>
              <h3>Build Teams</h3>
              <p>
                Connect with talented individuals who share your passion. Review proposals and
                build your dream team.
              </p>
            </div>

            <div className="feature-card">
              <div className="feature-icon">
                <MessageCircle size={32} />
              </div>
              <h3>Real-time Chat</h3>
              <p>
                Communicate seamlessly with potential team members through our integrated
                real-time messaging system.
              </p>
            </div>

            <div className="feature-card">
              <div className="feature-icon">
                <TrendingUp size={32} />
              </div>
              <h3>Community Validation</h3>
              <p>
                Get your ideas validated through upvotes and comments. See what resonates
                with the community.
              </p>
            </div>
          </div>
        </div>
      </section>

      <section className="cta-section">
        <div className="container">
          <div className="cta-content">
            <h2>Ready to Turn Your Idea Into Reality?</h2>
            <p>Join thousands of founders and innovators building the future</p>
            {!isAuthenticated && (
              <Link to="/register" className="btn btn-primary btn-lg">
                Sign Up Now
                <ArrowRight size={20} />
              </Link>
            )}
          </div>
        </div>
      </section>
    </div>
  );
};

export default Home;
