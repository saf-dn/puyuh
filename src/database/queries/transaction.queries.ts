import { SQLiteDatabase } from "expo-sqlite";
import { v4 as uuid } from "uuid";
import { Transaction, TransactionInput, TransactionType } from "@/types";

export const TransactionQueries = {
  async create(
    db: SQLiteDatabase,
    input: TransactionInput,
  ): Promise<Transaction> {
    const id = uuid();
    const now = new Date().toISOString();

    await db.runAsync(
      `INSERT INTO transaction (id, date, transaction_type, category_id, amount, description, created_at, updated_at)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        id,
        input.date,
        input.transaction_type,
        input.category_id,
        input.amount,
        input.description || null,
        now,
        now,
      ],
    );

    return {
      id,
      date: input.date,
      transaction_type: input.transaction_type,
      category_id: input.category_id,
      amount: input.amount,
      description: input.description,
      created_at: now,
      updated_at: now,
    };
  },

  async getById(db: SQLiteDatabase, id: string): Promise<Transaction | null> {
    const result = await db.getFirstAsync<Transaction>(
      "SELECT * FROM transaction WHERE id = ?",
      [id],
    );
    return result || null;
  },

  async getByType(
    db: SQLiteDatabase,
    type: TransactionType,
  ): Promise<Transaction[]> {
    const results = await db.getAllAsync<Transaction>(
      "SELECT * FROM transaction WHERE transaction_type = ? ORDER BY date DESC, created_at DESC",
      [type],
    );
    return results;
  },

  async getByDate(db: SQLiteDatabase, date: string): Promise<Transaction[]> {
    const results = await db.getAllAsync<Transaction>(
      "SELECT * FROM transaction WHERE date = ? ORDER BY created_at DESC",
      [date],
    );
    return results;
  },

  async getRange(
    db: SQLiteDatabase,
    startDate: string,
    endDate: string,
    type?: TransactionType,
  ): Promise<Transaction[]> {
    let query =
      "SELECT * FROM transaction WHERE date BETWEEN ? AND ? ORDER BY date DESC, created_at DESC";
    const params: any[] = [startDate, endDate];

    if (type) {
      query = query.replace("ORDER BY", `AND transaction_type = ? ORDER BY`);
      params.splice(2, 0, type);
    }

    const results = await db.getAllAsync<Transaction>(query, params);
    return results;
  },

  async getByCategory(
    db: SQLiteDatabase,
    categoryId: string,
  ): Promise<Transaction[]> {
    const results = await db.getAllAsync<Transaction>(
      "SELECT * FROM transaction WHERE category_id = ? ORDER BY date DESC, created_at DESC",
      [categoryId],
    );
    return results;
  },

  async getMonthlySummary(
    db: SQLiteDatabase,
    year: number,
    month: number,
  ): Promise<{
    total_income: number;
    total_expense: number;
    income_by_category: Record<string, number>;
    expense_by_category: Record<string, number>;
  }> {
    const startDate = new Date(year, month - 1, 1);
    const endDate = new Date(year, month, 0);
    const startStr = startDate.toISOString().split("T")[0];
    const endStr = endDate.toISOString().split("T")[0];

    // Get income and expense totals
    const summary = await db.getFirstAsync<{
      total_income: number;
      total_expense: number;
    }>(
      `SELECT
        SUM(CASE WHEN transaction_type = 'INCOME' THEN amount ELSE 0 END) as total_income,
        SUM(CASE WHEN transaction_type = 'EXPENSE' THEN amount ELSE 0 END) as total_expense
       FROM transaction
       WHERE date BETWEEN ? AND ?`,
      [startStr, endStr],
    );

    // Get income by category
    const incomeByCategory = await db.getAllAsync<{
      name: string;
      total: number;
    }>(
      `SELECT ic.name, SUM(t.amount) as total
       FROM transaction t
       JOIN income_category ic ON t.category_id = ic.id
       WHERE t.transaction_type = 'INCOME' AND t.date BETWEEN ? AND ?
       GROUP BY t.category_id`,
      [startStr, endStr],
    );

    // Get expense by category
    const expenseByCategory = await db.getAllAsync<{
      name: string;
      total: number;
    }>(
      `SELECT ec.name, SUM(t.amount) as total
       FROM transaction t
       JOIN expense_category ec ON t.category_id = ec.id
       WHERE t.transaction_type = 'EXPENSE' AND t.date BETWEEN ? AND ?
       GROUP BY t.category_id`,
      [startStr, endStr],
    );

    const income_by_category: Record<string, number> = {};
    const expense_by_category: Record<string, number> = {};

    incomeByCategory.forEach((item) => {
      income_by_category[item.name] = item.total;
    });

    expenseByCategory.forEach((item) => {
      expense_by_category[item.name] = item.total;
    });

    return {
      total_income: summary?.total_income || 0,
      total_expense: summary?.total_expense || 0,
      income_by_category,
      expense_by_category,
    };
  },

  async update(
    db: SQLiteDatabase,
    id: string,
    input: Partial<TransactionInput>,
  ): Promise<Transaction | null> {
    const current = await this.getById(db, id);
    if (!current) return null;

    const now = new Date().toISOString();

    const updated: Transaction = {
      ...current,
      ...input,
      id: current.id,
      created_at: current.created_at,
      updated_at: now,
    };

    await db.runAsync(
      `UPDATE transaction SET date = ?, transaction_type = ?, category_id = ?, amount = ?, description = ?, updated_at = ?
       WHERE id = ?`,
      [
        updated.date,
        updated.transaction_type,
        updated.category_id,
        updated.amount,
        updated.description || null,
        now,
        id,
      ],
    );

    return updated;
  },

  async delete(db: SQLiteDatabase, id: string): Promise<boolean> {
    const result = await db.runAsync("DELETE FROM transaction WHERE id = ?", [
      id,
    ]);
    return (result?.changes || 0) > 0;
  },
};

// Category queries
export const CategoryQueries = {
  async getExpenseCategories(db: SQLiteDatabase) {
    const results = await db.getAllAsync(
      "SELECT * FROM expense_category ORDER BY name ASC",
    );
    return results;
  },

  async getIncomeCategories(db: SQLiteDatabase) {
    const results = await db.getAllAsync(
      "SELECT * FROM income_category ORDER BY name ASC",
    );
    return results;
  },

  async getExpenseCategoryById(db: SQLiteDatabase, id: string) {
    const result = await db.getFirstAsync(
      "SELECT * FROM expense_category WHERE id = ?",
      [id],
    );
    return result || null;
  },

  async getIncomeCategoryById(db: SQLiteDatabase, id: string) {
    const result = await db.getFirstAsync(
      "SELECT * FROM income_category WHERE id = ?",
      [id],
    );
    return result || null;
  },
};
