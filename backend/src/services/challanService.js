const { localStore, isConfigured, supabase } = require('../config/db');
const customerService = require('./customerService');
const productService = require('./productService');

// Automatic Challan Number Generator: CH-YYYY-XXXX
const generateNextChallanNumber = async () => {
  const currentYear = new Date().getFullYear();
  const prefix = `CH-${currentYear}-`;

  let lastNumber = 0;

  if (isConfigured && supabase) {
    const { data, error } = await supabase
      .from('challans')
      .select('challan_number')
      .ilike('challan_number', `${prefix}%`)
      .order('created_at', { ascending: false })
      .limit(1);

    if (!error && data && data.length > 0) {
      const match = data[0].challan_number.match(/CH-\d{4}-(\d+)/);
      if (match) {
        lastNumber = parseInt(match[1], 10);
      }
    }
  } else {
    const yearChallans = localStore.challans.filter(c => c.challan_number && c.challan_number.startsWith(prefix));
    if (yearChallans.length > 0) {
      const numbers = yearChallans.map(c => {
        const match = c.challan_number.match(/CH-\d{4}-(\d+)/);
        return match ? parseInt(match[1], 10) : 0;
      });
      lastNumber = Math.max(...numbers, 0);
    }
  }

  const nextSeq = String(lastNumber + 1).padStart(4, '0');
  return `${prefix}${nextSeq}`;
};

const getChallans = async ({ page = 1, limit = 10, search = '', status = '', customer_id = '' }) => {
  const pageNum = Math.max(1, parseInt(page, 10));
  const limitNum = Math.max(1, parseInt(limit, 10));
  const offset = (pageNum - 1) * limitNum;

  if (isConfigured && supabase) {
    let query = supabase
      .from('challans')
      .select('*, customers:customer_id(customer_name, business_name, mobile, gst_number), users:created_by(name, email), challan_items(*)', { count: 'exact' });

    if (search) {
      query = query.or(`challan_number.ilike.%${search}%`);
    }
    if (status) {
      query = query.eq('status', status);
    }
    if (customer_id) {
      query = query.eq('customer_id', customer_id);
    }

    const { data, count, error } = await query
      .order('created_at', { ascending: false })
      .range(offset, offset + limitNum - 1);

    if (!error && data) {
      const formatted = data.map(c => ({
        ...c,
        customer_name: c.customers?.customer_name || 'Unknown',
        business_name: c.customers?.business_name || '',
        created_by_name: c.users?.name || 'System',
        items: c.challan_items || []
      }));
      return {
        data: formatted,
        pagination: {
          page: pageNum,
          limit: limitNum,
          total: count || 0,
          totalPages: Math.ceil((count || 0) / limitNum)
        }
      };
    }
  }

  // Local store fallback
  let list = [...localStore.challans];

  if (search) {
    const s = search.toLowerCase();
    list = list.filter(c =>
      (c.challan_number && c.challan_number.toLowerCase().includes(s)) ||
      (c.customer_name && c.customer_name.toLowerCase().includes(s)) ||
      (c.business_name && c.business_name.toLowerCase().includes(s))
    );
  }

  if (status) {
    list = list.filter(c => c.status === status);
  }

  if (customer_id) {
    list = list.filter(c => c.customer_id === customer_id);
  }

  list.sort((a, b) => new Date(b.created_at) - new Date(a.created_at));

  const total = list.length;
  const paginated = list.slice(offset, offset + limitNum);

  return {
    data: paginated,
    pagination: {
      page: pageNum,
      limit: limitNum,
      total,
      totalPages: Math.ceil(total / limitNum)
    }
  };
};

const getChallanById = async (id) => {
  if (isConfigured && supabase) {
    const { data, error } = await supabase
      .from('challans')
      .select('*, customers:customer_id(*), users:created_by(name, email), challan_items(*)')
      .eq('id', id)
      .single();
    if (!error && data) {
      return {
        ...data,
        customer: data.customers,
        created_by_name: data.users?.name || 'System',
        items: data.challan_items || []
      };
    }
  }

  const challan = localStore.challans.find(c => c.id === id);
  if (!challan) {
    const err = new Error('Challan not found');
    err.statusCode = 404;
    throw err;
  }

  const customer = localStore.customers.find(c => c.id === challan.customer_id) || {};
  return {
    ...challan,
    customer
  };
};

