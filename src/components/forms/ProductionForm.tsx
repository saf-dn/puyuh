import { fadedColor } from "@/constants/theme";
import { formatCurrency } from "@/utils/format";
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
  const colorScheme = useColorScheme();
  const isDark = colorScheme === "dark";
  const colors = isDark ? DarkTheme.colors : DefaultTheme.colors;

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
            Produksi Telur Hari Ini
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
              Data Produksi
            </Text>

            {/* Info harga per telur */}
            <View
              style={[
                styles.priceInfoBox,
                { backgroundColor: "#1B3A1F", borderColor: "#2E7D32" },
              ]}
            >
              <Text style={styles.priceInfoText}>
                💰 Harga per telur: {formatCurrency(PRICE_PER_EGG)}
              </Text>
              <Text style={styles.priceInfoSub}>
                Pemasukan otomatis tercatat saat telur terjual
              </Text>
            </View>

            <View style={styles.inputGroup}>
              <Text style={[styles.label, { color: colors.text }]}>
                Jumlah Telur Dihasilkan *
              </Text>
              <TextInput
                style={[
                  styles.input,
                  {
                    backgroundColor: colors.card,
                    color: colors.text,
                    borderColor: errors.eggsProduced
                      ? "#C62828"
                      : colors.border,
                  },
                ]}
                placeholder="Masukkan jumlah telur"
                placeholderTextColor={fadedColor(colors.text)}
                keyboardType="decimal-pad"
                value={formData.eggsProduced}
                onChangeText={(text) =>
                  setFormData({ ...formData, eggsProduced: text })
                }
                editable={!loading}
              />
              {errors.eggsProduced && (
                <Text style={styles.errorText}>{errors.eggsProduced}</Text>
              )}
            </View>

            <View style={styles.inputGroup}>
              <Text style={[styles.label, { color: colors.text }]}>
                Jumlah Telur Pecah *
              </Text>
              <TextInput
                style={[
                  styles.input,
                  {
                    backgroundColor: colors.card,
                    color: colors.text,
                    borderColor: errors.eggsBroken ? "#C62828" : colors.border,
                  },
                ]}
                placeholder="Masukkan jumlah telur pecah"
                placeholderTextColor={fadedColor(colors.text)}
                keyboardType="decimal-pad"
                value={formData.eggsBroken}
                onChangeText={(text) =>
                  setFormData({ ...formData, eggsBroken: text })
                }
                editable={!loading}
              />
              {errors.eggsBroken && (
                <Text style={styles.errorText}>{errors.eggsBroken}</Text>
              )}
            </View>

            <View style={styles.inputGroup}>
              <Text style={[styles.label, { color: colors.text }]}>
                Jumlah Telur Terjual *
              </Text>
              <TextInput
                style={[
                  styles.input,
                  {
                    backgroundColor: colors.card,
                    color: colors.text,
                    borderColor: errors.eggsSold ? "#C62828" : colors.border,
                  },
                ]}
                placeholder="Masukkan jumlah telur terjual"
                placeholderTextColor={fadedColor(colors.text)}
                keyboardType="decimal-pad"
                value={formData.eggsSold}
                onChangeText={(text) =>
                  setFormData({ ...formData, eggsSold: text })
                }
                editable={!loading}
              />
              {errors.eggsSold && (
                <Text style={styles.errorText}>{errors.eggsSold}</Text>
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
                  Telur Belum Dijual:
                </Text>
                <Text style={[styles.summaryValue, { color: colors.text }]}>
                  {eggsAvailable} pcs
                </Text>
              </View>
              <View style={[styles.summaryRow, { marginTop: 8 }]}>
                <Text style={[styles.summaryLabel, { color: colors.text }]}>
                  Harga per Telur:
                </Text>
                <Text style={[styles.summaryValue, { color: colors.text }]}>
                  {formatCurrency(PRICE_PER_EGG)}
                </Text>
              </View>
              <View style={[styles.summaryRow, { marginTop: 8 }]}>
                <Text style={[styles.summaryLabel, { color: colors.text }]}>
                  Total Pemasukan:
                </Text>
                <Text style={[styles.summaryValue, { color: "#2E7D32" }]}>
                  {formatCurrency(estimatedRevenue)}
                </Text>
              </View>
              {Number(formData.eggsSold) > 0 && (
                <Text style={styles.autoIncomeNote}>
                  ✅ Pemasukan akan otomatis tercatat di Keuangan
                </Text>
              )}
            </View>

            <View style={styles.inputGroup}>
              <Text style={[styles.label, { color: colors.text }]}>
                Jumlah Puyuh Mati *
              </Text>
              <TextInput
                style={[
                  styles.input,
                  {
                    backgroundColor: colors.card,
                    color: colors.text,
                    borderColor: errors.puyuhDied ? "#C62828" : colors.border,
                  },
                ]}
                placeholder="Masukkan jumlah puyuh mati"
                placeholderTextColor={fadedColor(colors.text)}
                keyboardType="decimal-pad"
                value={formData.puyuhDied}
                onChangeText={(text) =>
                  setFormData({ ...formData, puyuhDied: text })
                }
                editable={!loading}
              />
              {errors.puyuhDied && (
                <Text style={styles.errorText}>{errors.puyuhDied}</Text>
              )}
            </View>
          </View>

          {/* Reset Button */}
          <Pressable
            style={[styles.resetBtn, { borderColor: colors.border }]}
            onPress={resetForm}
            disabled={loading}
          >
            <Text style={styles.resetBtnText}>🔄 Reset Form</Text>
          </Pressable>
        </ScrollView>
      </KeyboardAvoidingView>
    </Modal>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 16,
    paddingTop: 16,
    paddingBottom: 16,
    borderBottomWidth: 1,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: "700",
  },
  scrollContent: {
    padding: 16,
    gap: 20,
  },
  section: {
    gap: 12,
  },
  sectionTitle: {
    fontSize: 14,
    fontWeight: "600",
    marginBottom: 8,
  },
  inputGroup: {
    gap: 8,
  },
  label: {
    fontSize: 13,
    fontWeight: "600",
  },
  input: {
    borderWidth: 1,
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 12,
    fontSize: 14,
  },
  errorText: {
    color: "#C62828",
    fontSize: 12,
    fontWeight: "500",
  },
  priceInfoBox: {
    borderWidth: 1,
    borderRadius: 10,
    padding: 12,
    gap: 4,
  },
  priceInfoText: {
    color: "#4CAF50",
    fontSize: 14,
    fontWeight: "700",
  },
  priceInfoSub: {
    color: "#81C784",
    fontSize: 11,
    fontWeight: "500",
  },
  summaryBox: {
    borderWidth: 1,
    borderRadius: 8,
    padding: 12,
    marginTop: 8,
  },
  summaryRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  summaryLabel: {
    fontSize: 13,
    fontWeight: "600",
  },
  summaryValue: {
    fontSize: 14,
    fontWeight: "700",
  },
  autoIncomeNote: {
    color: "#4CAF50",
    fontSize: 11,
    fontWeight: "600",
    marginTop: 10,
    textAlign: "center",
  },
  resetBtn: {
    borderWidth: 1,
    borderRadius: 10,
    paddingVertical: 14,
    alignItems: "center",
    backgroundColor: "rgba(255,255,255,0.05)",
  },
  resetBtnText: {
    color: "#9E9E9E",
    fontSize: 14,
    fontWeight: "600",
  },
});
