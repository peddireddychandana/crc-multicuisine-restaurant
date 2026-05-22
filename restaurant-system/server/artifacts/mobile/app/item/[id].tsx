import React, { useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Pressable,
  Image,
  Platform,
} from "react-native";
import { Feather } from "@expo/vector-icons";
import { useLocalSearchParams, useRouter, Stack } from "expo-router";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import * as Haptics from "expo-haptics";
import { useColors } from "@/hooks/useColors";
import { useCart } from "@/context/CartContext";
import { useApiData } from "@/hooks/useApiData";
import OrderStatusBadge from "@/components/OrderStatusBadge";

const BASE_URL = `https://${process.env["EXPO_PUBLIC_DOMAIN"]}`;

export default function ItemDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const colors = useColors();
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const { addItem, items, updateQuantity } = useCart();

  const { data, loading } = useApiData<{ data: Record<string, unknown> }>(`${BASE_URL}/api/menu/${id}`);
  const item = data?.data as {
    _id: string; name: string; description: string; price: number; image: string;
    isVeg: boolean; isBestseller: boolean; spicyLevel: string; ratings: number;
    totalReviews: number; preparationTime: number; calories?: number;
    ingredients: string[]; tags: string[];
    category: { name: string };
  } | undefined;

  const cartItem = item ? items.find((i) => i.id === item._id) : undefined;
  const qty = cartItem?.quantity ?? 0;

  const handleAdd = () => {
    if (!item) return;
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    addItem({ id: item._id, name: item.name, price: item.price, image: item.image });
  };

  const handleDecrement = () => {
    if (!item) return;
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    updateQuantity(item._id, qty - 1);
  };

  const topPad = Platform.OS === "web" ? 67 : insets.top;

  if (loading || !item) {
    return (
      <View style={[styles.container, { backgroundColor: colors.background }]}>
        <Stack.Screen options={{ headerShown: false }} />
        <View style={[styles.loadingHeader, { paddingTop: topPad + 12 }]}>
          <Pressable onPress={() => router.back()}>
            <Feather name="arrow-left" size={22} color={colors.foreground} />
          </Pressable>
        </View>
        <View style={styles.loading}>
          <Feather name="loader" size={32} color={colors.mutedForeground} />
        </View>
      </View>
    );
  }

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <Stack.Screen options={{ headerShown: false }} />
      <ScrollView contentContainerStyle={{ paddingBottom: 120 }}>
        <Image
          source={{ uri: item.image || "https://via.placeholder.com/400x260?text=Food" }}
          style={styles.heroImage}
          resizeMode="cover"
        />
        <Pressable
          style={[styles.backBtn, { top: topPad + 12, backgroundColor: "rgba(0,0,0,0.35)" }]}
          onPress={() => router.back()}
        >
          <Feather name="arrow-left" size={20} color="#fff" />
        </Pressable>

        <View style={[styles.content, { backgroundColor: colors.background }]}>
          {/* Title row */}
          <View style={styles.titleRow}>
            <View style={[styles.vegDot, { borderColor: item.isVeg ? "#4CAF50" : "#F44336" }]}>
              <View style={[styles.vegInner, { backgroundColor: item.isVeg ? "#4CAF50" : "#F44336" }]} />
            </View>
            <Text style={[styles.name, { color: colors.foreground }]}>{item.name}</Text>
          </View>

          {/* Tags */}
          <View style={styles.tags}>
            {item.isBestseller && (
              <View style={[styles.tag, { backgroundColor: colors.goldLight }]}>
                <Text style={[styles.tagText, { color: colors.gold }]}>Bestseller</Text>
              </View>
            )}
            {item.category && (
              <View style={[styles.tag, { backgroundColor: colors.secondary }]}>
                <Text style={[styles.tagText, { color: colors.mutedForeground }]}>{item.category.name}</Text>
              </View>
            )}
          </View>

          {/* Stats */}
          <View style={[styles.stats, { backgroundColor: colors.surface, borderColor: colors.border }]}>
            <View style={styles.stat}>
              <Feather name="star" size={16} color={colors.gold} />
              <Text style={[styles.statValue, { color: colors.foreground }]}>{item.ratings > 0 ? item.ratings.toFixed(1) : "New"}</Text>
              <Text style={[styles.statLabel, { color: colors.mutedForeground }]}>{item.totalReviews} reviews</Text>
            </View>
            <View style={[styles.statDivider, { backgroundColor: colors.border }]} />
            <View style={styles.stat}>
              <Feather name="clock" size={16} color={colors.mutedForeground} />
              <Text style={[styles.statValue, { color: colors.foreground }]}>{item.preparationTime}m</Text>
              <Text style={[styles.statLabel, { color: colors.mutedForeground }]}>prep time</Text>
            </View>
            {item.calories && (
              <>
                <View style={[styles.statDivider, { backgroundColor: colors.border }]} />
                <View style={styles.stat}>
                  <Feather name="zap" size={16} color={colors.mutedForeground} />
                  <Text style={[styles.statValue, { color: colors.foreground }]}>{item.calories}</Text>
                  <Text style={[styles.statLabel, { color: colors.mutedForeground }]}>kcal</Text>
                </View>
              </>
            )}
          </View>

          {/* Description */}
          <Text style={[styles.desc, { color: colors.mutedForeground }]}>{item.description}</Text>

          {/* Ingredients */}
          {item.ingredients?.length > 0 && (
            <View>
              <Text style={[styles.sectionTitle, { color: colors.foreground }]}>Ingredients</Text>
              <View style={styles.ingredientsList}>
                {item.ingredients.map((ing, i) => (
                  <View key={i} style={[styles.ingredient, { backgroundColor: colors.secondary, borderColor: colors.border }]}>
                    <Text style={[styles.ingredientText, { color: colors.foreground }]}>{ing}</Text>
                  </View>
                ))}
              </View>
            </View>
          )}
        </View>
      </ScrollView>

      {/* Add to Cart Footer */}
      <View style={[styles.footer, { paddingBottom: insets.bottom + 16, backgroundColor: colors.background, borderTopColor: colors.border }]}>
        <Text style={[styles.price, { color: colors.foreground }]}>₹{item.price}</Text>
        {qty === 0 ? (
          <Pressable style={[styles.addBtn, { backgroundColor: colors.primary }]} onPress={handleAdd}>
            <Text style={styles.addBtnText}>Add to Cart</Text>
          </Pressable>
        ) : (
          <View style={[styles.qtyControl, { borderColor: colors.primary }]}>
            <Pressable onPress={handleDecrement} style={styles.qtyBtn}>
              <Feather name="minus" size={16} color={colors.primary} />
            </Pressable>
            <Text style={[styles.qtyText, { color: colors.primary }]}>{qty}</Text>
            <Pressable onPress={handleAdd} style={styles.qtyBtn}>
              <Feather name="plus" size={16} color={colors.primary} />
            </Pressable>
          </View>
        )}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  loadingHeader: { paddingHorizontal: 20, paddingBottom: 12 },
  loading: { flex: 1, alignItems: "center", justifyContent: "center" },
  heroImage: { width: "100%", height: 260 },
  backBtn: { position: "absolute", left: 16, width: 38, height: 38, borderRadius: 19, alignItems: "center", justifyContent: "center" },
  content: { padding: 20, gap: 14 },
  titleRow: { flexDirection: "row", alignItems: "center", gap: 10 },
  vegDot: { width: 16, height: 16, borderRadius: 2, borderWidth: 2, alignItems: "center", justifyContent: "center" },
  vegInner: { width: 8, height: 8, borderRadius: 1 },
  name: { flex: 1, fontSize: 22, fontWeight: "900", lineHeight: 28 },
  tags: { flexDirection: "row", flexWrap: "wrap", gap: 8 },
  tag: { paddingHorizontal: 10, paddingVertical: 4, borderRadius: 8 },
  tagText: { fontSize: 12, fontWeight: "600" },
  stats: { flexDirection: "row", borderRadius: 14, borderWidth: 1, padding: 16 },
  stat: { flex: 1, alignItems: "center", gap: 2 },
  statValue: { fontSize: 15, fontWeight: "800" },
  statLabel: { fontSize: 11 },
  statDivider: { width: 1, marginHorizontal: 8 },
  desc: { fontSize: 14, lineHeight: 22 },
  sectionTitle: { fontSize: 16, fontWeight: "800", marginBottom: 10 },
  ingredientsList: { flexDirection: "row", flexWrap: "wrap", gap: 8 },
  ingredient: { paddingHorizontal: 12, paddingVertical: 6, borderRadius: 20, borderWidth: 1 },
  ingredientText: { fontSize: 13 },
  footer: { position: "absolute", bottom: 0, left: 0, right: 0, flexDirection: "row", alignItems: "center", justifyContent: "space-between", paddingHorizontal: 20, paddingTop: 16, borderTopWidth: 1 },
  price: { fontSize: 24, fontWeight: "900" },
  addBtn: { flex: 1, marginLeft: 20, padding: 14, borderRadius: 12, alignItems: "center" },
  addBtnText: { color: "#fff", fontSize: 15, fontWeight: "800" },
  qtyControl: { flexDirection: "row", alignItems: "center", borderWidth: 2, borderRadius: 12 },
  qtyBtn: { paddingHorizontal: 16, paddingVertical: 12 },
  qtyText: { fontSize: 16, fontWeight: "800", minWidth: 28, textAlign: "center" },
});
