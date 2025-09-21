-- Comprehensive Consultation Form Database Schema
-- Based on CvSU UHSE-QF-01 Consultation Form
-- This creates a complete medical consultation system

-- Drop existing tables if they exist
DROP TABLE IF EXISTS consultation_interventions CASCADE;
DROP TABLE IF EXISTS consultation_soap_notes CASCADE;
DROP TABLE IF EXISTS consultation_assessments CASCADE;
DROP TABLE IF EXISTS consultation_vital_signs CASCADE;
DROP TABLE IF EXISTS consultation_glasgow_coma_scale CASCADE;
DROP TABLE IF EXISTS consultation_injuries CASCADE;
DROP TABLE IF EXISTS consultation_medical_history CASCADE;
DROP TABLE IF EXISTS consultation_family_history CASCADE;
DROP TABLE IF EXISTS consultation_allergies CASCADE;
DROP TABLE IF EXISTS consultations_enhanced CASCADE;
DROP TABLE IF EXISTS patient_emergency_contacts CASCADE;

-- Enhanced Patients table with additional fields from consultation form
ALTER TABLE patients ADD COLUMN IF NOT EXISTS civil_status VARCHAR(20);
ALTER TABLE patients ADD COLUMN IF NOT EXISTS course_department VARCHAR(100);
ALTER TABLE patients ADD COLUMN IF NOT EXISTS patient_type VARCHAR(20) CHECK (patient_type IN ('employee', 'dependent', 'student', 'opd'));
ALTER TABLE patients ADD COLUMN IF NOT EXISTS address TEXT;
ALTER TABLE patients ADD COLUMN IF NOT EXISTS emergency_contact_name VARCHAR(255);
ALTER TABLE patients ADD COLUMN IF NOT EXISTS emergency_contact_relationship VARCHAR(100);
ALTER TABLE patients ADD COLUMN IF NOT EXISTS emergency_contact_number VARCHAR(20);

