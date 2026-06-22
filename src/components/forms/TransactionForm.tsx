import { ThemeText as Text } from "@/components/ui/ThemeText";
import { C, S } from "@/constants/theme";
import {
  ExpenseCategory,
  IncomeCategory,
  TransactionInput,
  TransactionType,
} from "@/types";
import { formatCurrency, getCurrentDate } from "@/utils/format";
import { useState } from "react";
import { KeyboardAvoidingView, Modal, Platform, ScrollView, StyleSheet, View } from "react-native";
import { AnimatedButton, AnimatedInput } from "../ui/AnimatedMicro";

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

      resetForm();
      onClose();
    } catch (error) {
      setErrors({
        submit: error instanceof Error ? error.message : "Gagal menyimpan",
      });
    }
  };

  const primaryColor = type === TransactionType.INCOME ? C.income : C.expense;

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
          <AnimatedButton style={styles.headerBtn} onPress={onClose} scaleDownTo={0.9}>
            <Text style={styles.cancelButton}>Batal</Text>
          </AnimatedButton>
          <Text style={styles.title}>
            {type === TransactionType.INCOME
              ? "Tambah Pendapatan"
              : "Catat Pengeluaran"}
          </Text>
          <AnimatedButton style={styles.headerBtn} onPress={handleSubmit} disabled={isLoading} scaleDownTo={0.9}>
            <Text
              style={[
                styles.saveButton,
                { color: primaryColor, opacity: isLoading ? 0.5 : 1 },
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
          {/* Amount Hero Input */}
          <View style={styles.heroInputContainer}>
            <Text style={[styles.currencySymbol, { color: primaryColor }]}>Rp</Text>
            <AnimatedInput
              style={[styles.heroInput, { color: primaryColor, paddingHorizontal: 0, minHeight: undefined }]}
              containerStyle={{ backgroundColor: "transparent" }}
              placeholder="0"
              placeholderTextColor={`${primaryColor}50`}
              keyboardType="number-pad"
              value={amount}
              onChangeText={(text) => {
                setAmount(text);
                if (text && !isNaN(parseFloat(text))) {
                  setErrors({ ...errors, amount: "" });
                }
              }}
              autoFocus
              error={!!errors.amount}
            />
          </View>
          {amount ? (
            <Text style={styles.amountDisplay}>
              {formatCurrency(parseFloat(amount) || 0)}
            </Text>
          ) : null}
          {errors.amount ? (
            <Text style={[styles.errorText, { textAlign: "center" }]}>{errors.amount}</Text>
          ) : null}

          {/* Form Fields */}
          <View style={styles.formGroup}>
            <View style={styles.field}>
              <Text style={styles.label}>Tanggal Transaksi</Text>
              <AnimatedInput
                placeholder="YYYY-MM-DD"
                value={date}
                onChangeText={setDate}
              />
            </View>

            <View style={styles.field}>
              <Text style={styles.label}>Kategori</Text>
              <View style={styles.categoryGrid}>
                {categories.map((cat) => {
                  const isSelected = selectedCategory === cat.id;
                  return (
                    <AnimatedButton
                      key={cat.id}
                      style={[
                        styles.categoryBtn,
                        isSelected && { backgroundColor: primaryColor },
                      ]}
                      onPress={() => {
                        setSelectedCategory(cat.id);
                        setErrors({ ...errors, category: "" });
                      }}
                    >
                      <Text
                        style={[
                          styles.categoryBtnText,
                          isSelected && { color: C.white, fontWeight: "700" },
                        ]}
                      >
                        {cat.name}
                      </Text>
                    </AnimatedButton>
                  );
                })}
              </View>
              {errors.category ? (
                <Text style={styles.errorText}>{errors.category}</Text>
              ) : null}
            </View>

            <View style={styles.field}>
              <Text style={styles.label}>Keterangan</Text>
              <AnimatedInput
                style={styles.textArea}
                placeholder="Tambahkan catatan singkat..."
                value={description}
                onChangeText={setDescription}
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
  heroInputContainer: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    marginTop: 24,
    marginBottom: 8,
  },
  currencySymbol: {
    fontSize: 32,
    fontWeight: "800",
    marginRight: 8,
    marginTop: 6,
  },
  heroInput: {
    fontSize: 56,
    fontWeight: "900",
    minWidth: 100,
    textAlign: "center",
  },
  amountDisplay: {
    fontSize: 14,
    fontWeight: "600",
    color: C.textSecondary,
    textAlign: "center",
    marginBottom: 32,
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
  textArea: {
    minHeight: 100,
  },
  categoryGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 10,
  },
  categoryBtn: {
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderRadius: 999,
    backgroundColor: C.card2,
    alignItems: "center",
  },
  categoryBtnText: {
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
