import {
  CategoryQueries,
  TransactionQueries,
} from "@/database/queries/transaction.queries";
import {
  ExpenseCategory,
  IncomeCategory,
  Transaction,
  TransactionInput,
  TransactionType,
} from "@/types";
import { getDateRange, storeError } from "@/utils/format";
import { create } from "zustand";

interface FinanceState {
  isLoading: boolean;
  error: string | null;
  incomeTransactions: Transaction[];
  expenseTransactions: Transaction[];
  incomeCategories: IncomeCategory[];
  expenseCategories: ExpenseCategory[];
  currentMonth: { year: number; month: number };

  loadFinanceData: (year: number, month: number) => Promise<void>;
  addTransaction: (input: TransactionInput) => Promise<void>;
  updateTransaction: (
    id: string,
    input: Partial<TransactionInput>,
  ) => Promise<void>;
  deleteTransaction: (id: string) => Promise<void>;
  loadCategories: () => Promise<void>;
  setMonth: (year: number, month: number) => void;
  clearError: () => void;
}

export const useFinanceStore = create<FinanceState>((set, get) => ({
  isLoading: false,
  error: null,
  incomeTransactions: [],
  expenseTransactions: [],
  incomeCategories: [],
  expenseCategories: [],
  currentMonth: {
    year: new Date().getFullYear(),
    month: new Date().getMonth() + 1,
  },

  loadFinanceData: async (year: number, month: number) => {
    const isSameMonth = get().currentMonth.year === year && get().currentMonth.month === month;
    const hasData = get().incomeTransactions.length > 0 || get().expenseTransactions.length > 0;
    
    if (!isSameMonth || !hasData) {
      set({ isLoading: true, error: null });
    } else {
      set({ error: null }); // fetch in background without blocking UI
    }
    
    try {
      const { start, end } = getDateRange(year, month);

      const [income, expense, incomeCategories, expenseCategories] =
        await Promise.all([
          TransactionQueries.getRange(start, end, TransactionType.INCOME),
          TransactionQueries.getRange(start, end, TransactionType.EXPENSE),
          CategoryQueries.getIncomeCategories(),
          CategoryQueries.getExpenseCategories(),
        ]);

      const incomeCategoryMap = new Map(
        incomeCategories.map((category) => [category.id, category]),
      );
      const expenseCategoryMap = new Map(
        expenseCategories.map((category) => [category.id, category]),
      );

      set({
        incomeTransactions: income.map((transaction) => ({
          ...transaction,
          category: incomeCategoryMap.get(transaction.category_id),
        })),
        expenseTransactions: expense.map((transaction) => ({
          ...transaction,
          category: expenseCategoryMap.get(transaction.category_id),
        })),
        incomeCategories,
        expenseCategories,
        currentMonth: { year, month },
        isLoading: false,
      });
    } catch (error) {
      set({
        error: storeError(error, "Failed to load finance data"),
        isLoading: false,
      });
    }
  },

  addTransaction: async (input: TransactionInput) => {
    set({ isLoading: true, error: null });
    try {
      await TransactionQueries.create(input);

      const { currentMonth } = get();
      await get().loadFinanceData(currentMonth.year, currentMonth.month);
    } catch (error) {
      const message = storeError(error, "Gagal menambah transaksi");
      set({ error: message, isLoading: false });
      throw new Error(message);
    }
  },

  updateTransaction: async (id: string, input: Partial<TransactionInput>) => {
    set({ isLoading: true, error: null });
    try {
      await TransactionQueries.update(id, input);

      const { currentMonth } = get();
      await get().loadFinanceData(currentMonth.year, currentMonth.month);
    } catch (error) {
      set({
        error: storeError(error, "Failed to update transaction"),
        isLoading: false,
      });
    }
  },

  deleteTransaction: async (id: string) => {
    set({ isLoading: true, error: null });
    try {
      await TransactionQueries.delete(id);

      const { currentMonth } = get();
      await get().loadFinanceData(currentMonth.year, currentMonth.month);
    } catch (error) {
      set({
        error: storeError(error, "Failed to delete transaction"),
        isLoading: false,
      });
    }
  },

  loadCategories: async () => {
    try {
      const [income, expense] = await Promise.all([
        CategoryQueries.getIncomeCategories(),
        CategoryQueries.getExpenseCategories(),
      ]);

      set({
        incomeCategories: income,
        expenseCategories: expense,
      });
    } catch (error) {
      console.error("Failed to load categories:", error);
    }
  },

  setMonth: (year: number, month: number) => {
    get().loadFinanceData(year, month);
  },

  clearError: () => set({ error: null }),
}));
