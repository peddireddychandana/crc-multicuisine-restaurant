import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  RefreshControl,
  Platform,
  Pressable,
} from "react-native";
import { Feather } from "@expo/vector-icons";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useColors } from "@/hooks/useColors";
import { useOrder } from "@/context/OrderContext";
import OrderStatusBadge from "@/components/OrderStatusBadge";
import AsyncStorage from "@react-native-async-storage/async-storage";

const ORDER_STEPS = ["pending", "accepted", "preparing", "cooking", "ready", "served", "completed"];

export default function OrdersScreen() {
  const colors = useColors();
  const insets = useSafeAreaInsets();
  const { currentOrder, setCurrentOrder } = useOrder();
  const [refreshing, setRefreshing] = useState(false);
  const topPad = Platform.OS === "web" ? 67 : insets.top;

  useEffect(() => {
    AsyncStorage.getItem("currentOrder").then((stored) => {
      if (stored && !currentOrder) setCurrentOrder(JSON.parse(stored));
    });
  }, []);

  const onRefresh = async () => {
    setRefreshing(true);
    await new Promise((r) => setTimeout(r, 1000));
    setRefreshing(false);
  };

  const stepIndex = currentOrder ? ORDER_STEPS.indexOf(currentOrder.status) : -1;

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <View style={[styles.header, { paddingTop: topPad + 16, backgroundColor: colors.surface, borderBottomColor: colors.border }]}>
        <Text style={[styles.title, { color: colors.foreground }]}>My Order</Text>
      </View>

      <ScrollView
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={colors.primary} />}
        contentContainerStyle={{ padding: 20, paddingBottom: Platform.OS === "web" ? 34 : 100 }}
      >
        {!currentOrder ? (
          <View style={styles.empty}>
            <Feather name="shopping-bag" size={56} color={colors.mutedForeground} />
            <Text style={[styles.emptyTitle, { color: colors.foreground }]}>No active order</Text>
            <Text style={[styles.emptyDesc, { color: colors.mutedForeground }]}>Place an order from the menu to track it here</Text>
          </View>
        ) : (
          <>
            {/* Order Card */}
            <View style={[styles.orderCard, { backgroundColor: colors.card, borderColor: colors.border }]}>
              <View style={styles.orderRow}>
                <Text style={[styles.orderId, { color: colors.mutedForeground }]}>{currentOrder.orderId}</Text>
                <OrderStatusBadge status={currentOrder.status} />
              </View>
              <View style={styles.divider} />
              <View style={styles.orderDetails}>
                <View style={styles.detailRow}>
                  <Feather name="user" size={14} color={colors.mutedForeground} />
                  <Text style={[styles.detailText, { color: colors.foreground }]}>{currentOrder.customerName}</Text>
                </View>
                <View style={styles.detailRow}>
                  <Feather name="grid" size={14} color={colors.mutedForeground} />
                  <Text style={[styles.detailText, { color: colors.foreground }]}>Table {currentOrder.tableNumber}</Text>
                </View>
                <View style={styles.detailRow}>
                  <Feather name="tag" size={14} color={colors.mutedForeground} />
                  <Text style={[styles.detailText, { color: colors.foreground }]}>₹{currentOrder.finalAmount?.toFixed(0)}</Text>
                </View>
              </View>
            </View>

            {/* Progress Tracker */}
            {currentOrder.status !== "cancelled" && (
              <View style={[styles.progressCard, { backgroundColor: colors.card, borderColor: colors.border }]}>
                <Text style={[styles.progressTitle, { color: colors.foreground }]}>Order Progress</Text>
                {ORDER_STEPS.filter((s) => s !== "served").map((step, idx) => {
                  const done = stepIndex > idx;
                  const active = stepIndex === idx;
                  return (
                    <View key={step} style={styles.stepRow}>
                      <View style={styles.stepLeft}>
                        <View style={[
                          styles.stepDot,
                          done && { backgroundColor: colors.primary },
                          active && { backgroundColor: colors.accent, borderColor: colors.primary },
                          !done && !active && { backgroundColor: colors.muted, borderColor: colors.border },
                        ]}>
                          {done && <Feather name="check" size={10} color="#fff" />}
                          {active && <View style={[styles.activePulse, { backgroundColor: colors.primary }]} />}
                        </View>
                        {idx < ORDER_STEPS.filter((s) => s !== "served").length - 1 && (
                          <View style={[styles.stepLine, { backgroundColor: done ? colors.primary : colors.border }]} />
                        )}
                      </View>
                      <Text style={[
                        styles.stepLabel,
                        { color: active ? colors.primary : done ? colors.foreground : colors.mutedForeground },
                        active && { fontWeight: "800" },
                      ]}>
                        {step.charAt(0).toUpperCase() + step.slice(1)}
                      </Text>
                    </View>
                  );
                })}
              </View>
            )}

            {/* Clear */}
            {(currentOrder.status === "completed" || currentOrder.status === "cancelled") && (
              <Pressable
                style={[styles.clearBtn, { borderColor: colors.border }]}
                onPress={() => setCurrentOrder(null)}
              >
                <Text style={[styles.clearText, { color: colors.mutedForeground }]}>Clear Order History</Text>
              </Pressable>
            )}
          </>
        )}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  header: { paddingHorizontal: 20, paddingBottom: 16, borderBottomWidth: 1 },
  title: { fontSize: 22, fontWeight: "900" },
  empty: { alignItems: "center", paddingVertical: 80, gap: 12 },
  emptyTitle: { fontSize: 18, fontWeight: "700" },
  emptyDesc: { fontSize: 13, textAlign: "center", lineHeight: 20 },
  orderCard: { borderRadius: 16, borderWidth: 1, padding: 16, marginBottom: 16 },
  orderRow: { flexDirection: "row", justifyContent: "space-between", alignItems: "center" },
  orderId: { fontSize: 12, fontWeight: "600" },
  divider: { height: 1, backgroundColor: "#E8D8C8", marginVertical: 12 },
  orderDetails: { gap: 8 },
  detailRow: { flexDirection: "row", alignItems: "center", gap: 10 },
  detailText: { fontSize: 14, fontWeight: "600" },
  progressCard: { borderRadius: 16, borderWidth: 1, padding: 20, marginBottom: 16 },
  progressTitle: { fontSize: 16, fontWeight: "800", marginBottom: 16 },
  stepRow: { flexDirection: "row", alignItems: "flex-start", marginBottom: 0 },
  stepLeft: { alignItems: "center", marginRight: 14 },
  stepDot: { width: 22, height: 22, borderRadius: 11, borderWidth: 2, alignItems: "center", justifyContent: "center" },
  activePulse: { width: 8, height: 8, borderRadius: 4 },
  stepLine: { width: 2, height: 28, marginTop: 2 },
  stepLabel: { fontSize: 14, paddingTop: 2, paddingBottom: 28 },
  clearBtn: { borderWidth: 1, borderRadius: 12, padding: 14, alignItems: "center" },
  clearText: { fontSize: 14, fontWeight: "600" },
});
