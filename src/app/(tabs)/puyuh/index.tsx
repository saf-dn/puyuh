import FeedForm from "@/components/forms/FeedForm";
import ProductionForm from "@/components/forms/ProductionForm";
import { PuyuhForm } from "@/components/forms/PuyuhForm";
import { C, S } from "@/constants/theme";
import { useFeedStore } from "@/stores/feedStore";
import { useProductionStore } from "@/stores/productionStore";
import { usePuyuhStore } from "@/stores/puyuhStore";
import { DailyFeed } from "@/types";
import { formatNumber } from "@/utils/format";
import { useCallback, useEffect, useMemo, useState } from "react";
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

function getLatestFeedByPuyuh(
  feeds: DailyFeed[],
  puyuhId: string,
): DailyFeed | undefined {
  return feeds
    .filter((f) => f.puyuh_id === puyuhId)
    .sort((a, b) => b.date.localeCompare(a.date))[0];
}

// ─── Stat Card ───────────────────────────────────────────────────
function StatCard({
  label,
  value,
  sub,
  accent,
}: {
  label: string;
  value: string;
  sub?: string;
  accent?: boolean;
}) {
  return (
    <View style={[sc.statCard, accent && sc.statCardAccent]}>
      <Text
        style={[sc.statLabel, accent && { color: "rgba(255,255,255,0.65)" }]}
      >
        {label}
      </Text>
      <Text style={[sc.statValue, accent && { color: C.white }]}>{value}</Text>
      {sub ? <Text style={sc.statSub}>{sub}</Text> : null}
    </View>
  );
}

// ─── Action Button ───────────────────────────────────────────────
function ActionBtn({
  label,
  color,
  onPress,
  disabled,
}: {
  label: string;
  color: string;
  onPress: () => void;
  disabled?: boolean;
}) {
  return (
    <Pressable
      style={[sc.actionBtn, { backgroundColor: disabled ? C.card2 : color }]}
      onPress={onPress}
      disabled={disabled}
    >
      <Text style={[sc.actionBtnText, disabled && { color: C.textMuted }]}>
        {label}
      </Text>
    </Pressable>
  );
}

