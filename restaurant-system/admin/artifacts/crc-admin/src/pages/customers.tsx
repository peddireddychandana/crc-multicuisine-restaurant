import { Layout } from "@/components/layout/Layout";
import { GlassCard } from "@/components/ui/glass-card";
import {
  useGetCustomers,
  useGetTopCustomers,
} from "@workspace/api-client-react";
import { motion } from "framer-motion";
import { Users, Crown, Phone, Mail, ShoppingBag, TrendingUp } from "lucide-react";
import { Badge } from "@/components/ui/badge";

export default function Customers() {
  const { data: customersData, isLoading } = useGetCustomers();
  const { data: topCustomers } = useGetTopCustomers();
  const customers = customersData?.customers || [];

  return (
    <Layout title="Customer Management">
      <div className="space-y-6">
        {/* Stats Row */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {[
            { label: "Total Customers", value: customers.length, icon: Users, color: "text-foreground" },
            { label: "Total Revenue", value: `₹${customers.reduce((s, c) => s + (c.totalSpent || 0), 0).toLocaleString()}`, icon: TrendingUp, color: "text-[#FF2B2B]" },
            { label: "Total Orders", value: customers.reduce((s, c) => s + (c.totalOrders || 0), 0), icon: ShoppingBag, color: "text-blue-400" },
            { label: "Avg Spend/Customer", value: customers.length ? `₹${Math.round(customers.reduce((s, c) => s + (c.totalSpent || 0), 0) / customers.length).toLocaleString()}` : "₹0", icon: Crown, color: "text-yellow-400" },
          ].map((stat) => (
            <GlassCard key={stat.label} className="p-5 flex items-center gap-4">
              <div className="w-10 h-10 rounded-xl bg-white/5 flex items-center justify-center shrink-0">
                <stat.icon className={`w-5 h-5 ${stat.color}`} />
              </div>
              <div>
                <p className="text-xs text-muted-foreground">{stat.label}</p>
                <p className={`text-xl font-bold ${stat.color}`}>{stat.value}</p>
              </div>
            </GlassCard>
          ))}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Top Customers Panel */}
          <GlassCard highlighted className="p-6 lg:col-span-1">
            <h3 className="font-serif font-bold text-base mb-4 flex items-center gap-2">
              <Crown className="w-5 h-5 text-yellow-400 fill-yellow-400" />
              Top Spenders
            </h3>
            <div className="space-y-3">
              {topCustomers?.slice(0, 5).map((c, i) => (
                <motion.div
                  key={c.id}
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: i * 0.1 }}
                  className="flex items-center gap-3"
                >
                  <div className="relative">
                    <div className="w-9 h-9 rounded-full bg-gradient-to-br from-[#FF2B2B]/40 to-[#FF2B2B]/10 flex items-center justify-center font-bold text-[#FF2B2B]">
                      {c.name[0].toUpperCase()}
                    </div>
                    {i === 0 && (
                      <Crown className="w-3 h-3 text-yellow-400 fill-yellow-400 absolute -top-1 -right-1" />
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-foreground truncate">{c.name}</p>
                    <p className="text-xs text-muted-foreground">{c.totalOrders} orders</p>
                  </div>
                  <span className="text-sm font-bold text-[#FF2B2B]">
                    ₹{(c.totalSpent || 0).toLocaleString()}
                  </span>
                </motion.div>
              ))}
              {!topCustomers?.length && (
                <p className="text-sm text-muted-foreground text-center py-4">No data yet</p>
              )}
            </div>
          </GlassCard>

          {/* Customers Table */}
          <div className="lg:col-span-2 space-y-4">
            {isLoading ? (
              <div className="space-y-3">
                {[...Array(5)].map((_, i) => (
                  <GlassCard key={i} className="h-20 animate-pulse"><span /></GlassCard>
                ))}
              </div>
            ) : (
              <div className="space-y-3">
                {customers.map((customer, i) => (
                  <motion.div
                    key={customer.id}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: i * 0.04 }}
                  >
                    <GlassCard className="p-4 flex items-center gap-4">
                      <div className="w-11 h-11 rounded-full bg-gradient-to-br from-[#FF2B2B]/30 to-[#FF2B2B]/5 flex items-center justify-center font-bold text-[#FF2B2B] text-lg shrink-0">
                        {customer.name[0].toUpperCase()}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 flex-wrap">
                          <p className="font-semibold text-foreground">{customer.name}</p>
                          {(customer.totalOrders || 0) >= 5 && (
                            <Badge className="text-xs bg-yellow-400/10 text-yellow-400 border-yellow-400/20">
                              Loyal
                            </Badge>
                          )}
                        </div>
                        <div className="flex items-center gap-4 mt-1 flex-wrap">
                          {customer.phone && (
                            <span className="flex items-center gap-1 text-xs text-muted-foreground">
                              <Phone className="w-3 h-3" /> {customer.phone}
                            </span>
                          )}
                          {customer.email && (
                            <span className="flex items-center gap-1 text-xs text-muted-foreground">
                              <Mail className="w-3 h-3" /> {customer.email}
                            </span>
                          )}
                        </div>
                      </div>
                      <div className="text-right shrink-0">
                        <p className="text-sm font-bold text-[#FF2B2B]">
                          ₹{(customer.totalSpent || 0).toLocaleString()}
                        </p>
                        <p className="text-xs text-muted-foreground">
                          {customer.totalOrders || 0} orders
                        </p>
                      </div>
                    </GlassCard>
                  </motion.div>
                ))}

                {!customers.length && (
                  <div className="text-center py-16 text-muted-foreground">
                    <Users className="w-10 h-10 mx-auto mb-3 opacity-30" />
                    <p>No customers found</p>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      </div>
    </Layout>
  );
}
