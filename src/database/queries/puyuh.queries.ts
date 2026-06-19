import { SQLiteDatabase } from "expo-sqlite";
import { v4 as uuid } from "uuid";
import { Puyuh, PuyuhInput, PuyuhStatus } from "@/types";

export const PuyuhQueries = {
  async create(db: SQLiteDatabase, input: PuyuhInput): Promise<Puyuh> {
    const id = uuid();
    const now = new Date().toISOString();
    const status = input.status || PuyuhStatus.ACTIVE;

    await db.runAsync(
      `INSERT INTO puyuh (id, age_months, count, status, notes, created_at, updated_at)
       VALUES (?, ?, ?, ?, ?, ?, ?)`,
      [
        id,
        input.age_months,
        input.count,
        status,
        input.notes || null,
        now,
        now,
      ],
    );

    return {
      id,
      age_months: input.age_months,
      count: input.count,
      status,
      notes: input.notes,
      created_at: now,
      updated_at: now,
    };
  },

  async getById(db: SQLiteDatabase, id: string): Promise<Puyuh | null> {
    const result = await db.getFirstAsync<Puyuh>(
      "SELECT * FROM puyuh WHERE id = ?",
      [id],
    );
    return result || null;
  },

  async getAll(db: SQLiteDatabase): Promise<Puyuh[]> {
    const results = await db.getAllAsync<Puyuh>(
      "SELECT * FROM puyuh ORDER BY age_months ASC",
    );
    return results;
  },

  async getByStatus(db: SQLiteDatabase, status: PuyuhStatus): Promise<Puyuh[]> {
    const results = await db.getAllAsync<Puyuh>(
      "SELECT * FROM puyuh WHERE status = ? ORDER BY age_months ASC",
      [status],
    );
    return results;
  },

  async getTotalCount(db: SQLiteDatabase): Promise<number> {
    const result = await db.getFirstAsync<{ total: number }>(
      "SELECT SUM(count) as total FROM puyuh",
    );
    return result?.total || 0;
  },

  async update(
    db: SQLiteDatabase,
    id: string,
    input: Partial<PuyuhInput>,
  ): Promise<Puyuh | null> {
    const now = new Date().toISOString();
    const current = await this.getById(db, id);

    if (!current) return null;

    const updated: Puyuh = {
      ...current,
      ...input,
      id: current.id,
      created_at: current.created_at,
      updated_at: now,
    };

    await db.runAsync(
      `UPDATE puyuh SET age_months = ?, count = ?, status = ?, notes = ?, updated_at = ?
       WHERE id = ?`,
      [
        updated.age_months,
        updated.count,
        updated.status,
        updated.notes || null,
        now,
        id,
      ],
    );

    return updated;
  },

  async delete(db: SQLiteDatabase, id: string): Promise<boolean> {
    const result = await db.runAsync("DELETE FROM puyuh WHERE id = ?", [id]);
    return (result?.changes || 0) > 0;
  },

  async getTotalDeadThisMonth(
    db: SQLiteDatabase,
    year: number,
    month: number,
  ): Promise<number> {
    const startDate = new Date(year, month - 1, 1);
    const endDate = new Date(year, month, 0);

    const result = await db.getFirstAsync<{ total: number }>(
      `SELECT SUM(puyuh_died_count) as total FROM daily_production
       WHERE date BETWEEN ? AND ?`,
      [
        startDate.toISOString().split("T")[0],
        endDate.toISOString().split("T")[0],
      ],
    );

    return result?.total || 0;
  },
};
