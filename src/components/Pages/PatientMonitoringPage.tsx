import React, { useState, useEffect } from 'react';
import { patientService, consultationService, medicalRecordService } from '../../services/supabaseService';
import './PatientMonitoringPage.css';
import './PagesStyles.css';
import '../Modals/ModalStyles.css';
import ConsultationFormModal from '../Modals/ConsultationFormModal';
import AddPatientModal from '../Modals/AddPatientModal';
import AddMedicalRecordModal from '../Modals/AddMedicalRecordModal';

const PatientMonitoringPage: React.FC = () => {
  const [activeTab, setActiveTab] = useState('personal');
  const [patients, setPatients] = useState<any[]>([]);
  const [consultations, setConsultations] = useState<any[]>([]);
  const [medicalRecords, setMedicalRecords] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [isConsultationModalOpen, setIsConsultationModalOpen] = useState(false);
  const [selectedPatient, setSelectedPatient] = useState<any | null>(null);
  const [isAddPatientModalOpen, setIsAddPatientModalOpen] = useState(false);
  const [isAddRecordModalOpen, setIsAddRecordModalOpen] = useState(false);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      setLoading(true);
      const [patientsData, consultationsData, medicalRecordsData] = await Promise.all([
        patientService.getPatients(),
        consultationService.getConsultations(),
        medicalRecordService.getMedicalRecords()
      ]);

      setPatients(patientsData || []);
      setConsultations(consultationsData || []);
      setMedicalRecords(medicalRecordsData || []);
    } catch (error) {
      console.error('Error fetching data:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleNewConsultation = (patient: any) => {
    setSelectedPatient(patient);
    setIsConsultationModalOpen(true);
  };

  const handleConsultationSave = async (consultationData: any) => {
    try {
      await consultationService.createConsultation(consultationData);
      await fetchData(); // Refresh data
      setIsConsultationModalOpen(false);
    } catch (error) {
      console.error('Error saving consultation:', error);
    }
  };

  const calculateAge = (dateOfBirth: string) => {
    if (!dateOfBirth) return 'N/A';
    const today = new Date();
    const birthDate = new Date(dateOfBirth);
    let age = today.getFullYear() - birthDate.getFullYear();
    const monthDiff = today.getMonth() - birthDate.getMonth();
    if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
      age--;
    }
    return age;
  };

  const filteredPatients = patients.filter(patient =>
    !searchTerm ||
    `${patient.first_name} ${patient.last_name}`.toLowerCase().includes(searchTerm.toLowerCase()) ||
    patient.patient_id?.toString().includes(searchTerm) ||
    patient.phone?.includes(searchTerm)
  );

  const renderConsultations = () => (
    <div className="tab-content">
      <div className="table-header">
        <h3>Consultations</h3>
        <div className="table-actions">
          <button className="btn-primary" onClick={() => setIsConsultationModalOpen(true)}>
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
              <line x1="12" y1="5" x2="12" y2="19" stroke="currentColor" strokeWidth="2"/>
              <line x1="5" y1="12" x2="19" y2="12" stroke="currentColor" strokeWidth="2"/>
            </svg>
            New Consultation
          </button>
        </div>
      </div>

      <div className="data-table">
        <table>
          <thead>
            <tr>
              <th>Case Number</th>
              <th>Date & Time</th>
              <th>Patient</th>
              <th>Type</th>
              <th>Chief Complaint</th>
              <th>Diagnosis</th>
              <th>Status</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {consultations.length === 0 ? (
              <tr>
                <td colSpan={8} style={{ textAlign: 'center', padding: '2rem', color: '#6b7280' }}>
                  No consultations available.
                </td>
              </tr>
            ) : (
              consultations.map((consultation) => (
                <tr key={consultation.id}>
                  <td>
                    <span className="case-number">
                      {consultation.case_number || `CSE-${consultation.id?.toString().padStart(6, '0')}`}
                    </span>
                  </td>
                  <td>
                    <div className="consultation-datetime">
                      <div className="date">
                        {consultation.consultation_date ?
                          new Date(consultation.consultation_date).toLocaleDateString() :
                          'N/A'
                        }
                      </div>
                      <div className="time">{consultation.time_in || 'N/A'}</div>
                    </div>
                  </td>
                  <td>
                    <div className="patient-info">
                      <div className="name">
                        {consultation.patients ?
                          `${consultation.patients.first_name} ${consultation.patients.last_name}` :
                          'Unknown Patient'
                        }
                      </div>
                      <div className="patient-id">
                        {consultation.patients?.patient_id}
                      </div>
                    </div>
                  </td>
                  <td>
                    <span className={`patient-type-badge ${consultation.patient_type || 'unknown'}`}>
                      {(consultation.patient_type || 'N/A').charAt(0).toUpperCase() + (consultation.patient_type || 'N/A').slice(1)}
                    </span>
                  </td>
                  <td className="chief-complaint">
                    {consultation.chief_complaint || consultation.symptoms || 'Not specified'}
                  </td>
                  <td>{consultation.diagnosis || 'Pending'}</td>
                  <td>
                    <span className={`status-badge ${consultation.consultation_status || (consultation.diagnosis ? 'completed' : 'pending')}`}>
                      {consultation.consultation_status ?
                        consultation.consultation_status.replace('_', ' ').replace(/\b\w/g, (l: string) => l.toUpperCase()) :
                        (consultation.diagnosis ? 'Completed' : 'In Progress')
                      }
                    </span>
                  </td>
                  <td>
                    <div className="table-actions">
                      <button className="btn-icon" title="View Details">
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
                          <path d="M1 12S5 4 12 4s11 8 11 8-4 8-11 8S1 12 1 12z" stroke="currentColor" strokeWidth="2"/>
                          <circle cx="12" cy="12" r="3" stroke="currentColor" strokeWidth="2"/>
                        </svg>
                      </button>
                      <button className="btn-icon" title="Edit">
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
                          <path d="M17 3a2.85 2.84 0 1 1 4 4L7.5 20.5 2 22l1.5-5.5L17 3z" stroke="currentColor" strokeWidth="2"/>
                        </svg>
                      </button>
                      <button className="btn-icon" title="Print Form">
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
                          <polyline points="6,9 6,2 18,2 18,9" stroke="currentColor" strokeWidth="2"/>
                          <path d="M6 18H4C3.46957 18 2.96086 17.7893 2.58579 17.4142C2.21071 17.0391 2 16.5304 2 16V11C2 10.4696 2.21071 9.96086 2.58579 9.58579C2.96086 9.21071 3.46957 9 4 9H20C20.5304 9 21.0391 9.21071 21.4142 9.58579C21.7893 9.96086 22 10.4696 22 11V16C22 16.5304 21.7893 17.0391 21.4142 17.4142C21.0391 17.7893 20.5304 18 20 18H18" stroke="currentColor" strokeWidth="2"/>
                          <polyline points="6,14 18,14 18,22 6,22 6,14" stroke="currentColor" strokeWidth="2"/>
                        </svg>
                      </button>
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );

  const renderPersonalInfo = () => (
    <div className="tab-content">
      <div className="table-header">
        <div className="search-container">
          <input
            type="text"
            placeholder="Search patients..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="search-input"
          />
        </div>
        <div className="table-actions">
          <button className="btn-primary" onClick={() => setIsAddPatientModalOpen(true)}>
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
              <line x1="12" y1="5" x2="12" y2="19" stroke="currentColor" strokeWidth="2"/>
              <line x1="5" y1="12" x2="19" y2="12" stroke="currentColor" strokeWidth="2"/>
            </svg>
            Add Patient
          </button>
        </div>
      </div>

      <div className="data-table">
        <table>
          <thead>
            <tr>
              <th>Patient ID</th>
              <th>Name</th>
              <th>Age</th>
              <th>Gender</th>
              <th>Phone</th>
              <th>Blood Type</th>
              <th>Last Updated</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {filteredPatients.length === 0 ? (
              <tr>
                <td colSpan={8} style={{ textAlign: 'center', padding: '2rem', color: '#6b7280' }}>
                  {searchTerm ? 'No patients found matching your search.' : 'No patients available.'}
                </td>
              </tr>
            ) : (
              filteredPatients.map((patient) => (
                <tr key={patient.id}>
                  <td>{patient.patient_id || 'N/A'}</td>
                  <td>
                    <div className="patient-name">
                      <div className="name">{patient.first_name || ''} {patient.last_name || ''}</div>
                    </div>
                  </td>
                  <td>{calculateAge(patient.date_of_birth)}</td>
                  <td className="capitalize">{patient.gender || 'N/A'}</td>
                  <td>{patient.phone || 'N/A'}</td>
                  <td>{patient.blood_type || 'Unknown'}</td>
                  <td>{patient.updated_at ? new Date(patient.updated_at).toLocaleDateString() : 'N/A'}</td>
                  <td>
                    <div className="table-actions">
                      <button className="btn-icon" title="View Details">
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
                          <path d="M1 12S5 4 12 4s11 8 11 8-4 8-11 8S1 12 1 12z" stroke="currentColor" strokeWidth="2"/>
                          <circle cx="12" cy="12" r="3" stroke="currentColor" strokeWidth="2"/>
                        </svg>
                      </button>
                      <button className="btn-icon" title="Edit">
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
                          <path d="M17 3a2.85 2.84 0 1 1 4 4L7.5 20.5 2 22l1.5-5.5L17 3z" stroke="currentColor" strokeWidth="2"/>
                        </svg>
                      </button>
                      <button
                        className="btn-icon consultation-btn"
                        title="New Consultation"
                        onClick={() => handleNewConsultation(patient)}
                      >
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
                          <path d="M22 12H18L15 21L9 3L6 12H2" stroke="currentColor" strokeWidth="2"/>
                        </svg>
                      </button>
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );

  const renderMedicalRecords = () => (
    <div className="tab-content">
      <div className="table-header">
        <h3>Medical Records</h3>
        <div className="table-actions">
          <button className="btn-primary" onClick={() => setIsAddRecordModalOpen(true)}>
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
              <line x1="12" y1="5" x2="12" y2="19" stroke="currentColor" strokeWidth="2"/>
              <line x1="5" y1="12" x2="19" y2="12" stroke="currentColor" strokeWidth="2"/>
            </svg>
            Add Record
          </button>
        </div>
      </div>

      <div className="data-table">
        <table>
          <thead>
            <tr>
              <th>Record ID</th>
              <th>Patient</th>
              <th>Type</th>
              <th>Date</th>
              <th>Description</th>
              <th>Provider</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {medicalRecords.length === 0 ? (
              <tr>
                <td colSpan={7} style={{ textAlign: 'center', padding: '2rem', color: '#6b7280' }}>
                  No medical records available.
                </td>
              </tr>
            ) : (
              medicalRecords.map((record) => (
                <tr key={record.id}>
                  <td>#{record.id?.toString().padStart(6, '0')}</td>
                  <td>
                    <div className="patient-info">
                      <div className="name">
                        {record.patients ?
                          `${record.patients.first_name} ${record.patients.last_name}` :
                          'Unknown Patient'
                        }
                      </div>
                      <div className="patient-id">
                        {record.patients?.patient_id}
                      </div>
                    </div>
                  </td>
                  <td>
                    <span className={`record-type-badge ${record.record_type || 'general'}`}>
                      {(record.record_type || 'General').charAt(0).toUpperCase() + (record.record_type || 'General').slice(1)}
                    </span>
                  </td>
                  <td>
                    {record.record_date ? new Date(record.record_date).toLocaleDateString() : 'N/A'}
                  </td>
                  <td className="record-description">
                    {record.description || record.notes || 'No description'}
                  </td>
                  <td>
                    {record.users ?
                      `${record.users.first_name || ''} ${record.users.last_name || ''}`.trim() || record.users.username :
                      'Unknown'
                    }
                  </td>
                  <td>
                    <div className="table-actions">
                      <button className="btn-icon" title="View Details">
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
                          <path d="M1 12S5 4 12 4s11 8 11 8-4 8-11 8S1 12 1 12z" stroke="currentColor" strokeWidth="2"/>
                          <circle cx="12" cy="12" r="3" stroke="currentColor" strokeWidth="2"/>
                        </svg>
                      </button>
                      <button className="btn-icon" title="Edit">
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
                          <path d="M17 3a2.85 2.84 0 1 1 4 4L7.5 20.5 2 22l1.5-5.5L17 3z" stroke="currentColor" strokeWidth="2"/>
                        </svg>
                      </button>
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );

  const renderTabContent = () => {
    if (loading) {
      return <div className="loading-message">Loading patient data...</div>;
    }

    switch (activeTab) {
      case 'personal':
        return renderPersonalInfo();
      case 'consultations':
        return renderConsultations();
      case 'medical':
        return renderMedicalRecords();
      default:
        return renderPersonalInfo();
    }
  };

  return (
    <div className="page-container">
      <div className="page-header">
        <h1 className="page-title">Patient Monitoring</h1>
        <p className="page-subtitle">Comprehensive patient management with consultation forms and medical records</p>
      </div>

      <div className="tabs-container">
        <div className="tabs-header">
          <button
            className={`tab-button ${activeTab === 'personal' ? 'active' : ''}`}
            onClick={() => setActiveTab('personal')}
          >
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
              <path d="M20 21V19C20 17.9391 19.5786 16.9217 18.8284 16.1716C18.0783 15.4214 17.0609 15 16 15H8C6.93913 15 5.92172 15.4214 5.17157 16.1716C4.42143 16.9217 4 17.9391 4 19V21" stroke="currentColor" strokeWidth="2"/>
              <circle cx="12" cy="7" r="4" stroke="currentColor" strokeWidth="2"/>
            </svg>
            Personal Information
          </button>
          <button
            className={`tab-button ${activeTab === 'consultations' ? 'active' : ''}`}
            onClick={() => setActiveTab('consultations')}
          >
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
              <path d="M22 12H18L15 21L9 3L6 12H2" stroke="currentColor" strokeWidth="2"/>
            </svg>
            Consultations
          </button>
          <button
            className={`tab-button ${activeTab === 'medical' ? 'active' : ''}`}
            onClick={() => setActiveTab('medical')}
          >
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
              <rect x="3" y="3" width="18" height="18" rx="2" ry="2" stroke="currentColor" strokeWidth="2"/>
              <path d="M12 8V16" stroke="currentColor" strokeWidth="2"/>
              <path d="M8 12H16" stroke="currentColor" strokeWidth="2"/>
            </svg>
            Medical Records
          </button>
        </div>

        <div className="tabs-content">
          {renderTabContent()}
        </div>
      </div>

      {isConsultationModalOpen && (
        <ConsultationFormModal
          isOpen={isConsultationModalOpen}
          patient={selectedPatient}
          onClose={() => setIsConsultationModalOpen(false)}
          onSave={handleConsultationSave}
        />
      )}

      <AddPatientModal
        isOpen={isAddPatientModalOpen}
        onClose={() => setIsAddPatientModalOpen(false)}
        onSave={fetchData}
      />

      <AddMedicalRecordModal
        isOpen={isAddRecordModalOpen}
        onClose={() => setIsAddRecordModalOpen(false)}
        onSave={fetchData}
      />
    </div>
  );
};

export default PatientMonitoringPage;