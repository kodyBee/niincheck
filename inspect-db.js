// Inspect Supabase database structure
const { createClient } = require('@supabase/supabase-js');

const supabase = createClient(
  'https://jtekafebyuqmcdoihjkk.supabase.co',
  'sb_publishable_Iu9bDDbt1K61vxLNZLaBGg_Hkcbfr5Y'
);

async function inspectDatabase() {
  console.log('=== Your Supabase Database Structure ===\n');
  
  // Check names
  console.log('--- Table: names ---');
  const { data: names, error: errNames } = await supabase.from('names').select('*').limit(1);
  if (names && names.length) console.log(Object.keys(names[0]));
  else console.log('Empty or Error:', errNames?.message);

  // Check weights
  console.log('--- Table: weights ---');
  const { data: weights, error: errWeights } = await supabase.from('weights').select('*').limit(1);
  if (weights && weights.length) console.log(Object.keys(weights[0]));
  else console.log('Empty or Error:', errWeights?.message);

  // Check prices
  console.log('\n--- Table: prices ---');
  const { data: prices, error: err3 } = await supabase.from('prices').select('*').limit(1);
  if (prices && prices.length) console.log(Object.keys(prices[0]));
  else console.log('Empty or Error:', err3?.message);

  // Check aacs
  console.log('\n--- Table: aacs ---');
  const { data: aacs, error: err4 } = await supabase.from('aacs').select('*').limit(1);
  if (aacs && aacs.length) console.log(Object.keys(aacs[0]));
  else console.log('Empty or Error:', err4?.message);
}

inspectDatabase().catch(err => {
  console.error('Error:', err.message);
});
