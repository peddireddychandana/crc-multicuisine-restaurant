import { Router, type IRouter } from "express";
import { db, ordersTable, menuItemsTable, restaurantTablesTable, reviewsTable, customersTable, notificationsTable } from "@workspace/db";
import { sql, eq, and, gte, desc } from "drizzle-orm";
import { GetRevenueChartQueryParams } from "@workspace/api-zod";

const router: IRouter = Router();

router.get("/dashboard/stats", async (req, res): Promise<void> => {
  const [orderStats] = await db
    .select({
      totalOrders: sql<number>`count(*)::int`,
      totalRevenue: sql<number>`coalesce(sum(${ordersTable.totalAmount}::numeric), 0)`,
      pendingOrders: sql<number>`count(*) filter (where ${ordersTable.status} = 'pending')::int`,
      completedOrders: sql<number>`count(*) filter (where ${ordersTable.status} = 'completed')::int`,
      activeOrders: sql<number>`count(*) filter (where ${ordersTable.status} not in ('completed', 'rejected'))::int`,
    })
    .from(ordersTable);

  const [tableStats] = await db
    .select({
      activeTables: sql<number>`count(*) filter (where ${restaurantTablesTable.status} = 'occupied')::int`,
    })
    .from(restaurantTablesTable);

  const [reviewStats] = await db
    .select({
      averageRating: sql<number>`coalesce(avg(${reviewsTable.rating}), 4.5)`,
    })
    .from(reviewsTable)
    .where(eq(reviewsTable.isVisible, true));

  const [customerStats] = await db
    .select({
      totalCustomers: sql<number>`count(*)::int`,
    })
    .from(customersTable);

  res.json({
    totalRevenue: Number(orderStats?.totalRevenue ?? 0),
    totalOrders: orderStats?.totalOrders ?? 0,
    activeOrders: orderStats?.activeOrders ?? 0,
    pendingOrders: orderStats?.pendingOrders ?? 0,
    completedOrders: orderStats?.completedOrders ?? 0,
    activeTables: tableStats?.activeTables ?? 0,
    averageRating: Number(reviewStats?.averageRating ?? 4.5).toFixed(1),
    totalCustomers: customerStats?.totalCustomers ?? 0,
    revenueChange: 12.5,
    ordersChange: 8.3,
  });
});

router.get("/dashboard/activity", async (req, res): Promise<void> => {
  const notifications = await db
    .select()
    .from(notificationsTable)
    .orderBy(desc(notificationsTable.createdAt))
    .limit(20);

  const activity = notifications.map((n) => ({
    id: n.id,
    type: n.type,
    message: n.message,
    timestamp: n.createdAt.toISOString(),
    tableNumber: null,
    amount: null,
  }));

  res.json(activity);
});

router.get("/dashboard/revenue-chart", async (req, res): Promise<void> => {
  const params = GetRevenueChartQueryParams.safeParse(req.query);
  const period = params.success ? (params.data.period ?? "weekly") : "weekly";

  const now = new Date();
  let points: Array<{ label: string; value: number; orders: number }> = [];

  if (period === "daily") {
    for (let i = 23; i >= 0; i--) {
      const hour = new Date(now.getTime() - i * 3600000);
      points.push({
        label: `${hour.getHours()}:00`,
        value: Math.floor(Math.random() * 8000 + 2000),
        orders: Math.floor(Math.random() * 15 + 2),
      });
    }
  } else if (period === "weekly") {
    const days = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];
    for (const day of days) {
      points.push({
        label: day,
        value: Math.floor(Math.random() * 50000 + 20000),
        orders: Math.floor(Math.random() * 80 + 30),
      });
    }
  } else {
    const months = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
    for (const month of months) {
      points.push({
        label: month,
        value: Math.floor(Math.random() * 500000 + 200000),
        orders: Math.floor(Math.random() * 800 + 400),
      });
    }
  }

  res.json(points);
});

router.get("/dashboard/peak-hours", async (_req, res): Promise<void> => {
  const hours = [
    { hour: "8AM", orders: 12, revenue: 8500 },
    { hour: "9AM", orders: 18, revenue: 12000 },
    { hour: "10AM", orders: 15, revenue: 9800 },
    { hour: "11AM", orders: 22, revenue: 16500 },
    { hour: "12PM", orders: 65, revenue: 52000 },
    { hour: "1PM", orders: 80, revenue: 68000 },
    { hour: "2PM", orders: 55, revenue: 44000 },
    { hour: "3PM", orders: 28, revenue: 19000 },
    { hour: "4PM", orders: 20, revenue: 13500 },
    { hour: "5PM", orders: 35, revenue: 24000 },
    { hour: "6PM", orders: 58, revenue: 47000 },
    { hour: "7PM", orders: 75, revenue: 63000 },
    { hour: "8PM", orders: 90, revenue: 78000 },
    { hour: "9PM", orders: 82, revenue: 70000 },
    { hour: "10PM", orders: 45, revenue: 36000 },
    { hour: "11PM", orders: 22, revenue: 16000 },
  ];
  res.json(hours);
});

export default router;
