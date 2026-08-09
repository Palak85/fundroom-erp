const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { localStore, isConfigured, supabase } = require('../config/db');

const login = async ({ email, password }) => {
  let user = null;

  if (isConfigured && supabase) {
    const { data, error } = await supabase
      .from('users')
      .select('*')
      .eq('email', email.toLowerCase().trim())
      .single();
    if (!error && data) user = data;
  }

  if (!user) {
    user = localStore.users.find(u => u.email.toLowerCase() === email.toLowerCase().trim());
  }

  if (!user) {
    const err = new Error('Invalid email or password');
    err.statusCode = 401;
    throw err;
  }

  const isMatch = await bcrypt.compare(password, user.password_hash);
  if (!isMatch) {
    const err = new Error('Invalid email or password');
    err.statusCode = 401;
    throw err;
  }

  const secret = process.env.JWT_SECRET || 'super_secret_jwt_key_minierp_crm_2026';
  const token = jwt.sign(
    {
      id: user.id,
      name: user.name,
      email: user.email,
      role: user.role
    },
    secret,
    { expiresIn: '7d' }
  );

  return {
    token,
    user: {
      id: user.id,
      name: user.name,
      email: user.email,
      role: user.role
    }
  };
};

const getAllUsers = async () => {
  if (isConfigured && supabase) {
    const { data, error } = await supabase
      .from('users')
      .select('id, name, email, role, created_at')
      .order('created_at', { ascending: false });
    if (!error && data) return data;
  }

  return localStore.users.map(u => ({
    id: u.id,
    name: u.name,
    email: u.email,
    role: u.role,
    created_at: u.created_at
  }));
};

module.exports = {
  login,
  getAllUsers
};
