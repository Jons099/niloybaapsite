const { query, transaction } = require('../config/database');
const crypto = require('crypto');

// Generate order number
const generateOrderNumber = () => {
  const timestamp = Date.now().toString();
  const random = crypto.randomBytes(2).toString('hex').toUpperCase();
  return `LA${timestamp.slice(-8)}${random}`;
};

// Create order (Guest or Registered user)
const createOrder = async (req, res, next) => {
  const client = await pool.connect();
  
  try {
    await client.query('BEGIN');
    
    const {
      items,
      shippingAddress,
      paymentMethod,
      guestInfo,
      notes
    } = req.body;

    // Calculate totals
    let subtotal = 0;
    const orderItems = [];

    for (const item of items) {
      // Check stock availability
      const stockCheck = await client.query(
        `SELECT pi.stock_quantity, p.selling_price, p.name, p.sku 
         FROM products p
         JOIN product_inventory pi ON p.id = pi.product_id
         WHERE p.id = $1 AND pi.size = $2 AND p.is_active = true`,
        [item.productId, item.size]
      );

      if (stockCheck.rows.length === 0 || stockCheck.rows[0].stock_quantity < item.quantity) {
        throw new Error(`Insufficient stock for product ${item.productId}, size ${item.size}`);
      }

      const product = stockCheck.rows[0];
      const itemTotal = product.selling_price * item.quantity;
      subtotal += itemTotal;

      orderItems.push({
        productId: item.productId,
        productName: product.name,
        productSku: product.sku,
        size: item.size,
        quantity: item.quantity,
        unitPrice: product.selling_price,
        totalPrice: itemTotal
      });

      // Update inventory
      await client.query(
        `UPDATE product_inventory 
         SET stock_quantity = stock_quantity - $1, updated_at = CURRENT_TIMESTAMP
         WHERE product_id = $2 AND size = $3`,
        [item.quantity, item.productId, item.size]
      );
    }

    const taxAmount = subtotal * 0.18; // 18% GST
    const shippingCost = subtotal > 1000 ? 0 : 100; // Free shipping over ₹1000
    const totalAmount = subtotal + taxAmount + shippingCost;

    const orderNumber = generateOrderNumber();

    // Create order
    const orderResult = await client.query(
      `INSERT INTO orders 
       (order_number, user_id, guest_email, guest_name, guest_phone,
        shipping_address, shipping_city, shipping_state, shipping_pincode,
        subtotal, tax_amount, shipping_cost, total_amount,
        payment_method, payment_status, notes)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16)
       RETURNING *`,
      [
        orderNumber,
        req.user?.id || null,
        guestInfo?.email,
        guestInfo?.name,
        guestInfo?.phone,
        shippingAddress.address,
        shippingAddress.city,
        shippingAddress.state,
        shippingAddress.pincode,
        subtotal,
        taxAmount,
        shippingCost,
        totalAmount,
        paymentMethod,
        'pending',
        notes
      ]
    );

    const order = orderResult.rows[0];

    // Insert order items
    for (const item of orderItems) {
      await client.query(
        `INSERT INTO order_items 
         (order_id, product_id, product_name, product_sku, size, quantity, unit_price, total_price)
         VALUES ($1, $2, $3, $4, $5, $6, $7, $8)`,
        [
          order.id,
          item.productId,
          item.productName,
          item.productSku,
          item.size,
          item.quantity,
          item.unitPrice,
          item.totalPrice
        ]
      );
    }

    // Auto-assign to employee (round-robin)
    const availableEmployee = await client.query(
      `SELECT id FROM users 
       WHERE role IN ('employee', 'manager') 
       AND is_active = true 
       ORDER BY RANDOM() 
       LIMIT 1`
    );

    if (availableEmployee.rows.length > 0) {
      await client.query(
        `UPDATE orders SET assigned_to = $1, assigned_at = CURRENT_TIMESTAMP WHERE id = $2`,
        [availableEmployee.rows[0].id, order.id]
      );
    }

    await client.query('COMMIT');

    // Log activity
    await query(
      `INSERT INTO activity_logs (user_id, action, entity_type, entity_id) 
       VALUES ($1, $2, $3, $4)`,
      [req.user?.id || null, 'CREATE_ORDER', 'order', order.id]
    );

    res.status(201).json({
      success: true,
      order: {
        orderNumber: order.order_number,
        totalAmount: order.total_amount,
        status: order.status,
        estimatedDelivery: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000)
      }
    });
  } catch (error) {
    await client.query('ROLLBACK');
    next(error);
  } finally {
    client.release();
  }
};