const createChallan = async (payload, user) => {
  const customer = await customerService.getCustomerById(payload.customer_id);

  const challanNumber = await generateNextChallanNumber();
  const challanId = require('crypto').randomUUID();

  // Snapshot product information
  const snapshotItems = [];
  let totalQuantity = 0;
  let totalAmount = 0;

  for (const item of payload.items) {
    const product = await productService.getProductById(item.product_id);
    const qty = parseInt(item.quantity, 10);
    const price = parseFloat(product.unit_price);
    const itemTotal = price * qty;

    totalQuantity += qty;
    totalAmount += itemTotal;

    snapshotItems.push({
      id: require('crypto').randomUUID(),
      challan_id: challanId,
      product_id: product.id,
      product_name: product.product_name,
      sku: product.sku,
      unit_price: price,
      quantity: qty,
      total_price: itemTotal,
      created_at: new Date().toISOString()
    });
  }

  const initialStatus = payload.status === 'CONFIRMED' ? 'DRAFT' : (payload.status || 'DRAFT');

  const newChallan = {
    id: challanId,
    challan_number: challanNumber,
    customer_id: customer.id,
    customer_name: customer.customer_name,
    business_name: customer.business_name || '',
    total_quantity: totalQuantity,
    total_amount: totalAmount,
    status: initialStatus,
    created_by: user.id,
    created_by_name: user.name,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
    items: snapshotItems
  };

  if (isConfigured && supabase) {
    const { data: createdChallan, error: chErr } = await supabase
      .from('challans')
      .insert([{
        id: newChallan.id,
        challan_number: newChallan.challan_number,
        customer_id: newChallan.customer_id,
        total_quantity: newChallan.total_quantity,
        total_amount: newChallan.total_amount,
        status: newChallan.status,
        created_by: newChallan.created_by
      }])
      .select()
      .single();

    if (chErr) {
      const err = new Error(chErr.message);
      err.statusCode = 400;
      throw err;
    }

    const { error: itemsErr } = await supabase
      .from('challan_items')
      .insert(snapshotItems.map(si => ({
        id: si.id,
        challan_id: si.challan_id,
        product_id: si.product_id,
        product_name: si.product_name,
        sku: si.sku,
        unit_price: si.unit_price,
        quantity: si.quantity,
        total_price: si.total_price
      })));

    if (itemsErr) {
      const err = new Error(itemsErr.message);
      err.statusCode = 400;
      throw err;
    }

    // If immediate confirmation requested, confirm it atomically
    if (payload.status === 'CONFIRMED') {
      return await confirmChallan(challanId, user);
    }

    return { ...createdChallan, items: snapshotItems, customer };
  }

  localStore.challans.unshift(newChallan);

  // If immediate confirmation requested
  if (payload.status === 'CONFIRMED') {
    return await confirmChallan(challanId, user);
  }

  return { ...newChallan, customer };
};

const confirmChallan = async (challanId, user) => {
  const challan = await getChallanById(challanId);

  if (challan.status === 'CONFIRMED') {
    const err = new Error('Challan is already confirmed');
    err.statusCode = 400;
    throw err;
  }

  if (challan.status === 'CANCELLED') {
    const err = new Error('Cancelled challan cannot be confirmed');
    err.statusCode = 400;
    throw err;
  }

  // 1. Check stock availability for all items
  for (const item of challan.items) {
    const product = await productService.getProductById(item.product_id);
    if (product.current_stock < item.quantity) {
      const err = new Error(`Insufficient stock for "${item.product_name}". Available: ${product.current_stock}, Requested: ${item.quantity}`);
      err.statusCode = 400;
      throw err;
    }
  }

  // 2. If Supabase is configured, call PostgreSQL RPC confirm_sales_challan
  if (isConfigured && supabase) {
    const { data, error } = await supabase.rpc('confirm_sales_challan', {
      p_challan_id: challanId,
      p_user_id: user.id
    });

    if (error) {
      const err = new Error(error.message);
      err.statusCode = 400;
      throw err;
    }

    return await getChallanById(challanId);
  }

  // 3. Atomic local store execution
  for (const item of challan.items) {
    const product = localStore.products.find(p => p.id === item.product_id);
    product.current_stock -= item.quantity;
    product.updated_at = new Date().toISOString();

    // Create OUT stock movement record
    localStore.stock_movements.unshift({
      id: require('crypto').randomUUID(),
      product_id: product.id,
      product_name: product.product_name,
      sku: product.sku,
      quantity: item.quantity,
      movement_type: 'OUT',
      reason: `Challan Confirmed: ${challan.challan_number}`,
      created_by: user.id,
      created_by_name: user.name,
      created_at: new Date().toISOString()
    });
  }

  challan.status = 'CONFIRMED';
  challan.updated_at = new Date().toISOString();

  const idx = localStore.challans.findIndex(c => c.id === challanId);
  if (idx !== -1) {
    localStore.challans[idx] = challan;
  }

  return challan;
};

const cancelChallan = async (challanId, user) => {
  const challan = await getChallanById(challanId);

  if (challan.status === 'CANCELLED') {
    const err = new Error('Challan is already cancelled');
    err.statusCode = 400;
    throw err;
  }

  // If challan was CONFIRMED, restock products and create IN stock movements
  if (challan.status === 'CONFIRMED') {
    for (const item of challan.items) {
      await productService.adjustStock(
        item.product_id,
        {
          quantity: item.quantity,
          reason: `Restock due to Challan Cancellation: ${challan.challan_number}`,
          movement_type: 'IN'
        },
        user
      );
    }
  }

  const updatedFields = {
    status: 'CANCELLED',
    updated_at: new Date().toISOString()
  };

  if (isConfigured && supabase) {
    const { error } = await supabase
      .from('challans')
      .update(updatedFields)
      .eq('id', challanId);
    if (error) {
      const err = new Error(error.message);
      err.statusCode = 400;
      throw err;
    }
    return await getChallanById(challanId);
  }

  challan.status = 'CANCELLED';
  challan.updated_at = new Date().toISOString();
  return challan;
};

module.exports = {
  getChallans,
  getChallanById,
  createChallan,
  confirmChallan,
  cancelChallan,
  generateNextChallanNumber
};
