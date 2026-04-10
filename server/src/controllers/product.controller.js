const { query, transaction } = require('../config/database');
const path = require('path');
const fs = require('fs').promises;

// Helper function to generate slug
const generateSlug = (name) => {
  return name
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '');
};

// Get all products with filters
const getProducts = async (req, res, next) => {
  try {
    const {
      page = 1,
      limit = 12,
      category,
      minPrice,
      maxPrice,
      size,
      search,
      sortBy = 'created_at',
      sortOrder = 'DESC',
      inStock
    } = req.query;

    const offset = (page - 1) * limit;
    
    // Build WHERE conditions
    let whereConditions = ['p.is_active = true'];
    const queryParams = [];
    let paramCount = 1;

    if (category) {
      whereConditions.push(`p.category = $${paramCount}`);
      queryParams.push(category);
      paramCount++;
    }

    if (minPrice) {
      whereConditions.push(`p.selling_price >= $${paramCount}`);
      queryParams.push(minPrice);
      paramCount++;
    }

    if (maxPrice) {
      whereConditions.push(`p.selling_price <= $${paramCount}`);
      queryParams.push(maxPrice);
      paramCount++;
    }

    if (search) {
      whereConditions.push(`(p.name ILIKE $${paramCount} OR p.description ILIKE $${paramCount})`);
      queryParams.push(`%${search}%`);
      paramCount++;
    }

    if (size) {
      whereConditions.push(`EXISTS (
        SELECT 1 FROM product_inventory pi2 
        WHERE pi2.product_id = p.id 
        AND pi2.size = $${paramCount} 
        AND pi2.stock_quantity > 0
      )`);
      queryParams.push(size);
      paramCount++;
    }

    if (inStock === 'true') {
      whereConditions.push(`EXISTS (
        SELECT 1 FROM product_inventory pi3 
        WHERE pi3.product_id = p.id 
        AND pi3.stock_quantity > 0
      )`);
    }

    const whereClause = whereConditions.join(' AND ');

    // Get total count
    const countQuery = `
      SELECT COUNT(DISTINCT p.id) as total
      FROM products p
      WHERE ${whereClause}
    `;
    
    const countResult = await query(countQuery, queryParams);
    const totalCount = parseInt(countResult.rows[0].total);

    // Build main query
    const validSortColumns = ['name', 'selling_price', 'created_at'];
    const validSortOrders = ['ASC', 'DESC'];
    
    const finalSortBy = validSortColumns.includes(sortBy) ? sortBy : 'created_at';
    const finalSortOrder = validSortOrders.includes(sortOrder?.toUpperCase()) ? sortOrder.toUpperCase() : 'DESC';

    const mainQuery = `
      SELECT 
        p.id,
        p.name,
        p.slug,
        p.description,
        p.category,
        p.selling_price,
        p.cost_price,
        p.sku,
        p.is_active,
        p.is_featured,
        p.created_at,
        p.updated_at
      FROM products p
      WHERE ${whereClause}
      ORDER BY p.${finalSortBy} ${finalSortOrder}
      LIMIT $${paramCount} OFFSET $${paramCount + 1}
    `;

    const mainParams = [...queryParams, limit, offset];
    const result = await query(mainQuery, mainParams);
    
    // Get images and inventory for each product
    const products = await Promise.all(result.rows.map(async (product) => {
      // Get images
      const imagesResult = await query(
        `SELECT id, image_url, is_primary, display_order 
         FROM product_images 
         WHERE product_id = $1 
         ORDER BY display_order ASC`,
        [product.id]
      );
      
      // Get inventory
      const inventoryResult = await query(
        `SELECT size, stock_quantity as stock 
         FROM product_inventory 
         WHERE product_id = $1 
         ORDER BY size`,
        [product.id]
      );

      // Calculate total stock
      const totalStock = inventoryResult.rows.reduce((sum, inv) => sum + parseInt(inv.stock), 0);
      
      return {
        ...product,
        images: imagesResult.rows,
        inventory: inventoryResult.rows,
        total_stock: totalStock
      };
    }));

    res.json({
      success: true,
      products,
      pagination: {
        currentPage: parseInt(page),
        totalPages: Math.ceil(totalCount / limit),
        totalItems: totalCount,
        itemsPerPage: parseInt(limit)
      }
    });
  } catch (error) {
    console.error('Error in getProducts:', error);
    next(error);
  }
};

