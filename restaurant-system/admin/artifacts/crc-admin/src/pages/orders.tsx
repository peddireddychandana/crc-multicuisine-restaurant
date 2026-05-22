import { Layout } from "@/components/layout/Layout";
import { GlassCard } from "@/components/ui/glass-card";
import { useGetOrders, useUpdateOrderStatus, getGetOrdersQueryKey } from "@workspace/api-client-react";
import { useQueryClient } from "@tanstack/react-query";
import { motion } from "framer-motion";
import { Clock, Check, X, ChevronRight } from "lucide-react";
import { Button } from "@/components/ui/button";

const COLUMNS = [
  { id: "pending", title: "Pending", color: "text-red-500", glow: true },
  { id: "accepted", title: "Accepted", color: "text-orange-500" },
  { id: "preparing", title: "Preparing", color: "text-yellow-500" },
  { id: "cooking", title: "Cooking", color: "text-blue-500" },
  { id: "ready", title: "Ready", color: "text-green-500", glow: true },
];

export default function Orders() {
  const queryClient = useQueryClient();
  const { data: ordersData } = useGetOrders();
  const updateStatus = useUpdateOrderStatus();

  const handleStatusUpdate = (id: number, status: string) => {
    updateStatus.mutate(
      { id, data: { status } },
      {
        onSuccess: () => {
          queryClient.invalidateQueries({ queryKey: getGetOrdersQueryKey() });
        }
      }
    );
  };

  const getNextStatus = (current: string) => {
    const idx = COLUMNS.findIndex(c => c.id === current);
    return idx >= 0 && idx < COLUMNS.length - 1 ? COLUMNS[idx + 1].id : "served";
  };

  return (
    <Layout title="Realtime Order Flow">
      <div className="flex gap-6 overflow-x-auto pb-4 h-[calc(100vh-140px)] scrollbar-thin">
        {COLUMNS.map((column, colIdx) => (
          <div key={column.id} className="min-w-[320px] flex flex-col gap-4">
            <div className="flex items-center justify-between pb-2 border-b border-white/10">
              <h3 className={`font-serif font-bold text-lg ${column.color}`}>{column.title}</h3>
              <span className="text-xs text-muted-foreground bg-white/5 px-2 py-1 rounded-full">
                {ordersData?.orders.filter(o => o.status === column.id).length || 0}
              </span>
            </div>

            <div className="flex-1 overflow-y-auto space-y-4 pr-2 scrollbar-thin">
              {ordersData?.orders
                .filter(o => o.status === column.id)
                .map((order, i) => (
                  <motion.div
                    key={order.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: i * 0.05 }}
                  >
                    <GlassCard highlighted={column.glow} className="p-4 flex flex-col gap-3">
                      <div className="flex justify-between items-start">
                        <div>
                          <span className="text-2xl font-bold text-foreground block">T{order.tableNumber}</span>
                          <span className="text-xs text-muted-foreground">{order.customerName || "Walk-in"}</span>
                        </div>
                        <div className="flex items-center gap-1 text-xs text-muted-foreground bg-black/40 px-2 py-1 rounded-md">
                          <Clock className="w-3 h-3" />
                          <span>{new Date(order.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                        </div>
                      </div>

                      <div className="bg-black/20 p-3 rounded-lg border border-white/5">
                        <ul className="space-y-1">
                          {order.items.map((item, idx) => (
                            <li key={idx} className="flex justify-between text-sm">
                              <span className="text-muted-foreground"><span className="text-foreground">{item.quantity}x</span> {item.name}</span>
                              <span className="text-foreground">₹{item.price * item.quantity}</span>
                            </li>
                          ))}
                        </ul>
                      </div>

                      <div className="flex justify-between items-center mt-2 pt-2 border-t border-white/5">
                        <span className="font-bold text-primary">₹{order.totalAmount}</span>
                        <div className="flex gap-2">
                          {column.id === 'pending' && (
                            <>
                              <Button size="icon" variant="ghost" className="h-8 w-8 text-destructive hover:bg-destructive/20" onClick={() => handleStatusUpdate(order.id, 'rejected')}>
                                <X className="w-4 h-4" />
                              </Button>
                              <Button size="icon" variant="ghost" className="h-8 w-8 text-green-500 hover:bg-green-500/20 bg-green-500/10" onClick={() => handleStatusUpdate(order.id, 'accepted')}>
                                <Check className="w-4 h-4" />
                              </Button>
                            </>
                          )}
                          {column.id !== 'pending' && (
                            <Button size="sm" variant="ghost" className="h-8 text-xs bg-primary/10 text-primary hover:bg-primary/20 border border-primary/20" onClick={() => handleStatusUpdate(order.id, getNextStatus(column.id))}>
                              Next <ChevronRight className="w-3 h-3 ml-1" />
                            </Button>
                          )}
                        </div>
                      </div>
                    </GlassCard>
                  </motion.div>
                ))}
            </div>
          </div>
        ))}
      </div>
    </Layout>
  );
}
