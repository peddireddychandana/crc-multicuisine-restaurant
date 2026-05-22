import { Router, type IRouter } from "express";
import { eq, avg, count, desc } from "drizzle-orm";
import { db, reviewsTable } from "@workspace/db";
import {
  GetReviewsQueryParams,
  GetReviewsResponse,
  CreateReviewBody,
  GetReviewStatsResponse,
} from "@workspace/api-zod";

const router: IRouter = Router();

router.get("/reviews", async (req, res): Promise<void> => {
  const query = GetReviewsQueryParams.safeParse(req.query);
  if (!query.success) {
    res.status(400).json({ error: query.error.message });
    return;
  }

  const { menuItemId, limit } = query.data;

  let q = db
    .select()
    .from(reviewsTable)
    .orderBy(desc(reviewsTable.createdAt))
    .$dynamic();

  if (menuItemId) {
    q = q.where(eq(reviewsTable.menuItemId, menuItemId));
  }

  if (limit) {
    q = q.limit(limit);
  }

  const reviews = await q;

  const mapped = reviews.map((r) => ({
    ...r,
    rating: parseFloat(r.rating),
    createdAt: r.createdAt.toISOString(),
  }));

  res.json(GetReviewsResponse.parse(mapped));
});

router.get("/reviews/stats", async (_req, res): Promise<void> => {
  const [stats] = await db
    .select({
      averageRating: avg(reviewsTable.rating),
      totalReviews: count(),
    })
    .from(reviewsTable);

  res.json(
    GetReviewStatsResponse.parse({
      averageRating: stats.averageRating ? parseFloat(stats.averageRating) : 0,
      totalReviews: stats.totalReviews,
      ratingBreakdown: { "5": 0, "4": 0, "3": 0, "2": 0, "1": 0 },
    })
  );
});

router.post("/reviews", async (req, res): Promise<void> => {
  const parsed = CreateReviewBody.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: parsed.error.message });
    return;
  }

  const [review] = await db
    .insert(reviewsTable)
    .values({
      menuItemId: parsed.data.menuItemId ?? null,
      orderId: parsed.data.orderId ?? null,
      customerName: parsed.data.customerName ?? "Guest",
      rating: parsed.data.rating.toString(),
      comment: parsed.data.comment ?? null,
    })
    .returning();

  res.status(201).json({
    ...review,
    rating: parseFloat(review.rating),
    createdAt: review.createdAt.toISOString(),
  });
});

export default router;
