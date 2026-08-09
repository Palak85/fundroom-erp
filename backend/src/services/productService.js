const { localStore, isConfigured, supabase } = require('../config/db');

const getProducts = async ({ page = 1, limit = 10, search = '', category = '', low_stock = '' }) => {
  const pageNum = Math.max(1, parseInt(page, 10));
  const limitNum = Math.max(1, parseInt(limit, 10));
  const offset = (pageNum - 1) * limitNum;

  if (isConfigured && supabase) {
    let query = supabase.from('products').select('*', { count: 'exact' });

    if (search) {
      query = query.or(`product_name.ilike.%${search}%,sku.ilike.%${search}%,category.ilike.%${search}%`);
    }
    if (category) {
      query = query.eq('category', category);
    }

    const { data, count, error } = await query
      .order('created_at', { ascending: false })
      .range(offset, offset + limitNum - 1);

    if (!error && data) {
      let filtered = data;
      if (low_stock === 'true') {
        filtered = filtered.filter(p => p.current_stock <= p.minimum_stock);
      }
      return {
        data: filtered,
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
  let list = [...localStore.products];

  if (search) {
    const s = search.toLowerCase();
    list = list.filter(p =>
      (p.product_name && p.product_name.toLowerCase().includes(s)) ||
      (p.sku && p.sku.toLowerCase().includes(s)) ||
      (p.category && p.category.toLowerCase().includes(s))
    );
  }

  if (category) {
    list = list.filter(p => p.category === category);
  }

  if (low_stock === 'true') {
    list = list.filter(p => p.current_stock <= p.minimum_stock);
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

const getProductById = async (id) => {
  if (isConfigured && supabase) {
    const { data, error } = await supabase
      .from('products')
      .select('*')
      .eq('id', id)
      .single();
    if (!error && data) return data;
  }

  const product = localStore.products.find(p => p.id === id);
  if (!product) {
    const err = new Error('Product not found');
    err.statusCode = 404;
    throw err;
  }
  return product;
};

const createProduct = async (payload, user) => {
  // Check duplicate SKU
  if (isConfigured && supabase) {
    const { data: existingSku } = await supabase
      .from('products')
      .select('id')
      .eq('sku', payload.sku.trim().toUpperCase())
      .single();
    if (existingSku) {
      const err = new Error(`A product with SKU "${payload.sku}" already exists`);
      err.statusCode = 409;
      throw err;
    }
  } else {
    const existing = localStore.products.find(p => p.sku.toUpperCase() === payload.sku.trim().toUpperCase());
    if (existing) {
      const err = new Error(`A product with SKU "${payload.sku}" already exists`);
      err.statusCode = 409;
      throw err;
    }
  }

  const initialStock = parseInt(payload.current_stock, 10) || 0;
  const newProduct = {
    id: require('crypto').randomUUID(),
    product_name: payload.product_name.trim(),
    sku: payload.sku.trim().toUpperCase(),
    category: payload.category.trim(),
    unit_price: parseFloat(payload.unit_price),
    current_stock: initialStock,
    minimum_stock: parseInt(payload.minimum_stock, 10) || 0,
    warehouse_location: payload.warehouse_location || null,
    image_url: payload.image_url || null,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString()
  };

  if (isConfigured && supabase) {
    const { data, error } = await supabase
      .from('products')
      .insert([newProduct])
      .select()
      .single();
    if (error) {
      const err = new Error(error.message);
      err.statusCode = 400;
      throw err;
    }
    // If initial stock > 0, log an initial IN movement
    if (initialStock > 0) {
      await supabase.from('stock_movements').insert([{
        product_id: newProduct.id,
        quantity: initialStock,
        movement_type: 'IN',
        reason: 'Initial Opening Stock Entry',
        created_by: user.id
      }]);
    }
    return data;
  }

  localStore.products.unshift(newProduct);
  if (initialStock > 0) {
    localStore.stock_movements.unshift({
      id: require('crypto').randomUUID(),
      product_id: newProduct.id,
      product_name: newProduct.product_name,
      sku: newProduct.sku,
      quantity: initialStock,
      movement_type: 'IN',
      reason: 'Initial Opening Stock Entry',
      created_by: user.id,
      created_by_name: user.name,
      created_at: new Date().toISOString()
    });
  }

  return newProduct;
};

const updateProduct = async (id, payload) => {
  const existing = await getProductById(id);

  if (payload.sku && payload.sku.toUpperCase() !== existing.sku.toUpperCase()) {
    if (isConfigured && supabase) {
      const { data: existingSku } = await supabase
        .from('products')
        .select('id')
        .eq('sku', payload.sku.trim().toUpperCase())
        .neq('id', id)
        .single();
      if (existingSku) {
        const err = new Error(`A product with SKU "${payload.sku}" already exists`);
        err.statusCode = 409;
        throw err;
      }
    } else {
      const conflict = localStore.products.find(p => p.id !== id && p.sku.toUpperCase() === payload.sku.trim().toUpperCase());
      if (conflict) {
        const err = new Error(`A product with SKU "${payload.sku}" already exists`);
        err.statusCode = 409;
        throw err;
      }
    }
  }

  const updatedFields = {
    ...existing,
    ...payload,
    sku: payload.sku ? payload.sku.trim().toUpperCase() : existing.sku,
    unit_price: payload.unit_price !== undefined ? parseFloat(payload.unit_price) : existing.unit_price,
    minimum_stock: payload.minimum_stock !== undefined ? parseInt(payload.minimum_stock, 10) : existing.minimum_stock,
    updated_at: new Date().toISOString()
  };

  if (isConfigured && supabase) {
    const { data, error } = await supabase
      .from('products')
      .update(updatedFields)
      .eq('id', id)
      .select()
      .single();
    if (!error && data) return data;
  }

  const idx = localStore.products.findIndex(p => p.id === id);
  if (idx !== -1) {
    localStore.products[idx] = updatedFields;
  }
  return updatedFields;
};

const adjustStock = async (id, { quantity, reason, movement_type }, user) => {
  const product = await getProductById(id);
  const qty = parseInt(quantity, 10);

  if (qty <= 0) {
    const err = new Error('Stock adjustment quantity must be positive');
    err.statusCode = 400;
    throw err;
  }

  if (movement_type === 'OUT' && product.current_stock < qty) {
    const err = new Error(`Insufficient stock for "${product.product_name}". Available: ${product.current_stock}, Requested: ${qty}`);
    err.statusCode = 400;
    throw err;
  }

  const newStock = movement_type === 'IN'
    ? product.current_stock + qty
    : product.current_stock - qty;

  const movementRecord = {
    id: require('crypto').randomUUID(),
    product_id: product.id,
    product_name: product.product_name,
    sku: product.sku,
    quantity: qty,
    movement_type,
    reason: reason.trim(),
    created_by: user.id,
    created_by_name: user.name,
    created_at: new Date().toISOString()
  };

  if (isConfigured && supabase) {
    const { data: updatedProduct, error: prodErr } = await supabase
      .from('products')
      .update({ current_stock: newStock, updated_at: new Date().toISOString() })
      .eq('id', id)
      .select()
      .single();
    if (prodErr) {
      const err = new Error(prodErr.message);
      err.statusCode = 400;
      throw err;
    }

    await supabase.from('stock_movements').insert([{
      id: movementRecord.id,
      product_id: product.id,
      quantity: qty,
      movement_type,
      reason: movementRecord.reason,
      created_by: user.id,
      created_at: movementRecord.created_at
    }]);

    return { product: updatedProduct, movement: movementRecord };
  }

  // Update local store
  product.current_stock = newStock;
  product.updated_at = new Date().toISOString();
  localStore.stock_movements.unshift(movementRecord);

  return { product, movement: movementRecord };
};

const getStockMovements = async ({ page = 1, limit = 15, productId = '', movement_type = '' }) => {
  const pageNum = Math.max(1, parseInt(page, 10));
  const limitNum = Math.max(1, parseInt(limit, 10));
  const offset = (pageNum - 1) * limitNum;

  if (isConfigured && supabase) {
    let query = supabase
      .from('stock_movements')
      .select('*, products:product_id(product_name, sku), users:created_by(name, email)', { count: 'exact' });

    if (productId) {
      query = query.eq('product_id', productId);
    }
    if (movement_type) {
      query = query.eq('movement_type', movement_type);
    }

    const { data, count, error } = await query
      .order('created_at', { ascending: false })
      .range(offset, offset + limitNum - 1);

    if (!error && data) {
      const formatted = data.map(m => ({
        ...m,
        product_name: m.products?.product_name || 'Unknown Product',
        sku: m.products?.sku || 'N/A',
        created_by_name: m.users?.name || 'System'
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

  let list = [...localStore.stock_movements];

  if (productId) {
    list = list.filter(m => m.product_id === productId);
  }
  if (movement_type) {
    list = list.filter(m => m.movement_type === movement_type);
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

module.exports = {
  getProducts,
  getProductById,
  createProduct,
  updateProduct,
  adjustStock,
  getStockMovements
};
