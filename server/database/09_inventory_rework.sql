-- Meditrack Inventory Management Rework
-- This migration creates a well-designed inventory system with support for sorting, filtering, and searching.

-- Step 1: Drop all existing inventory-related tables and views for a clean slate
DROP VIEW IF EXISTS inventory_view CASCADE;
DROP TABLE IF EXISTS inventory_transactions CASCADE;
DROP TABLE IF EXISTS inventory_items CASCADE;
DROP TABLE IF EXISTS inventory_classifications CASCADE;

-- Step 2: Create inventory classifications table
CREATE TABLE inventory_classifications (
    id SERIAL PRIMARY KEY,
    name VARCHAR(100) NOT NULL UNIQUE,
    description TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Step 3: Create main inventory items table
CREATE TABLE inventory_items (
    id SERIAL PRIMARY KEY,
    generic_name VARCHAR(255) NOT NULL,
    brand_name VARCHAR(255),
    classification_id INTEGER REFERENCES inventory_classifications(id) ON DELETE SET NULL,
    category VARCHAR(100),
    department VARCHAR(50) NOT NULL CHECK (department IN ('medical', 'dental')),
    stock_quantity INTEGER NOT NULL DEFAULT 0,
    unit_of_measurement VARCHAR(50) DEFAULT 'pcs',
    expiration_date DATE,
    status VARCHAR(50) NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'expired', 'low_stock', 'out_of_stock', 'discontinued', 'archived')),
    minimum_stock_level INTEGER DEFAULT 10,
    notes TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    created_by INTEGER REFERENCES users(id) ON DELETE SET NULL,
    updated_by INTEGER REFERENCES users(id) ON DELETE SET NULL
);

-- Step 4: Create indexes for performance
CREATE INDEX idx_inventory_items_department ON inventory_items(department);
CREATE INDEX idx_inventory_items_classification_id ON inventory_items(classification_id);
CREATE INDEX idx_inventory_items_category ON inventory_items(category);
CREATE INDEX idx_inventory_items_generic_name ON inventory_items(generic_name);
CREATE INDEX idx_inventory_items_brand_name ON inventory_items(brand_name);
CREATE INDEX idx_inventory_items_status ON inventory_items(status);

-- Step 5: Create a comprehensive view for the frontend
CREATE VIEW inventory_view AS
SELECT
    i.id,
    i.generic_name,
    i.brand_name,
    c.name as classification,
    i.category,
    i.department,
    i.stock_quantity,
    i.unit_of_measurement,
    i.expiration_date,
    i.status,
    i.minimum_stock_level,
    i.notes,
    i.created_at,
    i.updated_at,
    i.created_by,
    i.updated_by
FROM inventory_items i
LEFT JOIN inventory_classifications c ON i.classification_id = c.id;

-- Step 6: Insert classifications
INSERT INTO inventory_classifications (name, description) VALUES
('Medicines', 'Pharmaceutical drugs and medications'),
('Supplies', 'Medical and dental supplies and consumables'),
('Equipment', 'Medical and dental equipment and devices');

-- Step 7: Insert sample data

-- Medical Department
INSERT INTO inventory_items (generic_name, brand_name, classification_id, category, department, stock_quantity, unit_of_measurement, expiration_date, status, minimum_stock_level, notes)
VALUES
    ('Paracetamol', 'Biogesic', 1, 'Pain Reliever', 'medical', 1000, 'pcs', '2026-12-31', 'active', 100, 'For fever and pain relief'),
    ('Ibuprofen', 'Advil', 1, 'Pain Reliever', 'medical', 500, 'pcs', '2025-10-15', 'active', 50, 'Anti-inflammatory drug'),
    ('Surgical Gloves', 'SafeTouch', 2, 'Medical Supplies', 'medical', 2000, 'pairs', '2027-06-30', 'active', 200, 'Size M'),
    ('N95 Face Mask', '3M', 2, 'Medical Supplies', 'medical', 1500, 'pcs', '2028-01-15', 'active', 150, 'Standard N95 masks'),
    ('Stethoscope', 'Littmann Classic III', 3, 'Diagnostics', 'medical', 20, 'units', NULL, 'active', 5, 'For general diagnosis'),
    ('Digital Thermometer', 'Omron', 3, 'Diagnostics', 'medical', 50, 'units', NULL, 'active', 10, 'Model MC-246');

-- Dental Department
INSERT INTO inventory_items (generic_name, brand_name, classification_id, category, department, stock_quantity, unit_of_measurement, expiration_date, status, minimum_stock_level, notes)
VALUES
    ('Lidocaine HCl 2%', 'Xylocaine', 1, 'Anesthetics', 'dental', 200, 'cartridges', '2025-08-20', 'active', 20, 'Local anesthetic with epinephrine'),
    ('Amoxicillin', 'Amoxil', 1, 'Antibiotics', 'dental', 300, 'capsules', '2026-03-10', 'active', 30, '500mg capsules'),
    ('Dental Bibs', 'Sure-Guard', 2, 'Dental Supplies', 'dental', 5000, 'pcs', '2027-11-30', 'active', 500, 'Disposable patient bibs'),
    ('Composite Resin', '3M Filtek', 2, 'Dental Supplies', 'dental', 100, 'syringes', '2025-09-30', 'active', 10, 'A2 shade'),
    ('Dental Handpiece', 'KaVo EXPERTtorque', 3, 'Instruments', 'dental', 10, 'units', NULL, 'active', 2, 'High-speed turbine'),
    ('Curing Light', 'VALO Cordless', 3, 'Instruments', 'dental', 5, 'units', NULL, 'active', 1, 'LED curing light');

-- Step 8: Add comments for documentation
COMMENT ON TABLE inventory_items IS 'Main table for all inventory items across both medical and dental departments.';
COMMENT ON TABLE inventory_classifications IS 'Stores the three main classifications: Medicines, Supplies, and Equipment.';
COMMENT ON VIEW inventory_view IS 'A comprehensive view for the frontend to easily fetch and display inventory data.';

SELECT 'Inventory rework migration completed successfully!' as result;
