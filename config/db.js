// Import the Supabase client creator
const { createClient } = require('@supabase/supabase-js');
require('dotenv').config(); // Load our .env variables

// Grab the URL and Key from our .env file
const supabaseUrl = process.env.SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_KEY;

// Create the connection to Supabase
const supabase = createClient(supabaseUrl, supabaseKey);

// Export it so we can use it in our routes later
module.exports = supabase;