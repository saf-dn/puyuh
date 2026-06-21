import { TransactionForm } from "@/components/forms/TransactionForm";
import { C, R, S } from "@/constants/theme";
import { useFinanceStore } from "@/stores/financeStore";
import { TransactionType } from "@/types";
import { formatCurrency, getMonthYear } from "@/utils/format";
import { useRouter } from "expo-router";
import { useEffect, useState } from "react";
import {
  ActivityIndicator,
  Pressable,
  SafeAreaView,
  ScrollView,
  StatusBar,
  StyleSheet,
  Text,
  View,
} from "react-native";
import Animated, { FadeInDown } from "react-native-reanimated";

// ─── Sub-components ──────────────────────────────────────────────

function Header({
  year,
  month,
  onPrev,
  onNext,
}: {
  year: number;
  month: number;
  onPrev: () => void;
  onNext: () => void;
}) {
  return (
    <View style={s.header}>
      <View>
        <Text style={s.headerSub}>Periode Keuangan</Text>
        <Text style={s.headerTitle}>{getMonthYear(year, month)}</Text>
      </View>
      <View style={s.monthNav}>
        <Pressable style={s.navBtn} onPress={onPrev}>
          <Text style={s.navBtnText}>‹</Text>
        </Pressable>
        <Pressable style={s.navBtn} onPress={onNext}>
          <Text style={s.navBtnText}>›</Text>
        </Pressable>
      </View>
    </View>
  );
}

function SummaryCard({
  label,
  amount,
  color,
  accent,
}: {
  label: string;
  amount: number;
  color: string;
  accent?: boolean;
}) {
  return (
    <View style={[s.summaryCard, accent && { backgroundColor: color }]}>
      <Text
        style={[s.summaryLabel, accent && { color: "rgba(255,255,255,0.7)" }]}
      >
        {label}
      </Text>
      <Text style={[s.summaryAmount, { color: accent ? C.white : color }]}>
        {formatCurrency(amount)}
      </Text>
    </View>
  );
}

function ActionButton({
  label,
  color,
  onPress,
  icon,
}: {
  label: string;
  color: string;
  onPress: () => void;
  icon: string;
}) {
  return (
    <Pressable
      style={[s.actionBtn, { backgroundColor: color }]}
      onPress={onPress}
    >
      <Text style={s.actionBtnIcon}>{icon}</Text>
      <Text style={s.actionBtnText}>{label}</Text>
    </Pressable>
  );
}

function TransactionRow({
  type,
  category,
  date,
  amount,
  description,
}: {
  type: TransactionType;
  category?: string;
  date: string;
  amount: number;
  description?: string;
}) {
  const isIncome = type === TransactionType.INCOME;
  return (
    <View style={s.txRow}>
      <View
        style={[s.txIconBox, { backgroundColor: isIncome ? `${C.income}20` : `${C.expense}20` }]}
      >
        <Text style={s.txIcon}>{isIncome ? "⬇" : "⬆"}</Text>
      </View>
      <View style={{ flex: 1 }}>
        <Text style={s.txCategory} numberOfLines={1}>
          {category ?? "Lainnya"}
        </Text>
        {description ? (
          <Text style={s.txDesc} numberOfLines={1}>
            {description}
          </Text>
        ) : null}
      </View>
      <View style={{ alignItems: "flex-right" }}>
        <Text style={[s.txAmount, { color: isIncome ? C.income : C.expense }]}>
          {isIncome ? "+" : "-"}
          {formatCurrency(amount)}
        </Text>
        <Text style={s.txDate}>{date}</Text>
      </View>
    </View>
  );
}

// ─── Screen ──────────────────────────────────────────────────────

