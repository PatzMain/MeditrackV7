import React, { useState, useEffect } from 'react';
import { userService, authService, activityService } from '../../services/supabaseService';
import AddUserModal from '../Modals/AddUserModal';
import EditUserModal from '../Modals/EditUserModal';
import './AdminManagementPage.css';
import './PagesStyles.css';

interface SystemStats {
  totalUsers: number;
  roleCounts: { [key: string]: number };
  chartData: any[];
}

const AdminManagementPage: React.FC = () => {
  const [activeTab, setActiveTab] = useState('users');
  const [users, setUsers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [roleFilter, setRoleFilter] = useState('all');
  const [isAddUserModalOpen, setIsAddUserModalOpen] = useState(false);
  const [isEditUserModalOpen, setIsEditUserModalOpen] = useState(false);
  const [selectedUser, setSelectedUser] = useState<any | null>(null);
  const [systemStats, setSystemStats] = useState<SystemStats | null>(null);
  const [currentUser, setCurrentUser] = useState<any>(null);

  useEffect(() => {
    // Check if user is superadmin
    const user = authService.getCurrentUser();
    setCurrentUser(user);

    if (user?.role !== 'superadmin') {
      setError('Access denied. Only superadmin users can access this page.');
      return;
    }

    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      setLoading(true);
      const [usersData, stats] = await Promise.all([
        userService.getAllUsers(),
        userService.getUserStats()
      ]);
      setUsers(usersData);
      setSystemStats(stats);
      setError(null);
    } catch (error) {
      console.error('Error fetching data:', error);
      setError('Failed to load data');
    } finally {
      setLoading(false);
    }
  };

  const handleAddUser = async () => {
    await fetchData();
    setIsAddUserModalOpen(false);
  };

  const handleEditUser = async () => {
    await fetchData();
    setIsEditUserModalOpen(false);
    setSelectedUser(null);
  };

  const handleDeleteUser = async (userId: number, username: string) => {
    if (window.confirm(`Are you sure you want to delete user "${username}"?`)) {
      try {
        await userService.deleteUser(userId);
        await activityService.logActivity({
          action: 'delete',
          description: `Deleted user: ${username}`,
          category: 'user_management'
        });
        await fetchData();
      } catch (error) {
        console.error('Error deleting user:', error);
        setError('Failed to delete user');
      }
    }
  };

  const filteredUsers = users.filter(user => {
    const matchesSearch = (user.username || '').toLowerCase().includes(searchQuery.toLowerCase()) ||
                         (user.first_name || '').toLowerCase().includes(searchQuery.toLowerCase()) ||
                         (user.last_name || '').toLowerCase().includes(searchQuery.toLowerCase());
    const matchesRole = roleFilter === 'all' || user.role === roleFilter;
    return matchesSearch && matchesRole;
  });

  // Don't render anything if not superadmin
  if (currentUser && currentUser.role !== 'superadmin') {
    return (
      <div className="page-container">
        <div className="error-container">
          <div className="error-message">Access denied. Only superadmin users can access this page.</div>
        </div>
      </div>
    );
  }

  const renderUserManagement = () => (
    <div className="admin-section">
      <div className="page-controls">
        <div className="search-box">
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="11" cy="11" r="8"></circle><line x1="21" y1="21" x2="16.65" y2="16.65"></line></svg>
          <input
            type="text"
            placeholder="Search users..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
        <select
          className="filter-select"
          value={roleFilter}
          onChange={(e) => setRoleFilter(e.target.value)}
        >
          <option value="all">All Roles</option>
          <option value="user">User</option>
          <option value="admin">Admin</option>
          <option value="superadmin">Super Admin</option>
          <option value="doctor">Doctor</option>
          <option value="nurse">Nurse</option>
          <option value="dentist">Dentist</option>
          <option value="technician">Technician</option>
        </select>
        <button className="btn-primary" onClick={() => setIsAddUserModalOpen(true)}>
          Add User
        </button>
      </div>

      <div className="data-table">
        <table>
          <thead>
            <tr>
              <th>Username</th>
              <th>Name</th>
              <th>Role</th>
              <th>Department</th>
              <th>Status</th>
              <th>Created</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {filteredUsers.map((user) => (
              <tr key={user.id}>
                <td>{user.username}</td>
                <td>{user.first_name} {user.last_name}</td>
                <td>
                  <span className={`role-badge role-${user.role}`}>
                    {user.role}
                  </span>
                </td>
                <td>{user.department || 'N/A'}</td>
                <td>
                  <span className={`status-badge ${user.status || 'active'}`}>
                    {user.status || 'active'}
                  </span>
                </td>
                <td>{new Date(user.created_at).toLocaleDateString()}</td>
                <td>
                  <div className="table-actions">
                    <button
                      className="btn-icon"
                      title="Edit"
                      onClick={() => {
                        setSelectedUser(user);
                        setIsEditUserModalOpen(true);
                      }}
                    >
                      Edit
                    </button>
                    <button
                      className="btn-icon danger"
                      title="Delete"
                      onClick={() => handleDeleteUser(user.id, user.username)}
                      disabled={user.id === currentUser?.id}
                    >
                      Delete
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );

  const renderSystemSettings = () => (
    <div className="admin-section">
      <div className="settings-grid">
        <div className="settings-card">
          <h3>System Configuration</h3>
          <div className="setting-item">
            <label>Application Name</label>
            <input type="text" defaultValue="Meditrack" />
          </div>
          <div className="setting-item">
            <label>Default User Role</label>
            <select defaultValue="user">
              <option value="user">User</option>
              <option value="doctor">Doctor</option>
              <option value="nurse">Nurse</option>
            </select>
          </div>
          <div className="setting-item">
            <label>Session Timeout (minutes)</label>
            <input type="number" defaultValue={30} min={5} max={120} />
          </div>
          <button className="btn-primary">Save Settings</button>
        </div>

        <div className="settings-card">
          <h3>Security Settings</h3>
          <div className="setting-item">
            <label>
              <input type="checkbox" defaultChecked />
              Enable activity logging
            </label>
          </div>
          <div className="setting-item">
            <label>
              <input type="checkbox" defaultChecked />
              Require strong passwords
            </label>
          </div>
          <div className="setting-item">
            <label>
              <input type="checkbox" />
              Enable two-factor authentication
            </label>
          </div>
          <button className="btn-primary">Update Security</button>
        </div>

        <div className="settings-card">
          <h3>Database Maintenance</h3>
          <div className="maintenance-actions">
            <button className="btn-secondary">Backup Database</button>
            <button className="btn-secondary">Clean Activity Logs</button>
            <button className="btn-secondary">Optimize Tables</button>
            <button className="btn-danger">Reset System</button>
          </div>
        </div>
      </div>
    </div>
  );

  const renderAnalytics = () => (
    <div className="admin-section">
      <div className="analytics-grid">
        <div className="stat-card">
          <h3>Total Users</h3>
          <div className="stat-number">{systemStats?.totalUsers || 0}</div>
        </div>

        <div className="stat-card">
          <h3>Active Sessions</h3>
          <div className="stat-number">12</div>
        </div>

        <div className="stat-card">
          <h3>System Uptime</h3>
          <div className="stat-number">99.9%</div>
        </div>

        <div className="stat-card">
          <h3>Storage Used</h3>
          <div className="stat-number">2.4 GB</div>
        </div>
      </div>

      <div className="chart-section">
        <div className="chart-card">
          <h3>User Roles Distribution</h3>
          <div className="role-distribution">
            {systemStats?.chartData?.map((role, index) => (
              <div key={index} className="role-item">
                <span className="role-name">{role.name}</span>
                <div className="role-bar">
                  <div
                    className="role-progress"
                    style={{ width: `${(role.value / (systemStats?.totalUsers || 1)) * 100}%` }}
                  ></div>
                </div>
                <span className="role-count">{role.value}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );

  return (
    <div className="page-container">
      <div className="page-header">
        <h1 className="page-title">Admin Management</h1>
        <p className="page-subtitle">Comprehensive system administration and user management</p>
      </div>

      <div className="admin-tabs">
        <button
          className={`admin-tab ${activeTab === 'users' ? 'active' : ''}`}
          onClick={() => setActiveTab('users')}
        >
          User Management
        </button>
        <button
          className={`admin-tab ${activeTab === 'settings' ? 'active' : ''}`}
          onClick={() => setActiveTab('settings')}
        >
          System Settings
        </button>
        <button
          className={`admin-tab ${activeTab === 'analytics' ? 'active' : ''}`}
          onClick={() => setActiveTab('analytics')}
        >
          Analytics
        </button>
      </div>

      {loading ? (
        <div className="loading-message">Loading admin data...</div>
      ) : error ? (
        <div className="error-container">
          <div className="error-message">{error}</div>
          <button className="btn-secondary" onClick={fetchData}>Retry</button>
        </div>
      ) : (
        <>
          {activeTab === 'users' && renderUserManagement()}
          {activeTab === 'settings' && renderSystemSettings()}
          {activeTab === 'analytics' && renderAnalytics()}
        </>
      )}

      {isAddUserModalOpen && (
        <AddUserModal
          isOpen={isAddUserModalOpen}
          onClose={() => setIsAddUserModalOpen(false)}
          onSave={handleAddUser}
        />
      )}

      {isEditUserModalOpen && selectedUser && (
        <EditUserModal
          isOpen={isEditUserModalOpen}
          onClose={() => {
            setIsEditUserModalOpen(false);
            setSelectedUser(null);
          }}
          onSave={handleEditUser}
          user={selectedUser}
        />
      )}
    </div>
  );
};

export default AdminManagementPage;
