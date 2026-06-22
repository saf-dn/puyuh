import { ThemeText as Text } from "@/components/ui/ThemeText";
import { C, S } from "@/constants/theme";
import { useState } from "react";
import { KeyboardAvoidingView, Modal, Platform, ScrollView, StyleSheet, View } from "react-native";
import { AnimatedButton, AnimatedInput } from "../ui/AnimatedMicro";

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
}: {
  options: Option[];
  selectedId: string;
  onSelect: (id: string) => void;
}) {
  if (options.length === 0) {
    return (
      <Text style={{ color: C.textMuted, fontSize: 13, fontWeight: "500" }}>
        Tidak ada pilihan tersedia
      </Text>
    );
  }

  return (
    <View style={styles.chipRow}>
      {options.map((option) => {
        const selected = selectedId === option.id;
        return (
          <AnimatedButton
            key={option.id}
            style={[
              styles.chip,
              selected && { backgroundColor: "#1565C0" },
            ]}
            onPress={() => onSelect(option.id)}
          >
            <Text
              style={[
                styles.chipText,
                selected && { color: C.white, fontWeight: "700" },
              ]}
            >
              {option.name}
            </Text>
          </AnimatedButton>
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

  const totalPuyuh = puyuhGroups.reduce((sum, g) => sum + g.count, 0);
  const totalAmountPerDay = ((Number(formData.amountPerBird) || 0) *
    (Number(formData.frequencyPerDay) || 0) *
    totalPuyuh) /
    1000;

  return (
    <Modal
      visible={visible}
      animationType="slide"
      onRequestClose={handleClose}
      presentationStyle="pageSheet"
    >
      <KeyboardAvoidingView
        style={styles.container}
        behavior={Platform.OS === "ios" ? "padding" : undefined}
      >
        <View style={styles.header}>
          <AnimatedButton style={styles.headerBtn} onPress={handleClose}>
            <Text style={styles.cancelButton}>Batal</Text>
          </AnimatedButton>
          <Text style={styles.title}>Catat Pakan</Text>
          <AnimatedButton style={styles.headerBtn} onPress={handleSubmit} disabled={loading}>
            <Text
              style={[
                styles.saveButton,
                { color: "#1565C0", opacity: loading ? 0.5 : 1 },
              ]}
            >
              {loading ? "Menyimpan" : "Simpan"}
            </Text>
          </AnimatedButton>
        </View>

        <ScrollView
          style={styles.content}
          contentContainerStyle={{ paddingBottom: 60 }}
          keyboardShouldPersistTaps="handled"
        >
          <View style={styles.formGroup}>
            <View style={styles.field}>
              <Text style={styles.label}>Total Puyuh</Text>
              <Text style={{ fontSize: 16, color: C.textPrimary, fontWeight: "600", marginTop: 4 }}>
                {totalPuyuh} ekor
              </Text>
            </View>

            <View style={styles.field}>
              <Text style={styles.label}>Frekuensi per Hari *</Text>
              <AnimatedInput

                keyboardType="decimal-pad"
                value={formData.frequencyPerDay}
                onChangeText={(text) =>
                  setFormData({ ...formData, frequencyPerDay: text })
                }
                editable={!loading}
                error={!!errors.frequencyPerDay}
              />
              {errors.frequencyPerDay ? (
                <Text style={styles.errorText}>{errors.frequencyPerDay}</Text>
              ) : null}
            </View>

            <View style={styles.field}>
              <Text style={styles.label}>Jumlah Pakan per Ekor (g) *</Text>
              <AnimatedInput
                placeholder="Contoh: 25"
                keyboardType="decimal-pad"
                value={formData.amountPerBird}
                onChangeText={(text) =>
                  setFormData({ ...formData, amountPerBird: text })
                }
                editable={!loading}
                error={!!errors.amountPerBird}
              />
              {errors.amountPerBird ? (
                <Text style={styles.errorText}>{errors.amountPerBird}</Text>
              ) : null}
            </View>
          </View>

          <View style={styles.summaryBox}>
            <View style={styles.summaryRow}>
              <Text style={styles.summaryLabel}>Total Pakan per Hari:</Text>
              <Text style={styles.summaryValue}>
                {totalAmountPerDay.toFixed(2)} kg
              </Text>
            </View>
            <Text style={styles.summaryNote}>
              {`${totalPuyuh} ekor × ${formData.amountPerBird || 0}g × ${formData.frequencyPerDay || 0}x`}
            </Text>
          </View>

          <AnimatedButton
            style={styles.resetBtn}
            onPress={resetForm}
            disabled={loading}
          >
            <Text style={styles.resetBtnText}>🔄 Reset Form</Text>
          </AnimatedButton>
        </ScrollView>
      </KeyboardAvoidingView>
    </Modal>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: C.bg,
  },
  header: {
    paddingTop: Platform.OS === "ios" ? 16 : 24,
    paddingBottom: 16,
    paddingHorizontal: 16,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    borderBottomWidth: 1,
    borderBottomColor: C.border,
    backgroundColor: C.card,
  },
  headerBtn: {
    minWidth: 60,
    minHeight: 40,
    justifyContent: "center",
  },
  title: {
    fontSize: 17,
    fontWeight: "700",
    color: C.textPrimary,
    flex: 1,
    textAlign: "center",
  },
  cancelButton: {
    fontSize: 16,
    color: C.textSecondary,
    fontWeight: "500",
  },
  saveButton: {
    fontSize: 16,
    fontWeight: "700",
    textAlign: "right",
  },
  content: {
    flex: 1,
    padding: S.lg,
  },
  formGroup: {
    backgroundColor: C.card,
    borderRadius: 24,
    padding: 20,
    gap: 24,
    marginBottom: 24,
    marginTop: 8,
  },
  field: {
    gap: 12,
  },
  label: {
    fontSize: 14,
    fontWeight: "700",
    color: C.textPrimary,
    textTransform: "uppercase",
    letterSpacing: 0.5,
  },
  chipRow: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 10,
  },
  chip: {
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderRadius: 999,
    backgroundColor: C.card2,
    alignItems: "center",
  },
  chipText: {
    fontSize: 14,
    fontWeight: "600",
    color: C.textSecondary,
  },
  errorText: {
    color: C.expense,
    fontSize: 13,
    fontWeight: "600",
    marginTop: 4,
  },
  summaryBox: {
    backgroundColor: C.card2,
    borderRadius: 20,
    padding: 20,
    marginBottom: 24,
  },
  summaryRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  summaryLabel: {
    fontSize: 14,
    fontWeight: "600",
    color: C.textSecondary,
  },
  summaryValue: {
    fontSize: 16,
    fontWeight: "800",
    color: C.textPrimary,
  },
  summaryNote: {
    fontSize: 13,
    marginTop: 8,
    color: C.textMuted,
    fontWeight: "500",
  },
  resetBtn: {
    borderRadius: 20,
    paddingVertical: 16,
    alignItems: "center",
    backgroundColor: C.card,
  },
  resetBtnText: {
    color: C.textSecondary,
    fontSize: 15,
    fontWeight: "700",
  },
});
