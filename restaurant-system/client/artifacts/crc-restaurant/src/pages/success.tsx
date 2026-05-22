import { useEffect } from "react";
import { motion } from "framer-motion";
import { useLocation } from "wouter";
import { CheckCircle, UtensilsCrossed, MapPin } from "lucide-react";

export default function Success() {
  const [location, setLocation] = useLocation();
  const params = new URLSearchParams(location.split("?")[1]);
  const orderId = params.get("orderId");

  return (
    <div className="min-h-screen bg-background pt-20 flex items-center justify-center px-4">
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ type: "spring", stiffness: 200, damping: 20 }}
        className="text-center max-w-sm w-full"
      >
        {/* Success icon */}
        <motion.div
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ delay: 0.2, type: "spring", stiffness: 200 }}
          className="w-24 h-24 rounded-full mx-auto mb-6 flex items-center justify-center"
          style={{
            background: "linear-gradient(135deg, rgba(255,43,43,0.15), rgba(193,18,31,0.1))",
            boxShadow: "0 0 60px rgba(255,43,43,0.2)",
            border: "2px solid rgba(255,43,43,0.3)",
          }}
        >
          <CheckCircle className="w-12 h-12 text-primary" />
        </motion.div>

        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }}>
          <h1 className="font-serif text-3xl font-bold text-white mb-2">Order Placed!</h1>
          {orderId && (
            <p className="text-muted-foreground text-sm mb-1">Order #{orderId}</p>
          )}
          <p className="text-white/70 text-sm mb-8">
            Your order has been placed successfully. The kitchen is preparing your food!
          </p>
        </motion.div>

        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.4 }} className="space-y-3">
          {orderId && (
            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={() => setLocation(`/tracking/${orderId}`)}
              data-testid="success-track-button"
              className="w-full py-3.5 rounded-xl text-white font-bold flex items-center justify-center gap-2 shadow-[0_4px_20px_rgba(255,43,43,0.4)]"
              style={{ background: "linear-gradient(135deg, #FF2B2B, #C1121F)" }}
            >
              <MapPin className="w-4 h-4" /> Track My Order
            </motion.button>
          )}
          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={() => setLocation("/menu")}
            data-testid="success-menu-button"
            className="w-full py-3.5 rounded-xl text-white font-medium flex items-center justify-center gap-2 border border-white/10 hover:bg-white/5 transition-all"
          >
            <UtensilsCrossed className="w-4 h-4" /> Back to Menu
          </motion.button>
        </motion.div>

        {/* Floating particles */}
        {Array.from({ length: 8 }).map((_, i) => (
          <motion.div
            key={i}
            className="absolute w-1.5 h-1.5 rounded-full bg-primary"
            style={{ left: `${20 + Math.random() * 60}%`, top: `${20 + Math.random() * 60}%` }}
            animate={{ y: [-20, -60], opacity: [1, 0], scale: [1, 0] }}
            transition={{ delay: i * 0.1, duration: 1.5, repeat: Infinity, repeatDelay: 2 }}
          />
        ))}
      </motion.div>
    </div>
  );
}
