import { supabase } from "@/database/supabase";
import { Puyuh, PuyuhInput, PuyuhStatus } from "@/types";
import { v4 as uuid } from "uuid";

export const PuyuhQueries = {
  async create(input: PuyuhInput): Promise<Puyuh> {
    const id = uuid();
    const now = new Date().toISOString();
    const status = input.status || PuyuhStatus.ACTIVE;

    const row = {
      id,
      age_months: input.age_months,
      count: input.count,
      status,
      notes: input.notes || null,
      created_at: now,
      updated_at: now,
    };

    const { error } = await supabase.from("puyuh").insert(row);
    if (error) throw new Error(error.message);

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

  async getById(id: string): Promise<Puyuh | null> {
    const { data, error } = await supabase
      .from("puyuh")
      .select("*")
      .eq("id", id)
      .maybeSingle();

    if (error) throw new Error(error.message);
    return data || null;
  },

  async getAll(): Promise<Puyuh[]> {
    const { data, error } = await supabase
      .from("puyuh")
      .select("*")
      .order("age_months", { ascending: true });

    if (error) throw new Error(error.message);
    return data || [];
  },

  async getByStatus(status: PuyuhStatus): Promise<Puyuh[]> {
    const { data, error } = await supabase
      .from("puyuh")
      .select("*")
      .eq("status", status)
      .order("age_months", { ascending: true });

    if (error) throw new Error(error.message);
    return data || [];
  },

  async getTotalCount(): Promise<number> {
    const { data, error } = await supabase.from("puyuh").select("count");

    if (error) throw new Error(error.message);
    if (!data || data.length === 0) return 0;
    return data.reduce((sum: number, row: any) => sum + (row.count || 0), 0);
  },

  async update(id: string, input: Partial<PuyuhInput>): Promise<Puyuh | null> {
    const now = new Date().toISOString();
    const current = await this.getById(id);
    if (!current) return null;

    const updated: Puyuh = {
      ...current,
      ...input,
      id: current.id,
      created_at: current.created_at,
      updated_at: now,
    };

    const { error } = await supabase
      .from("puyuh")
      .update({
        age_months: updated.age_months,
        count: updated.count,
        status: updated.status,
        notes: updated.notes || null,
        updated_at: now,
      })
      .eq("id", id);

    if (error) throw new Error(error.message);
    return updated;
  },

  async delete(id: string): Promise<boolean> {
    const { error, count } = await supabase.from("puyuh").delete().eq("id", id);

    if (error) throw new Error(error.message);
    return true;
  },

  async getTotalDeadThisMonth(year: number, month: number): Promise<number> {
    const startDate = new Date(year, month - 1, 1).toISOString().split("T")[0];
    const endDate = new Date(year, month, 0).toISOString().split("T")[0];

    const { data, error } = await supabase
      .from("daily_production")
      .select("puyuh_died_count")
      .gte("date", startDate)
      .lte("date", endDate);

    if (error) throw new Error(error.message);
    if (!data || data.length === 0) return 0;
    return data.reduce(
      (sum: number, row: any) => sum + (row.puyuh_died_count || 0),
      0,
    );
  },
};
