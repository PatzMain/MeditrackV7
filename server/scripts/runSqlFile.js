const { createClient } = require('@supabase/supabase-js');
const fs = require('fs');
const path = require('path');
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

async function runSqlFile(filePath) {
  try {
    const sql = fs.readFileSync(filePath, 'utf8');
    console.log(`Executing SQL from ${filePath}...`);
    const { error } = await supabase.rpc('exec_sql', { sql });
    if (error) {
      console.error(`Error executing SQL from ${filePath}:`, error);
    } else {
      console.log(`✓ SQL from ${filePath} executed successfully`);
    }
  } catch (error) {
    console.error('Error running SQL file:', error);
  }
}

const sqlFilePath = process.argv[2];
if (!sqlFilePath) {
  console.error('Please provide the path to the SQL file to execute.');
  process.exit(1);
}

runSqlFile(sqlFilePath);
