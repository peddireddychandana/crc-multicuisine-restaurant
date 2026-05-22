import { useState } from "react";
import { motion } from "framer-motion";
import { useParams, useLocation } from "wouter";
import { Clock, CheckCircle, Circle, ChefHat, UtensilsCrossed, Star, ArrowLeft, Loader2 } from "lucide-react";
import { useGetOrder, getGetOrderQueryKey, useUpdateOrderStatus } from "@workspace/api-client-react";
import { useQueryClient } from "@tanstack/react-query";
import { useSocket } from "@/hooks/useSocket";
import { useCartStore } from "@/store/cartStore";

const STATUSES = [
  { key: "pending", label: "Order Placed", icon: CheckCircle, friendly: "Your order has been received 📋" },
  { key: "accepted", label: "Accepted", icon: CheckCircle, friendly: "Kitchen has accepted your order 👨‍🍳" },
  { key: "preparing", label: "Preparing", icon: ChefHat, friendly: "Your order is being prepared 🍳" },
  { key: "cooking", label: "Cooking", icon: ChefHat, friendly: "Cooking in progress 🔥" },
  { key: "ready", label: "Ready", icon: UtensilsCrossed, friendly: "Almost ready 🍽️" },
  { key: "completed", label: "Completed", icon: CheckCircle, friendly: "Thank you for dining with us! 🙏" },
];

const friendlyStatuses = [
  { key: "pending", message: "Your order has been received. The kitchen will start on it shortly!", emoji: "📋" },
  { key: "accepted", message: "The chef is reviewing your order. Getting ready to cook!", emoji: "👨‍🍳" },
  { key: "preparing", message: "Your food is being prepared with fresh ingredients!", emoji: "🍳" },
  { key: "cooking", message: "Cooking in progress! Your food will be ready soon.", emoji: "🔥" },
  { key: "ready", message: "Your order is ready!", emoji: "🍽️" },
  { key: "completed", message: "Thank you for dining with us! Please leave a review.", emoji: "🙏" },
];

function EmptyTracking() {
  const [, setLocation] = useLocation();

  return (
    <div className="min-h-screen bg-background pt-20 flex items-center justify-center px-4">
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="w-full max-w-sm text-center">
        <div className="w-16 h-16 rounded-full bg-primary/10 border border-primary/20 flex items-center justify-center mx-auto mb-6">
          <UtensilsCrossed className="w-8 h-8 text-primary" />
        </div>
        <h1 className="font-serif text-2xl font-bold text-white mb-2">Track Your Order</h1>
        <p className="text-muted-foreground text-sm mb-6">You haven't placed an order yet.</p>
        <motion.button
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          onClick={() => setLocation("/menu")}
          className="px-6 py-3 rounded-xl text-white font-bold transition-all"
          style={{ background: "linear-gradient(135deg, #FF2B2B, #C1121F)" }}
        >
          Browse Menu
        </motion.button>
      </motion.div>
    </div>
  );
}

