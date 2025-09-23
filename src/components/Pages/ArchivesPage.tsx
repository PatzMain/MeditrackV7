import React, { useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
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
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(100);
  const [selectedItems, setSelectedItems] = useState<Set<string>>(new Set());
  const [highlightedItemId, setHighlightedItemId] = useState<string | null>(null);
  const location = useLocation();
  const navigate = useNavigate();

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

  // Handle URL highlighting from universal search
  useEffect(() => {
    const searchParams = new URLSearchParams(location.search);
    const highlightId = searchParams.get('highlightId');
    const page = searchParams.get('page');
    const itemsPerPageParam = searchParams.get('itemsPerPage');

    if (highlightId) {
      setHighlightedItemId(highlightId);
    }

    // Set page and items per page from universal search
    if (page) {
      setCurrentPage(parseInt(page));
    }

    if (itemsPerPageParam) {
      const itemsPerPageValue = parseInt(itemsPerPageParam);
      if ([10, 25, 50, 100].includes(itemsPerPageValue)) {
        setItemsPerPage(itemsPerPageValue);
      }
    }

    // Clean up URL after processing
    if (highlightId || page || itemsPerPageParam) {
      const timer = setTimeout(() => {
        navigate('/archives', { replace: true });
      }, 100);
      return () => clearTimeout(timer);
    }
  }, [location.search, navigate]);

  // Scroll to and highlight item when highlightedItemId changes
  useEffect(() => {
    if (highlightedItemId && archives.length > 0 && !loading) {
      const timer = setTimeout(() => {
        const itemElement = document.getElementById(`archive-item-${highlightedItemId}`);
        if (itemElement) {
          // Scroll to the item
          itemElement.scrollIntoView({
            behavior: 'smooth',
            block: 'center'
          });

          // Clear highlight after 3 seconds
          setTimeout(() => {
            setHighlightedItemId(null);
          }, 3000);
        }
      }, 100);

      return () => clearTimeout(timer);
    }
  }, [highlightedItemId, archives, loading]);

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

  // Pagination
  const totalPages = Math.ceil(filteredArchives.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const paginatedArchives = filteredArchives.slice(startIndex, endIndex);

  // Selection handlers
  const handleSelectAll = (checked: boolean) => {
    if (checked) {
      setSelectedItems(new Set(paginatedArchives.map(item => item.id)));
    } else {
      setSelectedItems(new Set());
    }
  };

  const handleSelectItem = (itemId: string, checked: boolean) => {
    const newSelected = new Set(selectedItems);
    if (checked) {
      newSelected.add(itemId);
    } else {
      newSelected.delete(itemId);
    }
    setSelectedItems(newSelected);
  };

  const isAllSelected = paginatedArchives.length > 0 && paginatedArchives.every(item => selectedItems.has(item.id));
  const isSomeSelected = paginatedArchives.some(item => selectedItems.has(item.id));



  const handleRestoreItem = async () => {
    if (!selectedItem) return;
    try {
      setLoading(true);
      const id = parseInt(selectedItem.id.split('_')[1]);

      if (isNaN(id)) {
        throw new Error('Invalid item ID');
      }

      // Update the item status to make it active again
      await inventoryService.updateItem(id, {
        status: 'active',
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

      // Show success message (could be replaced with a toast notification)
      console.log('Item restored successfully!');
    } catch (error) {
      console.error('Error restoring item:', error);
      // Show error message (could be replaced with a toast notification)
      console.error(`Failed to restore item: ${error instanceof Error ? error.message : 'Unknown error'}`);
    } finally {
      setLoading(false);
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

          <div className="filter-group">
            <label>Items per page:</label>
            <select value={itemsPerPage} onChange={(e) => {
              setItemsPerPage(Number(e.target.value));
              setCurrentPage(1);
            }}>
              <option value={10}>10</option>
              <option value={25}>25</option>
              <option value={50}>50</option>
              <option value={100}>100</option>
            </select>
          </div>

        </div>

        {/* Bulk Actions */}
        {selectedItems.size > 0 && (
          <div className="bulk-actions">
            <span className="bulk-selection-count">{selectedItems.size} item(s) selected</span>
            <div className="bulk-action-buttons">
              <button
                className="btn-success btn-sm"
                onClick={() => {
                  // Bulk restore functionality
                  console.log('Bulk restore:', Array.from(selectedItems));
                }}
              >
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none">
                  <path d="M3 12C3 7.02944 7.02944 3 12 3C16.9706 3 21 7.02944 21 12C21 16.9706 16.9706 21 12 21C7.02944 21 3 16.9706 3 12Z" stroke="currentColor" strokeWidth="2"/>
                  <path d="M12 7V12L15 15" stroke="currentColor" strokeWidth="2"/>
                </svg>
                Restore Selected
              </button>
              <button
                className="btn-danger btn-sm"
                onClick={() => {
                  // Bulk delete functionality
                  console.log('Bulk delete:', Array.from(selectedItems));
                }}
              >
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none">
                  <polyline points="3,6 5,6 21,6" stroke="currentColor" strokeWidth="2"/>
                  <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2" stroke="currentColor" strokeWidth="2"/>
                </svg>
                Delete Selected
              </button>
              <button
                className="btn-secondary btn-sm"
                onClick={() => setSelectedItems(new Set())}
              >
                Clear Selection
              </button>
            </div>
          </div>
        )}
      </div>

      {loading && (
        <div className="loading-message">Loading archives...</div>
      )}

      {error && (
        <div className="error-message">{error}</div>
      )}

      {/* Archive Statistics */}
      <div className="stats-grid">
        <div className="stat-card">
          <div className="stat-icon">
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
              <rect width="20" height="5" x="2" y="3" rx="1" stroke="currentColor" strokeWidth="2"/>
              <path d="m4 8 16 0" stroke="currentColor" strokeWidth="2"/>
              <path d="m6 8 0 13a2 2 0 0 0 2 2h8a2 2 0 0 0 2-2l0-13" stroke="currentColor" strokeWidth="2"/>
            </svg>
          </div>
          <div className="stat-content">
            <div className="stat-value">{filteredArchives.length}</div>
            <div className="stat-title">Total Archived Items</div>
            <div className="stat-change neutral">Currently stored</div>
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-icon">
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
              <rect x="3" y="3" width="18" height="18" rx="2" ry="2" stroke="currentColor" strokeWidth="2"/>
              <rect x="7" y="7" width="3" height="9" stroke="currentColor" strokeWidth="2"/>
              <rect x="14" y="7" width="3" height="5" stroke="currentColor" strokeWidth="2"/>
            </svg>
          </div>
          <div className="stat-content">
            <div className="stat-value">{archives.filter(item => item.type === 'Inventory Item').length}</div>
            <div className="stat-title">Inventory Items</div>
            <div className="stat-change positive">Archived inventory</div>
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-icon">
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
              <path d="M3 3v18h18" stroke="currentColor" strokeWidth="2"/>
              <path d="m7 14 4-4 4 4 5-5" stroke="currentColor" strokeWidth="2"/>
              <circle cx="11" cy="10" r="1" fill="currentColor"/>
              <circle cx="15" cy="14" r="1" fill="currentColor"/>
              <circle cx="20" cy="9" r="1" fill="currentColor"/>
            </svg>
          </div>
          <div className="stat-content">
            <div className="stat-value">{new Set(filteredArchives.map(item => item.category)).size}</div>
            <div className="stat-title">Categories</div>
            <div className="stat-change positive">Organized types</div>
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-icon">
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
              <path d="M3 12C3 7.02944 7.02944 3 12 3C16.9706 3 21 7.02944 21 12C21 16.9706 16.9706 21 12 21C7.02944 21 3 16.9706 3 12Z" stroke="currentColor" strokeWidth="2"/>
              <path d="M12 7V12L15 15" stroke="currentColor" strokeWidth="2"/>
            </svg>
          </div>
          <div className="stat-content">
            <div className="stat-value">
              {archives.filter(item =>
                new Date(item.archivedDate) > new Date(Date.now() - 7 * 24 * 60 * 60 * 1000)
              ).length}
            </div>
            <div className="stat-title">Archived This Week</div>
            <div className="stat-change positive">Recent activity</div>
          </div>
        </div>
      </div>

      {/* Archives Table */}
      <div className="archives-table-container">
        <div className="data-table">
          <table>
            <thead>
              <tr>
                <th className="checkbox-column">
                  <input
                    type="checkbox"
                    checked={isAllSelected}
                    ref={(input) => {
                      if (input) input.indeterminate = !isAllSelected && isSomeSelected;
                    }}
                    onChange={(e) => handleSelectAll(e.target.checked)}
                  />
                </th>
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
              {paginatedArchives.map((archive) => (
                <tr
                  key={archive.id}
                  id={`archive-item-${archive.id}`}
                  className={`${selectedItems.has(archive.id) ? 'selected' : ''} ${highlightedItemId === archive.id ? 'highlighted-item' : ''}`}
                >
                  <td className="checkbox-column">
                    <input
                      type="checkbox"
                      checked={selectedItems.has(archive.id)}
                      onChange={(e) => handleSelectItem(archive.id, e.target.checked)}
                    />
                  </td>
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
        <button
          className="pagination-btn"
          disabled={currentPage === 1}
          onClick={() => setCurrentPage(currentPage - 1)}
        >
          Previous
        </button>

        <div className="pagination-pages">
          {Array.from({ length: totalPages }, (_, i) => i + 1).map(page => (
            <button
              key={page}
              className={`pagination-page ${page === currentPage ? 'active' : ''}`}
              onClick={() => setCurrentPage(page)}
            >
              {page}
            </button>
          ))}
        </div>

        <div className="pagination-info">
          Showing {startIndex + 1}-{Math.min(endIndex, filteredArchives.length)} of {filteredArchives.length} records
        </div>

        <button
          className="pagination-btn"
          disabled={currentPage === totalPages}
          onClick={() => setCurrentPage(currentPage + 1)}
        >
          Next
        </button>
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