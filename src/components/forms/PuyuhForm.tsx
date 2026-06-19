import { PuyuhInput, PuyuhStatus } from "@/types";
import { DarkTheme, DefaultTheme } from "expo-router";
import { useState } from "react";
import {
    Modal,
    Picker,
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

      // Reset form
      setAgeMonths("");
      setCount("");
      setStatus(PuyuhStatus.ACTIVE);
      setNotes("");
      setErrors({});
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
            <Text style={[styles.closeButton, { color: colors.tint }]}>✕</Text>
          </Pressable>
          <Text style={[styles.title, { color: colors.text }]}>
            Tambah Grup Puyuh
          </Text>
          <Pressable onPress={handleSubmit} disabled={isLoading}>
            <Text
              style={[
                styles.saveButton,
                { color: colors.tint, opacity: isLoading ? 0.5 : 1 },
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
              placeholderTextColor={colors.text + "80"}
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
              placeholderTextColor={colors.text + "80"}
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
            <View
              style={[styles.pickerContainer, { borderColor: colors.card }]}
            >
              <Picker
                selectedValue={status}
                onValueChange={(itemValue) => setStatus(itemValue)}
                style={{ color: colors.text }}
              >
                <Picker.Item label="Aktif" value={PuyuhStatus.ACTIVE} />
                <Picker.Item label="Tidak Aktif" value={PuyuhStatus.INACTIVE} />
                <Picker.Item label="Sakit" value={PuyuhStatus.SICK} />
              </Picker>
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
              placeholderTextColor={colors.text + "80"}
              value={notes}
              onChangeText={setNotes}
              multiline
              numberOfLines={3}
            />
          </View>

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
  errorText: {
    color: "#ff6b6b",
    fontSize: 12,
    marginTop: 4,
  },
});
