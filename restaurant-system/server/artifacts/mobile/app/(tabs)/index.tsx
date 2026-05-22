import React, { useState, useCallback } from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  FlatList,
  TextInput,
  ActivityIndicator,
  RefreshControl,
  Platform,
} from "react-native";
import { Feather } from "@expo/vector-icons";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useRouter } from "expo-router";
import { useColors } from "@/hooks/useColors";
import MenuCard, { MenuItem } from "@/components/MenuCard";
import CategoryPill from "@/components/CategoryPill";
import OfferBanner from "@/components/OfferBanner";
import CartButton from "@/components/CartButton";
import { useApiData } from "@/hooks/useApiData";

const BASE_URL = `https://${process.env["EXPO_PUBLIC_DOMAIN"]}`;

export default function HomeScreen() {
  const colors = useColors();
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const [selectedCategory, setSelectedCategory] = useState<string>("all");
  const [search, setSearch] = useState("");
  const [refreshing, setRefreshing] = useState(false);

  const { data: categoriesData, refetch: refetchCats } = useApiData<{ data: Array<{ _id: string; name: string; slug: string }> }>(`${BASE_URL}/api/categories`);
  const { data: menuData, refetch: refetchMenu, loading: menuLoading } = useApiData<{ data: MenuItem[] }>(`${BASE_URL}/api/menu`);
  const { data: offersData } = useApiData<{ data: Array<{ _id: string; title: string; description: string; discountPercentage: number }> }>(`${BASE_URL}/api/offers`);

  const categories = categoriesData?.data ?? [];
  const allMenu = menuData?.data ?? [];
  const offers = offersData?.data ?? [];

  const filteredMenu = allMenu.filter((item) => {
    const matchCat = selectedCategory === "all" || (typeof item.category === "object" ? item.category.slug === selectedCategory : false);
    const matchSearch = search === "" || item.name.toLowerCase().includes(search.toLowerCase());
    return matchCat && matchSearch;
  });

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    await Promise.all([refetchCats(), refetchMenu()]);
    setRefreshing(false);
  }, [refetchCats, refetchMenu]);

  const topPad = Platform.OS === "web" ? 67 : insets.top;

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <ScrollView
        showsVerticalScrollIndicator={false}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={colors.primary} />}
        contentContainerStyle={{ paddingBottom: Platform.OS === "web" ? 34 : 120 }}
      >
        {/* Header */}
        <View style={[styles.header, { paddingTop: topPad + 16, backgroundColor: colors.surface }]}>
          <View>
            <Text style={[styles.greeting, { color: colors.mutedForeground }]}>Welcome to</Text>
            <Text style={[styles.restaurantName, { color: colors.primary }]}>CRC Multicuisine</Text>
          </View>
          <View style={[styles.ratingChip, { backgroundColor: colors.goldLight }]}>
            <Feather name="star" size={13} color={colors.gold} />
            <Text style={[styles.ratingText, { color: colors.gold }]}>4.8</Text>
          </View>
        </View>

        {/* Search */}
        <View style={[styles.searchWrapper, { backgroundColor: colors.surface }]}>
          <View style={[styles.searchBar, { backgroundColor: colors.card, borderColor: colors.border }]}>
            <Feather name="search" size={16} color={colors.mutedForeground} />
            <TextInput
              style={[styles.searchInput, { color: colors.foreground }]}
              placeholder="Search dishes..."
              placeholderTextColor={colors.mutedForeground}
              value={search}
              onChangeText={setSearch}
            />
            {search.length > 0 && (
              <Feather name="x" size={16} color={colors.mutedForeground} onPress={() => setSearch("")} />
            )}
          </View>
        </View>

        {/* Offers */}
        {offers.length > 0 && (
          <View style={styles.section}>
            <Text style={[styles.sectionTitle, { color: colors.foreground }]}>Today's Offers</Text>
            <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.offersScroll}>
              {offers.map((offer) => (
                <OfferBanner
                  key={offer._id}
                  title={offer.title}
                  description={offer.description}
                  discountPercentage={offer.discountPercentage}
                />
              ))}
            </ScrollView>
          </View>
        )}

        {/* Categories */}
        <View style={styles.section}>
          <Text style={[styles.sectionTitle, { color: colors.foreground }]}>Menu</Text>
          <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.catScroll}>
            <CategoryPill label="All" isSelected={selectedCategory === "all"} onPress={() => setSelectedCategory("all")} />
            {categories.map((cat) => (
              <CategoryPill
                key={cat._id}
                label={cat.name}
                isSelected={selectedCategory === cat.slug}
                onPress={() => setSelectedCategory(cat.slug)}
              />
            ))}
          </ScrollView>
        </View>

        {/* Menu Items */}
        <View style={styles.menuList}>
          {menuLoading ? (
            <ActivityIndicator color={colors.primary} style={{ marginTop: 40 }} />
          ) : filteredMenu.length === 0 ? (
            <View style={styles.empty}>
              <Feather name="coffee" size={40} color={colors.mutedForeground} />
              <Text style={[styles.emptyText, { color: colors.mutedForeground }]}>No dishes found</Text>
            </View>
          ) : (
            filteredMenu.map((item) => (
              <MenuCard
                key={item._id}
                item={item}
                onPress={() => router.push({ pathname: "/item/[id]", params: { id: item._id } })}
              />
            ))
          )}
        </View>
      </ScrollView>

      <CartButton />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  header: { paddingHorizontal: 20, paddingBottom: 16 },
  greeting: { fontSize: 13, fontWeight: "500" },
  restaurantName: { fontSize: 22, fontWeight: "900", letterSpacing: -0.5 },
  ratingChip: { flexDirection: "row", alignItems: "center", gap: 4, paddingHorizontal: 10, paddingVertical: 5, borderRadius: 20 },
  ratingText: { fontSize: 13, fontWeight: "800" },
  searchWrapper: { paddingHorizontal: 20, paddingBottom: 16 },
  searchBar: { flexDirection: "row", alignItems: "center", gap: 10, paddingHorizontal: 14, paddingVertical: 12, borderRadius: 12, borderWidth: 1 },
  searchInput: { flex: 1, fontSize: 14, padding: 0 },
  section: { marginBottom: 4 },
  sectionTitle: { fontSize: 17, fontWeight: "800", marginHorizontal: 20, marginBottom: 12 },
  offersScroll: { paddingHorizontal: 20, paddingBottom: 4 },
  catScroll: { paddingHorizontal: 20, paddingBottom: 8 },
  menuList: { paddingHorizontal: 16 },
  empty: { alignItems: "center", paddingVertical: 60, gap: 12 },
  emptyText: { fontSize: 15 },
});
