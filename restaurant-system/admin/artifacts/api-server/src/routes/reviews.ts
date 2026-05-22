import { Router, type IRouter } from "express";
import { db, reviewsTable } from "@workspace/db";
import { eq, desc, sql } from "drizzle-orm";
import {
  GetReviewsQueryParams,
  UpdateReviewParams,
  UpdateReviewBody,
  DeleteReviewParams,
  CreateReviewBody,
} from "@workspace/api-zod";

const router: IRouter = Router();

function mapReview(r: typeof reviewsTable.$inferSelect) {
  return {
    id: r.id,
    customerName: r.customerName,
    rating: r.rating,
    comment: r.comment,
    photoUrl: r.photoUrl ?? null,
    dishName: r.dishName ?? null,
    isVisible: r.isVisible,
    createdAt: r.createdAt.toISOString(),
  };
}

router.get("/reviews", async (req, res): Promise<void> => {
  const parsed = GetReviewsQueryParams.safeParse(req.query);
  const params = parsed.success ? parsed.data : {};

  let query = db.select().from(reviewsTable).$dynamic();
  if (params.rating !== undefined) {
    query = query.where(eq(reviewsTable.rating, params.rating)) as typeof query;
  }
  if (params.visible !== undefined) {
    query = query.where(eq(reviewsTable.isVisible, params.visible)) as typeof query;
  }

  const reviews = await query.orderBy(desc(reviewsTable.createdAt));
  res.json(reviews.map(mapReview));
});

router.get("/reviews/stats", async (_req, res): Promise<void> => {
  const [stats] = await db
    .select({
      averageRating: sql<number>`coalesce(avg(${reviewsTable.rating}), 0)`,
      totalReviews: sql<number>`count(*)::int`,
      fiveStars: sql<number>`count(*) filter (where ${reviewsTable.rating} = 5)::int`,
      fourStars: sql<number>`count(*) filter (where ${reviewsTable.rating} = 4)::int`,
      threeStars: sql<number>`count(*) filter (where ${reviewsTable.rating} = 3)::int`,
      twoStars: sql<number>`count(*) filter (where ${reviewsTable.rating} = 2)::int`,
      oneStar: sql<number>`count(*) filter (where ${reviewsTable.rating} = 1)::int`,
    })
    .from(reviewsTable);

  res.json({
    averageRating: Number(Number(stats?.averageRating ?? 0).toFixed(1)),
    totalReviews: stats?.totalReviews ?? 0,
    fiveStars: stats?.fiveStars ?? 0,
    fourStars: stats?.fourStars ?? 0,
    threeStars: stats?.threeStars ?? 0,
    twoStars: stats?.twoStars ?? 0,
    oneStar: stats?.oneStar ?? 0,
  });
});

router.post("/reviews", async (req, res): Promise<void> => {
  const parsed = CreateReviewBody.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: parsed.error.message });
    return;
  }

  const [review] = await db.insert(reviewsTable).values(parsed.data).returning();
  res.status(201).json(mapReview(review));
});

router.patch("/reviews/:id", async (req, res): Promise<void> => {
  const params = UpdateReviewParams.safeParse(req.params);
  if (!params.success) {
    res.status(400).json({ error: params.error.message });
    return;
  }

  const parsed = UpdateReviewBody.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: parsed.error.message });
    return;
  }

  const [review] = await db
    .update(reviewsTable)
    .set(parsed.data)
    .where(eq(reviewsTable.id, params.data.id))
    .returning();

  if (!review) {
    res.status(404).json({ error: "Review not found" });
    return;
  }

  res.json(mapReview(review));
});

router.delete("/reviews/:id", async (req, res): Promise<void> => {
  const params = DeleteReviewParams.safeParse(req.params);
  if (!params.success) {
    res.status(400).json({ error: params.error.message });
    return;
  }

  const [review] = await db
    .delete(reviewsTable)
    .where(eq(reviewsTable.id, params.data.id))
    .returning();

  if (!review) {
    res.status(404).json({ error: "Review not found" });
    return;
  }

  res.sendStatus(204);
});

export default router;
