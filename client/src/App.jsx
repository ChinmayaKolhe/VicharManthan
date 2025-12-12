import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import { SocketProvider } from './context/SocketContext';
import Navbar from './components/Navbar';
import Login from './pages/Login';
import Register from './pages/Register';
import Ideas from './pages/Ideas';
import IdeaDetail from './pages/IdeaDetail';
import CreateIdea from './pages/CreateIdea';
import Profile from './pages/Profile';
import Proposals from './pages/Proposals';
import Chats from './pages/ChatsNew';
import Notifications from './pages/Notifications';
import Home from './pages/Home';
import ManageProposals from './pages/ManageProposals';

const PrivateRoute = ({ children }) => {
  const { isAuthenticated, loading } = useAuth();

  if (loading) {
    return (
      <div className="loading">
        <div className="spinner"></div>
      </div>
    );
  }

  return isAuthenticated ? children : <Navigate to="/login" />;
};

function App() {
  return (
    <Router>
      <AuthProvider>
        <SocketProvider>
          <div className="App">
            <Navbar />
            <Routes>
              <Route path="/" element={<Home />} />
              <Route path="/login" element={<Login />} />
              <Route path="/register" element={<Register />} />
              <Route path="/ideas" element={<Ideas />} />
              <Route path="/ideas/:id" element={<IdeaDetail />} />

              <Route
                path="/ideas/:ideaId/proposals"
                element={
                  <PrivateRoute>
                    <ManageProposals />
                  </PrivateRoute>
                }
              />

              <Route
                path="/create-idea"
                element={
                  <PrivateRoute>
                    <CreateIdea />
                  </PrivateRoute>
                }
              />

              <Route
                path="/my-ideas"
                element={
                  <PrivateRoute>
                    <Ideas />
                  </PrivateRoute>
                }
              />

              <Route
                path="/profile"
                element={
                  <PrivateRoute>
                    <Profile />
                  </PrivateRoute>
                }
              />

              <Route
                path="/proposals"
                element={
                  <PrivateRoute>
                    <Proposals />
                  </PrivateRoute>
                }
              />

              <Route
                path="/chats"
                element={
                  <PrivateRoute>
                    <Chats />
                  </PrivateRoute>
                }
              />

              <Route
                path="/notifications"
                element={
                  <PrivateRoute>
                    <Notifications />
                  </PrivateRoute>
                }
              />
            </Routes>
          </div>
        </SocketProvider>
      </AuthProvider>
    </Router>
  );
}

export default App;
