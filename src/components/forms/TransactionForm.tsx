import { fadedColor } from "@/constants/theme";
import {
    ExpenseCategory,
    IncomeCategory,
    TransactionInput,
    TransactionType,
} from "@/types";
import { formatCurrency, getCurrentDate } from "@/utils/format";
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

interface TransactionFormProps {
  visible: boolean;
  type: TransactionType;
  categories: (IncomeCategory | ExpenseCategory)[];
  onSubmit: (data: TransactionInput) => Promise<void>;
  onClose: () => void;
  isLoading?: boolean;
}

export function TransactionForm({
  visible,
  type,
  categories,
  onSubmit,
  onClose,
  isLoading,
}: TransactionFormProps) {
  const colorScheme = useColorScheme();
  const isDark = colorScheme === "dark";
  const colors = isDark ? DarkTheme.colors : DefaultTheme.colors;

  const [date, setDate] = useState(getCurrentDate());
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [amount, setAmount] = useState("");
  const [description, setDescription] = useState("");
  const [errors, setErrors] = useState<{ [key: string]: string }>({});

  const resetForm = () => {
    setDate(getCurrentDate());
    setSelectedCategory(null);
    setAmount("");
    setDescription("");
    setErrors({});
  };

  const handleSubmit = async () => {
    const newErrors: { [key: string]: string } = {};

    if (!selectedCategory) newErrors.category = "Kategori harus dipilih";
    if (!amount || isNaN(parseFloat(amount)))
      newErrors.amount = "Jumlah tidak valid";
    if (parseFloat(amount) <= 0) newErrors.amount = "Jumlah harus lebih dari 0";

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    try {
      await onSubmit({
        date,
        transaction_type: type,
        category_id: selectedCategory!,
        amount: parseFloat(amount),
        description: description || undefined,
      });

      // Reset form
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
            {type === TransactionType.INCOME
              ? "Tambah Pendapatan"
              : "Tambah Pengeluaran"}
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
          {/* Date */}
          <View style={styles.field}>
            <Text style={[styles.label, { color: colors.text }]}>Tanggal</Text>
            <TextInput
              style={[
                styles.input,
                { color: colors.text, borderColor: colors.card },
              ]}
              placeholder="YYYY-MM-DD"
              placeholderTextColor={fadedColor(colors.text)}
              value={date}
              onChangeText={setDate}
            />
          </View>

          {/* Category */}
          <View style={styles.field}>
            <Text style={[styles.label, { color: colors.text }]}>Kategori</Text>
            <View style={styles.categoryGrid}>
              {categories.map((cat) => (
                <Pressable
                  key={cat.id}
                  style={[
                    styles.categoryBtn,
                    {
                      backgroundColor:
                        selectedCategory === cat.id
                          ? colors.primary
                          : colors.card,
                      borderColor:
                        selectedCategory === cat.id
                          ? colors.primary
                          : colors.card,
                    },
                  ]}
                  onPress={() => {
                    setSelectedCategory(cat.id);
                    setErrors({ ...errors, category: "" });
                  }}
                >
                  <Text
                    style={[
                      styles.categoryBtnText,
                      {
                        color:
                          selectedCategory === cat.id ? "white" : colors.text,
                      },
                    ]}
                  >
                    {cat.name}
                  </Text>
                </Pressable>
              ))}
            </View>
            {errors.category && (
              <Text style={styles.errorText}>{errors.category}</Text>
            )}
          </View>

          {/* Amount */}
          <View style={styles.field}>
            <Text style={[styles.label, { color: colors.text }]}>
              Jumlah (Rp)
            </Text>
            <TextInput
              style={[
                styles.input,
                {
                  color: colors.text,
                  borderColor: errors.amount ? "#ff6b6b" : colors.card,
                },
              ]}
              placeholder="0"
              placeholderTextColor={fadedColor(colors.text)}
              keyboardType="number-pad"
              value={amount}
              onChangeText={(text) => {
                setAmount(text);
                if (text && !isNaN(parseFloat(text))) {
                  setErrors({ ...errors, amount: "" });
                }
              }}
            />
            {amount && (
              <Text style={[styles.amountDisplay, { color: colors.primary }]}>
                {formatCurrency(parseFloat(amount) || 0)}
              </Text>
            )}
            {errors.amount && (
              <Text style={styles.errorText}>{errors.amount}</Text>
            )}
          </View>

          {/* Description */}
          <View style={styles.field}>
            <Text style={[styles.label, { color: colors.text }]}>
              Keterangan (Opsional)
            </Text>
            <TextInput
              style={[
                styles.input,
                { color: colors.text, borderColor: colors.card },
              ]}
              placeholder="Tambahkan catatan..."
              placeholderTextColor={fadedColor(colors.text)}
              value={description}
              onChangeText={setDescription}
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
  categoryGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 8,
  },
  categoryBtn: {
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 20,
    borderWidth: 1,
    minWidth: "30%",
    alignItems: "center",
  },
  categoryBtnText: {
    fontSize: 13,
    fontWeight: "500",
  },
  amountDisplay: {
    fontSize: 12,
    fontWeight: "600",
    marginTop: 4,
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
