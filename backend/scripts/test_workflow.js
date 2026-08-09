const app = require('../src/app');
const http = require('http');

let server;
let baseUrl;

const makeRequest = async (path, { method = 'GET', headers = {}, body = null } = {}) => {
  const url = `${baseUrl}${path}`;
  const options = {
    method,
    headers: {
      'Content-Type': 'application/json',
      ...headers
    }
  };

  if (body) {
    options.body = JSON.stringify(body);
  }

  const res = await fetch(url, options);
  const data = await res.json().catch(() => ({}));
  return { status: res.status, data };
};

const runTests = async () => {
  console.log('🧪 Starting Mini ERP + CRM Verification Suite...\n');

  // Start test server on dynamic port
  server = http.createServer(app);
  await new Promise((resolve) => server.listen(0, resolve));
  const port = server.address().port;
  baseUrl = `http://localhost:${port}`;

  let passed = 0;
  let total = 0;

  const assert = (condition, testName, extraInfo = '') => {
    total++;
    if (condition) {
      console.log(`✅ [PASS] ${testName}`);
      passed++;
    } else {
      console.error(`❌ [FAIL] ${testName} - ${extraInfo}`);
    }
  };

  try {
    // 1. Health Check
    const health = await makeRequest('/api/health');
    assert(health.status === 200 && health.data.success, 'GET /api/health returns 200 OK');

    // 2. Login as Admin
    const adminLogin = await makeRequest('/api/auth/login', {
      method: 'POST',
      body: { email: 'admin@example.com', password: 'Password@123' }
    });
    assert(adminLogin.status === 200 && adminLogin.data.token && adminLogin.data.user.role === 'Admin', 'Admin login successful with JWT');
    const adminToken = adminLogin.data.token;

    // 3. Login as Sales
    const salesLogin = await makeRequest('/api/auth/login', {
      method: 'POST',
      body: { email: 'sales@example.com', password: 'Password@123' }
    });
    assert(salesLogin.status === 200 && salesLogin.data.user.role === 'Sales', 'Sales login successful');
    const salesToken = salesLogin.data.token;

    // 4. Login as Warehouse
    const whLogin = await makeRequest('/api/auth/login', {
      method: 'POST',
      body: { email: 'warehouse@example.com', password: 'Password@123' }
    });
    assert(whLogin.status === 200 && whLogin.data.user.role === 'Warehouse', 'Warehouse login successful');
    const whToken = whLogin.data.token;

    // 5. Invalid Login
    const invalidLogin = await makeRequest('/api/auth/login', {
      method: 'POST',
      body: { email: 'admin@example.com', password: 'wrongPassword' }
    });
    assert(invalidLogin.status === 401 && !invalidLogin.data.success, 'Invalid credentials rejected with 401 Unauthorized');

    // 6. Role Authorization (RBAC): Sales trying to access /api/users (Admin only)
    const salesAccessUsers = await makeRequest('/api/users', {
      headers: { Authorization: `Bearer ${salesToken}` }
    });
    assert(salesAccessUsers.status === 403, 'RBAC check: Sales forbidden (403) from /api/users');

    // Admin accessing /api/users
    const adminAccessUsers = await makeRequest('/api/users', {
      headers: { Authorization: `Bearer ${adminToken}` }
    });
    assert(adminAccessUsers.status === 200 && Array.isArray(adminAccessUsers.data.data), 'RBAC check: Admin allowed (200) to /api/users');

    // 7. Create Customer
    const newCustomerRes = await makeRequest('/api/customers', {
      method: 'POST',
      headers: { Authorization: `Bearer ${salesToken}` },
      body: {
        customer_name: 'Test Enterprise Ltd',
        mobile: '+91 99999 88888',
        email: 'contact@testenterprise.com',
        business_name: 'Test Enterprise Solutions',
        gst_number: '27AAAAA0000A1Z5',
        customer_type: 'Wholesale',
        address: 'Sector 5, Industrial Area, Pune',
        status: 'Active'
      }
    });
    assert(newCustomerRes.status === 201 && newCustomerRes.data.data.customer_name === 'Test Enterprise Ltd', 'Create customer (201 Created)');
    const createdCustomerId = newCustomerRes.data.data.id;

    // 8. Search & Filter Customer
    const searchRes = await makeRequest('/api/customers?search=Test%20Enterprise', {
      headers: { Authorization: `Bearer ${salesToken}` }
    });
    assert(searchRes.status === 200 && searchRes.data.data.length > 0, 'Search customer by name returns matching record');

    // 9. Add Follow-up Note to Customer
    const followupRes = await makeRequest(`/api/customers/${createdCustomerId}/followups`, {
      method: 'POST',
      headers: { Authorization: `Bearer ${salesToken}` },
      body: {
        follow_up_date: new Date(Date.now() + 86400000).toISOString().split('T')[0],
        notes: 'Followed up via telephone. Sent quotation for new season products.'
      }
    });
    assert(followupRes.status === 201 && followupRes.data.data.notes.includes('quotation'), 'Add customer follow-up note');

    // 10. Create Product with initial stock
    const newProductRes = await makeRequest('/api/products', {
      method: 'POST',
      headers: { Authorization: `Bearer ${whToken}` },
      body: {
        product_name: 'Industrial Torque Wrench Pro',
        sku: 'TEST-TRQ-001',
        category: 'Hardware & Tools',
        unit_price: 1500.00,
        current_stock: 20,
        minimum_stock: 5,
        warehouse_location: 'Bay T-01'
      }
    });
    assert(newProductRes.status === 201 && newProductRes.data.data.current_stock === 20, 'Create product with initial stock 20 (201 Created)');
    const createdProductId = newProductRes.data.data.id;

    // 11. Duplicate SKU check
    const dupSkuRes = await makeRequest('/api/products', {
      method: 'POST',
      headers: { Authorization: `Bearer ${whToken}` },
      body: {
        product_name: 'Another Wrench',
        sku: 'TEST-TRQ-001',
        category: 'Hardware & Tools',
        unit_price: 1500.00,
        current_stock: 10,
        minimum_stock: 2
      }
    });
    assert(dupSkuRes.status === 409, 'Duplicate SKU rejected with 409 Conflict');

    // 12. Stock IN
    const stockInRes = await makeRequest(`/api/products/${createdProductId}/stock-in`, {
      method: 'POST',
      headers: { Authorization: `Bearer ${whToken}` },
      body: { quantity: 10, reason: 'Restock Batch #9921' }
    });
    assert(stockInRes.status === 200 && stockInRes.data.data.product.current_stock === 30, 'Stock IN: current_stock increased from 20 to 30');

    // 13. Stock OUT with Insufficient Stock
    const stockOutFail = await makeRequest(`/api/products/${createdProductId}/stock-out`, {
      method: 'POST',
      headers: { Authorization: `Bearer ${whToken}` },
      body: { quantity: 50, reason: 'Excessive Dispatch' }
    });
    assert(stockOutFail.status === 400 && stockOutFail.data.message.includes('Insufficient stock'), 'Stock OUT with insufficient quantity rejected (400)');

    // 14. Create DRAFT Challan -> Stock must remain UNCHANGED
    const draftChallanRes = await makeRequest('/api/challans', {
      method: 'POST',
      headers: { Authorization: `Bearer ${salesToken}` },
      body: {
        customer_id: createdCustomerId,
        status: 'DRAFT',
        items: [
          { product_id: createdProductId, quantity: 10 }
        ]
      }
    });
    assert(draftChallanRes.status === 201 && draftChallanRes.data.data.status === 'DRAFT', 'Create DRAFT Challan');
    const draftChallanId = draftChallanRes.data.data.id;

    // Check product stock: MUST STILL BE 30
    const prodAfterDraft = await makeRequest(`/api/products/${createdProductId}`, {
      headers: { Authorization: `Bearer ${whToken}` }
    });
    assert(prodAfterDraft.data.data.current_stock === 30, 'CRITICAL: Stock is UNCHANGED (30) after saving DRAFT challan');

    // 15. Attempt to confirm a challan that exceeds stock
    const bigDraftRes = await makeRequest('/api/challans', {
      method: 'POST',
      headers: { Authorization: `Bearer ${salesToken}` },
      body: {
        customer_id: createdCustomerId,
        status: 'DRAFT',
        items: [
          { product_id: createdProductId, quantity: 100 } // only 30 available
        ]
      }
    });
    const bigChallanId = bigDraftRes.data.data.id;
    const confirmFailRes = await makeRequest(`/api/challans/${bigChallanId}/confirm`, {
      method: 'POST',
      headers: { Authorization: `Bearer ${salesToken}` }
    });
    assert(confirmFailRes.status === 400 && confirmFailRes.data.message.includes('Insufficient stock'), 'CRITICAL: Insufficient stock blocks confirmation with 400 Bad Request');

    // Product stock still 30
    const prodAfterFail = await makeRequest(`/api/products/${createdProductId}`, {
      headers: { Authorization: `Bearer ${whToken}` }
    });
    assert(prodAfterFail.data.data.current_stock === 30, 'CRITICAL: Stock remains 30 after failed confirmation attempt (No partial deduction)');

    // 16. Confirm valid Draft Challan (quantity 10)
    const confirmValidRes = await makeRequest(`/api/challans/${draftChallanId}/confirm`, {
      method: 'POST',
      headers: { Authorization: `Bearer ${salesToken}` }
    });
    assert(confirmValidRes.status === 200 && confirmValidRes.data.data.status === 'CONFIRMED', 'Challan confirmation succeeds (200 OK)');

    // Check product stock: MUST NOW BE 20 (30 - 10)
    const prodAfterConfirm = await makeRequest(`/api/products/${createdProductId}`, {
      headers: { Authorization: `Bearer ${whToken}` }
    });
    assert(prodAfterConfirm.data.data.current_stock === 20, 'CRITICAL: Stock decreased from 30 to 20 on confirmation');

    // Check stock movements for OUT movement
    const movementsRes = await makeRequest(`/api/products/${createdProductId}/stock-movements`, {
      headers: { Authorization: `Bearer ${whToken}` }
    });
    const outMovements = movementsRes.data.data.filter(m => m.movement_type === 'OUT');
    assert(outMovements.length > 0 && outMovements[0].quantity === 10, 'OUT Stock Movement recorded automatically on challan confirmation');

    // 17. Dashboard Stats
    const dashRes = await makeRequest('/api/dashboard/stats', {
      headers: { Authorization: `Bearer ${adminToken}` }
    });
    assert(dashRes.status === 200 && dashRes.data.data.kpis.totalCustomers > 0, 'Dashboard stats API returns aggregated KPIs & charts');

    console.log(`\n==================================================`);
    console.log(`Test Summary: ${passed}/${total} assertions passed (${Math.round((passed/total)*100)}%)`);
    console.log(`==================================================\n`);

  } catch (err) {
    console.error('Test runner exception:', err);
  } finally {
    server.close();
  }
};

if (require.main === module) {
  runTests();
}

module.exports = runTests;