// Get single product by ID or slug
const getProduct = async (req, res, next) => {
  try {
    const { idOrSlug } = req.params;
    const isUUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(idOrSlug);

    // Get product details
    const productQuery = isUUID 
      ? 'SELECT * FROM products WHERE id = $1 AND is_active = true'
      : 'SELECT * FROM products WHERE slug = $1 AND is_active = true';
    
    const productResult = await query(productQuery, [idOrSlug]);

    if (productResult.rows.length === 0) {
      return res.status(404).json({ message: 'Product not found' });
    }

    const product = productResult.rows[0];

    // Get images
    const imagesResult = await query(
      `SELECT id, image_url, is_primary, display_order 
       FROM product_images 
       WHERE product_id = $1 
       ORDER BY display_order ASC`,
      [product.id]
    );

    // Get inventory
    const inventoryResult = await query(
      `SELECT size, stock_quantity as stock,
              CASE WHEN stock_quantity > 0 THEN true ELSE false END as available
       FROM product_inventory 
       WHERE product_id = $1 
       ORDER BY size`,
      [product.id]
    );

    // Get total stock
    const totalStock = inventoryResult.rows.reduce((sum, inv) => sum + parseInt(inv.stock), 0);

    res.json({
      success: true,
      product: {
        ...product,
        images: imagesResult.rows,
        inventory: inventoryResult.rows,
        total_stock: totalStock
      }
    });
  } catch (error) {
    console.error('Error in getProduct:', error);
    next(error);
  }
};

// Create new product (Manager/Admin only)
const createProduct = async (req, res, next) => {
  const client = await pool.connect();
  
  try {
    await client.query('BEGIN');
    
    const {
      name,
      description,
      category,
      sellingPrice,
      costPrice,
      sku,
      sizes,
      isFeatured,
      imageUrl
    } = req.body;

    console.log('Creating product with data:', { name, category, sellingPrice, costPrice, sku, imageUrl });

    const slug = generateSlug(name);
    const createdBy = req.user.id;

    // Check if SKU already exists
    const skuCheck = await client.query(
      'SELECT id FROM products WHERE sku = $1',
      [sku]
    );
    
    if (skuCheck.rows.length > 0) {
      await client.query('ROLLBACK');
      return res.status(400).json({ 
        success: false, 
        message: 'SKU already exists. Please use a unique SKU.' 
      });
    }

    // Insert product
    const productResult = await client.query(
      `INSERT INTO products 
       (name, slug, description, category, selling_price, cost_price, sku, is_featured, created_by) 
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9) 
       RETURNING *`,
      [name, slug, description || '', category, sellingPrice, costPrice, sku, isFeatured || false, createdBy]
    );

    const product = productResult.rows[0];
    console.log('Product created:', product.id);

    // Add image if provided
    if (imageUrl && imageUrl.trim() !== '') {
      await client.query(
        `INSERT INTO product_images (product_id, image_url, is_primary, display_order) 
         VALUES ($1, $2, $3, $4)`,
        [product.id, imageUrl.trim(), true, 0]
      );
      console.log('Image added for product');
    } else {
      // Add a placeholder image
      await client.query(
        `INSERT INTO product_images (product_id, image_url, is_primary, display_order) 
         VALUES ($1, $2, $3, $4)`,
        [product.id, 'https://images.unsplash.com/photo-1539008835657-9e8e9680c956?w=500', true, 0]
      );
    }

    // Handle inventory
    if (sizes && Array.isArray(sizes)) {
      for (const sizeData of sizes) {
        await client.query(
          `INSERT INTO product_inventory (product_id, size, stock_quantity, low_stock_threshold) 
           VALUES ($1, $2, $3, $4)`,
          [product.id, sizeData.size, sizeData.stock || sizeData.quantity || 10, 5]
        );
      }
      console.log('Inventory added for product');
    }

    await client.query('COMMIT');

    // Get the complete product with images and inventory
    const completeProduct = await client.query(
      `SELECT p.*,
              (SELECT json_agg(row_to_json(img)) 
               FROM product_images img 
               WHERE img.product_id = p.id) as images,
              (SELECT json_agg(row_to_json(inv)) 
               FROM product_inventory inv 
               WHERE inv.product_id = p.id) as inventory
       FROM products p
       WHERE p.id = $1`,
      [product.id]
    );

    res.status(201).json({
      success: true,
      message: 'Product created successfully',
      product: completeProduct.rows[0]
    });

  } catch (error) {
    await client.query('ROLLBACK');
    console.error('Error in createProduct:', error);
    
    // Handle specific database errors
    if (error.code === '23505') {
      return res.status(400).json({ 
        success: false, 
        message: 'A product with this SKU or slug already exists.' 
      });
    }
    
    res.status(500).json({ 
      success: false, 
      message: error.message || 'Failed to create product'
    });
  } finally {
    client.release();
  }
};

