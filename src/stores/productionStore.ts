import { ProductionQueries } from "@/database/queries/production.queries";
import { TransactionQueries } from "@/database/queries/transaction.queries";
import { TransactionType, type DailyProduction } from "@/types";
import { getDateRange, storeError, getCurrentDate } from "@/utils/format";
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
    eggsProduced?: number;
    eggsBroken?: number;
    eggsSold?: number;
    puyuhDied?: number;
    pricePerEgg?: number;
    buyerName?: string;
    photoEggs?: string;
    photoTransfer?: string;
    paymentStatus?: string;
  }) => Promise<void>;
  updateProduction: (id: string, data: {
    eggsProduced?: number;
    eggsBroken?: number;
    eggsSold?: number;
    puyuhDied?: number;
    pricePerEgg?: number;
    buyerName?: string;
    photoEggs?: string;
    photoTransfer?: string;
    paymentStatus?: string;
  }) => Promise<void>;
  recordDeadPuyuh: (count: number) => Promise<void>;
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
      const hasData = get().productions.length > 0 || get().todayProduction !== null;
      if (!hasData) set({ isLoading: true, error: null });
      else set({ error: null });
      const today = getCurrentDate();
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
      const date = getCurrentDate();
      const today = new Date();
      const priceToUse = data.pricePerEgg || PRICE_PER_EGG;

      // Save production data
      await ProductionQueries.create({
        date,
        eggs_produced_count: data.eggsProduced,
        eggs_broken_count: data.eggsBroken,
        eggs_sold_count: data.eggsSold,
        puyuh_died_count: data.puyuhDied,
        price_per_egg: priceToUse,
        buyer_name: data.buyerName,
        photo_eggs: data.photoEggs,
        photo_transfer: data.photoTransfer,
        payment_status: data.paymentStatus,
      });

      // Auto-create income transaction if eggs were sold
      if (data.eggsSold && data.eggsSold > 0) {
        const totalRevenue = data.eggsSold * priceToUse;
        await TransactionQueries.create({
          date,
          transaction_type: TransactionType.INCOME,
          category_id: EGG_SALES_CATEGORY_ID,
          amount: totalRevenue,
          description: `Penjualan ${data.eggsSold} telur @ ${priceToUse}/pcs ${data.buyerName ? `ke ${data.buyerName}` : ''}`,
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

  updateProduction: async (id, data) => {
    try {
      set({ isLoading: true, error: null });
      
      await ProductionQueries.update(id, {
        eggs_produced_count: data.eggsProduced,
        eggs_broken_count: data.eggsBroken,
        eggs_sold_count: data.eggsSold,
        puyuh_died_count: data.puyuhDied,
        price_per_egg: data.pricePerEgg || PRICE_PER_EGG,
        buyer_name: data.buyerName,
        photo_eggs: data.photoEggs,
        photo_transfer: data.photoTransfer,
        payment_status: data.paymentStatus,
      });

      const today = new Date();
      await get().loadProductions(today.getFullYear(), today.getMonth() + 1);
    } catch (error) {
      const message = storeError(error, "Gagal mengupdate produksi");
      set({ error: message, isLoading: false });
      throw new Error(message);
    }
  },

  recordDeadPuyuh: async (count) => {
    try {
      const date = getCurrentDate();
      const today = new Date();
      const existing = await ProductionQueries.getByDate(date);
      if (existing) {
        await ProductionQueries.update(existing.id, {
          puyuh_died_count: (existing.puyuh_died_count || 0) + count,
        });
      } else {
        await ProductionQueries.create({
          date,
          eggs_produced_count: 0,
          puyuh_died_count: count,
        });
      }
      await get().loadProductions(today.getFullYear(), today.getMonth() + 1);
    } catch (error) {
      console.error("Gagal mencatat puyuh mati:", error);
    }
  },

  clearError: () => set({ error: null }),
}));
