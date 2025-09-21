-- Clean Inventory Migration
-- This migration removes previous inventory tables and creates a clean schema
-- with proper department (medical/dental) and classification structure

-- Step 1: Drop all existing inventory-related tables and views
DROP VIEW IF EXISTS inventory_view CASCADE;
DROP TABLE IF EXISTS inventory_transactions CASCADE;
DROP TABLE IF EXISTS inventory_items CASCADE;
DROP TABLE IF EXISTS inventory_classifications CASCADE;
DROP TABLE IF EXISTS inventory_categories CASCADE;

-- Step 2: Create inventory classifications table
CREATE TABLE inventory_classifications (
    id SERIAL PRIMARY KEY,
    name VARCHAR(100) NOT NULL UNIQUE,
    description TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Step 3: Create main inventory items table with proper structure
CREATE TABLE inventory_items (
    id SERIAL PRIMARY KEY,
    generic_name VARCHAR(255) NOT NULL,
    brand_name VARCHAR(255) NOT NULL,
    classification_id INTEGER REFERENCES inventory_classifications(id) ON DELETE SET NULL,
    department VARCHAR(50) NOT NULL DEFAULT 'medical' CHECK (department IN ('medical', 'dental')),
    stock_quantity INTEGER NOT NULL DEFAULT 0,
    unit_of_measurement VARCHAR(50) DEFAULT 'pieces',
    expiration_date DATE,
    status VARCHAR(50) NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'expired', 'low_stock', 'out_of_stock', 'discontinued', 'archived')),
    minimum_stock_level INTEGER DEFAULT 10,
    maximum_stock_level INTEGER DEFAULT 1000,
    cost_per_unit DECIMAL(10,2),
    supplier VARCHAR(255),
    lot_number VARCHAR(100),
    manufacturer VARCHAR(255),
    notes TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    created_by INTEGER REFERENCES users(id) ON DELETE SET NULL,
    updated_by INTEGER REFERENCES users(id) ON DELETE SET NULL
);

-- Step 4: Create inventory transactions table for tracking stock movements
CREATE TABLE inventory_transactions (
    id SERIAL PRIMARY KEY,
    item_id INTEGER REFERENCES inventory_items(id) ON DELETE CASCADE,
    transaction_type VARCHAR(50) NOT NULL CHECK (transaction_type IN ('stock_in', 'stock_out', 'adjustment', 'expired', 'damaged')),
    quantity INTEGER NOT NULL,
    quantity_before INTEGER NOT NULL,
    quantity_after INTEGER NOT NULL,
    unit_cost DECIMAL(10,2),
    total_cost DECIMAL(10,2),
    reference_number VARCHAR(100),
    notes TEXT,
    transaction_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    performed_by INTEGER REFERENCES users(id) ON DELETE SET NULL
);

-- Step 5: Create indexes for better performance
CREATE INDEX idx_inventory_items_generic_name ON inventory_items(generic_name);
CREATE INDEX idx_inventory_items_brand_name ON inventory_items(brand_name);
CREATE INDEX idx_inventory_items_classification ON inventory_items(classification_id);
CREATE INDEX idx_inventory_items_department ON inventory_items(department);
CREATE INDEX idx_inventory_items_status ON inventory_items(status);
CREATE INDEX idx_inventory_items_expiration ON inventory_items(expiration_date);
CREATE INDEX idx_inventory_transactions_item_id ON inventory_transactions(item_id);
CREATE INDEX idx_inventory_transactions_date ON inventory_transactions(transaction_date);

-- Step 6: Create function to automatically update stock status
CREATE OR REPLACE FUNCTION update_inventory_status()
RETURNS TRIGGER AS $$
BEGIN
    -- Check if expired
    IF NEW.expiration_date IS NOT NULL AND NEW.expiration_date < CURRENT_DATE THEN
        NEW.status = 'expired';
    -- Check if out of stock
    ELSIF NEW.stock_quantity = 0 THEN
        NEW.status = 'out_of_stock';
    -- Check if low stock
    ELSIF NEW.stock_quantity <= NEW.minimum_stock_level THEN
        NEW.status = 'low_stock';
    -- Otherwise active (unless manually set to archived or discontinued)
    ELSIF NEW.status NOT IN ('archived', 'discontinued') THEN
        NEW.status = 'active';
    END IF;

    NEW.updated_at = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Step 7: Create triggers