// Track order by order number
const trackOrder = async (req, res, next) => {
  try {
    const { orderNumber } = req.params;

    const result = await query(
      `SELECT order_number, status, total_amount, order_date, 
              shipping_city, estimated_delivery
       FROM orders 
       WHERE order_number = $1`,
      [orderNumber]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ message: 'Order not found' });
    }

    res.json({
      success: true,
      order: result.rows[0]
    });
  } catch (error) {
    next(error);
  }
};

// Get user's orders
const getMyOrders = async (req, res, next) => {
  try {
    const result = await query(
      `SELECT order_number, total_amount, status, order_date, 
              payment_method, payment_status
       FROM orders 
       WHERE user_id = $1
       ORDER BY order_date DESC`,
      [req.user.id]
    );

    res.json({
      success: true,
      orders: result.rows
    });
  } catch (error) {
    next(error);
  }
};

// Get orders with filters (for dashboard)
const getOrders = async (req, res, next) => {
  try {
    const {
      page = 1,
      limit = 20,
      status,
      assignedTo,
      fromDate,
      toDate,
      search
    } = req.query;

    const offset = (page - 1) * limit;
    
    let queryText = `
      SELECT o.*,
             json_agg(
               json_build_object(
                 'id', oi.id,
                 'productName', oi.product_name,
                 'size', oi.size,
                 'quantity', oi.quantity,
                 'unitPrice', oi.unit_price,
                 'totalPrice', oi.total_price
               )
             ) as items,
             u.name as assigned_to_name
      FROM orders o
      LEFT JOIN order_items oi ON o.id = oi.order_id
      LEFT JOIN users u ON o.assigned_to = u.id
      WHERE 1=1
    `;
    
    const queryParams = [];
    let paramCount = 1;

    if (status) {
      queryText += ` AND o.status = $${paramCount}`;
      queryParams.push(status);
      paramCount++;
    }

    if (assignedTo) {
      queryText += ` AND o.assigned_to = $${paramCount}`;
      queryParams.push(assignedTo);
      paramCount++;
    }

    if (req.user.role === 'employee') {
      queryText += ` AND o.assigned_to = $${paramCount}`;
      queryParams.push(req.user.id);
      paramCount++;
    }

    if (fromDate) {
      queryText += ` AND o.order_date >= $${paramCount}`;
      queryParams.push(fromDate);
      paramCount++;
    }

    if (toDate) {
      queryText += ` AND o.order_date <= $${paramCount}`;
      queryParams.push(toDate);
      paramCount++;
    }

    if (search) {
      queryText += ` AND (o.order_number ILIKE $${paramCount} OR o.guest_name ILIKE $${paramCount} OR o.guest_email ILIKE $${paramCount})`;
      queryParams.push(`%${search}%`);
      paramCount++;
    }

    queryText += ` GROUP BY o.id, u.name`;

    // Get total count
    const countQuery = `SELECT COUNT(DISTINCT o.id) FROM (${queryText}) as filtered_orders`;
    const countResult = await query(countQuery, queryParams);
    const totalCount = parseInt(countResult.rows[0].count);

    // Add sorting and pagination
    queryText += ` ORDER BY o.order_date DESC LIMIT $${paramCount} OFFSET $${paramCount + 1}`;
    queryParams.push(limit, offset);

    const result = await query(queryText, queryParams);

    res.json({
      success: true,
      orders: result.rows,
      pagination: {
        currentPage: parseInt(page),
        totalPages: Math.ceil(totalCount / limit),
        totalItems: totalCount
      }
    });
  } catch (error) {
    next(error);
  }
};

