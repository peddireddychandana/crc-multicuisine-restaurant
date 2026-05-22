import { motion, AnimatePresence } from "framer-motion";
import { ShoppingCart, ChevronRight } from "lucide-react";
import { useLocation } from "wouter";
import { useCartStore } from "@/store/cartStore";
import { useCartDrawerStore } from "@/store/cartDrawerStore";

export function FloatingCart() {
  const [, setLocation] = useLocation();
  const items = useCartStore((s) => s.items);
  const getTotal = useCartStore((s) => s.getTotal);
  const { openDrawer } = useCartDrawerStore();

  const totalItems = items.reduce((sum, i) => sum + i.quantity, 0);
  const total = getTotal();

  return (
    <AnimatePresence>
      {totalItems > 0 && (
        <motion.div
          initial={{ y: 100, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          exit={{ y: 100, opacity: 0 }}
          transition={{ type: "spring", stiffness: 400, damping: 30 }}
          className="fixed bottom-4 left-4 right-4 z-40 md:left-auto md:right-6 md:bottom-6 md:w-80"
        >
          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={openDrawer}
            data-testid="floating-cart-button"
            className="w-full flex items-center justify-between px-4 py-3 rounded-2xl bg-primary shadow-[0_8px_32px_rgba(255,43,43,0.5)] text-white font-medium"
            style={{
              background: "linear-gradient(135deg, #FF2B2B 0%, #C1121F 100%)",
            }}
          >
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-xl bg-white/20 flex items-center justify-center">
                <ShoppingCart className="w-4 h-4" />
              </div>
              <span data-testid="floating-cart-count">{totalItems} {totalItems === 1 ? "Item" : "Items"}</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="font-bold" data-testid="floating-cart-total">
                ₹{total.toFixed(0)}
              </span>
              <ChevronRight className="w-4 h-4" />
            </div>
          </motion.button>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