// Update product
const updateProduct = async (req, res, next) => {
  try {
    const { id } = req.params;
    const {
      name,
      description,
      category,
      sellingPrice,
      costPrice,
      isActive,
      isFeatured
    } = req.body;

    let slug;
    if (name) {
      slug = generateSlug(name);
    }

    const result = await query(
      `UPDATE products 
       SET name = COALESCE($1, name),
           slug = COALESCE($2, slug),
           description = COALESCE($3, description),
           category = COALESCE($4, category),
           selling_price = COALESCE($5, selling_price),
           cost_price = COALESCE($6, cost_price),
           is_active = COALESCE($7, is_active),
           is_featured = COALESCE($8, is_featured),
           updated_at = CURRENT_TIMESTAMP
       WHERE id = $9
       RETURNING *`,
      [name, slug, description, category, sellingPrice, costPrice, isActive, isFeatured, id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ message: 'Product not found' });
    }

    res.json({
      success: true,
      product: result.rows[0]
    });
  } catch (error) {
    console.error('Error in updateProduct:', error);
    next(error);
  }
};

// Delete product (Soft delete)
const deleteProduct = async (req, res, next) => {
  try {
    const { id } = req.params;

    const result = await query(
      `UPDATE products 
       SET is_active = false, updated_at = CURRENT_TIMESTAMP 
       WHERE id = $1 
       RETURNING id`,
      [id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ message: 'Product not found' });
    }

    res.json({
      success: true,
      message: 'Product deleted successfully'
    });
  } catch (error) {
    console.error('Error in deleteProduct:', error);
    next(error);
  }
};

// Update inventory
const updateInventory = async (req, res, next) => {
  try {
    const { productId, size } = req.params;
    const { quantity, lowStockThreshold } = req.body;

    const result = await query(
      `UPDATE product_inventory 
       SET stock_quantity = $1,
           low_stock_threshold = COALESCE($2, low_stock_threshold),
           updated_at = CURRENT_TIMESTAMP
       WHERE product_id = $3 AND size = $4
       RETURNING *`,
      [quantity, lowStockThreshold, productId, size]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ message: 'Inventory not found' });
    }

    res.json({
      success: true,
      inventory: result.rows[0]
    });
  } catch (error) {
    console.error('Error in updateInventory:', error);
    next(error);
  }
};

module.exports = {
  getProducts,
  getProduct,
  createProduct,
  updateProduct,
  deleteProduct,
  updateInventory
};