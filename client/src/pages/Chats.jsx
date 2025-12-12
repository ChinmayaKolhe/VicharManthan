import React, { useState, useEffect, useRef } from 'react';
import { useAuth } from '../context/AuthContext';
import { useSocket } from '../context/SocketContext';
import { Send, MessageCircle } from 'lucide-react';
import axios from 'axios';
import './Chats.css';

const Chats = () => {
  const { user } = useAuth();
  const { socket } = useSocket();
  const [chats, setChats] = useState([]);
  const [selectedChat, setSelectedChat] = useState(null);
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState('');
  const [loading, setLoading] = useState(true);
  const messagesEndRef = useRef(null);

  useEffect(() => {
    fetchChats();
  }, []);

  useEffect(() => {
    if (selectedChat) {
      fetchMessages(selectedChat._id);
      if (socket) {
        socket.emit('join_chat', selectedChat._id);
      }
    }
  }, [selectedChat, socket]);

  useEffect(() => {
    if (socket) {
      socket.on('new_message', (message) => {
        setMessages(prev => [...prev, message]);
        scrollToBottom();
      });

      return () => {
        socket.off('new_message');
      };
    }
  }, [socket]);

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const fetchChats = async () => {
    try {
      const response = await axios.get('/api/chats');
      setChats(response.data);
    } catch (error) {
      console.error('Error fetching chats:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchMessages = async (chatId) => {
    try {
      const response = await axios.get(`/api/chats/${chatId}/messages`);
      setMessages(response.data.messages || []);
    } catch (error) {
      console.error('Error fetching messages:', error);
    }
  };

  const handleSendMessage = async (e) => {
    e.preventDefault();
    if (!newMessage.trim() || !selectedChat) return;

    try {
      const response = await axios.post(`/api/chats/${selectedChat._id}/messages`, {
        text: newMessage
      });

      if (socket) {
        socket.emit('send_message', {
          chatId: selectedChat._id,
          message: response.data.messages[response.data.messages.length - 1]
        });
      }

      setNewMessage('');
      fetchChats();
    } catch (error) {
      console.error('Error sending message:', error);
    }
  };

  const getOtherParticipant = (chat) => {
    return chat.participants?.find(p => p._id !== user?._id);
  };

  if (loading) {
    return (
      <div className="loading">
        <div className="spinner"></div>
      </div>
    );
  }

  return (
    <div className="chats-page">
      <div className="container">
        <div className="chats-container">
          <div className="chats-sidebar">
            <h2>Messages</h2>
            {chats.length === 0 ? (
              <div className="no-chats">
                <MessageCircle size={48} />
                <p>No conversations yet</p>
              </div>
            ) : (
              <div className="chats-list">
                {chats.map((chat) => {
                  const otherUser = getOtherParticipant(chat);
                  return (
                    <div
                      key={chat._id}
                      className={`chat-item ${selectedChat?._id === chat._id ? 'active' : ''}`}
                      onClick={() => setSelectedChat(chat)}
                    >
                      <img
                        src={otherUser?.avatar || 'https://via.placeholder.com/50'}
                        alt={otherUser?.name}
                        className="chat-avatar"
                      />
                      <div className="chat-info">
                        <h4>{otherUser?.name}</h4>
                        <p>{chat.lastMessage || 'No messages yet'}</p>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>

          <div className="chat-main">
            {selectedChat ? (
              <>
                <div className="chat-header">
                  <img
                    src={getOtherParticipant(selectedChat)?.avatar || 'https://via.placeholder.com/40'}
                    alt={getOtherParticipant(selectedChat)?.name}
                    className="chat-header-avatar"
                  />
                  <h3>{getOtherParticipant(selectedChat)?.name}</h3>
                </div>

                <div className="messages-container">
                  {messages.map((message, index) => (
                    <div
                      key={index}
                      className={`message ${message.sender._id === user?._id ? 'sent' : 'received'}`}
                    >
                      {message.sender._id !== user?._id && (
                        <img
                          src={message.sender.avatar || 'https://via.placeholder.com/32'}
                          alt={message.sender.name}
                          className="message-avatar"
                        />
                      )}
                      <div className="message-content">
                        <p>{message.text}</p>
                        <span className="message-time">
                          {new Date(message.createdAt).toLocaleTimeString([], {
                            hour: '2-digit',
                            minute: '2-digit'
                          })}
                        </span>
                      </div>
                    </div>
                  ))}
                  <div ref={messagesEndRef} />
                </div>

                <form onSubmit={handleSendMessage} className="message-input-form">
                  <input
                    type="text"
                    className="message-input"
                    placeholder="Type a message..."
                    value={newMessage}
                    onChange={(e) => setNewMessage(e.target.value)}
                  />
                  <button type="submit" className="btn btn-primary">
                    <Send size={20} />
                  </button>
                </form>
              </>
            ) : (
              <div className="no-chat-selected">
                <MessageCircle size={64} />
                <h3>Select a conversation</h3>
                <p>Choose a chat from the sidebar to start messaging</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Chats;
