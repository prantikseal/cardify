import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Link, Navigate } from 'react-router-dom';
import './App.css';
import authService from './services/authService';
import HomePage from './components/HomePage';
import Register from './components/Auth/Register';
import Login from './components/Auth/Login';
import DashboardPage from './components/DashboardPage';
import CreateCardPage from './pages/CreateCardPage';
import PublicCardPage from './pages/PublicCardPage'; // Import the public card page

function App() {
  const [currentUserToken, setCurrentUserToken] = useState(authService.getCurrentUserToken());

  useEffect(() => {
    // Listen for changes in localStorage or custom events if needed
    // For now, this just runs once on mount
    const token = authService.getCurrentUserToken();
    if (token) {
      setCurrentUserToken(token);
    }
  }, []);

  const handleLogout = () => {
    authService.logout();
    setCurrentUserToken(null);
    // No need to navigate here, typically user clicks logout from a page they are on.
    // If logout button is on a protected page, that page should redirect.
  };
  
  // This function can be passed to Login component if needed to update App's state
  // However, Login component already navigates and localStorage is the source of truth here.
  const handleLoginSuccess = () => {
    setCurrentUserToken(authService.getCurrentUserToken());
  };

  return (
    <Router>
      <div className="App">
        <nav>
          <ul>
            <li><Link to="/">Home</Link></li>
            {currentUserToken ? (
              <>
                <li><Link to="/dashboard">Dashboard</Link></li>
                <li><Link to="/create-card">Create Card</Link></li>
                <li><button onClick={handleLogout}>Logout</button></li>
              </>
            ) : (
              <>
                <li><Link to="/register">Register</Link></li>
                <li><Link to="/login">Login</Link></li>
              </>
            )}
          </ul>
        </nav>

        <Routes>
          <Route path="/" element={<HomePage />} />
          <Route path="/register" element={<Register />} />
          {/* Pass handleLoginSuccess to Login component if it needs to trigger App state update */}
          <Route path="/login" element={<Login onLoginSuccess={handleLoginSuccess} />} />
          
          {/* Basic protected route example */}
          <Route 
            path="/dashboard" 
            element={currentUserToken ? <DashboardPage /> : <Navigate to="/login" replace />} 
          />
          <Route 
            path="/create-card" 
            element={currentUserToken ? <CreateCardPage /> : <Navigate to="/login" replace />} 
          />
          <Route path="/c/:card_slug" element={<PublicCardPage />} />
          
          {/* Add more routes as needed */}
        </Routes>
      </div>
    </Router>
  );
}

export default App;
