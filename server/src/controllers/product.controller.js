const { query, transaction } = require('../config/database');
const sharp = require('sharp');
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
    
    let queryText = `
      SELECT DISTINCT p.*,
             COALESCE(SUM(pi.stock_quantity), 0) as total_stock,
             (
               SELECT json_agg(
                 json_build_object(
                   'id', img.id,
                   'url', img.image_url,
                   'is_primary', img.is_primary
                 )
               )
               FROM product_images img
               WHERE img.product_id = p.id
             ) as images,
             (
               SELECT json_agg(
                 json_build_object(
                   'size', pi.size,
                   'stock', pi.stock_quantity
                 )
               )
               FROM product_inventory pi
               WHERE pi.product_id = p.id
             ) as inventory
      FROM products p
      LEFT JOIN product_inventory pi ON p.id = pi.product_id
      WHERE p.is_active = true
    `;
    
    const queryParams = [];
    let paramCount = 1;

    // Apply filters
    if (category) {
      queryText += ` AND p.category = $${paramCount}`;
      queryParams.push(category);
      paramCount++;
    }

    if (minPrice) {
      queryText += ` AND p.selling_price >= $${paramCount}`;
      queryParams.push(minPrice);
      paramCount++;
    }

    if (maxPrice) {
      queryText += ` AND p.selling_price <= $${paramCount}`;
      queryParams.push(maxPrice);
      paramCount++;
    }

    if (search) {
      queryText += ` AND (p.name ILIKE $${paramCount} OR p.description ILIKE $${paramCount})`;
      queryParams.push(`%${search}%`);
      paramCount++;
    }

    if (size) {
      queryText += ` AND EXISTS (
        SELECT 1 FROM product_inventory pi2 
        WHERE pi2.product_id = p.id 
        AND pi2.size = $${paramCount} 
        AND pi2.stock_quantity > 0
      )`;
      queryParams.push(size);
      paramCount++;
    }

    if (inStock === 'true') {
      queryText += ` AND pi.stock_quantity > 0`;
    }

    queryText += ` GROUP BY p.id`;

    // Get total count
    const countQuery = `SELECT COUNT(DISTINCT p.id) FROM (${queryText}) as filtered_products`;
    const countResult = await query(countQuery, queryParams);
    const totalCount = parseInt(countResult.rows[0].count);

    // Add sorting and pagination
    queryText += ` ORDER BY p.${sortBy} ${sortOrder} 
                   LIMIT $${paramCount} OFFSET $${paramCount + 1}`;
    queryParams.push(limit, offset);

    const result = await query(queryText, queryParams);

    res.json({
      success: true,
      products: result.rows,
      pagination: {
        currentPage: parseInt(page),
        totalPages: Math.ceil(totalCount / limit),
        totalItems: totalCount,
        itemsPerPage: parseInt(limit)
      }
    });
  } catch (error) {
    next(error);
  }
};

// Get single product by ID or slug
const getProduct = async (req, res, next) => {
  try {
    const { idOrSlug } = req.params;
    const isUUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(idOrSlug);

    const result = await query(
      `SELECT p.*,
              (
                SELECT json_agg(
                  json_build_object(
                    'id', img.id,
                    'url', img.image_url,
                    'is_primary', img.is_primary
                  )
                )
                FROM product_images img
                WHERE img.product_id = p.id
              ) as images,
              (
                SELECT json_agg(
                  json_build_object(
                    'size', pi.size,
                    'stock', pi.stock_quantity,
                    'available', pi.stock_quantity > 0
                  )
                )
                FROM product_inventory pi
                WHERE pi.product_id = p.id
              ) as inventory
       FROM products p
       WHERE ${isUUID ? 'p.id = $1' : 'p.slug = $1'} AND p.is_active = true`,
      [idOrSlug]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ message: 'Product not found' });
    }

    // Track product view
    await query(
      `INSERT INTO product_views (product_id, user_id, session_id) 
       VALUES ($1, $2, $3)`,
      [result.rows[0].id, req.user?.id, req.sessionID]
    );

    res.json({
      success: true,
      product: result.rows[0]
    });
  } catch (error) {
    next(error);
  }
};

// Create new product (Manager/Admin only)
const createProduct = async (req, res, next) => {
  const client = await transaction();
  
  try {
    const {
      name,
      description,
      category,
      sellingPrice,
      costPrice,
      sku,
      sizes,
      isFeatured
    } = req.body;

    const slug = generateSlug(name);
    const createdBy = req.user.id;

    // Insert product
    const productResult = await client.query(
      `INSERT INTO products 
       (name, slug, description, category, selling_price, cost_price, sku, is_featured, created_by) 
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9) 
       RETURNING *`,
      [name, slug, description, category, sellingPrice, costPrice, sku, isFeatured, createdBy]
    );

    const product = productResult.rows[0];

    // Handle image uploads
    if (req.files && req.files.length > 0) {
      for (let i = 0; i < req.files.length; i++) {
        const file = req.files[i];
        const imageUrl = `/uploads/products/${file.filename}`;
        
        await client.query(
          `INSERT INTO product_images (product_id, image_url, is_primary, display_order) 
           VALUES ($1, $2, $3, $4)`,
          [product.id, imageUrl, i === 0, i]
        );
      }
    }

    // Handle inventory
    if (sizes) {
      const sizeArray = JSON.parse(sizes);
      for (const sizeData of sizeArray) {
        await client.query(
          `INSERT INTO product_inventory (product_id, size, stock_quantity) 
           VALUES ($1, $2, $3)`,
          [product.id, sizeData.size, sizeData.quantity]
        );
      }
    }

    await client.query('COMMIT');

    // Log activity
    await query(
      `INSERT INTO activity_logs (user_id, action, entity_type, entity_id) 
       VALUES ($1, $2, $3, $4)`,
      [req.user.id, 'CREATE_PRODUCT', 'product', product.id]
    );

    res.status(201).json({
      success: true,
      product
    });
  } catch (error) {
    await client.query('ROLLBACK');
    next(error);
  }
};

// Update product
const updateProduct = async (req, res, next) => {
  const client = await transaction();
  
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

    const result = await client.query(
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

    await client.query('COMMIT');

    // Log activity
    await query(
      `INSERT INTO activity_logs (user_id, action, entity_type, entity_id) 
       VALUES ($1, $2, $3, $4)`,
      [req.user.id, 'UPDATE_PRODUCT', 'product', id]
    );

    res.json({
      success: true,
      product: result.rows[0]
    });
  } catch (error) {
    await client.query('ROLLBACK');
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

    // Log activity
    await query(
      `INSERT INTO activity_logs (user_id, action, entity_type, entity_id) 
       VALUES ($1, $2, $3, $4)`,
      [req.user.id, 'DELETE_PRODUCT', 'product', id]
    );

    res.json({
      success: true,
      message: 'Product deleted successfully'
    });
  } catch (error) {
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

    // Check for low stock
    if (quantity <= (lowStockThreshold || 5)) {
      // Trigger low stock alert (implement notification service)
      console.log(`Low stock alert: Product ${productId}, Size ${size}`);
    }

    // Log activity
    await query(
      `INSERT INTO activity_logs (user_id, action, entity_type, entity_id, details) 
       VALUES ($1, $2, $3, $4, $5)`,
      [req.user.id, 'UPDATE_INVENTORY', 'product_inventory', productId, 
       JSON.stringify({ size, quantity })]
    );

    res.json({
      success: true,
      inventory: result.rows[0]
    });
  } catch (error) {
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