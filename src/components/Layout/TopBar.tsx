import React from 'react';
import './TopBar.css';

const TopBar: React.FC = () => {
  return (
    <header className="topbar">
      <div className="search-container">
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" className="search-icon">
          <circle cx="11" cy="11" r="8" stroke="currentColor" strokeWidth="2"/>
          <path d="m21 21-4.35-4.35" stroke="currentColor" strokeWidth="2"/>
        </svg>
        <input
          type="text"
          placeholder="Universal Search - Search anything in the system..."
          className="search-input"
        />
      </div>
    </header>
  );
};

export default TopBar;