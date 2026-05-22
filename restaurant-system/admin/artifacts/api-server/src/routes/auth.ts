import { Router, type IRouter } from "express";
import { eq } from "drizzle-orm";
import { db, adminsTable } from "@workspace/db";
import { LoginBody } from "@workspace/api-zod";

const router: IRouter = Router();

router.post("/auth/login", async (req, res): Promise<void> => {
  const parsed = LoginBody.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: parsed.error.message });
    return;
  }

  const { email, password } = parsed.data;

  const [admin] = await db
    .select()
    .from(adminsTable)
    .where(eq(adminsTable.email, email))
    .limit(1);

  if (!admin || admin.password !== password) {
    res.status(401).json({ error: "Invalid credentials" });
    return;
  }

  const token = `fake-jwt-${admin.id}-${Date.now()}`;

  res.json({
    token,
    admin: {
      id: admin.id,
      email: admin.email,
      name: admin.name,
      role: admin.role,
      avatar: admin.avatar ?? null,
    },
  });
});

router.get("/auth/me", async (req, res): Promise<void> => {
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    res.status(401).json({ error: "Unauthorized" });
    return;
  }

  const token = authHeader.slice(7);
  const idMatch = token.match(/^fake-jwt-(\d+)-/);
  if (!idMatch) {
    res.status(401).json({ error: "Invalid token" });
    return;
  }

  const adminId = parseInt(idMatch[1], 10);
  const [admin] = await db
    .select()
    .from(adminsTable)
    .where(eq(adminsTable.id, adminId))
    .limit(1);

  if (!admin) {
    res.status(404).json({ error: "Admin not found" });
    return;
  }

  res.json({
    id: admin.id,
    email: admin.email,
    name: admin.name,
    role: admin.role,
    avatar: admin.avatar ?? null,
  });
});

export default router;
