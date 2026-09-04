import React from 'react';
import LoginFormComponent from '../../components/forms/LoginFormComponent';
import Navbar from '../../components/Navbar';
import './AuthPages.css';

const LoginPage = ({ isDarkTheme, toggleTheme }) => {
  return (
    <div className="auth-root">
      {/* Background Ambient Orbs */}
      <div className="auth-ambient-bg">
        <div className="auth-orb auth-orb-1" />
        <div className="auth-orb auth-orb-2" />
      </div>

      {/* Navbar */}
      <div style={{ position: 'fixed', top: 0, left: 0, right: 0, zIndex: 50 }}>
        <Navbar isDarkTheme={isDarkTheme} toggleTheme={toggleTheme} />
      </div>

      {/* Form Content */}
      <div style={{ position: 'relative', zIndex: 10, width: '100%', display: 'flex', justifyContent: 'center', padding: '100px 20px 40px' }}>
        <LoginFormComponent />
      </div>
    </div>
  );
};

export default LoginPage;