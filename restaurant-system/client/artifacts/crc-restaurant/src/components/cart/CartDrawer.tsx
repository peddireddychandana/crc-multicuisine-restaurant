import { motion, AnimatePresence } from "framer-motion";
import { X, Plus, Minus, Trash2, ShoppingBag } from "lucide-react";
import { useLocation } from "wouter";
import { useCartStore } from "@/store/cartStore";
import { useCartDrawerStore } from "@/store/cartDrawerStore";

export function CartDrawer() {
  const { isOpen, closeDrawer } = useCartDrawerStore();
  const [, setLocation] = useLocation();
  const { items, updateQuantity, removeItem, getSubtotal, getGST, getTotal } = useCartStore();

  const subtotal = getSubtotal();
  const gst = getGST();
  const total = getTotal();

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={closeDrawer}
            className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50"
          />

          {/* Drawer */}
          <motion.div
            initial={{ x: "100%" }}
            animate={{ x: 0 }}
            exit={{ x: "100%" }}
            transition={{ type: "spring", stiffness: 300, damping: 30 }}
            className="fixed right-0 top-0 bottom-0 w-full max-w-md z-50 flex flex-col"
            style={{
              background: "linear-gradient(180deg, #0B0B0B 0%, #050505 100%)",
              borderLeft: "1px solid rgba(255,43,43,0.15)",
              boxShadow: "-20px 0 60px rgba(255,43,43,0.1)",
            }}
          >
            {/* Header */}
            <div className="flex items-center justify-between p-5 border-b border-white/5">
              <div className="flex items-center gap-3">
                <ShoppingBag className="w-5 h-5 text-primary" />
                <h2 className="font-serif text-xl font-bold text-white">Your Order</h2>
                <span className="px-2 py-0.5 rounded-full bg-primary/20 text-primary text-xs font-medium border border-primary/30">
                  {items.reduce((s, i) => s + i.quantity, 0)} items
                </span>
              </div>
              <button
                onClick={closeDrawer}
                data-testid="cart-drawer-close"
                className="p-2 rounded-full hover:bg-white/5 transition-colors text-white/60 hover:text-white"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Items */}
            <div className="flex-1 overflow-y-auto py-4 px-5 space-y-3">
              <AnimatePresence mode="popLayout">
                {items.length === 0 ? (
                  <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    className="flex flex-col items-center justify-center h-48 text-center"
                  >
                    <ShoppingBag className="w-12 h-12 text-white/10 mb-3" />
                    <p className="text-muted-foreground text-sm">Your cart is empty</p>
                    <button
                      onClick={() => { closeDrawer(); setLocation("/menu"); }}
                      className="mt-4 text-primary text-sm font-medium hover:underline"
                    >
                      Browse Menu
                    </button>
                  </motion.div>
                ) : (
                  items.map((item) => (
                    <motion.div
                      key={item.menuItemId}
                      layout
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, x: -100 }}
                      data-testid={`cart-item-${item.menuItemId}`}
                      className="flex items-center gap-3 p-3 rounded-xl border border-white/5 bg-white/3 hover:bg-white/5 transition-colors"
                      style={{ background: "rgba(255,255,255,0.03)" }}
                    >
                      {/* Veg indicator */}
                      <div className={`w-4 h-4 rounded-sm border-2 flex-shrink-0 flex items-center justify-center ${item.isVeg ? "border-green-500" : "border-red-500"}`}>
                        <div className={`w-2 h-2 rounded-full ${item.isVeg ? "bg-green-500" : "bg-red-500"}`} />
                      </div>

                      <div className="flex-1 min-w-0">
                        <p className="text-white text-sm font-medium truncate">{item.name}</p>
                        <p className="text-primary text-xs font-bold">₹{(item.price * item.quantity).toFixed(0)}</p>
                      </div>

                      {/* Quantity Controls */}
                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => updateQuantity(item.menuItemId, item.quantity - 1)}
                          data-testid={`cart-decrease-${item.menuItemId}`}
                          className="w-6 h-6 rounded-full bg-white/10 flex items-center justify-center hover:bg-primary/30 transition-colors"
                        >
                          <Minus className="w-3 h-3 text-white" />
                        </button>
                        <span className="text-white text-sm font-bold w-4 text-center" data-testid={`cart-quantity-${item.menuItemId}`}>
                          {item.quantity}
                        </span>
                        <button
                          onClick={() => updateQuantity(item.menuItemId, item.quantity + 1)}
                          data-testid={`cart-increase-${item.menuItemId}`}
                          className="w-6 h-6 rounded-full bg-white/10 flex items-center justify-center hover:bg-primary/30 transition-colors"
                        >
                          <Plus className="w-3 h-3 text-white" />
                        </button>
                        <button
                          onClick={() => removeItem(item.menuItemId)}
                          data-testid={`cart-remove-${item.menuItemId}`}
                          className="w-6 h-6 rounded-full bg-red-500/10 flex items-center justify-center hover:bg-red-500/30 transition-colors ml-1"
                        >
                          <Trash2 className="w-3 h-3 text-red-400" />
                        </button>
                      </div>
                    </motion.div>
                  ))
                )}
              </AnimatePresence>
            </div>

            {/* Summary */}
            {items.length > 0 && (
              <div className="p-5 border-t border-white/5 space-y-3">
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between text-white/60">
                    <span>Subtotal</span>
                    <span data-testid="cart-subtotal">₹{subtotal.toFixed(0)}</span>
                  </div>
                  <div className="flex justify-between text-white/60">
                    <span>GST (5%)</span>
                    <span data-testid="cart-gst">₹{gst.toFixed(0)}</span>
                  </div>
                  <div className="flex justify-between text-white font-bold text-base pt-2 border-t border-white/5">
                    <span>Total</span>
                    <span data-testid="cart-total" className="text-primary">₹{total.toFixed(0)}</span>
                  </div>
                </div>

                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={() => { closeDrawer(); setLocation("/checkout"); }}
                  data-testid="cart-checkout-button"
                  className="w-full py-3.5 rounded-xl text-white font-bold text-sm shadow-[0_4px_20px_rgba(255,43,43,0.4)] transition-all"
                  style={{ background: "linear-gradient(135deg, #FF2B2B, #C1121F)" }}
                >
                  Proceed to Checkout — ₹{total.toFixed(0)}
                </motion.button>
              </div>
            )}
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
