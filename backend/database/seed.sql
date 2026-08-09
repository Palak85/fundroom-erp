-- ============================================================
-- MINI ERP + CRM OPERATIONS PORTAL - SAMPLE SEED DATA
-- Default Passwords for all accounts: "Password@123"
-- bcrypt hash for "Password@123": $2a$10$wE0i81sC8B4lZpDq9zK8reWl96D7l97R/vY8Jv63/FwB8aV09U.j6
-- ============================================================

-- 1. USERS (Admin, Sales, Warehouse, Accounts)
INSERT INTO users (id, name, email, password_hash, role)
VALUES
    ('00000000-0000-0000-0000-000000000001', 'Admin Officer', 'admin@example.com', '$2a$10$wE0i81sC8B4lZpDq9zK8reWl96D7l97R/vY8Jv63/FwB8aV09U.j6', 'Admin'),
    ('00000000-0000-0000-0000-000000000002', 'Sarah Sales Lead', 'sales@example.com', '$2a$10$wE0i81sC8B4lZpDq9zK8reWl96D7l97R/vY8Jv63/FwB8aV09U.j6', 'Sales'),
    ('00000000-0000-0000-0000-000000000003', 'Warren Warehouse Manager', 'warehouse@example.com', '$2a$10$wE0i81sC8B4lZpDq9zK8reWl96D7l97R/vY8Jv63/FwB8aV09U.j6', 'Warehouse'),
    ('00000000-0000-0000-0000-000000000004', 'Alice Accounts Exec', 'accounts@example.com', '$2a$10$wE0i81sC8B4lZpDq9zK8reWl96D7l97R/vY8Jv63/FwB8aV09U.j6', 'Accounts')
ON CONFLICT (email) DO NOTHING;

-- 2. PRODUCTS (10 Real Wholesale / Industrial / Tech sample products)
INSERT INTO products (id, product_name, sku, category, unit_price, current_stock, minimum_stock, warehouse_location, image_url)
VALUES
    ('10000000-0000-0000-0000-000000000001', 'Heavy Duty Industrial Drill 750W', 'TOOL-DRL-750', 'Hardware & Tools', 2450.00, 45, 10, 'Aisle 1 - Bay B3', 'https://images.unsplash.com/photo-1504148455328-c376907d081c?w=400'),
    ('10000000-0000-0000-0000-000000000002', 'Copper Wire Spool 50m (2.5mm)', 'ELEC-CPR-50M', 'Electrical', 1200.00, 80, 20, 'Aisle 2 - Shelf 1', 'https://images.unsplash.com/photo-1558346490-a72e53ae2d4f?w=400'),
    ('10000000-0000-0000-0000-000000000003', 'Steel Safety Helmet (ANSI Certified)', 'SAFE-HLM-001', 'Safety Gear', 450.00, 150, 25, 'Aisle 4 - Bin 12', 'https://images.unsplash.com/photo-1578873375972-04a6cb1b5ec0?w=400'),
    ('10000000-0000-0000-0000-000000000004', 'Precision Screwdriver Kit (48-in-1)', 'TOOL-PRC-48K', 'Hardware & Tools', 850.00, 12, 15, 'Aisle 1 - Shelf 4', 'https://images.unsplash.com/photo-1581147036324-c17ac41dfa6c?w=400'),
    ('10000000-0000-0000-0000-000000000005', 'High-Grade Nitrile Gloves (Box of 100)', 'SAFE-GLV-100', 'Safety Gear', 350.00, 8, 30, 'Aisle 4 - Bin 08', 'https://images.unsplash.com/photo-1584744982491-665216d95f8b?w=400'),
    ('10000000-0000-0000-0000-000000000006', 'LED Industrial Floodlight 100W', 'ELEC-FLD-100', 'Electrical', 1850.00, 35, 10, 'Aisle 2 - Shelf 5', 'https://images.unsplash.com/photo-1565814636199-ae8133055c1c?w=400'),
    ('10000000-0000-0000-0000-000000000007', 'Hydraulic Floor Jack 3 Ton', 'MECH-JCK-03T', 'Machinery', 6500.00, 18, 5, 'Heavy Storage Zone H2', 'https://images.unsplash.com/photo-1580983218765-f663bec07b37?w=400'),
    ('10000000-0000-0000-0000-000000000008', 'Polyurethane Foam Sealant (750ml)', 'CHEM-SEA-750', 'Chemicals', 290.00, 120, 20, 'Aisle 3 - Rack C1', 'https://images.unsplash.com/photo-1518770660439-4636190af475?w=400'),
    ('10000000-0000-0000-0000-000000000009', 'Digital Multimeter AC/DC Pro', 'ELEC-MMT-PRO', 'Electrical', 1600.00, 22, 10, 'Aisle 2 - Cabinet A', 'https://images.unsplash.com/photo-1581092160607-ee22621dd758?w=400'),
    ('10000000-0000-0000-0000-000000000010', 'Heavy Duty Cargo Straps (4 Pack)', 'PACK-STR-04P', 'Packaging', 720.00, 65, 15, 'Aisle 5 - Box 02', 'https://images.unsplash.com/photo-1586528116311-ad8dd3c8310d?w=400')
