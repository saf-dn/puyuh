import { ProductionQueries } from "@/database/queries/production.queries";
import { TransactionQueries } from "@/database/queries/transaction.queries";
import { DailyProduction, TransactionType } from "@/types";
import { getDateRange, storeError } from "@/utils/format";
import { create } from "zustand";

const PRICE_PER_EGG = 400;
const EGG_SALES_CATEGORY_ID = "inc_eggs"; // matches seeded income category

interface ProductionStore {
  productions: DailyProduction[];
  todayProduction: DailyProduction | null;
  monthlyStats: {
    total_eggs_produced: number;
    total_eggs_broken: number;
    total_eggs_sold: number;
    total_eggs_available: number;
    total_puyuh_died: number;
    avg_eggs_per_day: number;
    avg_price_per_egg: number;
  } | null;
  isLoading: boolean;
  error: string | null;
  loadProductions: (year: number, month: number) => Promise<void>;
  addProduction: (data: {
    eggsProduced: number;
    eggsBroken: number;
    eggsSold: number;
    puyuhDied: number;
    pricePerEgg: number;
  }) => Promise<void>;
  clearError: () => void;
}

export const useProductionStore = create<ProductionStore>((set, get) => ({
  productions: [],
  todayProduction: null,
  monthlyStats: null,
  isLoading: false,
  error: null,

  loadProductions: async (year: number, month: number) => {
    try {
      set({ isLoading: true, error: null });
      const today = new Date().toISOString().split("T")[0];
      const { start, end } = getDateRange(year, month);

      const [productions, todayProduction, monthlyStats] = await Promise.all([
        ProductionQueries.getRange(start, end),
        ProductionQueries.getByDate(today),
        ProductionQueries.getMonthlyStats(year, month),
      ]);

      set({
        productions,
        todayProduction,
        monthlyStats,
        isLoading: false,
      });
    } catch (error) {
      set({
        error: storeError(error, "Gagal memuat data produksi"),
        isLoading: false,
      });
    }
  },

  addProduction: async (data) => {
    try {
      set({ isLoading: true, error: null });
      const today = new Date();
      const date = today.toISOString().split("T")[0];

      // Save production data
      await ProductionQueries.create({
        date,
        eggs_produced_count: data.eggsProduced,
        eggs_broken_count: data.eggsBroken,
        eggs_sold_count: data.eggsSold,
        puyuh_died_count: data.puyuhDied,
        price_per_egg: PRICE_PER_EGG,
      });

      // Auto-create income transaction if eggs were sold
      if (data.eggsSold > 0) {
        const totalRevenue = data.eggsSold * PRICE_PER_EGG;
        await TransactionQueries.create({
          date,
          transaction_type: TransactionType.INCOME,
          category_id: EGG_SALES_CATEGORY_ID,
          amount: totalRevenue,
          description: `Penjualan ${data.eggsSold} telur @ ${PRICE_PER_EGG}/pcs`,
        });
      }

      const year = today.getFullYear();
      const month = today.getMonth() + 1;
      await get().loadProductions(year, month);
    } catch (error) {
      const message = storeError(error, "Gagal mencatat produksi");
      set({ error: message, isLoading: false });
      throw new Error(message);
    }
  },

  clearError: () => set({ error: null }),
}));
