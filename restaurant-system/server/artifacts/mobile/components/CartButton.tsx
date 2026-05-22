import React from "react";
import { View, Text, StyleSheet, Pressable } from "react-native";
import { Feather } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import { useColors } from "@/hooks/useColors";
import { useCart } from "@/context/CartContext";

export default function CartButton() {
  const colors = useColors();
  const { totalItems, totalAmount } = useCart();
  const router = useRouter();

  if (totalItems === 0) return null;

  return (
    <Pressable
      style={[styles.container, { backgroundColor: colors.primary }]}
      onPress={() => router.push("/cart")}
    >
      <View style={[styles.badge, { backgroundColor: colors.gold }]}>
        <Text style={styles.badgeText}>{totalItems}</Text>
      </View>
      <Text style={styles.label}>View Cart</Text>
      <Text style={styles.amount}>₹{totalAmount.toFixed(0)}</Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  container: {
    position: "absolute",
    bottom: 90,
    left: 20,
    right: 20,
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 20,
    paddingVertical: 14,
    borderRadius: 14,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.25,
    shadowRadius: 12,
    elevation: 8,
  },
  badge: {
    width: 24,
    height: 24,
    borderRadius: 12,
    alignItems: "center",
    justifyContent: "center",
    marginRight: 12,
  },
  badgeText: { color: "#fff", fontSize: 12, fontWeight: "800" },
  label: { flex: 1, color: "#fff", fontSize: 15, fontWeight: "700" },
  amount: { color: "#fff", fontSize: 15, fontWeight: "800" },
});
