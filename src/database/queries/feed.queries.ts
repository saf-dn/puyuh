import { SQLiteDatabase } from "expo-sqlite";
import { v4 as uuid } from "uuid";
import { DailyFeed, DailyFeedInput, FeedType, FeedTypeInput } from "@/types";

export const FeedTypeQueries = {
  async create(db: SQLiteDatabase, input: FeedTypeInput): Promise<FeedType> {
    const id = uuid();
    const now = new Date().toISOString();

    await db.runAsync(
      `INSERT INTO feed_type (id, name, unit, price_per_unit, created_at)
       VALUES (?, ?, ?, ?, ?)`,
      [id, input.name, input.unit, input.price_per_unit || 0, now],
    );

    return {
      id,
      name: input.name,
      unit: input.unit,
      price_per_unit: input.price_per_unit || 0,
      created_at: now,
    };
  },

  async getById(db: SQLiteDatabase, id: string): Promise<FeedType | null> {
    const result = await db.getFirstAsync<FeedType>(
      "SELECT * FROM feed_type WHERE id = ?",
      [id],
    );
    return result || null;
  },

  async getAll(db: SQLiteDatabase): Promise<FeedType[]> {
    const results = await db.getAllAsync<FeedType>(
      "SELECT * FROM feed_type ORDER BY name ASC",
    );
    return results;
  },

  async update(
    db: SQLiteDatabase,
    id: string,
    input: Partial<FeedTypeInput>,
  ): Promise<FeedType | null> {
    const current = await this.getById(db, id);
    if (!current) return null;

    const updated: FeedType = {
      ...current,
      ...input,
      id: current.id,
      created_at: current.created_at,
    };

    await db.runAsync(
      `UPDATE feed_type SET name = ?, unit = ?, price_per_unit = ?
       WHERE id = ?`,
      [updated.name, updated.unit, updated.price_per_unit, id],
    );

    return updated;
  },

  async delete(db: SQLiteDatabase, id: string): Promise<boolean> {
    const result = await db.runAsync("DELETE FROM feed_type WHERE id = ?", [
      id,
    ]);
    return (result?.changes || 0) > 0;
  },
};

export const DailyFeedQueries = {
  async create(db: SQLiteDatabase, input: DailyFeedInput): Promise<DailyFeed> {
    const id = uuid();
    const now = new Date().toISOString();

    // Get puyuh count
    const puyuh = await db.getFirstAsync<{ count: number }>(
      "SELECT count FROM puyuh WHERE id = ?",
      [input.puyuh_id],
    );

    const total_amount = (puyuh?.count || 1) * input.amount_per_bird;

    // Get feed type price
    const feedType = await db.getFirstAsync<{ price_per_unit: number }>(
      "SELECT price_per_unit FROM feed_type WHERE id = ?",
      [input.feed_type_id],
    );

    const cost = total_amount * (feedType?.price_per_unit || 0);

    await db.runAsync(
      `INSERT INTO daily_feed (id, date, puyuh_id, feed_type_id, frequency_per_day, amount_per_bird, total_amount, cost, created_at, updated_at)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        id,
        input.date,
        input.puyuh_id,
        input.feed_type_id,
        input.frequency_per_day,
        input.amount_per_bird,
        total_amount,
        cost,
        now,
        now,
      ],
    );

    return {
      id,
      date: input.date,
      puyuh_id: input.puyuh_id,
      feed_type_id: input.feed_type_id,
      frequency_per_day: input.frequency_per_day,
      amount_per_bird: input.amount_per_bird,
      total_amount,
      cost,
      created_at: now,
      updated_at: now,
    };
  },

  async getById(db: SQLiteDatabase, id: string): Promise<DailyFeed | null> {
    const result = await db.getFirstAsync<DailyFeed>(
      "SELECT * FROM daily_feed WHERE id = ?",
      [id],
    );
    return result || null;
  },

  async getByDate(db: SQLiteDatabase, date: string): Promise<DailyFeed[]> {
    const results = await db.getAllAsync<DailyFeed>(
      "SELECT * FROM daily_feed WHERE date = ? ORDER BY created_at ASC",
      [date],
    );
    return results;
  },

  async getByDateAndPuyuh(
    db: SQLiteDatabase,
    date: string,
    puyuh_id: string,
  ): Promise<DailyFeed[]> {
    const results = await db.getAllAsync<DailyFeed>(
      "SELECT * FROM daily_feed WHERE date = ? AND puyuh_id = ? ORDER BY created_at ASC",
      [date, puyuh_id],
    );
    return results;
  },

  async getRange(
    db: SQLiteDatabase,
    startDate: string,
    endDate: string,
  ): Promise<DailyFeed[]> {
    const results = await db.getAllAsync<DailyFeed>(
      "SELECT * FROM daily_feed WHERE date BETWEEN ? AND ? ORDER BY date ASC",
      [startDate, endDate],
    );
    return results;
  },

  async getMonthlyTotal(
    db: SQLiteDatabase,
    puyuh_id: string,
    year: number,
    month: number,
  ): Promise<{ total_kg: number; total_cost: number }> {
    const startDate = new Date(year, month - 1, 1);
    const endDate = new Date(year, month, 0);

    const result = await db.getFirstAsync<{
      total_kg: number;
      total_cost: number;
    }>(
      `SELECT SUM(total_amount) as total_kg, SUM(cost) as total_cost FROM daily_feed
       WHERE puyuh_id = ? AND date BETWEEN ? AND ?`,
      [
        puyuh_id,
        startDate.toISOString().split("T")[0],
        endDate.toISOString().split("T")[0],
      ],
    );

    return {
      total_kg: result?.total_kg || 0,
      total_cost: result?.total_cost || 0,
    };
  },

  async getDailyTotal(
    db: SQLiteDatabase,
    date: string,
  ): Promise<{ total_kg: number; total_cost: number }> {
    const result = await db.getFirstAsync<{
      total_kg: number;
      total_cost: number;
    }>(
      `SELECT SUM(total_amount) as total_kg, SUM(cost) as total_cost FROM daily_feed
       WHERE date = ?`,
      [date],
    );

    return {
      total_kg: result?.total_kg || 0,
      total_cost: result?.total_cost || 0,
    };
  },

  async update(
    db: SQLiteDatabase,
    id: string,
    input: Partial<DailyFeedInput>,
  ): Promise<DailyFeed | null> {
    const current = await this.getById(db, id);
    if (!current) return null;

    const now = new Date().toISOString();
    const updated: DailyFeed = {
      ...current,
      ...input,
      id: current.id,
      created_at: current.created_at,
      updated_at: now,
    };

    await db.runAsync(
      `UPDATE daily_feed SET date = ?, puyuh_id = ?, feed_type_id = ?, frequency_per_day = ?, amount_per_bird = ?, total_amount = ?, cost = ?, updated_at = ?
       WHERE id = ?`,
      [
        updated.date,
        updated.puyuh_id,
        updated.feed_type_id,
        updated.frequency_per_day,
        updated.amount_per_bird,
        updated.total_amount,
        updated.cost,
        now,
        id,
      ],
    );

    return updated;
  },

  async delete(db: SQLiteDatabase, id: string): Promise<boolean> {
    const result = await db.runAsync("DELETE FROM daily_feed WHERE id = ?", [
      id,
    ]);
    return (result?.changes || 0) > 0;
  },
};
