import { getDatabase } from "@/database/db";
import { ProductionQueries } from "@/database/queries/production.queries";
import { PuyuhQueries } from "@/database/queries/puyuh.queries";
import { TransactionQueries } from "@/database/queries/transaction.queries";
import {
    DailyProduction,
    DailyProductionInput,
    MonthlySummary
} from "@/types";
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

function getDateRange(year: number, month: number) {
  const start = new Date(year, month - 1, 1);
  const end = new Date(year, month, 0);

  return {
    start: start.toISOString().split("T")[0],
    end: end.toISOString().split("T")[0],
  };
}

export const useSummaryStore = create<SummaryState>((set, get) => ({
  isLoading: false,
  error: null,
  monthlySummary: null,
  dailyProduction: null,
  currentDate: new Date().toISOString().split("T")[0],

  loadMonthlySummary: async (year: number, month: number) => {
    set({ isLoading: true, error: null });
    try {
      const db = await getDatabase();
      const { start, end } = getDateRange(year, month);

      // Get production stats
      const prodStats = await ProductionQueries.getMonthlyStats(
        db,
        year,
        month,
      );

      // Get financial summary
      const finStats = await TransactionQueries.getMonthlySummary(
        db,
        year,
        month,
      );

      // Get puyuh summary
      const allPuyuhs = await PuyuhQueries.getAll(db);
      const puyuhByAge = allPuyuhs.map((p) => ({
        age_months: p.age_months,
        count: p.count,
        status: p.status,
      }));

      // Get puyuh that died
      const puyuhDied = await PuyuhQueries.getTotalDeadThisMonth(
        db,
        year,
        month,
      );

      // Get feed costs
      const feedCosts = await db.getFirstAsync<{
        total_cost: number;
        total_kg: number;
      }>(
        `SELECT SUM(cost) as total_cost, SUM(total_amount) as total_kg FROM daily_feed
         WHERE date BETWEEN ? AND ?`,
        [start, end],
      );

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
        total_feed_cost: feedCosts?.total_cost || 0,
        total_feed_kg: feedCosts?.total_kg || 0,
        avg_feed_per_day: feedCosts?.total_kg
          ? Math.round((feedCosts.total_kg / 30) * 100) / 100
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
        error:
          error instanceof Error ? error.message : "Failed to load summary",
        isLoading: false,
      });
    }
  },

  loadDailyProduction: async (date: string) => {
    set({ isLoading: true, error: null });
    try {
      const db = await getDatabase();
      const production = await ProductionQueries.getByDate(db, date);

      set({
        dailyProduction: production,
        currentDate: date,
        isLoading: false,
      });
    } catch (error) {
      set({
        error:
          error instanceof Error
            ? error.message
            : "Failed to load daily production",
        isLoading: false,
      });
    }
  },

  addDailyProduction: async (input: DailyProductionInput) => {
    set({ isLoading: true, error: null });
    try {
      const db = await getDatabase();
      await ProductionQueries.create(db, input);
      await get().loadDailyProduction(input.date);
    } catch (error) {
      set({
        error:
          error instanceof Error
            ? error.message
            : "Failed to add production record",
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
      const db = await getDatabase();
      const updated = await ProductionQueries.update(db, id, input);
      if (updated) {
        set({ dailyProduction: updated, isLoading: false });
      }
    } catch (error) {
      set({
        error:
          error instanceof Error
            ? error.message
            : "Failed to update production",
        isLoading: false,
      });
    }
  },

  setCurrentDate: (date: string) => {
    get().loadDailyProduction(date);
  },

  clearError: () => set({ error: null }),
}));
