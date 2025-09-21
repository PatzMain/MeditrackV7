import React, { useState, useEffect } from 'react';
import './ModalStyles.css';

interface ConsultationFormModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (consultationData: any) => void;
  patient?: any;
  consultation?: any;
}

const ConsultationFormModal: React.FC<ConsultationFormModalProps> = ({
  isOpen,
  onClose,
  onSave,
  patient,
  consultation
}) => {
  const [activeSection, setActiveSection] = useState('basic');
  const [formData, setFormData] = useState({
    // Basic Information
    caseNumber: '',
    consultationDate: new Date().toISOString().split('T')[0],
    timeIn: new Date().toTimeString().slice(0, 5),
    timeOut: '',
    patientType: 'student',
    courseDepartment: '',

    // Personal Data
    patientId: patient?.id || '',
    chiefComplaint: '',

    // Previous Consultation
    previousConsultationDate: '',
    previousDiagnosis: '',
    previousMedications: '',
    previousAttendingPhysician: '',

    // Emergency Contact
    emergencyContactName: '',
    emergencyContactRelationship: '',
    emergencyContactNumber: '',

    // Assessment
    modeOfArrival: 'ambulatory',
    hasValuables: false,
    valuablesReleasedTo: '',
    valuablesDescription: '',
    patientInPain: false,
    painScale: 0,
    patientWithInjuries: false,

    // Vital Signs
    bloodPressureSystolic: '',
    bloodPressureDiastolic: '',
    temperature: '',
    pulseRate: '',
    respiratoryRate: '',
    heightCm: '',
    weightKg: '',
    oxygenSaturation: '',
    lmp: '',

    // Injuries
    injuries: [],
    natureOfInjury: '',
    placeOfInjury: '',
    dateOfInjury: '',
    timeOfInjury: '',

    // Glasgow Coma Scale
    eyeResponse: 4,
    verbalResponse: 5,
    motorResponse: 6,

    // Medical History
    allergies: [],
    familyHistory: [],
    medicalHistory: [],

    // SOAP Notes
    subjective: '',
    objective: '',
    assessment: '',
    plan: '',
    diagnosis: '',
    doctorsOrders: '',

    // Interventions
    interventions: '',
    attendingPhysician: ''
  });

  useEffect(() => {
    if (patient) {
      setFormData(prev => ({
        ...prev,
        patientId: patient.id,
        emergencyContactName: patient.emergency_contact_name || '',
        emergencyContactRelationship: patient.emergency_contact_relationship || '',
        emergencyContactNumber: patient.emergency_contact_number || ''
      }));
    }
  }, [patient]);

  const handleInputChange = (field: string, value: any) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleArrayFieldAdd = (field: string, item: any) => {
    setFormData(prev => ({
      ...prev,
      [field]: [...(prev[field as keyof typeof prev] as any[]), item]
    }));
  };

  const handleArrayFieldRemove = (field: string, index: number) => {
    setFormData(prev => ({
      ...prev,
      [field]: (prev[field as keyof typeof prev] as any[]).filter((_, i) => i !== index)
    }));
  };

  const renderBasicInformation = () => (
    <div className="form-section">
      <h3>Basic Information</h3>
      <div className="form-grid">
        <div className="form-group">
          <label>Case Number</label>
          <input
            type="text"
            value={formData.caseNumber}
            onChange={(e) => handleInputChange('caseNumber', e.target.value)}
            placeholder="Auto-generated"
          />
        </div>
        <div className="form-group">
          <label>Date</label>
          <input
            type="date"
            value={formData.consultationDate}
            onChange={(e) => handleInputChange('consultationDate', e.target.value)}
          />
        </div>
        <div className="form-group">
          <label>Time In</label>
          <input
            type="time"
            value={formData.timeIn}
            onChange={(e) => handleInputChange('timeIn', e.target.value)}
          />
        </div>
        <div className="form-group">
          <label>Time Out</label>
          <input
            type="time"
            value={formData.timeOut}
            onChange={(e) => handleInputChange('timeOut', e.target.value)}
          />
        </div>
      </div>

      <div className="form-group">
        <label>Patient Type</label>
        <div className="radio-group">
          {['employee', 'dependent', 'student', 'opd'].map(type => (
            <label key={type} className="radio-label">
              <input
                type="radio"
                name="patientType"
                value={type}
                checked={formData.patientType === type}
                onChange={(e) => handleInputChange('patientType', e.target.value)}
              />
              {type.charAt(0).toUpperCase() + type.slice(1)}
            </label>
          ))}
        </div>
      </div>

      <div className="form-group">
        <label>Course/Department</label>
        <input
          type="text"
          value={formData.courseDepartment}
          onChange={(e) => handleInputChange('courseDepartment', e.target.value)}
        />
      </div>

      <div className="form-group">
        <label>Chief Complaint</label>
        <textarea
          value={formData.chiefComplaint}
          onChange={(e) => handleInputChange('chiefComplaint', e.target.value)}
          rows={3}
          placeholder="Patient's main concern or reason for visit"
        />
      </div>
    </div>
  );

  const renderEmergencyContact = () => (
    <div className="form-section">
      <h3>Emergency Contact & Previous Consultation</h3>
      <div className="form-grid">
        <div className="form-group">
          <label>Emergency Contact Name</label>
          <input
            type="text"
            value={formData.emergencyContactName}
            onChange={(e) => handleInputChange('emergencyContactName', e.target.value)}
          />
        </div>
        <div className="form-group">
          <label>Relationship</label>
          <input
            type="text"
            value={formData.emergencyContactRelationship}
            onChange={(e) => handleInputChange('emergencyContactRelationship', e.target.value)}
          />
        </div>
        <div className="form-group">
          <label>Contact Number</label>
          <input
            type="tel"
            value={formData.emergencyContactNumber}
            onChange={(e) => handleInputChange('emergencyContactNumber', e.target.value)}
          />
        </div>
      </div>

      <h4>Previous Consultation</h4>
      <div className="form-grid">
        <div className="form-group">
          <label>Date</label>
          <input
            type="date"
            value={formData.previousConsultationDate}
            onChange={(e) => handleInputChange('previousConsultationDate', e.target.value)}
          />
        </div>
        <div className="form-group">
          <label>Diagnosis</label>
          <input
            type="text"
            value={formData.previousDiagnosis}
            onChange={(e) => handleInputChange('previousDiagnosis', e.target.value)}
          />
        </div>
        <div className="form-group">
          <label>Medications</label>
          <input
            type="text"
            value={formData.previousMedications}
            onChange={(e) => handleInputChange('previousMedications', e.target.value)}
          />
        </div>
        <div className="form-group">
          <label>Attending Physician</label>
          <input
            type="text"
            value={formData.previousAttendingPhysician}
            onChange={(e) => handleInputChange('previousAttendingPhysician', e.target.value)}
          />
        </div>
      </div>
    </div>
  );

  const renderAssessment = () => (
    <div className="form-section">
      <h3>Assessment Section</h3>

      <div className="form-group">
        <label>Mode of Arrival</label>
        <div className="radio-group">
          {['ambulatory', 'assisted', 'cuddled_carried'].map(mode => (
            <label key={mode} className="radio-label">
              <input
                type="radio"
                name="modeOfArrival"
                value={mode}
                checked={formData.modeOfArrival === mode}
                onChange={(e) => handleInputChange('modeOfArrival', e.target.value)}
              />
              {mode.replace('_', '/').replace(/\b\w/g, (l: string) => l.toUpperCase())}
            </label>
          ))}
        </div>
      </div>

      <div className="form-group">
        <label className="checkbox-label">
          <input
            type="checkbox"
            checked={formData.hasValuables}
            onChange={(e) => handleInputChange('hasValuables', e.target.checked)}
          />
          Patient has valuables
        </label>
        {formData.hasValuables && (
          <div className="nested-form">
            <div className="form-grid">
              <div className="form-group">
                <label>Released to</label>
                <select
                  value={formData.valuablesReleasedTo}
                  onChange={(e) => handleInputChange('valuablesReleasedTo', e.target.value)}
                >
                  <option value="">Select...</option>
                  <option value="patient">Patient</option>
                  <option value="relatives">Relatives</option>
                  <option value="companion">Companion</option>
                  <option value="security">CvSU Security on Duty</option>
                </select>
              </div>
              <div className="form-group">
                <label>Description</label>
                <input
                  type="text"
                  value={formData.valuablesDescription}
                  onChange={(e) => handleInputChange('valuablesDescription', e.target.value)}
                />
              </div>
            </div>
          </div>
        )}
      </div>

      <div className="form-group">
        <label className="checkbox-label">
          <input
            type="checkbox"
            checked={formData.patientInPain}
            onChange={(e) => handleInputChange('patientInPain', e.target.checked)}
          />
          Patient in pain
        </label>
        {formData.patientInPain && (
          <div className="pain-scale">
            <label>Pain Scale (0-10)</label>
            <div className="pain-scale-container">
              <input
                type="range"
                min="0"
                max="10"
                value={formData.painScale}
                onChange={(e) => handleInputChange('painScale', parseInt(e.target.value))}
                className="pain-slider"
              />
              <div className="pain-faces">
                {[0, 2, 4, 6, 8, 10].map(num => (
                  <div key={num} className="pain-face">
                    <span className="pain-emoji">
                      {num === 0 ? '😊' : num <= 2 ? '🙂' : num <= 4 ? '😐' : num <= 6 ? '😟' : num <= 8 ? '😢' : '😭'}
                    </span>
                    <span className="pain-number">{num}</span>
                  </div>
                ))}
              </div>
              <div className="pain-value">Current: {formData.painScale}</div>
            </div>
          </div>
        )}
      </div>

      <div className="form-group">
        <label className="checkbox-label">
          <input
            type="checkbox"
            checked={formData.patientWithInjuries}
            onChange={(e) => handleInputChange('patientWithInjuries', e.target.checked)}
          />
          Patient with injuries
        </label>
        {formData.patientWithInjuries && (
          <div className="injury-details">
            <div className="injury-types">
              <label>Injury Types:</label>
              <div className="checkbox-group">
                {['abrasion', 'contusion', 'fracture', 'laceration', 'puncture', 'sprain', 'other'].map(type => (
                  <label key={type} className="checkbox-label">
                    <input
                      type="checkbox"
                      onChange={(e) => {
                        if (e.target.checked) {
                          handleArrayFieldAdd('injuries', type);
                        } else {
                          const injuries = formData.injuries as string[];
                          const index = injuries.indexOf(type);
                          if (index > -1) {
                            handleArrayFieldRemove('injuries', index);
                          }
                        }
                      }}
                    />
                    {type.charAt(0).toUpperCase() + type.slice(1)}
                  </label>
                ))}
              </div>
            </div>
            <div className="form-grid">
              <div className="form-group">
                <label>Nature of Injury (NOI)</label>
                <input
                  type="text"
                  value={formData.natureOfInjury}
                  onChange={(e) => handleInputChange('natureOfInjury', e.target.value)}
                />
              </div>
              <div className="form-group">
                <label>Place of Injury (POI)</label>
                <input
                  type="text"
                  value={formData.placeOfInjury}
                  onChange={(e) => handleInputChange('placeOfInjury', e.target.value)}
                />
              </div>
              <div className="form-group">
                <label>Date of Injury (DOI)</label>
                <input
                  type="date"
                  value={formData.dateOfInjury}
                  onChange={(e) => handleInputChange('dateOfInjury', e.target.value)}
                />
              </div>
              <div className="form-group">
                <label>Time of Injury (TOI)</label>
                <input
                  type="time"
                  value={formData.timeOfInjury}
                  onChange={(e) => handleInputChange('timeOfInjury', e.target.value)}
                />
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );

  const renderVitalSigns = () => (
    <div className="form-section">
      <h3>Vital Signs</h3>
      <div className="form-grid">
        <div className="form-group">
          <label>Blood Pressure (Systolic)</label>
          <input
            type="number"
            value={formData.bloodPressureSystolic}
            onChange={(e) => handleInputChange('bloodPressureSystolic', e.target.value)}
            placeholder="mmHg"
          />
        </div>
        <div className="form-group">
          <label>Blood Pressure (Diastolic)</label>
          <input
            type="number"
            value={formData.bloodPressureDiastolic}
            onChange={(e) => handleInputChange('bloodPressureDiastolic', e.target.value)}
            placeholder="mmHg"
          />
        </div>
        <div className="form-group">
          <label>Temperature</label>
          <input
            type="number"
            step="0.1"
            value={formData.temperature}
            onChange={(e) => handleInputChange('temperature', e.target.value)}
            placeholder="°C"
          />
        </div>
        <div className="form-group">
          <label>Pulse Rate</label>
          <input
            type="number"
            value={formData.pulseRate}
            onChange={(e) => handleInputChange('pulseRate', e.target.value)}
            placeholder="bpm"
          />
        </div>
        <div className="form-group">
          <label>Respiratory Rate</label>
          <input
            type="number"
            value={formData.respiratoryRate}
            onChange={(e) => handleInputChange('respiratoryRate', e.target.value)}
            placeholder="breaths/min"
          />
        </div>
        <div className="form-group">
          <label>Height</label>
          <input
            type="number"
            step="0.1"
            value={formData.heightCm}
            onChange={(e) => handleInputChange('heightCm', e.target.value)}
            placeholder="cm"
          />
        </div>
        <div className="form-group">
          <label>Weight</label>
          <input
            type="number"
            step="0.1"
            value={formData.weightKg}
            onChange={(e) => handleInputChange('weightKg', e.target.value)}
            placeholder="kg"
          />
        </div>
        <div className="form-group">
          <label>Oxygen Saturation</label>
          <input
            type="number"
            value={formData.oxygenSaturation}
            onChange={(e) => handleInputChange('oxygenSaturation', e.target.value)}
            placeholder="%"
          />
        </div>
        <div className="form-group">
          <label>LMP (Last Menstrual Period)</label>
          <input
            type="date"
            value={formData.lmp}
            onChange={(e) => handleInputChange('lmp', e.target.value)}
          />
        </div>
      </div>
    </div>
  );

  const renderGlasgowComaScale = () => (
    <div className="form-section">
      <h3>Glasgow Coma Scale</h3>
      <div className="gcs-container">
        <div className="gcs-category">
          <h4>Eye Response</h4>
          <div className="gcs-options">
            {[
              { value: 4, label: 'Opens Spontaneously' },
              { value: 3, label: 'Opens to Speech/Voice' },
              { value: 2, label: 'Opens to Pain' },
              { value: 1, label: 'No Response' }
            ].map(option => (
              <label key={option.value} className="radio-label">
                <input
                  type="radio"
                  name="eyeResponse"
                  value={option.value}
                  checked={formData.eyeResponse === option.value}
                  onChange={(e) => handleInputChange('eyeResponse', parseInt(e.target.value))}
                />
                <span className="gcs-score">{option.value}</span>
                {option.label}
              </label>
            ))}
          </div>
        </div>

        <div className="gcs-category">
          <h4>Verbal Response</h4>
          <div className="gcs-options">
            {[
              { value: 5, label: 'Oriented' },
              { value: 4, label: 'Confused' },
              { value: 3, label: 'Inappropriate Words' },
              { value: 2, label: 'Incomprehensible Words' },
              { value: 1, label: 'No Response' }
            ].map(option => (
              <label key={option.value} className="radio-label">
                <input
                  type="radio"
                  name="verbalResponse"
                  value={option.value}
                  checked={formData.verbalResponse === option.value}
                  onChange={(e) => handleInputChange('verbalResponse', parseInt(e.target.value))}
                />
                <span className="gcs-score">{option.value}</span>
                {option.label}
              </label>
            ))}
          </div>
        </div>

        <div className="gcs-category">
          <h4>Motor Response</h4>
          <div className="gcs-options">
            {[
              { value: 6, label: 'Obeys Commands' },
              { value: 5, label: 'Localizes Pain' },
              { value: 4, label: 'Withdrawal Signs' },
              { value: 3, label: 'Flexion to Pain' },
              { value: 2, label: 'Extension to Pain' },
              { value: 1, label: 'No Response' }
            ].map(option => (
              <label key={option.value} className="radio-label">
                <input
                  type="radio"
                  name="motorResponse"
                  value={option.value}
                  checked={formData.motorResponse === option.value}
                  onChange={(e) => handleInputChange('motorResponse', parseInt(e.target.value))}
                />
                <span className="gcs-score">{option.value}</span>
                {option.label}
              </label>
            ))}
          </div>
        </div>

        <div className="gcs-total">
          <h4>Total Score: {formData.eyeResponse + formData.verbalResponse + formData.motorResponse}</h4>
          <div className="gcs-interpretation">
            {(() => {
              const total = formData.eyeResponse + formData.verbalResponse + formData.motorResponse;
              if (total >= 13) return 'Mild brain injury';
              if (total >= 9) return 'Moderate brain injury';
              return 'Severe brain injury';
            })()}
          </div>
        </div>
      </div>
    </div>
  );

  const renderSOAPNotes = () => (
    <div className="form-section">
      <h3>SOAP Documentation</h3>
      <div className="soap-container">
        <div className="form-group">
          <label>Subjective (S)</label>
          <textarea
            value={formData.subjective}
            onChange={(e) => handleInputChange('subjective', e.target.value)}
            rows={3}
            placeholder="Patient's description of symptoms, feelings, and concerns"
          />
        </div>
        <div className="form-group">
          <label>Objective (O)</label>
          <textarea
            value={formData.objective}
            onChange={(e) => handleInputChange('objective', e.target.value)}
            rows={3}
            placeholder="Observable findings, vital signs, examination results"
          />
        </div>
        <div className="form-group">
          <label>Assessment (A)</label>
          <textarea
            value={formData.assessment}
            onChange={(e) => handleInputChange('assessment', e.target.value)}
            rows={3}
            placeholder="Clinical assessment, differential diagnosis"
          />
        </div>
        <div className="form-group">
          <label>Plan (P)</label>
          <textarea
            value={formData.plan}
            onChange={(e) => handleInputChange('plan', e.target.value)}
            rows={3}
            placeholder="Treatment plan, follow-up instructions"
          />
        </div>
        <div className="form-group">
          <label>Diagnosis</label>
          <input
            type="text"
            value={formData.diagnosis}
            onChange={(e) => handleInputChange('diagnosis', e.target.value)}
            placeholder="Final diagnosis"
          />
        </div>
        <div className="form-group">
          <label>Doctor's Orders</label>
          <textarea
            value={formData.doctorsOrders}
            onChange={(e) => handleInputChange('doctorsOrders', e.target.value)}
            rows={3}
            placeholder="Specific orders and instructions"
          />
        </div>
        <div className="form-group">
          <label>Interventions</label>
          <textarea
            value={formData.interventions}
            onChange={(e) => handleInputChange('interventions', e.target.value)}
            rows={3}
            placeholder="Interventions performed"
          />
        </div>
        <div className="form-group">
          <label>Attending Physician</label>
          <input
            type="text"
            value={formData.attendingPhysician}
            onChange={(e) => handleInputChange('attendingPhysician', e.target.value)}
            placeholder="Attending physician name"
          />
        </div>
      </div>
    </div>
  );

  const sections = [
    { id: 'basic', label: 'Basic Info', component: renderBasicInformation },
    { id: 'contact', label: 'Emergency Contact', component: renderEmergencyContact },
    { id: 'assessment', label: 'Assessment', component: renderAssessment },
    { id: 'vitals', label: 'Vital Signs', component: renderVitalSigns },
    { id: 'gcs', label: 'Glasgow Coma Scale', component: renderGlasgowComaScale },
    { id: 'soap', label: 'SOAP Notes', component: renderSOAPNotes }
  ];

  const handleSave = () => {
    onSave(formData);
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="modal-overlay">
      <div className="modal-container consultation-form-modal">
        <div className="modal-header">
          <h2>Consultation Form - {patient ? `${patient.first_name} ${patient.last_name}` : 'New Patient'}</h2>
          <button className="modal-close" onClick={onClose}>×</button>
        </div>

        <div className="consultation-form-content">
          <div className="section-tabs">
            {sections.map(section => (
              <button
                key={section.id}
                className={`section-tab ${activeSection === section.id ? 'active' : ''}`}
                onClick={() => setActiveSection(section.id)}
              >
                {section.label}
              </button>
            ))}
          </div>

          <div className="section-content">
            {sections.find(s => s.id === activeSection)?.component()}
          </div>
        </div>

        <div className="modal-footer">
          <button className="btn-secondary" onClick={onClose}>Cancel</button>
          <button className="btn-primary" onClick={handleSave}>Save Consultation</button>
        </div>
      </div>
    </div>
  );
};

export default ConsultationFormModal;