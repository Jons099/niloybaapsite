const bcrypt = require('bcryptjs');
const { pool } = require('../config/database');
const runMigrations = require('../migrations/migrate');

const setupDatabase = async () => {
  try {
    console.log('Running database migrations...');
    await runMigrations();
    
    console.log('Creating admin user...');
    
    // Check if admin exists
    const adminCheck = await pool.query(
      "SELECT id FROM users WHERE email = 'admin@luxeattire.com'"
    );
    
    if (adminCheck.rows.length === 0) {
      const hashedPassword = await bcrypt.hash('Admin@123', 10);
      
      await pool.query(
        `INSERT INTO users (name, email, password, phone, role) 
         VALUES ($1, $2, $3, $4, $5)`,
        ['Admin User', 'admin@luxeattire.com', hashedPassword, '+1234567890', 'admin']
      );
      
      console.log('Admin user created successfully');
    }
    
    // Create sample categories if needed
    console.log('Setup completed successfully');
    
  } catch (error) {
    console.error('Setup failed:', error);
    throw error;
  }
};

// Run setup if executed directly
if (require.main === module) {
  setupDatabase()
    .then(() => process.exit(0))
    .catch(() => process.exit(1));
}

module.exports = setupDatabase;