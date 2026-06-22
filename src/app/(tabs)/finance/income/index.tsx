import { C, S } from "@/constants/theme";
import { useFinanceStore } from "@/stores/financeStore";
import { formatCurrency } from "@/utils/format";
import { useRouter } from "expo-router";
import { useEffect } from "react";
import { ActivityIndicator, Alert, FlatList, Pressable, SafeAreaView, StatusBar, StyleSheet, View } from "react-native";
import Animated, { FadeInDown } from "react-native-reanimated";
import { ThemeText as Text } from "@/components/ui/ThemeText";

export default function IncomeListScreen() {
  const {
    incomeTransactions,
    isLoading,
    error,
    currentMonth,
    loadFinanceData,
    deleteTransaction,
  } = useFinanceStore();

  const router = useRouter();

  useEffect(() => {
    loadFinanceData(currentMonth.year, currentMonth.month);
  }, [loadFinanceData, currentMonth.year, currentMonth.month]);

  const handleDelete = (id: string, category: string, amount: number) => {
    Alert.alert(
      "Hapus Pendapatan",
      `Hapus pendapatan "${category}" sebesar ${formatCurrency(amount)}?`,
      [
        { text: "Batal", style: "cancel" },
        {
          text: "Hapus",
          onPress: () => deleteTransaction(id),
          style: "destructive",
        },
      ],
    );
  };

  return (
    <SafeAreaView style={ls.safe}>
      <StatusBar barStyle="light-content" backgroundColor={C.bg} />

      {/* Header - Transparent */}
      <Animated.View entering={FadeInDown.duration(400).delay(100)} style={ls.header}>
        <Pressable onPress={() => router.back()} style={{ marginBottom: 12 }}>
          <Text style={{ color: C.textSecondary, fontSize: 16, fontWeight: "600" }}>← Kembali</Text>
        </Pressable>
        <Text style={ls.headerSub}>Riwayat</Text>
        <Text style={ls.headerTitle}>Pendapatan</Text>
      </Animated.View>

      {isLoading ? (
        <View style={ls.center}>
          <ActivityIndicator size="large" color={C.red} />
        </View>
      ) : (
        <Animated.FlatList
          data={incomeTransactions}
          keyExtractor={(item) => item.id}
          contentContainerStyle={ls.listContent}
          showsVerticalScrollIndicator={false}
          renderItem={({ item, index }) => (
            <Pressable
              onLongPress={() =>
                handleDelete(
                  item.id,
                  item.category?.name ?? "Lainnya",
                  item.amount,
                )
              }
            >
              <Animated.View
                entering={FadeInDown.duration(400).delay(200 + index * 50)}
                style={ls.item}
              >
                <View style={[ls.itemIconBox, { backgroundColor: `${C.income}20` }]}>
                  <Text style={ls.itemIcon}>⬇</Text>
                </View>
                <View style={ls.itemBody}>
                  <Text style={ls.itemCategory}>
                    {item.category?.name ?? "Lainnya"}
                  </Text>
                  {item.description ? (
                    <Text style={ls.itemDesc} numberOfLines={1}>
                      {item.description}
                    </Text>
                  ) : null}
                </View>
                <View style={{ alignItems: "flex-end" }}>
                  <Text style={[ls.itemAmount, { color: C.income }]}>
                    +{formatCurrency(item.amount)}
                  </Text>
                  <Text style={ls.itemDate}>
                    {new Date(item.date.replace(/-/g, "/")).toLocaleDateString(
                      "id-ID",
                      {
                        year: "numeric",
                        month: "short",
                        day: "numeric",
                      },
                    )}
                  </Text>
                </View>
              </Animated.View>
            </Pressable>
          )}
          ListEmptyComponent={
            <View style={ls.empty}>
              <Text style={ls.emptyIcon}>📥</Text>
              <Text style={ls.emptyText}>Belum ada pendapatan</Text>
              <Text style={ls.emptyHint}>Tambahkan dari tab Keuangan</Text>
            </View>
          }
        />
      )}

      {error ? (
        <View style={ls.errorBar}>
          <Text style={ls.errorText}>{error}</Text>
        </View>
      ) : null}
    </SafeAreaView>
  );
}

const ls = StyleSheet.create({
  safe: { flex: 1, backgroundColor: C.bg },
  center: { flex: 1, justifyContent: "center", alignItems: "center" },

  // Header
  header: { paddingHorizontal: S.lg, paddingTop: S.md, paddingBottom: S.sm },
  headerSub: { color: C.textSecondary, fontSize: 13, fontWeight: "600", textTransform: "uppercase", letterSpacing: 1 },
  headerTitle: {
    color: C.textPrimary,
    fontSize: 28,
    fontWeight: "900",
    marginTop: 4,
  },

  listContent: { padding: S.lg, gap: 16, flexGrow: 1, paddingBottom: 100 },

  // Item - Borderless
  item: {
    backgroundColor: C.card,
    borderRadius: 20,
    flexDirection: "row",
    alignItems: "center",
    padding: 16,
    gap: 16,
  },
  itemIconBox: { width: 44, height: 44, borderRadius: 22, alignItems: "center", justifyContent: "center" },
  itemIcon: { fontSize: 18 },
  itemBody: { flex: 1, gap: 4 },
  itemCategory: { color: C.textPrimary, fontSize: 16, fontWeight: "700" },
  itemDesc: { color: C.textSecondary, fontSize: 13 },
  itemDate: { color: C.textMuted, fontSize: 12, marginTop: 4 },
  itemAmount: { fontSize: 16, fontWeight: "800" },

  // Empty
  empty: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    paddingVertical: 60,
    gap: 12,
  },
  emptyIcon: { fontSize: 48 },
  emptyText: { color: C.textPrimary, fontSize: 16, fontWeight: "700" },
  emptyHint: { color: C.textSecondary, fontSize: 14 },

  errorBar: { backgroundColor: "#7F1D1D", padding: 16, alignItems: "center", margin: S.lg, borderRadius: 16 },
  errorText: { color: "#FCA5A5", fontSize: 14, fontWeight: "700" },
});
