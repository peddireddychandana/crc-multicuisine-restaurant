import React from "react";
import { View, Text, StyleSheet } from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { useColors } from "@/hooks/useColors";

interface OfferBannerProps {
  title: string;
  description: string;
  discountPercentage: number;
}

export default function OfferBanner({ title, description, discountPercentage }: OfferBannerProps) {
  const colors = useColors();
  return (
    <LinearGradient
      colors={["#C4581A", "#E8734A"]}
      start={{ x: 0, y: 0 }}
      end={{ x: 1, y: 1 }}
      style={styles.container}
    >
      <View style={styles.badge}>
        <Text style={styles.badgeText}>{discountPercentage}% OFF</Text>
      </View>
      <Text style={styles.title}>{title}</Text>
      <Text style={styles.desc}>{description}</Text>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  container: { borderRadius: 16, padding: 18, marginRight: 12, width: 260 },
  badge: { backgroundColor: "rgba(255,255,255,0.25)", alignSelf: "flex-start", paddingHorizontal: 10, paddingVertical: 4, borderRadius: 8, marginBottom: 8 },
  badgeText: { color: "#fff", fontSize: 12, fontWeight: "800", letterSpacing: 1 },
  title: { color: "#fff", fontSize: 16, fontWeight: "800", marginBottom: 4 },
  desc: { color: "rgba(255,255,255,0.85)", fontSize: 12, lineHeight: 16 },
});
