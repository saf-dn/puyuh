import { DailyFeedQueries, FeedStockQueries } from "@/database/queries/feed.queries";
import { PuyuhQueries } from "@/database/queries/puyuh.queries";
import type { DailyFeed } from "@/types";
import { getDateRange, storeError, getCurrentDate } from "@/utils/format";
import { create } from "zustand";

interface FeedStore {
  feeds: DailyFeed[];
  dailyFeedKg: number;
  monthlyFeedKg: number;
  stockKg: number;
  feedPerQuailGrams: number;
  isLoading: boolean;
  error: string | null;
  loadFeeds: (year: number, month: number) => Promise<void>;
  addFeed: (data: {
    puyuhGroupId: string;
    photo: string;
  }, kgUsed?: number) => Promise<void>;
  addStock: (kg: number) => void;
  deductStock: (kg: number) => void;
  setStockExact: (kg: number) => void;
  setFeedPerQuailGrams: (grams: number) => void;
  clearError: () => void;
}

export const useFeedStore = create<FeedStore>((set, get) => ({
  feeds: [],
  dailyFeedKg: 0,
  monthlyFeedKg: 0,
  stockKg: 0,
  feedPerQuailGrams: Number(localStorage.getItem('np_feed_per_quail')) || 25,
  isLoading: false,
  error: null,

  loadFeeds: async (year: number, month: number) => {
    try {
      const hasData = get().feeds.length > 0;
      if (!hasData) set({ isLoading: true, error: null });
      else set({ error: null });
      const { start, end } = getDateRange(year, month);
      const today = getCurrentDate();

      const [feeds, puyuhs, currentStock] = await Promise.all([
        DailyFeedQueries.getRange(start, end),
        PuyuhQueries.getAll(),
        FeedStockQueries.getStock(),
      ]);

      let dailyKg = 0;
      let monthlyKg = 0;
      const puyuhMap = new Map(puyuhs.map(p => [p.id, p.count]));
      const feedRate = get().feedPerQuailGrams;

      feeds.forEach(f => {
        const count = puyuhMap.get(f.puyuh_id) || 0;
        const kg = (count * feedRate) / 1000;
        monthlyKg += kg;
        if (f.date === today) {
          dailyKg += kg;
        }
      });

      set({
        feeds,
        dailyFeedKg: dailyKg,
        monthlyFeedKg: monthlyKg,
        stockKg: currentStock,
        isLoading: false,
      });
    } catch (error) {
      set({
        error: storeError(error, "Gagal memuat data pakan"),
        isLoading: false,
      });
    }
  },

  addFeed: async (data, kgUsed) => {
    try {
      set({ isLoading: true, error: null });
      const today = new Date();
      const date = getCurrentDate();

      await DailyFeedQueries.create({
        date,
        puyuh_id: data.puyuhGroupId,
        photo: data.photo,
      });

      if (kgUsed) {
        get().deductStock(kgUsed);
      }

      const year = today.getFullYear();
      const month = today.getMonth() + 1;
      await get().loadFeeds(year, month);
    } catch (error) {
      const message = storeError(error, "Gagal mencatat pakan");
      set({ error: message, isLoading: false });
      throw new Error(message);
    }
  },

  addStock: async (kg: number) => {
    const newStock = get().stockKg + kg;
    set({ stockKg: newStock });
    try {
      await FeedStockQueries.setStock(newStock);
    } catch (e) {
      console.error("Failed to update stock:", e);
    }
  },

  deductStock: async (kg: number) => {
    const newStock = Math.max(0, get().stockKg - kg);
    set({ stockKg: newStock });
    try {
      await FeedStockQueries.setStock(newStock);
    } catch (e) {
      console.error("Failed to deduct stock:", e);
    }
  },

  setStockExact: async (kg: number) => {
    set({ stockKg: kg });
    try {
      await FeedStockQueries.setStock(kg);
    } catch (e) {
      console.error("Failed to set stock:", e);
    }
  },

  setFeedPerQuailGrams: (grams: number) => {
    localStorage.setItem('np_feed_per_quail', grams.toString());
    set({ feedPerQuailGrams: grams });
  },

  clearError: () => set({ error: null }),
}));
