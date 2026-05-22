import { Layout } from "@/components/layout/Layout";
import { GlassCard } from "@/components/ui/glass-card";
import {
  useGetNotifications,
  useGetUnreadCount,
  useMarkNotificationRead,
  useMarkAllNotificationsRead,
  getGetNotificationsQueryKey,
  getGetUnreadCountQueryKey,
} from "@workspace/api-client-react";
import { useQueryClient } from "@tanstack/react-query";
import { motion } from "framer-motion";
import {
  Bell,
  BellRing,
  ShoppingBag,
  Star,
  TrendingUp,
  Clock,
  CheckCheck,
  Table,
  AlertCircle,
  Trash2,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import { useState } from "react";

const TYPE_CONFIG: Record<string, { icon: React.ComponentType<{ className?: string }>; color: string; label: string }> = {
  new_order: { icon: ShoppingBag, color: "text-blue-400 bg-blue-400/10", label: "New Order" },
  new_review: { icon: Star, color: "text-yellow-400 bg-yellow-400/10", label: "Review" },
  revenue_milestone: { icon: TrendingUp, color: "text-green-500 bg-green-500/10", label: "Revenue" },
  table_update: { icon: Table, color: "text-purple-400 bg-purple-400/10", label: "Table" },
  cooking_delay: { icon: Clock, color: "text-[#FF2B2B] bg-[#FF2B2B]/10", label: "Delay" },
  offer_expired: { icon: AlertCircle, color: "text-orange-400 bg-orange-400/10", label: "Offer" },
};

export default function Notifications() {
  const queryClient = useQueryClient();
  const { toast } = useToast();
  const { data: notifications, isLoading } = useGetNotifications();
  const { data: unreadData } = useGetUnreadCount();
  const markRead = useMarkNotificationRead();
  const markAll = useMarkAllNotificationsRead();
  const [filter, setFilter] = useState<"all" | "unread">("all");
  const [deleting, setDeleting] = useState<number | null>(null);

  const invalidate = () => {
    queryClient.invalidateQueries({ queryKey: getGetNotificationsQueryKey() });
    queryClient.invalidateQueries({ queryKey: getGetUnreadCountQueryKey() });
  };

  const handleMarkRead = (id: number) => {
    markRead.mutate(
      { id },
      {
        onSuccess: () => invalidate(),
      }
    );
  };

  const handleMarkAll = () => {
    markAll.mutate(undefined, {
      onSuccess: () => {
        invalidate();
        toast({ title: "All notifications marked as read" });
      },
    });
  };

  const handleDelete = async (id: number) => {
    setDeleting(id);
    try {
      const token = (await import("@/lib/store")).useAuthStore.getState().token;
      const res = await fetch(
        `${
          import.meta.env.VITE_API_URL || "http://localhost:5000"
        }/api/notifications/${id}`,
        {
          method: "DELETE",
          headers: token
            ? { Authorization: `Bearer ${token}` }
            : undefined,
        }
      );
      if (!res.ok) throw new Error("Failed to delete");
      invalidate();
      toast({ title: "Notification deleted" });
    } catch {
      toast({ title: "Failed to delete notification", variant: "destructive" });
    } finally {
      setDeleting(null);
    }
  };

  const filtered = notifications?.filter((n) => {
    if (filter === "unread") return !n.isRead;
    return true;
  });

  return (
    <Layout title="Notifications Center">
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between flex-wrap gap-4">
          <div className="flex items-center gap-3">
            <div className="relative">
              <BellRing className="w-6 h-6 text-[#FF2B2B]" />
              {(unreadData?.count || 0) > 0 && (
                <span className="absolute -top-1.5 -right-1.5 w-4 h-4 rounded-full bg-[#FF2B2B] text-white text-[10px] flex items-center justify-center font-bold">
                  {unreadData?.count}
                </span>
              )}
            </div>
            <div>
              <h2 className="font-serif text-xl font-bold">{unreadData?.count || 0} Unread</h2>
              <p className="text-xs text-muted-foreground">{notifications?.length || 0} total notifications</p>
            </div>
          </div>

          <div className="flex gap-3">
            <div className="flex gap-1">
              {(["all", "unread"] as const).map((f) => (
                <Button
                  key={f}
                  size="sm"
                  variant={filter === f ? "default" : "outline"}
                  onClick={() => setFilter(f)}
                  className={filter === f ? "bg-[#FF2B2B] hover:bg-[#cc2222] text-white" : ""}
                >
                  {f.charAt(0).toUpperCase() + f.slice(1)}
                </Button>
              ))}
            </div>
            <Button
              size="sm"
              variant="outline"
              onClick={handleMarkAll}
              disabled={markAll.isPending || !unreadData?.count}
              className="gap-1.5"
            >
              <CheckCheck className="w-4 h-4" /> Mark All Read
            </Button>
          </div>
        </div>

        {/* Notification Type Summary */}
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-6 gap-3">
          {Object.entries(TYPE_CONFIG).map(([type, config]) => {
            const Icon = config.icon;
            const count = notifications?.filter((n) => n.type === type).length || 0;
            return (
              <GlassCard key={type} className="p-3 flex flex-col items-center gap-1 text-center">
                <div className={`w-8 h-8 rounded-xl flex items-center justify-center ${config.color.split(" ")[1]}`}>
                  <Icon className={`w-4 h-4 ${config.color.split(" ")[0]}`} />
                </div>
                <p className="text-xs text-muted-foreground leading-tight">{config.label}</p>
                <p className="text-lg font-bold text-foreground">{count}</p>
              </GlassCard>
            );
          })}
        </div>

        {/* Notifications List */}
        {isLoading ? (
          <div className="space-y-3">
            {[...Array(5)].map((_, i) => (
              <GlassCard key={i} className="h-20 animate-pulse"><span /></GlassCard>
            ))}
          </div>
        ) : (
          <div className="space-y-3">
            {filtered?.map((notif, i) => {
              const config = TYPE_CONFIG[notif.type] || {
                icon: Bell,
                color: "text-muted-foreground bg-white/5",
                label: notif.type,
              };
              const Icon = config.icon;

              return (
                <motion.div
                  key={notif.id}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.04 }}
                >
                  <GlassCard
                    highlighted={!notif.isRead}
                    className={`p-4 flex items-start gap-4 transition-opacity ${notif.isRead ? "opacity-60" : ""}`}
                  >
                    <div className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 ${config.color.split(" ")[1]}`}>
                      <Icon className={`w-5 h-5 ${config.color.split(" ")[0]}`} />
                    </div>

                    <div className="flex-1 min-w-0">
                      <div className="flex items-start justify-between gap-2 flex-wrap">
                        <div className="flex items-center gap-2">
                          <p className="font-semibold text-foreground text-sm">{notif.title}</p>
                          {!notif.isRead && (
                            <span className="w-2 h-2 rounded-full bg-[#FF2B2B] shrink-0" />
                          )}
                        </div>
                        <div className="flex items-center gap-2">
                          <Badge className="text-[10px] bg-white/5 text-muted-foreground border-white/10">
                            {config.label}
                          </Badge>
                          <span className="text-xs text-muted-foreground whitespace-nowrap">
                            {notif.createdAt
                              ? new Date(notif.createdAt).toLocaleString("en-IN", {
                                  day: "numeric",
                                  month: "short",
                                  hour: "2-digit",
                                  minute: "2-digit",
                                })
                              : ""}
                          </span>
                        </div>
                      </div>
                      <p className="text-sm text-muted-foreground mt-0.5 leading-relaxed">
                        {notif.message}
                      </p>
                    </div>

                    <div className="flex items-center gap-1 shrink-0">
                      {!notif.isRead && (
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={() => handleMarkRead(notif.id)}
                          className="text-xs text-muted-foreground hover:text-foreground"
                        >
                          Mark read
                        </Button>
                      )}
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={() => handleDelete(notif.id)}
                        disabled={deleting === notif.id}
                        className="text-red-500 hover:text-red-400 hover:bg-red-500/10"
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </div>
                  </GlassCard>
                </motion.div>
              );
            })}

            {!filtered?.length && (
              <div className="text-center py-20 text-muted-foreground">
                <Bell className="w-12 h-12 mx-auto mb-4 opacity-30" />
                <p className="text-lg">
                  {filter === "unread" ? "No unread notifications" : "No notifications yet"}
                </p>
              </div>
            )}
          </div>
        )}
      </div>
    </Layout>
  );
}
