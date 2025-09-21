-- Update inventory_items table to support medical and dental departments
ALTER TABLE inventory_items
ADD COLUMN department VARCHAR(20) CHECK (department IN ('medical', 'dental')) DEFAULT 'medical';

-- Update existing records to have medical department by default
UPDATE inventory_items SET department = 'medical' WHERE department IS NULL;

-- Update category check constraint to be more specific
ALTER TABLE inventory_items
DROP CONSTRAINT IF EXISTS inventory_items_category_check;

ALTER TABLE inventory_items
ADD CONSTRAINT inventory_items_category_check
CHECK (category IN ('medicine', 'supply', 'equipment'));

-- Create index for better performance on department filtering
CREATE INDEX IF NOT EXISTS idx_inventory_department ON inventory_items(department);
CREATE INDEX IF NOT EXISTS idx_inventory_category_department ON inventory_items(category, department);

-- Insert sample dental items
INSERT INTO inventory_items (name, category, department, description, quantity, unit, price, minimum_stock, status) VALUES
  -- Dental Medicines
  ('Lidocaine 2%', 'medicine', 'dental', 'Local anesthetic for dental procedures', 50, 'vials', 15.00, 10, 'available'),
  ('Articaine 4%', 'medicine', 'dental', 'Local anesthetic with epinephrine', 30, 'vials', 18.50, 8, 'available'),
  ('Fluoride Varnish', 'medicine', 'dental', 'Topical fluoride treatment', 25, 'tubes', 12.00, 5, 'available'),
  ('Chlorhexidine Rinse', 'medicine', 'dental', 'Antimicrobial mouth rinse', 40, 'bottles', 8.75, 10, 'available'),

  -- Dental Supplies
  ('Dental Gloves Nitrile', 'supply', 'dental', 'Powder-free dental examination gloves', 500, 'pairs', 0.95, 100, 'available'),
  ('Dental Bibs', 'supply', 'dental', 'Disposable patient bibs', 200, 'pieces', 0.75, 50, 'available'),
  ('Impression Material', 'supply', 'dental', 'Alginate impression material', 15, 'boxes', 45.00, 5, 'available'),
  ('Dental Floss', 'supply', 'dental', 'Waxed dental floss for patients', 100, 'rolls', 2.50, 20, 'available'),
  ('Cotton Rolls', 'supply', 'dental', 'Sterile cotton rolls for isolation', 150, 'packs', 8.00, 30, 'available'),
  ('Gauze Sponges 2x2', 'supply', 'dental', 'Sterile gauze for dental procedures', 80, 'packs', 6.50, 20, 'available'),

  -- Dental Equipment
  ('Dental Handpiece', 'equipment', 'dental', 'High-speed dental handpiece', 4, 'units', 850.00, 2, 'available'),
  ('Dental Curing Light', 'equipment', 'dental', 'LED curing light for composites', 3, 'units', 650.00, 1, 'available'),
  ('Ultrasonic Scaler', 'equipment', 'dental', 'Ultrasonic scaling device', 2, 'units', 1200.00, 1, 'available'),
  ('Dental X-Ray Sensor', 'equipment', 'dental', 'Digital intraoral X-ray sensor', 1, 'units', 2500.00, 1, 'available'),
  ('Dental Chair Light', 'equipment', 'dental', 'LED dental operatory light', 2, 'units', 950.00, 1, 'available')
ON CONFLICT DO NOTHING;

-- Add more medical items to balance the categories
INSERT INTO inventory_items (name, category, department, description, quantity, unit, price, minimum_stock, status) VALUES
  -- Additional Medical Medicines
  ('Amoxicillin 500mg', 'medicine', 'medical', 'Antibiotic for bacterial infections', 120, 'tablets', 1.25, 30, 'available'),
  ('Metformin 850mg', 'medicine', 'medical', 'Diabetes medication', 200, 'tablets', 0.85, 50, 'available'),
  ('Omeprazole 20mg', 'medicine', 'medical', 'Proton pump inhibitor', 150, 'capsules', 1.10, 40, 'available'),
  ('Lisinopril 10mg', 'medicine', 'medical', 'ACE inhibitor for hypertension', 180, 'tablets', 0.95, 45, 'available'),

  -- Additional Medical Supplies
  ('IV Cannula 20G', 'supply', 'medical', 'Intravenous cannula for fluid administration', 100, 'pieces', 3.50, 25, 'available'),
  ('Syringes 10ml', 'supply', 'medical', 'Disposable syringes for injections', 250, 'pieces', 0.65, 50, 'available'),
  ('Alcohol Swabs', 'supply', 'medical', 'Antiseptic alcohol preparation pads', 300, 'pieces', 0.15, 100, 'available'),
  ('Medical Tape', 'supply', 'medical', 'Adhesive medical tape', 75, 'rolls', 4.25, 20, 'available'),

  -- Additional Medical Equipment
  ('Pulse Oximeter', 'equipment', 'medical', 'Digital pulse oximeter', 6, 'units', 125.00, 3, 'available'),
  ('ECG Machine', 'equipment', 'medical', '12-lead electrocardiogram machine', 1, 'units', 3500.00, 1, 'available'),
  ('Defibrillator', 'equipment', 'medical', 'Automated external defibrillator', 2, 'units', 2800.00, 1, 'available')
ON CONFLICT DO NOTHING;