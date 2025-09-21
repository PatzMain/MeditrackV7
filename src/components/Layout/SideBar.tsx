import React, { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { User } from '../../services/supabaseService';
import './SideBar.css';

interface SideBarProps {
  collapsed: boolean;
  userRole: string;
  onToggleSidebar: () => void;
  user: User | null;
  onLogout: () => void;
}

interface MenuItem {
  id: string;
  label: string;
  icon: React.ReactNode;
  path: string;
  adminOnly?: boolean;
  superAdminOnly?: boolean;
}

const SideBar: React.FC<SideBarProps> = ({ collapsed, userRole, onToggleSidebar, user, onLogout }) => {
  const navigate = useNavigate();
  const location = useLocation();
  const [showProfileMenu, setShowProfileMenu] = useState(false);

  const menuItems: MenuItem[] = [
    {
      id: 'dashboard',
      label: 'Dashboard',
      path: '/dashboard',
      icon: (
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <rect x="3" y="3" width="7" height="7" rx="1"/>
          <rect x="14" y="3" width="7" height="7" rx="1"/>
          <rect x="14" y="14" width="7" height="7" rx="1"/>
          <rect x="3" y="14" width="7" height="7" rx="1"/>
        </svg>
      )
    },
    {
      id: 'patients',
      label: 'Patient Monitoring',
      path: '/patients',
      icon: (
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <path d="M17 21V19C17 17.9391 16.5786 16.9217 15.8284 16.1716C15.0783 15.4214 14.0609 15 13 15H5C3.93913 15 2.92172 15.4214 2.17157 16.1716C1.42143 16.9217 1 17.9391 1 19V21"/>
          <circle cx="9" cy="7" r="4"/>
          <path d="M23 21V19C23 18.1645 22.7155 17.3541 22.2094 16.7001C21.7033 16.046 20.9066 15.5902 20 15.4"/>
          <path d="M16 3.13C16.9066 3.28984 17.7033 3.74595 18.2094 4.39993C18.7155 5.05392 19 5.86447 19 6.7C19 7.53553 18.7155 8.34608 18.2094 9.00007C17.7033 9.65405 16.9066 10.1102 16 10.27"/>
        </svg>
      )
    },
    {
      id: 'inventory',
      label: 'Inventory Management',
      path: '/inventory',
      icon: (
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <path d="M21 8C21 9.1 20.1 10 19 10H5C3.9 10 3 9.1 3 8L3 7C3 5.9 3.9 5 5 5H19C20.1 5 21 5.9 21 7V8Z"/>
          <path d="M3 12V18C3 19.1 3.9 20 5 20H19C20.1 20 21 19.1 21 18V12"/>
          <path d="M8 15H16"/>
        </svg>
      )
    },
    {
      id: 'archives',
      label: 'Archives',
      path: '/archives',
      icon: (
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <rect x="3" y="3" width="18" height="18" rx="2" ry="2"/>
          <path d="M3 9H21"/>
          <path d="M9 21V9"/>
        </svg>
      )
    },
    {
      id: 'logs',
      label: 'Activity Logs',
      path: '/logs',
      icon: (
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <path d="M14 2H6C5.46957 2 4.96086 2.21071 4.58579 2.58579C4.21071 2.96086 4 3.46957 4 4V20C4 20.5304 4.21071 21.0391 4.58579 21.4142C4.96086 21.7893 5.46957 22 6 22H18C18.5304 22 19.0391 21.7893 19.4142 21.4142C19.7893 21.0391 20 20.5304 20 20V8L14 2Z"/>
          <path d="M14 2V8H20"/>
          <path d="M16 13H8"/>
          <path d="M16 17H8"/>
          <path d="M10 9H8"/>
        </svg>
      ),
      adminOnly: true
    },
    {
      id: 'admin-management',
      label: 'Admin Management',
      path: '/admin-management',
      icon: (
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <path d="M12 2L13.09 8.26L20 9L13.09 9.74L12 16L10.91 9.74L4 9L10.91 8.26L12 2Z"/>
          <path d="M8 21L9.5 16.5L14 18L9.5 19.5L8 21Z"/>
          <path d="M16 3L17.5 7.5L22 9L17.5 10.5L16 15L14.5 10.5L10 9L14.5 7.5L16 3Z"/>
        </svg>
      ),
      superAdminOnly: true
    }
  ];

  const filteredMenuItems = menuItems.filter(item => {
    if (item.superAdminOnly) {
      return userRole === 'superadmin';
    }
    if (item.adminOnly) {
      return userRole === 'admin' || userRole === 'superadmin';
    }
    return true;
  });

  const handleMenuClick = (path: string) => {
    navigate(path);
    setShowProfileMenu(false);
  };

  const handleProfileMenuToggle = () => {
    setShowProfileMenu(!showProfileMenu);
  };

  const handleLogout = () => {
    setShowProfileMenu(false);
    onLogout();
  };

  const handleProfileClick = () => {
    navigate('/profile');
    setShowProfileMenu(false);
  };

  return (
    <aside className={`sidebar ${collapsed ? 'collapsed' : ''}`}>
      {/* Header */}
      <div className="sidebar-header">
        <button
          className="sidebar-toggle"
          onClick={onToggleSidebar}
          aria-label={collapsed ? 'Expand sidebar' : 'Collapse sidebar'}
        >
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M3 12H21M3 6H21M3 18H21"/>
          </svg>
        </button>
        <div className="sidebar-brand">
          <div className="brand-icon">
            <svg width="28" height="28" viewBox="0 0 100 100" fill="none">
              <circle cx="50" cy="50" r="45" fill="currentColor"/>
              <path d="M35 30 L65 30 L65 35 L60 35 L60 65 L55 65 L55 45 L45 45 L45 65 L40 65 L40 35 L35 35 Z" fill="#ffffff"/>
              <circle cx="50" cy="25" r="8" fill="#ffffff"/>
            </svg>
          </div>
          {!collapsed && (
            <div className="brand-text">
              <span className="brand-name">MEDITRACK</span>
              <span className="brand-subtitle">Medical System</span>
            </div>
          )}
        </div>
      </div>

      {/* Navigation */}
      <nav className="sidebar-nav">
        <ul className="nav-list">
          {filteredMenuItems.map((item) => (
            <li key={item.id} className="nav-item">
              <button
                className={`nav-link ${location.pathname === item.path ? 'active' : ''}`}
                onClick={() => handleMenuClick(item.path)}
                title={collapsed ? item.label : undefined}
                aria-label={item.label}
              >
                <span className="nav-icon">
                  {item.icon}
                </span>
                {!collapsed && (
                  <span className="nav-label">{item.label}</span>
                )}
                {!collapsed && location.pathname === item.path && (
                  <span className="nav-indicator" aria-hidden="true"></span>
                )}
              </button>
            </li>
          ))}
        </ul>
      </nav>

      {/* User Profile */}
      <div className="sidebar-user">
        <div className="user-profile">
          <button
            className="profile-trigger"
            onClick={handleProfileMenuToggle}
            aria-expanded={showProfileMenu}
            aria-label="User menu"
          >
            <div className="user-avatar">
              {user?.username?.charAt(0).toUpperCase() || 'U'}
            </div>
            {!collapsed && (
              <>
                <div className="user-info">
                  <span className="user-name">{user?.username || 'User'}</span>
                  <span className="user-role">{user?.role || 'user'}</span>
                </div>
                <svg
                  className={`chevron ${showProfileMenu ? 'expanded' : ''}`}
                  width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"
                >
                  <path d="M6 9L12 15L18 9"/>
                </svg>
              </>
            )}
          </button>

          {/* Profile Dropdown */}
          {showProfileMenu && !collapsed && (
            <div className="profile-menu">
              <div className="menu-header">
                <div className="user-avatar large">
                  {user?.username?.charAt(0).toUpperCase() || 'U'}
                </div>
                <div className="user-details">
                  <span className="user-name">{user?.username || 'User'}</span>
                  <span className="user-role">{user?.role || 'user'}</span>
                </div>
              </div>

              <div className="menu-divider"></div>

              <div className="menu-items">
                <button className="menu-item" onClick={handleProfileClick}>
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M20 21V19C20 17.9391 19.5786 16.9217 18.8284 16.1716C18.0783 15.4214 17.0609 15 16 15H8C6.93913 15 5.92172 15.4214 5.17157 16.1716C4.42143 16.9217 4 17.9391 4 19V21"/>
                    <circle cx="12" cy="7" r="4"/>
                  </svg>
                  <span>Profile Settings</span>
                </button>

                <button className="menu-item">
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <circle cx="12" cy="12" r="3"/>
                    <path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1 0 2.83 2 2 0 0 1-2.83 0l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-2 2 2 2 0 0 1-2-2v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83 0 2 2 0 0 1 0-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1-2-2 2 2 0 0 1 2-2h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 0-2.83 2 2 0 0 1 2.83 0l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1 1.51V3a2 2 0 0 1 2-2 2 2 0 0 1 2 2v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 0 2 2 0 0 1 0 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 2 2 2 2 0 0 1-2 2h-.09a1.65 1.65 0 0 0-1.51 1z"/>
                  </svg>
                  <span>Settings</span>
                </button>
              </div>

              <div className="menu-divider"></div>

              <button className="menu-item logout" onClick={handleLogout}>
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M9 21H5C4.46957 21 3.96086 20.7893 3.58579 20.4142C3.21071 20.0391 3 19.5304 3 19V5C3 4.46957 3.21071 3.96086 3.58579 3.58579C3.96086 3.21071 4.46957 3 5 3H9"/>
                  <path d="M16 17L21 12L16 7"/>
                  <path d="M21 12H9"/>
                </svg>
                <span>Logout</span>
              </button>
            </div>
          )}
        </div>
      </div>
    </aside>
  );
};

export default SideBar;