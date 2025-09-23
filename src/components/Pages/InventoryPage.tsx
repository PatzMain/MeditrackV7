import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { inventoryService, activityService } from '../../services/supabaseService';
import './InventoryPage.css';
import './PagesStyles.css';
import ViewInventoryItemModal from '../Modals/ViewInventoryItemModal';
import EditInventoryItemModal from '../Modals/EditInventoryItemModal';
import ArchiveInventoryItemModal from '../Modals/ArchiveInventoryItemModal';
import AddInventoryItemModal from '../Modals/AddInventoryItemModal';

type SortDirection = 'asc' | 'desc';

const InventoryPage: React.FC = () => {
  const [activeTab, setActiveTab] = useState('medicines');
  const [activeDepartment, setActiveDepartment] = useState('medical');
  const [inventoryData, setInventoryData] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [selectedItem, setSelectedItem] = useState<any | null>(null);
  const [isViewModalOpen, setIsViewModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isArchiveModalOpen, setIsArchiveModalOpen] = useState(false);
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [sortColumn, setSortColumn] = useState<string | null>(null);
  const [sortDirection, setSortDirection] = useState<SortDirection>('asc');
  const [classifications, setClassifications] = useState<any[]>([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(100);
  const [highlightedItemId, setHighlightedItemId] = useState<number | null>(null);

  const location = useLocation();
  const navigate = useNavigate();
  // const tableRef = useRef<HTMLDivElement>(null); // Reserved for future scrolling functionality

  const getClassificationFromTab = (tab: string) => {
    switch (tab) {
      case 'medicines': return 'Medicines';
      case 'supplies': return 'Supplies';
      case 'equipment': return 'Equipment';
      default: return 'Medicines';
    }
  };

  const getTabFromClassification = (classification: string) => {
    switch (classification?.toLowerCase()) {
      case 'medicines': return 'medicines';
      case 'supplies': return 'supplies';
      case 'equipment': return 'equipment';
      default: return 'medicines';
    }
  };

  const fetchInventoryData = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const classification = getClassificationFromTab(activeTab);
      const data = await inventoryService.getItemsByDepartmentAndClassification(activeDepartment, classification);
      setInventoryData(Array.isArray(data) ? data : []);
    } catch (error: any) {
      console.error('Error fetching inventory data:', error);
      setError(`Failed to load inventory data: ${error.message}`);
      setInventoryData([]);
    } finally {
      setLoading(false);
    }
  }, [activeTab, activeDepartment]);

  const fetchClassifications = useCallback(async () => {
    try {
      const data = await inventoryService.getClassifications();
      setClassifications(Array.isArray(data) ? data : []);
    } catch (error: any) {
      console.error('Error fetching classifications:', error);
    }
  }, []);


  // Handle URL parameters on mount and location change
  useEffect(() => {
    const searchParams = new URLSearchParams(location.search);
    const itemId = searchParams.get('itemId');
    const department = searchParams.get('department');
    const classification = searchParams.get('classification');

    if (itemId) {
      setHighlightedItemId(parseInt(itemId));
    }

    if (department && department !== activeDepartment) {
      setActiveDepartment(department);
    }

    if (classification) {
      const tabName = getTabFromClassification(classification);
      if (tabName !== activeTab) {
        setActiveTab(tabName);
      }
    }

    // Clear URL parameters after processing to keep URL clean
    if (itemId || department || classification) {
      const timer = setTimeout(() => {
        navigate('/inventory', { replace: true });
      }, 100);
      return () => clearTimeout(timer);
    }
  }, [location.search, navigate, activeDepartment, activeTab]);

  useEffect(() => {
    fetchInventoryData();
    fetchClassifications();
  }, [fetchInventoryData, fetchClassifications]);

  // Scroll to and highlight item after data loads
  useEffect(() => {
    if (highlightedItemId && inventoryData.length > 0 && !loading) {
      const timer = setTimeout(() => {
        const itemElement = document.getElementById(`inventory-item-${highlightedItemId}`);
        if (itemElement) {
          // Scroll to the item
          itemElement.scrollIntoView({
            behavior: 'smooth',
            block: 'center',
            inline: 'nearest'
          });

          // Clear highlight after 5 seconds
          setTimeout(() => {
            setHighlightedItemId(null);
          }, 5000);
        }
      }, 500); // Small delay to ensure rendering is complete

      return () => clearTimeout(timer);
    }
  }, [highlightedItemId, inventoryData, loading]);

  const getSingularClassification = (tab: string) => {
    switch (tab) {
      case 'medicines': return 'Medicine';
      case 'supplies': return 'Supply';
      case 'equipment': return 'Equipment';
      default: return 'Medicine';
    }
  };

  const handleSort = (column: string) => {
    if (sortColumn === column) {
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
    } else {
      setSortColumn(column);
      setSortDirection('asc');
    }
  };

  const sortedAndFilteredItems = useMemo(() => {
    let items = inventoryData.filter(item => {
      const searchLower = searchQuery.toLowerCase();
      const nameMatch = ((item.generic_name || '').toLowerCase().includes(searchLower) || (item.brand_name || '').toLowerCase().includes(searchLower));
      const statusMatch = statusFilter === 'all' || item.status === statusFilter;
      return nameMatch && statusMatch;
    });

    if (sortColumn) {
      items.sort((a, b) => {
        const aValue = a[sortColumn];
        const bValue = b[sortColumn];
        if (aValue < bValue) return sortDirection === 'asc' ? -1 : 1;
        if (aValue > bValue) return sortDirection === 'asc' ? 1 : -1;
        return 0;
      });
    }

    return items;
  }, [inventoryData, searchQuery, statusFilter, sortColumn, sortDirection]);

  const inventoryStats = useMemo(() => {
    const lowStockItems = inventoryData.filter(item => item.status === 'low_stock');
    const outOfStockItems = inventoryData.filter(item => item.status === 'out_of_stock');
    const expiredItems = inventoryData.filter(item => item.status === 'expired');

    return {
      totalItems: inventoryData.length,
      lowStockItems: lowStockItems.length,
      outOfStockItems: outOfStockItems.length,
      expiredItems: expiredItems.length
    };
  }, [inventoryData]);

  // Pagination
  const totalPages = Math.ceil(sortedAndFilteredItems.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const paginatedItems = sortedAndFilteredItems.slice(startIndex, endIndex);

  const handleSaveItem = async (updatedItem: any) => {
    try {
      const { classification, ...itemToSave } = updatedItem;
      await inventoryService.updateItem(itemToSave.id, itemToSave);
      activityService.logActivity({ action: 'edit', description: `Edited inventory item: ${itemToSave.generic_name}` });
      fetchInventoryData();
      setIsEditModalOpen(false);
    } catch (error) {
      console.error('Error updating item:', error);
    }
  };

  const handleArchiveItem = async () => {
    console.log('Archiving item:', selectedItem);
    if (!selectedItem) return;
    try {
      await inventoryService.archiveItem(selectedItem.id);
      activityService.logActivity({ action: 'archive', description: `Archived inventory item: ${selectedItem.generic_name}` });
      console.log('Item archived successfully');
      fetchInventoryData();
      setIsArchiveModalOpen(false);
    } catch (error) {
      console.error('Error archiving item:', error);
    }
  };

  const handleAddItem = async (newItem: any) => {
    try {
      const { classification, ...itemToSave } = newItem;
      await inventoryService.createItem(itemToSave);
      activityService.logActivity({ action: 'add', description: `Added new inventory item: ${itemToSave.generic_name}` });
      fetchInventoryData();
      setIsAddModalOpen(false);
    } catch (error) {
      console.error('Error adding item:', error);
    }
  };

  const getStatusBadgeClass = (status: string) => {
    switch (status) {
      case 'expired': return 'status-badge expired';
      case 'out_of_stock': return 'status-badge out-of-stock';
      case 'low_stock': return 'status-badge low-stock';
      case 'maintenance': return 'status-badge maintenance';
      default: return 'status-badge available';
    }
  };

  const renderStatCards = () => {
    const statCards = [
      {
        title: `Total ${getClassificationFromTab(activeTab)}`,
        value: inventoryStats.totalItems.toString(),
        change: `${activeDepartment} department`,
        changeType: 'neutral',
        icon: (
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
            <rect x="3" y="3" width="18" height="18" rx="2" ry="2" stroke="currentColor" strokeWidth="2"/>
            <rect x="7" y="7" width="3" height="9" stroke="currentColor" strokeWidth="2"/>
            <rect x="14" y="7" width="3" height="5" stroke="currentColor" strokeWidth="2"/>
          </svg>
        )
      },
      {
        title: 'Low Stock',
        value: inventoryStats.lowStockItems.toString(),
        change: inventoryStats.lowStockItems > 0 ? 'Needs reorder' : 'All sufficient',
        changeType: inventoryStats.lowStockItems > 0 ? 'warning' : 'positive',
        icon: (
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
            <path d="M22 12H18L15 21L9 3L6 12H2" stroke="currentColor" strokeWidth="2"/>
          </svg>
        )
      },
      {
        title: 'Out of Stock',
        value: inventoryStats.outOfStockItems.toString(),
        change: inventoryStats.outOfStockItems > 0 ? 'Critical' : 'None',
        changeType: inventoryStats.outOfStockItems > 0 ? 'danger' : 'positive',
        icon: (
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
            <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="2"/>
            <line x1="15" y1="9" x2="9" y2="15" stroke="currentColor" strokeWidth="2"/>
            <line x1="9" y1="9" x2="15" y2="15" stroke="currentColor" strokeWidth="2"/>
          </svg>
        )
      },
      {
        title: 'Expired Items',
        value: inventoryStats.expiredItems.toString(),
        change: inventoryStats.expiredItems > 0 ? 'Dispose required' : 'All current',
        changeType: inventoryStats.expiredItems > 0 ? 'danger' : 'positive',
        icon: (
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
            <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="2"/>
            <line x1="12" y1="6" x2="12" y2="12" stroke="currentColor" strokeWidth="2"/>
            <circle cx="12" cy="16" r="1" fill="currentColor"/>
          </svg>
        )
      }
    ];

    return (
      <div className="stats-grid">
        {statCards.map((stat, index) => (
          <div key={index} className="stat-card">
            <div className="stat-icon">
              {stat.icon}
            </div>
            <div className="stat-content">
              <div className="stat-value">{stat.value}</div>
              <div className="stat-title">{stat.title}</div>
              <div className={`stat-change ${stat.changeType}`}>
                {stat.change}
              </div>
            </div>
          </div>
        ))}
      </div>
    );
  };

  const renderDataTable = () => (
    <div className="data-table">
      <table>
        <thead>
          <tr>
            <th onClick={() => handleSort('code')}>Code {sortColumn === 'code' && (sortDirection === 'asc' ? '▲' : '▼')}</th>
            <th onClick={() => handleSort('generic_name')}>Generic Name {sortColumn === 'generic_name' && (sortDirection === 'asc' ? '▲' : '▼')}</th>
            <th onClick={() => handleSort('brand_name')}>Brand Name {sortColumn === 'brand_name' && (sortDirection === 'asc' ? '▲' : '▼')}</th>
            <th onClick={() => handleSort('category')}>Category {sortColumn === 'category' && (sortDirection === 'asc' ? '▲' : '▼')}</th>
            <th onClick={() => handleSort('stock_quantity')}>Stock {sortColumn === 'stock_quantity' && (sortDirection === 'asc' ? '▲' : '▼')}</th>
            <th onClick={() => handleSort('expiration_date')}>Expiration Date {sortColumn === 'expiration_date' && (sortDirection === 'asc' ? '▲' : '▼')}</th>
            <th onClick={() => handleSort('status')}>Status {sortColumn === 'status' && (sortDirection === 'asc' ? '▲' : '▼')}</th>
            <th>Actions</th>
          </tr>
        </thead>
        <tbody>
          {paginatedItems.map((item) => (
            <tr
              key={item.id}
              id={`inventory-item-${item.id}`}
              className={highlightedItemId === item.id ? 'highlighted-item' : ''}
            >
              <td>{item.code || <span className="placeholder-text">--</span>}</td>
              <td>{item.generic_name || <span className="placeholder-text">No name</span>}</td>
              <td>{item.brand_name || <span className="placeholder-text">No brand</span>}</td>
              <td>{item.category || <span className="placeholder-text">Uncategorized</span>}</td>
              <td>
                {item.stock_quantity || 0} {item.unit_of_measurement || <span className="placeholder-text">units</span>}
              </td>
              <td>{item.expiration_date || <span className="placeholder-text">No expiry</span>}</td>
              <td>
                <span className={getStatusBadgeClass(item.status)}>
                  {item.status ? item.status.replace(/_/g, ' ') : 'Unknown'}
                </span>
              </td>
              <td>
                <div className="table-actions">
                  <button className="btn-icon" title="View" onClick={() => { setSelectedItem(item); setIsViewModalOpen(true); }}>
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" />
                      <circle cx="12" cy="12" r="3" />
                    </svg>
                  </button>
                  <button className="btn-icon" title="Edit" onClick={() => { setSelectedItem(item); setIsEditModalOpen(true); }}>
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7" />
                      <path d="m18.5 2.5a2.12 2.12 0 0 1 3 3L12 15l-4 1 1-4Z" />
                    </svg>
                  </button>
                  <button className="btn-icon danger" title="Archive" onClick={() => { setSelectedItem(item); setIsArchiveModalOpen(true); }}>
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <rect width="20" height="5" x="2" y="3" rx="1" />
                      <path d="m4 8 16 0" />
                      <path d="m6 8 0 13a2 2 0 0 0 2 2h8a2 2 0 0 0 2-2l0-13" />
                      <path d="m8 8 0-2a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2l0 2" />
                    </svg>
                  </button>
                </div>
              </td>
            </tr>
          ))}
        </tbody>
      </table>

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
          Showing {startIndex + 1}-{Math.min(endIndex, sortedAndFilteredItems.length)} of {sortedAndFilteredItems.length} items
        </div>

        <button
          className="pagination-btn"
          disabled={currentPage === totalPages}
          onClick={() => setCurrentPage(currentPage + 1)}
        >
          Next
        </button>
      </div>
    </div>
  );

  return (
    <div className="page-container">
      <div className="page-header">
        <h1 className="page-title">Inventory Management</h1>
        <p className="page-subtitle">Manage medical and dental inventory across different classifications.</p>
      </div>

      <div className="inventory-layout">
        <div className="inventory-sidebar">
          <div className="department-tabs">
            <button
              className={`department-tab ${activeDepartment === 'medical' ? 'active' : ''}`}
              onClick={() => setActiveDepartment('medical')}
            >
              Medical Department
            </button>
            <button
              className={`department-tab ${activeDepartment === 'dental' ? 'active' : ''}`}
              onClick={() => setActiveDepartment('dental')}
            >
              Dental Department
            </button>
          </div>
          <div className="classification-tabs">
            <button
              className={`classification-tab ${activeTab === 'medicines' ? 'active' : ''}`}
              onClick={() => setActiveTab('medicines')}
            >
              Medicines
            </button>
            <button
              className={`classification-tab ${activeTab === 'supplies' ? 'active' : ''}`}
              onClick={() => setActiveTab('supplies')}
            >
              Supplies
            </button>
            <button
              className={`classification-tab ${activeTab === 'equipment' ? 'active' : ''}`}
              onClick={() => setActiveTab('equipment')}
            >
              Equipment
            </button>
          </div>
        </div>

        <div className="inventory-main">
          {renderStatCards()}

          <div className="page-controls">
            <div className="search-box">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="11" cy="11" r="8"></circle><line x1="21" y1="21" x2="16.65" y2="16.65"></line></svg>
              <input
                type="text"
                placeholder="Search by name..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
            <select
              className="filter-select"
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
            >
              <option value="all">All Status</option>
              <option value="active">Active</option>
              <option value="low_stock">Low Stock</option>
              <option value="out_of_stock">Out of Stock</option>
              <option value="expired">Expired</option>
            </select>
            <select
              className="filter-select"
              value={itemsPerPage}
              onChange={(e) => {
                setItemsPerPage(Number(e.target.value));
                setCurrentPage(1);
              }}
            >
              <option value={10}>10 per page</option>
              <option value={25}>25 per page</option>
              <option value={50}>50 per page</option>
              <option value={100}>100 per page</option>
            </select>
            <button className="btn-primary" onClick={() => setIsAddModalOpen(true)}>
              Add {getSingularClassification(activeTab)}
            </button>
          </div>

          {loading ? (
            <div className="loading-message">Loading inventory data...</div>
          ) : error ? (
            <div className="error-container">
              <div className="error-message">{error}</div>
              <button className="btn-secondary" onClick={fetchInventoryData}>Retry</button>
            </div>
          ) : sortedAndFilteredItems.length === 0 ? (
            <div className="empty-state">
              <div className="empty-state-icon">
                <svg width="64" height="64" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                  <rect x="3" y="3" width="18" height="18" rx="2" ry="2"/>
                  <rect x="7" y="7" width="3" height="9"/>
                  <rect x="14" y="7" width="3" height="5"/>
                </svg>
              </div>
              <div className="empty-state-content">
                <h3>No {getClassificationFromTab(activeTab)} Found</h3>
                <p>There are currently no {getClassificationFromTab(activeTab).toLowerCase()} in the {activeDepartment} department{searchQuery && ` matching "${searchQuery}"`}.</p>
                <button className="btn-primary" onClick={() => setIsAddModalOpen(true)}>
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <line x1="12" y1="5" x2="12" y2="19"/>
                    <line x1="5" y1="12" x2="19" y2="12"/>
                  </svg>
                  Add First {getSingularClassification(activeTab)}
                </button>
              </div>
            </div>
          ) : (
            renderDataTable()
          )}
        </div>
      </div>

      {isViewModalOpen && <ViewInventoryItemModal item={selectedItem} onClose={() => setIsViewModalOpen(false)} />}
      {isEditModalOpen && <EditInventoryItemModal item={selectedItem} onClose={() => setIsEditModalOpen(false)} onSave={handleSaveItem} classifications={classifications} />}
      {isArchiveModalOpen && <ArchiveInventoryItemModal item={selectedItem} onClose={() => setIsArchiveModalOpen(false)} onConfirm={handleArchiveItem} />}
      {isAddModalOpen && <AddInventoryItemModal
        onClose={() => setIsAddModalOpen(false)}
        onSave={handleAddItem}
        department={activeDepartment}
        classifications={classifications}
        activeClassificationTab={activeTab}
      />}
    </div>
  );
};

export default InventoryPage;
