import { DailyFeedQueries } from "@/database/queries/feed.queries";
import { getDatabase } from "@/database/db";
import { DailyFeed } from "@/types";
import { create } from "zustand";

interface FeedStore {
  feeds: DailyFeed[];
  loading: boolean;
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

function getDateRange(year: number, month: number) {
  const start = new Date(year, month - 1, 1);
  const end = new Date(year, month, 0);

  return {
    start: start.toISOString().split("T")[0],
    end: end.toISOString().split("T")[0],
  };
}

export const useFeedStore = create<FeedStore>((set, get) => ({
  feeds: [],
  loading: false,
  error: null,

  loadFeeds: async (year: number, month: number) => {
    try {
      set({ loading: true, error: null });
      const db = await getDatabase();
      const { start, end } = getDateRange(year, month);
      const data = await DailyFeedQueries.getRange(db, start, end);
      set({ feeds: data });
    } catch (err) {
      set({
        error: `Failed to load feeds: ${err instanceof Error ? err.message : "Unknown error"}`,
      });
    } finally {
      set({ loading: false });
    }
  },

  addFeed: async (data) => {
    try {
      set({ loading: true, error: null });
      const db = await getDatabase();
      const today = new Date();
      await DailyFeedQueries.create(db, {
        date: today.toISOString().split("T")[0],
        puyuh_id: data.puyuhGroupId,
        feed_type_id: data.feedTypeId,
        frequency_per_day: data.frequencyPerDay,
        amount_per_bird: data.amountPerBird,
      });
      // Reload feeds for the current month
      const year = today.getFullYear();
      const month = today.getMonth() + 1;
      await get().loadFeeds(year, month);
    } catch (err) {
      set({
        error: `Failed to add feed: ${err instanceof Error ? err.message : "Unknown error"}`,
      });
    } finally {
      set({ loading: false });
    }
  },

  clearError: () => set({ error: null }),
}));
