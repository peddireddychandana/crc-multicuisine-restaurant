import { Layout } from "@/components/layout/Layout";
import { GlassCard } from "@/components/ui/glass-card";
import {
  useGetAnalyticsOverview,
  useGetSalesByCategory,
  useGetTopSelling,
  useGetRevenueChart,
  useGetPeakHours,
} from "@workspace/api-client-react";
import {
  AreaChart, Area,
  BarChart, Bar,
  PieChart, Pie, Cell,
  XAxis, YAxis, Tooltip,
  ResponsiveContainer,
  Legend,
} from "recharts";
import { motion } from "framer-motion";
import { TrendingUp, TrendingDown, IndianRupee, ShoppingBag, Star, Users } from "lucide-react";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { GetAnalyticsOverviewPeriod } from "@workspace/api-client-react";

const CHART_COLORS = ["#FF2B2B", "#ff6b6b", "#ff9999", "#ffbbbb", "#ffdddd", "#ffeaea"];

const CustomTooltip = ({
  active,
  payload,
  label,
}: {
  active?: boolean;
  payload?: Array<{ value: number; name?: string }>;
  label?: string;
}) => {
  if (active && payload?.length) {
    return (
      <div className="bg-[#0a0a0a] border border-white/10 rounded-xl px-4 py-3 text-sm shadow-2xl">
        {label && <p className="text-muted-foreground text-xs mb-1">{label}</p>}
        {payload.map((p, i) => (
          <p key={i} className="font-bold text-foreground">
            {p.name && (
              <span className="text-muted-foreground font-normal mr-1">{p.name}:</span>
            )}
            {typeof p.value === "number" && p.value >= 100
              ? `₹${p.value.toLocaleString()}`
              : p.value}
          </p>
        ))}
      </div>
    );
  }
  return null;
};

const PERIODS: Array<{ key: GetAnalyticsOverviewPeriod; label: string }> = [
  { key: "today", label: "Today" },
  { key: "week", label: "Weekly" },
  { key: "month", label: "Monthly" },
];

