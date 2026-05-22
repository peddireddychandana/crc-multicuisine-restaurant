import { useEffect, useState } from "react";
import { Layout } from "@/components/layout/Layout";
import { GlassCard } from "@/components/ui/glass-card";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { useQueryClient } from "@tanstack/react-query";
import { io } from "socket.io-client";
import {
  useGetDashboardStats,
  useGetRevenueChart,
  useGetDashboardActivity,
  getGetDashboardStatsQueryKey,
  getGetRevenueChartQueryKey,
  getGetDashboardActivityQueryKey,
} from "@workspace/api-client-react";
import { AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer } from 'recharts';
import { IndianRupee, TrendingUp, TrendingDown, Users, Utensils, Star, Activity, RotateCcw } from "lucide-react";
import { motion } from "framer-motion";

const socketUrl = import.meta.env.VITE_SOCKET_URL || "http://localhost:5000";

export default function Dashboard() {
  const queryClient = useQueryClient();
  const { toast } = useToast();
  const { data: stats } = useGetDashboardStats();
  const { data: revenueData } = useGetRevenueChart({ period: 'weekly' });
  const { data: activityData } = useGetDashboardActivity();
  const [resetting, setResetting] = useState(false);

  useEffect(() => {
    const socket = io(socketUrl, { transports: ["websocket", "polling"] });
    socket.on("new-order", () => {
      queryClient.invalidateQueries({ queryKey: getGetDashboardStatsQueryKey() });
      queryClient.invalidateQueries({ queryKey: getGetRevenueChartQueryKey({ period: "weekly" }) });
      queryClient.invalidateQueries({ queryKey: getGetDashboardActivityQueryKey() });
    });
    return () => { socket.disconnect(); };
  }, [queryClient]);

  const handleReset = async () => {
    setResetting(true);
    try {
      const { useAuthStore } = await import("@/lib/store");
      const token = useAuthStore.getState().token;
      const res = await fetch(
        `${import.meta.env.VITE_API_URL || "http://localhost:5000"}/api/dashboard/reset`,
        {
          method: "POST",
          headers: token ? { Authorization: `Bearer ${token}`, "Content-Type": "application/json" } : { "Content-Type": "application/json" },
        }
      );
      if (!res.ok) throw new Error("Reset failed");
      queryClient.invalidateQueries({ queryKey: getGetDashboardStatsQueryKey() });
      queryClient.invalidateQueries({ queryKey: getGetRevenueChartQueryKey({ period: "weekly" }) });
      queryClient.invalidateQueries({ queryKey: getGetDashboardActivityQueryKey() });
      toast({ title: "Dashboard reset successfully" });
    } catch {
      toast({ title: "Failed to reset dashboard", variant: "destructive" });
    } finally {
      setResetting(false);
    }
  };

  const statCards = [
    { label: "Total Revenue", value: stats?.totalRevenue != null ? `₹${stats.totalRevenue.toLocaleString()}` : '...', icon: IndianRupee, change: stats?.revenueChange },
    { label: "Total Orders", value: stats?.totalOrders || '...', icon: Utensils, change: stats?.ordersChange },
    { label: "Active Tables", value: stats ? `${stats.activeTables}/20` : '...', icon: Users },
    { label: "Pending Orders", value: stats?.pendingOrders || '0', icon: Activity, urgent: (stats?.pendingOrders || 0) > 0 },
    { label: "Completed Orders", value: stats?.completedOrders || '...', icon: TrendingUp },
    { label: "Average Rating", value: stats?.averageRating || '...', icon: Star },
  ];

  return (
    <Layout title="Dashboard Overview">
      {/* Reset Button */}
      <div className="flex justify-end mb-4">
        <Button
          variant="outline"
          size="sm"
          onClick={handleReset}
          disabled={resetting}
          className="text-red-500 border-red-500/30 hover:bg-red-500/10 gap-2"
        >
          <RotateCcw className={`w-4 h-4 ${resetting ? "animate-spin" : ""}`} />
          {resetting ? "Resetting..." : "Reset Today"}
        </Button>
      </div>
      {/* Stat Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-6 mb-8">
        {statCards.map((stat, i) => (
          <motion.div
            key={stat.label}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.1 }}
          >
            <GlassCard highlighted={stat.urgent} className="p-6 relative overflow-hidden group">
              <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity">
                <stat.icon className="w-16 h-16 text-primary" />
              </div>
              <p className="text-sm text-muted-foreground font-medium mb-2">{stat.label}</p>
              <h3 className="text-3xl font-bold text-foreground tracking-tight mb-2">{stat.value}</h3>
              {stat.change !== undefined && (
                <div className={`flex items-center text-xs font-medium ${stat.change >= 0 ? 'text-green-500' : 'text-red-500'}`}>
                  {stat.change >= 0 ? <TrendingUp className="w-3 h-3 mr-1" /> : <TrendingDown className="w-3 h-3 mr-1" />}
                  <span>{Math.abs(stat.change)}% vs last week</span>
                </div>
              )}
            </GlassCard>
          </motion.div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Main Chart */}
        <div className="lg:col-span-2 space-y-8">
          <GlassCard className="p-6">
            <h3 className="text-lg font-serif font-bold mb-6">Revenue Trend</h3>
            <div className="h-[300px] w-full">
              {revenueData && (
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={revenueData}>
                    <defs>
                      <linearGradient id="colorValue" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="hsl(0 100% 58%)" stopOpacity={0.3}/>
                        <stop offset="95%" stopColor="hsl(0 100% 58%)" stopOpacity={0}/>
                      </linearGradient>
                    </defs>
                    <XAxis dataKey="label" stroke="#888" fontSize={12} tickLine={false} axisLine={false} />
                    <YAxis stroke="#888" fontSize={12} tickLine={false} axisLine={false} tickFormatter={(val) => `₹${val}`} />
                    <Tooltip 
                      contentStyle={{ backgroundColor: 'hsl(0 0% 4%)', borderColor: 'hsl(0 0% 10%)', color: '#fff' }}
                      itemStyle={{ color: 'hsl(0 100% 58%)' }}
                    />
                    <Area type="monotone" dataKey="value" stroke="hsl(0 100% 58%)" strokeWidth={2} fillOpacity={1} fill="url(#colorValue)" />
                  </AreaChart>
                </ResponsiveContainer>
              )}
            </div>
          </GlassCard>
        </div>

        {/* Activity Feed */}
        <div className="lg:col-span-1">
          <GlassCard className="p-6 h-full">
            <h3 className="text-lg font-serif font-bold mb-6">Live Activity</h3>
            <div className="space-y-6">
              {activityData?.slice(0, 8).map((activity, i) => (
                <motion.div 
                  key={activity.id}
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: i * 0.1 }}
                  className="flex items-start gap-4"
                >
                  <div className="w-8 h-8 rounded-full bg-primary/10 border border-primary/20 flex items-center justify-center flex-shrink-0">
                    <Activity className="w-4 h-4 text-primary" />
                  </div>
                  <div>
                    <p className="text-sm text-foreground">{activity.message}</p>
                    <p className="text-xs text-muted-foreground mt-1">
                      {new Date(activity.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </p>
                  </div>
                </motion.div>
              ))}
            </div>
          </GlassCard>
        </div>
      </div>
    </Layout>
  );
}
