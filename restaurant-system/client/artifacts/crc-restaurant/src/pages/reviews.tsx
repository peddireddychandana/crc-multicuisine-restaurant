import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Star, MessageSquare, Send, Award } from "lucide-react";
import { useGetReviews, useGetReviewStats, useCreateReview, getGetReviewsQueryKey, getGetReviewStatsQueryKey } from "@workspace/api-client-react";
import { useQueryClient } from "@tanstack/react-query";
import { io } from "socket.io-client";

function StarRating({ value, onChange }: { value: number; onChange?: (v: number) => void }) {
  const [hovered, setHovered] = useState(0);
  const stars = Array.from({ length: 5 }, (_, i) => i + 1);
  const active = hovered || value;

  if (!onChange) {
    return (
      <div className="flex gap-0.5">
        {stars.map((i) => (
          <Star
            key={i}
            className="w-4 h-4"
            style={{
              fill: i <= active ? "#FBBF24" : "transparent",
              color: i <= active ? "#FBBF24" : "rgba(255,255,255,0.2)",
            }}
          />
        ))}
      </div>
    );
  }

  return (
    <div className="flex gap-1">
      {stars.map((i) => (
        <motion.button
          key={i}
          whileHover={{ scale: 1.2 }}
          whileTap={{ scale: 0.9 }}
          onClick={() => onChange(i)}
          onMouseEnter={() => setHovered(i)}
          onMouseLeave={() => setHovered(0)}
          data-testid={`star-${i}`}
        >
          <Star
            className="w-6 h-6 transition-colors"
            style={{
              fill: i <= active ? "#FBBF24" : "transparent",
              color: i <= active ? "#FBBF24" : "rgba(255,255,255,0.2)",
            }}
          />
        </motion.button>
      ))}
    </div>
  );
}

const socketUrl = import.meta.env.VITE_SOCKET_URL || "http://localhost:5000";

export default function Reviews() {
  const qc = useQueryClient();
  const { data: reviews } = useGetReviews({ limit: 20 });
  const { data: stats } = useGetReviewStats();
  const createReview = useCreateReview();

  const [form, setForm] = useState({ customerName: "", rating: 0, comment: "" });
  const [submitted, setSubmitted] = useState(false);

  useEffect(() => {
    const socket = io(socketUrl, { transports: ["websocket", "polling"] });
    socket.on("review-deleted", () => {
      qc.invalidateQueries({ queryKey: getGetReviewsQueryKey() });
      qc.invalidateQueries({ queryKey: getGetReviewStatsQueryKey() });
    });
    return () => { socket.disconnect(); };
  }, [qc]);

  const handleSubmit = () => {
    if (!form.customerName.trim() || form.rating === 0) return;
    createReview.mutate(
      { data: { customerName: form.customerName, rating: form.rating, comment: form.comment } },
      {
        onSuccess: () => {
          qc.invalidateQueries({ queryKey: getGetReviewsQueryKey() });
          qc.invalidateQueries({ queryKey: getGetReviewStatsQueryKey() });
          setSubmitted(true);
          setForm({ customerName: "", rating: 0, comment: "" });
          setTimeout(() => setSubmitted(false), 3000);
        },
      }
    );
  };

  return (
    <div className="min-h-screen bg-background pt-20 pb-24">
      <div className="max-w-3xl mx-auto px-4">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
          <div className="flex items-center gap-3 mb-8">
            <MessageSquare className="w-6 h-6 text-primary" />
            <h1 className="font-serif text-2xl font-bold text-white">Reviews</h1>
          </div>

          {/* Stats */}
          {stats && (
            <div className="flex items-center gap-4 p-5 rounded-2xl border border-white/5 mb-6" style={{ background: "rgba(17,17,17,0.8)" }}>
              <Award className="w-8 h-8 text-primary flex-shrink-0" />
              <div>
                <div className="flex items-center gap-2 mb-1">
                  <span className="text-white font-bold text-2xl">{stats.averageRating.toFixed(1)}</span>
                  <StarRating value={Math.round(stats.averageRating)} />
                </div>
                <p className="text-muted-foreground text-sm">{stats.totalReviews} reviews</p>
              </div>
            </div>
          )}

          {/* Submit Review */}
          <div className="p-5 rounded-2xl border border-primary/10 mb-6" style={{ background: "rgba(17,17,17,0.8)" }}>
            <h2 className="text-white font-semibold mb-4">Share Your Experience</h2>
            {submitted ? (
              <motion.p initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="text-green-400 text-sm py-4 text-center">
                Thank you for your review!
              </motion.p>
            ) : (
              <div className="space-y-4">
                <input value={form.customerName} onChange={(e) => setForm({ ...form, customerName: e.target.value })}
                  placeholder="Your name" data-testid="review-name"
                  className="w-full px-4 py-3 rounded-xl bg-white/5 border border-white/10 text-white placeholder:text-muted-foreground text-sm focus:outline-none focus:border-primary/50 transition-colors" />
                <div>
                  <p className="text-muted-foreground text-xs mb-2">Your Rating</p>
                  <StarRating value={form.rating} onChange={(v) => setForm({ ...form, rating: v })} />
                </div>
                <textarea value={form.comment} onChange={(e) => setForm({ ...form, comment: e.target.value })}
                  placeholder="Tell us about your experience..." data-testid="review-comment" rows={3}
                  className="w-full px-4 py-3 rounded-xl bg-white/5 border border-white/10 text-white placeholder:text-muted-foreground text-sm focus:outline-none focus:border-primary/50 transition-colors resize-none" />
                <motion.button whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}
                  onClick={handleSubmit}
                  disabled={createReview.isPending || !form.customerName.trim() || form.rating === 0}
                  data-testid="submit-review-button"
                  className="w-full py-3 rounded-xl text-white font-bold flex items-center justify-center gap-2 disabled:opacity-50 transition-all"
                  style={{ background: "linear-gradient(135deg, #FF2B2B, #C1121F)" }}>
                  <Send className="w-4 h-4" />
                  {createReview.isPending ? "Submitting..." : "Submit Review"}
                </motion.button>
              </div>
            )}
          </div>

          {/* Reviews List */}
          <div className="space-y-4">
            {(reviews ?? []).map((review, i) => (
              <motion.div key={review.id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.05 }}
                data-testid={`review-card-${review.id}`}
                className="p-5 rounded-2xl border border-white/5"
                style={{ background: "rgba(17,17,17,0.8)" }}>
                <div className="flex items-start justify-between mb-2">
                  <div>
                    <p className="text-white font-semibold text-sm">{review.customerName}</p>
                    <p className="text-muted-foreground text-xs">{new Date(review.createdAt).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" })}</p>
                  </div>
                  <StarRating value={Math.round(typeof review.rating === 'number' ? review.rating : parseFloat(String(review.rating)))} />
                </div>
                {review.comment && <p className="text-white/70 text-sm leading-relaxed">"{review.comment}"</p>}
              </motion.div>
            ))}

            {(!reviews || reviews.length === 0) && (
              <div className="text-center py-12 text-muted-foreground">
                <MessageSquare className="w-10 h-10 mx-auto mb-3 opacity-20" />
                <p>No reviews yet. Be the first!</p>
              </div>
            )}
          </div>
        </motion.div>
      </div>
    </div>
  );
}
