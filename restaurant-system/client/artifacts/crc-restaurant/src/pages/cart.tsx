import { motion } from "framer-motion";
import { useLocation } from "wouter";
import { ShoppingBag, Plus, Minus, Trash2, ArrowRight } from "lucide-react";
import { useCartStore } from "@/store/cartStore";

export default function Cart() {
  const [, setLocation] = useLocation();
  const { items, updateQuantity, removeItem, getSubtotal, getGST, getTotal } = useCartStore();

  const subtotal = getSubtotal();
  const gst = getGST();
  const total = getTotal();

  return (
    <div className="min-h-screen bg-background pt-20 pb-24">
      <div className="max-w-2xl mx-auto px-4">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
          <div className="flex items-center gap-3 mb-8">
            <ShoppingBag className="w-6 h-6 text-primary" />
            <h1 className="font-serif text-2xl font-bold text-white">Your Cart</h1>
            <span className="text-muted-foreground text-sm">({items.reduce((s, i) => s + i.quantity, 0)} items)</span>
          </div>

          {items.length === 0 ? (
            <div className="text-center py-20">
              <ShoppingBag className="w-16 h-16 text-white/10 mx-auto mb-4" />
              <p className="text-muted-foreground mb-4">Your cart is empty</p>
              <button onClick={() => setLocation("/menu")} data-testid="cart-empty-browse"
                className="px-6 py-3 rounded-xl text-white border border-primary/30 hover:bg-primary transition-all font-medium">
                Browse Menu
              </button>
            </div>
          ) : (
            <div className="space-y-3 mb-6">
              {items.map((item) => (
                <motion.div key={item.menuItemId} layout
                  className="flex items-center gap-4 p-4 rounded-2xl border border-white/5"
                  style={{ background: "rgba(17,17,17,0.8)" }}
                  data-testid={`cart-item-${item.menuItemId}`}>
                  <div className={`w-4 h-4 rounded-sm border-2 flex-shrink-0 flex items-center justify-center ${item.isVeg ? "border-green-500" : "border-red-500"}`}>
                    <div className={`w-2 h-2 rounded-full ${item.isVeg ? "bg-green-500" : "bg-red-500"}`} />
                  </div>
                  <div className="flex-1">
                    <p className="text-white font-medium">{item.name}</p>
                    <p className="text-primary text-sm font-bold">₹{(item.price * item.quantity).toFixed(0)}</p>
                  </div>
                  <div className="flex items-center gap-2">
                    <button onClick={() => updateQuantity(item.menuItemId, item.quantity - 1)} data-testid={`cart-dec-${item.menuItemId}`}
                      className="w-7 h-7 rounded-full bg-white/10 flex items-center justify-center hover:bg-primary/30 transition-colors">
                      <Minus className="w-3 h-3 text-white" />
                    </button>
                    <span className="text-white font-bold w-5 text-center" data-testid={`cart-qty-${item.menuItemId}`}>{item.quantity}</span>
                    <button onClick={() => updateQuantity(item.menuItemId, item.quantity + 1)} data-testid={`cart-inc-${item.menuItemId}`}
                      className="w-7 h-7 rounded-full bg-white/10 flex items-center justify-center hover:bg-primary/30 transition-colors">
                      <Plus className="w-3 h-3 text-white" />
                    </button>
                    <button onClick={() => removeItem(item.menuItemId)} data-testid={`cart-rm-${item.menuItemId}`}
                      className="w-7 h-7 rounded-full bg-red-500/10 flex items-center justify-center hover:bg-red-500/30 transition-colors ml-1">
                      <Trash2 className="w-3 h-3 text-red-400" />
                    </button>
                  </div>
                </motion.div>
              ))}
            </div>
          )}

          {items.length > 0 && (
            <div className="p-5 rounded-2xl border border-white/5 space-y-3 mb-6" style={{ background: "rgba(17,17,17,0.8)" }}>
              <div className="flex justify-between text-sm text-white/60">
                <span>Subtotal</span>
                <span data-testid="cart-page-subtotal">₹{subtotal.toFixed(0)}</span>
              </div>
              <div className="flex justify-between text-sm text-white/60">
                <span>GST (5%)</span>
                <span data-testid="cart-page-gst">₹{gst.toFixed(0)}</span>
              </div>
              <div className="flex justify-between font-bold text-white pt-2 border-t border-white/5">
                <span>Total</span>
                <span data-testid="cart-page-total" className="text-primary">₹{total.toFixed(0)}</span>
              </div>
              <motion.button whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}
                onClick={() => setLocation("/checkout")}
                data-testid="cart-page-checkout"
                className="w-full py-4 rounded-xl text-white font-bold flex items-center justify-center gap-2 shadow-[0_4px_20px_rgba(255,43,43,0.4)]"
                style={{ background: "linear-gradient(135deg, #FF2B2B, #C1121F)" }}>
                Proceed to Checkout <ArrowRight className="w-4 h-4" />
              </motion.button>
            </div>
          )}
        </motion.div>
      </div>
    </div>
  );
}
