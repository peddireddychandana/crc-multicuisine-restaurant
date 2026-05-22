import React, { useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TextInput,
  Pressable,
  Alert,
  ActivityIndicator,
  Platform,
} from "react-native";
import { Feather } from "@expo/vector-icons";
import { useRouter, Stack } from "expo-router";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import * as Haptics from "expo-haptics";
import { useColors } from "@/hooks/useColors";
import { useCart } from "@/context/CartContext";
import { useOrder } from "@/context/OrderContext";

const BASE_URL = `https://${process.env["EXPO_PUBLIC_DOMAIN"]}`;
const GST_RATE = 0.05;

export default function CartScreen() {
  const colors = useColors();
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const { items, updateQuantity, removeItem, clearCart, totalAmount } = useCart();
  const { setCurrentOrder, tableNumber, setTableNumber, customerName, setCustomerName } = useOrder();
  const [notes, setNotes] = useState("");
  const [loading, setLoading] = useState(false);

  const gst = totalAmount * GST_RATE;
  const finalAmount = totalAmount + gst;

  const handlePlaceOrder = async () => {
    if (!customerName.trim()) {
      Alert.alert("Required", "Please enter your name");
      return;
    }
    if (items.length === 0) return;

    setLoading(true);
    try {
      const res = await fetch(`${BASE_URL}/api/orders`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          customerName: customerName.trim(),
          tableNumber,
          notes,
          orderedItems: items.map((i) => ({
            menuItem: i.id,
            name: i.name,
            price: i.price,
            quantity: i.quantity,
            image: i.image,
          })),
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message || "Order failed");

      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      setCurrentOrder({
        orderId: data.data.orderId,
        tableNumber: data.data.tableNumber,
        customerName: data.data.customerName,
        status: data.data.orderStatus,
        finalAmount: data.data.finalAmount,
        createdAt: data.data.createdAt,
      });
      clearCart();
      router.replace("/(tabs)/orders");
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Could not place order";
      Alert.alert("Error", msg);
    } finally {
      setLoading(false);
    }
  };

  const topPad = Platform.OS === "web" ? 67 : insets.top;

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <Stack.Screen options={{ headerShown: false }} />
      {/* Header */}
      <View style={[styles.header, { paddingTop: topPad + 12, backgroundColor: colors.surface, borderBottomColor: colors.border }]}>
        <Pressable onPress={() => router.back()} style={styles.back}>
          <Feather name="arrow-left" size={22} color={colors.foreground} />
        </Pressable>
        <Text style={[styles.title, { color: colors.foreground }]}>Your Order</Text>
        <View style={{ width: 40 }} />
      </View>

      <ScrollView contentContainerStyle={{ padding: 20, paddingBottom: 160 }}>
        {/* Cart Items */}
        {items.map((item) => (
          <View key={item.id} style={[styles.cartItem, { backgroundColor: colors.card, borderColor: colors.border }]}>
            <View style={styles.itemInfo}>
              <Text style={[styles.itemName, { color: colors.foreground }]}>{item.name}</Text>
              <Text style={[styles.itemPrice, { color: colors.primary }]}>₹{(item.price * item.quantity).toFixed(0)}</Text>
            </View>
            <View style={[styles.qtyControl, { borderColor: colors.primary }]}>
              <Pressable onPress={() => updateQuantity(item.id, item.quantity - 1)} style={styles.qtyBtn}>
                <Feather name={item.quantity === 1 ? "trash-2" : "minus"} size={14} color={colors.primary} />
              </Pressable>
              <Text style={[styles.qtyText, { color: colors.primary }]}>{item.quantity}</Text>
              <Pressable onPress={() => updateQuantity(item.id, item.quantity + 1)} style={styles.qtyBtn}>
                <Feather name="plus" size={14} color={colors.primary} />
              </Pressable>
            </View>
          </View>
        ))}

        {/* Customer Info */}
        <View style={[styles.infoCard, { backgroundColor: colors.card, borderColor: colors.border }]}>
          <Text style={[styles.infoTitle, { color: colors.foreground }]}>Your Details</Text>
          <View style={[styles.input, { borderColor: colors.border, backgroundColor: colors.background }]}>
            <Feather name="user" size={16} color={colors.mutedForeground} />
            <TextInput
              style={[styles.inputText, { color: colors.foreground }]}
              placeholder="Your name"
              placeholderTextColor={colors.mutedForeground}
              value={customerName}
              onChangeText={setCustomerName}
            />
          </View>
          <View style={[styles.input, { borderColor: colors.border, backgroundColor: colors.background }]}>
            <Feather name="grid" size={16} color={colors.mutedForeground} />
            <TextInput
              style={[styles.inputText, { color: colors.foreground }]}
              placeholder="Table number"
              placeholderTextColor={colors.mutedForeground}
              value={String(tableNumber)}
              onChangeText={(v) => setTableNumber(Number(v) || 1)}
              keyboardType="number-pad"
            />
          </View>
          <View style={[styles.input, { borderColor: colors.border, backgroundColor: colors.background }]}>
            <Feather name="message-square" size={16} color={colors.mutedForeground} />
            <TextInput
              style={[styles.inputText, { color: colors.foreground }]}
              placeholder="Special instructions (optional)"
              placeholderTextColor={colors.mutedForeground}
              value={notes}
              onChangeText={setNotes}
              multiline
            />
          </View>
        </View>

        {/* Bill Summary */}
        <View style={[styles.billCard, { backgroundColor: colors.card, borderColor: colors.border }]}>
          <Text style={[styles.infoTitle, { color: colors.foreground }]}>Bill Summary</Text>
          <View style={styles.billRow}>
            <Text style={[styles.billLabel, { color: colors.mutedForeground }]}>Item Total</Text>
            <Text style={[styles.billValue, { color: colors.foreground }]}>₹{totalAmount.toFixed(0)}</Text>
          </View>
          <View style={styles.billRow}>
            <Text style={[styles.billLabel, { color: colors.mutedForeground }]}>GST (5%)</Text>
            <Text style={[styles.billValue, { color: colors.foreground }]}>₹{gst.toFixed(0)}</Text>
          </View>
          <View style={[styles.billDivider, { backgroundColor: colors.border }]} />
          <View style={styles.billRow}>
            <Text style={[styles.billTotal, { color: colors.foreground }]}>Total</Text>
            <Text style={[styles.billTotal, { color: colors.primary }]}>₹{finalAmount.toFixed(0)}</Text>
          </View>
        </View>
      </ScrollView>

      {/* Place Order Button */}
      <View style={[styles.footer, { paddingBottom: insets.bottom + 16, backgroundColor: colors.background, borderTopColor: colors.border }]}>
        <Pressable
          style={[styles.placeOrderBtn, { backgroundColor: items.length > 0 ? colors.primary : colors.muted }]}
          onPress={handlePlaceOrder}
          disabled={loading || items.length === 0}
        >
          {loading ? (
            <ActivityIndicator color="#fff" />
          ) : (
            <Text style={styles.placeOrderText}>Place Order · ₹{finalAmount.toFixed(0)}</Text>
          )}
        </Pressable>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  header: { flexDirection: "row", alignItems: "center", paddingHorizontal: 16, paddingBottom: 14, borderBottomWidth: 1 },
  back: { width: 40, height: 40, alignItems: "center", justifyContent: "center" },
  title: { flex: 1, textAlign: "center", fontSize: 18, fontWeight: "800" },
  cartItem: { flexDirection: "row", alignItems: "center", justifyContent: "space-between", padding: 14, borderRadius: 12, borderWidth: 1, marginBottom: 10 },
  itemInfo: { flex: 1, gap: 2 },
  itemName: { fontSize: 14, fontWeight: "700" },
  itemPrice: { fontSize: 14, fontWeight: "800" },
  qtyControl: { flexDirection: "row", alignItems: "center", borderWidth: 1.5, borderRadius: 8 },
  qtyBtn: { padding: 8 },
  qtyText: { fontSize: 14, fontWeight: "700", minWidth: 22, textAlign: "center" },
  infoCard: { borderRadius: 16, borderWidth: 1, padding: 16, marginBottom: 14, gap: 10 },
  infoTitle: { fontSize: 15, fontWeight: "800", marginBottom: 4 },
  input: { flexDirection: "row", alignItems: "center", gap: 10, padding: 12, borderRadius: 10, borderWidth: 1 },
  inputText: { flex: 1, fontSize: 14 },
  billCard: { borderRadius: 16, borderWidth: 1, padding: 16, marginBottom: 14, gap: 10 },
  billRow: { flexDirection: "row", justifyContent: "space-between", alignItems: "center" },
  billLabel: { fontSize: 14 },
  billValue: { fontSize: 14, fontWeight: "600" },
  billDivider: { height: 1, marginVertical: 4 },
  billTotal: { fontSize: 16, fontWeight: "800" },
  footer: { position: "absolute", bottom: 0, left: 0, right: 0, padding: 16, borderTopWidth: 1 },
  placeOrderBtn: { padding: 16, borderRadius: 14, alignItems: "center" },
  placeOrderText: { color: "#fff", fontSize: 16, fontWeight: "800" },
});