export default function FinanceScreen() {
  const router = useRouter();
  const [showIncomeForm, setShowIncomeForm] = useState(false);
  const [showExpenseForm, setShowExpenseForm] = useState(false);

  const {
    incomeTransactions,
    expenseTransactions,
    incomeCategories,
    expenseCategories,
    currentMonth,
    isLoading,
    error,
    loadFinanceData,
    loadCategories,
    addTransaction,
    setMonth,
    clearError,
  } = useFinanceStore();

  useEffect(() => {
    loadCategories();
  }, []);

  useEffect(() => {
    loadFinanceData(currentMonth.year, currentMonth.month);
  }, [currentMonth.year, currentMonth.month]);

  const totalIncome = incomeTransactions.reduce((sum, t) => sum + t.amount, 0);
  const totalExpense = expenseTransactions.reduce((sum, t) => sum + t.amount, 0);
  const profit = totalIncome - totalExpense;

  const recentTransactions = [...incomeTransactions, ...expenseTransactions]
    .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
    .slice(0, 8);

  const changeMonth = (delta: number) => {
    let m = currentMonth.month + delta;
    let y = currentMonth.year;
    if (m > 12) {
      m = 1;
      y += 1;
    } else if (m < 1) {
      m = 12;
      y -= 1;
    }
    setMonth(y, m);
  };

  return (
    <SafeAreaView style={s.safe}>
      <StatusBar barStyle="light-content" backgroundColor={C.bg} />
      <ScrollView
        style={s.scroll}
        contentContainerStyle={s.content}
        showsVerticalScrollIndicator={false}
      >
        <Animated.View entering={FadeInDown.duration(400).delay(100)}>
          <Header
            year={currentMonth.year}
            month={currentMonth.month}
            onPrev={() => changeMonth(-1)}
            onNext={() => changeMonth(1)}
          />
        </Animated.View>

        {/* Profit Hero - Borderless & Soft Gradient-like Background */}
        <Animated.View entering={FadeInDown.duration(400).delay(200)} style={s.heroCard}>
          <Text style={s.heroLabel}>Saldo Bersih Bulan Ini</Text>
          <Text
            style={[
              s.heroAmount,
              { color: profit >= 0 ? C.income : C.expense },
            ]}
          >
            {profit >= 0 ? "+" : ""}
            {formatCurrency(profit)}
          </Text>
        </Animated.View>

        {/* Summary Cards Row - Varying sizes and borderless */}
        <Animated.View entering={FadeInDown.duration(400).delay(300)} style={s.summaryRow}>
          <SummaryCard
            label="Total Pendapatan"
            amount={totalIncome}
            color={C.income}
          />
          <SummaryCard
            label="Total Pengeluaran"
            amount={totalExpense}
            color={C.expense}
            accent
          />
        </Animated.View>

        {/* Action Buttons - Transparent container, solid buttons */}
        <Animated.View entering={FadeInDown.duration(400).delay(400)} style={s.actionRow}>
          <ActionButton
            label="Pendapatan"
            icon="📥"
            color={C.income}
            onPress={() => setShowIncomeForm(true)}
          />
          <ActionButton
            label="Pengeluaran"
            icon="📤"
            color={C.expense}
            onPress={() => setShowExpenseForm(true)}
          />
        </Animated.View>

        {/* Divider - Transparent container */}
        <Animated.View entering={FadeInDown.duration(400).delay(500)} style={s.sectionHeader}>
          <Text style={s.sectionTitle}>Transaksi Terbaru</Text>
        </Animated.View>

        {/* Transaction List - Borderless container */}
        <Animated.View entering={FadeInDown.duration(400).delay(600)}>
          {isLoading ? (
            <ActivityIndicator color={C.red} style={{ marginVertical: 24 }} />
          ) : recentTransactions.length > 0 ? (
            <View style={s.txList}>
              {recentTransactions.map((t, index) => (
                <TransactionRow
                  key={`${t.id}-${index}`}
                  type={t.transaction_type}
                  category={t.category?.name}
                  date={t.date}
                  amount={t.amount}
                  description={t.description}
                />
              ))}
            </View>
          ) : (
            <View style={s.emptyBox}>
              <Text style={s.emptyIcon}>💸</Text>
              <Text style={s.emptyText}>Belum ada transaksi bulan ini</Text>
            </View>
          )}
        </Animated.View>

        {/* Quick Links - Subtle background, no border */}
        <Animated.View entering={FadeInDown.duration(400).delay(700)} style={s.linkRow}>
          <Pressable
            style={s.linkBtn}
            onPress={() => router.push("/finance/income")}
          >
            <Text style={s.linkBtnText}>Lihat Semua Pendapatan →</Text>
          </Pressable>
          <Pressable
            style={s.linkBtn}
            onPress={() => router.push("/finance/expense")}
          >
            <Text style={s.linkBtnText}>Lihat Semua Pengeluaran →</Text>
          </Pressable>
        </Animated.View>

        {error ? (
          <Pressable style={s.errorBar} onPress={clearError}>
            <Text style={s.errorText}>⚠ {error}</Text>
          </Pressable>
        ) : null}
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
    </SafeAreaView>
  );
}

