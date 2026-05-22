import React from "react";
import { View, Text, StyleSheet, Pressable, Image } from "react-native";
import { Feather } from "@expo/vector-icons";
import * as Haptics from "expo-haptics";
import { useColors } from "@/hooks/useColors";
import { useCart } from "@/context/CartContext";

export interface MenuItem {
  _id: string;
  name: string;
  description: string;
  price: number;
  image: string;
  isVeg: boolean;
  isBestseller: boolean;
  spicyLevel: string;
  ratings: number;
  totalReviews: number;
  preparationTime: number;
  category: { name: string; slug: string } | string;
}

interface MenuCardProps {
  item: MenuItem;
  onPress: () => void;
}

const SPICE_COLORS: Record<string, string> = {
  mild: "#4CAF50",
  medium: "#FF9800",
  hot: "#F44336",
  extra_hot: "#B71C1C",
};

export default function MenuCard({ item, onPress }: MenuCardProps) {
  const colors = useColors();
  const { addItem, items, updateQuantity } = useCart();

  const cartItem = items.find((i) => i.id === item._id);
  const qty = cartItem?.quantity ?? 0;

  const handleAdd = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    addItem({ id: item._id, name: item.name, price: item.price, image: item.image });
  };

  const handleDecrement = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    updateQuantity(item._id, qty - 1);
  };

  return (
    <Pressable style={[styles.card, { backgroundColor: colors.card, borderColor: colors.border }]} onPress={onPress}>
      <Image
        source={{ uri: item.image || "https://via.placeholder.com/120x90?text=Food" }}
        style={styles.image}
        resizeMode="cover"
      />
      <View style={styles.body}>
        <View style={styles.header}>
          <View style={[styles.vegDot, { borderColor: item.isVeg ? "#4CAF50" : "#F44336" }]}>
            <View style={[styles.vegInner, { backgroundColor: item.isVeg ? "#4CAF50" : "#F44336" }]} />
          </View>
          {item.isBestseller && (
            <View style={[styles.badge, { backgroundColor: colors.gold }]}>
              <Text style={styles.badgeText}>Bestseller</Text>
            </View>
          )}
        </View>
        <Text style={[styles.name, { color: colors.foreground }]} numberOfLines={1}>{item.name}</Text>
        <Text style={[styles.desc, { color: colors.mutedForeground }]} numberOfLines={2}>{item.description}</Text>
        <View style={styles.meta}>
          <View style={styles.metaRow}>
            <Feather name="star" size={11} color={colors.gold} />
            <Text style={[styles.metaText, { color: colors.mutedForeground }]}>{item.ratings > 0 ? item.ratings.toFixed(1) : "New"}</Text>
            <View style={[styles.spiceTag, { backgroundColor: SPICE_COLORS[item.spicyLevel] + "20" }]}>
              <Text style={[styles.spiceText, { color: SPICE_COLORS[item.spicyLevel] }]}>{item.spicyLevel.replace("_", " ")}</Text>
            </View>
          </View>
          <View style={styles.metaRow}>
            <Feather name="clock" size={11} color={colors.mutedForeground} />
            <Text style={[styles.metaText, { color: colors.mutedForeground }]}>{item.preparationTime}m</Text>
          </View>
        </View>
        <View style={styles.footer}>
          <Text style={[styles.price, { color: colors.foreground }]}>₹{item.price}</Text>
          {qty === 0 ? (
            <Pressable style={[styles.addBtn, { backgroundColor: colors.primary }]} onPress={handleAdd}>
              <Text style={styles.addBtnText}>ADD</Text>
            </Pressable>
          ) : (
            <View style={[styles.qtyControl, { borderColor: colors.primary }]}>
              <Pressable onPress={handleDecrement} style={styles.qtyBtn}>
                <Feather name="minus" size={14} color={colors.primary} />
              </Pressable>
              <Text style={[styles.qtyText, { color: colors.primary }]}>{qty}</Text>
              <Pressable onPress={handleAdd} style={styles.qtyBtn}>
                <Feather name="plus" size={14} color={colors.primary} />
              </Pressable>
            </View>
          )}
        </View>
      </View>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  card: { flexDirection: "row", borderRadius: 14, borderWidth: 1, marginBottom: 12, overflow: "hidden" },
  image: { width: 110, height: "100%" as unknown as number },
  body: { flex: 1, padding: 12, gap: 4 },
  header: { flexDirection: "row", alignItems: "center", gap: 8 },
  vegDot: { width: 14, height: 14, borderRadius: 2, borderWidth: 1.5, alignItems: "center", justifyContent: "center" },
  vegInner: { width: 7, height: 7, borderRadius: 1 },
  badge: { paddingHorizontal: 6, paddingVertical: 2, borderRadius: 4 },
  badgeText: { fontSize: 9, fontWeight: "700", color: "#fff", textTransform: "uppercase" },
  name: { fontSize: 14, fontWeight: "700", lineHeight: 18 },
  desc: { fontSize: 12, lineHeight: 16 },
  meta: { gap: 2, marginTop: 2 },
  metaRow: { flexDirection: "row", alignItems: "center", gap: 4 },
  metaText: { fontSize: 11 },
  spiceTag: { paddingHorizontal: 5, paddingVertical: 1, borderRadius: 4 },
  spiceText: { fontSize: 10, fontWeight: "600", textTransform: "capitalize" },
  footer: { flexDirection: "row", alignItems: "center", justifyContent: "space-between", marginTop: 6 },
  price: { fontSize: 16, fontWeight: "800" },
  addBtn: { paddingHorizontal: 16, paddingVertical: 6, borderRadius: 8 },
  addBtnText: { color: "#fff", fontSize: 12, fontWeight: "800", letterSpacing: 0.5 },
  qtyControl: { flexDirection: "row", alignItems: "center", borderWidth: 1.5, borderRadius: 8, overflow: "hidden" },
  qtyBtn: { paddingHorizontal: 10, paddingVertical: 6 },
  qtyText: { fontSize: 13, fontWeight: "700", minWidth: 20, textAlign: "center" },
});
