import { Layout } from "@/components/layout/Layout";
import { GlassCard } from "@/components/ui/glass-card";
import { useGetTables } from "@workspace/api-client-react";
import { motion } from "framer-motion";

export default function Tables() {
  const { data: tables } = useGetTables();

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'available': return 'border-green-500/50 shadow-[0_0_15px_rgba(34,197,94,0.2)] text-green-500';
      case 'occupied': return 'border-red-500/50 shadow-[0_0_15px_rgba(239,68,68,0.2)] text-red-500';
      case 'reserved': return 'border-amber-500/50 shadow-[0_0_15px_rgba(245,158,11,0.2)] text-amber-500';
      case 'cleaning': return 'border-blue-500/50 shadow-[0_0_15px_rgba(59,130,246,0.2)] text-blue-500';
      default: return 'border-white/10 text-muted-foreground';
    }
  };

  return (
    <Layout title="Floor Plan">
      <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-6">
        {tables?.map((table, i) => (
          <motion.div
            key={table.id}
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: i * 0.05 }}
          >
            <GlassCard className={`p-6 flex flex-col items-center justify-center text-center cursor-pointer transition-all hover:scale-105 ${getStatusColor(table.status).split(' ')[0]} ${getStatusColor(table.status).split(' ')[1]}`}>
              <span className="text-3xl font-bold font-serif mb-2">T{table.tableNumber}</span>
              <span className={`text-xs uppercase tracking-wider font-medium ${getStatusColor(table.status).split(' ')[2]}`}>
                {table.status}
              </span>
              <div className="text-xs text-muted-foreground mt-2">
                Seats: {table.capacity}
              </div>
            </GlassCard>
          </motion.div>
        ))}
      </div>
    </Layout>
  );
}