ON CONFLICT (sku) DO NOTHING;

-- 3. CUSTOMERS (10 Wholesale / Retail / Distributor clients)
INSERT INTO customers (id, customer_name, mobile, email, business_name, gst_number, customer_type, address, status, follow_up_date, notes)
VALUES
    ('20000000-0000-0000-0000-000000000001', 'Rajesh Sharma', '+91 98765 43210', 'rajesh@sharmahardware.com', 'Sharma Hardware & Building Materials', '27AAACS1234A1Z5', 'Wholesale', 'Shop 12, Industrial Area Phase 1, Mumbai, MH', 'Active', CURRENT_DATE + INTERVAL '2 days', 'Regular customer. Interested in bulk order of floodlights next week.'),
    ('20000000-0000-0000-0000-000000000002', 'Amitabh Verma', '+91 98220 11223', 'averma@apexdistributors.in', 'Apex Industrial Distributors Ltd', '29BBBCV5678B2Z1', 'Distributor', 'Plot 45, Peenya Industrial Complex, Bengaluru, KA', 'Active', CURRENT_DATE + INTERVAL '1 day', 'Quarterly supply contract renewal in discussion.'),
    ('20000000-0000-0000-0000-000000000003', 'Kavita Patel', '+91 97123 99887', 'kavita@pateltools.com', 'Patel Power Tools & Machinery', '24CCCDP9012C3Z7', 'Retail', '104 GIDC Estate, Ahmedabad, GJ', 'Lead', CURRENT_DATE, 'Requested quotation for 25 drills and 50 screwdriver kits.'),
    ('20000000-0000-0000-0000-000000000004', 'Sunil Narang', '+91 98110 55443', 'snarang@delhiconstruct.com', 'Delhi Infra Projects & Supply', '07DDDEN3456D4Z2', 'Wholesale', 'C-88 Okhla Phase 3, New Delhi, DL', 'Active', CURRENT_DATE + INTERVAL '5 days', 'Consistently orders safety gear and cable reels.'),
    ('20000000-0000-0000-0000-000000000005', 'Vikramaditya Roy', '+91 99030 77665', 'vroy@bengalindustrial.co', 'Bengal Industrial Supply Corp', '19EEEFR7890E5Z8', 'Distributor', '7 Sector V, Salt Lake, Kolkata, WB', 'Active', CURRENT_DATE + INTERVAL '7 days', 'Payment terms 30 days. Good credit track record.'),
    ('20000000-0000-0000-0000-000000000006', 'Manoj Gowda', '+91 98450 33221', 'manoj@deccantrading.in', 'Deccan Heavy Equipments', '29FFFMG2345F6Z3', 'Wholesale', '22 Belgaum Road, Hubli, KA', 'Inactive', NULL, 'Account dormant for 3 months due to warehouse relocation.'),
    ('20000000-0000-0000-0000-000000000007', 'Sneha Deshmukh', '+91 98900 66778', 'sneha@punecontracts.com', 'Pune Buildcon Solutions', '27GGGSD6789G7Z9', 'Retail', 'Shop 4, Hadapsar Industrial Area, Pune, MH', 'Lead', CURRENT_DATE, 'New inquiry from trade expo. Follow up on product catalog sent.'),
    ('20000000-0000-0000-0000-000000000008', 'Harvinder Singh', '+91 98140 12345', 'harvinder@singhmachines.in', 'Singh & Sons Machinery Mart', '03HHHHS0123H8Z4', 'Wholesale', 'GT Road, Miller Ganj, Ludhiana, PB', 'Active', CURRENT_DATE + INTERVAL '3 days', 'Needs urgent delivery of hydraulic jacks.'),
    ('20000000-0000-0000-0000-000000000009', 'Priya Sundaram', '+91 94440 98765', 'priya@chennaipower.com', 'Chennai Electricals & Automation', '33IIIKP4567I9Z0', 'Retail', '88 Mount Road, Guindy, Chennai, TN', 'Active', CURRENT_DATE + INTERVAL '4 days', 'Requested bulk discount tier pricing for copper wire spools.'),
    ('20000000-0000-0000-0000-000000000010', 'Deepak Agarwal', '+91 94140 54321', 'deepak@rajasthaninfra.com', 'Jaipur Safety & Tools Depot', '08JJJDA8901J0Z5', 'Wholesale', '14 VKIA Area, Jaipur, RJ', 'Lead', CURRENT_DATE + INTERVAL '1 day', 'Follow-up call scheduled regarding sample order.')