CREATE TRIGGER trigger_update_inventory_status
    BEFORE INSERT OR UPDATE ON inventory_items
    FOR EACH ROW
    EXECUTE FUNCTION update_inventory_status();

-- Step 8: Create trigger to log inventory transactions
CREATE OR REPLACE FUNCTION log_inventory_transaction()
RETURNS TRIGGER AS $$
BEGIN
    -- Only log if stock quantity changed
    IF OLD.stock_quantity != NEW.stock_quantity THEN
        INSERT INTO inventory_transactions (
            item_id,
            transaction_type,
            quantity,
            quantity_before,
            quantity_after,
            performed_by
        ) VALUES (
            NEW.id,
            CASE
                WHEN NEW.stock_quantity > OLD.stock_quantity THEN 'stock_in'
                WHEN NEW.stock_quantity < OLD.stock_quantity THEN 'stock_out'
                ELSE 'adjustment'
            END,
            ABS(NEW.stock_quantity - OLD.stock_quantity),
            OLD.stock_quantity,
            NEW.stock_quantity,
            NEW.updated_by
        );
    END IF;

    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_log_inventory_transaction
    AFTER UPDATE ON inventory_items
    FOR EACH ROW
    EXECUTE FUNCTION log_inventory_transaction();

-- Step 9: Insert inventory classifications
INSERT INTO inventory_classifications (name, description) VALUES
('Medicines', 'Pharmaceutical drugs and medications'),
('Medical Supplies', 'General medical supplies and consumables'),
('Equipment', 'Medical equipment and devices'),
('Vaccines', 'Immunization vaccines and biologics'),
('Laboratory', 'Laboratory reagents and testing supplies'),
('Emergency', 'Emergency medical supplies'),
('Surgical', 'Surgical instruments and supplies'),
('Diagnostic', 'Diagnostic tools and equipment'),
('First Aid', 'Basic first aid supplies'),
('Personal Protective Equipment', 'PPE and safety equipment'),
('Dental Supplies', 'Dental-specific supplies and materials'),
('Dental Equipment', 'Dental instruments and equipment');

-- Step 10: Insert sample inventory data
INSERT INTO inventory_items (generic_name, brand_name, classification_id, department, stock_quantity, expiration_date, cost_per_unit, supplier, manufacturer, minimum_stock_level) VALUES

-- Medical Department - Medicines
('Paracetamol', 'Tylenol', 1, 'medical', 500, '2025-12-31', 0.50, 'Medical Supplies Inc', 'Johnson & Johnson', 50),
('Ibuprofen', 'Advil', 1, 'medical', 300, '2025-10-15', 0.75, 'Pharma Distribution', 'Pfizer', 30),
('Amoxicillin', 'Amoxil', 1, 'medical', 150, '2025-08-20', 2.50, 'Medical Supplies Inc', 'GlaxoSmithKline', 20),
('Metformin', 'Glucophage', 1, 'medical', 200, '2026-03-10', 1.25, 'Diabetes Care Co', 'Bristol Myers Squibb', 25),
('Lisinopril', 'Prinivil', 1, 'medical', 180, '2025-11-05', 1.80, 'Heart Health Pharma', 'Merck', 20),

-- Medical Department - Medical Supplies
('Surgical Gloves', 'SafeTouch', 2, 'medical', 1000, '2026-06-30', 0.25, 'Medical Supplies Inc', 'Ansell', 100),
('Syringes 5ml', 'BD Safety', 2, 'medical', 800, '2027-01-15', 0.30, 'Medical Equipment Co', 'Becton Dickinson', 100),
('Gauze Pads', 'MediGauze', 2, 'medical', 600, '2026-12-01', 0.15, 'First Aid Supplies', 'Johnson & Johnson', 50),
('Alcohol Swabs', 'Sterile Prep', 2, 'medical', 1200, '2025-09-30', 0.05, 'Antiseptic Co', '3M', 200),
('Band-Aids', 'Band-Aid Brand', 2, 'medical', 400, '2026-08-15', 0.10, 'First Aid Supplies', 'Johnson & Johnson', 50),

