import React, { useState, useEffect, useRef } from 'react';
import { useAuth } from '../context/AuthContext';
import { useSocket } from '../context/SocketContext';
import { Send, MessageCircle, Search, User } from 'lucide-react';
import axios from 'axios';

const ChatsNew = () => {
  const { user } = useAuth();
  const { socket } = useSocket();
  const [chats, setChats] = useState([]);
  const [allUsers, setAllUsers] = useState([]);
  const [filteredUsers, setFilteredUsers] = useState([]);
  const [selectedChat, setSelectedChat] = useState(null);
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState('');
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [showUserList, setShowUserList] = useState(true);
  const messagesEndRef = useRef(null);

  useEffect(() => {
    fetchChats();
    fetchAllUsers();
  }, []);

  useEffect(() => {
    if (selectedChat) {
      fetchMessages(selectedChat._id);
      if (socket) {
        socket.emit('join_chat', selectedChat._id);
      }
      setShowUserList(false);
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

  useEffect(() => {
    if (searchQuery.trim()) {
      const filtered = allUsers.filter(u =>
        u.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        u.email.toLowerCase().includes(searchQuery.toLowerCase())
      );
      setFilteredUsers(filtered);
    } else {
      setFilteredUsers(allUsers);
    }
  }, [searchQuery, allUsers]);

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

  const fetchAllUsers = async () => {
    try {
      const response = await axios.get('/api/users');
      // Filter out current user
      const users = response.data.filter(u => u._id !== user?._id);
      setAllUsers(users);
      setFilteredUsers(users);
    } catch (error) {
      console.error('Error fetching users:', error);
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

  const startChatWithUser = async (selectedUser) => {
    try {
      const response = await axios.post('/api/chats', { userId: selectedUser._id });
      setSelectedChat(response.data);
      fetchChats();
    } catch (error) {
      console.error('Error creating chat:', error);
    }
  };

  const getOtherParticipant = (chat) => {
    return chat.participants?.find(p => p._id !== user?._id);
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
      </div>
    );
  }

  const customScrollbarStyle = {
    scrollbarWidth: 'thin',
    scrollbarColor: '#9333ea #f3f4f6',
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-600 via-purple-700 to-indigo-800 py-8">
      <style>{`
        .custom-scrollbar::-webkit-scrollbar {
          width: 8px;
        }
        .custom-scrollbar::-webkit-scrollbar-track {
          background: #f3f4f6;
          border-radius: 10px;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb {
          background: linear-gradient(180deg, #9333ea 0%, #7c3aed 100%);
          border-radius: 10px;
          transition: background 0.3s ease;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb:hover {
          background: linear-gradient(180deg, #7c3aed 0%, #6d28d9 100%);
        }
        .chat-item {
          transition: all 0.2s ease;
        }
        .chat-item:hover {
          transform: translateX(4px);
        }
      `}</style>
      <div className="max-w-7xl mx-auto px-4">
        <div className="bg-white rounded-2xl shadow-2xl overflow-hidden" style={{ height: 'calc(100vh - 120px)' }}>
          <div className="grid grid-cols-12 h-full">
            {/* Sidebar */}
            <div className="col-span-12 md:col-span-4 border-r border-gray-200 flex flex-col bg-gradient-to-b from-gray-50 to-white">
              <div className="p-6 border-b border-gray-200 bg-white">
                <h2 className="text-2xl font-bold bg-gradient-to-r from-purple-600 to-indigo-600 bg-clip-text text-transparent mb-4">Messages</h2>
                
                {/* Search Bar */}
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
                  <input
                    type="text"
                    placeholder="Search users..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="w-full pl-10 pr-4 py-3 border-2 border-gray-300 rounded-xl focus:outline-none focus:border-purple-500 focus:ring-2 focus:ring-purple-200 transition"
                  />
                </div>

                {/* Toggle between Recent Chats and All Users */}
                <div className="flex gap-2 mt-4">
                  <button
                    onClick={() => setShowUserList(false)}
                    className={`flex-1 py-2 px-4 rounded-lg font-semibold transition-all duration-200 ${
                      !showUserList
                        ? 'bg-gradient-to-r from-purple-600 to-indigo-600 text-white shadow-md'
                        : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                    }`}
                  >
                    Recent
                  </button>
                  <button
                    onClick={() => setShowUserList(true)}
                    className={`flex-1 py-2 px-4 rounded-lg font-semibold transition-all duration-200 ${
                      showUserList
                        ? 'bg-gradient-to-r from-purple-600 to-indigo-600 text-white shadow-md'
                        : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                    }`}
                  >
                    All Users
                  </button>
                </div>
              </div>

              {/* User/Chat List */}
              <div className="flex-1 overflow-y-auto custom-scrollbar" style={customScrollbarStyle}>
                {showUserList ? (
                  // All Users List
                  <div className="divide-y divide-gray-100">
                    {filteredUsers.length === 0 ? (
                      <div className="p-8 text-center">
                        <User size={48} className="mx-auto text-gray-400 mb-3" />
                        <p className="text-gray-600">No users found</p>
                      </div>
                    ) : (
                      filteredUsers.map((u) => (
                        <div
                          key={u._id}
                          onClick={() => startChatWithUser(u)}
                          className="chat-item flex items-center gap-3 p-4 hover:bg-purple-50 cursor-pointer transition-all duration-200"
                        >
                          <img
                            src={u.avatar || 'https://via.placeholder.com/50'}
                            alt={u.name}
                            className="w-12 h-12 rounded-full object-cover border-2 border-purple-200 shadow-sm"
                          />
                          <div className="flex-1 min-w-0">
                            <h4 className="font-semibold text-gray-900 truncate">{u.name}</h4>
                            <p className="text-sm text-gray-500 truncate">{u.email}</p>
                            {u.skills && u.skills.length > 0 && (
                              <div className="flex gap-1 mt-1">
                                {u.skills.slice(0, 2).map((skill, idx) => (
                                  <span
                                    key={idx}
                                    className="text-xs bg-purple-100 text-purple-700 px-2 py-0.5 rounded font-medium"
                                  >
                                    {skill}
                                  </span>
                                ))}
                              </div>
                            )}
                          </div>
                        </div>
                      ))
                    )}
                  </div>
                ) : (
                  // Recent Chats List
                  <div className="divide-y divide-gray-100">
                    {chats.length === 0 ? (
                      <div className="p-8 text-center">
                        <MessageCircle size={48} className="mx-auto text-gray-400 mb-3" />
                        <p className="text-gray-600">No conversations yet</p>
                        <p className="text-sm text-gray-500 mt-2">
                          Click "All Users" to start chatting
                        </p>
                      </div>
                    ) : (
                      chats.map((chat) => {
                        const otherUser = getOtherParticipant(chat);
                        return (
                          <div
                            key={chat._id}
                            onClick={() => setSelectedChat(chat)}
                            className={`chat-item flex items-center gap-3 p-4 cursor-pointer transition-all duration-200 ${
                              selectedChat?._id === chat._id
                                ? 'bg-gradient-to-r from-purple-100 to-indigo-50 border-l-4 border-purple-600 shadow-sm'
                                : 'hover:bg-gray-50'
                            }`}
                          >
                            <img
                              src={otherUser?.avatar || 'https://via.placeholder.com/50'}
                              alt={otherUser?.name}
                              className="w-12 h-12 rounded-full object-cover border-2 border-purple-200 shadow-sm"
                            />
                            <div className="flex-1 min-w-0">
                              <h4 className="font-semibold text-gray-900 truncate">
                                {otherUser?.name}
                              </h4>
                              <p className="text-sm text-gray-500 truncate">
                                {chat.lastMessage || 'No messages yet'}
                              </p>
                            </div>
                          </div>
                        );
                      })
                    )}
                  </div>
                )}
              </div>
            </div>

            {/* Chat Area */}
            <div className="col-span-12 md:col-span-8 flex flex-col">
              {selectedChat ? (
                <>
                  {/* Chat Header */}
                  <div className="p-6 border-b border-gray-200 bg-gradient-to-r from-purple-50 to-indigo-50">
                    <div className="flex items-center gap-3">
                      <img
                        src={
                          getOtherParticipant(selectedChat)?.avatar ||
                          'https://via.placeholder.com/40'
                        }
                        alt={getOtherParticipant(selectedChat)?.name}
                        className="w-12 h-12 rounded-full object-cover border-2 border-purple-300"
                      />
                      <div>
                        <h3 className="text-xl font-bold text-gray-900">
                          {getOtherParticipant(selectedChat)?.name}
                        </h3>
                        <p className="text-sm text-gray-600">
                          {getOtherParticipant(selectedChat)?.email}
                        </p>
                      </div>
                    </div>
                  </div>

                  {/* Messages */}
                  <div className="flex-1 overflow-y-auto custom-scrollbar p-6 bg-gradient-to-b from-gray-50 to-white" style={customScrollbarStyle}>
                    {messages.length === 0 ? (
                      <div className="flex items-center justify-center h-full">
                        <div className="text-center">
                          <MessageCircle size={64} className="mx-auto text-gray-300 mb-4" />
                          <p className="text-gray-500">No messages yet. Start the conversation!</p>
                        </div>
                      </div>
                    ) : (
                      <div className="space-y-4">
                        {messages.map((message, index) => (
                          <div
                            key={index}
                            className={`flex gap-3 ${
                              message.sender._id === user?._id ? 'flex-row-reverse' : ''
                            }`}
                          >
                            {message.sender._id !== user?._id && (
                              <img
                                src={message.sender.avatar || 'https://via.placeholder.com/32'}
                                alt={message.sender.name}
                                className="w-8 h-8 rounded-full object-cover flex-shrink-0"
                              />
                            )}
                            <div
                              className={`max-w-md px-4 py-3 rounded-2xl ${
                                message.sender._id === user?._id
                                  ? 'bg-gradient-to-r from-purple-600 to-indigo-600 text-white'
                                  : 'bg-white text-gray-900 shadow-sm'
                              }`}
                            >
                              <p className="leading-relaxed">{message.text}</p>
                              <span
                                className={`text-xs mt-1 block ${
                                  message.sender._id === user?._id
                                    ? 'text-purple-200'
                                    : 'text-gray-500'
                                }`}
                              >
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
                    )}
                  </div>

                  {/* Message Input */}
                  <form onSubmit={handleSendMessage} className="p-6 border-t border-gray-200 bg-white">
                    <div className="flex gap-3">
                      <input
                        type="text"
                        className="flex-1 px-4 py-3 border-2 border-gray-300 rounded-xl focus:outline-none focus:border-purple-500 transition"
                        placeholder="Type a message..."
                        value={newMessage}
                        onChange={(e) => setNewMessage(e.target.value)}
                      />
                      <button
                        type="submit"
                        className="bg-gradient-to-r from-purple-600 to-indigo-600 text-white px-6 py-3 rounded-xl hover:shadow-lg transition flex items-center gap-2 font-semibold"
                      >
                        <Send size={20} />
                        Send
                      </button>
                    </div>
                  </form>
                </>
              ) : (
                <div className="flex items-center justify-center h-full bg-gray-50">
                  <div className="text-center">
                    <MessageCircle size={80} className="mx-auto text-gray-300 mb-4" />
                    <h3 className="text-2xl font-bold text-gray-700 mb-2">
                      Select a conversation
                    </h3>
                    <p className="text-gray-500">
                      Choose from recent chats or start a new conversation with any user
                    </p>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ChatsNew;