// ─── Styles ──────────────────────────────────────────────────────

const s = StyleSheet.create({
  safe: { flex: 1, backgroundColor: C.bg },
  scroll: { flex: 1 },
  content: { padding: S.lg, paddingBottom: S.xl, gap: 24 },

  // Header - Transparent
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingTop: S.sm,
  },
  headerSub: { color: C.textSecondary, fontSize: 13, fontWeight: "500", textTransform: "uppercase", letterSpacing: 1 },
  headerTitle: {
    color: C.textPrimary,
    fontSize: 28,
    fontWeight: "900",
    marginTop: 4,
  },
  monthNav: { flexDirection: "row", gap: 8 },
  navBtn: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: C.card2,
    alignItems: "center",
    justifyContent: "center",
  },
  navBtnText: { color: C.textPrimary, fontSize: 22, lineHeight: 26 },

  // Hero - Borderless, Soft padding
  heroCard: {
    backgroundColor: C.card,
    borderRadius: 24,
    padding: 28,
    alignItems: "center",
  },
  heroLabel: {
    color: C.textSecondary,
    fontSize: 14,
    fontWeight: "600",
    marginBottom: 8,
    textTransform: "uppercase",
    letterSpacing: 1,
  },
  heroAmount: { fontSize: 40, fontWeight: "900", letterSpacing: -1.5 },

  // Summary cards - Asymmetric sizing
  summaryRow: { flexDirection: "row", gap: 16 },
  summaryCard: {
    flex: 1,
    backgroundColor: C.card,
    borderRadius: 20,
    padding: 20,
    gap: 8,
  },
  summaryLabel: {
    color: C.textSecondary,
    fontSize: 12,
    fontWeight: "700",
    textTransform: "uppercase",
    letterSpacing: 0.5,
  },
  summaryAmount: { fontSize: 18, fontWeight: "900" },

  // Action buttons
  actionRow: { flexDirection: "row", gap: 16 },
  actionBtn: {
    flex: 1,
    paddingVertical: 16,
    borderRadius: 20,
    alignItems: "center",
    flexDirection: "row",
    justifyContent: "center",
    gap: 8,
  },
  actionBtnIcon: { fontSize: 18 },
  actionBtnText: { color: C.white, fontWeight: "800", fontSize: 15 },

  // Section header - Transparent
  sectionHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginTop: 8,
  },
  sectionTitle: { color: C.textPrimary, fontSize: 20, fontWeight: "800" },

  // Transaction list - Borderless items
  txList: {
    gap: 16,
  },
  txRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 16,
    backgroundColor: C.card,
    padding: 16,
    borderRadius: 20,
  },
  txIconBox: { width: 44, height: 44, borderRadius: 22, alignItems: "center", justifyContent: "center" },
  txIcon: { fontSize: 18 },
  txCategory: { color: C.textPrimary, fontSize: 16, fontWeight: "700" },
  txDesc: { color: C.textSecondary, fontSize: 13, marginTop: 4 },
  txDate: { color: C.textMuted, fontSize: 12, marginTop: 4, textAlign: "right" },
  txAmount: { fontSize: 16, fontWeight: "800", textAlign: "right" },

  // Quick links
  linkRow: { gap: 12, marginTop: 8 },
  linkBtn: {
    backgroundColor: C.card2,
    borderRadius: 16,
    paddingVertical: 16,
    paddingHorizontal: 20,
    flexDirection: "row",
    alignItems: "center",
  },
  linkBtnText: { color: C.textPrimary, fontSize: 14, fontWeight: "700" },

  // Empty state
  emptyBox: {
    backgroundColor: C.card,
    borderRadius: 24,
    padding: 40,
    alignItems: "center",
    gap: 12,
  },
  emptyIcon: { fontSize: 48 },
  emptyText: { color: C.textSecondary, fontSize: 14, fontWeight: "600" },

  // Error
  errorBar: {
    backgroundColor: "#7F1D1D",
    borderRadius: 16,
    padding: 16,
    alignItems: "center",
  },
  errorText: { color: "#FCA5A5", fontSize: 14, fontWeight: "700" },
});
