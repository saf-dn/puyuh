import { C, S } from "@/constants/theme";
import { formatCurrency } from "@/utils/format";
import { useState } from "react";
import { KeyboardAvoidingView, Modal, Platform, ScrollView, StyleSheet, View } from "react-native";
import { AnimatedButton, AnimatedInput } from "../ui/AnimatedMicro";
import { ThemeText as Text } from "@/components/ui/ThemeText";

const PRICE_PER_EGG = 400;

interface ProductionFormProps {
  visible: boolean;
  onClose: () => void;
  onSubmit: (data: {
    eggsProduced: number;
    eggsBroken: number;
    eggsSold: number;
    puyuhDied: number;
    pricePerEgg: number;
  }) => Promise<void>;
  loading?: boolean;
}

export default function ProductionForm({
  visible,
  onClose,
  onSubmit,
  loading = false,
}: ProductionFormProps) {
  const [formData, setFormData] = useState({
    eggsProduced: "",
    eggsBroken: "",
    eggsSold: "",
    puyuhDied: "",
  });

  const [errors, setErrors] = useState<Record<string, string>>({});

  const resetForm = () => {
    setFormData({
      eggsProduced: "",
      eggsBroken: "",
      eggsSold: "",
      puyuhDied: "",
    });
    setErrors({});
  };

  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {};

    if (!formData.eggsProduced.trim()) {
      newErrors.eggsProduced = "Jumlah telur harus diisi";
    } else if (
      isNaN(Number(formData.eggsProduced)) ||
      Number(formData.eggsProduced) < 0
    ) {
      newErrors.eggsProduced = "Masukkan angka yang valid (≥ 0)";
    }

    if (!formData.eggsBroken.trim()) {
      newErrors.eggsBroken = "Jumlah telur pecah harus diisi";
    } else if (
      isNaN(Number(formData.eggsBroken)) ||
      Number(formData.eggsBroken) < 0
    ) {
      newErrors.eggsBroken = "Masukkan angka yang valid (≥ 0)";
    }

    if (!formData.eggsSold.trim()) {
      newErrors.eggsSold = "Jumlah telur terjual harus diisi";
    } else if (
      isNaN(Number(formData.eggsSold)) ||
      Number(formData.eggsSold) < 0
    ) {
      newErrors.eggsSold = "Masukkan angka yang valid (≥ 0)";
    }

    if (!formData.puyuhDied.trim()) {
      newErrors.puyuhDied = "Jumlah puyuh mati harus diisi";
    } else if (
      isNaN(Number(formData.puyuhDied)) ||
      Number(formData.puyuhDied) < 0
    ) {
      newErrors.puyuhDied = "Masukkan angka yang valid (≥ 0)";
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
        eggsProduced: Number(formData.eggsProduced),
        eggsBroken: Number(formData.eggsBroken),
        eggsSold: Number(formData.eggsSold),
        puyuhDied: Number(formData.puyuhDied),
        pricePerEgg: PRICE_PER_EGG,
      });
      resetForm();
      onClose();
    } catch {
      // Error handled by parent store
    }
  };

  const eggsAvailable = Math.max(
    0,
    (Number(formData.eggsProduced) || 0) -
      (Number(formData.eggsBroken) || 0) -
      (Number(formData.eggsSold) || 0),
  );

  const estimatedRevenue = (Number(formData.eggsSold) || 0) * PRICE_PER_EGG;

  const handleClose = () => {
    resetForm();
    onClose();
  };

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
          <Text style={styles.title}>Catat Produksi</Text>
          <AnimatedButton style={styles.headerBtn} onPress={handleSubmit} disabled={loading}>
            <Text
              style={[
                styles.saveButton,
                { color: "#2E7D32", opacity: loading ? 0.5 : 1 },
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
          {/* Info harga per telur - Premium Banner */}
          <View style={styles.priceInfoBox}>
            <View style={styles.priceInfoIconBox}>
              <Text style={{ fontSize: 24 }}>💰</Text>
            </View>
            <View style={{ flex: 1 }}>
              <Text style={styles.priceInfoText}>
                Harga per telur: {formatCurrency(PRICE_PER_EGG)}
              </Text>
              <Text style={styles.priceInfoSub}>
                Pemasukan otomatis tercatat saat telur terjual
              </Text>
            </View>
          </View>

          <View style={styles.formGroup}>
            <View style={styles.field}>
              <Text style={styles.label}>Telur Dihasilkan *</Text>
              <AnimatedInput
                placeholder="0"
                keyboardType="decimal-pad"
                value={formData.eggsProduced}
                onChangeText={(text) =>
                  setFormData({ ...formData, eggsProduced: text })
                }
                editable={!loading}
                error={!!errors.eggsProduced}
              />
              {errors.eggsProduced ? (
                <Text style={styles.errorText}>{errors.eggsProduced}</Text>
              ) : null}
            </View>

            <View style={styles.field}>
              <Text style={styles.label}>Telur Pecah *</Text>
              <AnimatedInput
                placeholder="0"
                keyboardType="decimal-pad"
                value={formData.eggsBroken}
                onChangeText={(text) =>
                  setFormData({ ...formData, eggsBroken: text })
                }
                editable={!loading}
                error={!!errors.eggsBroken}
              />
              {errors.eggsBroken ? (
                <Text style={styles.errorText}>{errors.eggsBroken}</Text>
              ) : null}
            </View>

            <View style={styles.field}>
              <Text style={[styles.label, { color: C.income }]}>Telur Terjual *</Text>
              <AnimatedInput
                placeholder="0"
                keyboardType="decimal-pad"
                value={formData.eggsSold}
                onChangeText={(text) =>
                  setFormData({ ...formData, eggsSold: text })
                }
                editable={!loading}
                error={!!errors.eggsSold}
              />
              {errors.eggsSold ? (
                <Text style={styles.errorText}>{errors.eggsSold}</Text>
              ) : null}
            </View>

            <View style={styles.field}>
              <Text style={[styles.label, { color: C.expense }]}>Puyuh Mati *</Text>
              <AnimatedInput
                placeholder="0"
                keyboardType="decimal-pad"
                value={formData.puyuhDied}
                onChangeText={(text) =>
                  setFormData({ ...formData, puyuhDied: text })
                }
                editable={!loading}
                error={!!errors.puyuhDied}
              />
              {errors.puyuhDied ? (
                <Text style={styles.errorText}>{errors.puyuhDied}</Text>
              ) : null}
            </View>
          </View>

          <View style={styles.summaryBox}>
            <View style={styles.summaryRow}>
              <Text style={styles.summaryLabel}>Telur Belum Dijual</Text>
              <Text style={styles.summaryValue}>{eggsAvailable} pcs</Text>
            </View>
            <View style={[styles.summaryRow, { marginTop: 12 }]}>
              <Text style={styles.summaryLabel}>Total Pemasukan</Text>
              <Text style={[styles.summaryValue, { color: C.income, fontSize: 18 }]}>
                {formatCurrency(estimatedRevenue)}
              </Text>
            </View>
            {Number(formData.eggsSold) > 0 && (
              <Text style={styles.autoIncomeNote}>
                ✅ Pemasukan akan otomatis tercatat di Keuangan
              </Text>
            )}
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
  priceInfoBox: {
    backgroundColor: "#1B3A1F",
    borderRadius: 20,
    padding: 16,
    flexDirection: "row",
    alignItems: "center",
    gap: 16,
    marginBottom: 24,
    marginTop: 8,
  },
  priceInfoIconBox: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: "rgba(255,255,255,0.1)",
    alignItems: "center",
    justifyContent: "center",
  },
  priceInfoText: {
    color: "#4CAF50",
    fontSize: 15,
    fontWeight: "800",
    marginBottom: 4,
  },
  priceInfoSub: {
    color: "#81C784",
    fontSize: 13,
    fontWeight: "500",
  },
  formGroup: {
    backgroundColor: C.card,
    borderRadius: 24,
    padding: 20,
    gap: 24,
    marginBottom: 24,
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
  autoIncomeNote: {
    color: "#4CAF50",
    fontSize: 13,
    fontWeight: "700",
    marginTop: 16,
    textAlign: "center",
    backgroundColor: "rgba(76, 175, 80, 0.1)",
    paddingVertical: 10,
    borderRadius: 12,
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
