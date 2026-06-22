import { DailyFeedQueries } from "@/database/queries/feed.queries";
import { DailyFeed } from "@/types";
import { getDateRange, storeError } from "@/utils/format";
import { create } from "zustand";

interface FeedStore {
  feeds: DailyFeed[];
  dailyFeedKg: number;
  monthlyFeedKg: number;
  isLoading: boolean;
  error: string | null;
  loadFeeds: (year: number, month: number) => Promise<void>;
  addFeed: (data: {
    puyuhGroupId: string;
    feedTypeId: string;
    frequencyPerDay: number;
    amountPerBird: number;
  }) => Promise<void>;
  clearError: () => void;
}

export const useFeedStore = create<FeedStore>((set, get) => ({
  feeds: [],
  dailyFeedKg: 0,
  monthlyFeedKg: 0,
  isLoading: false,
  error: null,

  loadFeeds: async (year: number, month: number) => {
    try {
      const hasData = get().feeds.length > 0;
      if (!hasData) set({ isLoading: true, error: null });
      else set({ error: null });
      const { start, end } = getDateRange(year, month);
      const today = new Date().toISOString().split("T")[0];

      const [feeds, dailyTotal, monthlyTotal] = await Promise.all([
        DailyFeedQueries.getRange(start, end),
        DailyFeedQueries.getDailyTotal(today),
        DailyFeedQueries.getMonthlyTotalAll(year, month),
      ]);

      set({
        feeds,
        dailyFeedKg: dailyTotal.total_kg,
        monthlyFeedKg: monthlyTotal.total_kg,
        isLoading: false,
      });
    } catch (error) {
      set({
        error: storeError(error, "Gagal memuat data pakan"),
        isLoading: false,
      });
    }
  },

  addFeed: async (data) => {
    try {
      set({ isLoading: true, error: null });
      const today = new Date();
      const date = today.toISOString().split("T")[0];

      await DailyFeedQueries.create({
        date,
        puyuh_id: data.puyuhGroupId,
        feed_type_id: data.feedTypeId,
        frequency_per_day: data.frequencyPerDay,
        amount_per_bird: data.amountPerBird,
      });

      const year = today.getFullYear();
      const month = today.getMonth() + 1;
      await get().loadFeeds(year, month);
    } catch (error) {
      const message = storeError(error, "Gagal mencatat pakan");
      set({ error: message, isLoading: false });
      throw new Error(message);
    }
  },

  clearError: () => set({ error: null }),
}));
