const { v4: uuidv4 } = require('crypto');
const { localStore, isConfigured, supabase } = require('../config/db');

const getCustomers = async ({ page = 1, limit = 10, search = '', status = '', customer_type = '' }) => {
  const pageNum = Math.max(1, parseInt(page, 10));
  const limitNum = Math.max(1, parseInt(limit, 10));
  const offset = (pageNum - 1) * limitNum;

  if (isConfigured && supabase) {
    let query = supabase.from('customers').select('*', { count: 'exact' });

    if (search) {
      query = query.or(`customer_name.ilike.%${search}%,mobile.ilike.%${search}%,email.ilike.%${search}%,business_name.ilike.%${search}%`);
    }
    if (status) {
      query = query.eq('status', status);
    }
    if (customer_type) {
      query = query.eq('customer_type', customer_type);
    }

    const { data, count, error } = await query
      .order('created_at', { ascending: false })
      .range(offset, offset + limitNum - 1);

    if (!error && data) {
      return {
        data,
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
  let list = [...localStore.customers];

  if (search) {
    const s = search.toLowerCase();
    list = list.filter(c =>
      (c.customer_name && c.customer_name.toLowerCase().includes(s)) ||
      (c.mobile && c.mobile.toLowerCase().includes(s)) ||
      (c.email && c.email.toLowerCase().includes(s)) ||
      (c.business_name && c.business_name.toLowerCase().includes(s))
    );
  }

  if (status) {
    list = list.filter(c => c.status === status);
  }

  if (customer_type) {
    list = list.filter(c => c.customer_type === customer_type);
  }

  // Sort descending by created_at
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

const getCustomerById = async (id) => {
  if (isConfigured && supabase) {
    const { data, error } = await supabase
      .from('customers')
      .select('*')
      .eq('id', id)
      .single();
    if (!error && data) return data;
  }

  const customer = localStore.customers.find(c => c.id === id);
  if (!customer) {
    const err = new Error('Customer not found');
    err.statusCode = 404;
    throw err;
  }
  return customer;
};

const createCustomer = async (payload) => {
  const newCustomer = {
    id: require('crypto').randomUUID(),
    customer_name: payload.customer_name,
    mobile: payload.mobile,
    email: payload.email || null,
    business_name: payload.business_name || null,
    gst_number: payload.gst_number || null,
    customer_type: payload.customer_type,
    address: payload.address || null,
    status: payload.status || 'Lead',
    follow_up_date: payload.follow_up_date || null,
    notes: payload.notes || null,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString()
  };

  if (isConfigured && supabase) {
    const { data, error } = await supabase
      .from('customers')
      .insert([newCustomer])
      .select()
      .single();
    if (!error && data) return data;
  }

  localStore.customers.unshift(newCustomer);
  return newCustomer;
};

const updateCustomer = async (id, payload) => {
  const existing = await getCustomerById(id);

  const updatedFields = {
    ...existing,
    ...payload,
    updated_at: new Date().toISOString()
  };

  if (isConfigured && supabase) {
    const { data, error } = await supabase
      .from('customers')
      .update(updatedFields)
      .eq('id', id)
      .select()
      .single();
    if (!error && data) return data;
  }

  const index = localStore.customers.findIndex(c => c.id === id);
  if (index !== -1) {
    localStore.customers[index] = updatedFields;
  }
  return updatedFields;
};

const deleteCustomer = async (id) => {
  await getCustomerById(id);

  if (isConfigured && supabase) {
    const { error } = await supabase.from('customers').delete().eq('id', id);
    if (error) {
      const err = new Error(error.message);
      err.statusCode = 400;
      throw err;
    }
    return { success: true, message: 'Customer deleted successfully' };
  }

  localStore.customers = localStore.customers.filter(c => c.id !== id);
  return { success: true, message: 'Customer deleted successfully' };
};

const getCustomerFollowups = async (customerId) => {
  await getCustomerById(customerId);

  if (isConfigured && supabase) {
    const { data, error } = await supabase
      .from('customer_followups')
      .select('*, users:created_by(name, email)')
      .eq('customer_id', customerId)
      .order('created_at', { ascending: false });
    if (!error && data) {
      return data.map(f => ({
        ...f,
        created_by_user: f.users
      }));
    }
  }

  const followups = localStore.customer_followups
    .filter(f => f.customer_id === customerId)
    .sort((a, b) => new Date(b.created_at) - new Date(a.created_at));

  return followups;
};

const createCustomerFollowup = async (customerId, payload, user) => {
  const customer = await getCustomerById(customerId);

  const followup = {
    id: require('crypto').randomUUID(),
    customer_id: customerId,
    follow_up_date: payload.follow_up_date,
    notes: payload.notes,
    created_by: user.id,
    created_by_user: { name: user.name, email: user.email },
    created_at: new Date().toISOString()
  };

  // Update customer's follow up date and notes
  await updateCustomer(customerId, {
    follow_up_date: payload.follow_up_date,
    notes: payload.notes
  });

  if (isConfigured && supabase) {
    const { data, error } = await supabase
      .from('customer_followups')
      .insert([{
        id: followup.id,
        customer_id: customerId,
        follow_up_date: payload.follow_up_date,
        notes: payload.notes,
        created_by: user.id,
        created_at: followup.created_at
      }])
      .select()
      .single();
    if (!error && data) return { ...data, created_by_user: { name: user.name, email: user.email } };
  }

  localStore.customer_followups.unshift(followup);
  return followup;
};

module.exports = {
  getCustomers,
  getCustomerById,
  createCustomer,
  updateCustomer,
  deleteCustomer,
  getCustomerFollowups,
  createCustomerFollowup
};
