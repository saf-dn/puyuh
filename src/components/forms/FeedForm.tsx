import { fadedColor } from "@/constants/theme";
import { DarkTheme, DefaultTheme } from "expo-router";
import { useState } from "react";
import {
  KeyboardAvoidingView,
  Modal,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  useColorScheme,
  View,
} from "react-native";

interface Option {
  id: string;
  name: string;
}

interface FeedFormProps {
  visible: boolean;
  onClose: () => void;
  onSubmit: (data: {
    puyuhGroupId: string;
    feedTypeId: string;
    frequencyPerDay: number;
    amountPerBird: number;
  }) => Promise<void>;
  puyuhGroups: { id: string; name: string; count: number }[];
  feedTypes: { id: string; name: string }[];
  loading?: boolean;
}

function ChipSelect({
  options,
  selectedId,
  onSelect,
  colors,
}: {
  options: Option[];
  selectedId: string;
  onSelect: (id: string) => void;
  colors: (typeof DarkTheme)["colors"];
}) {
  if (options.length === 0) {
    return (
      <Text style={{ color: colors.text, opacity: 0.6, fontSize: 13 }}>
        Tidak ada pilihan tersedia
      </Text>
    );
  }

  return (
    <View style={styles.chipRow}>
      {options.map((option) => {
        const selected = selectedId === option.id;
        return (
          <Pressable
            key={option.id}
            style={[
              styles.chip,
              {
                backgroundColor: selected ? colors.primary : colors.card,
                borderColor: selected ? colors.primary : colors.border,
              },
            ]}
            onPress={() => onSelect(option.id)}
          >
            <Text
              style={{
                color: selected ? "white" : colors.text,
                fontSize: 12,
                fontWeight: "600",
              }}
            >
              {option.name}
            </Text>
          </Pressable>
        );
      })}
    </View>
  );
}