-- Medical Department - Equipment
('Blood Pressure Monitor', 'Omron Elite', 3, 'medical', 25, NULL, 45.00, 'Medical Equipment Co', 'Omron', 5),
('Thermometer Digital', 'ThermoSure', 3, 'medical', 50, NULL, 15.00, 'Medical Devices Ltd', 'Braun', 10),
('Stethoscope', 'Littmann Classic', 3, 'medical', 30, NULL, 120.00, 'Medical Equipment Co', '3M', 5),
('Pulse Oximeter', 'PulseCheck Pro', 3, 'medical', 40, NULL, 35.00, 'Medical Devices Ltd', 'Nonin', 10),
('Otoscope', 'WelchAllyn', 3, 'medical', 15, NULL, 200.00, 'Diagnostic Equipment Co', 'Welch Allyn', 3),

-- Medical Department - Vaccines
('COVID-19 Vaccine', 'Pfizer-BioNTech', 4, 'medical', 100, '2025-07-01', 25.00, 'Vaccine Distribution', 'Pfizer', 20),
('Influenza Vaccine', 'FluShield', 4, 'medical', 150, '2025-06-15', 18.00, 'Vaccine Distribution', 'Sanofi', 30),
('Hepatitis B Vaccine', 'Engerix-B', 4, 'medical', 80, '2025-09-20', 30.00, 'Vaccine Distribution', 'GlaxoSmithKline', 15),

-- Medical Department - Laboratory
('Blood Test Strips', 'AccuCheck', 5, 'medical', 300, '2025-12-31', 1.50, 'Lab Supplies Co', 'Roche', 50),
('Urine Test Strips', 'UriScan', 5, 'medical', 250, '2025-11-30', 0.80, 'Lab Supplies Co', 'Siemens', 50),

-- Medical Department - Emergency
('Epinephrine Auto-Injector', 'EpiPen', 6, 'medical', 20, '2025-10-31', 100.00, 'Emergency Medical', 'Mylan', 5),
('Emergency Oxygen Tank', 'OxyLife', 6, 'medical', 10, NULL, 150.00, 'Emergency Medical', 'Invacare', 3),

-- Dental Department - Medicines
('Lidocaine 2%', 'Xylocaine', 1, 'dental', 50, '2025-12-31', 3.00, 'Dental Supplies Co', 'AstraZeneca', 10),
('Articaine', 'Septocaine', 1, 'dental', 40, '2025-11-30', 4.50, 'Dental Supplies Co', 'Septodont', 8),

-- Dental Department - Dental Supplies
('Dental Composite', 'Filtek', 11, 'dental', 200, '2026-06-30', 15.00, 'Dental Materials Inc', '3M', 20),
('Dental Impression Material', 'Impregum', 11, 'dental', 100, '2025-12-15', 25.00, 'Dental Materials Inc', '3M', 15),
('Dental X-Ray Film', 'Kodak Insight', 11, 'dental', 300, '2025-10-15', 2.50, 'Imaging Supplies', 'Kodak', 50),
('Dental Cement', 'RelyX', 11, 'dental', 150, '2026-03-20', 12.00, 'Dental Materials Inc', '3M', 20),

-- Dental Department - Dental Equipment
('Dental Drill Bits', 'Diamond Burs', 12, 'dental', 100, NULL, 25.00, 'Dental Equipment Co', 'Brasseler', 15),
('Dental Handpiece', 'KaVo', 12, 'dental', 8, NULL, 800.00, 'Dental Equipment Co', 'KaVo', 2),
('Dental Scaler', 'Piezon', 12, 'dental', 12, NULL, 350.00, 'Dental Equipment Co', 'EMS', 3),
('Dental Light Cure Unit', 'Elipar', 12, 'dental', 6, NULL, 600.00, 'Dental Equipment Co', '3M', 2);

