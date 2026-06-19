import { getDatabase } from "@/database/db";
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

function getDateRange(year: number, month: number) {
  const start = new Date(year, month - 1, 1);
  const end = new Date(year, month, 0);

  return {
    start: start.toISOString().split("T")[0],
    end: end.toISOString().split("T")[0],
  };
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
    set({ isLoading: true, error: null });
    try {
      const db = await getDatabase();
      const { start, end } = getDateRange(year, month);

      const income = await TransactionQueries.getRange(
        db,
        start,
        end,
        TransactionType.INCOME,
      );
      const expense = await TransactionQueries.getRange(
        db,
        start,
        end,
        TransactionType.EXPENSE,
      );

      set({
        incomeTransactions: income,
        expenseTransactions: expense,
        currentMonth: { year, month },
        isLoading: false,
      });
    } catch (error) {
      set({
        error:
          error instanceof Error
            ? error.message
            : "Failed to load finance data",
        isLoading: false,
      });
    }
  },

  addTransaction: async (input: TransactionInput) => {
    set({ isLoading: true, error: null });
    try {
      const db = await getDatabase();
      await TransactionQueries.create(db, input);

      const { currentMonth } = get();
      await get().loadFinanceData(currentMonth.year, currentMonth.month);
    } catch (error) {
      set({
        error:
          error instanceof Error ? error.message : "Failed to add transaction",
        isLoading: false,
      });
    }
  },

  updateTransaction: async (id: string, input: Partial<TransactionInput>) => {
    set({ isLoading: true, error: null });
    try {
      const db = await getDatabase();
      await TransactionQueries.update(db, id, input);

      const { currentMonth } = get();
      await get().loadFinanceData(currentMonth.year, currentMonth.month);
    } catch (error) {
      set({
        error:
          error instanceof Error
            ? error.message
            : "Failed to update transaction",
        isLoading: false,
      });
    }
  },

  deleteTransaction: async (id: string) => {
    set({ isLoading: true, error: null });
    try {
      const db = await getDatabase();
      await TransactionQueries.delete(db, id);

      const { currentMonth } = get();
      await get().loadFinanceData(currentMonth.year, currentMonth.month);
    } catch (error) {
      set({
        error:
          error instanceof Error
            ? error.message
            : "Failed to delete transaction",
        isLoading: false,
      });
    }
  },

  loadCategories: async () => {
    try {
      const db = await getDatabase();
      const income = await CategoryQueries.getIncomeCategories(db);
      const expense = await CategoryQueries.getExpenseCategories(db);

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
