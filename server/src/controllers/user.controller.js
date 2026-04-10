const bcrypt = require('bcryptjs');
const { query } = require('../config/database');

const getAllUsers = async (req, res, next) => {
  try {
    const { page = 1, limit = 20, role, search } = req.query;
    const offset = (page - 1) * limit;

    let queryText = `
      SELECT id, name, email, phone, role, is_active, created_at, last_login
      FROM users
      WHERE 1=1
    `;
    
    const queryParams = [];
    let paramCount = 1;

    if (role) {
      queryText += ` AND role = $${paramCount}`;
      queryParams.push(role);
      paramCount++;
    }

    if (search) {
      queryText += ` AND (name ILIKE $${paramCount} OR email ILIKE $${paramCount})`;
      queryParams.push(`%${search}%`);
      paramCount++;
    }

    // Get total count
    const countResult = await query(
      `SELECT COUNT(*) FROM (${queryText}) as filtered_users`,
      queryParams
    );
    const totalCount = parseInt(countResult.rows[0].count);

    // Add pagination
    queryText += ` ORDER BY created_at DESC LIMIT $${paramCount} OFFSET $${paramCount + 1}`;
    queryParams.push(limit, offset);

    const result = await query(queryText, queryParams);

    res.json({
      success: true,
      users: result.rows,
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

const createUser = async (req, res, next) => {
  try {
    const { name, email, password, phone, role } = req.body;

    // Check if user exists
    const existing = await query(
      'SELECT id FROM users WHERE email = $1',
      [email]
    );

    if (existing.rows.length > 0) {
      return res.status(400).json({ message: 'User already exists' });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const result = await query(
      `INSERT INTO users (name, email, password, phone, role) 
       VALUES ($1, $2, $3, $4, $5) 
       RETURNING id, name, email, phone, role, created_at`,
      [name, email, hashedPassword, phone, role]
    );

    res.status(201).json({
      success: true,
      user: result.rows[0]
    });
  } catch (error) {
    next(error);
  }
};

const updateUser = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { name, email, phone, role, isActive } = req.body;

    const result = await query(
      `UPDATE users 
       SET name = COALESCE($1, name),
           email = COALESCE($2, email),
           phone = COALESCE($3, phone),
           role = COALESCE($4, role),
           is_active = COALESCE($5, is_active),
           updated_at = CURRENT_TIMESTAMP
       WHERE id = $6
       RETURNING id, name, email, phone, role, is_active`,
      [name, email, phone, role, isActive, id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ message: 'User not found' });
    }

    res.json({
      success: true,
      user: result.rows[0]
    });
  } catch (error) {
    next(error);
  }
};

const deleteUser = async (req, res, next) => {
  try {
    const { id } = req.params;

    // Soft delete - deactivate user
    const result = await query(
      `UPDATE users SET is_active = false, updated_at = CURRENT_TIMESTAMP WHERE id = $1 RETURNING id`,
      [id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ message: 'User not found' });
    }

    res.json({
      success: true,
      message: 'User deactivated successfully'
    });
  } catch (error) {
    next(error);
  }
};

const getEmployees = async (req, res, next) => {
  try {
    const result = await query(
      `SELECT 
         u.id,
         u.name,
         u.email,
         u.phone,
         u.is_active,
         u.created_at,
         COUNT(DISTINCT o.id) as total_orders_handled,
         COALESCE(SUM(o.total_amount), 0) as total_revenue_generated,
         COUNT(DISTINCT CASE WHEN o.status = 'delivered' THEN o.id END) as completed_orders,
         COUNT(DISTINCT CASE WHEN o.status = 'pending' THEN o.id END) as pending_orders
       FROM users u
       LEFT JOIN orders o ON u.id = o.assigned_to
       WHERE u.role IN ('employee', 'manager')
       GROUP BY u.id
       ORDER BY total_orders_handled DESC`
    );

    res.json({
      success: true,
      employees: result.rows
    });
  } catch (error) {
    next(error);
  }
};

const getEmployeePerformance = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { days = 30 } = req.query;

    const result = await query(
      `SELECT 
         DATE(o.order_date) as date,
         COUNT(DISTINCT o.id) as orders_processed,
         COALESCE(SUM(o.total_amount), 0) as revenue_generated
       FROM orders o
       WHERE o.assigned_to = $1 
         AND o.order_date >= CURRENT_DATE - ($2 || ' days')::INTERVAL
       GROUP BY DATE(o.order_date)
       ORDER BY date DESC`,
      [id, days]
    );

    res.json({
      success: true,
      performance: result.rows,
      period: `Last ${days} days`
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getAllUsers,
  createUser,
  updateUser,
  deleteUser,
  getEmployees,
  getEmployeePerformance
};