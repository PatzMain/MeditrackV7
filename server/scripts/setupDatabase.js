const { createClient } = require('@supabase/supabase-js');
require('dotenv').config();

const supabaseUrl = process.env.SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseServiceKey) {
  console.error('Missing Supabase environment variables');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseServiceKey, {
  auth: {
    autoRefreshToken: false,
    persistSession: false
  }
});

async function setupDatabase() {
  try {
    console.log('Setting up database tables...');

    // Create users table
    const createUsersTable = `
      CREATE TABLE IF NOT EXISTS users (
        id SERIAL PRIMARY KEY,
        username VARCHAR(50) UNIQUE NOT NULL,
        password VARCHAR(255) NOT NULL,
        role VARCHAR(20) DEFAULT 'user' CHECK (role IN ('user', 'admin', 'superadmin')),
        created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
        updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
      );
    `;

    // Create user_activity table
    const createUserActivityTable = `
      CREATE TABLE IF NOT EXISTS user_activity (
        id SERIAL PRIMARY KEY,
        user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
        action VARCHAR(50) NOT NULL,
        timestamp TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
        ip_address INET,
        user_agent TEXT,
        details JSONB
      );
    `;

    // Create indexes
    const createIndexes = `
      CREATE INDEX IF NOT EXISTS idx_user_activity_user_id ON user_activity(user_id);
      CREATE INDEX IF NOT EXISTS idx_user_activity_timestamp ON user_activity(timestamp);
      CREATE INDEX IF NOT EXISTS idx_user_activity_action ON user_activity(action);
    `;

    // Execute the SQL commands
    const { error: usersError } = await supabase.rpc('exec_sql', { sql: createUsersTable });
    if (usersError) {
      console.error('Error creating users table:', usersError);
    } else {
      console.log('✓ Users table created successfully');
    }

    const { error: activityError } = await supabase.rpc('exec_sql', { sql: createUserActivityTable });
    if (activityError) {
      console.error('Error creating user_activity table:', activityError);
    } else {
      console.log('✓ User activity table created successfully');
    }

    const { error: indexError } = await supabase.rpc('exec_sql', { sql: createIndexes });
    if (indexError) {
      console.error('Error creating indexes:', indexError);
    } else {
      console.log('✓ Indexes created successfully');
    }

    console.log('\nDatabase setup completed!');
    console.log('You can now run: node scripts/createUsers.js to create admin accounts');

  } catch (error) {
    console.error('Database setup error:', error);
  }
}

setupDatabase();