// ─── Screen ──────────────────────────────────────────────────────
export default function PuyuhScreen() {
  const [showPuyuhForm, setShowPuyuhForm] = useState(false);
  const [showFeedForm, setShowFeedForm] = useState(false);
  const [showProductionForm, setShowProductionForm] = useState(false);

  const { year, month } = useMemo(() => {
    const now = new Date();
    return { year: now.getFullYear(), month: now.getMonth() + 1 };
  }, []);

  const {
    puyuhGroups,
    feedTypes,
    totalPuyuh,
    isLoading: puyuhLoading,
    error: puyuhError,
    loadPuyuh,
    loadFeedTypes,
    addPuyuh,
    clearError: clearPuyuhError,
  } = usePuyuhStore();
  const {
    feeds,
    dailyFeedKg,
    monthlyFeedKg,
    isLoading: feedLoading,
    error: feedError,
    loadFeeds,
    addFeed,
    clearError: clearFeedError,
  } = useFeedStore();
  const {
    todayProduction,
    monthlyStats,
    isLoading: productionLoading,
    error: productionError,
    loadProductions,
    addProduction,
    clearError: clearProductionError,
  } = useProductionStore();

  const loadAll = useCallback(async () => {
    await Promise.all([
      loadPuyuh(),
      loadFeedTypes(),
      loadFeeds(year, month),
      loadProductions(year, month),
    ]);
  }, [loadPuyuh, loadFeedTypes, loadFeeds, loadProductions, year, month]);

  useEffect(() => {
    loadAll();
  }, [loadAll]);

  const puyuhGroupOptions = useMemo(
    () =>
      puyuhGroups.map((g) => ({
        id: g.id,
        name: `Usia ${g.age_months} bln (${formatNumber(g.count)} ekor)`,
        count: g.count,
      })),
    [puyuhGroups],
  );
  const feedTypeOptions = useMemo(
    () => feedTypes.map((t) => ({ id: t.id, name: t.name })),
    [feedTypes],
  );

  const isLoading = puyuhLoading || feedLoading || productionLoading;
  const error = puyuhError || feedError || productionError;
  const clearAllErrors = () => {
    clearPuyuhError();
    clearFeedError();
    clearProductionError();
  };

  return (
    <SafeAreaView style={sc.safe}>
      <StatusBar barStyle="light-content" backgroundColor={C.bg} />
      <ScrollView
        style={sc.scroll}
        contentContainerStyle={sc.content}
        showsVerticalScrollIndicator={false}
      >
        {/* Page Title - Transparent */}
        <Animated.View entering={FadeInDown.duration(400).delay(100)} style={sc.pageHeader}>
          <Text style={sc.pageSub}>Manajemen Ternak</Text>
          <Text style={sc.pageTitle}>Populasi Puyuh</Text>
        </Animated.View>

        {/* Stats Grid - Borderless, different sizing */}
        <Animated.View entering={FadeInDown.duration(400).delay(200)} style={sc.statsGrid}>
          <StatCard
            label="Total Puyuh"
            value={`${formatNumber(totalPuyuh)} ekor`}
            accent
          />
          <StatCard
            label="Telur Hari Ini"
            value={`${formatNumber(todayProduction?.eggs_produced_count ?? 0)} pcs`}
          />
          <StatCard
            label="Pakan Hari Ini"
            value={`${dailyFeedKg.toFixed(2)} kg`}
          />
          <StatCard
            label="Telur Bulan Ini"
            value={`${formatNumber(monthlyStats?.total_eggs_produced ?? 0)} pcs`}
          />
        </Animated.View>

        {/* Action Buttons - Varying shapes */}
        <Animated.View entering={FadeInDown.duration(400).delay(300)}>
          <View style={sc.sectionHeader}>
            <Text style={sc.sectionTitle}>Aksi Cepat</Text>
          </View>
          <View style={sc.actionGrid}>
            <ActionBtn
              label="➕ Tambah Puyuh"
              color={C.red}
              onPress={() => setShowPuyuhForm(true)}
            />
            <ActionBtn
              label="🌾 Catat Pakan"
              color="#1565C0"
              onPress={() => setShowFeedForm(true)}
              disabled={puyuhGroups.length === 0}
            />
            <ActionBtn
              label="🥚 Catat Produksi"
              color="#2E7D32"
              onPress={() => setShowProductionForm(true)}
            />
          </View>
        </Animated.View>

        {/* Today Production Banner - Borderless */}
        <Animated.View entering={FadeInDown.duration(400).delay(400)}>
          {todayProduction ? (
            <View style={sc.todayBanner}>
              <View style={sc.todayLeft}>
                <Text style={sc.todayLabel}>Produksi Hari Ini</Text>
                <Text style={sc.todayDate}>{todayProduction.date}</Text>
              </View>
              <View style={sc.todayStats}>
                <View style={sc.todayStat}>
                  <Text style={sc.todayStatVal}>
                    {formatNumber(todayProduction.eggs_produced_count)}
                  </Text>
                  <Text style={sc.todayStatLabel}>Dihasilkan</Text>
                </View>
                <View style={[sc.todayStat, sc.todayStatBorder]}>
                  <Text style={[sc.todayStatVal, { color: C.income }]}>
                    {formatNumber(todayProduction.eggs_sold_count)}
                  </Text>
                  <Text style={sc.todayStatLabel}>Terjual</Text>
                </View>
                <View style={sc.todayStat}>
                  <Text style={[sc.todayStatVal, { color: C.expense }]}>
                    {formatNumber(todayProduction.eggs_broken_count)}
                  </Text>
                  <Text style={sc.todayStatLabel}>Pecah</Text>
                </View>
              </View>
            </View>
          ) : (
            <View style={sc.noProdBanner}>
              <Text style={sc.noProdText}>
                🥚 Belum ada catatan produksi hari ini
              </Text>
            </View>
          )}
        </Animated.View>

        {/* Puyuh Groups - Transparent header, borderless cards */}
        <Animated.View entering={FadeInDown.duration(400).delay(500)}>
          <View style={sc.sectionHeader}>
            <Text style={sc.sectionTitle}>Kelompok Puyuh</Text>
            <Text style={sc.sectionCount}>{puyuhGroups.length} grup</Text>
          </View>

          {isLoading ? (
            <ActivityIndicator color={C.red} style={{ marginVertical: 16 }} />
          ) : puyuhGroups.length === 0 ? (
            <View style={sc.emptyBox}>
              <Text style={sc.emptyIcon}>🐦</Text>
              <Text style={sc.emptyText}>Belum ada data puyuh</Text>
            </View>
          ) : (
            <View style={sc.groupList}>
              {puyuhGroups.map((item, idx) => {
                const latestFeed = getLatestFeedByPuyuh(feeds, item.id);
                const statusColor =
                  item.status === "active"
                    ? C.income
                    : item.status === "sick"
                      ? C.expense
                      : C.textSecondary;
                return (
                  <Animated.View
                    entering={FadeInDown.duration(400).delay(600 + idx * 100)}
                    key={item.id}
                    style={sc.groupCard}
                  >
                    <View style={sc.groupTop}>
                      <View style={sc.groupMeta}>
                        <Text style={sc.groupAge}>
                          Usia {item.age_months} bulan
                        </Text>
                        <View
                          style={[
                            sc.statusBadge,
                            { backgroundColor: statusColor + "25" },
                          ]}
                        >
                          <View
                            style={[
                              sc.statusDot,
                              { backgroundColor: statusColor },
                            ]}
                          />
                          <Text style={[sc.statusText, { color: statusColor }]}>
                            {item.status}
                          </Text>
                        </View>
                      </View>
                      <Text style={sc.groupCount}>
                        {formatNumber(item.count)} ekor
                      </Text>
                    </View>

                    {latestFeed ? (
                      <View style={sc.feedInfo}>
                        <Text style={sc.feedInfoText}>
                          🌾 {latestFeed.frequency_per_day}x/hari ·{" "}
                          {latestFeed.amount_per_bird}g/ekor ·{" "}
                          {latestFeed.total_amount.toFixed(2)} kg total
                        </Text>
                      </View>
                    ) : (
                      <Text style={sc.noFeedText}>Belum ada catatan pakan</Text>
                    )}

                    {item.notes ? (
                      <Text style={sc.groupNotes}>📝 {item.notes}</Text>
                    ) : null}
                  </Animated.View>
                );
              })}
            </View>
          )}
        </Animated.View>

        {/* Error */}
        {error ? (
          <Pressable style={sc.errorBar} onPress={clearAllErrors}>
            <Text style={sc.errorText}>⚠ {error} (tap untuk tutup)</Text>
          </Pressable>
        ) : null}
      </ScrollView>

      {/* Forms */}
      <PuyuhForm
        visible={showPuyuhForm}
        onSubmit={addPuyuh}
        onClose={() => setShowPuyuhForm(false)}
        isLoading={puyuhLoading}
      />
      <FeedForm
        key={showFeedForm ? "feed-open" : "feed-closed"}
        visible={showFeedForm}
        onClose={() => setShowFeedForm(false)}
        onSubmit={addFeed}
        puyuhGroups={puyuhGroupOptions}
        feedTypes={feedTypeOptions}
        loading={feedLoading}
      />
      <ProductionForm
        key={showProductionForm ? "prod-open" : "prod-closed"}
        visible={showProductionForm}
        onClose={() => setShowProductionForm(false)}
        onSubmit={addProduction}
        loading={productionLoading}
      />
    </SafeAreaView>
  );
}

