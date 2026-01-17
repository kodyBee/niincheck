// Inspect Supabase database structure
const { createClient } = require('@supabase/supabase-js');

const supabase = createClient(
  'https://jtekafebyuqmcdoihjkk.supabase.co',
  'sb_publishable_Iu9bDDbt1K61vxLNZLaBGg_Hkcbfr5Y'
);

async function inspectDatabase() {
  console.log('=== Your Supabase Database Structure ===\n');
  
  // Check items table structure
  console.log('Table: items');
  const { data: itemsData } = await supabase
    .from('items')
    .select('*')
    .limit(0);
  
  // Check customers table  
  console.log('\nTable: customers');
  const { data: customersData, error: custError } = await supabase
    .from('customers')
    .select('*')
    .limit(1);
  
  if (customersData && customersData.length > 0) {
    console.log('Columns:', Object.keys(customersData[0]).join(', '));
    console.log('\nSample record:', JSON.stringify(customersData[0], null, 2));
  } else if (!custError) {
    console.log('Table exists but is empty');
  }
  
  // Get table info from Supabase API
  console.log('\n\nPlease tell me:');
  console.log('1. What columns does your "items" table have?');
  console.log('   (e.g., nsn, name, description, part_number, etc.)');
  console.log('\n2. What columns does your "customers" table have?');
  console.log('   (e.g., user_id, stripe_customer_id, subscription_status, etc.)');
}

inspectDatabase().catch(err => {
  console.error('Error:', err.message);
});
