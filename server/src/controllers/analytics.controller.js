const { query } = require('../config/database');

// Get dashboard analytics
const getDashboardAnalytics = async (req, res, next) => {
  try {
    const userRole = req.user.role;
    const userId = req.user.id;
    
    let queryParams = [];
    let employeeFilter = '';

    if (userRole === 'employee') {
      employeeFilter = 'AND o.assigned_to = $1';
      queryParams.push(userId);
    }

    // Get summary stats
    const summaryQuery = `
      SELECT 
        COUNT(DISTINCT o.id) as total_orders,
        COALESCE(SUM(o.total_amount), 0) as total_revenue,
        COALESCE(SUM(o.total_amount - (
          SELECT COALESCE(SUM(p.cost_price * oi.quantity), 0)
          FROM order_items oi
          JOIN products p ON oi.product_id = p.id
          WHERE oi.order_id = o.id
        )), 0) as total_profit,
        COUNT(DISTINCT CASE WHEN o.status = 'pending' THEN o.id END) as pending_orders,
        COUNT(DISTINCT CASE WHEN o.status = 'processing' THEN o.id END) as processing_orders,
        COUNT(DISTINCT CASE WHEN o.status = 'delivered' THEN o.id END) as delivered_orders
      FROM orders o
      WHERE DATE(o.order_date) = CURRENT_DATE ${employeeFilter}
    `;

    const summaryResult = await query(summaryQuery, queryParams);

    // Get sales trend (last 7 days)
    const trendQuery = `
      SELECT 
        DATE(o.order_date) as date,
        COUNT(DISTINCT o.id) as orders,
        COALESCE(SUM(o.total_amount), 0) as revenue,
        COALESCE(SUM(o.total_amount - (
          SELECT COALESCE(SUM(p.cost_price * oi.quantity), 0)
          FROM order_items oi
          JOIN products p ON oi.product_id = p.id
          WHERE oi.order_id = o.id
        )), 0) as profit
      FROM orders o
      WHERE o.order_date >= CURRENT_DATE - INTERVAL '7 days' ${employeeFilter}
      GROUP BY DATE(o.order_date)
      ORDER BY date DESC
    `;

    const trendResult = await query(trendQuery, queryParams);

    // Get top selling products
    const topProductsQuery = `
      SELECT 
        p.id,
        p.name,
        p.sku,
        COUNT(DISTINCT oi.order_id) as order_count,
        SUM(oi.quantity) as total_quantity,
        SUM(oi.total_price) as total_revenue,
        SUM(oi.total_price - (p.cost_price * oi.quantity)) as total_profit
      FROM order_items oi
      JOIN products p ON oi.product_id = p.id
      JOIN orders o ON oi.order_id = o.id
      WHERE o.order_date >= CURRENT_DATE - INTERVAL '30 days' ${employeeFilter}
      GROUP BY p.id, p.name, p.sku
      ORDER BY total_revenue DESC
      LIMIT 10
    `;

    const topProductsResult = await query(topProductsQuery, queryParams);

    // Get category performance
    const categoryQuery = `
      SELECT 
        p.category,
        COUNT(DISTINCT oi.order_id) as order_count,
        SUM(oi.quantity) as total_quantity,
        SUM(oi.total_price) as total_revenue,
        SUM(oi.total_price - (p.cost_price * oi.quantity)) as total_profit
      FROM order_items oi
      JOIN products p ON oi.product_id = p.id
      JOIN orders o ON oi.order_id = o.id
      WHERE o.order_date >= CURRENT_DATE - INTERVAL '30 days' ${employeeFilter}
      GROUP BY p.category
      ORDER BY total_revenue DESC
    `;

    const categoryResult = await query(categoryQuery, queryParams);

    // For Admin/Manager: Get employee performance
    let employeePerformance = null;
    if (userRole !== 'employee') {
      const employeeQuery = `
        SELECT 
          u.id,
          u.name,
          u.email,
          COUNT(DISTINCT o.id) as orders_handled,
          COALESCE(SUM(o.total_amount), 0) as revenue_generated,
          COUNT(DISTINCT CASE WHEN o.status = 'delivered' THEN o.id END) as completed_orders
        FROM users u
        LEFT JOIN orders o ON u.id = o.assigned_to AND o.order_date >= CURRENT_DATE - INTERVAL '30 days'
        WHERE u.role IN ('employee', 'manager')
        GROUP BY u.id, u.name, u.email
        ORDER BY revenue_generated DESC
      `;

      const employeeResult = await query(employeeQuery);
      employeePerformance = employeeResult.rows;
    }

    // Get inventory alerts
    const inventoryQuery = `
      SELECT 
        p.id,
        p.name,
        pi.size,
        pi.stock_quantity,
        pi.low_stock_threshold
      FROM product_inventory pi
      JOIN products p ON pi.product_id = p.id
      WHERE pi.stock_quantity <= pi.low_stock_threshold
      ORDER BY pi.stock_quantity ASC
      LIMIT 10
    `;

    const inventoryResult = await query(inventoryQuery);

    res.json({
      success: true,
      analytics: {
        summary: summaryResult.rows[0],
        trend: trendResult.rows,
        topProducts: topProductsResult.rows,
        categories: categoryResult.rows,
        employeePerformance,
        lowStockAlerts: inventoryResult.rows,
        updatedAt: new Date().toISOString()
      }
    });
  } catch (error) {
    next(error);
  }
};

