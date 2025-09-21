import React, { useState } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import TopBar from './TopBar';
import SideBar from './SideBar';
import './DashboardLayout.css';

interface DashboardLayoutProps {
  children: React.ReactNode;
}

const DashboardLayout: React.FC<DashboardLayoutProps> = ({ children }) => {
  const { user, logout } = useAuth();
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);

  const toggleSidebar = () => {
    setSidebarCollapsed(!sidebarCollapsed);
  };

  return (
    <div className={`dashboard-layout ${sidebarCollapsed ? 'sidebar-collapsed' : ''}`}>
      <SideBar
        collapsed={sidebarCollapsed}
        userRole={user?.role || 'user'}
        onToggleSidebar={toggleSidebar}
        user={user}
        onLogout={logout}
      />
      <div className="main-content">
        <TopBar />
        <div className="content-wrapper">{children}</div>
      </div>
    </div>
  );
};

export default DashboardLayout;
