'use strict';
// admin.js — Удирдлагын самбарт зориулсан нэгтгэлийн (aggregated) тоон мэдээллийн endpoint.
// Client дээр 3 тусдаа API дуудаж, JS-ээр тооцохын оронд нэг SQL хүсэлтээр бүгдийг тооцоолно.
const router = require('express').Router();
const { query: db }    = require('../config/db');
const { requireAdmin } = require('../middleware/auth');

// GET /api/admin/stats — Dashboard-д шаардлагатай бүх KPI, сүүлийн захиалга, шилдэг бараа, орлогын графикийн өгөгдлийг нэг дуудалтаар авах
router.get('/stats', requireAdmin, async (req, res, next) => {
  try {
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

    // Бүх тооцоолол PostgreSQL дээр нэгэн зэрэг гүйцэтгэнэ (Promise.all)
    const [kpiResult, userCount, productCount, recentOrders, topProducts, revenueByDay] = await Promise.all([
      // 1. Нийт орлого, захиалгын тоо, хүлээгдэж буй тоо, энэ сар болон өнгөрсөн сарын орлого
      db(`
        SELECT
          COUNT(*)::int                                                                      AS total_orders,
          COUNT(*) FILTER (WHERE status = 'pending')::int                                   AS pending_count,
          COALESCE(SUM(total) FILTER (WHERE status != 'cancelled'), 0)::bigint             AS total_revenue,
          COALESCE(SUM(total) FILTER (WHERE status != 'cancelled'
            AND created_at >= date_trunc('month', NOW())), 0)::bigint                      AS revenue_this_month,
          COALESCE(SUM(total) FILTER (WHERE status != 'cancelled'
            AND created_at >= date_trunc('month', NOW()) - INTERVAL '1 month'
            AND created_at <  date_trunc('month', NOW())), 0)::bigint                      AS revenue_last_month
        FROM orders
      `),
      // 2. Customer үүрэгтэй хэрэглэгчдийн тоо
      db(`SELECT COUNT(*) FILTER (WHERE role = 'customer')::int AS count FROM users`),
      // 3. Нийт бүтээгдэхүүний тоо
      db(`SELECT COUNT(*)::int AS count FROM products`),
      // 4. Сүүлийн 8 захиалга (хэрэглэгчийн нэрийн хамт)
      db(`
        SELECT o.id, o.order_number, o.total, o.status, o.created_at,
               (u.first_name || ' ' || u.last_name) AS user_name
        FROM   orders o
        LEFT   JOIN users u ON u.id = o.user_id
        ORDER  BY o.created_at DESC
        LIMIT  8
      `),
      // 5. Сэтгэгдлийн тоогоор тэргүүлсэн 5 бүтээгдэхүүн
      db(`
        SELECT id, name, name_mn, price, rating, reviews_count
        FROM   products
        ORDER  BY reviews_count DESC
        LIMIT  5
      `),
      // 6. Сүүлийн 30 хоногийн өдөр тутмын орлого (графикт зориулсан)
      db(`
        SELECT DATE(created_at) AS day, SUM(total)::bigint AS revenue
        FROM   orders
        WHERE  created_at >= $1 AND status != 'cancelled'
        GROUP  BY DATE(created_at)
        ORDER  BY day ASC
      `, [thirtyDaysAgo.toISOString()]),
    ]);

    const k = kpiResult.rows[0];
    return res.json({
      totalRevenue:      Number(k.total_revenue),
      totalOrders:       k.total_orders,
      pendingOrders:     k.pending_count,
      totalCustomers:    userCount.rows[0].count,
      totalProducts:     productCount.rows[0].count,
      revenueThisMonth:  Number(k.revenue_this_month),
      revenueLastMonth:  Number(k.revenue_last_month),
      recentOrders:      recentOrders.rows,
      topProducts:       topProducts.rows,
      revenueByDay:      revenueByDay.rows,
    });
  } catch (err) { next(err); }
});

module.exports = router;