export default function FeedForm({
  visible,
  onClose,
  onSubmit,
  puyuhGroups,
  feedTypes,
  loading = false,
}: FeedFormProps) {
  const colorScheme = useColorScheme();
  const isDark = colorScheme === "dark";
  const colors = isDark ? DarkTheme.colors : DefaultTheme.colors;

  const [formData, setFormData] = useState({
    puyuhGroupId: puyuhGroups[0]?.id || "",
    feedTypeId: feedTypes[0]?.id || "",
    frequencyPerDay: "",
    amountPerBird: "",
  });

  const [errors, setErrors] = useState<Record<string, string>>({});

  const resetForm = () => {
    setFormData({
      puyuhGroupId: puyuhGroups[0]?.id || "",
      feedTypeId: feedTypes[0]?.id || "",
      frequencyPerDay: "",
      amountPerBird: "",
    });
    setErrors({});
  };

  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {};

    if (!formData.puyuhGroupId) {
      newErrors.puyuhGroupId = "Pilih kelompok puyuh";
    }

    if (!formData.feedTypeId) {
      newErrors.feedTypeId = "Pilih jenis pakan";
    }

    if (!formData.frequencyPerDay.trim()) {
      newErrors.frequencyPerDay = "Frekuensi pemberian harus diisi";
    } else if (
      isNaN(Number(formData.frequencyPerDay)) ||
      Number(formData.frequencyPerDay) <= 0
    ) {
      newErrors.frequencyPerDay = "Masukkan angka yang valid (> 0)";
    }

    if (!formData.amountPerBird.trim()) {
      newErrors.amountPerBird = "Jumlah pakan per ekor harus diisi";
    } else if (
      isNaN(Number(formData.amountPerBird)) ||
      Number(formData.amountPerBird) <= 0
    ) {
      newErrors.amountPerBird = "Masukkan jumlah yang valid (> 0, dalam gram)";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async () => {
    if (!validateForm()) {
      return;
    }

    try {
      await onSubmit({
        puyuhGroupId: formData.puyuhGroupId,
        feedTypeId: formData.feedTypeId,
        frequencyPerDay: Number(formData.frequencyPerDay),
        amountPerBird: Number(formData.amountPerBird),
      });
      onClose();
    } catch {
      // Error handled by parent store
    }
  };

  const handleClose = () => {
    onClose();
  };

  const selectedGroup = puyuhGroups.find((g) => g.id === formData.puyuhGroupId);
  const totalAmountPerDay = selectedGroup
    ? ((Number(formData.amountPerBird) || 0) *
        (Number(formData.frequencyPerDay) || 0) *
        selectedGroup.count) /
      1000
    : 0;

  return (
    <Modal
      visible={visible}
      animationType="slide"
      onRequestClose={handleClose}
      transparent={true}
    >
      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        style={[styles.container, { backgroundColor: colors.background }]}
      >
        <View style={[styles.header, { borderBottomColor: colors.border }]}>
          <Pressable onPress={handleClose}>
            <Text style={{ color: colors.primary, fontSize: 16 }}>Batal</Text>
          </Pressable>
          <Text style={[styles.headerTitle, { color: colors.text }]}>
            Pemberian Pakan Hari Ini
          </Text>
          <Pressable onPress={handleSubmit} disabled={loading}>
            <Text
              style={{ color: colors.primary, fontSize: 16, fontWeight: "600" }}
            >
              {loading ? "Simpan..." : "Simpan"}
            </Text>
          </Pressable>
        </View>

        <ScrollView
          contentContainerStyle={styles.scrollContent}
          keyboardShouldPersistTaps="handled"
        >
          <View style={styles.section}>
            <Text style={[styles.sectionTitle, { color: colors.text }]}>
              Data Pakan
            </Text>

            <View style={styles.inputGroup}>
              <Text style={[styles.label, { color: colors.text }]}>
                Kelompok Puyuh *
              </Text>
              <ChipSelect
                options={puyuhGroups}
                selectedId={formData.puyuhGroupId}
                onSelect={(id) =>
                  setFormData({ ...formData, puyuhGroupId: id })
                }
                colors={colors}
              />
              {errors.puyuhGroupId && (
                <Text style={styles.errorText}>{errors.puyuhGroupId}</Text>
              )}
            </View>

            <View style={styles.inputGroup}>
              <Text style={[styles.label, { color: colors.text }]}>
                Jenis Pakan *
              </Text>
              <ChipSelect
                options={feedTypes}
                selectedId={formData.feedTypeId}
                onSelect={(id) => setFormData({ ...formData, feedTypeId: id })}
                colors={colors}
              />
              {errors.feedTypeId && (
                <Text style={styles.errorText}>{errors.feedTypeId}</Text>
              )}
            </View>

            <View style={styles.inputGroup}>
              <Text style={[styles.label, { color: colors.text }]}>
                Frekuensi Pemberian per Hari *
              </Text>
              <TextInput
                style={[
                  styles.input,
                  {
                    backgroundColor: colors.card,
                    color: colors.text,
                    borderColor: errors.frequencyPerDay
                      ? "#C62828"
                      : colors.border,
                  },
                ]}
                placeholder="Contoh: 3"
                placeholderTextColor={fadedColor(colors.text)}
                keyboardType="decimal-pad"
                value={formData.frequencyPerDay}
                onChangeText={(text) =>
                  setFormData({ ...formData, frequencyPerDay: text })
                }
                editable={!loading}
              />
              {errors.frequencyPerDay && (
                <Text style={styles.errorText}>{errors.frequencyPerDay}</Text>
              )}
            </View>

            <View style={styles.inputGroup}>
              <Text style={[styles.label, { color: colors.text }]}>
                Jumlah Pakan per Ekor (gram) *
              </Text>
              <TextInput
                style={[
                  styles.input,
                  {
                    backgroundColor: colors.card,
                    color: colors.text,
                    borderColor: errors.amountPerBird
                      ? "#C62828"
                      : colors.border,
                  },
                ]}
                placeholder="Contoh: 25"
                placeholderTextColor={fadedColor(colors.text)}
                keyboardType="decimal-pad"
                value={formData.amountPerBird}
                onChangeText={(text) =>
                  setFormData({ ...formData, amountPerBird: text })
                }
                editable={!loading}
              />
              {errors.amountPerBird && (
                <Text style={styles.errorText}>{errors.amountPerBird}</Text>
              )}
            </View>

            <View
              style={[
                styles.summaryBox,
                { backgroundColor: colors.card, borderColor: colors.border },
              ]}
            >
              <View style={styles.summaryRow}>
                <Text style={[styles.summaryLabel, { color: colors.text }]}>
                  Total Pakan per Hari:
                </Text>
                <Text style={[styles.summaryValue, { color: colors.text }]}>
                  {totalAmountPerDay.toFixed(2)} kg
                </Text>
              </View>
              <Text style={[styles.summaryNote, { color: colors.text }]}>
                {selectedGroup
                  ? `${selectedGroup.count} ekor × ${formData.amountPerBird || 0}g × ${formData.frequencyPerDay || 0}x`
                  : "Pilih kelompok terlebih dahulu"}
              </Text>
            </View>

            {/* Reset Button */}
            <Pressable
              style={[styles.resetBtn, { borderColor: colors.border }]}
              onPress={resetForm}
              disabled={loading}
            >
              <Text style={styles.resetBtnText}>🔄 Reset Form</Text>
            </Pressable>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </Modal>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 16,
    paddingTop: 16,
    paddingBottom: 16,
    borderBottomWidth: 1,
  },
  headerTitle: { fontSize: 18, fontWeight: "700" },
  scrollContent: { padding: 16, gap: 20 },
  section: { gap: 12 },
  sectionTitle: { fontSize: 14, fontWeight: "600", marginBottom: 8 },
  inputGroup: { gap: 8 },
  label: { fontSize: 13, fontWeight: "600" },
  input: {
    borderWidth: 1,
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 12,
    fontSize: 14,
  },
  chipRow: { flexDirection: "row", flexWrap: "wrap", gap: 8 },
  chip: {
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 20,
    borderWidth: 1,
  },
  errorText: { color: "#C62828", fontSize: 12, fontWeight: "500" },
  summaryBox: { borderWidth: 1, borderRadius: 8, padding: 12, marginTop: 8 },
  summaryRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  summaryLabel: { fontSize: 13, fontWeight: "600" },
  summaryValue: { fontSize: 14, fontWeight: "700" },
  summaryNote: { fontSize: 11, marginTop: 4, opacity: 0.7 },
  resetBtn: {
    borderWidth: 1,
    borderRadius: 10,
    paddingVertical: 14,
    alignItems: "center" as const,
    backgroundColor: "rgba(255,255,255,0.05)",
    marginTop: 12,
  },
  resetBtnText: {
    color: "#9E9E9E",
    fontSize: 14,
    fontWeight: "600" as const,
  },
});
