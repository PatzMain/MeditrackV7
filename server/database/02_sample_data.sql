-- Sample data for Meditrack application
-- Run this after schema.sql and inventory_update.sql

-- Additional sample patients
INSERT INTO patients (patient_id, first_name, last_name, date_of_birth, gender, phone, blood_type, allergies, medical_history) VALUES
  ('P006', 'Alice', 'Brown', '1988-07-12', 'female', '(555) 678-9012', 'A+', 'Peanuts', 'Asthma'),
  ('P007', 'David', 'Miller', '1975-02-28', 'male', '(555) 789-0123', 'O+', 'None', 'Diabetes Type 2'),
  ('P008', 'Sarah', 'Garcia', '1995-11-05', 'female', '(555) 890-1234', 'B-', 'Shellfish', 'None'),
  ('P009', 'James', 'Martinez', '1982-04-18', 'male', '(555) 901-2345', 'AB-', 'Latex', 'Hypertension'),
  ('P010', 'Lisa', 'Anderson', '1990-09-30', 'female', '(555) 012-3456', 'O-', 'Dust mites', 'Migraine')
ON CONFLICT (patient_id) DO NOTHING;

-- Sample consultations
INSERT INTO consultations (patient_id, doctor_id, consultation_date, symptoms, diagnosis, treatment_plan, notes, vital_signs) VALUES
  (1, 1, '2024-01-15 09:30:00', 'Chest pain, shortness of breath', 'Acute bronchitis', 'Rest, antibiotics, follow up in 1 week', 'Patient responding well to treatment', '{"bp": "120/80", "hr": "78", "temp": "98.6", "resp": "16"}'),
  (2, 2, '2024-01-15 14:00:00', 'Severe headache, nausea', 'Migraine', 'Pain medication, rest in dark room', 'Stress-related trigger identified', '{"bp": "110/70", "hr": "68", "temp": "98.2", "resp": "14"}'),
  (3, 1, '2024-01-16 10:15:00', 'Abdominal pain, fever', 'Gastroenteritis', 'Fluid replacement, bland diet', 'Symptoms improving', '{"bp": "115/75", "hr": "82", "temp": "100.2", "resp": "18"}'),
  (4, 2, '2024-01-16 16:30:00', 'Joint pain, stiffness', 'Rheumatoid arthritis flare', 'Anti-inflammatory medication, physical therapy', 'Continue current treatment plan', '{"bp": "125/85", "hr": "75", "temp": "98.8", "resp": "16"}'),
  (5, 1, '2024-01-17 11:00:00', 'Persistent cough, fatigue', 'Upper respiratory infection', 'Cough suppressant, rest', 'Patient advised to stay hydrated', '{"bp": "118/78", "hr": "80", "temp": "99.1", "resp": "17"}')
ON CONFLICT DO NOTHING;

-- Sample medical records
INSERT INTO medical_records (patient_id, consultation_id, record_type, title, description, created_by) VALUES
  (1, 1, 'lab_result', 'Blood Chemistry Panel', 'Complete metabolic panel results - all values within normal range', 1),
  (1, 1, 'prescription', 'Antibiotic Treatment', 'Amoxicillin 500mg, take 3 times daily for 7 days', 1),
  (2, 2, 'prescription', 'Migraine Treatment', 'Sumatriptan 50mg as needed for migraine attacks', 2),
  (2, 2, 'note', 'Lifestyle Recommendations', 'Stress management techniques, regular sleep schedule', 2),
  (3, 3, 'lab_result', 'Stool Culture', 'Negative for bacterial pathogens', 1),
  (4, 4, 'lab_result', 'Rheumatoid Factor Test', 'Elevated RF levels confirming RA diagnosis', 2),
  (4, 4, 'imaging', 'Hand X-Ray', 'Joint space narrowing visible in metacarpophalangeal joints', 2),
  (5, 5, 'prescription', 'Cough Medication', 'Dextromethorphan 15mg every 4 hours as needed', 1)
ON CONFLICT DO NOTHING;

-- Update inventory items to remove price column dependencies
UPDATE inventory_items SET status =
  CASE
    WHEN quantity = 0 THEN 'out_of_stock'
    WHEN quantity <= minimum_stock THEN 'low_stock'
    ELSE 'available'
  END;