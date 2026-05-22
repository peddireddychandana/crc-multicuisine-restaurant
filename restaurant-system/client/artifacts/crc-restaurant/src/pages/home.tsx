import { useEffect, useRef, useState } from "react";
import { useLocation } from "wouter";
import { motion, useScroll, useTransform, AnimatePresence } from "framer-motion";
import { ChevronDown, Star, Clock, UtensilsCrossed, Flame, Award, Users } from "lucide-react";
import { useGetOffers, useGetFeaturedDishes, useGetReviewStats, useGetPopularDishes } from "@workspace/api-client-react";

const apiBase = import.meta.env.VITE_API_URL || "http://localhost:5000";
const DEFAULT_FOOD_IMG = "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 100 100'%3E%3Ccircle cx='50' cy='50' r='38' fill='none' stroke='%23FF2B2B22' stroke-width='1.5'/%3E%3Cpath d='M35 30 L35 70 M35 50 L52 50' stroke='%23FF2B2B22' stroke-width='3' stroke-linecap='round' fill='none'/%3E%3Cpath d='M65 30 L65 70' stroke='%23FF2B2B22' stroke-width='3' stroke-linecap='round' fill='none'/%3E%3C/svg%3E";
function imageUrl(path: string | null | undefined) {
  if (!path) return null;
  if (path.startsWith("http")) return path;
  return `${apiBase}/api/storage${path}`;
}

// Animated particles
function Particles() {
  const particles = Array.from({ length: 20 }, (_, i) => i);
  return (
    <div className="absolute inset-0 overflow-hidden pointer-events-none">
      {particles.map((i) => (
        <motion.div
          key={i}
          className="absolute w-1 h-1 rounded-full"
          style={{
            left: `${Math.random() * 100}%`,
            top: `${Math.random() * 100}%`,
            background: i % 3 === 0 ? "#FF2B2B" : i % 3 === 1 ? "#FF4D4D" : "#C1121F",
            boxShadow: `0 0 6px ${i % 2 === 0 ? "#FF2B2B" : "#FF4D4D"}`,
          }}
          animate={{
            y: [0, -30, 0],
            opacity: [0, 1, 0],
            scale: [0, 1.5, 0],
          }}
          transition={{
            duration: 3 + Math.random() * 4,
            repeat: Infinity,
            delay: Math.random() * 5,
            ease: "easeInOut",
          }}
        />
      ))}
    </div>
  );
}

// Countdown timer
function Countdown({ expiresAt }: { expiresAt: string | null | undefined }) {
  const [time, setTime] = useState({ h: 0, m: 0, s: 0 });

  useEffect(() => {
    if (!expiresAt) return;
    const update = () => {
      const diff = new Date(expiresAt).getTime() - Date.now();
      if (diff <= 0) return;
      setTime({
        h: Math.floor(diff / 3600000),
        m: Math.floor((diff % 3600000) / 60000),
        s: Math.floor((diff % 60000) / 1000),
      });
    };
    update();
    const interval = setInterval(update, 1000);
    return () => clearInterval(interval);
  }, [expiresAt]);

  if (!expiresAt) return null;
  return (
    <div className="flex gap-1 text-xs">
      {[{ v: time.h, l: "h" }, { v: time.m, l: "m" }, { v: time.s, l: "s" }].map(({ v, l }) => (
        <div key={l} className="flex items-center gap-0.5">
          <span className="bg-black/40 border border-primary/30 rounded px-1 py-0.5 font-mono font-bold text-primary">
            {String(v).padStart(2, "0")}
          </span>
          <span className="text-white/40">{l}</span>
        </div>
      ))}
    </div>
  );
}