export default function Tracking() {
  const params = useParams<{ orderId: string }>();
  const [, setLocation] = useLocation();
  const queryClient = useQueryClient();
  const lastOrderId = useCartStore((s) => s.lastOrderId);
  const orderId = parseInt(params.orderId ?? "0", 10);

  const [finishing, setFinishing] = useState(false);

  const { data: order, isLoading, isError } = useGetOrder(orderId, {
    query: {
      enabled: !!orderId,
      queryKey: ["getOrder", orderId],
      refetchInterval: 30000,
    },
  });

  const completeOrder = useUpdateOrderStatus();

  useSocket((data) => {
    if (data.orderId === String(orderId)) {
      queryClient.invalidateQueries({ queryKey: getGetOrderQueryKey(orderId) });
    }
  });

  if (!orderId) {
    if (lastOrderId) {
      setLocation(`/tracking/${lastOrderId}`, { replace: true });
      return null;
    }
    return <EmptyTracking />;
  }

  const currentIndex = STATUSES.findIndex((s) => s.key === order?.status) ?? 0;
  const progress = ((currentIndex + 1) / STATUSES.length) * 100;
  const friendly = friendlyStatuses.find((s) => s.key === order?.status);

  const handleFinishEating = () => {
    if (finishing || !order) return;
    setFinishing(true);
    completeOrder.mutate(
      { id: order.id, data: { status: "completed" } },
      {
        onSuccess: () => {
          setLocation(`/reviews/${orderId}`);
        },
        onError: () => {
          setFinishing(false);
        },
      },
    );
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background pt-20 flex items-center justify-center">
        <div className="text-center">
          <motion.div animate={{ rotate: 360 }} transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
            className="w-12 h-12 rounded-full border-2 border-primary border-t-transparent mx-auto mb-4" />
          <p className="text-muted-foreground">Loading order details...</p>
        </div>
      </div>
    );
  }

  if (isError || !order) {
    return (
      <div className="min-h-screen bg-background pt-20 flex items-center justify-center">
        <div className="text-center px-4">
          <p className="text-muted-foreground mb-4">Order not found or an error occurred.</p>
          <button onClick={() => setLocation("/menu")} className="text-primary hover:underline text-sm">Back to Menu</button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background pt-20 pb-24">
      <div className="max-w-2xl mx-auto px-4">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
          {/* Header */}
          <button onClick={() => setLocation("/menu")} className="flex items-center gap-2 text-muted-foreground hover:text-white mb-6 text-sm" data-testid="tracking-back">
            <ArrowLeft className="w-4 h-4" /> Back to Menu
          </button>

          <div className="flex items-center justify-between mb-8">
            <div>
              <h1 className="font-serif text-2xl font-bold text-white">Order #{order.id}</h1>
              <p className="text-muted-foreground text-sm">Table {order.tableNumber}</p>
            </div>
            <div className="text-right">
              <p className="text-primary font-bold text-lg">₹{typeof order.total === 'number' ? order.total.toFixed(0) : order.total}</p>
              {order.estimatedMinutes && (
                <div className="flex items-center gap-1 text-muted-foreground text-xs justify-end">
                  <Clock className="w-3 h-3" />
                  <span>~{order.estimatedMinutes} min</span>
                </div>
              )}
            </div>
          </div>

          {/* Live indicator */}
          <div className="flex items-center gap-2 mb-6 px-3 py-2 rounded-full border border-primary/20 bg-primary/5 w-fit">
            <motion.div animate={{ scale: [1, 1.3, 1], opacity: [1, 0.5, 1] }} transition={{ duration: 1.5, repeat: Infinity }}
              className="w-2 h-2 rounded-full bg-primary" />
            <span className="text-primary text-xs font-medium">Live Tracking — Real-time updates</span>
          </div>

          {/* Progress bar */}
          <div className="w-full h-1.5 rounded-full bg-white/5 mb-8 overflow-hidden">
            <motion.div
              initial={{ width: 0 }}
              animate={{ width: `${progress}%` }}
              transition={{ duration: 0.6, ease: "easeOut" }}
              className="h-full rounded-full"
              style={{ background: "linear-gradient(90deg, #FF2B2B, #ff6b6b)" }}
            />
          </div>

          {/* Friendly message */}
          {friendly && (
            <motion.div
              key={friendly.key}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="text-center mb-6 px-4 py-3 rounded-xl border border-primary/10 bg-primary/5"
            >
              <p className="text-white/80 text-sm">{friendly.message}</p>
            </motion.div>
          )}

          {/* Timeline */}
          <div className="relative mb-8">
            {STATUSES.map((status, i) => {
              const isDone = i <= currentIndex;
              const isCurrent = i === currentIndex;
              return (
                <div key={status.key} className="flex gap-4 mb-6" data-testid={`tracking-step-${status.key}`}>
                  {/* Icon & line */}
                  <div className="flex flex-col items-center">
                    <motion.div
                      animate={isCurrent ? { scale: [1, 1.15, 1], boxShadow: ["0 0 0px rgba(255,43,43,0)", "0 0 20px rgba(255,43,43,0.6)", "0 0 0px rgba(255,43,43,0)"] } : {}}
                      transition={{ duration: 2, repeat: Infinity }}
                      className={`w-9 h-9 rounded-full flex items-center justify-center border-2 transition-all ${
                        isDone ? "bg-primary border-primary" : "border-white/10 bg-white/5"
                      }`}
                    >
                      {isDone ? (
                        <status.icon className="w-4 h-4 text-white" />
                      ) : (
                        <Circle className="w-4 h-4 text-white/20" />
                      )}
                    </motion.div>
                    {i < STATUSES.length - 1 && (
                      <div className={`w-0.5 h-10 mt-1 transition-all ${isDone ? "bg-primary/50" : "bg-white/5"}`} />
                    )}
                  </div>

                  {/* Content */}
                  <div className="flex-1 pt-1">
                    <p className={`font-semibold text-sm ${isDone ? "text-white" : "text-white/30"}`}>{status.label}</p>
                    {isCurrent && (
                      <motion.p initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="text-muted-foreground text-xs mt-0.5">
                        {status.friendly}
                      </motion.p>
                    )}
                  </div>
                </div>
              );
            })}
          </div>

          {/* Order items */}
          <div className="p-5 rounded-2xl border border-white/5 mb-6" style={{ background: "rgba(17,17,17,0.8)" }}>
            <h2 className="text-white font-semibold mb-3">Order Items</h2>
            <div className="space-y-2">
              {(order.items as Array<{ name: string; quantity: number; unitPrice: number }>).map((item, i) => (
                <div key={i} className="flex justify-between text-sm">
                  <span className="text-white/70">{item.name} × {item.quantity}</span>
                  <span className="text-white font-medium">₹{(item.unitPrice * item.quantity).toFixed(0)}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Actions */}
          {order.status === "ready" && (
            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={handleFinishEating}
              disabled={finishing}
              data-testid="tracking-finish-button"
              className="w-full py-3.5 rounded-xl text-white font-bold flex items-center justify-center gap-2 transition-all"
              style={{ background: "linear-gradient(135deg, #FF2B2B, #C1121F)" }}
            >
              {finishing ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : (
                <UtensilsCrossed className="w-4 h-4" />
              )}
              {finishing ? "Please wait..." : "🍽️ I've Finished Eating"}
            </motion.button>
          )}

          {order.status === "completed" && (
            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={() => setLocation(`/reviews/${orderId}`)}
              data-testid="tracking-rate-button"
              className="w-full py-3.5 rounded-xl text-white font-bold flex items-center justify-center gap-2 border border-primary/30 hover:bg-primary transition-all"
            >
              <Star className="w-4 h-4" /> Rate Your Experience
            </motion.button>
          )}
        </motion.div>
      </div>
    </div>
  );
}