// Update order status
const updateOrderStatus = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { status, notes } = req.body;
    const userId = req.user.id;
    const userRole = req.user.role;

    // Verify assignment or role permissions
    const orderCheck = await query(
      `SELECT assigned_to, status FROM orders WHERE id = $1`,
      [id]
    );

    if (orderCheck.rows.length === 0) {
      return res.status(404).json({ message: 'Order not found' });
    }

    const order = orderCheck.rows[0];

    // Employees can only update their assigned orders
    if (userRole === 'employee' && order.assigned_to !== userId) {
      return res.status(403).json({ message: 'Not authorized to update this order' });
    }

    const updateFields = ['status = $1'];
    const queryParams = [status];

    if (status === 'delivered') {
      updateFields.push('delivered_at = CURRENT_TIMESTAMP');
    }

    if (status === 'cancelled') {
      updateFields.push('cancelled_at = CURRENT_TIMESTAMP');
    }

    if (notes) {
      updateFields.push(`notes = COALESCE(notes, '') || CHAR(10) || $${queryParams.length + 1}`);
      queryParams.push(`[${new Date().toISOString()}] ${notes}`);
    }

    queryParams.push(id);

    const result = await query(
      `UPDATE orders 
       SET ${updateFields.join(', ')}, updated_at = CURRENT_TIMESTAMP
       WHERE id = $${queryParams.length}
       RETURNING *`,
      queryParams
    );

    // Log activity
    await query(
      `INSERT INTO activity_logs (user_id, action, entity_type, entity_id, details) 
       VALUES ($1, $2, $3, $4, $5)`,
      [userId, 'UPDATE_ORDER_STATUS', 'order', id, JSON.stringify({ status, notes })]
    );

    res.json({
      success: true,
      order: result.rows[0]
    });
  } catch (error) {
    next(error);
  }
};

// Get order details
const getOrderDetails = async (req, res, next) => {
  try {
    const { id } = req.params;

    const result = await query(
      `SELECT o.*,
              json_agg(
                json_build_object(
                  'id', oi.id,
                  'productName', oi.product_name,
                  'size', oi.size,
                  'quantity', oi.quantity,
                  'unitPrice', oi.unit_price,
                  'totalPrice', oi.total_price
                )
              ) as items,
              u.name as assigned_to_name,
              u.email as assigned_to_email
       FROM orders o
       LEFT JOIN order_items oi ON o.id = oi.order_id
       LEFT JOIN users u ON o.assigned_to = u.id
       WHERE o.id = $1
       GROUP BY o.id, u.name, u.email`,
      [id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ message: 'Order not found' });
    }

    res.json({
      success: true,
      order: result.rows[0]
    });
  } catch (error) {
    next(error);
  }
};

// Assign order to employee
const assignOrder = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { employeeId } = req.body;

    const result = await query(
      `UPDATE orders 
       SET assigned_to = $1, assigned_at = CURRENT_TIMESTAMP 
       WHERE id = $2 
       RETURNING *`,
      [employeeId, id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ message: 'Order not found' });
    }

    res.json({
      success: true,
      order: result.rows[0]
    });
  } catch (error) {
    next(error);
  }
};

// Cancel order
const cancelOrder = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { reason } = req.body;

    const result = await query(
      `UPDATE orders 
       SET status = 'cancelled', 
           cancelled_at = CURRENT_TIMESTAMP,
           cancellation_reason = $1
       WHERE id = $2 
       RETURNING *`,
      [reason, id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ message: 'Order not found' });
    }

    res.json({
      success: true,
      message: 'Order cancelled successfully'
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  createOrder,
  trackOrder,
  getMyOrders,
  getOrders,
  updateOrderStatus,
  getOrderDetails,
  assignOrder,
  cancelOrder
};