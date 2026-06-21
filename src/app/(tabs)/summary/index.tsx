import { C, S } from "@/constants/theme";
import { useSummaryStore } from "@/stores/summaryStore";
import { formatCurrency, formatNumber, getMonthYear } from "@/utils/format";
import { useCallback, useEffect } from "react";
import {
  ActivityIndicator,
  ColorValue,
  Pressable,
  SafeAreaView,
  ScrollView,
  StatusBar,
  StyleSheet,
  Text,
  View,
} from "react-native";
import Animated, { FadeInDown } from "react-native-reanimated";

// ─── Info Row ────────────────────────────────────────────────────
function InfoRow({
  label,
  value,
  valueColor,
  bold,
}: {
  label: string;
  value: string;
  valueColor?: ColorValue;
  bold?: boolean;
}) {
  return (
    <View style={ss.infoRow}>
      <Text
        style={[
          ss.infoLabel,
          bold && { fontWeight: "700", color: C.textPrimary },
        ]}
      >
        {label}
      </Text>
      <Text
        style={[
          ss.infoValue,
          valueColor ? { color: valueColor } : {},
          bold && { fontWeight: "800" },
        ]}
      >
        {value}
      </Text>
    </View>
  );
}

// ─── Section Card ────────────────────────────────────────────────
function SectionCard({
  title,
  accent,
  children,
}: {
  title: string;
  accent?: string;
  children: React.ReactNode;
}) {
  return (
    <View style={ss.sectionCard}>
      <View style={ss.sectionCardHeader}>
        {accent ? (
          <View style={[ss.sectionAccentDot, { backgroundColor: accent }]} />
        ) : null}
        <Text style={ss.sectionCardTitle}>{title}</Text>
      </View>
      {children}
    </View>
  );
}

// ─── Metric Big ──────────────────────────────────────────────────
function MetricBig({
  label,
  value,
  color,
}: {
  label: string;
  value: string;
  color?: string;
}) {
  return (
    <View style={ss.metricBig}>
      <Text style={ss.metricBigLabel}>{label}</Text>
      <Text style={[ss.metricBigValue, color ? { color } : {}]}>{value}</Text>
    </View>
  );
}

