const { createClient } = require('@supabase/supabase-js');
const bcrypt = require('bcryptjs');
require('dotenv').config();

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

async function debugUser(email) {
  console.log('🔍 Checking user:', email);
  console.log('---');

  // Check if user exists
  const { data: user, error } = await supabase
    .from('users')
    .select('*')
    .eq('email', email)
    .single();

  if (error) {
    console.error('❌ Error fetching user:', error.message);
    return;
  }

  if (!user) {
    console.log('❌ User not found');
    return;
  }

  console.log('✅ User found');
  console.log('📧 Email:', user.email);
  console.log('🆔 ID:', user.id);
  console.log('🔐 Has password_hash:', !!user.password_hash);
  console.log('🔐 Password hash length:', user.password_hash?.length || 0);
  console.log('💳 Subscription status:', user.stripe_subscription_status || 'none');
  console.log('📅 Created at:', user.created_at);
  
  if (user.password_hash) {
    console.log('🔐 Password hash format:', user.password_hash.substring(0, 10) + '...');
    console.log('🔐 Looks like bcrypt:', user.password_hash.startsWith('$2'));
  } else {
    console.log('⚠️  NO PASSWORD HASH FOUND - This is the problem!');
  }
}

async function resetPassword(email, newPassword) {
  console.log('🔄 Resetting password for:', email);
  
  const password_hash = await bcrypt.hash(newPassword, 10);
  
  const { error } = await supabase
    .from('users')
    .update({ password_hash })
    .eq('email', email);

  if (error) {
    console.error('❌ Error updating password:', error.message);
    return;
  }

  console.log('✅ Password reset successfully');
}

// Get email from command line
const command = process.argv[2];
const email = process.argv[3];
const password = process.argv[4];

if (!command || !email) {
  console.log('Usage:');
  console.log('  node debug-user.js check <email>');
  console.log('  node debug-user.js reset <email> <new-password>');
  process.exit(1);
}

if (command === 'check') {
  debugUser(email).then(() => process.exit(0));
} else if (command === 'reset' && password) {
  resetPassword(email, password).then(() => process.exit(0));
} else {
  console.log('Invalid command or missing password');
  process.exit(1);
}
