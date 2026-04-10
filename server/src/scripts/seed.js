const bcrypt = require('bcryptjs');
const { pool } = require('../config/database');

const seedDatabase = async () => {
  console.log('🌱 Starting database seeding...\n');

  try {
    // Create admin user
    console.log('Creating admin user...');
    const adminCheck = await pool.query(
      "SELECT id FROM users WHERE email = $1",
      ['admin@luxeattire.com']
    );
    
    if (adminCheck.rows.length === 0) {
      const hashedPassword = await bcrypt.hash('Admin@123', 10);
      
      await pool.query(
        `INSERT INTO users (name, email, password, phone, role) 
         VALUES ($1, $2, $3, $4, $5)`,
        ['Admin User', 'admin@luxeattire.com', hashedPassword, '+919876543210', 'admin']
      );
      console.log('✅ Admin user created');
    } else {
      console.log('ℹ️ Admin user already exists');
    }

    // Create manager user
    console.log('\nCreating manager user...');
    const managerCheck = await pool.query(
      "SELECT id FROM users WHERE email = $1",
      ['manager@luxeattire.com']
    );
    
    if (managerCheck.rows.length === 0) {
      const hashedPassword = await bcrypt.hash('Manager@123', 10);
      
      await pool.query(
        `INSERT INTO users (name, email, password, phone, role) 
         VALUES ($1, $2, $3, $4, $5)`,
        ['Manager User', 'manager@luxeattire.com', hashedPassword, '+919876543211', 'manager']
      );
      console.log('✅ Manager user created');
    } else {
      console.log('ℹ️ Manager user already exists');
    }

    // Create employee user
    console.log('\nCreating employee user...');
    const employeeCheck = await pool.query(
      "SELECT id FROM users WHERE email = $1",
      ['employee@luxeattire.com']
    );
    
    if (employeeCheck.rows.length === 0) {
      const hashedPassword = await bcrypt.hash('Employee@123', 10);
      
      await pool.query(
        `INSERT INTO users (name, email, password, phone, role) 
         VALUES ($1, $2, $3, $4, $5)`,
        ['Employee User', 'employee@luxeattire.com', hashedPassword, '+919876543212', 'employee']
      );
      console.log('✅ Employee user created');
    } else {
      console.log('ℹ️ Employee user already exists');
    }

    // Create sample products if none exist
    console.log('\nChecking for existing products...');
    const productCheck = await pool.query('SELECT COUNT(*) FROM products');
    
    if (parseInt(productCheck.rows[0].count) === 0) {
      console.log('Creating sample products...');
      
      const sampleProducts = [
        {
          name: 'Elegant Silk Saree',
          slug: 'elegant-silk-saree',
          description: 'Beautiful handwoven silk saree with traditional motifs',
          category: 'traditional',
          selling_price: 5999.00,
          cost_price: 3500.00,
          sku: 'SAR-001',
          sizes: ['S', 'M', 'L', 'XL']
        },
        {
          name: 'Modern Palazzo Set',
          slug: 'modern-palazzo-set',
          description: 'Contemporary palazzo set with embroidered top',
          category: 'modern',
          selling_price: 3499.00,
          cost_price: 2000.00,
          sku: 'PAL-001',
          sizes: ['XS', 'S', 'M', 'L']
        },
        {
          name: 'Classic Cotton Kurti',
          slug: 'classic-cotton-kurti',
          description: 'Timeless cotton kurti perfect for daily wear',
          category: 'classic',
          selling_price: 1999.00,
          cost_price: 1000.00,
          sku: 'KUR-001',
          sizes: ['M', 'L', 'XL', 'XXL']
        }
      ];

      for (const product of sampleProducts) {
        const result = await pool.query(
          `INSERT INTO products (name, slug, description, category, selling_price, cost_price, sku, is_active, is_featured) 
           VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9) RETURNING id`,
          [product.name, product.slug, product.description, product.category, 
           product.selling_price, product.cost_price, product.sku, true, true]
        );
        
        const productId = result.rows[0].id;
        
        // Add inventory for each size
        for (const size of product.sizes) {
          await pool.query(
            `INSERT INTO product_inventory (product_id, size, stock_quantity, low_stock_threshold) 
             VALUES ($1, $2, $3, $4)`,
            [productId, size, 100, 10]
          );
        }
        
        // Add placeholder image
        await pool.query(
          `INSERT INTO product_images (product_id, image_url, is_primary, display_order) 
           VALUES ($1, $2, $3, $4)`,
          [productId, '/uploads/placeholder.jpg', true, 0]
        );
      }
      
      console.log('✅ Sample products created');
    } else {
      console.log('ℹ️ Products already exist');
    }

    console.log('\n✨ Database seeding completed successfully!');
    
  } catch (error) {
    console.error('❌ Seeding error:', error);
    throw error;
  }
};

// Run seed if executed directly
if (require.main === module) {
  seedDatabase()
    .then(() => {
      console.log('🎉 Seeding complete');
      process.exit(0);
    })
    .catch(error => {
      console.error('Failed to seed database:', error);
      process.exit(1);
    });
}

module.exports = seedDatabase;