export default function Home() {
  const [, setLocation] = useLocation();
  const heroRef = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({ target: heroRef });
  const heroOpacity = useTransform(scrollYProgress, [0, 0.5], [1, 0]);
  const heroY = useTransform(scrollYProgress, [0, 0.5], [0, -80]);

  const { data: offers } = useGetOffers();
  const { data: featuredDishes } = useGetFeaturedDishes();
  const { data: popularDishes } = useGetPopularDishes();
  const { data: reviewStats } = useGetReviewStats();

  const stats = [
    { icon: UtensilsCrossed, value: "50+", label: "Dishes" },
    { icon: Star, value: reviewStats ? `${reviewStats.averageRating.toFixed(1)}★` : "4.8★", label: "Rating" },
    { icon: Users, value: "10K+", label: "Happy Guests" },
    { icon: Clock, value: "25 min", label: "Avg Delivery" },
  ];

  const testimonials = [
    { name: "Arjun Kumar", text: "The Chicken Dilkush Biryani is divine! Rich, aromatic, and absolutely unforgettable.", rating: 5 },
    { name: "Priya Sharma", text: "Dragon Chicken is FIRE! Best starter I've had in years. Returning every week!", rating: 5 },
    { name: "Mohammed Rashid", text: "Authentic shawarma that rivals the best I've had. Outstanding flavors!", rating: 5 },
  ];

  return (
    <div className="min-h-screen bg-background">
      {/* HERO SECTION */}
      <section
        ref={heroRef}
        className="relative h-screen flex items-center justify-center overflow-hidden"
        data-testid="hero-section"
      >
        {/* Background gradient */}
        <div className="absolute inset-0 bg-gradient-to-b from-black via-[#0B0B0B] to-background" />
        <div
          className="absolute inset-0 opacity-20"
          style={{
            background: "radial-gradient(ellipse 80% 60% at 50% 40%, #FF2B2B22 0%, transparent 70%)",
          }}
        />
        <Particles />

        {/* Floating decorative circles */}
        <motion.div
          animate={{ rotate: 360 }}
          transition={{ duration: 30, repeat: Infinity, ease: "linear" }}
          className="absolute w-96 h-96 rounded-full border border-primary/5 opacity-50"
          style={{ top: "20%", right: "10%" }}
        />
        <motion.div
          animate={{ rotate: -360 }}
          transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
          className="absolute w-64 h-64 rounded-full border border-primary/10 opacity-50"
          style={{ top: "30%", right: "15%" }}
        />

        <motion.div
          style={{ opacity: heroOpacity, y: heroY }}
          className="relative z-10 text-center px-4 max-w-4xl mx-auto"
        >
          {/* Badge */}
          <motion.div
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.2 }}
            className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full border border-primary/30 bg-primary/10 text-primary text-sm font-medium mb-6"
          >
            <Flame className="w-3.5 h-3.5" />
            Premium Dining Experience
          </motion.div>

          {/* Title */}
          <motion.h1
            initial={{ opacity: 0, y: 40 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3, duration: 0.8, ease: "easeOut" }}
            className="font-serif text-5xl sm:text-6xl md:text-7xl font-black text-white mb-4 leading-tight"
            style={{ textShadow: "0 0 80px rgba(255,43,43,0.3)" }}
          >
            CRC
            <span className="block text-transparent bg-clip-text" style={{ backgroundImage: "linear-gradient(135deg, #FF2B2B, #FF4D4D, #C1121F)" }}>
              Multicuisine
            </span>
            Restaurant
          </motion.h1>

          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5 }}
            className="text-muted-foreground text-lg sm:text-xl mb-10 max-w-xl mx-auto"
          >
            A luxury dining experience — where every bite tells a story
          </motion.p>

          {/* CTA */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.6 }}
            className="flex flex-col sm:flex-row gap-3 justify-center"
          >
            <motion.button
              whileHover={{ scale: 1.05, boxShadow: "0 0 40px rgba(255,43,43,0.6)" }}
              whileTap={{ scale: 0.95 }}
              onClick={() => setLocation("/menu")}
              data-testid="hero-cta-button"
              className="px-8 py-4 rounded-2xl text-white font-bold text-lg shadow-[0_4px_30px_rgba(255,43,43,0.4)] transition-all"
              style={{ background: "linear-gradient(135deg, #FF2B2B, #C1121F)" }}
            >
              Start Ordering
            </motion.button>
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => document.getElementById("offers-section")?.scrollIntoView({ behavior: "smooth" })}
              className="px-8 py-4 rounded-2xl text-white font-medium text-lg border border-white/10 bg-white/5 backdrop-blur-sm hover:bg-white/10 transition-all"
            >
              View Offers
            </motion.button>
          </motion.div>
        </motion.div>

        {/* Scroll indicator */}
        <motion.div
          animate={{ y: [0, 8, 0] }}
          transition={{ duration: 2, repeat: Infinity }}
          className="absolute bottom-8 left-1/2 -translate-x-1/2 flex flex-col items-center gap-2 text-white/30"
        >
          <span className="text-xs">Scroll</span>
          <ChevronDown className="w-4 h-4" />
        </motion.div>
      </section>

      {/* STATS */}
      <section className="py-12 border-y border-white/5">
        <div className="max-w-4xl mx-auto px-4 grid grid-cols-2 sm:grid-cols-4 gap-6">
          {stats.map((stat, i) => (
            <motion.div
              key={stat.label}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.1 }}
              className="text-center"
            >
              <div className="w-10 h-10 rounded-full bg-primary/10 border border-primary/20 flex items-center justify-center mx-auto mb-2">
                <stat.icon className="w-4 h-4 text-primary" />
              </div>
              <div className="font-serif text-2xl font-bold text-white">{stat.value}</div>
              <div className="text-xs text-muted-foreground">{stat.label}</div>
            </motion.div>
          ))}
        </div>
      </section>

      {/* OFFERS SECTION */}
      <section id="offers-section" className="py-16 px-4" data-testid="offers-section">
        <div className="max-w-7xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-10"
          >
            <span className="text-primary text-sm font-medium uppercase tracking-widest">Limited Time</span>
            <h2 className="font-serif text-3xl sm:text-4xl font-bold text-white mt-2">Today's Specials</h2>
          </motion.div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {(offers ?? []).map((offer, i) => (
              <motion.div
                key={offer.id}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.1 }}
                whileHover={{ y: -6, scale: 1.01 }}
                data-testid={`offer-card-${offer.id}`}
                className="relative rounded-2xl overflow-hidden border border-white/5 cursor-pointer group"
                style={{
                  background: "linear-gradient(145deg, rgba(17,17,17,0.9) 0%, rgba(5,5,5,0.95) 100%)",
                  boxShadow: "0 4px 30px rgba(0,0,0,0.5)",
                }}
              >
                {/* Offer image placeholder */}
                <div className="h-48 relative overflow-hidden">
                  <div
                    className="absolute inset-0 group-hover:scale-105 transition-transform duration-700"
                    style={{
                      background: `linear-gradient(135deg, 
                        ${offer.offerType === "dish_of_day" ? "#1a0000, #3d0000" :
                          offer.offerType === "combo" ? "#001a00, #003d00" :
                          "#000a1a, #001a3d"} 0%, #050505 100%)`,
                    }}
                  />
                  <div className="absolute inset-0 flex items-center justify-center">
                    <UtensilsCrossed className="w-16 h-16 text-white/10" />
                  </div>
                  {/* Glow overlay */}
                  <div className="absolute inset-0 group-hover:opacity-100 opacity-0 transition-opacity duration-500"
                    style={{ background: "radial-gradient(ellipse at center, rgba(255,43,43,0.15) 0%, transparent 70%)" }}
                  />
                  {/* Badge */}
                  {offer.badgeText && (
                    <div className="absolute top-3 left-3 px-2 py-1 rounded-lg text-xs font-bold text-white"
                      style={{ background: "linear-gradient(135deg, #FF2B2B, #C1121F)" }}>
                      {offer.badgeText}
                    </div>
                  )}
                  {offer.discountPercent && (
                    <div className="absolute top-3 right-3 px-2 py-1 rounded-lg bg-black/60 text-primary text-xs font-bold border border-primary/30">
                      {offer.discountPercent}% OFF
                    </div>
                  )}
                </div>

                {/* Red glow border on hover */}
                <div className="absolute inset-0 rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none"
                  style={{ boxShadow: "inset 0 0 0 1px rgba(255,43,43,0.4), 0 0 30px rgba(255,43,43,0.2)" }}
                />

                <div className="p-4">
                  <h3 className="text-white font-bold text-base mb-1 leading-tight">{offer.title}</h3>
                  {offer.description && (
                    <p className="text-muted-foreground text-xs mb-3 line-clamp-2">{offer.description}</p>
                  )}

                  <div className="flex items-center justify-between">
                    <div>
                      {offer.originalPrice && (
                        <span className="text-white/30 line-through text-xs mr-1">₹{offer.originalPrice}</span>
                      )}
                      {offer.discountedPrice && (
                        <span className="text-primary font-bold">₹{offer.discountedPrice}</span>
                      )}
                    </div>
                    <Countdown expiresAt={offer.expiresAt} />
                  </div>


                </div>
              </motion.div>
            ))}

            {/* Fallback when no offers */}
            {(!offers || offers.length === 0) && (
              <div className="col-span-full text-center py-8 text-muted-foreground">
                Check back for daily specials and offers!
              </div>
            )}
          </div>
        </div>
      </section>

      {/* FEATURED DISHES */}
      <section className="py-16 px-4 border-t border-white/5" data-testid="featured-section">
        <div className="max-w-7xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-10"
          >
            <span className="text-primary text-sm font-medium uppercase tracking-widest">Bestsellers</span>
            <h2 className="font-serif text-3xl sm:text-4xl font-bold text-white mt-2">Featured Dishes</h2>
          </motion.div>

          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
            {(featuredDishes ?? popularDishes ?? []).slice(0, 8).map((dish, i) => (
              <motion.div
                key={dish.id}
                initial={{ opacity: 0, scale: 0.9 }}
                whileInView={{ opacity: 1, scale: 1 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.05 }}
                whileHover={{ y: -4 }}
                data-testid={`featured-dish-${dish.id}`}
                className="rounded-xl overflow-hidden border border-white/5 cursor-pointer group"
                style={{ background: "rgba(17,17,17,0.8)" }}
              >
                <div className="h-28 relative overflow-hidden"
                  style={{ background: "linear-gradient(135deg, #1a0a00, #0d0d0d)" }}>
                  <img
                    src={imageUrl((dish as any).imageUrl) || DEFAULT_FOOD_IMG}
                    alt={dish.name}
                    className="w-full h-full object-cover"
                    onError={(e) => { (e.currentTarget as HTMLImageElement).src = DEFAULT_FOOD_IMG; }}
                  />
                  <div className="absolute inset-0 group-hover:opacity-100 opacity-0 transition-opacity"
                    style={{ background: "radial-gradient(ellipse at center, rgba(255,43,43,0.1) 0%, transparent 70%)" }}
                  />
                  <div className={`absolute top-2 right-2 w-3.5 h-3.5 rounded-sm border-2 flex items-center justify-center ${dish.isVeg ? "border-green-500" : "border-red-500"}`}>
                    <div className={`w-1.5 h-1.5 rounded-full ${dish.isVeg ? "bg-green-500" : "bg-red-500"}`} />
                  </div>
                </div>
                <div className="p-3">
                  <p className="text-white text-xs font-semibold leading-tight truncate mb-1">{dish.name}</p>
                  <div className="flex items-center justify-between">
                    {dish.price && dish.price !== "0" ? <span className="text-primary text-sm font-bold">₹{dish.price}</span> : null}
                    {dish.rating ? (
                      <span className="flex items-center gap-0.5 text-[10px]" style={{ color: "#FBBF24" }}>
                        <Star className="w-2.5 h-2.5" style={{ fill: "#FBBF24", color: "#FBBF24" }} />{dish.rating}
                      </span>
                    ) : null}
                  </div>

                </div>
              </motion.div>
            ))}
          </div>

          <div className="text-center mt-8">
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => setLocation("/menu")}
              data-testid="view-full-menu-button"
              className="px-8 py-3 rounded-xl border border-primary/30 text-primary hover:bg-primary hover:text-white font-medium transition-all"
            >
              View Full Menu
            </motion.button>
          </div>
        </div>
      </section>

      {/* TESTIMONIALS */}
      <section className="py-16 px-4 border-t border-white/5" data-testid="testimonials-section">
        <div className="max-w-5xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-10"
          >
            <span className="text-primary text-sm font-medium uppercase tracking-widest">Reviews</span>
            <h2 className="font-serif text-3xl sm:text-4xl font-bold text-white mt-2">What Our Guests Say</h2>
          </motion.div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
            {testimonials.map((t, i) => (
              <motion.div
                key={t.name}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.1 }}
                className="p-5 rounded-2xl border border-white/5"
                style={{ background: "rgba(17,17,17,0.8)" }}
              >
                <div className="flex gap-0.5 mb-3">
                  {Array.from({ length: t.rating }).map((_, j) => (
                    <Star key={j} className="w-3.5 h-3.5 fill-yellow-400 text-yellow-400" />
                  ))}
                </div>
                <p className="text-white/70 text-sm leading-relaxed mb-3">"{t.text}"</p>
                <p className="text-white text-sm font-semibold">— {t.name}</p>
              </motion.div>
            ))}
          </div>

          {reviewStats && (
            <div className="mt-8 text-center">
              <div className="inline-flex items-center gap-3 px-6 py-3 rounded-2xl border border-white/5" style={{ background: "rgba(17,17,17,0.8)" }}>
                <Award className="w-5 h-5 text-primary" />
                <span className="text-white font-bold">{reviewStats.averageRating.toFixed(1)}</span>
                <div className="flex gap-0.5">
                  {Array.from({ length: 5 }).map((_, i) => (
                    <Star key={i} className={`w-3.5 h-3.5 ${i < Math.floor(reviewStats.averageRating) ? "fill-yellow-400 text-yellow-400" : "text-white/20"}`} />
                  ))}
                </div>
                <span className="text-muted-foreground text-sm">{reviewStats.totalReviews} reviews</span>
              </div>
            </div>
          )}
        </div>
      </section>

      {/* FOOTER */}
      <footer className="py-12 px-4 border-t border-white/5" data-testid="footer">
        <div className="max-w-4xl mx-auto text-center">
          <div className="flex items-center justify-center gap-2 mb-4">
            <div className="w-8 h-8 rounded-full bg-primary/20 flex items-center justify-center">
              <UtensilsCrossed className="w-4 h-4 text-primary" />
            </div>
            <span className="font-serif text-xl font-bold text-white">CRC Multicuisine Restaurant</span>
          </div>
          <p className="text-muted-foreground text-sm mb-2">Luxury dining, unforgettable flavors</p>
          <p className="text-white/20 text-xs">Scan the QR code at your table to order</p>
          <div className="mt-6 pt-6 border-t border-white/5 text-white/20 text-xs">
            © 2026 CRC Multicuisine Restaurant. All rights reserved.
          </div>
        </div>
      </footer>
    </div>
  );
}
