import { FeedTypeQueries } from "@/database/queries/feed.queries";
import { PuyuhQueries } from "@/database/queries/puyuh.queries";
import { FeedType, FeedTypeInput, Puyuh, PuyuhInput } from "@/types";
import { storeError } from "@/utils/format";
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
    const hasData = get().puyuhGroups.length > 0;
    if (!hasData) set({ isLoading: true, error: null });
    else set({ error: null });
    
    try {
      const [puyuhs, total] = await Promise.all([
        PuyuhQueries.getAll(),
        PuyuhQueries.getTotalCount(),
      ]);
      set({ puyuhGroups: puyuhs, totalPuyuh: total, isLoading: false });
    } catch (error) {
      set({ error: storeError(error, "Gagal memuat data puyuh"), isLoading: false });
    }
  },

  loadFeedTypes: async () => {
    try {
      const types = await FeedTypeQueries.getAll();
      set({ feedTypes: types });
    } catch (error) {
      console.error("Failed to load feed types:", error);
    }
  },

  addPuyuh: async (input) => {
    set({ isLoading: true, error: null });
    try {
      await PuyuhQueries.create(input);
      await get().loadPuyuh();
    } catch (error) {
      const msg = storeError(error, "Gagal menambah puyuh");
      set({ error: msg, isLoading: false });
      throw new Error(msg);
    }
  },

  updatePuyuh: async (id, input) => {
    set({ isLoading: true, error: null });
    try {
      await PuyuhQueries.update(id, input);
      await get().loadPuyuh();
    } catch (error) {
      const msg = storeError(error, "Gagal memperbarui puyuh");
      set({ error: msg, isLoading: false });
      throw new Error(msg);
    }
  },

  deletePuyuh: async (id) => {
    set({ isLoading: true, error: null });
    try {
      await PuyuhQueries.delete(id);
      await get().loadPuyuh();
    } catch (error) {
      const msg = storeError(error, "Gagal menghapus puyuh");
      set({ error: msg, isLoading: false });
      throw new Error(msg);
    }
  },

  addFeedType: async (input) => {
    set({ isLoading: true, error: null });
    try {
      await FeedTypeQueries.create(input);
      await get().loadFeedTypes();
    } catch (error) {
      const msg = storeError(error, "Gagal menambah jenis pakan");
      set({ error: msg, isLoading: false });
      throw new Error(msg);
    }
  },

  clearError: () => set({ error: null }),
}));