// ─── Styles ──────────────────────────────────────────────────────
const sc = StyleSheet.create({
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

  // Stats grid - Borderless
  statsGrid: { flexDirection: "row", flexWrap: "wrap", gap: 16 },
  statCard: {
    width: "47%",
    backgroundColor: C.card,
    borderRadius: 20,
    padding: 20,
    gap: 6,
  },
  statCardAccent: { backgroundColor: C.red },
  statLabel: {
    color: C.textSecondary,
    fontSize: 11,
    fontWeight: "700",
    textTransform: "uppercase",
    letterSpacing: 0.5,
  },
  statValue: { color: C.textPrimary, fontSize: 20, fontWeight: "900" },
  statSub: { color: C.expense, fontSize: 11, marginTop: 4 },

  // Section header - Transparent
  sectionHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 12,
  },
  sectionTitle: { color: C.textPrimary, fontSize: 20, fontWeight: "800" },
  sectionCount: { color: C.textSecondary, fontSize: 14, fontWeight: "600" },

  // Action grid - Borderless
  actionGrid: { gap: 12 },
  actionBtn: { paddingVertical: 16, borderRadius: 20, alignItems: "center" },
  actionBtnText: { color: C.white, fontWeight: "800", fontSize: 15 },

  // Today production banner - Borderless, distinct sizing
  todayBanner: {
    backgroundColor: C.card,
    borderRadius: 24,
    padding: 24,
    flexDirection: "row",
    alignItems: "center",
    gap: 16,
  },
  todayLeft: { flex: 1 },
  todayLabel: { color: C.textPrimary, fontSize: 16, fontWeight: "800" },
  todayDate: { color: C.textSecondary, fontSize: 12, marginTop: 4 },
  todayStats: { flexDirection: "row", gap: 0 },
  todayStat: { alignItems: "center", paddingHorizontal: 12 },
  todayStatBorder: {
    borderLeftWidth: 1,
    borderRightWidth: 1,
    borderColor: C.border,
  },
  todayStatVal: { color: C.textPrimary, fontSize: 18, fontWeight: "900" },
  todayStatLabel: { color: C.textSecondary, fontSize: 11, marginTop: 4, fontWeight: "600" },

  noProdBanner: {
    backgroundColor: C.card,
    borderRadius: 24,
    padding: 24,
    alignItems: "center",
  },
  noProdText: { color: C.textSecondary, fontSize: 14, fontWeight: "600" },

  // Group list - Borderless
  groupList: { gap: 16 },
  groupCard: {
    backgroundColor: C.card,
    borderRadius: 24,
    padding: 24,
    gap: 16,
  },
  groupTop: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
  },
  groupMeta: { gap: 8 },
  groupAge: { color: C.textPrimary, fontSize: 16, fontWeight: "800" },
  groupCount: { color: C.textPrimary, fontSize: 22, fontWeight: "900" },
  statusBadge: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 999,
    alignSelf: "flex-start",
  },
  statusDot: { width: 6, height: 6, borderRadius: 3 },
  statusText: { fontSize: 12, fontWeight: "700", textTransform: "capitalize" },
  feedInfo: { backgroundColor: C.card2, borderRadius: 16, padding: 16 },
  feedInfoText: { color: C.textSecondary, fontSize: 13, fontWeight: "600" },
  noFeedText: { color: C.textMuted, fontSize: 13, fontStyle: "italic", fontWeight: "600" },
  groupNotes: { color: C.textSecondary, fontSize: 13, marginTop: 4 },

  // Empty
  emptyBox: {
    backgroundColor: C.card,
    borderRadius: 24,
    padding: 40,
    alignItems: "center",
    gap: 12,
  },
  emptyIcon: { fontSize: 48 },
  emptyText: { color: C.textPrimary, fontSize: 16, fontWeight: "700" },

  // Error
  errorBar: {
    backgroundColor: "#7F1D1D",
    borderRadius: 16,
    padding: 16,
    alignItems: "center",
  },
  errorText: { color: "#FCA5A5", fontSize: 14, fontWeight: "700" },
});
