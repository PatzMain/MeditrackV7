import React, { useState, useEffect } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { userService, authService } from '../../services/supabaseService';
import './ProfilePage.css';
import './PagesStyles.css';

const ProfilePage: React.FC = () => {
  const { user } = useAuth();
  const [isEditing, setIsEditing] = useState(false);
  const [activeTab, setActiveTab] = useState('profile');

  const [profileData, setProfileData] = useState<any>({});
  const [recentActivities, setRecentActivities] = useState<any[]>([]);
  const [successMessage, setSuccessMessage] = useState('');
  const [errorMessage, setErrorMessage] = useState('');
  const [securityData, setSecurityData] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: '',
    twoFactorEnabled: false,
    loginAlerts: false
  });

  useEffect(() => {
    const fetchProfileData = async () => {
      if (user) {
        const profile = await userService.getProfile();
        setProfileData(profile);
        const activities = await userService.getActivity();
        setRecentActivities(activities);
      }
    };
    fetchProfileData();
  }, [user]);

  const handleProfileUpdate = async () => {
    try {
      await userService.updateProfile(profileData);
      setIsEditing(false);
      const profile = await userService.getProfile();
      setProfileData(profile);
      setSuccessMessage('Profile updated successfully!');
      setErrorMessage('');
    } catch (error) {
      console.error('Error updating profile:', error);
      setErrorMessage('Failed to update profile. Please try again.');
      setSuccessMessage('');
    }
  };

  const handlePasswordChange = async () => {
    if (securityData.newPassword !== securityData.confirmPassword) {
      setErrorMessage('Passwords do not match!');
      setSuccessMessage('');
      return;
    }
    if (securityData.newPassword.length < 6) {
      setErrorMessage('Password must be at least 6 characters long.');
      setSuccessMessage('');
      return;
    }
    try {
      await authService.changePassword({ currentPassword: securityData.currentPassword, newPassword: securityData.newPassword });
      setSuccessMessage('Password changed successfully!');
      setErrorMessage('');
      setSecurityData({
        ...securityData,
        currentPassword: '',
        newPassword: '',
        confirmPassword: ''
      });
    } catch (error) {
      console.error('Error changing password:', error);
      setErrorMessage('Failed to change password. Please try again.');
      setSuccessMessage('');
    }
  };

  const renderProfileTab = () => (
    <div className="profile-content">
      <div className="form-grid">
        <div className="form-group">
          <label>First Name</label>
          <input
            type="text"
            value={profileData.firstName}
            onChange={(e) => setProfileData({...profileData, firstName: e.target.value})}
            disabled={!isEditing}
          />
        </div>
        <div className="form-group">
          <label>Last Name</label>
          <input
            type="text"
            value={profileData.lastName}
            onChange={(e) => setProfileData({...profileData, lastName: e.target.value})}
            disabled={!isEditing}
          />
        </div>
        <div className="form-group">
          <label>Username</label>
          <input
            type="text"
            value={profileData.username}
            disabled
          />
        </div>
        <div className="form-group">
          <label>Phone</label>
          <input
            type="tel"
            value={profileData.phone}
            onChange={(e) => setProfileData({...profileData, phone: e.target.value})}
            disabled={!isEditing}
          />
        </div>
        <div className="form-group">
          <label>Department</label>
          <input
            type="text"
            value={profileData.department}
            onChange={(e) => setProfileData({...profileData, department: e.target.value})}
            disabled={!isEditing}
          />
        </div>
        <div className="form-group">
          <label>Position</label>
          <input
            type="text"
            value={profileData.position}
            onChange={(e) => setProfileData({...profileData, position: e.target.value})}
            disabled={!isEditing}
          />
        </div>
        <div className="form-group">
          <label>License Number</label>
          <input
            type="text"
            value={profileData.licenseNumber}
            onChange={(e) => setProfileData({...profileData, licenseNumber: e.target.value})}
            disabled={!isEditing}
          />
        </div>
        <div className="form-group full-width">
          <label>Specialization</label>
          <textarea
            value={profileData.specialization}
            onChange={(e) => setProfileData({...profileData, specialization: e.target.value})}
            disabled={!isEditing}
            rows={3}
          />
        </div>
      </div>

      {isEditing && (
        <div className="form-actions">
          <button className="btn-primary" onClick={handleProfileUpdate}>
            Save Changes
          </button>
          <button className="btn-secondary" onClick={() => setIsEditing(false)}>
            Cancel
          </button>
        </div>
      )}
    </div>
  );

  const renderSecurityTab = () => (
    <div className="profile-content">
      <h3>Change Password</h3>
      <div className="form-grid">
        <div className="form-group">
          <label>Current Password</label>
          <input
            type="password"
            value={securityData.currentPassword}
            onChange={(e) => setSecurityData({...securityData, currentPassword: e.target.value})}
            placeholder="Enter current password"
          />
        </div>
        <div className="form-group">
          <label>New Password</label>
          <input
            type="password"
            value={securityData.newPassword}
            onChange={(e) => setSecurityData({...securityData, newPassword: e.target.value})}
            placeholder="Enter new password"
          />
        </div>
        <div className="form-group">
          <label>Confirm New Password</label>
          <input
            type="password"
            value={securityData.confirmPassword}
            onChange={(e) => setSecurityData({...securityData, confirmPassword: e.target.value})}
            placeholder="Confirm new password"
          />
        </div>
      </div>
      <div className="form-actions">
        <button className="btn-primary" onClick={handlePasswordChange}>
          Update Password
        </button>
      </div>

      <h3>Security Settings</h3>
      <div className="settings-list">
        <div className="setting-item">
          <div className="setting-info">
            <div className="setting-title">Two-Factor Authentication</div>
            <div className="setting-description">Add an extra layer of security to your account</div>
          </div>
          <label className="toggle-switch">
            <input
              type="checkbox"
              checked={securityData.twoFactorEnabled}
              onChange={(e) => setSecurityData({...securityData, twoFactorEnabled: e.target.checked})}
            />
            <span className="toggle-slider"></span>
          </label>
        </div>
        <div className="setting-item">
          <div className="setting-info">
            <div className="setting-title">Login Alerts</div>
            <div className="setting-description">Get notified when someone logs into your account</div>
          </div>
          <label className="toggle-switch">
            <input
              type="checkbox"
              checked={securityData.loginAlerts}
              onChange={(e) => setSecurityData({...securityData, loginAlerts: e.target.checked})}
            />
            <span className="toggle-slider"></span>
          </label>
        </div>
      </div>
    </div>
  );

  const renderActivityTab = () => (
    <div className="profile-content">
      <h3>Recent Activity</h3>
      <div className="activity-list">
        {recentActivities.map((activity) => (
          <div key={activity.id} className="activity-item">
            <div className="activity-icon">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
                <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="2"/>
                <polyline points="12,6 12,12 16,14" stroke="currentColor" strokeWidth="2"/>
              </svg>
            </div>
            <div className="activity-content">
              <div className="activity-action">{activity.action}</div>
              <div className="activity-details">
                <span className="activity-time">{activity.timestamp}</span>
                <span className="activity-ip">IP: {activity.ip}</span>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );

  return (
    <div className="page-container">
      <div className="page-header">
        <h1 className="page-title">Profile</h1>
        <p className="page-subtitle">Manage your profile information and account settings</p>
      </div>

      {successMessage && <div className="success-message">{successMessage}</div>}
      {errorMessage && <div className="error-message">{errorMessage}</div>}

      <div className="profile-layout">
        <div className="profile-sidebar">
          <div className="profile-avatar-large">
            {user?.username?.charAt(0).toUpperCase() || 'U'}
          </div>
          <h2 className="profile-name">{profileData.firstName} {profileData.lastName}</h2>
          <p className="profile-role">{user?.role}</p>
          <button
            className="btn-primary"
            onClick={() => setIsEditing(!isEditing)}
          >
            {isEditing ? 'Cancel' : 'Edit Profile'}
          </button>
        </div>

        <div className="profile-main">
          <div className="profile-tabs">
            <button
              className={`profile-tab ${activeTab === 'profile' ? 'active' : ''}`}
              onClick={() => setActiveTab('profile')}
            >
              Personal Information
            </button>
            <button
              className={`profile-tab ${activeTab === 'security' ? 'active' : ''}`}
              onClick={() => setActiveTab('security')}
            >
              Security & Privacy
            </button>
            <button
              className={`profile-tab ${activeTab === 'activity' ? 'active' : ''}`}
              onClick={() => setActiveTab('activity')}
            >
              Activity Log
            </button>
          </div>

          {activeTab === 'profile' && renderProfileTab()}
          {activeTab === 'security' && renderSecurityTab()}
          {activeTab === 'activity' && renderActivityTab()}
        </div>
      </div>
    </div>
  );
};

export default ProfilePage;