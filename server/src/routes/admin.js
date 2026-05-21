'use strict'; // JavaScript-ийн strict горимыг идэвхжүүлж, алдаа гаргахаас сэргийлж, илүү найдвартай код бичих нөхцөлийг бүрдүүлнэ

// Admin dashboard-ын статистик мэдээллийг авах
const router = require('express').Router(); // Express-ийн Router-ийг дуудаж модулийн замуудыг тодорхойлно

const { query: db }    = require('../config/db'); // SQL хүсэлт ажиллуулуулах query wrapper

const { requireAdmin } = require('../middleware/auth'); // Зөвхөн админ хандахыг зөвшөөрөх middleware

// GET /api/admin/stats - Админы хянах самбарт зориулж нэгтгэсэн статистик болон KPI мэдээллүүдийг авах
router.get('/stats', requireAdmin, async (req, res, next) => { // GET /stats замд хандахад requireAdmin-ээр шалгаж async функцийг ажиллуулна
  try {
    const thirtyDaysAgo = new Date(); // Одоогийн цаг хугацааг илэрхийлэх Date объект үүсгэнэ
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30); // Одоогийн өдрөөс 30 хоногийг хасаж эхлэх өдрийг тооцно

    // Олон тусдаа SQL хүсэлтүүдийг өгөгдлийн санд нэгэн зэрэг (concurrently) ажиллуулж хугацаа хэмнэнэ (Promise.all)
    const [kpiResult, userCount, productCount, recentOrders, topProducts, revenueByDay] = await Promise.all([
      
      // 1. Нийт захиалгын тоо, хүлээгдэж буй тоо, нийт орлого, энэ сарын орлого болон өнгөрсөн сарын орлогыг нэг хүсэлтээр бодож олно
      db(`
        /* Нийт захиалга, хүлээгдэж буй захиалга, нийт орлого болон саруудын орлогыг тооцоолох SQL */
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
      
      // 2. Системд бүртгэлтэй 'customer' үүрэгтэй нийт хэрэглэгчдийн тоог олно
      db(`/* Хэрэглэгчдийн үүрэг customer байх нийт тоог авах SQL */ SELECT COUNT(*) FILTER (WHERE role = 'customer')::int AS count FROM users`),
      
      // 3. Өгөгдлийн санд байгаа нийт бүтээгдэхүүний тоог олно
      db(`/* Нийт бүтээгдэхүүний тоог авах SQL */ SELECT COUNT(*)::int AS count FROM products`),
      
      // 4. Сүүлийн 8 захиалгыг хэрэглэгчийн овог нэртэй нь холбон (LEFT JOIN) уншина
      db(`
        /* Сүүлийн 8 захиалгыг хэрэглэгчийн нэртэй холбож унших SQL */
        SELECT o.id, o.order_number, o.total, o.status, o.created_at,
               (u.first_name || ' ' || u.last_name) AS user_name
        FROM   orders o
        LEFT   JOIN users u ON u.id = o.user_id
        ORDER  BY o.created_at DESC
        LIMIT  8
      `),
      
      // 5. Бичигдсэн сэтгэгдлийн тоогоор тэргүүлсэн шилдэг 5 бүтээгдэхүүнийг уншина
      db(`
        /* Сэтгэгдэл хамгийн ихтэй 5 бүтээгдэхүүн унших SQL */
        SELECT id, name, name_mn, price, rating, reviews_count
        FROM   products
        ORDER  BY reviews_count DESC
        LIMIT  5
      `),
      
      // 6. Сүүлийн 30 хоногийн өдөр тутмын нийт орлогыг өдрөөр нь бүлэглэж (графикт зориулж) уншина
      db(`
        /* Өнгөрсөн 30 хоногийн өдөр тутмын орлогыг бүлэглэж авах SQL */
        SELECT DATE(created_at) AS day, SUM(total)::bigint AS revenue
        FROM   orders
        WHERE  created_at >= $1 AND status != 'cancelled'
        GROUP  BY DATE(created_at)
        ORDER  BY day ASC
      `, [thirtyDaysAgo.toISOString()]), // SQL injection-оос сэргийлж 30 хоногийн өмнөх огноог параметр хэлбэрээр дамжуулна
    ]);

    const k = kpiResult.rows[0]; // KPI тооцооллын эхний мөрийн үр дүнг авна
    
    // Бэлтгэсэн статистик өгөгдлийг JSON форматтай хариу болгон буцаана
    return res.json({
      totalRevenue:      Number(k.total_revenue), // bigint төрлийг JS Number төрөл рүү хөрвүүлнэ
      totalOrders:       k.total_orders, // Нийт захиалгын тоог онооно
      pendingOrders:     k.pending_count, // Хүлээгдэж буй захиалгын тоог онооно
      totalCustomers:    userCount.rows[0].count, // Хэрэглэгчдийн тоог онооно
      totalProducts:     productCount.rows[0].count, // Бүтээгдэхүүний тоог онооно
      revenueThisMonth:  Number(k.revenue_this_month), // Энэ сарын орлогыг хөрвүүлж онооно
      revenueLastMonth:  Number(k.revenue_last_month), // Өнгөрсөн сарын орлогыг хөрвүүлж онооно
      recentOrders:      recentOrders.rows, // Сүүлийн захиалгуудын жагсаалт
      topProducts:       topProducts.rows, // Шилдэг бүтээгдэхүүнүүдийн жагсаалт
      revenueByDay:      revenueByDay.rows, // Өдрийн орлогын мэдээлэл (графикт зориулсан)
    });
  } catch (err) { 
    next(err); // Ямар нэгэн алдаа гарвал Express-ийн алдаа боловсруулах ерөнхий middleware-т дамжуулна
  }
});

module.exports = router;
