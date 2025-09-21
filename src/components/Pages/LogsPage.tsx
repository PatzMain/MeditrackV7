import React, { useState, useEffect } from 'react';
import { activityService } from '../../services/supabaseService';
import './LogsPage.css';
import './PagesStyles.css';
import ViewLogModal from '../Modals/ViewLogModal';

const LogsPage: React.FC = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [filterUser, setFilterUser] = useState('all');
  const [filterAction, setFilterAction] = useState('all');
  const [dateRange, setDateRange] = useState({ start: '', end: '' });
  const [logs, setLogs] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedItem, setSelectedItem] = useState<any | null>(null);
  const [isViewModalOpen, setIsViewModalOpen] = useState(false);

  useEffect(() => {
    const fetchLogs = async () => {
      try {
        setLoading(true);
        const logsData = await activityService.getLogs();
        setLogs(logsData);
        setError(null);
      } catch (error) {
        console.error('Error fetching logs:', error);
        setError('Failed to load activity logs');
      } finally {
        setLoading(false);
      }
    };

    fetchLogs();
  }, []);

  const users = ['all', ...Array.from(new Set(logs.map(log => log.users?.username || 'Unknown')))];
  const actions = ['all', ...Array.from(new Set(logs.map(log => log.action)))];

  const filteredLogs = logs.filter(log => {
    const userName = log.users?.username || 'Unknown';
    const matchesSearch = log.description?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         userName.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         log.category?.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesUser = filterUser === 'all' || userName === filterUser;
    const matchesAction = filterAction === 'all' || log.action === filterAction;

    return matchesSearch && matchesUser && matchesAction;
  });

  const handleExportLogs = () => {
    console.log('Exporting logs...');
  };

  const getSeverityIcon = (severity: string) => {
    switch (severity) {
      case 'INFO':
        return (
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" className="severity-info">
            <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="2"/>
            <line x1="12" y1="16" x2="12" y2="12" stroke="currentColor" strokeWidth="2"/>
            <circle cx="12" cy="8" r="1" fill="currentColor"/>
          </svg>
        );
      case 'WARNING':
        return (
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" className="severity-warning">
            <path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z" stroke="currentColor" strokeWidth="2"/>
            <line x1="12" y1="9" x2="12" y2="13" stroke="currentColor" strokeWidth="2"/>
            <circle cx="12" cy="17" r="1" fill="currentColor"/>
          </svg>
        );
      case 'ERROR':
        return (
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" className="severity-error">
            <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="2"/>
            <line x1="15" y1="9" x2="9" y2="15" stroke="currentColor" strokeWidth="2"/>
            <line x1="9" y1="9" x2="15" y2="15" stroke="currentColor" strokeWidth="2"/>
          </svg>
        );
      default:
        return null;
    }
  };

  const getCategoryColor = (category: string) => {
    const colorMap: { [key: string]: string } = {
      'authentication': 'blue',
      'Patient Management': 'green',
      'Medical Records': 'purple',
      'Inventory Management': 'orange',
      'System': 'gray',
      'Security': 'red',
      'Laboratory': 'teal',
      'User Management': 'indigo'
    };
    return colorMap[category] || 'gray';
  };

  return (
    <div className="page-container">
      <div className="page-header">
        <h1 className="page-title">Activity Logs</h1>
        <p className="page-subtitle">Monitor and audit all system activities and user actions</p>
      </div>

      {/* Filters and Search */}
      <div className="filters-section">
        <div className="filters-row">
          <div className="search-box-large">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
              <circle cx="11" cy="11" r="8" stroke="currentColor" strokeWidth="2"/>
              <path d="m21 21-4.35-4.35" stroke="currentColor" strokeWidth="2"/>
            </svg>
            <input
              type="text"
              placeholder="Search logs by user, action, or description..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>

          <div className="filter-group">
            <label>User:</label>
            <select value={filterUser} onChange={(e) => setFilterUser(e.target.value)}>
              {users.map(user => (
                <option key={user} value={user}>
                  {user === 'all' ? 'All Users' : user}
                </option>
              ))}
            </select>
          </div>

          <div className="filter-group">
            <label>Action:</label>
            <select value={filterAction} onChange={(e) => setFilterAction(e.target.value)}>
              {actions.map(action => (
                <option key={action} value={action}>
                  {action === 'all' ? 'All Actions' : action.replace('_', ' ')}
                </option>
              ))}
            </select>
          </div>

          <div className="date-range-group">
            <label>Date Range:</label>
            <input
              type="datetime-local"
              value={dateRange.start}
              onChange={(e) => setDateRange({...dateRange, start: e.target.value})}
            />
            <span>to</span>
            <input
              type="datetime-local"
              value={dateRange.end}
              onChange={(e) => setDateRange({...dateRange, end: e.target.value})}
            />
          </div>

          <button className="btn-secondary" onClick={handleExportLogs}>
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
              <path d="M21 15V19C21 19.5304 20.7893 20.0391 20.4142 20.4142C20.0391 20.7893 19.5304 21 19 21H5C4.46957 21 3.96086 20.7893 3.58579 20.4142C3.21071 20.0391 3 19.5304 3 19V15" stroke="currentColor" strokeWidth="2"/>
              <polyline points="7,10 12,15 17,10" stroke="currentColor" strokeWidth="2"/>
              <line x1="12" y1="15" x2="12" y2="3" stroke="currentColor" strokeWidth="2"/>
            </svg>
            Export Logs
          </button>
        </div>
      </div>

      {loading && (
        <div className="loading-message">Loading activity logs...</div>
      )}

      {error && (
        <div className="error-message">{error}</div>
      )}

      {/* Log Statistics */}
      <div className="log-stats">
        <div className="stat-item">
          <div className="stat-number">{filteredLogs.length}</div>
          <div className="stat-label">Total Entries</div>
        </div>
        <div className="stat-item">
          <div className="stat-number">{filteredLogs.filter(log => log.severity === 'info').length}</div>
          <div className="stat-label">Info</div>
        </div>
        <div className="stat-item">
          <div className="stat-number">{filteredLogs.filter(log => log.severity === 'warning').length}</div>
          <div className="stat-label">Warnings</div>
        </div>
        <div className="stat-item">
          <div className="stat-number">{filteredLogs.filter(log => log.severity === 'error').length}</div>
          <div className="stat-label">Errors</div>
        </div>
      </div>

      {/* Logs Table */}
      <div className="logs-table-container">
        <div className="data-table">
          <table>
            <thead>
              <tr>
                <th>Timestamp</th>
                <th>User</th>
                <th>Action</th>
                <th>Category</th>
                <th>Description</th>
                <th>Severity</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredLogs.map((log) => (
                <tr key={log.id} className={`log-row severity-${log.severity}`}>
                  <td className="timestamp-cell">
                    <div className="timestamp">{new Date(log.timestamp).toLocaleString()}</div>
                  </td>
                  <td>
                    <div className="user-info">
                      <div className="user-name">{log.users?.username || 'Unknown'}</div>
                      <div className="user-role">{log.users?.role || 'Unknown'}</div>
                    </div>
                  </td>
                  <td>
                    <span className="action-badge">
                      {log.action.replace('_', ' ')}
                    </span>
                  </td>
                  <td>
                    <span className={`category-badge ${getCategoryColor(log.category || 'System')}`}>
                      {log.category || 'System'}
                    </span>
                  </td>
                  <td>
                    <div className="log-description">
                      <div className="description-text">{log.description}</div>
                      {log.details && (
                        <div className="description-details">{JSON.stringify(log.details)}</div>
                      )}
                    </div>
                  </td>
                  <td className="severity-cell">
                    <div className="severity-indicator">
                      {getSeverityIcon(log.severity.toUpperCase())}
                      <span className={`severity-text ${log.severity}`}>
                        {log.severity.toUpperCase()}
                      </span>
                    </div>
                  </td>
                  <td>
                    <div className="table-actions">
                      <button className="btn-icon" title="View Details" onClick={() => { setSelectedItem(log); setIsViewModalOpen(true); }}>
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
                          <path d="M1 12S5 4 12 4s11 8 11 8-4 8-11 8S1 12 1 12z" stroke="currentColor" strokeWidth="2"/>
                          <circle cx="12" cy="12" r="3" stroke="currentColor" strokeWidth="2"/>
                        </svg>
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Pagination */}
      <div className="pagination">
        <button className="pagination-btn">Previous</button>
        <div className="pagination-info">
          Showing {filteredLogs.length} of {logs.length} log entries
        </div>
        <button className="pagination-btn">Next</button>
      </div>

      {isViewModalOpen && (
        <ViewLogModal
          item={selectedItem}
          onClose={() => setIsViewModalOpen(false)}
        />
      )}
    </div>
  );
};

export default LogsPage;