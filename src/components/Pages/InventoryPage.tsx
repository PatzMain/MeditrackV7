import React, { useState, useEffect, useMemo, useCallback } from 'react';
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

  const getClassificationFromTab = (tab: string) => {
    switch (tab) {
      case 'medicines': return 'Medicines';
      case 'supplies': return 'Supplies';
      case 'equipment': return 'Equipment';
      default: return 'Medicines';
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

  const fetchClassifications = async () => {
    try {
      const data = await inventoryService.getClassifications();
      setClassifications(Array.isArray(data) ? data : []);
    } catch (error: any) {
      console.error('Error fetching classifications:', error);
    }
  };


  useEffect(() => {
    fetchInventoryData();
    fetchClassifications();
  }, [fetchInventoryData]);

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
      const nameMatch = (item.generic_name?.toLowerCase().includes(searchLower) || item.brand_name?.toLowerCase().includes(searchLower));
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
      case 'discontinued': return 'status-badge discontinued';
      default: return 'status-badge available';
    }
  };

  const renderDataTable = () => (
    <div className="data-table">
      <table>
        <thead>
          <tr>
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
          {sortedAndFilteredItems.map((item) => (
            <tr key={item.id}>
              <td>{item.generic_name}</td>
              <td>{item.brand_name}</td>
              <td>{item.category}</td>
              <td>{item.stock_quantity} {item.unit_of_measurement}</td>
              <td>{item.expiration_date}</td>
              <td>
                <span className={getStatusBadgeClass(item.status)}>
                  {item.status.replace(/_/g, ' ')}
                </span>
              </td>
              <td>
                <div className="table-actions">
                  <button className="btn-icon" title="View" onClick={() => { setSelectedItem(item); setIsViewModalOpen(true); }}>
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/>
                      <circle cx="12" cy="12" r="3"/>
                    </svg>
                  </button>
                  <button className="btn-icon" title="Edit" onClick={() => { setSelectedItem(item); setIsEditModalOpen(true); }}>
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/>
                      <path d="m18.5 2.5a2.12 2.12 0 0 1 3 3L12 15l-4 1 1-4Z"/>
                    </svg>
                  </button>
                  <button className="btn-icon danger" title="Archive" onClick={() => { setSelectedItem(item); setIsArchiveModalOpen(true); }}>
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <rect width="20" height="5" x="2" y="3" rx="1"/>
                      <path d="m4 8 16 0"/>
                      <path d="m6 8 0 13a2 2 0 0 0 2 2h8a2 2 0 0 0 2-2l0-13"/>
                      <path d="m8 8 0-2a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2l0 2"/>
                    </svg>
                  </button>
                </div>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
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
      />}
    </div>
  );
};

export default InventoryPage;
