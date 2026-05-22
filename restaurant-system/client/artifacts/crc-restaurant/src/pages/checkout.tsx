import { useState } from "react";
import { motion } from "framer-motion";
import { useLocation } from "wouter";
import { ClipboardList, User, Phone, TableProperties, MessageSquare, ArrowRight } from "lucide-react";
import { useCartStore } from "@/store/cartStore";
import { useCreateOrder } from "@workspace/api-client-react";

export default function Checkout() {
  const [, setLocation] = useLocation();
  const { items, tableNumber, setTableNumber, setLastOrderId, getSubtotal, getGST, getTotal, clearCart } = useCartStore();
  const subtotal = getSubtotal();
  const gst = getGST();
  const total = getTotal();

  const [form, setForm] = useState({
    tableNumber: tableNumber?.toString() ?? "",
    customerName: "",
    customerPhone: "",
    cookingNotes: "",
  });
  const [errors, setErrors] = useState<Record<string, string>>({});

  const createOrder = useCreateOrder();

  const validate = () => {
    const errs: Record<string, string> = {};
    if (!form.tableNumber || isNaN(Number(form.tableNumber))) errs.tableNumber = "Valid table number is required";
    if (!form.customerName.trim()) errs.customerName = "Name is required";
    if (!form.customerPhone.match(/^[0-9]{10}$/)) errs.customerPhone = "Valid 10-digit phone number required";
    setErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const handleSubmit = () => {
    if (!validate()) return;
    if (items.length === 0) { setLocation("/menu"); return; }

    setTableNumber(Number(form.tableNumber));

    createOrder.mutate({
      data: {
        tableNumber: Number(form.tableNumber),
        customerName: form.customerName,
        customerPhone: form.customerPhone,
        cookingNotes: form.cookingNotes || undefined,
        items: items.map((i) => ({ menuItemId: i.menuItemId, quantity: i.quantity, name: i.name, price: i.price, image: i.imageUrl, notes: i.notes })),
      },
    }, {
      onSuccess: (order) => {
        setLastOrderId(order.id);
        clearCart();
        setLocation(`/tracking/${order.id}`);
      },
    });
  };

  const fieldClass = "w-full px-4 py-3 rounded-xl bg-white/5 border border-white/10 text-white placeholder:text-muted-foreground text-sm focus:outline-none focus:border-primary/50 transition-colors";

  return (
    <div className="min-h-screen bg-background pt-20 pb-24">
      <div className="max-w-2xl mx-auto px-4">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
          <div className="flex items-center gap-3 mb-8">
            <ClipboardList className="w-6 h-6 text-primary" />
            <h1 className="font-serif text-2xl font-bold text-white">Checkout</h1>
          </div>

          {/* Order Summary */}
          <div className="p-5 rounded-2xl border border-white/5 mb-6" style={{ background: "rgba(17,17,17,0.8)" }}>
            <h2 className="text-white font-semibold mb-3">Order Summary</h2>
            <div className="space-y-2 mb-3">
              {items.map((item) => (
                <div key={item.menuItemId} className="flex justify-between text-sm">
                  <span className="text-white/70">{item.name} × {item.quantity}</span>
                  <span className="text-white font-medium">₹{(item.price * item.quantity).toFixed(0)}</span>
                </div>
              ))}
            </div>
            <div className="border-t border-white/5 pt-3 space-y-1">
              <div className="flex justify-between text-sm text-white/50">
                <span>Subtotal</span><span>₹{subtotal.toFixed(0)}</span>
              </div>
              <div className="flex justify-between text-sm text-white/50">
                <span>GST (5%)</span><span>₹{gst.toFixed(0)}</span>
              </div>
              <div className="flex justify-between font-bold text-white pt-1">
                <span>Total</span><span className="text-primary" data-testid="checkout-total">₹{total.toFixed(0)}</span>
              </div>
            </div>
          </div>

          {/* Customer Details */}
          <div className="p-5 rounded-2xl border border-white/5 mb-6 space-y-4" style={{ background: "rgba(17,17,17,0.8)" }}>
            <h2 className="text-white font-semibold">Your Details</h2>

            <div>
              <label className="flex items-center gap-2 text-xs text-muted-foreground mb-1.5">
                <TableProperties className="w-3.5 h-3.5" /> Table Number
              </label>
              <input type="number" value={form.tableNumber}
                onChange={(e) => setForm({ ...form, tableNumber: e.target.value })}
                placeholder="Enter your table number"
                data-testid="checkout-table-number"
                className={fieldClass} />
              {errors.tableNumber && <p className="text-red-400 text-xs mt-1">{errors.tableNumber}</p>}
            </div>

            <div>
              <label className="flex items-center gap-2 text-xs text-muted-foreground mb-1.5">
                <User className="w-3.5 h-3.5" /> Your Name
              </label>
              <input type="text" value={form.customerName}
                onChange={(e) => setForm({ ...form, customerName: e.target.value })}
                placeholder="Enter your name"
                data-testid="checkout-name"
                className={fieldClass} />
              {errors.customerName && <p className="text-red-400 text-xs mt-1">{errors.customerName}</p>}
            </div>

            <div>
              <label className="flex items-center gap-2 text-xs text-muted-foreground mb-1.5">
                <Phone className="w-3.5 h-3.5" /> Mobile Number
              </label>
              <input type="tel" value={form.customerPhone}
                onChange={(e) => setForm({ ...form, customerPhone: e.target.value })}
                placeholder="10-digit mobile number"
                data-testid="checkout-phone"
                className={fieldClass} />
              {errors.customerPhone && <p className="text-red-400 text-xs mt-1">{errors.customerPhone}</p>}
            </div>

            <div>
              <label className="flex items-center gap-2 text-xs text-muted-foreground mb-1.5">
                <MessageSquare className="w-3.5 h-3.5" /> Cooking Notes (Optional)
              </label>
              <textarea value={form.cookingNotes}
                onChange={(e) => setForm({ ...form, cookingNotes: e.target.value })}
                placeholder="Any special instructions? (less spice, no onion, etc.)"
                data-testid="checkout-notes"
                rows={3}
                className={`${fieldClass} resize-none`} />
            </div>
          </div>

          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={handleSubmit}
            disabled={createOrder.isPending || items.length === 0}
            data-testid="place-order-button"
            className="w-full py-4 rounded-xl text-white font-bold text-lg flex items-center justify-center gap-2 shadow-[0_4px_30px_rgba(255,43,43,0.4)] disabled:opacity-50 disabled:cursor-not-allowed transition-all"
            style={{ background: "linear-gradient(135deg, #FF2B2B, #C1121F)" }}
          >
            {createOrder.isPending ? "Placing Order..." : `Place Order — ₹${total.toFixed(0)}`}
            {!createOrder.isPending && <ArrowRight className="w-5 h-5" />}
          </motion.button>

          {createOrder.isError && (
            <p className="text-red-400 text-sm text-center mt-3">Failed to place order. Please try again.</p>
          )}
        </motion.div>
      </div>
    </div>
  );
}
