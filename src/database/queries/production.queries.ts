import { SQLiteDatabase } from "expo-sqlite";
import { v4 as uuid } from "uuid";
import { DailyProduction, DailyProductionInput } from "@/types";

export const ProductionQueries = {
  async create(
    db: SQLiteDatabase,
    input: DailyProductionInput,
  ): Promise<DailyProduction> {
    const id = uuid();
    const now = new Date().toISOString();

    const eggs_available =
      input.eggs_produced_count -
      (input.eggs_broken_count || 0) -
      (input.eggs_sold_count || 0);

    const total_revenue =
      (input.eggs_sold_count || 0) * (input.price_per_egg || 0);

    await db.runAsync(
      `INSERT INTO daily_production (id, date, eggs_produced_count, eggs_broken_count, eggs_sold_count, puyuh_died_count, price_per_egg, created_at, updated_at)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        id,
        input.date,
        input.eggs_produced_count,
        input.eggs_broken_count || 0,
        input.eggs_sold_count || 0,
        input.puyuh_died_count || 0,
        input.price_per_egg || 0,
        now,
        now,
      ],
    );

    return {
      id,
      date: input.date,
      eggs_produced_count: input.eggs_produced_count,
      eggs_broken_count: input.eggs_broken_count || 0,
      eggs_sold_count: input.eggs_sold_count || 0,
      eggs_available,
      puyuh_died_count: input.puyuh_died_count || 0,
      price_per_egg: input.price_per_egg || 0,
      total_revenue,
      created_at: now,
      updated_at: now,
    };
  },

  async getById(
    db: SQLiteDatabase,
    id: string,
  ): Promise<DailyProduction | null> {
    const result = await db.getFirstAsync<any>(
      "SELECT * FROM daily_production WHERE id = ?",
      [id],
    );

    if (!result) return null;

    return {
      ...result,
      eggs_available:
        result.eggs_produced_count -
        result.eggs_broken_count -
        result.eggs_sold_count,
      total_revenue: result.eggs_sold_count * result.price_per_egg,
    };
  },

  async getByDate(
    db: SQLiteDatabase,
    date: string,
  ): Promise<DailyProduction | null> {
    const result = await db.getFirstAsync<any>(
      "SELECT * FROM daily_production WHERE date = ?",
      [date],
    );

    if (!result) return null;

    return {
      ...result,
      eggs_available:
        result.eggs_produced_count -
        result.eggs_broken_count -
        result.eggs_sold_count,
      total_revenue: result.eggs_sold_count * result.price_per_egg,
    };
  },

  async getRange(
    db: SQLiteDatabase,
    startDate: string,
    endDate: string,
  ): Promise<DailyProduction[]> {
    const results = await db.getAllAsync<any>(
      "SELECT * FROM daily_production WHERE date BETWEEN ? AND ? ORDER BY date ASC",
      [startDate, endDate],
    );

    return results.map((r) => ({
      ...r,
      eggs_available:
        r.eggs_produced_count - r.eggs_broken_count - r.eggs_sold_count,
      total_revenue: r.eggs_sold_count * r.price_per_egg,
    }));
  },

  async getMonthlyStats(
    db: SQLiteDatabase,
    year: number,
    month: number,
  ): Promise<{
    total_eggs_produced: number;
    total_eggs_broken: number;
    total_eggs_sold: number;
    total_eggs_available: number;
    total_puyuh_died: number;
    total_revenue: number;
    avg_eggs_per_day: number;
  }> {
    const startDate = new Date(year, month - 1, 1);
    const endDate = new Date(year, month, 0);

    const result = await db.getFirstAsync<{
      total_produced: number;
      total_broken: number;
      total_sold: number;
      total_died: number;
      total_price: number;
      count: number;
    }>(
      `SELECT
        SUM(eggs_produced_count) as total_produced,
        SUM(eggs_broken_count) as total_broken,
        SUM(eggs_sold_count) as total_sold,
        SUM(puyuh_died_count) as total_died,
        SUM(eggs_sold_count * price_per_egg) as total_price,
        COUNT(*) as count
       FROM daily_production
       WHERE date BETWEEN ? AND ?`,
      [
        startDate.toISOString().split("T")[0],
        endDate.toISOString().split("T")[0],
      ],
    );

    const total_produced = result?.total_produced || 0;
    const total_broken = result?.total_broken || 0;
    const total_sold = result?.total_sold || 0;

    return {
      total_eggs_produced: total_produced,
      total_eggs_broken: total_broken,
      total_eggs_sold: total_sold,
      total_eggs_available: total_produced - total_broken - total_sold,
      total_puyuh_died: result?.total_died || 0,
      total_revenue: result?.total_price || 0,
      avg_eggs_per_day: result?.count
        ? Math.round(total_produced / result.count)
        : 0,
    };
  },

  async update(
    db: SQLiteDatabase,
    id: string,
    input: Partial<DailyProductionInput>,
  ): Promise<DailyProduction | null> {
    const current = await this.getById(db, id);
    if (!current) return null;

    const now = new Date().toISOString();

    const updated: DailyProduction = {
      ...current,
      ...input,
      id: current.id,
      created_at: current.created_at,
      updated_at: now,
    };

    updated.eggs_available =
      updated.eggs_produced_count -
      updated.eggs_broken_count -
      updated.eggs_sold_count;
    updated.total_revenue = updated.eggs_sold_count * updated.price_per_egg;

    await db.runAsync(
      `UPDATE daily_production SET eggs_produced_count = ?, eggs_broken_count = ?, eggs_sold_count = ?, puyuh_died_count = ?, price_per_egg = ?, updated_at = ?
       WHERE id = ?`,
      [
        updated.eggs_produced_count,
        updated.eggs_broken_count,
        updated.eggs_sold_count,
        updated.puyuh_died_count,
        updated.price_per_egg,
        now,
        id,
      ],
    );

    return updated;
  },

  async delete(db: SQLiteDatabase, id: string): Promise<boolean> {
    const result = await db.runAsync(
      "DELETE FROM daily_production WHERE id = ?",
      [id],
    );
    return (result?.changes || 0) > 0;
  },
};