// Get detailed reports
const getDetailedReport = async (req, res, next) => {
  try {
    const { startDate, endDate, reportType } = req.query;
    
    let reportData;
    
    switch (reportType) {
      case 'sales':
        reportData = await query(
          `SELECT 
             DATE(o.order_date) as date,
             COUNT(*) as total_orders,
             SUM(o.total_amount) as revenue,
             SUM(o.total_amount - (
               SELECT COALESCE(SUM(p.cost_price * oi.quantity), 0)
               FROM order_items oi
               JOIN products p ON oi.product_id = p.id
               WHERE oi.order_id = o.id
             )) as profit,
             AVG(o.total_amount) as average_order_value
           FROM orders o
           WHERE o.order_date BETWEEN $1 AND $2
           GROUP BY DATE(o.order_date)
           ORDER BY date`,
          [startDate, endDate]
        );
        break;
        
      case 'inventory':
        reportData = await query(
          `SELECT 
             p.category,
             COUNT(DISTINCT p.id) as total_products,
             SUM(pi.stock_quantity) as total_stock,
             SUM(p.cost_price * pi.stock_quantity) as inventory_value,
             SUM(p.selling_price * pi.stock_quantity) as potential_revenue
           FROM products p
           JOIN product_inventory pi ON p.id = pi.product_id
           WHERE p.is_active = true
           GROUP BY p.category`
        );
        break;
        
      default:
        reportData = { rows: [] };
    }

    res.json({
      success: true,
      report: {
        type: reportType,
        period: { startDate, endDate },
        data: reportData?.rows || []
      }
    });
  } catch (error) {
    next(error);
  }
};

// Export report (simplified)
const exportReport = async (req, res, next) => {
  try {
    const { type } = req.params;
    const { startDate, endDate } = req.query;
    
    // This would generate CSV/Excel file
    res.json({
      success: true,
      message: 'Export functionality ready',
      downloadUrl: `/exports/${type}_${Date.now()}.csv`
    });
  } catch (error) {
    next(error);
  }
};

// Get realtime metrics
const getRealtimeMetrics = async (req, res, next) => {
  try {
    const result = await query(`
      SELECT 
        (SELECT COUNT(*) FROM orders WHERE DATE(order_date) = CURRENT_DATE) as today_orders,
        (SELECT COALESCE(SUM(total_amount), 0) FROM orders WHERE DATE(order_date) = CURRENT_DATE) as today_revenue,
        (SELECT COUNT(*) FROM users WHERE created_at > CURRENT_DATE - INTERVAL '24 hours') as new_customers,
        (SELECT COUNT(*) FROM orders WHERE status = 'pending') as pending_orders
    `);

    res.json({
      success: true,
      metrics: result.rows[0]
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getDashboardAnalytics,
  getDetailedReport,
  exportReport,
  getRealtimeMetrics
};