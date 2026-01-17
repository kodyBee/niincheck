// Quick script to check Supabase tables
const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: '.env' });

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_DEFAULT_KEY
);

async function checkTables() {
  console.log('Checking Supabase connection...\n');
  
  // Check nsn_data table
  console.log('Checking nsn_data table:');
  const { data: nsnData, error: nsnError } = await supabase
    .from('nsn_data')
    .select('*')
    .limit(5);
  
  if (nsnError) {
    console.log('❌ Error:', nsnError.message);
  } else {
    console.log(`✅ Found ${nsnData?.length || 0} sample records`);
    if (nsnData && nsnData.length > 0) {
      console.log('Sample record:', nsnData[0]);
    }
  }
  
  console.log('\nChecking user_subscriptions table:');
  const { data: subData, error: subError } = await supabase
    .from('user_subscriptions')
    .select('*')
    .limit(1);
  
  if (subError) {
    console.log('❌ Error:', subError.message);
  } else {
    console.log(`✅ Table exists (${subData?.length || 0} records)`);
  }
}

checkTables().catch(console.error);
