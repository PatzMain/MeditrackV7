import React, { useState, useEffect } from 'react';
import { medicalRecordService, patientService, activityService, authService } from '../../services/supabaseService';
import './ModalStyles.css';

interface AddMedicalRecordModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: () => void;
}

const AddMedicalRecordModal: React.FC<AddMedicalRecordModalProps> = ({ isOpen, onClose, onSave }) => {
  const [formData, setFormData] = useState({
    patient_id: '',
    record_type: '',
    title: '',
    description: '',
    notes: '',
    record_date: new Date().toISOString().split('T')[0],
    attachments: '',
    diagnosis: '',
    treatment: '',
    medications: '',
    follow_up_date: '',
    lab_results: '',
    vital_signs: ''
  });

  const [patients, setPatients] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (isOpen) {
      fetchPatients();
    }
  }, [isOpen]);

  const fetchPatients = async () => {
    try {
      const patientsData = await patientService.getPatients();
      setPatients(patientsData || []);
    } catch (error) {
      console.error('Error fetching patients:', error);
    }
  };

  if (!isOpen) return null;

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      const currentUser = authService.getCurrentUser();
      const recordData = {
        ...formData,
        patient_id: parseInt(formData.patient_id),
        created_by: currentUser?.id,
        updated_by: currentUser?.id
      };

      await medicalRecordService.createMedicalRecord(recordData);
      await activityService.logActivity({
        action: 'add',
        description: `Added new medical record: ${formData.title}`,
        category: 'medical_records'
      });

      onSave();
      onClose();
    } catch (error: any) {
      setError(error.message || 'Failed to add medical record');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-container" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <h2>Add Medical Record</h2>
          <button className="modal-close" onClick={onClose}>×</button>
        </div>

        <form onSubmit={handleSubmit}>
          <div style={{ padding: '1.5rem', maxHeight: '70vh', overflowY: 'auto' }}>
            {error && (
              <div style={{
                background: '#fee2e2',
                color: '#dc2626',
                padding: '0.75rem',
                borderRadius: '0.5rem',
                marginBottom: '1rem'
              }}>
                {error}
              </div>
            )}

            <div className="form-grid">
              <div className="form-group">
                <label>Patient *</label>
                <select
                  name="patient_id"
                  value={formData.patient_id}
                  onChange={handleChange}
                  required
                >
                  <option value="">Select Patient</option>
                  {patients.map(patient => (
                    <option key={patient.id} value={patient.id}>
                      {patient.patient_id} - {patient.first_name} {patient.last_name}
                    </option>
                  ))}
                </select>
              </div>

              <div className="form-group">
                <label>Record Type *</label>
                <select
                  name="record_type"
                  value={formData.record_type}
                  onChange={handleChange}
                  required
                >
                  <option value="">Select Type</option>
                  <option value="general">General</option>
                  <option value="consultation">Consultation</option>
                  <option value="lab_result">Lab Result</option>
                  <option value="prescription">Prescription</option>
                  <option value="imaging">Imaging</option>
                  <option value="procedure">Procedure</option>
                  <option value="vaccination">Vaccination</option>
                  <option value="allergy">Allergy Record</option>
                </select>
              </div>

              <div className="form-group">
                <label>Record Date *</label>
                <input
                  type="date"
                  name="record_date"
                  value={formData.record_date}
                  onChange={handleChange}
                  required
                />
              </div>
            </div>

            <div className="form-group">
              <label>Title *</label>
              <input
                type="text"
                name="title"
                value={formData.title}
                onChange={handleChange}
                required
                placeholder="e.g., Annual Checkup, Blood Test Results"
              />
            </div>

            <div className="form-group">
              <label>Description</label>
              <textarea
                name="description"
                value={formData.description}
                onChange={handleChange}
                rows={3}
                placeholder="Brief description of the medical record"
              />
            </div>

            {formData.record_type === 'consultation' && (
              <>
                <div className="form-group">
                  <label>Diagnosis</label>
                  <textarea
                    name="diagnosis"
                    value={formData.diagnosis}
                    onChange={handleChange}
                    rows={2}
                    placeholder="Medical diagnosis"
                  />
                </div>

                <div className="form-group">
                  <label>Treatment</label>
                  <textarea
                    name="treatment"
                    value={formData.treatment}
                    onChange={handleChange}
                    rows={2}
                    placeholder="Treatment plan"
                  />
                </div>

                <div className="form-group">
                  <label>Medications</label>
                  <textarea
                    name="medications"
                    value={formData.medications}
                    onChange={handleChange}
                    rows={2}
                    placeholder="Prescribed medications"
                  />
                </div>

                <div className="form-group">
                  <label>Vital Signs</label>
                  <textarea
                    name="vital_signs"
                    value={formData.vital_signs}
                    onChange={handleChange}
                    rows={2}
                    placeholder="e.g., BP: 120/80, Temp: 36.5°C, HR: 75 bpm"
                  />
                </div>

                <div className="form-group">
                  <label>Follow-up Date</label>
                  <input
                    type="date"
                    name="follow_up_date"
                    value={formData.follow_up_date}
                    onChange={handleChange}
                  />
                </div>
              </>
            )}

            {formData.record_type === 'lab_result' && (
              <div className="form-group">
                <label>Lab Results</label>
                <textarea
                  name="lab_results"
                  value={formData.lab_results}
                  onChange={handleChange}
                  rows={4}
                  placeholder="Laboratory test results and values"
                />
              </div>
            )}

            <div className="form-group">
              <label>Additional Notes</label>
              <textarea
                name="notes"
                value={formData.notes}
                onChange={handleChange}
                rows={3}
                placeholder="Any additional notes or observations"
              />
            </div>

            <div className="form-group">
              <label>Attachments</label>
              <input
                type="text"
                name="attachments"
                value={formData.attachments}
                onChange={handleChange}
                placeholder="File paths or URLs (comma-separated)"
              />
            </div>
          </div>

          <div className="modal-footer">
            <button type="button" className="btn-secondary" onClick={onClose} disabled={loading}>
              Cancel
            </button>
            <button type="submit" className="btn-primary" disabled={loading}>
              {loading ? 'Adding...' : 'Add Record'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default AddMedicalRecordModal;