import React from "react";
import { View, Text, StyleSheet } from "react-native";

const STATUS_CONFIG: Record<string, { label: string; color: string; bg: string }> = {
  pending: { label: "Pending", color: "#F59E0B", bg: "#FEF3C7" },
  accepted: { label: "Accepted", color: "#3B82F6", bg: "#EFF6FF" },
  preparing: { label: "Preparing", color: "#8B5CF6", bg: "#F5F3FF" },
  cooking: { label: "Cooking", color: "#F97316", bg: "#FFF7ED" },
  ready: { label: "Ready!", color: "#10B981", bg: "#ECFDF5" },
  served: { label: "Served", color: "#059669", bg: "#D1FAE5" },
  completed: { label: "Completed", color: "#6B7280", bg: "#F3F4F6" },
  cancelled: { label: "Cancelled", color: "#EF4444", bg: "#FEE2E2" },
};

export default function OrderStatusBadge({ status }: { status: string }) {
  const config = STATUS_CONFIG[status] || STATUS_CONFIG["pending"];
  return (
    <View style={[styles.badge, { backgroundColor: config.bg }]}>
      <View style={[styles.dot, { backgroundColor: config.color }]} />
      <Text style={[styles.text, { color: config.color }]}>{config.label}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  badge: { flexDirection: "row", alignItems: "center", paddingHorizontal: 10, paddingVertical: 5, borderRadius: 20, gap: 5 },
  dot: { width: 6, height: 6, borderRadius: 3 },
  text: { fontSize: 12, fontWeight: "700" },
});
