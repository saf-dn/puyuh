import { useColorScheme, Pressable, StyleSheet, Text, View, FlatList, ActivityIndicator } from "react-native";
import { DarkTheme, DefaultTheme } from "expo-router";
import { useEffect, useState } from "react";
import { usePuyuhStore } from "@/stores/puyuhStore";
import { PuyuhForm } from "@/components/forms/PuyuhForm";
import { formatNumber } from "@/utils/format";

export default function PuyuhScreen() {
  const colorScheme = useColorScheme();
  const isDark = colorScheme === "dark";
  const colors = isDark ? DarkTheme.colors : DefaultTheme.colors;

  const [showForm, setShowForm] = useState(false);

  const {
    puyuhGroups,
    totalPuyuh,
    isLoading,
    loadPuyuh,
    addPuyuh,
  } = usePuyuhStore();

  useEffect(() => {
    loadPuyuh();
  }, [loadPuyuh]);

  return (
    <>
      <View style={[styles.container, { backgroundColor: colors.background }]}>
        {/* Summary */}
        <View style={styles.header}>
          <View style={[styles.summaryCard, { backgroundColor: colors.card }]}>
            <Text style={[styles.summaryLabel, { color: colors.text }]}>
              Total Puyuh
            </Text>
            <Text style={[styles.summaryValue, { color: colors.tint }]}>
              {formatNumber(totalPuyuh)} ekor
            </Text>
          </View>
        </View>

        {/* Puyuh Groups List */}
        {isLoading ? (
          <ActivityIndicator
            size="large"
            color={colors.tint}
            style={styles.loader}
          />
        ) : (
          <FlatList
            data={puyuhGroups}
            keyExtractor={(item) => item.id}
            renderItem={({ item }) => (
              <View
                style={[styles.groupCard, { backgroundColor: colors.card }]}
              >
                <View style={styles.groupContent}>
                  <Text
                    style={[styles.groupAge, { color: colors.text }]}
                  >
                    Usia: {item.age_months} bulan
                  </Text>
                  <Text style={styles.groupStatus}>
                    Status: {item.status}
                  </Text>
                  {item.notes && (
                    <Text style={styles.groupNotes}>
                      Catatan: {item.notes}
                    </Text>
                  )}
                </View>
                <Text style={[styles.groupCount, { color: colors.tint }]}>
                  {formatNumber(item.count)} ekor
                </Text>
              </View>
            )}
            ListEmptyComponent={
              <View style={styles.emptyContainer}>
                <Text style={[styles.emptyText, { color: colors.text }]}>
                  Belum ada data puyuh
                </Text>
              </View>
            }
            contentContainerStyle={styles.listContent}
          />
        )}

        <Pressable
          style={[styles.fab, { backgroundColor: colors.tint }]}
          onPress={() => setShowForm(true)}
        >
          <Text style={styles.fabText}>+ Tambah Grup Puyuh</Text>
        </Pressable>
      </View>

      <PuyuhForm
        visible={showForm}
        onSubmit={addPuyuh}
        onClose={() => setShowForm(false)}
        isLoading={isLoading}
      />
    </>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    padding: 16,
    gap: 12,
  },
  summaryCard: {
    padding: 16,
    borderRadius: 8,
    alignItems: "center",
  },
  summaryLabel: {
    fontSize: 12,
    opacity: 0.7,
    marginBottom: 4,
  },
  summaryValue: {
    fontSize: 24,
    fontWeight: "700",
  },
  listContent: {
    paddingHorizontal: 16,
    paddingBottom: 100,
    gap: 12,
  },
  groupCard: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    padding: 14,
    borderRadius: 8,
  },
  groupContent: {
    flex: 1,
  },
  groupAge: {
    fontSize: 14,
    fontWeight: "600",
    marginBottom: 4,
  },
  groupStatus: {
    fontSize: 12,
    opacity: 0.6,
    marginBottom: 2,
  },
  groupNotes: {
    fontSize: 11,
    opacity: 0.6,
    fontStyle: "italic",
  },
  groupCount: {
    fontSize: 16,
    fontWeight: "700",
  },
  emptyContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    paddingVertical: 40,
  },
  emptyText: {
    fontSize: 14,
    opacity: 0.6,
  },
  fab: {
    position: "absolute",
    bottom: 20,
    right: 20,
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 50,
    alignItems: "center",
  },
  fabText: {
    color: "white",
    fontWeight: "600",
    fontSize: 14,
  },
  loader: {
    flex: 1,
  },
});
