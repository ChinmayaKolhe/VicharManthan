import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Bell, Check, Trash2 } from 'lucide-react';
import axios from 'axios';
import './Notifications.css';

const Notifications = () => {
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchNotifications();
  }, []);

  const fetchNotifications = async () => {
    try {
      const response = await axios.get('/api/notifications');
      setNotifications(response.data);
    } catch (error) {
      console.error('Error fetching notifications:', error);
    } finally {
      setLoading(false);
    }
  };

  const markAsRead = async (id) => {
    try {
      await axios.put(`/api/notifications/${id}/read`);
      setNotifications(notifications.map(n =>
        n._id === id ? { ...n, read: true } : n
      ));
    } catch (error) {
      console.error('Error marking as read:', error);
    }
  };

  const markAllAsRead = async () => {
    try {
      await axios.put('/api/notifications/read-all');
      setNotifications(notifications.map(n => ({ ...n, read: true })));
    } catch (error) {
      console.error('Error marking all as read:', error);
    }
  };

  const deleteNotification = async (id) => {
    try {
      await axios.delete(`/api/notifications/${id}`);
      setNotifications(notifications.filter(n => n._id !== id));
    } catch (error) {
      console.error('Error deleting notification:', error);
    }
  };

  const getNotificationIcon = (type) => {
    return <Bell size={20} />;
  };

  if (loading) {
    return (
      <div className="loading">
        <div className="spinner"></div>
      </div>
    );
  }

  return (
    <div className="notifications-page">
      <div className="container">
        <div className="notifications-header">
          <div>
            <h1>Notifications</h1>
            <p>Stay updated with your activity</p>
          </div>
          {notifications.some(n => !n.read) && (
            <button onClick={markAllAsRead} className="btn btn-secondary">
              <Check size={18} />
              Mark all as read
            </button>
          )}
        </div>

        {notifications.length === 0 ? (
          <div className="no-notifications">
            <Bell size={64} />
            <h3>No notifications yet</h3>
            <p>You'll see notifications here when there's activity on your ideas</p>
          </div>
        ) : (
          <div className="notifications-list">
            {notifications.map((notification) => (
              <div
                key={notification._id}
                className={`notification-item ${!notification.read ? 'unread' : ''}`}
              >
                <div className="notification-icon">
                  {getNotificationIcon(notification.type)}
                </div>
                <div className="notification-content">
                  <p>{notification.message}</p>
                  <div className="notification-meta">
                    <span className="notification-time">
                      {new Date(notification.createdAt).toLocaleDateString()} at{' '}
                      {new Date(notification.createdAt).toLocaleTimeString([], {
                        hour: '2-digit',
                        minute: '2-digit'
                      })}
                    </span>
                    {notification.idea && (
                      <Link
                        to={`/ideas/${notification.idea._id}`}
                        className="notification-link"
                      >
                        View Idea
                      </Link>
                    )}
                  </div>
                </div>
                <div className="notification-actions">
                  {!notification.read && (
                    <button
                      onClick={() => markAsRead(notification._id)}
                      className="action-btn"
                      title="Mark as read"
                    >
                      <Check size={18} />
                    </button>
                  )}
                  <button
                    onClick={() => deleteNotification(notification._id)}
                    className="action-btn delete"
                    title="Delete"
                  >
                    <Trash2 size={18} />
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default Notifications;
