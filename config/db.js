// Import the Supabase client creator
const { createClient } = require('@supabase/supabase-js');
require('dotenv').config(); // Load our .env variables

// Grab the URL and Key from our .env file
const SUPABASE_URL = process.env.SUPABASE_URL;
const SUPABASE_KEY = process.env.SUPABASE_KEY;

// Create the connection to Supabase
const supabase = createClient(SUPABASE_URL, SUPABASE_KEY);

// Export it so we can use it in our routes later
module.exports = supabase;