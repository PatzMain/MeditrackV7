-- Final Clean Inventory Migration
-- Creates exactly 6 datatables: Medical (Medicines, Supplies, Equipment) + Dental (Medicines, Supplies, Equipment)

-- Step 1: Drop all existing inventory-related tables and views
DROP VIEW IF EXISTS inventory_view CASCADE;
DROP TABLE IF EXISTS inventory_transactions CASCADE;
DROP TABLE IF EXISTS inventory_items CASCADE;
DROP TABLE IF EXISTS inventory_classifications CASCADE;
DROP TABLE IF EXISTS inventory_categories CASCADE;

-- Step 2: Create inventory classifications table (only 6 total)
CREATE TABLE inventory_classifications (
    id SERIAL PRIMARY KEY,
    name VARCHAR(100) NOT NULL UNIQUE,
    description TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Step 3: Create main inventory items table
CREATE TABLE inventory_items (
    id SERIAL PRIMARY KEY,
    generic_name VARCHAR(255) NOT NULL,
    brand_name VARCHAR(255) NOT NULL,
    classification_id INTEGER REFERENCES inventory_classifications(id) ON DELETE SET NULL,
    department VARCHAR(50) NOT NULL CHECK (department IN ('medical', 'dental')),
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

-- Step 4: Create inventory transactions table
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

-- Step 5: Create indexes
CREATE INDEX idx_inventory_items_generic_name ON inventory_items(generic_name);
CREATE INDEX idx_inventory_items_brand_name ON inventory_items(brand_name);
CREATE INDEX idx_inventory_items_classification ON inventory_items(classification_id);
CREATE INDEX idx_inventory_items_department ON inventory_items(department);
CREATE INDEX idx_inventory_items_status ON inventory_items(status);
CREATE INDEX idx_inventory_items_expiration ON inventory_items(expiration_date);
CREATE INDEX idx_inventory_transactions_item_id ON inventory_transactions(item_id);
CREATE INDEX idx_inventory_transactions_date ON inventory_transactions(transaction_date);

-- Step 6: Create triggers for automatic status updates
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

CREATE TRIGGER trigger_update_inventory_status
    BEFORE INSERT OR UPDATE ON inventory_items
    FOR EACH ROW
    EXECUTE FUNCTION update_inventory_status();

-- Step 7: Create transaction logging trigger
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

-- Step 8: Insert exactly 6 classifications (3 medical + 3 dental = 6 datatables)
INSERT INTO inventory_classifications (name, description) VALUES
('Medicines', 'Pharmaceutical drugs and medications'),
('Supplies', 'Medical and dental supplies and consumables'),
('Equipment', 'Medical and dental equipment and devices');

-- Note: The same 3 classifications are used for both departments
-- Frontend will filter by department + classification to create 6 datatables:
-- Medical Medicines, Medical Supplies, Medical Equipment
-- Dental Medicines, Dental Supplies, Dental Equipment

-- Step 9: Insert sample inventory data for all 6 datatables

-- MEDICAL DEPARTMENT
-- Medical Medicines (Datatable 1)
INSERT INTO inventory_items (generic_name, brand_name, classification_id, department, stock_quantity, expiration_date, cost_per_unit, supplier, manufacturer, minimum_stock_level) VALUES
('Paracetamol', 'Tylenol', 1, 'medical', 500, '2025-12-31', 0.50, 'Medical Supplies Inc', 'Johnson & Johnson', 50),
('Ibuprofen', 'Advil', 1, 'medical', 300, '2025-10-15', 0.75, 'Pharma Distribution', 'Pfizer', 30),
('Amoxicillin', 'Amoxil', 1, 'medical', 150, '2025-08-20', 2.50, 'Medical Supplies Inc', 'GlaxoSmithKline', 20),
('Metformin', 'Glucophage', 1, 'medical', 200, '2026-03-10', 1.25, 'Diabetes Care Co', 'Bristol Myers Squibb', 25),
('Lisinopril', 'Prinivil', 1, 'medical', 180, '2025-11-05', 1.80, 'Heart Health Pharma', 'Merck', 20),
('Aspirin', 'Bayer', 1, 'medical', 400, '2025-09-30', 0.30, 'Pharma Distribution', 'Bayer', 40),
('Azithromycin', 'Zithromax', 1, 'medical', 100, '2025-07-15', 3.50, 'Medical Supplies Inc', 'Pfizer', 15),

-- Medical Supplies (Datatable 2)
('Surgical Gloves', 'SafeTouch', 2, 'medical', 1000, '2026-06-30', 0.25, 'Medical Supplies Inc', 'Ansell', 100),
('Syringes 5ml', 'BD Safety', 2, 'medical', 800, '2027-01-15', 0.30, 'Medical Equipment Co', 'Becton Dickinson', 100),
('Gauze Pads', 'MediGauze', 2, 'medical', 600, '2026-12-01', 0.15, 'First Aid Supplies', 'Johnson & Johnson', 50),
('Alcohol Swabs', 'Sterile Prep', 2, 'medical', 1200, '2025-09-30', 0.05, 'Antiseptic Co', '3M', 200),
('Band-Aids', 'Band-Aid Brand', 2, 'medical', 400, '2026-08-15', 0.10, 'First Aid Supplies', 'Johnson & Johnson', 50),
('Face Masks', 'N95 Premium', 2, 'medical', 2000, '2026-12-31', 0.75, 'PPE Supplies Co', '3M', 300),
('Cotton Swabs', 'Q-tips Medical', 2, 'medical', 500, '2027-03-20', 0.08, 'Medical Supplies Inc', 'Unilever', 75),

-- Medical Equipment (Datatable 3)
('Blood Pressure Monitor', 'Omron Elite', 3, 'medical', 25, NULL, 45.00, 'Medical Equipment Co', 'Omron', 5),
('Thermometer Digital', 'ThermoSure', 3, 'medical', 50, NULL, 15.00, 'Medical Devices Ltd', 'Braun', 10),
('Stethoscope', 'Littmann Classic', 3, 'medical', 30, NULL, 120.00, 'Medical Equipment Co', '3M', 5),
('Pulse Oximeter', 'PulseCheck Pro', 3, 'medical', 40, NULL, 35.00, 'Medical Devices Ltd', 'Nonin', 10),
('Otoscope', 'WelchAllyn', 3, 'medical', 15, NULL, 200.00, 'Diagnostic Equipment Co', 'Welch Allyn', 3),
('Defibrillator', 'LIFEPAK 15', 3, 'medical', 5, NULL, 15000.00, 'Emergency Equipment Co', 'Physio-Control', 2),
('ECG Machine', 'Philips PageWriter', 3, 'medical', 8, NULL, 8500.00, 'Medical Equipment Co', 'Philips', 2);

-- DENTAL DEPARTMENT
-- Dental Medicines (Datatable 4)
INSERT INTO inventory_items (generic_name, brand_name, classification_id, department, stock_quantity, expiration_date, cost_per_unit, supplier, manufacturer, minimum_stock_level) VALUES
('Lidocaine 2%', 'Xylocaine', 1, 'dental', 50, '2025-12-31', 3.00, 'Dental Supplies Co', 'AstraZeneca', 10),
('Articaine', 'Septocaine', 1, 'dental', 40, '2025-11-30', 4.50, 'Dental Supplies Co', 'Septodont', 8),
('Benzocaine', 'Hurricaine', 1, 'dental', 30, '2025-10-20', 2.75, 'Dental Supplies Co', 'Beutlich', 6),
('Epinephrine', 'EpiPen Jr', 1, 'dental', 20, '2025-08-15', 12.00, 'Emergency Dental', 'Mylan', 5),
('Fluoride Varnish', 'Duraphat', 1, 'dental', 100, '2026-01-30', 8.50, 'Dental Preventive Co', 'Colgate', 15),

-- Dental Supplies (Datatable 5)
('Dental Composite', 'Filtek', 2, 'dental', 200, '2026-06-30', 15.00, 'Dental Materials Inc', '3M', 20),
('Dental Impression Material', 'Impregum', 2, 'dental', 100, '2025-12-15', 25.00, 'Dental Materials Inc', '3M', 15),
('Dental X-Ray Film', 'Kodak Insight', 2, 'dental', 300, '2025-10-15', 2.50, 'Imaging Supplies', 'Kodak', 50),
('Dental Cement', 'RelyX', 2, 'dental', 150, '2026-03-20', 12.00, 'Dental Materials Inc', '3M', 20),
('Dental Floss', 'Oral-B Pro', 2, 'dental', 400, '2027-05-10', 1.25, 'Dental Care Co', 'Oral-B', 60),
('Dental Bibs', 'SafeGuard', 2, 'dental', 1000, '2026-11-25', 0.15, 'Dental Supplies Co', 'Crosstex', 150),
('Dental Sutures', 'Vicryl', 2, 'dental', 80, '2025-09-18', 8.75, 'Surgical Supplies', 'Ethicon', 12),

-- Dental Equipment (Datatable 6)
('Dental Drill Bits', 'Diamond Burs', 3, 'dental', 100, NULL, 25.00, 'Dental Equipment Co', 'Brasseler', 15),
('Dental Handpiece', 'KaVo', 3, 'dental', 8, NULL, 800.00, 'Dental Equipment Co', 'KaVo', 2),
('Dental Scaler', 'Piezon', 3, 'dental', 12, NULL, 350.00, 'Dental Equipment Co', 'EMS', 3),
('Dental Light Cure Unit', 'Elipar', 3, 'dental', 6, NULL, 600.00, 'Dental Equipment Co', '3M', 2),
('Dental Chair', 'A-dec 500', 3, 'dental', 4, NULL, 25000.00, 'Dental Furniture Co', 'A-dec', 1),
('Dental X-Ray Unit', 'Kodak 2200', 3, 'dental', 3, NULL, 18000.00, 'Imaging Equipment Co', 'Kodak', 1),
('Autoclave Sterilizer', 'Midmark M11', 3, 'dental', 5, NULL, 4500.00, 'Sterilization Co', 'Midmark', 2);

-- Step 10: Create view for frontend (shows all 6 datatables)
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
    -- Add computed fields
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
    END as days_until_expiry,
    -- Create datatable identifier for frontend
    CONCAT(i.department, '_', LOWER(REPLACE(c.name, ' ', '_'))) as datatable_type
FROM inventory_items i
LEFT JOIN inventory_classifications c ON i.classification_id = c.id
ORDER BY i.department, c.name, i.generic_name;

-- Step 11: Create utility functions
CREATE OR REPLACE FUNCTION get_datatable_summary()
RETURNS TABLE (
    datatable_type TEXT,
    department VARCHAR(50),
    classification VARCHAR(100),
    total_items BIGINT,
    low_stock_items BIGINT,
    expired_items BIGINT
) AS $$
BEGIN
    RETURN QUERY
    SELECT
        CONCAT(i.department, '_', LOWER(REPLACE(c.name, ' ', '_'))) as datatable_type,
        i.department,
        c.name as classification,
        COUNT(*) as total_items,
        COUNT(*) FILTER (WHERE i.stock_quantity <= i.minimum_stock_level) as low_stock_items,
        COUNT(*) FILTER (WHERE i.expiration_date IS NOT NULL AND i.expiration_date < CURRENT_DATE) as expired_items
    FROM inventory_items i
    LEFT JOIN inventory_classifications c ON i.classification_id = c.id
    WHERE i.status != 'archived'
    GROUP BY i.department, c.name, datatable_type
    ORDER BY i.department, c.name;
END;
$$ LANGUAGE plpgsql;

-- Step 12: Add comments
COMMENT ON TABLE inventory_items IS '6 Datatables: Medical (Medicines, Supplies, Equipment) + Dental (Medicines, Supplies, Equipment)';
COMMENT ON TABLE inventory_classifications IS 'Only 3 classifications: Medicines, Supplies, Equipment (used for both departments)';
COMMENT ON VIEW inventory_view IS 'Shows all 6 datatables with datatable_type field for easy frontend filtering';

-- Step 13: Show the 6 datatables created
SELECT 'Inventory migration completed successfully!' as result;
SELECT
    CONCAT(department, ' ', c.name) as datatable_name,
    COUNT(*) as item_count
FROM inventory_items i
LEFT JOIN inventory_classifications c ON i.classification_id = c.id
GROUP BY department, c.name, c.id
ORDER BY department, c.id;