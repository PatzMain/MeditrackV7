-- Create users table
CREATE TABLE IF NOT EXISTS users (
  id SERIAL PRIMARY KEY,
  username VARCHAR(50) UNIQUE NOT NULL,
  password VARCHAR(255) NOT NULL,
  role VARCHAR(20) DEFAULT 'admin' CHECK (role IN ('admin', 'superadmin')),
  first_name VARCHAR(100),
  last_name VARCHAR(100),
  phone VARCHAR(20),
  department VARCHAR(100),
  position VARCHAR(100),
  employee_id VARCHAR(50) UNIQUE,
  license_number VARCHAR(100),
  specialization TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create user_activity table for logging
CREATE TABLE IF NOT EXISTS user_activity (
  id SERIAL PRIMARY KEY,
  user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
  action VARCHAR(50) NOT NULL,
  category VARCHAR(100),
  description TEXT,
  timestamp TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  ip_address INET,
  user_agent TEXT,
  severity VARCHAR(20) CHECK (severity IN ('info', 'warning', 'error')) DEFAULT 'info',
  details JSONB
);

-- Create patients table
CREATE TABLE IF NOT EXISTS patients (
  id SERIAL PRIMARY KEY,
  patient_id VARCHAR(20) UNIQUE NOT NULL,
  first_name VARCHAR(100) NOT NULL,
  last_name VARCHAR(100) NOT NULL,
  phone VARCHAR(20),
  date_of_birth DATE NOT NULL,
  gender VARCHAR(10) CHECK (gender IN ('male', 'female', 'other')) NOT NULL,
  address TEXT,
  emergency_contact VARCHAR(255),
  blood_type VARCHAR(5),
  allergies TEXT,
  medical_history TEXT,
  current_medications TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create consultations table
CREATE TABLE IF NOT EXISTS consultations (
  id SERIAL PRIMARY KEY,
  patient_id INTEGER REFERENCES patients(id) ON DELETE CASCADE,
  doctor_id INTEGER REFERENCES users(id) ON DELETE SET NULL,
  consultation_date TIMESTAMP WITH TIME ZONE NOT NULL,
  symptoms TEXT NOT NULL,
  diagnosis TEXT,
  treatment_plan TEXT,
  notes TEXT,
  vital_signs JSONB,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create medical_records table
CREATE TABLE IF NOT EXISTS medical_records (
  id SERIAL PRIMARY KEY,
  patient_id INTEGER REFERENCES patients(id) ON DELETE CASCADE,
  consultation_id INTEGER REFERENCES consultations(id) ON DELETE SET NULL,
  record_type VARCHAR(20) CHECK (record_type IN ('lab_result', 'prescription', 'imaging', 'procedure', 'note')) NOT NULL,
  title VARCHAR(255) NOT NULL,
  description TEXT NOT NULL,
  file_url TEXT,
  created_by INTEGER REFERENCES users(id) ON DELETE SET NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create inventory_items table
CREATE TABLE IF NOT EXISTS inventory_items (
  id SERIAL PRIMARY KEY,
  name VARCHAR(255) NOT NULL,
  category VARCHAR(20) CHECK (category IN ('medicine', 'supply', 'equipment')) NOT NULL,
  description TEXT,
  quantity INTEGER NOT NULL DEFAULT 0,
  unit VARCHAR(20) NOT NULL,
  price DECIMAL(10,2) NOT NULL DEFAULT 0,
  supplier VARCHAR(255),
  expiry_date DATE,
  batch_number VARCHAR(100),
  location VARCHAR(255),
  minimum_stock INTEGER NOT NULL DEFAULT 0,
  status VARCHAR(20) CHECK (status IN ('available', 'low_stock', 'expired', 'out_of_stock', 'archived')) DEFAULT 'available',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create updated_at triggers
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Apply triggers to tables that need them
DROP TRIGGER IF EXISTS update_users_updated_at ON users;
CREATE TRIGGER update_users_updated_at BEFORE UPDATE ON users FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_patients_updated_at ON patients;
CREATE TRIGGER update_patients_updated_at BEFORE UPDATE ON patients FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_consultations_updated_at ON consultations;
CREATE TRIGGER update_consultations_updated_at BEFORE UPDATE ON consultations FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_medical_records_updated_at ON medical_records;
CREATE TRIGGER update_medical_records_updated_at BEFORE UPDATE ON medical_records FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_inventory_items_updated_at ON inventory_items;
CREATE TRIGGER update_inventory_items_updated_at BEFORE UPDATE ON inventory_items FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_user_activity_user_id ON user_activity(user_id);
CREATE INDEX IF NOT EXISTS idx_user_activity_timestamp ON user_activity(timestamp);
CREATE INDEX IF NOT EXISTS idx_user_activity_action ON user_activity(action);
CREATE INDEX IF NOT EXISTS idx_patients_patient_id ON patients(patient_id);
CREATE INDEX IF NOT EXISTS idx_patients_name ON patients(last_name, first_name);
CREATE INDEX IF NOT EXISTS idx_consultations_patient_id ON consultations(patient_id);
CREATE INDEX IF NOT EXISTS idx_consultations_doctor_id ON consultations(doctor_id);
CREATE INDEX IF NOT EXISTS idx_consultations_date ON consultations(consultation_date);
CREATE INDEX IF NOT EXISTS idx_medical_records_patient_id ON medical_records(patient_id);
CREATE INDEX IF NOT EXISTS idx_medical_records_type ON medical_records(record_type);
CREATE INDEX IF NOT EXISTS idx_inventory_category ON inventory_items(category);
CREATE INDEX IF NOT EXISTS idx_inventory_status ON inventory_items(status);

-- Insert sample data
-- Sample users (admin/superadmin only)
INSERT INTO users (username, password, role, first_name, last_name, department, position, employee_id) VALUES
  ('admin', '$2b$10$example_hash_admin', 'admin', 'System', 'Administrator', 'IT', 'System Admin', 'EMP001'),
  ('superadmin', '$2b$10$example_hash_super', 'superadmin', 'Super', 'Administrator', 'Management', 'Super Admin', 'EMP002')
ON CONFLICT (username) DO NOTHING;

-- Sample patients
INSERT INTO patients (patient_id, first_name, last_name, date_of_birth, gender, phone, blood_type) VALUES
  ('P001', 'John', 'Doe', '1985-06-15', 'male', '(555) 123-4567', 'O+'),
  ('P002', 'Jane', 'Smith', '1990-03-22', 'female', '(555) 234-5678', 'A-'),
  ('P003', 'Robert', 'Johnson', '1978-11-08', 'male', '(555) 345-6789', 'B+'),
  ('P004', 'Emily', 'Davis', '1992-12-03', 'female', '(555) 456-7890', 'AB+'),
  ('P005', 'Michael', 'Wilson', '1980-09-20', 'male', '(555) 567-8901', 'O-')
ON CONFLICT (patient_id) DO NOTHING;

-- Sample inventory items
INSERT INTO inventory_items (name, category, description, quantity, unit, price, minimum_stock, status) VALUES
  ('Aspirin 100mg', 'medicine', 'Pain reliever and anti-inflammatory', 150, 'tablets', 0.50, 25, 'available'),
  ('Ibuprofen 200mg', 'medicine', 'Non-steroidal anti-inflammatory drug', 200, 'tablets', 0.75, 30, 'available'),
  ('Paracetamol 500mg', 'medicine', 'Pain reliever and fever reducer', 180, 'tablets', 0.40, 35, 'available'),
  ('Surgical Masks', 'supply', 'Disposable surgical masks', 500, 'pieces', 1.25, 100, 'available'),
  ('Nitrile Gloves', 'supply', 'Medical examination gloves', 300, 'pairs', 0.85, 50, 'available'),
  ('Gauze Pads 4x4', 'supply', 'Sterile gauze pads', 120, 'pieces', 2.50, 20, 'available'),
  ('Digital Thermometer', 'equipment', 'Non-contact infrared thermometer', 5, 'units', 45.00, 2, 'available'),
  ('Blood Pressure Monitor', 'equipment', 'Digital blood pressure monitor', 3, 'units', 120.00, 1, 'available'),
  ('Stethoscope', 'equipment', 'Medical stethoscope', 8, 'units', 85.00, 3, 'available'),
  ('Bandages 2inch', 'supply', 'Elastic bandages', 75, 'rolls', 3.50, 20, 'available'),
  ('Face Masks N95', 'supply', 'N95 respirator masks', 15, 'boxes', 25.00, 25, 'low_stock'),
  ('Antiseptic Solution', 'medicine', 'Wound cleaning solution', 45, 'bottles', 8.50, 10, 'available')
ON CONFLICT DO NOTHING;