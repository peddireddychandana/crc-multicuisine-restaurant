import React from "react";
import { Text, StyleSheet, Pressable } from "react-native";
import { useColors } from "@/hooks/useColors";

interface CategoryPillProps {
  label: string;
  isSelected: boolean;
  onPress: () => void;
}

export default function CategoryPill({ label, isSelected, onPress }: CategoryPillProps) {
  const colors = useColors();
  return (
    <Pressable
      style={[
        styles.pill,
        {
          backgroundColor: isSelected ? colors.primary : colors.secondary,
          borderColor: isSelected ? colors.primary : colors.border,
        },
      ]}
      onPress={onPress}
    >
      <Text style={[styles.text, { color: isSelected ? "#fff" : colors.mutedForeground }]}>
        {label}
      </Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  pill: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    borderWidth: 1,
    marginRight: 8,
  },
  text: { fontSize: 13, fontWeight: "600" },
});
