import React, { useState, useEffect } from 'react';
import './Modal.css';

interface EditInventoryItemModalProps {
  item: any;
  onClose: () => void;
  onSave: (updatedItem: any) => void;
  classifications: any[];
}

const EditInventoryItemModal: React.FC<EditInventoryItemModalProps> = ({ item, onClose, onSave, classifications }) => {
  const [formData, setFormData] = useState<any>({});

  useEffect(() => {
    if (item) {
      setFormData(item);
    }
  }, [item]);

  if (!item) return null;

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
          <h2 className="modal-title">Edit Item - {item.generic_name}</h2>
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
              <input type="text" id="code" name="code" value={formData.code || ''} onChange={handleChange} required />
            </div>
            <div className="form-group">
              <label htmlFor="generic_name">Generic Name</label>
              <input type="text" id="generic_name" name="generic_name" value={formData.generic_name || ''} onChange={handleChange} required />
            </div>
            <div className="form-group">
              <label htmlFor="brand_name">Brand Name</label>
              <input type="text" id="brand_name" name="brand_name" value={formData.brand_name || ''} onChange={handleChange} required />
            </div>
            <div className="form-group">
              <label htmlFor="classification_id">Classification</label>
              <select id="classification_id" name="classification_id" value={formData.classification_id} onChange={handleChange}>
                {classifications.map(c => (
                  <option key={c.id} value={c.id}>{c.name}</option>
                ))}
              </select>
            </div>
            <div className="form-group">
              <label htmlFor="stock_quantity">Stock Quantity</label>
              <input type="number" id="stock_quantity" name="stock_quantity" value={formData.stock_quantity || 0} onChange={handleChange} required />
            </div>
            <div className="form-group">
              <label htmlFor="unit_of_measurement">Unit of Measurement</label>
              <input type="text" id="unit_of_measurement" name="unit_of_measurement" value={formData.unit_of_measurement || ''} onChange={handleChange} />
            </div>
            <div className="form-group">
              <label htmlFor="expiration_date">Expiration Date</label>
              <input type="date" id="expiration_date" name="expiration_date" value={formData.expiration_date || ''} onChange={handleChange} />
            </div>
            <div className="form-group">
              <label htmlFor="minimum_stock_level">Minimum Stock Level</label>
              <input type="number" id="minimum_stock_level" name="minimum_stock_level" value={formData.minimum_stock_level || 0} onChange={handleChange} />
            </div>
            <div className="form-group">
              <label htmlFor="maximum_stock_level">Maximum Stock Level</label>
              <input type="number" id="maximum_stock_level" name="maximum_stock_level" value={formData.maximum_stock_level || 0} onChange={handleChange} />
            </div>
            <div className="form-group">
              <label htmlFor="notes">Notes</label>
              <textarea id="notes" name="notes" value={formData.notes || ''} onChange={handleChange}></textarea>
            </div>
          </div>
          <div className="modal-footer">
            <button type="button" className="btn-secondary" onClick={onClose}>Cancel</button>
            <button type="submit" className="btn-primary">Save Changes</button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default EditInventoryItemModal;
