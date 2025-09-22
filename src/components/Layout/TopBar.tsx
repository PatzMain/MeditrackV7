import React, { useState, useEffect } from 'react';
import UniversalSearch from '../Common/UniversalSearch';
import { useAuth } from '../../contexts/AuthContext';
import './TopBar.css';

const TopBar: React.FC = () => {
  const { user } = useAuth();
  const [currentDate, setCurrentDate] = useState(new Date());

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentDate(new Date());
    }, 60000); // Update every minute

    return () => clearInterval(timer);
  }, []);

  return (
    <header className="topbar">
      {/* Logo and Brand Name */}
      <div className="topbar-left">
        <div className="topbar-brand">
          <h1 className="brand-name">MEDITRACK</h1>
          <span className="brand-tagline">Medical Management System</span>
        </div>
      </div>

      {/* Universal Search */}
      <div className="topbar-center">
        <UniversalSearch
          placeholder="Search inventory, users, or actions..."
        />
      </div>

      {/* User Info and Actions */}
      <div className="topbar-right">
        <div className="topbar-date">
          <div className="date-display">
            <span className="date-text">{currentDate.toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' })}</span>
            <span className="time-text">{currentDate.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' })}</span>
          </div>
        </div>
        <div className="user-welcome">
          <span className="welcome-text">Welcome back,</span>
          <span className="user-name">{user?.first_name || user?.username || 'User'}</span>
        </div>
        <div className="user-role-badge">
          {user?.role?.charAt(0).toUpperCase()}{user?.role?.slice(1)}
        </div>
      </div>
    </header>
  );
};

export default TopBar;