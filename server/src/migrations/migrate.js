const fs = require('fs');
const path = require('path');
const { pool } = require('../config/database');

const createMigrationsTable = async () => {
  try {
    await pool.query(`
      CREATE TABLE IF NOT EXISTS migrations (
        id SERIAL PRIMARY KEY,
        name VARCHAR(255) NOT NULL,
        executed_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );
    `);
    console.log('✅ Migrations table ready');
  } catch (error) {
    console.error('Error creating migrations table:', error.message);
    throw error;
  }
};

const getExecutedMigrations = async () => {
  const result = await pool.query('SELECT name FROM migrations ORDER BY id');
  return result.rows.map(row => row.name);
};

const runMigrations = async () => {
  console.log('🚀 Starting database migrations on Neon PostgreSQL...\n');
  
  try {
    await createMigrationsTable();
    
    const executedMigrations = await getExecutedMigrations();
    const migrationFiles = fs.readdirSync(__dirname)
      .filter(file => file.endsWith('.sql'))
      .sort();
    
    console.log(`📁 Found ${migrationFiles.length} migration files`);
    console.log(`✅ Already executed: ${executedMigrations.length}\n`);
    
    for (const file of migrationFiles) {
      if (!executedMigrations.includes(file)) {
        console.log(`📝 Running migration: ${file}`);
        const sql = fs.readFileSync(path.join(__dirname, file), 'utf8');
        
        try {
          await pool.query('BEGIN');
          await pool.query(sql);
          await pool.query('INSERT INTO migrations (name) VALUES ($1)', [file]);
          await pool.query('COMMIT');
          console.log(`✅ Migration completed: ${file}\n`);
        } catch (error) {
          await pool.query('ROLLBACK');
          console.error(`❌ Migration failed: ${file}`);
          console.error('Error details:', error.message);
          throw error;
        }
      }
    }
    
    console.log('✨ All migrations completed successfully!');
    
  } catch (error) {
    console.error('💥 Migration error:', error);
    throw error;
  }
};

// Run migrations
if (require.main === module) {
  runMigrations()
    .then(() => {
      console.log('🎉 Database setup complete');
      process.exit(0);
    })
    .catch(error => {
      console.error('Failed to run migrations:', error);
      process.exit(1);
    });
}

module.exports = runMigrations;