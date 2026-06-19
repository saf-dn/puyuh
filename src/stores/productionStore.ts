import { ProductionQueries } from "@/database/queries/production.queries";
import { getDatabase } from "@/database/db";
import { DailyProduction } from "@/types";
import { create } from "zustand";

interface ProductionStore {
  productions: DailyProduction[];
  loading: boolean;
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

function getDateRange(year: number, month: number) {
  const start = new Date(year, month - 1, 1);
  const end = new Date(year, month, 0);

  return {
    start: start.toISOString().split("T")[0],
    end: end.toISOString().split("T")[0],
  };
}

export const useProductionStore = create<ProductionStore>((set, get) => ({
  productions: [],
  loading: false,
  error: null,

  loadProductions: async (year: number, month: number) => {
    try {
      set({ loading: true, error: null });
      const db = await getDatabase();
      const { start, end } = getDateRange(year, month);
      const data = await ProductionQueries.getRange(db, start, end);
      set({ productions: data });
    } catch (err) {
      set({
        error: `Failed to load productions: ${err instanceof Error ? err.message : "Unknown error"}`,
      });
    } finally {
      set({ loading: false });
    }
  },

  addProduction: async (data) => {
    try {
      set({ loading: true, error: null });
      const db = await getDatabase();
      const today = new Date();
      await ProductionQueries.create(db, {
        date: today.toISOString().split("T")[0],
        eggs_produced_count: data.eggsProduced,
        eggs_broken_count: data.eggsBroken,
        eggs_sold_count: data.eggsSold,
        puyuh_died_count: data.puyuhDied,
        price_per_egg: data.pricePerEgg,
      });
      // Reload productions for the current month
      const year = today.getFullYear();
      const month = today.getMonth() + 1;
      await get().loadProductions(year, month);
    } catch (err) {
      set({
        error: `Failed to add production: ${err instanceof Error ? err.message : "Unknown error"}`,
      });
    } finally {
      set({ loading: false });
    }
  },

  clearError: () => set({ error: null }),
}));
