import { DailyFeedQueries } from "@/database/queries/feed.queries";
import { ProductionQueries } from "@/database/queries/production.queries";
import { PuyuhQueries } from "@/database/queries/puyuh.queries";
import { TransactionQueries } from "@/database/queries/transaction.queries";
import type { DailyProduction, DailyProductionInput, MonthlySummary } from "@/types";
import { getDaysInMonth, storeError } from "@/utils/format";
import { create } from "zustand";

interface SummaryState {
  isLoading: boolean;
  error: string | null;
  monthlySummary: MonthlySummary | null;
  dailyProduction: DailyProduction | null;
  currentDate: string;

  loadMonthlySummary: (year: number, month: number) => Promise<void>;
  loadDailyProduction: (date: string) => Promise<void>;
  addDailyProduction: (input: DailyProductionInput) => Promise<void>;
  updateDailyProduction: (
    id: string,
    input: Partial<DailyProductionInput>,
  ) => Promise<void>;
  setCurrentDate: (date: string) => void;
  clearError: () => void;
}

export const useSummaryStore = create<SummaryState>((set, get) => ({
  isLoading: false,
  error: null,
  monthlySummary: null,
  dailyProduction: null,
  currentDate: new Date().toISOString().split("T")[0],

  loadMonthlySummary: async (year: number, month: number) => {
    const hasData = get().monthlySummary !== null;
    if (!hasData) set({ isLoading: true, error: null });
    else set({ error: null });
    
    try {
      const [prodStats, finStats, allPuyuhs, puyuhDied, feedCosts] = await Promise.all([
        ProductionQueries.getMonthlyStats(year, month),
        TransactionQueries.getMonthlySummary(year, month),
        PuyuhQueries.getAll(),
        PuyuhQueries.getTotalDeadThisMonth(year, month),
        DailyFeedQueries.getMonthlyTotalAll(year, month),
      ]);

      const puyuhByAge = allPuyuhs.map((p) => ({
        age_months: p.age_months,
        count: p.count,
        status: p.status,
        created_at: p.created_at,
      }));

      const summary: MonthlySummary = {
        period: `${year}-${String(month).padStart(2, "0")}`,
        total_puyuh: allPuyuhs.reduce((sum, p) => sum + p.count, 0),
        puyuh_by_age: puyuhByAge,
        puyuh_died_count: puyuhDied,
        eggs_produced: prodStats.total_eggs_produced,
        eggs_broken: prodStats.total_eggs_broken,
        eggs_sold: prodStats.total_eggs_sold,
        eggs_available: prodStats.total_eggs_available,
        avg_eggs_per_day: prodStats.avg_eggs_per_day,
        avg_price_per_egg: prodStats.avg_price_per_egg,
        total_feed_cost: feedCosts.total_cost,
        total_feed_kg: feedCosts.total_kg,
        avg_feed_per_day: feedCosts.total_kg
          ? Math.round(
              (feedCosts.total_kg / getDaysInMonth(year, month)) * 100,
            ) / 100
          : 0,
        total_income: finStats.total_income,
        total_expense: finStats.total_expense,
        profit: finStats.total_income - finStats.total_expense,
        roi_percentage:
          finStats.total_expense > 0
            ? Math.round(
                ((finStats.total_income - finStats.total_expense) /
                  finStats.total_expense) *
                  100 *
                  100,
              ) / 100
            : 0,
        income_by_category: finStats.income_by_category,
        expense_by_category: finStats.expense_by_category,
      };

      set({ monthlySummary: summary, isLoading: false });
    } catch (error) {
      set({
        error: storeError(error, "Failed to load summary"),
        isLoading: false,
      });
    }
  },

  loadDailyProduction: async (date: string) => {
    set({ isLoading: true, error: null });
    try {
      const production = await ProductionQueries.getByDate(date);

      set({
        dailyProduction: production,
        currentDate: date,
        isLoading: false,
      });
    } catch (error) {
      set({
        error: storeError(error, "Failed to load daily production"),
        isLoading: false,
      });
    }
  },

  addDailyProduction: async (input: DailyProductionInput) => {
    set({ isLoading: true, error: null });
    try {
      await ProductionQueries.create(input);
      await get().loadDailyProduction(input.date);
    } catch (error) {
      set({
        error: storeError(error, "Failed to add production record"),
        isLoading: false,
      });
    }
  },

  updateDailyProduction: async (
    id: string,
    input: Partial<DailyProductionInput>,
  ) => {
    set({ isLoading: true, error: null });
    try {
      const updated = await ProductionQueries.update(id, input);
      if (updated) {
        set({ dailyProduction: updated, isLoading: false });
      }
    } catch (error) {
      set({
        error: storeError(error, "Failed to update production"),
        isLoading: false,
      });
    }
  },

  setCurrentDate: (date: string) => {
    get().loadDailyProduction(date);
  },

  clearError: () => set({ error: null }),
}));
