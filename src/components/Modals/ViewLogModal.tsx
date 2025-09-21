import React from 'react';
import './Modal.css';

interface ViewLogModalProps {
  item: any;
  onClose: () => void;
}

const ViewLogModal: React.FC<ViewLogModalProps> = ({ item, onClose }) => {
  if (!item) return null;

  return (
    <div className="modal-overlay">
      <div className="modal-content">
        <div className="modal-header">
          <h2 className="modal-title">Log Details</h2>
          <button className="modal-close-btn" onClick={onClose}>&times;</button>
        </div>
        <div className="modal-body">
          <p><strong>Timestamp:</strong> {new Date(item.timestamp).toLocaleString()}</p>
          <p><strong>User:</strong> {item.users?.username || 'Unknown'}</p>
          <p><strong>Role:</strong> {item.users?.role || 'Unknown'}</p>
          <p><strong>Action:</strong> {item.action}</p>
          {item.category && <p><strong>Category:</strong> {item.category}</p>}
          <p><strong>Description:</strong> {item.description}</p>
          {item.ip_address && <p><strong>IP Address:</strong> {item.ip_address}</p>}
          {item.user_agent && <p><strong>User Agent:</strong> {item.user_agent}</p>}
          <p><strong>Severity:</strong> {item.severity}</p>
          {item.details && <p><strong>Details:</strong> {JSON.stringify(item.details)}</p>}
        </div>
        <div className="modal-footer">
          <button className="btn-secondary" onClick={onClose}>Close</button>
        </div>
      </div>
    </div>
  );
};

export default ViewLogModal;
