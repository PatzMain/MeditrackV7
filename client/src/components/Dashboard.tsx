import React, { useEffect, useState } from 'react';
import { useAuth } from '../contexts/AuthContext.tsx';
import { userService } from '../services/api.ts';
import './Dashboard.css';

interface Activity {
  id: number;
  action: string;
  timestamp: string;
  ip_address: string;
  users: {
    username: string;
    role: string;
  };
}

const Dashboard: React.FC = () => {
  const { user, logout } = useAuth();
  const [activities, setActivities] = useState<Activity[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    const fetchActivities = async () => {
      if (user && (user.role === 'admin' || user.role === 'superadmin')) {
        setIsLoading(true);
        try {
          const data = await userService.getActivity();
          setActivities(data);
        } catch (error) {
          console.error('Failed to fetch activities:', error);
        } finally {
          setIsLoading(false);
        }
      }
    };

    fetchActivities();
  }, [user]);

  const handleLogout = async () => {
    try {
      await logout();
    } catch (error) {
      console.error('Logout error:', error);
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleString();
  };

  return (
    <div className="dashboard">
      <header className="dashboard-header">
        <h1>Meditrack Dashboard</h1>
        <div className="user-info">
          <span>Welcome, {user?.username} ({user?.role})</span>
          <button onClick={handleLogout} className="logout-btn">
            Logout
          </button>
        </div>
      </header>

      <main className="dashboard-content">
        {user && (user.role === 'admin' || user.role === 'superadmin') && (
          <section className="activity-section">
            <h2>User Activity Log</h2>
            {isLoading ? (
              <p>Loading activities...</p>
            ) : (
              <div className="activity-list">
                {activities.length === 0 ? (
                  <p>No activities found.</p>
                ) : (
                  <table className="activity-table">
                    <thead>
                      <tr>
                        <th>User</th>
                        <th>Role</th>
                        <th>Action</th>
                        <th>Timestamp</th>
                        <th>IP Address</th>
                      </tr>
                    </thead>
                    <tbody>
                      {activities.map((activity) => (
                        <tr key={activity.id}>
                          <td>{activity.users.username}</td>
                          <td>{activity.users.role}</td>
                          <td className={`action-${activity.action}`}>
                            {activity.action}
                          </td>
                          <td>{formatDate(activity.timestamp)}</td>
                          <td>{activity.ip_address || 'N/A'}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                )}
              </div>
            )}
          </section>
        )}

        {user && user.role === 'user' && (
          <section className="user-section">
            <h2>User Dashboard</h2>
            <p>Welcome to Meditrack! You are logged in as a regular user.</p>
          </section>
        )}
      </main>
    </div>
  );
};

export default Dashboard;