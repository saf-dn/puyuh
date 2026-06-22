import { ThemeText as Text } from "@/components/ui/ThemeText";
import { C, S } from "@/constants/theme";
import { PuyuhInput, PuyuhStatus } from "@/types";
import { useState } from "react";
import { KeyboardAvoidingView, Modal, Platform, ScrollView, StyleSheet, View } from "react-native";
import { AnimatedButton, AnimatedInput } from "../ui/AnimatedMicro";

interface PuyuhFormProps {
  visible: boolean;
  onSubmit: (data: PuyuhInput) => Promise<void>;
  onClose: () => void;
  isLoading?: boolean;
}

export function PuyuhForm({
  visible,
  onSubmit,
  onClose,
  isLoading,
}: PuyuhFormProps) {
  const [ageMonths, setAgeMonths] = useState("");
  const [count, setCount] = useState("");
  const [notes, setNotes] = useState("");
  const [errors, setErrors] = useState<{ [key: string]: string }>({});

  const resetForm = () => {
    setAgeMonths("");
    setCount("");
    setNotes("");
    setErrors({});
  };

  const handleSubmit = async () => {
    const newErrors: { [key: string]: string } = {};

    if (!ageMonths || isNaN(parseInt(ageMonths)))
      newErrors.ageMonths = "Usia harus berupa angka";
    if (parseInt(ageMonths) < 0)
      newErrors.ageMonths = "Usia tidak boleh negatif";

    if (!count || isNaN(parseInt(count)))
      newErrors.count = "Jumlah harus berupa angka";
    if (parseInt(count) <= 0) newErrors.count = "Jumlah harus lebih dari 0";

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    try {
      await onSubmit({
        age_months: parseInt(ageMonths),
        count: parseInt(count),
        status: PuyuhStatus.ACTIVE,
        notes: notes || undefined,
      });

      resetForm();
      onClose();
    } catch (error) {
      setErrors({
        submit: error instanceof Error ? error.message : "Gagal menyimpan",
      });
    }
  };

  return (
    <Modal
      visible={visible}
      animationType="slide"
      onRequestClose={onClose}
      presentationStyle="pageSheet"
    >
      <KeyboardAvoidingView
        style={styles.container}
        behavior={Platform.OS === "ios" ? "padding" : undefined}
      >
        <View style={styles.header}>
          <AnimatedButton style={styles.headerBtn} onPress={onClose}>
            <Text style={styles.cancelButton}>Batal</Text>
          </AnimatedButton>
          <Text style={styles.title}>Tambah Grup Puyuh</Text>
          <AnimatedButton style={styles.headerBtn} onPress={handleSubmit} disabled={isLoading}>
            <Text
              style={[
                styles.saveButton,
                { color: C.red, opacity: isLoading ? 0.5 : 1 },
              ]}
            >
              {isLoading ? "Menyimpan" : "Simpan"}
            </Text>
          </AnimatedButton>
        </View>

        <ScrollView
          style={styles.content}
          contentContainerStyle={{ paddingBottom: 60 }}
          keyboardShouldPersistTaps="handled"
        >
          <View style={styles.formGroup}>
            {/* Age */}
            <View style={styles.field}>
              <Text style={styles.label}>Usia (Bulan)</Text>
              <AnimatedInput
                placeholder="0"
                keyboardType="number-pad"
                value={ageMonths}
                onChangeText={(text) => {
                  setAgeMonths(text);
                  if (text && !isNaN(parseInt(text))) {
                    setErrors({ ...errors, ageMonths: "" });
                  }
                }}
                error={!!errors.ageMonths}
              />
              {errors.ageMonths ? (
                <Text style={styles.errorText}>{errors.ageMonths}</Text>
              ) : null}
            </View>

            {/* Count */}
            <View style={styles.field}>
              <Text style={styles.label}>Jumlah (Ekor)</Text>
              <AnimatedInput
                placeholder="0"
                keyboardType="number-pad"
                value={count}
                onChangeText={(text) => {
                  setCount(text);
                  if (text && !isNaN(parseInt(text))) {
                    setErrors({ ...errors, count: "" });
                  }
                }}
                error={!!errors.count}
              />
              {errors.count ? (
                <Text style={styles.errorText}>{errors.count}</Text>
              ) : null}
            </View>

            {/* Notes */}
            <View style={styles.field}>
              <Text style={styles.label}>Catatan</Text>
              <AnimatedInput
                style={styles.textArea}
                placeholder="Tambahkan informasi tambahan..."
                value={notes}
                onChangeText={setNotes}
                multiline
                numberOfLines={3}
                textAlignVertical="top"
              />
            </View>
          </View>

          {/* Reset Button */}
          <AnimatedButton
            style={styles.resetBtn}
            onPress={resetForm}
            disabled={isLoading}
          >
            <Text style={styles.resetBtnText}>🔄 Reset Form</Text>
          </AnimatedButton>

          {errors.submit ? (
            <Text style={[styles.errorText, { textAlign: "center", marginTop: 16 }]}>
              {errors.submit}
            </Text>
          ) : null}
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
  textArea: {
    minHeight: 100,
  },
  errorText: {
    color: C.expense,
    fontSize: 13,
    fontWeight: "600",
    marginTop: 4,
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
