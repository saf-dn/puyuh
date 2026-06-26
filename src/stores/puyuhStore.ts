import { PuyuhQueries } from "@/database/queries/puyuh.queries";
import type { Puyuh, PuyuhInput } from "@/types";
import { storeError } from "@/utils/format";
import { create } from "zustand";

interface PuyuhState {
  isLoading: boolean;
  error: string | null;
  puyuhGroups: Puyuh[];
  totalPuyuh: number;

  loadPuyuh: () => Promise<void>;
  addPuyuh: (input: PuyuhInput) => Promise<void>;
  updatePuyuh: (id: string, input: Partial<PuyuhInput>) => Promise<void>;
  deletePuyuh: (id: string) => Promise<void>;
  clearError: () => void;
}

export const usePuyuhStore = create<PuyuhState>((set, get) => ({
  isLoading: false,
  error: null,
  puyuhGroups: [],
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

      // Sort by kandang (natural sort, so 1, 2, 10 instead of 1, 10, 2)
      puyuhs.sort((a, b) => {
        const kA = a.kandang || "";
        const kB = b.kandang || "";
        return kA.localeCompare(kB, undefined, { numeric: true, sensitivity: 'base' });
      });

      set({ puyuhGroups: puyuhs, totalPuyuh: total, isLoading: false });
    } catch (error) {
      set({ error: storeError(error, "Gagal memuat data puyuh"), isLoading: false });
    }
  },



  addPuyuh: async (input) => {
    set({ isLoading: true, error: null });
    try {
      if (input.kandang) {
        const existingGroup = get().puyuhGroups.find(
          p => p.kandang?.trim().toLowerCase() === input.kandang?.trim().toLowerCase() && p.age_months === input.age_months
        );
        
        if (existingGroup) {
          const newCount = existingGroup.count + input.count;
          await PuyuhQueries.update(existingGroup.id, { count: newCount });
          await get().loadPuyuh();
          return;
        }
      }

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



  clearError: () => set({ error: null }),
}));
