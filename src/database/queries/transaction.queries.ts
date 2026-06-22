import { supabase } from "@/database/supabase";
import {
    type ExpenseCategory,
    type IncomeCategory,
    type Transaction,
    type TransactionInput,
    TransactionType,
} from "@/types";
import { v4 as uuid } from "uuid";

export const TransactionQueries = {
  async create(input: TransactionInput): Promise<Transaction> {
    const id = uuid();
    const now = new Date().toISOString();
    const row = {
      id,
      date: input.date,
      transaction_type: input.transaction_type,
      category_id: input.category_id,
      amount: input.amount,
      description: input.description || null,
      created_at: now,
      updated_at: now,
    };

    const { error } = await supabase.from("transactions").insert(row);
    if (error) throw new Error(error.message);

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

  async getById(id: string): Promise<Transaction | null> {
    const { data, error } = await supabase
      .from("transactions")
      .select("*")
      .eq("id", id)
      .maybeSingle();
    if (error) throw new Error(error.message);
    return data || null;
  },

  async getByType(type: TransactionType): Promise<Transaction[]> {
    const { data, error } = await supabase
      .from("transactions")
      .select("*")
      .eq("transaction_type", type)
      .order("date", { ascending: false })
      .order("created_at", { ascending: false });
    if (error) throw new Error(error.message);
    return data || [];
  },

  async getByDate(date: string): Promise<Transaction[]> {
    const { data, error } = await supabase
      .from("transactions")
      .select("*")
      .eq("date", date)
      .order("created_at", { ascending: false });
    if (error) throw new Error(error.message);
    return data || [];
  },

  async getRange(
    startDate: string,
    endDate: string,
    type?: TransactionType,
  ): Promise<Transaction[]> {
    let query = supabase
      .from("transactions")
      .select("*")
      .gte("date", startDate)
      .lte("date", endDate);
    if (type) query = query.eq("transaction_type", type);
    query = query
      .order("date", { ascending: false })
      .order("created_at", { ascending: false });

    const { data, error } = await query;
    if (error) throw new Error(error.message);
    return data || [];
  },

  async getByCategory(categoryId: string): Promise<Transaction[]> {
    const { data, error } = await supabase
      .from("transactions")
      .select("*")
      .eq("category_id", categoryId)
      .order("date", { ascending: false });
    if (error) throw new Error(error.message);
    return data || [];
  },

  async getMonthlySummary(year: number, month: number) {
    const startStr = new Date(year, month - 1, 1).toISOString().split("T")[0];
    const endStr = new Date(year, month, 0).toISOString().split("T")[0];

    const { data: txns, error } = await supabase
      .from("transactions")
      .select("transaction_type, category_id, amount")
      .gte("date", startStr)
      .lte("date", endStr);
    if (error) throw new Error(error.message);

    const { data: incCats } = await supabase
      .from("income_category")
      .select("id, name");
    const { data: expCats } = await supabase
      .from("expense_category")
      .select("id, name");

    const incMap = new Map((incCats || []).map((c: any) => [c.id, c.name]));
    const expMap = new Map((expCats || []).map((c: any) => [c.id, c.name]));

    let total_income = 0,
      total_expense = 0;
    const income_by_category: Record<string, number> = {};
    const expense_by_category: Record<string, number> = {};

    for (const t of txns || []) {
      if (t.transaction_type === "INCOME") {
        total_income += t.amount;
        const name = incMap.get(t.category_id) || "Unknown";
        income_by_category[name] = (income_by_category[name] || 0) + t.amount;
      } else {
        total_expense += t.amount;
        const name = expMap.get(t.category_id) || "Unknown";
        expense_by_category[name] = (expense_by_category[name] || 0) + t.amount;
      }
    }

    return {
      total_income,
      total_expense,
      income_by_category,
      expense_by_category,
    };
  },

  async update(
    id: string,
    input: Partial<TransactionInput>,
  ): Promise<Transaction | null> {
    const current = await this.getById(id);
    if (!current) return null;
    const now = new Date().toISOString();
    const updated = {
      ...current,
      ...input,
      id: current.id,
      created_at: current.created_at,
      updated_at: now,
    };

    const { error } = await supabase
      .from("transactions")
      .update({
        date: updated.date,
        transaction_type: updated.transaction_type,
        category_id: updated.category_id,
        amount: updated.amount,
        description: updated.description || null,
        updated_at: now,
      })
      .eq("id", id);
    if (error) throw new Error(error.message);
    return updated;
  },

  async delete(id: string): Promise<boolean> {
    const { error } = await supabase.from("transactions").delete().eq("id", id);
    if (error) throw new Error(error.message);
    return true;
  },
};

export const CategoryQueries = {
  async getExpenseCategories(): Promise<ExpenseCategory[]> {
    const { data, error } = await supabase
      .from("expense_category")
      .select("*")
      .order("name", { ascending: true });
    if (error) throw new Error(error.message);
    return data || [];
  },

  async getIncomeCategories(): Promise<IncomeCategory[]> {
    const { data, error } = await supabase
      .from("income_category")
      .select("*")
      .order("name", { ascending: true });
    if (error) throw new Error(error.message);
    return data || [];
  },

  async getExpenseCategoryById(id: string) {
    const { data, error } = await supabase
      .from("expense_category")
      .select("*")
      .eq("id", id)
      .maybeSingle();
    if (error) throw new Error(error.message);
    return data || null;
  },

  async getIncomeCategoryById(id: string) {
    const { data, error } = await supabase
      .from("income_category")
      .select("*")
      .eq("id", id)
      .maybeSingle();
    if (error) throw new Error(error.message);
    return data || null;
  },
};