-- Step 11: Create comprehensive view for frontend
CREATE VIEW inventory_view AS
SELECT
    i.id,
    i.generic_name,
    i.brand_name,
    c.name as classification,
    i.department,
    i.stock_quantity,
    i.unit_of_measurement,
    i.expiration_date,
    i.status,
    i.minimum_stock_level,
    i.maximum_stock_level,
    i.cost_per_unit,
    i.supplier,
    i.lot_number,
    i.manufacturer,
    i.notes,
    i.created_at,
    i.updated_at,
    -- Add computed fields for easier frontend use
    CASE
        WHEN i.expiration_date IS NOT NULL AND i.expiration_date < CURRENT_DATE THEN true
        ELSE false
    END as is_expired,
    CASE
        WHEN i.stock_quantity <= i.minimum_stock_level THEN true
        ELSE false
    END as is_low_stock,
    CASE
        WHEN i.expiration_date IS NOT NULL THEN (i.expiration_date - CURRENT_DATE)
        ELSE NULL
    END as days_until_expiry
FROM inventory_items i
LEFT JOIN inventory_classifications c ON i.classification_id = c.id
ORDER BY i.department, c.name, i.generic_name;

-- Step 12: Create utility functions
CREATE OR REPLACE FUNCTION get_low_stock_items(dept VARCHAR DEFAULT NULL)
RETURNS TABLE (
    id INTEGER,
    generic_name VARCHAR(255),
    brand_name VARCHAR(255),
    classification VARCHAR(100),
    department VARCHAR(50),
    stock_quantity INTEGER,
    minimum_stock_level INTEGER
) AS $$
BEGIN
    RETURN QUERY
    SELECT
        i.id,
        i.generic_name,
        i.brand_name,
        c.name as classification,
        i.department,
        i.stock_quantity,
        i.minimum_stock_level
    FROM inventory_items i
    LEFT JOIN inventory_classifications c ON i.classification_id = c.id
    WHERE i.stock_quantity <= i.minimum_stock_level
    AND (dept IS NULL OR i.department = dept)
    AND i.status != 'archived'
    ORDER BY i.stock_quantity ASC;
END;
$$ LANGUAGE plpgsql;

CREATE OR REPLACE FUNCTION get_expiring_items(days_ahead INTEGER DEFAULT 30, dept VARCHAR DEFAULT NULL)
RETURNS TABLE (
    id INTEGER,
    generic_name VARCHAR(255),
    brand_name VARCHAR(255),
    classification VARCHAR(100),
    department VARCHAR(50),
    expiration_date DATE,
    days_until_expiry INTEGER
) AS $$
BEGIN
    RETURN QUERY
    SELECT
        i.id,
        i.generic_name,
        i.brand_name,
        c.name as classification,
        i.department,
        i.expiration_date,
        (i.expiration_date - CURRENT_DATE) as days_until_expiry
    FROM inventory_items i
    LEFT JOIN inventory_classifications c ON i.classification_id = c.id
    WHERE i.expiration_date IS NOT NULL
    AND i.expiration_date <= CURRENT_DATE + INTERVAL '1 day' * days_ahead
    AND (dept IS NULL OR i.department = dept)
    AND i.status != 'archived'
    ORDER BY i.expiration_date ASC;
END;
$$ LANGUAGE plpgsql;

-- Step 13: Add table comments for documentation
COMMENT ON TABLE inventory_items IS 'Main inventory items table with department and classification structure';
COMMENT ON TABLE inventory_classifications IS 'Categories/classifications for inventory items (Medicines, Medical Supplies, Equipment, etc.)';
COMMENT ON TABLE inventory_transactions IS 'Log of all inventory stock movements and changes';
COMMENT ON VIEW inventory_view IS 'Comprehensive view of inventory items with classification names and computed fields for frontend display';

COMMENT ON COLUMN inventory_items.department IS 'Department: medical or dental';
COMMENT ON COLUMN inventory_items.classification_id IS 'References inventory_classifications table';
COMMENT ON COLUMN inventory_items.status IS 'Item status: active, expired, low_stock, out_of_stock, discontinued, archived';

-- Migration completed successfully
SELECT 'Inventory migration completed successfully. Tables created: inventory_items, inventory_classifications, inventory_transactions, inventory_view' as result;