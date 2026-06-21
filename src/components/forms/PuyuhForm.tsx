import { fadedColor } from "@/constants/theme";
import { PuyuhInput, PuyuhStatus } from "@/types";
import { DarkTheme, DefaultTheme } from "expo-router";
import { useState } from "react";
import {
    Modal,
    Pressable,
    ScrollView,
    StyleSheet,
    Text,
    TextInput,
    useColorScheme,
    View,
} from "react-native";

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
  const colorScheme = useColorScheme();
  const isDark = colorScheme === "dark";
  const colors = isDark ? DarkTheme.colors : DefaultTheme.colors;

  const [ageMonths, setAgeMonths] = useState("");
  const [count, setCount] = useState("");
  const [status, setStatus] = useState<PuyuhStatus>(PuyuhStatus.ACTIVE);
  const [notes, setNotes] = useState("");
  const [errors, setErrors] = useState<{ [key: string]: string }>({});

  const resetForm = () => {
    setAgeMonths("");
    setCount("");
    setStatus(PuyuhStatus.ACTIVE);
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
        status,
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
      transparent={false}
    >
      <View style={[styles.container, { backgroundColor: colors.background }]}>
        <View style={[styles.header, { backgroundColor: colors.card }]}>
          <Pressable onPress={onClose}>
            <Text style={[styles.closeButton, { color: colors.primary }]}>
              ✕
            </Text>
          </Pressable>
          <Text style={[styles.title, { color: colors.text }]}>
            Tambah Grup Puyuh
          </Text>
          <Pressable onPress={handleSubmit} disabled={isLoading}>
            <Text
              style={[
                styles.saveButton,
                { color: colors.primary, opacity: isLoading ? 0.5 : 1 },
              ]}
            >
              {isLoading ? "..." : "Simpan"}
            </Text>
          </Pressable>
        </View>

        <ScrollView style={styles.content}>
          {/* Age */}
          <View style={styles.field}>
            <Text style={[styles.label, { color: colors.text }]}>
              Usia (Bulan)
            </Text>
            <TextInput
              style={[
                styles.input,
                {
                  color: colors.text,
                  borderColor: errors.ageMonths ? "#ff6b6b" : colors.card,
                },
              ]}
              placeholder="0"
              placeholderTextColor={fadedColor(colors.text)}
              keyboardType="number-pad"
              value={ageMonths}
              onChangeText={(text) => {
                setAgeMonths(text);
                if (text && !isNaN(parseInt(text))) {
                  setErrors({ ...errors, ageMonths: "" });
                }
              }}
            />
            {errors.ageMonths && (
              <Text style={styles.errorText}>{errors.ageMonths}</Text>
            )}
          </View>

          {/* Count */}
          <View style={styles.field}>
            <Text style={[styles.label, { color: colors.text }]}>
              Jumlah (Ekor)
            </Text>
            <TextInput
              style={[
                styles.input,
                {
                  color: colors.text,
                  borderColor: errors.count ? "#ff6b6b" : colors.card,
                },
              ]}
              placeholder="0"
              placeholderTextColor={fadedColor(colors.text)}
              keyboardType="number-pad"
              value={count}
              onChangeText={(text) => {
                setCount(text);
                if (text && !isNaN(parseInt(text))) {
                  setErrors({ ...errors, count: "" });
                }
              }}
            />
            {errors.count && (
              <Text style={styles.errorText}>{errors.count}</Text>
            )}
          </View>

          {/* Status */}
          <View style={styles.field}>
            <Text style={[styles.label, { color: colors.text }]}>Status</Text>
            <View style={styles.statusRow}>
              {[
                { label: "Aktif", value: PuyuhStatus.ACTIVE },
                { label: "Tidak Aktif", value: PuyuhStatus.INACTIVE },
                { label: "Sakit", value: PuyuhStatus.SICK },
              ].map((option) => (
                <Pressable
                  key={option.value}
                  style={[
                    styles.statusBtn,
                    {
                      backgroundColor:
                        status === option.value ? colors.primary : colors.card,
                      borderColor: colors.border,
                    },
                  ]}
                  onPress={() => setStatus(option.value)}
                >
                  <Text
                    style={{
                      color: status === option.value ? "white" : colors.text,
                      fontSize: 12,
                      fontWeight: "600",
                    }}
                  >
                    {option.label}
                  </Text>
                </Pressable>
              ))}
            </View>
          </View>

          {/* Notes */}
          <View style={styles.field}>
            <Text style={[styles.label, { color: colors.text }]}>
              Catatan (Opsional)
            </Text>
            <TextInput
              style={[
                styles.input,
                { color: colors.text, borderColor: colors.card },
              ]}
              placeholder="Tambahkan informasi tambahan..."
              placeholderTextColor={fadedColor(colors.text)}
              value={notes}
              onChangeText={setNotes}
              multiline
              numberOfLines={3}
            />
          </View>

          {/* Reset Button */}
          <Pressable
            style={styles.resetBtn}
            onPress={resetForm}
            disabled={isLoading}
          >
            <Text style={styles.resetBtnText}>🔄 Reset Form</Text>
          </Pressable>

          {errors.submit && (
            <Text style={[styles.errorText, { marginHorizontal: 16 }]}>
              {errors.submit}
            </Text>
          )}
        </ScrollView>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    paddingTop: 16,
    paddingBottom: 16,
    paddingHorizontal: 16,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  title: {
    fontSize: 16,
    fontWeight: "700",
    flex: 1,
    textAlign: "center",
  },
  closeButton: {
    fontSize: 24,
    padding: 8,
  },
  saveButton: {
    fontSize: 16,
    fontWeight: "600",
    padding: 8,
  },
  content: {
    flex: 1,
    padding: 16,
  },
  field: {
    marginBottom: 20,
  },
  label: {
    fontSize: 14,
    fontWeight: "600",
    marginBottom: 8,
  },
  input: {
    borderWidth: 1,
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 10,
    fontSize: 14,
  },
  pickerContainer: {
    borderWidth: 1,
    borderRadius: 8,
    overflow: "hidden",
  },
  statusRow: {
    flexDirection: "row",
    gap: 8,
  },
  statusBtn: {
    flex: 1,
    paddingVertical: 10,
    borderRadius: 8,
    borderWidth: 1,
    alignItems: "center",
  },
  errorText: {
    color: "#ff6b6b",
    fontSize: 12,
    marginTop: 4,
  },
  resetBtn: {
    borderWidth: 1,
    borderColor: "#2A2A2A",
    borderRadius: 10,
    paddingVertical: 14,
    alignItems: "center" as const,
    backgroundColor: "rgba(255,255,255,0.05)",
    marginTop: 8,
  },
  resetBtnText: {
    color: "#9E9E9E",
    fontSize: 14,
    fontWeight: "600" as const,
  },
});
