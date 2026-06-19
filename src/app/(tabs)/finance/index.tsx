import { useColorScheme, View, ScrollView, StyleSheet, Text, Pressable, ActivityIndicator } from "react-native";
import { DarkTheme, DefaultTheme } from "expo-router";
import { useEffect, useState } from "react";
import { useFinanceStore } from "@/stores/financeStore";
import { TransactionForm } from "@/components/forms/TransactionForm";
import { TransactionType } from "@/types";
import { formatCurrency, getMonthYear } from "@/utils/format";

export default function FinanceScreen() {
  const colorScheme = useColorScheme();
  const isDark = colorScheme === "dark";
  const colors = isDark ? DarkTheme.colors : DefaultTheme.colors;

  const [showIncomeForm, setShowIncomeForm] = useState(false);
  const [showExpenseForm, setShowExpenseForm] = useState(false);

  const {
    incomeTransactions,
    expenseTransactions,
    incomeCategories,
    expenseCategories,
    currentMonth,
    isLoading,
    loadFinanceData,
    loadCategories,
    addTransaction,
  } = useFinanceStore();

  useEffect(() => {
    loadCategories();
    loadFinanceData(currentMonth.year, currentMonth.month);
  }, [currentMonth.month, currentMonth.year, loadCategories, loadFinanceData]);

  const totalIncome = incomeTransactions.reduce((sum, t) => sum + t.amount, 0);
  const totalExpense = expenseTransactions.reduce((sum, t) => sum + t.amount, 0);
  const profit = totalIncome - totalExpense;

  const recentTransactions = [
    ...incomeTransactions.slice(0, 3),
    ...expenseTransactions.slice(0, 2),
  ]
    .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
    .slice(0, 5);

  return (
    <>
      <ScrollView
        style={[styles.container, { backgroundColor: colors.background }]}
      >
        <View style={styles.content}>
          <Text style={[styles.monthTitle, { color: colors.text }]}>
            {getMonthYear(currentMonth.year, currentMonth.month)}
          </Text>

          {/* Summary Cards */}
          <View style={styles.cardsContainer}>
            <View style={[styles.card, { backgroundColor: "#E8F5E9" }]}>
              <Text style={styles.cardLabel}>Total Pendapatan</Text>
              <Text style={[styles.cardValue, { color: "#2E7D32" }]}>
                {formatCurrency(totalIncome)}
              </Text>
            </View>

            <View style={[styles.card, { backgroundColor: "#FFEBEE" }]}>
              <Text style={styles.cardLabel}>Total Pengeluaran</Text>
              <Text style={[styles.cardValue, { color: "#C62828" }]}>
                {formatCurrency(totalExpense)}
              </Text>
            </View>

            <View style={[styles.card, { backgroundColor: "#E3F2FD" }]}>
              <Text style={[styles.cardLabel, { color: colors.text }]}>
                Profit/Loss
              </Text>
              <Text
                style={[
                  styles.cardValue,
                  { color: profit >= 0 ? "#2E7D32" : "#C62828" },
                ]}
              >
                {profit >= 0 ? "+" : ""}
                {formatCurrency(profit)}
              </Text>
            </View>
          </View>

          {/* Action Buttons */}
          <View style={styles.buttonsContainer}>
            <Pressable
              style={[styles.button, { backgroundColor: colors.tint }]}
              onPress={() => setShowIncomeForm(true)}
            >
              <Text style={styles.buttonText}>+ Pendapatan</Text>
            </Pressable>

            <Pressable
              style={[styles.button, { backgroundColor: colors.tint }]}
              onPress={() => setShowExpenseForm(true)}
            >
              <Text style={styles.buttonText}>+ Pengeluaran</Text>
            </Pressable>
          </View>

          {/* Recent Transactions */}
          <Text style={[styles.sectionTitle, { color: colors.text }]}>
            Transaksi Terbaru
          </Text>
          {isLoading ? (
            <ActivityIndicator size="large" color={colors.tint} />
          ) : recentTransactions.length > 0 ? (
            <View
              style={[styles.transactionList, { backgroundColor: colors.card }]}
            >
              {recentTransactions.map((transaction) => (
                <View key={transaction.id} style={styles.transactionItem}>
                  <View style={styles.transactionInfo}>
                    <Text
                      style={[styles.transactionLabel, { color: colors.text }]}
                    >
                      {transaction.category?.name || "Lainnya"}
                    </Text>
                    <Text style={styles.transactionDate}>
                      {transaction.date}
                    </Text>
                  </View>
                  <Text
                    style={[
                      styles.transactionAmount,
                      {
                        color:
                          transaction.transaction_type === TransactionType.INCOME
                            ? "#2E7D32"
                            : "#C62828",
                      },
                    ]}
                  >
                    {transaction.transaction_type === TransactionType.INCOME
                      ? "+"
                      : "-"}
                    {formatCurrency(transaction.amount)}
                  </Text>
                </View>
              ))}
            </View>
          ) : (
            <View
              style={[styles.transactionList, { backgroundColor: colors.card }]}
            >
              <Text style={[styles.emptyText, { color: colors.text }]}>
                Belum ada transaksi
              </Text>
            </View>
          )}
        </View>
      </ScrollView>

      {/* Forms */}
      <TransactionForm
        visible={showIncomeForm}
        type={TransactionType.INCOME}
        categories={incomeCategories}
        onSubmit={addTransaction}
        onClose={() => setShowIncomeForm(false)}
        isLoading={isLoading}
      />

      <TransactionForm
        visible={showExpenseForm}
        type={TransactionType.EXPENSE}
        categories={expenseCategories}
        onSubmit={addTransaction}
        onClose={() => setShowExpenseForm(false)}
        isLoading={isLoading}
      />
    </>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  content: {
    padding: 16,
    gap: 20,
  },
  monthTitle: {
    fontSize: 18,
    fontWeight: "600",
  },
  cardsContainer: {
    gap: 12,
  },
  card: {
    padding: 16,
    borderRadius: 8,
    marginBottom: 8,
  },
  cardLabel: {
    fontSize: 12,
    fontWeight: "500",
    marginBottom: 4,
    opacity: 0.7,
  },
  cardValue: {
    fontSize: 18,
    fontWeight: "700",
  },
  buttonsContainer: {
    gap: 10,
  },
  button: {
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 8,
    alignItems: "center",
  },
  buttonText: {
    color: "white",
    fontWeight: "600",
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: "600",
    marginTop: 8,
  },
  transactionList: {
    borderRadius: 8,
    padding: 12,
    minHeight: 100,
    gap: 8,
  },
  transactionItem: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: "#00000010",
  },
  transactionInfo: {
    flex: 1,
  },
  transactionLabel: {
    fontSize: 14,
    fontWeight: "600",
    marginBottom: 2,
  },
  transactionDate: {
    fontSize: 12,
    opacity: 0.6,
  },
  transactionAmount: {
    fontSize: 14,
    fontWeight: "700",
    marginLeft: 12,
  },
  emptyText: {
    textAlign: "center",
    opacity: 0.6,
  },
});
