import { useColorScheme, ScrollView, StyleSheet, Text, View, ActivityIndicator } from "react-native";
import { DarkTheme, DefaultTheme } from "expo-router";
import { useEffect } from "react";
import { useSummaryStore } from "@/stores/summaryStore";
import { formatCurrency, formatNumber, getMonthYear } from "@/utils/format";

export default function SummaryScreen() {
  const colorScheme = useColorScheme();
  const isDark = colorScheme === "dark";
  const colors = isDark ? DarkTheme.colors : DefaultTheme.colors;

  const { monthlySummary, isLoading, loadMonthlySummary } = useSummaryStore();

  useEffect(() => {
    const now = new Date();
    loadMonthlySummary(now.getFullYear(), now.getMonth() + 1);
  }, [loadMonthlySummary]);

  if (isLoading) {
    return (
      <View style={[styles.container, { backgroundColor: colors.background }]}>
        <ActivityIndicator size="large" color={colors.tint} />
      </View>
    );
  }

  if (!monthlySummary) {
    return (
      <View style={[styles.container, { backgroundColor: colors.background }]}>
        <Text style={[styles.emptyText, { color: colors.text }]}>
          Tidak ada data tersedia
        </Text>
      </View>
    );
  }

  return (
    <ScrollView
      style={[styles.container, { backgroundColor: colors.background }]}
    >
      <View style={styles.content}>
        <Text style={[styles.periodTitle, { color: colors.text }]}>
          {getMonthYear(
            parseInt(monthlySummary.period.split("-")[0]),
            parseInt(monthlySummary.period.split("-")[1])
          )}
        </Text>

        {/* Population Info */}
        <View style={[styles.section, { backgroundColor: colors.card }]}>
          <Text style={[styles.sectionTitle, { color: colors.text }]}>
            📊 Informasi Puyuh
          </Text>
          <View style={styles.infoRow}>
            <Text style={[styles.label, { color: colors.text }]}>
              Total Puyuh:
            </Text>
            <Text style={[styles.value, { color: colors.tint }]}>
              {formatNumber(monthlySummary.total_puyuh)} ekor
            </Text>
          </View>
          <View style={styles.infoRow}>
            <Text style={[styles.label, { color: colors.text }]}>
              Mati bulan ini:
            </Text>
            <Text style={[styles.value, { color: "#C62828" }]}>
              {formatNumber(monthlySummary.puyuh_died_count)} ekor
            </Text>
          </View>
        </View>

        {/* Production Info */}
        <View style={[styles.section, { backgroundColor: colors.card }]}>
          <Text style={[styles.sectionTitle, { color: colors.text }]}>
            🥚 Produksi Telur
          </Text>
          <View style={styles.infoRow}>
            <Text style={[styles.label, { color: colors.text }]}>
              Per Hari (Rata-rata):
            </Text>
            <Text style={[styles.value, { color: colors.tint }]}>
              {formatNumber(monthlySummary.avg_eggs_per_day)} pcs
            </Text>
          </View>
          <View style={styles.infoRow}>
            <Text style={[styles.label, { color: colors.text }]}>
              Per Bulan:
            </Text>
            <Text style={[styles.value, { color: colors.tint }]}>
              {formatNumber(monthlySummary.eggs_produced)} pcs
            </Text>
          </View>
        </View>

        {/* Egg Status */}
        <View style={[styles.section, { backgroundColor: colors.card }]}>
          <Text style={[styles.sectionTitle, { color: colors.text }]}>
            🔄 Status Telur Bulan Ini
          </Text>
          <View style={styles.infoRow}>
            <Text style={[styles.label, { color: colors.text }]}>
              Diproduksi:
            </Text>
            <Text style={[styles.value, { color: "#2E7D32" }]}>
              {formatNumber(monthlySummary.eggs_produced)} pcs
            </Text>
          </View>
          <View style={styles.infoRow}>
            <Text style={[styles.label, { color: colors.text }]}>Pecah:</Text>
            <Text style={[styles.value, { color: "#C62828" }]}>
              {formatNumber(monthlySummary.eggs_broken)} pcs (
              {monthlySummary.eggs_produced > 0
                ? (
                    (monthlySummary.eggs_broken /
                      monthlySummary.eggs_produced) *
                    100
                  ).toFixed(1)
                : 0}
              %)
            </Text>
          </View>
          <View style={styles.infoRow}>
            <Text style={[styles.label, { color: colors.text }]}>
              Terjual:
            </Text>
            <Text style={[styles.value, { color: "#1565C0" }]}>
              {formatNumber(monthlySummary.eggs_sold)} pcs (
              {monthlySummary.eggs_produced > 0
                ? (
                    (monthlySummary.eggs_sold /
                      monthlySummary.eggs_produced) *
                    100
                  ).toFixed(1)
                : 0}
              %)
            </Text>
          </View>
        </View>

        {/* Feed Info */}
        <View style={[styles.section, { backgroundColor: colors.card }]}>
          <Text style={[styles.sectionTitle, { color: colors.text }]}>
            🍖 Konsumsi Pakan
          </Text>
          <View style={styles.infoRow}>
            <Text style={[styles.label, { color: colors.text }]}>
              Per Hari (Rata-rata):
            </Text>
            <Text style={[styles.value, { color: colors.tint }]}>
              {monthlySummary.avg_feed_per_day.toFixed(2)} kg
            </Text>
          </View>
          <View style={styles.infoRow}>
            <Text style={[styles.label, { color: colors.text }]}>
              Per Bulan:
            </Text>
            <Text style={[styles.value, { color: colors.tint }]}>
              {monthlySummary.total_feed_kg.toFixed(2)} kg
            </Text>
          </View>
          <View style={styles.infoRow}>
            <Text style={[styles.label, { color: colors.text }]}>
              Biaya Pakan:
            </Text>
            <Text style={[styles.value, { color: "#C62828" }]}>
              {formatCurrency(monthlySummary.total_feed_cost)}
            </Text>
          </View>
        </View>

        {/* Financial Summary */}
        <View style={[styles.section, { backgroundColor: colors.card }]}>
          <Text style={[styles.sectionTitle, { color: colors.text }]}>
            💵 Ringkasan Keuangan
          </Text>

          <Text
            style={[styles.subtitle, { color: colors.text }]}
          >
            Pendapatan:
          </Text>
          {Object.entries(monthlySummary.income_by_category).map(
            ([category, amount]) => (
              <View key={category} style={styles.infoRow}>
                <Text style={[styles.label, { color: colors.text }]}>
                  - {category}:
                </Text>
                <Text style={[styles.value, { color: "#2E7D32" }]}>
                  {formatCurrency(amount)}
                </Text>
              </View>
            )
          )}
          <View
            style={[styles.totalRow, { borderTopColor: colors.text }]}
          >
            <Text style={[styles.label, { color: colors.text }]}>
              Total Pendapatan:
            </Text>
            <Text style={[styles.value, { color: "#2E7D32", fontWeight: "700" }]}>
              {formatCurrency(monthlySummary.total_income)}
            </Text>
          </View>

          <Text
            style={[
              styles.subtitle,
              { color: colors.text, marginTop: 16 },
            ]}
          >
            Pengeluaran:
          </Text>
          {Object.entries(monthlySummary.expense_by_category).map(
            ([category, amount]) => (
              <View key={category} style={styles.infoRow}>
                <Text style={[styles.label, { color: colors.text }]}>
                  - {category}:
                </Text>
                <Text style={[styles.value, { color: "#C62828" }]}>
                  {formatCurrency(amount)}
                </Text>
              </View>
            )
          )}
          <View
            style={[styles.totalRow, { borderTopColor: colors.text }]}
          >
            <Text style={[styles.label, { color: colors.text }]}>
              Total Pengeluaran:
            </Text>
            <Text style={[styles.value, { color: "#C62828", fontWeight: "700" }]}>
              {formatCurrency(monthlySummary.total_expense)}
            </Text>
          </View>

          <View
            style={[
              styles.totalRow,
              {
                borderTopColor: colors.tint,
                backgroundColor: colors.background,
                marginTop: 12,
              },
            ]}
          >
            <Text
              style={[
                styles.label,
                { color: colors.text, fontWeight: "700" },
              ]}
            >
              PROFIT:
            </Text>
            <Text
              style={[
                styles.value,
                { color: colors.tint, fontWeight: "700", fontSize: 18 },
              ]}
            >
              {formatCurrency(monthlySummary.profit)}
            </Text>
          </View>

          <View style={styles.infoRow}>
            <Text style={[styles.label, { color: colors.text }]}>
              ROI (%):
            </Text>
            <Text style={[styles.value, { color: colors.tint }]}>
              {monthlySummary.roi_percentage.toFixed(2)}%
            </Text>
          </View>
        </View>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  content: {
    padding: 16,
    gap: 16,
    paddingBottom: 32,
  },
  periodTitle: {
    fontSize: 18,
    fontWeight: "700",
    marginBottom: 8,
  },
  section: {
    padding: 14,
    borderRadius: 8,
  },
  sectionTitle: {
    fontSize: 14,
    fontWeight: "700",
    marginBottom: 12,
  },
  subtitle: {
    fontSize: 12,
    fontWeight: "600",
    marginTop: 8,
    marginBottom: 8,
    opacity: 0.7,
  },
  infoRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    paddingVertical: 6,
  },
  totalRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    paddingVertical: 8,
    borderTopWidth: 1,
    marginTop: 8,
    paddingTop: 8,
  },
  label: {
    fontSize: 13,
  },
  value: {
    fontSize: 13,
    fontWeight: "600",
  },
  emptyText: {
    fontSize: 14,
    opacity: 0.6,
    textAlign: "center",
    marginTop: 40,
  },
});