// ─── Screen ──────────────────────────────────────────────────────
export default function SummaryScreen() {
  const { monthlySummary, isLoading, loadMonthlySummary } = useSummaryStore();

  const now = new Date();
  const year = now.getFullYear();
  const month = now.getMonth() + 1;

  const loadData = useCallback(() => {
    loadMonthlySummary(year, month);
  }, [loadMonthlySummary, year, month]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  if (isLoading) {
    return (
      <SafeAreaView style={ss.safe}>
        <StatusBar barStyle="light-content" backgroundColor={C.bg} />
        <View
          style={{ flex: 1, justifyContent: "center", alignItems: "center" }}
        >
          <ActivityIndicator size="large" color={C.red} />
          <Text style={{ color: C.textSecondary, marginTop: 12, fontSize: 13 }}>
            Memuat data...
          </Text>
        </View>
      </SafeAreaView>
    );
  }

  if (!monthlySummary) {
    return (
      <SafeAreaView style={ss.safe}>
        <StatusBar barStyle="light-content" backgroundColor={C.bg} />
        <View
          style={{
            flex: 1,
            justifyContent: "center",
            alignItems: "center",
            padding: S.lg,
          }}
        >
          <Text style={{ fontSize: 48, marginBottom: 16 }}>📊</Text>
          <Text
            style={{
              color: C.textPrimary,
              fontSize: 18,
              fontWeight: "800",
              marginBottom: 8,
            }}
          >
            Belum ada data
          </Text>
          <Text
            style={{
              color: C.textSecondary,
              fontSize: 14,
              textAlign: "center",
              marginBottom: 24,
            }}
          >
            Mulai dengan menambahkan data puyuh dan transaksi
          </Text>
          <Pressable style={ss.retryBtn} onPress={loadData}>
            <Text style={{ color: C.white, fontWeight: "800", fontSize: 15 }}>
              Muat Ulang
            </Text>
          </Pressable>
        </View>
      </SafeAreaView>
    );
  }

  const s = monthlySummary;
  const profitColor = s.profit >= 0 ? C.income : C.expense;

  return (
    <SafeAreaView style={ss.safe}>
      <StatusBar barStyle="light-content" backgroundColor={C.bg} />
      <ScrollView
        style={ss.scroll}
        contentContainerStyle={ss.content}
        showsVerticalScrollIndicator={false}
      >
        {/* Page Header - Transparent */}
        <Animated.View entering={FadeInDown.duration(400).delay(100)} style={ss.pageHeader}>
          <Text style={ss.pageSub}>Laporan Bulanan</Text>
          <Text style={ss.pageTitle}>{getMonthYear(year, month)}</Text>
        </Animated.View>

        {/* Profit Hero - Borderless, Soft styling */}
        <Animated.View entering={FadeInDown.duration(400).delay(200)} style={ss.heroCard}>
          <Text style={ss.heroLabel}>Profit / Rugi Bersih</Text>
          <Text style={[ss.heroProfit, { color: profitColor }]}>
            {s.profit >= 0 ? "+" : ""}
            {formatCurrency(s.profit)}
          </Text>
          <View style={ss.heroRow}>
            <View style={ss.heroPill}>
              <Text style={ss.heroPillText}>
                ROI: {s.roi_percentage.toFixed(2)}%
              </Text>
            </View>
            <Text style={ss.heroPeriod}>{s.period}</Text>
          </View>
        </Animated.View>

        {/* Finance Summary Row - Borderless, dark background contrast */}
        <Animated.View entering={FadeInDown.duration(400).delay(300)} style={ss.finRow}>
          <View style={[ss.finCard, { backgroundColor: "#0F2A1F" }]}>
            <Text style={ss.finLabel}>Total Pendapatan</Text>
            <Text style={[ss.finAmount, { color: C.income }]}>
              {formatCurrency(s.total_income)}
            </Text>
          </View>
          <View style={[ss.finCard, { backgroundColor: "#2A0F0F" }]}>
            <Text style={ss.finLabel}>Total Pengeluaran</Text>
            <Text style={[ss.finAmount, { color: C.expense }]}>
              {formatCurrency(s.total_expense)}
            </Text>
          </View>
        </Animated.View>

        {/* Puyuh Section - Borderless, spacing distinct */}
        <Animated.View entering={FadeInDown.duration(400).delay(400)}>
          <SectionCard title="Populasi Puyuh" accent={C.red}>
            <View style={ss.metricRow}>
              <MetricBig
                label="Total Ekor"
                value={`${formatNumber(s.total_puyuh)}`}
                color={C.textPrimary}
              />
              <MetricBig
                label="Mati Bulan Ini"
                value={`${formatNumber(s.puyuh_died_count)}`}
                color={s.puyuh_died_count > 0 ? C.expense : C.textPrimary}
              />
            </View>
            {s.puyuh_by_age.map((g) => (
              <InfoRow
                key={`${g.age_months}-${g.status}`}
                label={`Usia ${g.age_months} bln (${g.status})`}
                value={`${formatNumber(g.count)} ekor`}
              />
            ))}
          </SectionCard>
        </Animated.View>

        {/* Production Section */}
        <Animated.View entering={FadeInDown.duration(400).delay(500)}>
          <SectionCard title="Produksi Telur" accent={C.income}>
            <View style={ss.metricRow}>
              <MetricBig
                label="Per Bulan"
                value={`${formatNumber(s.eggs_produced)}`}
                color={C.textPrimary}
              />
              <MetricBig
                label="Rata-rata / Hari"
                value={`${formatNumber(s.avg_eggs_per_day)}`}
                color={C.income}
              />
            </View>
            <InfoRow
              label="Harga Rata-rata / Pcs"
              value={formatCurrency(s.avg_price_per_egg)}
            />
            <InfoRow
              label="Terjual"
              value={`${formatNumber(s.eggs_sold)} pcs`}
              valueColor={C.income}
            />
            <InfoRow
              label="Belum Dijual"
              value={`${formatNumber(s.eggs_available)} pcs`}
              valueColor="#F59E0B"
            />
            <InfoRow
              label="Pecah / Rusak"
              value={`${formatNumber(s.eggs_broken)} pcs`}
              valueColor={C.expense}
            />
          </SectionCard>
        </Animated.View>

        {/* Feed Section */}
        <Animated.View entering={FadeInDown.duration(400).delay(600)}>
          <SectionCard title="Konsumsi Pakan" accent="#F59E0B">
            <View style={ss.metricRow}>
              <MetricBig
                label="Total / Bulan"
                value={`${s.total_feed_kg.toFixed(1)} kg`}
                color={C.textPrimary}
              />
              <MetricBig
                label="Rata-rata / Hari"
                value={`${s.avg_feed_per_day.toFixed(2)} kg`}
                color="#F59E0B"
              />
            </View>
            <InfoRow
              label="Biaya Pakan"
              value={formatCurrency(s.total_feed_cost)}
              valueColor={C.expense}
              bold
            />
          </SectionCard>
        </Animated.View>

        {/* Finance Detail */}
        <Animated.View entering={FadeInDown.duration(400).delay(700)}>
          <SectionCard title="Rincian Keuangan" accent={C.income}>
            {/* Income by category */}
            {Object.keys(s.income_by_category).length > 0 ? (
              <>
                <Text style={ss.subSectionLabel}>Pendapatan per Kategori</Text>
                {Object.entries(s.income_by_category).map(([cat, amt]) => (
                  <InfoRow
                    key={cat}
                    label={cat}
                    value={formatCurrency(amt)}
                    valueColor={C.income}
                  />
                ))}
              </>
            ) : null}
            <InfoRow
              label="Total Pendapatan"
              value={formatCurrency(s.total_income)}
              valueColor={C.income}
              bold
            />

            <View style={ss.divider} />

            {/* Expense by category */}
            {Object.keys(s.expense_by_category).length > 0 ? (
              <>
                <Text style={ss.subSectionLabel}>Pengeluaran per Kategori</Text>
                {Object.entries(s.expense_by_category).map(([cat, amt]) => (
                  <InfoRow
                    key={cat}
                    label={cat}
                    value={formatCurrency(amt)}
                    valueColor={C.expense}
                  />
                ))}
              </>
            ) : null}
            <InfoRow
              label="Total Pengeluaran"
              value={formatCurrency(s.total_expense)}
              valueColor={C.expense}
              bold
            />

            <View style={ss.divider} />

            {/* Bottom profit line */}
            <View style={ss.profitLine}>
              <Text style={ss.profitLineLabel}>PROFIT BERSIH</Text>
              <Text style={[ss.profitLineValue, { color: profitColor }]}>
                {s.profit >= 0 ? "+" : ""}
                {formatCurrency(s.profit)}
              </Text>
            </View>
          </SectionCard>
        </Animated.View>
      </ScrollView>
    </SafeAreaView>
  );
}

// ─── Styles ──────────────────────────────────────────────────────
const ss = StyleSheet.create({
  safe: { flex: 1, backgroundColor: C.bg },
  scroll: { flex: 1 },
  content: { padding: S.lg, paddingBottom: S.xl, gap: 24 },

  // Page header - Transparent
  pageHeader: { paddingTop: S.sm },
  pageSub: { color: C.textSecondary, fontSize: 13, fontWeight: "500", textTransform: "uppercase", letterSpacing: 1 },
  pageTitle: {
    color: C.textPrimary,
    fontSize: 28,
    fontWeight: "900",
    marginTop: 4,
  },

  // Hero - Borderless
  heroCard: {
    backgroundColor: C.card,
    borderRadius: 24,
    padding: 28,
  },
  heroLabel: {
    color: C.textSecondary,
    fontSize: 13,
    fontWeight: "700",
    marginBottom: 8,
    textTransform: "uppercase",
    letterSpacing: 1,
  },
  heroProfit: {
    fontSize: 40,
    fontWeight: "900",
    letterSpacing: -1.5,
    marginBottom: 16,
  },
  heroRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  heroPill: {
    backgroundColor: C.card2,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 999,
  },
  heroPillText: { color: C.textPrimary, fontSize: 13, fontWeight: "700" },
  heroPeriod: { color: C.textMuted, fontSize: 13, fontWeight: "600" },

  // Finance row - Borderless
  finRow: { flexDirection: "row", gap: 16 },
  finCard: {
    flex: 1,
    borderRadius: 20,
    padding: 20,
    gap: 6,
  },
  finLabel: { color: C.textSecondary, fontSize: 12, fontWeight: "700", textTransform: "uppercase", letterSpacing: 0.5 },
  finAmount: { fontSize: 18, fontWeight: "900" },

  // Section card - Borderless
  sectionCard: {
    backgroundColor: C.card,
    borderRadius: 24,
    padding: 24,
    gap: 12,
  },
  sectionCardHeader: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    marginBottom: 8,
  },
  sectionAccentDot: { width: 10, height: 10, borderRadius: 5 },
  sectionCardTitle: { color: C.textPrimary, fontSize: 18, fontWeight: "800" },

  // Metric big - Soft bg, borderless
  metricRow: { flexDirection: "row", gap: 12, marginBottom: 8 },
  metricBig: {
    flex: 1,
    backgroundColor: C.card2,
    borderRadius: 16,
    padding: 16,
    gap: 4,
  },
  metricBigLabel: { color: C.textSecondary, fontSize: 12, fontWeight: "700" },
  metricBigValue: { color: C.textPrimary, fontSize: 24, fontWeight: "900" },

  // Info row
  infoRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingVertical: 8,
  },
  infoLabel: { color: C.textSecondary, fontSize: 14, flex: 1, fontWeight: "500" },
  infoValue: {
    color: C.textPrimary,
    fontSize: 14,
    fontWeight: "700",
    textAlign: "right",
  },

  // Sub section
  subSectionLabel: {
    color: C.textMuted,
    fontSize: 12,
    fontWeight: "800",
    textTransform: "uppercase",
    letterSpacing: 1,
    marginTop: 8,
    marginBottom: 4,
  },
  divider: { height: 1, backgroundColor: C.border, marginVertical: 12 },

  // Profit line
  profitLine: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingTop: 8,
  },
  profitLineLabel: {
    color: C.textSecondary,
    fontSize: 14,
    fontWeight: "800",
    textTransform: "uppercase",
    letterSpacing: 1,
  },
  profitLineValue: { fontSize: 24, fontWeight: "900" },

  // Misc
  retryBtn: {
    backgroundColor: C.red,
    paddingHorizontal: 24,
    paddingVertical: 16,
    borderRadius: 20,
  },
});