export default function Analytics() {
  const [period, setPeriod] = useState<GetAnalyticsOverviewPeriod>("week");
  const { data: overview } = useGetAnalyticsOverview({ period });
  const { data: categoryData } = useGetSalesByCategory();
  const { data: topSelling } = useGetTopSelling({ limit: 5 });
  const { data: revenueData } = useGetRevenueChart({ period: "weekly" });
  const { data: peakHours } = useGetPeakHours();

  const kpis = [
    {
      label: "Total Revenue",
      value: overview ? `₹${Number(overview.revenue ?? 0).toLocaleString()}` : "—",
      change: overview?.revenueChange,
      icon: IndianRupee,
    },
    {
      label: "Total Orders",
      value: overview?.orders ?? "—",
      change: overview?.ordersChange,
      icon: ShoppingBag,
    },
    {
      label: "Avg Order Value",
      value: overview ? `₹${Number(overview.avgOrderValue ?? 0).toFixed(0)}` : "—",
      icon: TrendingUp,
    },
    {
      label: "Unique Customers",
      value: overview?.customers ?? "—",
      icon: Users,
    },
  ];

  return (
    <Layout title="Advanced Analytics">
      <div className="space-y-6">
        {/* Period Selector */}
        <div className="flex gap-2">
          {PERIODS.map((p) => (
            <Button
              key={p.key}
              size="sm"
              variant={period === p.key ? "default" : "outline"}
              onClick={() => setPeriod(p.key)}
              className={
                period === p.key ? "bg-[#FF2B2B] hover:bg-[#cc2222] text-white" : ""
              }
            >
              {p.label}
            </Button>
          ))}
        </div>

        {/* KPI Cards */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {kpis.map((kpi, i) => (
            <motion.div
              key={kpi.label}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.08 }}
            >
              <GlassCard className="p-5 relative overflow-hidden group">
                <div className="absolute top-0 right-0 p-3 opacity-5 group-hover:opacity-10 transition-opacity">
                  <kpi.icon className="w-14 h-14 text-[#FF2B2B]" />
                </div>
                <p className="text-xs text-muted-foreground mb-2">{kpi.label}</p>
                <p className="text-2xl font-bold text-foreground">{kpi.value}</p>
                {kpi.change !== undefined && (
                  <div
                    className={`flex items-center gap-1 text-xs mt-1 ${kpi.change >= 0 ? "text-green-500" : "text-red-500"}`}
                  >
                    {kpi.change >= 0 ? (
                      <TrendingUp className="w-3 h-3" />
                    ) : (
                      <TrendingDown className="w-3 h-3" />
                    )}
                    {Math.abs(kpi.change).toFixed(1)}% vs last period
                  </div>
                )}
              </GlassCard>
            </motion.div>
          ))}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Revenue Area Chart */}
          <GlassCard className="p-6 lg:col-span-2">
            <h3 className="font-serif font-bold text-base mb-5">Revenue Trend</h3>
            <div className="h-64">
              {revenueData ? (
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={revenueData}>
                    <defs>
                      <linearGradient id="aGrad" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#FF2B2B" stopOpacity={0.3} />
                        <stop offset="95%" stopColor="#FF2B2B" stopOpacity={0} />
                      </linearGradient>
                    </defs>
                    <XAxis
                      dataKey="label"
                      tick={{ fill: "#888", fontSize: 11 }}
                      axisLine={false}
                      tickLine={false}
                    />
                    <YAxis
                      tick={{ fill: "#888", fontSize: 11 }}
                      axisLine={false}
                      tickLine={false}
                      tickFormatter={(v) => `₹${(v / 1000).toFixed(0)}k`}
                    />
                    <Tooltip content={<CustomTooltip />} />
                    <Area
                      type="monotone"
                      dataKey="value"
                      name="Revenue"
                      stroke="#FF2B2B"
                      fill="url(#aGrad)"
                      strokeWidth={2.5}
                      dot={false}
                    />
                  </AreaChart>
                </ResponsiveContainer>
              ) : (
                <div className="h-full flex items-center justify-center text-muted-foreground text-sm">
                  Loading chart...
                </div>
              )}
            </div>
          </GlassCard>

          {/* Category Pie Chart */}
          <GlassCard className="p-6">
            <h3 className="font-serif font-bold text-base mb-5">Sales by Category</h3>
            <div className="h-52">
              {categoryData?.length ? (
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={categoryData}
                      dataKey="revenue"
                      nameKey="category"
                      cx="50%"
                      cy="50%"
                      innerRadius={55}
                      outerRadius={90}
                      paddingAngle={3}
                    >
                      {categoryData.map((_, i) => (
                        <Cell key={i} fill={CHART_COLORS[i % CHART_COLORS.length]} />
                      ))}
                    </Pie>
                    <Tooltip content={<CustomTooltip />} />
                    <Legend
                      formatter={(value) => (
                        <span className="text-xs text-muted-foreground">{value}</span>
                      )}
                    />
                  </PieChart>
                </ResponsiveContainer>
              ) : (
                <div className="h-full flex items-center justify-center text-muted-foreground text-sm">
                  No data
                </div>
              )}
            </div>
          </GlassCard>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Top Selling Items */}
          <GlassCard className="p-6">
            <h3 className="font-serif font-bold text-base mb-5 flex items-center gap-2">
              <Star className="w-4 h-4 text-yellow-400 fill-yellow-400" /> Top Selling Dishes
            </h3>
            <div className="space-y-4">
              {topSelling?.map((item, i) => (
                <div key={item.name} className="flex items-center gap-3">
                  <span className="text-2xl font-bold text-[#FF2B2B]/30 w-6 text-center">
                    {i + 1}
                  </span>
                  <div className="flex-1">
                    <div className="flex justify-between mb-1">
                      <span className="text-sm font-medium text-foreground">{item.name}</span>
                      <span className="text-xs text-muted-foreground">
                        {item.orderCount} sold
                      </span>
                    </div>
                    <div className="bg-white/5 rounded-full h-1.5 overflow-hidden">
                      <motion.div
                        initial={{ width: 0 }}
                        animate={{
                          width: `${(item.orderCount / (topSelling[0]?.orderCount || 1)) * 100}%`,
                        }}
                        transition={{ duration: 0.8, delay: i * 0.1 }}
                        className="h-full bg-gradient-to-r from-[#FF2B2B] to-[#ff6b6b] rounded-full"
                      />
                    </div>
                  </div>
                  <span className="text-sm font-bold text-[#FF2B2B] w-20 text-right">
                    ₹{Number(item.revenue ?? 0).toLocaleString()}
                  </span>
                </div>
              ))}
              {!topSelling?.length && (
                <p className="text-muted-foreground text-sm text-center py-6">
                  No data available
                </p>
              )}
            </div>
          </GlassCard>

          {/* Peak Hours Bar Chart */}
          <GlassCard className="p-6">
            <h3 className="font-serif font-bold text-base mb-5">Peak Order Hours</h3>
            <div className="h-52">
              {peakHours?.length ? (
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={peakHours} barSize={14}>
                    <XAxis
                      dataKey="hour"
                      tick={{ fill: "#888", fontSize: 10 }}
                      axisLine={false}
                      tickLine={false}
                    />
                    <YAxis
                      tick={{ fill: "#888", fontSize: 10 }}
                      axisLine={false}
                      tickLine={false}
                    />
                    <Tooltip content={<CustomTooltip />} />
                    <Bar dataKey="orders" name="Orders" radius={[4, 4, 0, 0]}>
                      {peakHours.map((entry, i) => (
                        <Cell
                          key={i}
                          fill={
                            entry.orders ===
                            Math.max(...peakHours.map((p) => p.orders))
                              ? "#FF2B2B"
                              : "#FF2B2B44"
                          }
                        />
                      ))}
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
              ) : (
                <div className="h-full flex items-center justify-center text-muted-foreground text-sm">
                  No data
                </div>
              )}
            </div>
          </GlassCard>
        </div>
      </div>
    </Layout>
  );
}
