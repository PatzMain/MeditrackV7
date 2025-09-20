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

    const { data: adminUser, error: adminError } = await supabase
      .from('users')
      .insert([
        {
          username: 'admin',
          password: adminPassword,
          role: 'admin',
          created_at: new Date().toISOString()
        }
      ])
      .select()
      .single();

    if (adminError) {
      console.error('Error creating admin user:', adminError);
    } else {
      console.log('Admin user created successfully:', adminUser.username);
    }

    const { data: superadminUser, error: superadminError } = await supabase
      .from('users')
      .insert([
        {
          username: 'superadmin',
          password: superadminPassword,
          role: 'superadmin',
          created_at: new Date().toISOString()
        }
      ])
      .select()
      .single();

    if (superadminError) {
      console.error('Error creating superadmin user:', superadminError);
    } else {
      console.log('Superadmin user created successfully:', superadminUser.username);
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