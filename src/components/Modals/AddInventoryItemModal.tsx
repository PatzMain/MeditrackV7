import React, { useState } from 'react';
import './Modal.css';

interface AddInventoryItemModalProps {
  onClose: () => void;
  onSave: (newItem: any) => void;
  department: string;
  classifications: any[];
  activeClassificationTab?: string;
}

const AddInventoryItemModal: React.FC<AddInventoryItemModalProps> = ({ onClose, onSave, department, classifications, activeClassificationTab }) => {

  // Filter classifications based on active tab
  const filteredClassifications = classifications.filter(c =>
    c.name.toLowerCase() === (activeClassificationTab || 'medicines')
  );

  const [formData, setFormData] = useState<any>({
    department,
    classification_id: filteredClassifications.length > 0 ? filteredClassifications[0].id : '',
    status: 'active'
  });


  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData((prev: any) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSave(formData);
  };

  return (
    <div className="modal-overlay">
      <div className="modal-content">
        <div className="modal-header">
          <h2 className="modal-title">Add New {(activeClassificationTab || 'item').charAt(0).toUpperCase() + (activeClassificationTab || 'item').slice(1)} - {department.charAt(0).toUpperCase() + department.slice(1)} Department</h2>
          <button className="modal-close-btn" onClick={onClose}>
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <line x1="18" y1="6" x2="6" y2="18"/>
              <line x1="6" y1="6" x2="18" y2="18"/>
            </svg>
          </button>
        </div>
        <form onSubmit={handleSubmit}>
          <div className="modal-body">
            <div className="form-group">
              <label htmlFor="code">Code</label>
              <input type="text" id="code" name="code" onChange={handleChange} />
            </div>
            <div className="form-group">
              <label htmlFor="generic_name">Generic Name</label>
              <input type="text" id="generic_name" name="generic_name" onChange={handleChange} required />
            </div>
            <div className="form-group">
              <label htmlFor="brand_name">Brand Name</label>
              <input type="text" id="brand_name" name="brand_name" onChange={handleChange} required />
            </div>
            <div className="form-group">
              <label htmlFor="category">Category</label>
              <input type="text" id="category" name="category" onChange={handleChange} />
            </div>
            {/* Hidden classification field - automatically set based on active tab */}
            <input type="hidden" name="classification_id" value={formData.classification_id} />
            <div className="form-group">
              <label htmlFor="stock_quantity">Stock Quantity</label>
              <input type="number" id="stock_quantity" name="stock_quantity" onChange={handleChange} required />
            </div>
            <div className="form-group">
              <label htmlFor="unit_of_measurement">Unit of Measurement</label>
              <input type="text" id="unit_of_measurement" name="unit_of_measurement" onChange={handleChange} />
            </div>
            <div className="form-group">
              <label htmlFor="expiration_date">Expiration Date</label>
              <input type="date" id="expiration_date" name="expiration_date" onChange={handleChange} />
            </div>
            <div className="form-group">
              <label htmlFor="minimum_stock_level">Minimum Stock Level</label>
              <input type="number" id="minimum_stock_level" name="minimum_stock_level" onChange={handleChange} />
            </div>
            <div className="form-group">
              <label htmlFor="notes">Notes</label>
              <textarea id="notes" name="notes" onChange={handleChange} placeholder="Additional notes or descriptions"></textarea>
            </div>
            <div className="form-group">
              <label htmlFor="status">Status</label>
              <select id="status" name="status" value={formData.status || 'active'} onChange={handleChange}>
                <option value="active">Active</option>
                <option value="low_stock">Low Stock</option>
                <option value="out_of_stock">Out of Stock</option>
                <option value="expired">Expired</option>
                <option value="maintenance">Maintenance</option>
              </select>
            </div>
          </div>
          <div className="modal-footer">
            <button type="button" className="btn-secondary" onClick={onClose}>Cancel</button>
            <button type="submit" className="btn-primary">Add Item</button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default AddInventoryItemModal;
