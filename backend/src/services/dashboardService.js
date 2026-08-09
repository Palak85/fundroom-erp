const { localStore, isConfigured, supabase } = require('../config/db');

const getDashboardStats = async () => {
  const todayStr = new Date().toISOString().split('T')[0];

  let customers = localStore.customers;
  let products = localStore.products;
  let challans = localStore.challans;
  let followups = localStore.customer_followups;
  let stockMovements = localStore.stock_movements;

  if (isConfigured && supabase) {
    const [cRes, pRes, chRes, fRes, smRes] = await Promise.all([
      supabase.from('customers').select('*'),
      supabase.from('products').select('*'),
      supabase.from('challans').select('*, customers:customer_id(customer_name, business_name)'),
      supabase.from('customer_followups').select('*, customers:customer_id(customer_name, mobile)'),
      supabase.from('stock_movements').select('*, products:product_id(product_name, sku)')
    ]);

    if (!cRes.error && cRes.data) customers = cRes.data;
    if (!pRes.error && pRes.data) products = pRes.data;
    if (!chRes.error && chRes.data) {
      challans = chRes.data.map(c => ({
        ...c,
        customer_name: c.customers?.customer_name,
        business_name: c.customers?.business_name
      }));
    }
    if (!fRes.error && fRes.data) {
      followups = fRes.data.map(f => ({
        ...f,
        customer_name: f.customers?.customer_name,
        mobile: f.customers?.mobile
      }));
    }
    if (!smRes.error && smRes.data) {
      stockMovements = smRes.data.map(sm => ({
        ...sm,
        product_name: sm.products?.product_name,
        sku: sm.products?.sku
      }));
    }
  }

  // KPIs
  const totalCustomers = customers.length;
  const activeCustomers = customers.filter(c => c.status === 'Active').length;
  const leadCustomers = customers.filter(c => c.status === 'Lead').length;
  const totalProducts = products.length;
  const lowStockProductsList = products.filter(p => p.current_stock <= p.minimum_stock);
  const lowStockCount = lowStockProductsList.length;
  const draftChallans = challans.filter(c => c.status === 'DRAFT').length;
  const confirmedChallans = challans.filter(c => c.status === 'CONFIRMED').length;
  const totalRevenue = challans
    .filter(c => c.status === 'CONFIRMED')
    .reduce((sum, c) => sum + (parseFloat(c.total_amount) || 0), 0);

  const todaysFollowups = customers.filter(c => c.follow_up_date === todayStr);

  // Charts
  // 1. Customer Type distribution
  const customerTypeDist = [
    { name: 'Wholesale', value: customers.filter(c => c.customer_type === 'Wholesale').length },
    { name: 'Distributor', value: customers.filter(c => c.customer_type === 'Distributor').length },
    { name: 'Retail', value: customers.filter(c => c.customer_type === 'Retail').length }
  ];

  // 2. Customer Status distribution
  const customerStatusDist = [
    { name: 'Active', value: activeCustomers, color: '#10B981' },
    { name: 'Lead', value: leadCustomers, color: '#3B82F6' },
    { name: 'Inactive', value: customers.filter(c => c.status === 'Inactive').length, color: '#9CA3AF' }
  ];

  // 3. Category Inventory breakdown
  const categoryMap = {};
  products.forEach(p => {
    if (!categoryMap[p.category]) categoryMap[p.category] = { category: p.category, stock: 0, productsCount: 0 };
    categoryMap[p.category].stock += p.current_stock;
    categoryMap[p.category].productsCount += 1;
  });
  const inventoryCategoryBreakdown = Object.values(categoryMap);

  // 4. Challan monthly / status overview
  const challanStatusOverview = [
    { name: 'Confirmed', count: confirmedChallans, color: '#10B981' },
    { name: 'Draft', count: draftChallans, color: '#F59E0B' },
    { name: 'Cancelled', count: challans.filter(c => c.status === 'CANCELLED').length, color: '#EF4444' }
  ];

  // Recent Activities
  const recentChallans = [...challans]
    .sort((a, b) => new Date(b.created_at) - new Date(a.created_at))
    .slice(0, 5);

  const recentStockMovements = [...stockMovements]
    .sort((a, b) => new Date(b.created_at) - new Date(a.created_at))
    .slice(0, 5);

  const upcomingFollowups = [...customers]
    .filter(c => c.follow_up_date)
    .sort((a, b) => new Date(a.follow_up_date) - new Date(b.follow_up_date))
    .slice(0, 5);

  return {
    kpis: {
      totalCustomers,
      activeCustomers,
      totalProducts,
      lowStockProducts: lowStockCount,
      draftChallans,
      confirmedChallans,
      todaysFollowupsCount: todaysFollowups.length,
      totalRevenue
    },
    charts: {
      customerTypeDist,
      customerStatusDist,
      inventoryCategoryBreakdown,
      challanStatusOverview
    },
    recentActivities: {
      recentChallans,
      recentStockMovements,
      upcomingFollowups,
      lowStockProducts: lowStockProductsList.slice(0, 5)
    }
  };
};

module.exports = {
  getDashboardStats
};