-- Emergency Contacts table (separate from patients for multiple contacts)
CREATE TABLE patient_emergency_contacts (
    id SERIAL PRIMARY KEY,
    patient_id INTEGER REFERENCES patients(id) ON DELETE CASCADE,
    contact_name VARCHAR(255) NOT NULL,
    relationship VARCHAR(100) NOT NULL,
    contact_number VARCHAR(20) NOT NULL,
    is_primary BOOLEAN DEFAULT false,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Enhanced Consultations table
CREATE TABLE consultations_enhanced (
    id SERIAL PRIMARY KEY,
    case_number VARCHAR(50) UNIQUE NOT NULL,
    patient_id INTEGER REFERENCES patients(id) ON DELETE CASCADE,
    consultation_date DATE NOT NULL,
    time_in TIME NOT NULL,
    time_out TIME,

    -- Patient classification
    patient_type VARCHAR(20) CHECK (patient_type IN ('employee', 'dependent', 'student', 'opd')),
    course_department VARCHAR(100),

    -- Chief complaint and previous consultation
    chief_complaint TEXT NOT NULL,
    previous_consultation_date DATE,
    previous_diagnosis TEXT,
    previous_medications TEXT,
    previous_attending_physician VARCHAR(255),

    -- Current consultation
    mode_of_arrival VARCHAR(20) CHECK (mode_of_arrival IN ('ambulatory', 'assisted', 'cuddled_carried')),

    -- Valuables
    has_valuables BOOLEAN DEFAULT false,
    valuables_released_to VARCHAR(50),
    valuables_description TEXT,

    -- Pain and injury assessment
    patient_in_pain BOOLEAN DEFAULT false,
    pain_scale INTEGER CHECK (pain_scale >= 0 AND pain_scale <= 10),
    patient_with_injuries BOOLEAN DEFAULT false,

    -- Injury details
    nature_of_injury TEXT, -- NOI
    place_of_injury TEXT,  -- POI
    date_of_injury DATE,   -- DOI
    time_of_injury TIME,   -- TOI

    -- Documentation
    attending_physician_id INTEGER REFERENCES users(id),
    consultation_status VARCHAR(20) DEFAULT 'in_progress' CHECK (consultation_status IN ('in_progress', 'completed', 'cancelled')),

    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    created_by INTEGER REFERENCES users(id)
);

-- Allergies table
CREATE TABLE consultation_allergies (
    id SERIAL PRIMARY KEY,
    consultation_id INTEGER REFERENCES consultations_enhanced(id) ON DELETE CASCADE,
    allergy_type VARCHAR(20) CHECK (allergy_type IN ('food', 'drugs', 'others')),
    allergen VARCHAR(255) NOT NULL,
    reaction TEXT,
    severity VARCHAR(20) CHECK (severity IN ('mild', 'moderate', 'severe')),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Family History table
CREATE TABLE consultation_family_history (
    id SERIAL PRIMARY KEY,
    consultation_id INTEGER REFERENCES consultations_enhanced(id) ON DELETE CASCADE,
    condition_type VARCHAR(50) CHECK (condition_type IN ('ptb', 'cancer', 'diabetes', 'cardiovascular', 'others')),
    condition_name VARCHAR(255),
    family_member VARCHAR(100),
    notes TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Medical History table
CREATE TABLE consultation_medical_history (
    id SERIAL PRIMARY KEY,
    consultation_id INTEGER REFERENCES consultations_enhanced(id) ON DELETE CASCADE,
    condition_type VARCHAR(50) CHECK (condition_type IN ('seizure', 'cardio', 'neuro', 'asthma', 'ptb', 'surgery', 'obgyne', 'others')),
    condition_name VARCHAR(255),
    diagnosis_date DATE,
    treatment TEXT,
    current_status VARCHAR(50),
    notes TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Injury Details table
CREATE TABLE consultation_injuries (
    id SERIAL PRIMARY KEY,
    consultation_id INTEGER REFERENCES consultations_enhanced(id) ON DELETE CASCADE,
    injury_type VARCHAR(50) CHECK (injury_type IN ('abrasion', 'contusion', 'fracture', 'laceration', 'puncture', 'sprain', 'other')),
    injury_location VARCHAR(255),
    injury_description TEXT,
    body_part VARCHAR(100),
    severity VARCHAR(20) CHECK (severity IN ('minor', 'moderate', 'severe')),
    treatment_given TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Glasgow Coma Scale table
CREATE TABLE consultation_glasgow_coma_scale (
    id SERIAL PRIMARY KEY,
    consultation_id INTEGER REFERENCES consultations_enhanced(id) ON DELETE CASCADE,
    eye_response INTEGER CHECK (eye_response >= 1 AND eye_response <= 4) NOT NULL,
    verbal_response INTEGER CHECK (verbal_response >= 1 AND verbal_response <= 5) NOT NULL,
    motor_response INTEGER CHECK (motor_response >= 1 AND motor_response <= 6) NOT NULL,
    total_score INTEGER GENERATED ALWAYS AS (eye_response + verbal_response + motor_response) STORED,
    assessment_time TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    assessed_by INTEGER REFERENCES users(id),
    notes TEXT
);

-- Vital Signs table
CREATE TABLE consultation_vital_signs (
    id SERIAL PRIMARY KEY,
    consultation_id INTEGER REFERENCES consultations_enhanced(id) ON DELETE CASCADE,
    blood_pressure_systolic INTEGER,
    blood_pressure_diastolic INTEGER,
    temperature DECIMAL(4,1), -- in Celsius
    pulse_rate INTEGER,
    respiratory_rate INTEGER,
    height_cm DECIMAL(5,2),
    weight_kg DECIMAL(5,2),
    oxygen_saturation INTEGER CHECK (oxygen_saturation >= 0 AND oxygen_saturation <= 100),
    lmp DATE, -- Last Menstrual Period
    measurement_time TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    measured_by INTEGER REFERENCES users(id),
    notes TEXT
);

-- Assessment and SOAP Notes table
CREATE TABLE consultation_soap_notes (
    id SERIAL PRIMARY KEY,
    consultation_id INTEGER REFERENCES consultations_enhanced(id) ON DELETE CASCADE,
    subjective TEXT, -- Patient's description of symptoms
    objective TEXT,  -- Observable findings
    assessment TEXT, -- Clinical assessment/diagnosis
    plan TEXT,      -- Treatment plan
    diagnosis TEXT,
    doctors_orders TEXT,
    notes TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    created_by INTEGER REFERENCES users(id)
);

-- Interventions table
CREATE TABLE consultation_interventions (
    id SERIAL PRIMARY KEY,
    consultation_id INTEGER REFERENCES consultations_enhanced(id) ON DELETE CASCADE,
    intervention_type VARCHAR(50),
    intervention_description TEXT NOT NULL,
    medications_given TEXT,
    dosage VARCHAR(100),
    route_of_administration VARCHAR(50),
    time_administered TIMESTAMP,
    administered_by INTEGER REFERENCES users(id),
    patient_response TEXT,
    follow_up_required BOOLEAN DEFAULT false,
    follow_up_date DATE,
    notes TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Create indexes for better performance
CREATE INDEX idx_consultations_enhanced_patient_id ON consultations_enhanced(patient_id);
CREATE INDEX idx_consultations_enhanced_date ON consultations_enhanced(consultation_date);
CREATE INDEX idx_consultations_enhanced_case_number ON consultations_enhanced(case_number);
CREATE INDEX idx_consultations_enhanced_status ON consultations_enhanced(consultation_status);
CREATE INDEX idx_consultation_vital_signs_consultation_id ON consultation_vital_signs(consultation_id);
CREATE INDEX idx_consultation_soap_notes_consultation_id ON consultation_soap_notes(consultation_id);
CREATE INDEX idx_consultation_interventions_consultation_id ON consultation_interventions(consultation_id);

-- Create function to generate case numbers
CREATE OR REPLACE FUNCTION generate_case_number()
RETURNS TEXT AS $$
DECLARE
    current_date_str TEXT;
    sequence_num INTEGER;
    case_num TEXT;
BEGIN
    current_date_str := TO_CHAR(CURRENT_DATE, 'YYYYMMDD');

    -- Get the next sequence number for today
    SELECT COALESCE(MAX(CAST(SUBSTRING(case_number FROM 10) AS INTEGER)), 0) + 1
    INTO sequence_num
    FROM consultations_enhanced
    WHERE case_number LIKE current_date_str || '%';

    case_num := current_date_str || LPAD(sequence_num::TEXT, 3, '0');

    RETURN case_num;
END;
$$ LANGUAGE plpgsql;

-- Create function to automatically update timestamps
CREATE OR REPLACE FUNCTION update_consultation_timestamp()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create triggers for automatic timestamp updates
CREATE TRIGGER trigger_update_consultation_timestamp
    BEFORE UPDATE ON consultations_enhanced
    FOR EACH ROW
    EXECUTE FUNCTION update_consultation_timestamp();

CREATE TRIGGER trigger_update_soap_notes_timestamp
    BEFORE UPDATE ON consultation_soap_notes
    FOR EACH ROW
    EXECUTE FUNCTION update_consultation_timestamp();

-- Create view for comprehensive consultation data
CREATE VIEW consultation_complete_view AS
SELECT
    c.id,
    c.case_number,
    c.consultation_date,
    c.time_in,
    c.time_out,
    c.patient_type,
    c.course_department,
    c.chief_complaint,
    c.mode_of_arrival,
    c.patient_in_pain,
    c.pain_scale,
    c.patient_with_injuries,
    c.consultation_status,

    -- Patient information
    p.patient_id,
    p.first_name,
    p.last_name,
    p.date_of_birth,
    p.gender,
    p.phone,
    p.address,
    p.civil_status,
    p.emergency_contact_name,
    p.emergency_contact_relationship,
    p.emergency_contact_number,

    -- Attending physician
    u.username as attending_physician_username,
    CONCAT(u.first_name, ' ', u.last_name) as attending_physician_name,

    -- Latest vital signs
    vs.blood_pressure_systolic,
    vs.blood_pressure_diastolic,
    vs.temperature,
    vs.pulse_rate,
    vs.respiratory_rate,
    vs.height_cm,
    vs.weight_kg,
    vs.oxygen_saturation,
    vs.lmp,

    -- Latest SOAP notes
    soap.subjective,
    soap.objective,
    soap.assessment,
    soap.plan,
    soap.diagnosis,
    soap.doctors_orders,

    -- Glasgow Coma Scale
    gcs.eye_response,
    gcs.verbal_response,
    gcs.motor_response,
    gcs.total_score as gcs_total,

    c.created_at,
    c.updated_at

FROM consultations_enhanced c
LEFT JOIN patients p ON c.patient_id = p.id
LEFT JOIN users u ON c.attending_physician_id = u.id
LEFT JOIN LATERAL (
    SELECT * FROM consultation_vital_signs cvs
    WHERE cvs.consultation_id = c.id
    ORDER BY cvs.measurement_time DESC
    LIMIT 1
) vs ON true
LEFT JOIN LATERAL (
    SELECT * FROM consultation_soap_notes csn
    WHERE csn.consultation_id = c.id
    ORDER BY csn.updated_at DESC
    LIMIT 1
) soap ON true
LEFT JOIN LATERAL (
    SELECT * FROM consultation_glasgow_coma_scale cgcs
    WHERE cgcs.consultation_id = c.id
    ORDER BY cgcs.assessment_time DESC
    LIMIT 1
) gcs ON true
ORDER BY c.consultation_date DESC, c.time_in DESC;

-- Insert sample data for testing
-- Note: This assumes users and patients tables already exist

-- Sample consultation
INSERT INTO consultations_enhanced (
    case_number,
    patient_id,
    consultation_date,
    time_in,
    patient_type,
    course_department,
    chief_complaint,
    mode_of_arrival,
    patient_in_pain,
    pain_scale,
    patient_with_injuries,
    attending_physician_id,
    created_by
) VALUES (
    generate_case_number(),
    1, -- Assuming patient ID 1 exists
    CURRENT_DATE,
    CURRENT_TIME,
    'student',
    'Computer Science',
    'Headache and fever for 2 days',
    'ambulatory',
    true,
    5,
    false,
    1, -- Assuming user ID 1 exists
    1
);

-- Sample vital signs
INSERT INTO consultation_vital_signs (
    consultation_id,
    blood_pressure_systolic,
    blood_pressure_diastolic,
    temperature,
    pulse_rate,
    respiratory_rate,
    height_cm,
    weight_kg,
    oxygen_saturation,
    measured_by
) VALUES (
    1, -- Assuming consultation ID 1 was just created
    120,
    80,
    38.5,
    85,
    18,
    165.0,
    65.5,
    98,
    1
);

-- Sample Glasgow Coma Scale
INSERT INTO consultation_glasgow_coma_scale (
    consultation_id,
    eye_response,
    verbal_response,
    motor_response,
    assessed_by
) VALUES (
    1,
    4, -- Opens spontaneously
    5, -- Oriented
    6, -- Obeys commands
    1
);

-- Sample SOAP notes
INSERT INTO consultation_soap_notes (
    consultation_id,
    subjective,
    objective,
    assessment,
    plan,
    diagnosis,
    created_by
) VALUES (
    1,
    'Patient complains of headache and fever for 2 days. Reports difficulty concentrating and mild nausea.',
    'Temperature 38.5°C, BP 120/80, HR 85, RR 18. Patient appears alert and oriented. No signs of dehydration.',
    'Viral syndrome vs. tension headache with fever',
    'Symptomatic treatment with paracetamol, adequate hydration, rest. Follow-up if symptoms worsen.',
    'Viral syndrome',
    1
);

-- Sample intervention
INSERT INTO consultation_interventions (
    consultation_id,
    intervention_type,
    intervention_description,
    medications_given,
    dosage,
    route_of_administration,
    administered_by
) VALUES (
    1,
    'medication',
    'Administered paracetamol for fever and headache',
    'Paracetamol',
    '500mg',
    'oral',
    1
);

-- Add comments for documentation
COMMENT ON TABLE consultations_enhanced IS 'Enhanced consultation table based on CvSU consultation form with comprehensive medical data';
COMMENT ON TABLE consultation_vital_signs IS 'Vital signs measurements during consultation';
COMMENT ON TABLE consultation_glasgow_coma_scale IS 'Glasgow Coma Scale assessments for neurological evaluation';
COMMENT ON TABLE consultation_soap_notes IS 'SOAP format documentation for clinical notes';
COMMENT ON TABLE consultation_interventions IS 'Medical interventions and treatments provided during consultation';
COMMENT ON VIEW consultation_complete_view IS 'Comprehensive view combining all consultation-related data for easy frontend consumption';