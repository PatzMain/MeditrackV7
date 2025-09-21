const bcrypt = require('bcryptjs');
const { createClient } = require('@supabase/supabase-js');
require('dotenv').config();

const supabaseUrl = process.env.SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseServiceKey) {
  console.error('Missing Supabase environment variables');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseServiceKey);

async function createUsers() {
  try {
    const adminPassword = await bcrypt.hash('admin123', 10);
    const superadminPassword = await bcrypt.hash('superadmin123', 10);

    // Update admin user with optimized password
    const { error: adminError } = await supabase
      .from('users')
      .upsert([
        {
          username: 'admin',
          password: adminPassword,
          role: 'admin',
          created_at: new Date().toISOString()
        }
      ]);

    if (adminError) {
      console.error('Error updating admin user:', adminError);
    } else {
      console.log('Admin user updated with optimized password');
    }

    // Update superadmin user with optimized password
    const { error: superadminError } = await supabase
      .from('users')
      .upsert([
        {
          username: 'superadmin',
          password: superadminPassword,
          role: 'superadmin',
          created_at: new Date().toISOString()
        }
      ]);

    if (superadminError) {
      console.error('Error updating superadmin user:', superadminError);
    } else {
      console.log('Superadmin user updated with optimized password');
    }

    console.log('\nDefault user credentials:');
    console.log('Admin: username=admin, password=admin123');
    console.log('Superadmin: username=superadmin, password=superadmin123');
    console.log('\nIMPORTANT: Change these passwords after first login!');

  } catch (error) {
    console.error('Script error:', error);
  }
}

createUsers();