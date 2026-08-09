const { createClient } = require('@supabase/supabase-js');
const ws = require('ws');
const dotenv = require('dotenv');
dotenv.config();

const supabaseUrl = process.env.SUPABASE_URL;

// Prioritize valid keys
const possibleKeys = [
  process.env.SUPABASE_SECRET_KEY,
  process.env.SUPABASE_SERVICE_ROLE_KEY,
  process.env.SUPABASE_PUBLISHABLE_KEY,
  process.env.SUPABASE_ANON_KEY
].filter(Boolean);

let supabaseKey = null;
for (const key of possibleKeys) {
  if (key && !key.includes('your-supabase') && key.length > 20) {
    supabaseKey = key;
    break;
  }
}

// Fallback to first available if none matched length > 20
if (!supabaseKey && possibleKeys.length > 0) {
  supabaseKey = possibleKeys[0];
}

let supabase = null;
const isConfigured = Boolean(
  supabaseUrl &&
  supabaseKey &&
  !supabaseUrl.includes('your-project') &&
  !supabaseKey.includes('your-supabase')
);

if (isConfigured) {
  try {
    supabase = createClient(supabaseUrl, supabaseKey, {
      auth: {
        autoRefreshToken: false,
        persistSession: false
      },
      realtime: {
        transport: ws
      }
    });
    console.log('✅ Connected to Supabase PostgreSQL database at:', supabaseUrl);
  } catch (err) {
    console.warn('⚠️ Supabase client initialization warning:', err.message);
  }
} else {
  console.log('ℹ️ Supabase environment variables not set or using placeholders. Initializing integrated store.');
}

module.exports = {
  supabase,
  isConfigured
};