ON CONFLICT (id) DO NOTHING;

-- 4. CUSTOMER FOLLOW-UPS
INSERT INTO customer_followups (id, customer_id, follow_up_date, notes, created_by)
VALUES
    (gen_random_uuid(), '20000000-0000-0000-0000-000000000001', CURRENT_DATE - INTERVAL '5 days', 'Discussed requirements for industrial drills. Sent updated product catalog.', '00000000-0000-0000-0000-000000000002'),
    (gen_random_uuid(), '20000000-0000-0000-0000-000000000001', CURRENT_DATE + INTERVAL '2 days', 'Scheduled call to confirm 15 units of floodlight order.', '00000000-0000-0000-0000-000000000002'),
    (gen_random_uuid(), '20000000-0000-0000-0000-000000000003', CURRENT_DATE, 'Sent formal quotation for 25 drills and 50 kits with 5% wholesale discount.', '00000000-0000-0000-0000-000000000002'),
    (gen_random_uuid(), '20000000-0000-0000-0000-000000000007', CURRENT_DATE, 'Contacted Ms. Sneha. She will review our price list and revert by Friday.', '00000000-0000-0000-0000-000000000002')
ON CONFLICT DO NOTHING;

-- 5. INITIAL STOCK MOVEMENTS (IN)
INSERT INTO stock_movements (id, product_id, quantity, movement_type, reason, created_by)
VALUES
    (gen_random_uuid(), '10000000-0000-0000-0000-000000000001', 50, 'IN', 'Initial Warehouse Batch Intake - Batch #2026-A1', '00000000-0000-0000-0000-000000000003'),
    (gen_random_uuid(), '10000000-0000-0000-0000-000000000002', 100, 'IN', 'Factory Shipment Receipt PO-8891', '00000000-0000-0000-0000-000000000003'),
    (gen_random_uuid(), '10000000-0000-0000-0000-000000000003', 150, 'IN', 'Safety Gear Supplier Bulk Arrival', '00000000-0000-0000-0000-000000000003'),
    (gen_random_uuid(), '10000000-0000-0000-0000-000000000004', 12, 'IN', 'Stock Adjustment / Return from Demo', '00000000-0000-0000-0000-000000000003'),
    (gen_random_uuid(), '10000000-0000-0000-0000-000000000005', 8, 'IN', 'Restock PO-9011', '00000000-0000-0000-0000-000000000003')
ON CONFLICT DO NOTHING;

-- 6. SAMPLE CHALLANS (1 Confirmed, 1 Draft)
INSERT INTO challans (id, challan_number, customer_id, total_quantity, total_amount, status, created_by)
VALUES
    ('30000000-0000-0000-0000-000000000001', 'CH-2026-0001', '20000000-0000-0000-0000-000000000001', 5, 12250.00, 'CONFIRMED', '00000000-0000-0000-0000-000000000002'),
    ('30000000-0000-0000-0000-000000000002', 'CH-2026-0002', '20000000-0000-0000-0000-000000000002', 15, 27750.00, 'DRAFT', '00000000-0000-0000-0000-000000000002')
ON CONFLICT (challan_number) DO NOTHING;

-- 7. CHALLAN ITEMS (Product Snapshots)
INSERT INTO challan_items (id, challan_id, product_id, product_name, sku, unit_price, quantity, total_price)
VALUES
    (gen_random_uuid(), '30000000-0000-0000-0000-000000000001', '10000000-0000-0000-0000-000000000001', 'Heavy Duty Industrial Drill 750W', 'TOOL-DRL-750', 2450.00, 5, 12250.00),
    (gen_random_uuid(), '30000000-0000-0000-0000-000000000002', '10000000-0000-0000-0000-000000000006', 'LED Industrial Floodlight 100W', 'ELEC-FLD-100', 1850.00, 15, 27750.00)
ON CONFLICT DO NOTHING;
