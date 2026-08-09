const jwt = require('jsonwebtoken');
const { localStore, isConfigured, supabase } = require('../config/db');

const authenticateUser = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({
        success: false,
        message: 'Authentication required'
      });
    }

    const token = authHeader.split(' ')[1];
    const secret = process.env.JWT_SECRET || 'super_secret_jwt_key_minierp_crm_2026';

    const decoded = jwt.verify(token, secret);

    // Fetch latest user details to ensure user is active
    let user = null;
    if (isConfigured && supabase) {
      const { data, error } = await supabase
        .from('users')
        .select('id, name, email, role')
        .eq('id', decoded.id)
        .single();
      if (!error && data) user = data;
    }

    if (!user) {
      user = localStore.users.find(u => u.id === decoded.id);
    }

    if (!user) {
      return res.status(401).json({
        success: false,
        message: 'User session invalid or user not found'
      });
    }

    req.user = {
      id: user.id,
      name: user.name,
      email: user.email,
      role: user.role
    };

    next();
  } catch (err) {
    return res.status(401).json({
      success: false,
      message: 'Invalid or expired authentication token'
    });
  }
};

module.exports = {
  authenticateUser
};
