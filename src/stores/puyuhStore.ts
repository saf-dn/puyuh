import { getDatabase } from "@/database/db";
import {
    FeedTypeQueries
} from "@/database/queries/feed.queries";
import { PuyuhQueries } from "@/database/queries/puyuh.queries";
import {
    FeedType,
    FeedTypeInput,
    Puyuh,
    PuyuhInput
} from "@/types";
import { create } from "zustand";

interface PuyuhState {
  isLoading: boolean;
  error: string | null;
  puyuhGroups: Puyuh[];
  feedTypes: FeedType[];
  totalPuyuh: number;

  loadPuyuh: () => Promise<void>;
  loadFeedTypes: () => Promise<void>;
  addPuyuh: (input: PuyuhInput) => Promise<void>;
  updatePuyuh: (id: string, input: Partial<PuyuhInput>) => Promise<void>;
  deletePuyuh: (id: string) => Promise<void>;
  addFeedType: (input: FeedTypeInput) => Promise<void>;
  clearError: () => void;
}

export const usePuyuhStore = create<PuyuhState>((set, get) => ({
  isLoading: false,
  error: null,
  puyuhGroups: [],
  feedTypes: [],
  totalPuyuh: 0,

  loadPuyuh: async () => {
    set({ isLoading: true, error: null });
    try {
      const db = await getDatabase();
      const puyuhs = await PuyuhQueries.getAll(db);
      const total = await PuyuhQueries.getTotalCount(db);

      set({
        puyuhGroups: puyuhs,
        totalPuyuh: total,
        isLoading: false,
      });
    } catch (error) {
      set({
        error:
          error instanceof Error ? error.message : "Failed to load puyuh data",
        isLoading: false,
      });
    }
  },

  loadFeedTypes: async () => {
    try {
      const db = await getDatabase();
      const types = await FeedTypeQueries.getAll(db);
      set({ feedTypes: types });
    } catch (error) {
      console.error("Failed to load feed types:", error);
    }
  },

  addPuyuh: async (input: PuyuhInput) => {
    set({ isLoading: true, error: null });
    try {
      const db = await getDatabase();
      await PuyuhQueries.create(db, input);
      await get().loadPuyuh();
    } catch (error) {
      set({
        error: error instanceof Error ? error.message : "Failed to add puyuh",
        isLoading: false,
      });
    }
  },

  updatePuyuh: async (id: string, input: Partial<PuyuhInput>) => {
    set({ isLoading: true, error: null });
    try {
      const db = await getDatabase();
      await PuyuhQueries.update(db, id, input);
      await get().loadPuyuh();
    } catch (error) {
      set({
        error:
          error instanceof Error ? error.message : "Failed to update puyuh",
        isLoading: false,
      });
    }
  },

  deletePuyuh: async (id: string) => {
    set({ isLoading: true, error: null });
    try {
      const db = await getDatabase();
      await PuyuhQueries.delete(db, id);
      await get().loadPuyuh();
    } catch (error) {
      set({
        error:
          error instanceof Error ? error.message : "Failed to delete puyuh",
        isLoading: false,
      });
    }
  },

  addFeedType: async (input: FeedTypeInput) => {
    set({ isLoading: true, error: null });
    try {
      const db = await getDatabase();
      await FeedTypeQueries.create(db, input);
      await get().loadFeedTypes();
    } catch (error) {
      set({
        error:
          error instanceof Error ? error.message : "Failed to add feed type",
        isLoading: false,
      });
    }
  },

  clearError: () => set({ error: null }),
}));
