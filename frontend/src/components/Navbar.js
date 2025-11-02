import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Bell, MessageCircle, User, LogOut, Menu, X, Lightbulb } from 'lucide-react';
import axios from 'axios';
import './Navbar.css';

const Navbar = () => {
  const { user, logout, isAuthenticated } = useAuth();
  const navigate = useNavigate();
  const [showMenu, setShowMenu] = useState(false);
  const [unreadCount, setUnreadCount] = useState(0);

  useEffect(() => {
    if (isAuthenticated) {
      fetchUnreadCount();
    }
  }, [isAuthenticated]);

  const fetchUnreadCount = async () => {
    try {
      const response = await axios.get('/api/notifications/unread-count');
      setUnreadCount(response.data.count);
    } catch (error) {
      console.error('Error fetching unread count:', error);
    }
  };

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <nav className="navbar">
      <div className="container navbar-content">
        <Link to="/" className="navbar-brand">
          <Lightbulb size={28} />
          <span>VicharManthan</span>
        </Link>

        <button className="mobile-menu-btn" onClick={() => setShowMenu(!showMenu)}>
          {showMenu ? <X size={24} /> : <Menu size={24} />}
        </button>

        <div className={`navbar-menu ${showMenu ? 'active' : ''}`}>
          {isAuthenticated ? (
            <>
              <Link to="/ideas" className="nav-link">
                Explore Ideas
              </Link>
              <Link to="/my-ideas" className="nav-link">
                My Ideas
              </Link>
              <Link to="/proposals" className="nav-link">
                Proposals
              </Link>
              <Link to="/chats" className="nav-link">
                <MessageCircle size={20} />
                <span>Chats</span>
              </Link>
              <Link to="/notifications" className="nav-link notification-link">
                <Bell size={20} />
                {unreadCount > 0 && <span className="notification-badge">{unreadCount}</span>}
              </Link>
              <div className="nav-divider"></div>
              <Link to="/profile" className="nav-link">
                <User size={20} />
                <span>{user?.name}</span>
              </Link>
              <button onClick={handleLogout} className="btn btn-secondary btn-sm">
                <LogOut size={16} />
                <span>Logout</span>
              </button>
            </>
          ) : (
            <>
              <Link to="/ideas" className="nav-link">
                Explore Ideas
              </Link>
              <Link to="/login" className="btn btn-secondary btn-sm">
                Login
              </Link>
              <Link to="/register" className="btn btn-primary btn-sm">
                Sign Up
              </Link>
            </>
          )}
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
