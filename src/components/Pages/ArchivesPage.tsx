import React, { useState, useEffect } from 'react';
import { inventoryService, activityService } from '../../services/supabaseService';
import './ArchivesPage.css';
import './PagesStyles.css';
import ViewArchiveModal from '../Modals/ViewArchiveModal';
import RestoreArchiveModal from '../Modals/RestoreArchiveModal';
import DeleteArchiveModal from '../Modals/DeleteArchiveModal';

const ArchivesPage: React.FC = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [filterType, setFilterType] = useState('all');
  const [archives, setArchives] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedItem, setSelectedItem] = useState<any | null>(null);
  const [isViewModalOpen, setIsViewModalOpen] = useState(false);
  const [isRestoreModalOpen, setIsRestoreModalOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [sortField, setSortField] = useState<string>('archivedDate');
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('desc');

  const fetchArchives = async () => {
    try {
      setLoading(true);
      const inventoryItems = await inventoryService.getArchivedItems();

      // Transform data to unified archive format - only inventory items
      const archiveData = inventoryItems.map(item => ({
        id: `inv_${item.id}`,
        type: 'Inventory Item',
        title: item.generic_name,
        description: item.notes || 'No description',
        archivedDate: new Date(item.updated_at || item.created_at).toISOString().split('T')[0],
        originalDate: new Date(item.created_at).toISOString().split('T')[0],
        size: 'N/A',
        category: 'Inventory',
        status: 'Archived',
        patientName: 'N/A',
        createdBy: 'System'
      }));

      setArchives(archiveData);
      setError(null);
    } catch (error) {
      console.error('Error fetching archives:', error);
      setError('Failed to load archives');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchArchives();
  }, []);

  const categories = ['all', 'Inventory', 'Equipment', 'Supplies', 'System'];

  const handleSort = (field: string) => {
    if (sortField === field) {
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
    } else {
      setSortField(field);
      setSortDirection('asc');
    }
  };

  const sortData = (data: any[]) => {
    return [...data].sort((a, b) => {
      let aVal = a[sortField];
      let bVal = b[sortField];

      // Handle different data types
      if (sortField === 'archivedDate' || sortField === 'originalDate') {
        aVal = new Date(aVal);
        bVal = new Date(bVal);
      } else if (typeof aVal === 'string') {
        aVal = (aVal || '').toLowerCase();
        bVal = (bVal || '').toLowerCase();
      }

      if (aVal < bVal) return sortDirection === 'asc' ? -1 : 1;
      if (aVal > bVal) return sortDirection === 'asc' ? 1 : -1;
      return 0;
    });
  };

  const filteredArchives = sortData(
    archives.filter(archive => {
      const matchesSearch = (archive.title || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
                           (archive.description || '').toLowerCase().includes(searchTerm.toLowerCase());
      const matchesType = filterType === 'all' || archive.category === filterType;

      return matchesSearch && matchesType;
    })
  );

  const handleExport = () => {
    console.log('Exporting archive data...');
  };


  const handleRestoreItem = async () => {
    if (!selectedItem) return;
    try {
      const id = parseInt(selectedItem.id.split('_')[1]);

      // Update the item status to make it available again
      await inventoryService.updateItem(id, {
        status: 'available',
        updated_at: new Date().toISOString()
      });

      // Log the activity
      await activityService.logActivity({
        action: 'restore',
        description: `Restored item: ${selectedItem.title}`,
        category: 'inventory'
      });

      // Refresh the archives list
      await fetchArchives();
      setIsRestoreModalOpen(false);
      setSelectedItem(null);

      // Show success message (you could add a toast notification here)
      console.log('Item restored successfully');
    } catch (error) {
      console.error('Error restoring item:', error);
      // Show error message (you could add a toast notification here)
      alert('Failed to restore item. Please try again.');
    }
  };

  const handleDeleteItem = async () => {
    if (!selectedItem) return;
    try {
      const id = selectedItem.id.split('_')[1];
      await inventoryService.deleteItem(id);
      activityService.logActivity({ action: 'delete', description: `Deleted item: ${selectedItem.title}` });
      fetchArchives();
      setIsDeleteModalOpen(false);
    } catch (error) {
      console.error('Error deleting item:', error);
    }
  };

  return (
    <div className="page-container">
      <div className="page-header">
        <h1 className="page-title">Archives</h1>
        <p className="page-subtitle">Access and manage archived medical records and documents</p>
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
              placeholder="Search archives by title, description, or patient name..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>

          <div className="filter-group">
            <label>Category:</label>
            <select value={filterType} onChange={(e) => setFilterType(e.target.value)}>
              {categories.map(category => (
                <option key={category} value={category}>
                  {category === 'all' ? 'All Categories' : category}
                </option>
              ))}
            </select>
          </div>


          <button className="btn-secondary" onClick={handleExport}>
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
              <path d="M21 15V19C21 19.5304 20.7893 20.0391 20.4142 20.4142C20.0391 20.7893 19.5304 21 19 21H5C4.46957 21 3.96086 20.7893 3.58579 20.4142C3.21071 20.0391 3 19.5304 3 19V15" stroke="currentColor" strokeWidth="2"/>
              <polyline points="7,10 12,15 17,10" stroke="currentColor" strokeWidth="2"/>
              <line x1="12" y1="15" x2="12" y2="3" stroke="currentColor" strokeWidth="2"/>
            </svg>
            Export
          </button>
        </div>
      </div>

      {loading && (
        <div className="loading-message">Loading archives...</div>
      )}

      {error && (
        <div className="error-message">{error}</div>
      )}

      {/* Archive Statistics */}
      <div className="archive-stats">
        <div className="stat-item">
          <div className="stat-number">{filteredArchives.length}</div>
          <div className="stat-label">Total Records</div>
        </div>
        <div className="stat-item">
          <div className="stat-number">
            {(filteredArchives.reduce((total, item) => total + parseFloat(item.size.replace(/[^\d.]/g, '')), 0)).toFixed(1)} MB
          </div>
          <div className="stat-label">Total Size</div>
        </div>
        <div className="stat-item">
          <div className="stat-number">{new Set(filteredArchives.map(item => item.category)).size}</div>
          <div className="stat-label">Categories</div>
        </div>
        <div className="stat-item">
          <div className="stat-number">
            {archives.length > 0 ? Math.floor((Date.now() - new Date(Math.min(...filteredArchives.map(item => new Date(item.archivedDate).getTime()))).getTime()) / (1000 * 60 * 60 * 24)) : 0}
          </div>
          <div className="stat-label">Days Oldest</div>
        </div>
      </div>

      {/* Archives Table */}
      <div className="archives-table-container">
        <div className="data-table">
          <table>
            <thead>
              <tr>
                <th className="sortable" onClick={() => handleSort('type')}>
                  Type {sortField === 'type' && (sortDirection === 'asc' ? '▲' : '▼')}
                </th>
                <th className="sortable" onClick={() => handleSort('title')}>
                  Title & Description {sortField === 'title' && (sortDirection === 'asc' ? '▲' : '▼')}
                </th>
                <th className="sortable" onClick={() => handleSort('patientName')}>
                  Patient {sortField === 'patientName' && (sortDirection === 'asc' ? '▲' : '▼')}
                </th>
                <th className="sortable" onClick={() => handleSort('category')}>
                  Category {sortField === 'category' && (sortDirection === 'asc' ? '▲' : '▼')}
                </th>
                <th className="sortable" onClick={() => handleSort('originalDate')}>
                  Original Date {sortField === 'originalDate' && (sortDirection === 'asc' ? '▲' : '▼')}
                </th>
                <th className="sortable" onClick={() => handleSort('archivedDate')}>
                  Archived Date {sortField === 'archivedDate' && (sortDirection === 'asc' ? '▲' : '▼')}
                </th>
                <th>Size</th>
                <th className="sortable" onClick={() => handleSort('status')}>
                  Status {sortField === 'status' && (sortDirection === 'asc' ? '▲' : '▼')}
                </th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredArchives.map((archive) => (
                <tr key={archive.id}>
                  <td>
                    <div className="archive-type">
                      <div className="type-icon">
                        {archive.type === 'Medical Record' && '📄'}
                        {archive.type === 'Consultation' && '🩺'}
                        {archive.type === 'Lab Report' && '🧪'}
                        {archive.type === 'Prescription' && '💊'}
                        {archive.type === 'Imaging' && '🔬'}
                        {archive.type === 'Procedure' && '⚕️'}
                      </div>
                      <span>{archive.type}</span>
                    </div>
                  </td>
                  <td>
                    <div className="archive-details">
                      <div className="archive-title">{archive.title}</div>
                      <div className="archive-description">{archive.description}</div>
                    </div>
                  </td>
                  <td>{archive.patientName}</td>
                  <td>
                    <span className={`category-badge ${(archive.category || '').toLowerCase().replace(' ', '-')}`}>
                      {archive.category}
                    </span>
                  </td>
                  <td>{archive.originalDate}</td>
                  <td>{archive.archivedDate}</td>
                  <td>{archive.size}</td>
                  <td>
                    <span className={`status-badge ${(archive.status || '').toLowerCase()}`}>
                      {archive.status}
                    </span>
                  </td>
                  <td>
                    <div className="table-actions">
                      <button className="btn-icon" title="View Archive" onClick={() => { setSelectedItem(archive); setIsViewModalOpen(true); }}>
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
                          <path d="M1 12S5 4 12 4s11 8 11 8-4 8-11 8S1 12 1 12z" stroke="currentColor" strokeWidth="2"/>
                          <circle cx="12" cy="12" r="3" stroke="currentColor" strokeWidth="2"/>
                        </svg>
                      </button>
                      <button
                        className="btn-icon success"
                        title="Restore"
                        onClick={() => { setSelectedItem(archive); setIsRestoreModalOpen(true); }}
                      >
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
                          <path d="M3 12C3 7.02944 7.02944 3 12 3C16.9706 3 21 7.02944 21 12C21 16.9706 16.9706 21 12 21C7.02944 21 3 16.9706 3 12Z" stroke="currentColor" strokeWidth="2"/>
                          <path d="M12 7V12L15 15" stroke="currentColor" strokeWidth="2"/>
                        </svg>
                      </button>
                      <button
                        className="btn-icon danger"
                        title="Permanent Delete"
                        onClick={() => { setSelectedItem(archive); setIsDeleteModalOpen(true); }}
                      >
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
                          <polyline points="3,6 5,6 21,6" stroke="currentColor" strokeWidth="2"/>
                          <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2" stroke="currentColor" strokeWidth="2"/>
                          <line x1="10" y1="11" x2="10" y2="17" stroke="currentColor" strokeWidth="2"/>
                          <line x1="14" y1="11" x2="14" y2="17" stroke="currentColor" strokeWidth="2"/>
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
          Showing {filteredArchives.length} of {archives.length} records
        </div>
        <button className="pagination-btn">Next</button>
      </div>

      {isViewModalOpen && (
        <ViewArchiveModal
          item={selectedItem}
          onClose={() => setIsViewModalOpen(false)}
        />
      )}

      {isRestoreModalOpen && (
        <RestoreArchiveModal
          item={selectedItem}
          onClose={() => setIsRestoreModalOpen(false)}
          onConfirm={handleRestoreItem}
        />
      )}

      {isDeleteModalOpen && (
        <DeleteArchiveModal
          item={selectedItem}
          onClose={() => setIsDeleteModalOpen(false)}
          onConfirm={handleDeleteItem}
        />
      )}
    </div>
  );
};

export default ArchivesPage;