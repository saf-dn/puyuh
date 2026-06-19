import { DarkTheme, DefaultTheme } from "expo-router";
import {
  FlatList,
  Pressable,
  StyleSheet,
  Text,
  useColorScheme,
  View,
  ActivityIndicator,
  Alert,
} from "react-native";
import { useEffect } from "react";
import { useFinanceStore } from "@/stores/financeStore";
import { formatCurrency } from "@/utils/formatters";

export default function ExpenseListScreen() {
  const colorScheme = useColorScheme();
  const isDark = colorScheme === "dark";
  const colors = isDark ? DarkTheme.colors : DefaultTheme.colors;

  const { expenseTransactions, loading, error, loadFinanceData, deleteTransaction } =
    useFinanceStore();

  useEffect(() => {
    const now = new Date();
    loadFinanceData(now.getFullYear(), now.getMonth() + 1);
  }, [loadFinanceData]);

  const handleDelete = (id: string, category: string, amount: number) => {
    Alert.alert(
      "Hapus Pengeluaran",
      `Hapus pengeluaran ${category} sebesar ${formatCurrency(amount)}?`,
      [
        { text: "Batal", onPress: () => {}, style: "cancel" },
        {
          text: "Hapus",
          onPress: () => {
            deleteTransaction(id);
          },
          style: "destructive",
        },
      ]
    );
  };

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      {loading ? (
        <View style={styles.centerContainer}>
          <ActivityIndicator size="large" color={colors.tint} />
        </View>
      ) : (
        <FlatList
          data={expenseTransactions}
          keyExtractor={(item) => item.id}
          renderItem={({ item }) => (
            <Pressable
              style={[styles.transactionItem, { backgroundColor: colors.card }]}
              onLongPress={() =>
                handleDelete(item.id, item.category, item.amount)
              }
            >
              <View style={styles.itemContent}>
                <Text style={[styles.itemLabel, { color: colors.text }]}>
                  {item.category}
                </Text>
                <Text style={styles.itemDate}>
                  {new Date(item.date).toLocaleDateString("id-ID", {
                    year: "numeric",
                    month: "short",
                    day: "numeric",
                  })}
                </Text>
                {item.notes && (
                  <Text style={styles.itemNotes} numberOfLines={1}>
                    {item.notes}
                  </Text>
                )}
              </View>
              <Text style={[styles.itemAmount, { color: "#C62828" }]}>
                -{formatCurrency(item.amount)}
              </Text>
            </Pressable>
          )}
          ListEmptyComponent={
            <View style={styles.emptyContainer}>
              <Text style={[styles.emptyText, { color: colors.text }]}>
                Belum ada pengeluaran
              </Text>
            </View>
          }
          contentContainerStyle={styles.listContent}
        />
      )}
      {error && (
        <View style={[styles.errorBar, { backgroundColor: "#C62828" }]}>
          <Text style={styles.errorText}>{error}</Text>
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  centerContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  listContent: {
    padding: 16,
    gap: 12,
    flexGrow: 1,
  },
  transactionItem: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    padding: 12,
    borderRadius: 8,
  },
  itemContent: {
    flex: 1,
  },
  itemLabel: {
    fontSize: 14,
    fontWeight: "600",
    marginBottom: 4,
  },
  itemDate: {
    fontSize: 12,
    opacity: 0.6,
  },
  itemNotes: {
    fontSize: 11,
    opacity: 0.5,
    marginTop: 2,
  },
  itemAmount: {
    fontSize: 14,
    fontWeight: "700",
  },
  emptyContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  emptyText: {
    fontSize: 14,
    opacity: 0.6,
  },
  errorBar: {
    padding: 12,
    alignItems: "center",
  },
  errorText: {
    color: "white",
    fontSize: 12,
    fontWeight: "600",
  },
});
