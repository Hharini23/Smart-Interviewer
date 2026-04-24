import { supabase } from './config/supabaseClient.js';

async function testConnection() {
  console.log('Testing Supabase Connection...');
  
  try {
    const { data, error } = await supabase.from('interviews').select('*').limit(1);
    
    if (error) {
      console.error('❌ Connection Failed! Error details:');
      console.error(error.message);
      process.exit(1);
    } else {
      console.log('✅ Connection Successful! Your SUPABASE_URL and SUPABASE_KEY are correct.');
      console.log('✅ Found the "interviews" table in your database!');
      process.exit(0);
    }
  } catch (err) {
    console.error('❌ Unexpected Error:', err.message);
    process.exit(1);
  }
}

testConnection();
