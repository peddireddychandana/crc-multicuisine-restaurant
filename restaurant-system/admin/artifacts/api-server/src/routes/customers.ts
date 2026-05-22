import { Router, type IRouter } from "express";
import { db, customersTable } from "@workspace/db";
import { eq, desc, ilike, sql } from "drizzle-orm";
import { GetCustomersQueryParams, GetCustomerParams } from "@workspace/api-zod";

const router: IRouter = Router();

function mapCustomer(c: typeof customersTable.$inferSelect) {
  return {
    id: c.id,
    name: c.name,
    phone: c.phone ?? null,
    email: c.email ?? null,
    totalOrders: c.totalOrders,
    totalSpent: Number(c.totalSpent),
    lastVisit: c.lastVisit ? c.lastVisit.toISOString() : null,
    favoriteDish: c.favoriteDish ?? null,
    createdAt: c.createdAt.toISOString(),
  };
}

router.get("/customers", async (req, res): Promise<void> => {
  const parsed = GetCustomersQueryParams.safeParse(req.query);
  const params = parsed.success ? parsed.data : {};

  const limit = params.limit ?? 50;
  const offset = params.offset ?? 0;

  let query = db.select().from(customersTable).$dynamic();
  if (params.search) {
    query = query.where(ilike(customersTable.name, `%${params.search}%`)) as typeof query;
  }

  const [customers, [countResult]] = await Promise.all([
    query.orderBy(desc(customersTable.totalOrders)).limit(limit).offset(offset),
    db.select({ count: sql<number>`count(*)::int` }).from(customersTable),
  ]);

  res.json({
    customers: customers.map(mapCustomer),
    total: countResult?.count ?? 0,
  });
});

router.get("/customers/top", async (_req, res): Promise<void> => {
  const customers = await db
    .select()
    .from(customersTable)
    .orderBy(desc(customersTable.totalOrders))
    .limit(10);

  res.json(customers.map(mapCustomer));
});

router.get("/customers/:id", async (req, res): Promise<void> => {
  const params = GetCustomerParams.safeParse(req.params);
  if (!params.success) {
    res.status(400).json({ error: params.error.message });
    return;
  }

  const [customer] = await db
    .select()
    .from(customersTable)
    .where(eq(customersTable.id, params.data.id));

  if (!customer) {
    res.status(404).json({ error: "Customer not found" });
    return;
  }

  res.json(mapCustomer(customer));
});

export default router;
