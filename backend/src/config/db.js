const { supabase, isConfigured } = require('./supabase');
const bcrypt = require('bcryptjs');

// Built-in seed data for immediate local execution or offline verification
const defaultPasswordHash = bcrypt.hashSync('Password@123', 10);

const localStore = {
  users: [
    { id: '00000000-0000-0000-0000-000000000001', name: 'Admin Officer', email: 'admin@example.com', password_hash: defaultPasswordHash, role: 'Admin', created_at: new Date().toISOString() },
    { id: '00000000-0000-0000-0000-000000000002', name: 'Sarah Sales Lead', email: 'sales@example.com', password_hash: defaultPasswordHash, role: 'Sales', created_at: new Date().toISOString() },
    { id: '00000000-0000-0000-0000-000000000003', name: 'Warren Warehouse Manager', email: 'warehouse@example.com', password_hash: defaultPasswordHash, role: 'Warehouse', created_at: new Date().toISOString() },
    { id: '00000000-0000-0000-0000-000000000004', name: 'Alice Accounts Exec', email: 'accounts@example.com', password_hash: defaultPasswordHash, role: 'Accounts', created_at: new Date().toISOString() }
  ],
  customers: [
    {
      id: '20000000-0000-0000-0000-000000000001',
      customer_name: 'Rajesh Sharma',
      mobile: '+91 98765 43210',
      email: 'rajesh@sharmahardware.com',
      business_name: 'Sharma Hardware & Building Materials',
      gst_number: '27AAACS1234A1Z5',
      customer_type: 'Wholesale',
      address: 'Shop 12, Industrial Area Phase 1, Mumbai, MH',
      status: 'Active',
      follow_up_date: new Date(Date.now() + 2 * 86400000).toISOString().split('T')[0],
      notes: 'Regular wholesale client. Interested in bulk order of floodlights next week.',
      created_at: new Date(Date.now() - 30 * 86400000).toISOString(),
      updated_at: new Date().toISOString()
    },
    {
      id: '20000000-0000-0000-0000-000000000002',
      customer_name: 'Amitabh Verma',
      mobile: '+91 98220 11223',
      email: 'averma@apexdistributors.in',
      business_name: 'Apex Industrial Distributors Ltd',
      gst_number: '29BBBCV5678B2Z1',
      customer_type: 'Distributor',
      address: 'Plot 45, Peenya Industrial Complex, Bengaluru, KA',
      status: 'Active',
      follow_up_date: new Date(Date.now() + 1 * 86400000).toISOString().split('T')[0],
      notes: 'Quarterly supply contract renewal in discussion.',
      created_at: new Date(Date.now() - 25 * 86400000).toISOString(),
      updated_at: new Date().toISOString()
    },
    {
      id: '20000000-0000-0000-0000-000000000003',
      customer_name: 'Kavita Patel',
      mobile: '+91 97123 99887',
      email: 'kavita@pateltools.com',
      business_name: 'Patel Power Tools & Machinery',
      gst_number: '24CCCDP9012C3Z7',
      customer_type: 'Retail',
      address: '104 GIDC Estate, Ahmedabad, GJ',
      status: 'Lead',
      follow_up_date: new Date().toISOString().split('T')[0],
      notes: 'Requested quotation for 25 drills and 50 screwdriver kits.',
      created_at: new Date(Date.now() - 10 * 86400000).toISOString(),
      updated_at: new Date().toISOString()
    },
    {
      id: '20000000-0000-0000-0000-000000000004',
      customer_name: 'Sunil Narang',
      mobile: '+91 98110 55443',
      email: 'snarang@delhiconstruct.com',
      business_name: 'Delhi Infra Projects & Supply',
      gst_number: '07DDDEN3456D4Z2',
      customer_type: 'Wholesale',
      address: 'C-88 Okhla Phase 3, New Delhi, DL',
      status: 'Active',
      follow_up_date: new Date(Date.now() + 5 * 86400000).toISOString().split('T')[0],
      notes: 'Consistently orders safety gear and cable reels.',
      created_at: new Date(Date.now() - 15 * 86400000).toISOString(),
      updated_at: new Date().toISOString()
    },
    {
      id: '20000000-0000-0000-0000-000000000005',
      customer_name: 'Vikramaditya Roy',
      mobile: '+91 99030 77665',
      email: 'vroy@bengalindustrial.co',
      business_name: 'Bengal Industrial Supply Corp',
      gst_number: '19EEEFR7890E5Z8',
      customer_type: 'Distributor',
      address: '7 Sector V, Salt Lake, Kolkata, WB',
      status: 'Active',
      follow_up_date: new Date(Date.now() + 7 * 86400000).toISOString().split('T')[0],
      notes: 'Payment terms 30 days. Good credit track record.',
      created_at: new Date(Date.now() - 12 * 86400000).toISOString(),
      updated_at: new Date().toISOString()
    },
    {
      id: '20000000-0000-0000-0000-000000000006',
      customer_name: 'Manoj Gowda',
      mobile: '+91 98450 33221',
      email: 'manoj@deccantrading.in',
      business_name: 'Deccan Heavy Equipments',
      gst_number: '29FFFMG2345F6Z3',
      customer_type: 'Wholesale',
      address: '22 Belgaum Road, Hubli, KA',
      status: 'Inactive',
      follow_up_date: null,
      notes: 'Account dormant for 3 months due to warehouse relocation.',
      created_at: new Date(Date.now() - 90 * 86400000).toISOString(),
      updated_at: new Date().toISOString()
    },
    {
      id: '20000000-0000-0000-0000-000000000007',
      customer_name: 'Sneha Deshmukh',
      mobile: '+91 98900 66778',
      email: 'sneha@punecontracts.com',
      business_name: 'Pune Buildcon Solutions',
      gst_number: '27GGGSD6789G7Z9',
      customer_type: 'Lead',
      address: 'Shop 4, Hadapsar Industrial Area, Pune, MH',
      status: 'Lead',
      follow_up_date: new Date().toISOString().split('T')[0],
      notes: 'New inquiry from trade expo. Follow up on product catalog sent.',
      created_at: new Date(Date.now() - 2 * 86400000).toISOString(),
      updated_at: new Date().toISOString()
    },
    {
      id: '20000000-0000-0000-0000-000000000008',
      customer_name: 'Harvinder Singh',
      mobile: '+91 98140 12345',
      email: 'harvinder@singhmachines.in',
      business_name: 'Singh & Sons Machinery Mart',
      gst_number: '03HHHHS0123H8Z4',
      customer_type: 'Wholesale',
      address: 'GT Road, Miller Ganj, Ludhiana, PB',
      status: 'Active',
      follow_up_date: new Date(Date.now() + 3 * 86400000).toISOString().split('T')[0],
      notes: 'Needs urgent delivery of hydraulic jacks.',
      created_at: new Date(Date.now() - 40 * 86400000).toISOString(),
      updated_at: new Date().toISOString()
    },
    {
      id: '20000000-0000-0000-0000-000000000009',
      customer_name: 'Priya Sundaram',
      mobile: '+91 94440 98765',
      email: 'priya@chennaipower.com',
      business_name: 'Chennai Electricals & Automation',
      gst_number: '33IIIKP4567I9Z0',
      customer_type: 'Retail',
      address: '88 Mount Road, Guindy, Chennai, TN',
      status: 'Active',
      follow_up_date: new Date(Date.now() + 4 * 86400000).toISOString().split('T')[0],
      notes: 'Requested bulk discount tier pricing for copper wire spools.',
      created_at: new Date(Date.now() - 18 * 86400000).toISOString(),
      updated_at: new Date().toISOString()
    },
    {
      id: '20000000-0000-0000-0000-000000000010',
      customer_name: 'Deepak Agarwal',
      mobile: '+91 94140 54321',
      email: 'deepak@rajasthaninfra.com',
      business_name: 'Jaipur Safety & Tools Depot',
      gst_number: '08JJJDA8901J0Z5',
      customer_type: 'Wholesale',
      address: '14 VKIA Area, Jaipur, RJ',
      status: 'Lead',
      follow_up_date: new Date(Date.now() + 1 * 86400000).toISOString().split('T')[0],
      notes: 'Follow-up call scheduled regarding sample order.',
      created_at: new Date(Date.now() - 5 * 86400000).toISOString(),
      updated_at: new Date().toISOString()
    }
  ],
  customer_followups: [
    {
      id: '40000000-0000-0000-0000-000000000001',
      customer_id: '20000000-0000-0000-0000-000000000001',
      follow_up_date: new Date(Date.now() - 5 * 86400000).toISOString().split('T')[0],
      notes: 'Discussed requirements for industrial drills. Sent updated product catalog.',
      created_by: '00000000-0000-0000-0000-000000000002',
      created_by_user: { name: 'Sarah Sales Lead', email: 'sales@example.com' },
      created_at: new Date(Date.now() - 5 * 86400000).toISOString()
    },
    {
      id: '40000000-0000-0000-0000-000000000002',
      customer_id: '20000000-0000-0000-0000-000000000001',
      follow_up_date: new Date(Date.now() + 2 * 86400000).toISOString().split('T')[0],
      notes: 'Scheduled call to confirm 15 units of floodlight order.',
      created_by: '00000000-0000-0000-0000-000000000002',
      created_by_user: { name: 'Sarah Sales Lead', email: 'sales@example.com' },
      created_at: new Date(Date.now() - 1 * 86400000).toISOString()
    },
    {
      id: '40000000-0000-0000-0000-000000000003',
      customer_id: '20000000-0000-0000-0000-000000000003',
      follow_up_date: new Date().toISOString().split('T')[0],
      notes: 'Sent formal quotation for 25 drills and 50 kits with 5% wholesale discount.',
      created_by: '00000000-0000-0000-0000-000000000002',
      created_by_user: { name: 'Sarah Sales Lead', email: 'sales@example.com' },
      created_at: new Date().toISOString()
    },
    {
      id: '40000000-0000-0000-0000-000000000004',
      customer_id: '20000000-0000-0000-0000-000000000007',
      follow_up_date: new Date().toISOString().split('T')[0],
      notes: 'Contacted Ms. Sneha. She will review our price list and revert by Friday.',
      created_by: '00000000-0000-0000-0000-000000000002',
      created_by_user: { name: 'Sarah Sales Lead', email: 'sales@example.com' },
      created_at: new Date().toISOString()
    }
  ],
  products: [
    { id: '10000000-0000-0000-0000-000000000001', product_name: 'Heavy Duty Industrial Drill 750W', sku: 'TOOL-DRL-750', category: 'Hardware & Tools', unit_price: 2450.00, current_stock: 45, minimum_stock: 10, warehouse_location: 'Aisle 1 - Bay B3', image_url: 'https://images.unsplash.com/photo-1504148455328-c376907d081c?w=400', created_at: new Date().toISOString(), updated_at: new Date().toISOString() },
    { id: '10000000-0000-0000-0000-000000000002', product_name: 'Copper Wire Spool 50m (2.5mm)', sku: 'ELEC-CPR-50M', category: 'Electrical', unit_price: 1200.00, current_stock: 80, minimum_stock: 20, warehouse_location: 'Aisle 2 - Shelf 1', image_url: 'https://images.unsplash.com/photo-1558346490-a72e53ae2d4f?w=400', created_at: new Date().toISOString(), updated_at: new Date().toISOString() },
    { id: '10000000-0000-0000-0000-000000000003', product_name: 'Steel Safety Helmet (ANSI Certified)', sku: 'SAFE-HLM-001', category: 'Safety Gear', unit_price: 450.00, current_stock: 150, minimum_stock: 25, warehouse_location: 'Aisle 4 - Bin 12', image_url: 'https://images.unsplash.com/photo-1578873375972-04a6cb1b5ec0?w=400', created_at: new Date().toISOString(), updated_at: new Date().toISOString() },
    { id: '10000000-0000-0000-0000-000000000004', product_name: 'Precision Screwdriver Kit (48-in-1)', sku: 'TOOL-PRC-48K', category: 'Hardware & Tools', unit_price: 850.00, current_stock: 12, minimum_stock: 15, warehouse_location: 'Aisle 1 - Shelf 4', image_url: 'https://images.unsplash.com/photo-1581147036324-c17ac41dfa6c?w=400', created_at: new Date().toISOString(), updated_at: new Date().toISOString() },
    { id: '10000000-0000-0000-0000-000000000005', product_name: 'High-Grade Nitrile Gloves (Box of 100)', sku: 'SAFE-GLV-100', category: 'Safety Gear', unit_price: 350.00, current_stock: 8, minimum_stock: 30, warehouse_location: 'Aisle 4 - Bin 08', image_url: 'https://images.unsplash.com/photo-1584744982491-665216d95f8b?w=400', created_at: new Date().toISOString(), updated_at: new Date().toISOString() },
    { id: '10000000-0000-0000-0000-000000000006', product_name: 'LED Industrial Floodlight 100W', sku: 'ELEC-FLD-100', category: 'Electrical', unit_price: 1850.00, current_stock: 35, minimum_stock: 10, warehouse_location: 'Aisle 2 - Shelf 5', image_url: 'https://images.unsplash.com/photo-1565814636199-ae8133055c1c?w=400', created_at: new Date().toISOString(), updated_at: new Date().toISOString() },
    { id: '10000000-0000-0000-0000-000000000007', product_name: 'Hydraulic Floor Jack 3 Ton', sku: 'MECH-JCK-03T', category: 'Machinery', unit_price: 6500.00, current_stock: 18, minimum_stock: 5, warehouse_location: 'Heavy Storage Zone H2', image_url: 'https://images.unsplash.com/photo-1580983218765-f663bec07b37?w=400', created_at: new Date().toISOString(), updated_at: new Date().toISOString() },
    { id: '10000000-0000-0000-0000-000000000008', product_name: 'Polyurethane Foam Sealant (750ml)', sku: 'CHEM-SEA-750', category: 'Chemicals', unit_price: 290.00, current_stock: 120, minimum_stock: 20, warehouse_location: 'Aisle 3 - Rack C1', image_url: 'https://images.unsplash.com/photo-1518770660439-4636190af475?w=400', created_at: new Date().toISOString(), updated_at: new Date().toISOString() },
    { id: '10000000-0000-0000-0000-000000000009', product_name: 'Digital Multimeter AC/DC Pro', sku: 'ELEC-MMT-PRO', category: 'Electrical', unit_price: 1600.00, current_stock: 22, minimum_stock: 10, warehouse_location: 'Aisle 2 - Cabinet A', image_url: 'https://images.unsplash.com/photo-1581092160607-ee22621dd758?w=400', created_at: new Date().toISOString(), updated_at: new Date().toISOString() },
    { id: '10000000-0000-0000-0000-000000000010', product_name: 'Heavy Duty Cargo Straps (4 Pack)', sku: 'PACK-STR-04P', category: 'Packaging', unit_price: 720.00, current_stock: 65, minimum_stock: 15, warehouse_location: 'Aisle 5 - Box 02', image_url: 'https://images.unsplash.com/photo-1586528116311-ad8dd3c8310d?w=400', created_at: new Date().toISOString(), updated_at: new Date().toISOString() }
  ],
  stock_movements: [
    { id: '50000000-0000-0000-0000-000000000001', product_id: '10000000-0000-0000-0000-000000000001', product_name: 'Heavy Duty Industrial Drill 750W', sku: 'TOOL-DRL-750', quantity: 50, movement_type: 'IN', reason: 'Initial Warehouse Batch Intake - Batch #2026-A1', created_by: '00000000-0000-0000-0000-000000000003', created_by_name: 'Warren Warehouse Manager', created_at: new Date(Date.now() - 10 * 86400000).toISOString() },
    { id: '50000000-0000-0000-0000-000000000002', product_id: '10000000-0000-0000-0000-000000000002', product_name: 'Copper Wire Spool 50m (2.5mm)', sku: 'ELEC-CPR-50M', quantity: 100, movement_type: 'IN', reason: 'Factory Shipment Receipt PO-8891', created_by: '00000000-0000-0000-0000-000000000003', created_by_name: 'Warren Warehouse Manager', created_at: new Date(Date.now() - 8 * 86400000).toISOString() },
    { id: '50000000-0000-0000-0000-000000000003', product_id: '10000000-0000-0000-0000-000000000003', product_name: 'Steel Safety Helmet (ANSI Certified)', sku: 'SAFE-HLM-001', quantity: 150, movement_type: 'IN', reason: 'Safety Gear Supplier Bulk Arrival', created_by: '00000000-0000-0000-0000-000000000003', created_by_name: 'Warren Warehouse Manager', created_at: new Date(Date.now() - 7 * 86400000).toISOString() },
    { id: '50000000-0000-0000-0000-000000000004', product_id: '10000000-0000-0000-0000-000000000001', product_name: 'Heavy Duty Industrial Drill 750W', sku: 'TOOL-DRL-750', quantity: 5, movement_type: 'OUT', reason: 'Challan Confirmed: CH-2026-0001', created_by: '00000000-0000-0000-0000-000000000002', created_by_name: 'Sarah Sales Lead', created_at: new Date(Date.now() - 2 * 86400000).toISOString() }
  ],
  challans: [
    {
      id: '30000000-0000-0000-0000-000000000001',
      challan_number: 'CH-2026-0001',
      customer_id: '20000000-0000-0000-0000-000000000001',
      customer_name: 'Rajesh Sharma',
      business_name: 'Sharma Hardware & Building Materials',
      total_quantity: 5,
      total_amount: 12250.00,
      status: 'CONFIRMED',
      created_by: '00000000-0000-0000-0000-000000000002',
      created_by_name: 'Sarah Sales Lead',
      created_at: new Date(Date.now() - 2 * 86400000).toISOString(),
      updated_at: new Date(Date.now() - 2 * 86400000).toISOString(),
      items: [
        {
          id: '60000000-0000-0000-0000-000000000001',
          challan_id: '30000000-0000-0000-0000-000000000001',
          product_id: '10000000-0000-0000-0000-000000000001',
          product_name: 'Heavy Duty Industrial Drill 750W',
          sku: 'TOOL-DRL-750',
          unit_price: 2450.00,
          quantity: 5,
          total_price: 12250.00,
          created_at: new Date(Date.now() - 2 * 86400000).toISOString()
        }
      ]
    },
    {
      id: '30000000-0000-0000-0000-000000000002',
      challan_number: 'CH-2026-0002',
      customer_id: '20000000-0000-0000-0000-000000000002',
      customer_name: 'Amitabh Verma',
      business_name: 'Apex Industrial Distributors Ltd',
      total_quantity: 15,
      total_amount: 27750.00,
      status: 'DRAFT',
      created_by: '00000000-0000-0000-0000-000000000002',
      created_by_name: 'Sarah Sales Lead',
      created_at: new Date(Date.now() - 1 * 86400000).toISOString(),
      updated_at: new Date(Date.now() - 1 * 86400000).toISOString(),
      items: [
        {
          id: '60000000-0000-0000-0000-000000000002',
          challan_id: '30000000-0000-0000-0000-000000000002',
          product_id: '10000000-0000-0000-0000-000000000006',
          product_name: 'LED Industrial Floodlight 100W',
          sku: 'ELEC-FLD-100',
          unit_price: 1850.00,
          quantity: 15,
          total_price: 27750.00,
          created_at: new Date(Date.now() - 1 * 86400000).toISOString()
        }
      ]
    }
  ]
};

module.exports = {
  supabase,
  isConfigured,
  localStore
};
