import { supabase } from "@/database/supabase";
import { DailyProduction, DailyProductionInput } from "@/types";
import { v4 as uuid } from "uuid";

export const ProductionQueries = {
  async create(input: DailyProductionInput): Promise<DailyProduction> {
    const existing = await this.getByDate(input.date);
    if (existing) {
      return (await this.update(existing.id, input))!;
    }

    const id = uuid();
    const now = new Date().toISOString();
    const eggs_available =
      input.eggs_produced_count -
      (input.eggs_broken_count || 0) -
      (input.eggs_sold_count || 0);
    const total_revenue =
      (input.eggs_sold_count || 0) * (input.price_per_egg || 0);

    const row = {
      id,
      date: input.date,
      eggs_produced_count: input.eggs_produced_count,
      eggs_broken_count: input.eggs_broken_count || 0,
      eggs_sold_count: input.eggs_sold_count || 0,
      puyuh_died_count: input.puyuh_died_count || 0,
      price_per_egg: input.price_per_egg || 0,
      created_at: now,
      updated_at: now,
    };

    const { error } = await supabase.from("daily_production").insert(row);
    if (error) throw new Error(error.message);

    return { ...row, eggs_available, total_revenue };
  },

  async getById(id: string): Promise<DailyProduction | null> {
    const { data, error } = await supabase
      .from("daily_production")
      .select("*")
      .eq("id", id)
      .maybeSingle();
    if (error) throw new Error(error.message);
    if (!data) return null;
    return {
      ...data,
      eggs_available:
        data.eggs_produced_count -
        data.eggs_broken_count -
        data.eggs_sold_count,
      total_revenue: data.eggs_sold_count * data.price_per_egg,
    };
  },

  async getByDate(date: string): Promise<DailyProduction | null> {
    const { data, error } = await supabase
      .from("daily_production")
      .select("*")
      .eq("date", date)
      .maybeSingle();
    if (error) throw new Error(error.message);
    if (!data) return null;
    return {
      ...data,
      eggs_available:
        data.eggs_produced_count -
        data.eggs_broken_count -
        data.eggs_sold_count,
      total_revenue: data.eggs_sold_count * data.price_per_egg,
    };
  },

  async getRange(
    startDate: string,
    endDate: string,
  ): Promise<DailyProduction[]> {
    const { data, error } = await supabase
      .from("daily_production")
      .select("*")
      .gte("date", startDate)
      .lte("date", endDate)
      .order("date", { ascending: true });
    if (error) throw new Error(error.message);
    return (data || []).map((r: any) => ({
      ...r,
      eggs_available:
        r.eggs_produced_count - r.eggs_broken_count - r.eggs_sold_count,
      total_revenue: r.eggs_sold_count * r.price_per_egg,
    }));
  },

  async getMonthlyStats(year: number, month: number) {
    const startDate = new Date(year, month - 1, 1).toISOString().split("T")[0];
    const endDate = new Date(year, month, 0).toISOString().split("T")[0];

    const { data, error } = await supabase
      .from("daily_production")
      .select(
        "eggs_produced_count, eggs_broken_count, eggs_sold_count, puyuh_died_count, price_per_egg",
      )
      .gte("date", startDate)
      .lte("date", endDate);
    if (error) throw new Error(error.message);
    if (!data || data.length === 0)
      return {
        total_eggs_produced: 0,
        total_eggs_broken: 0,
        total_eggs_sold: 0,
        total_eggs_available: 0,
        total_puyuh_died: 0,
        total_revenue: 0,
        avg_eggs_per_day: 0,
        avg_price_per_egg: 0,
      };

    const tp = data.reduce((s, r) => s + (r.eggs_produced_count || 0), 0);
    const tb = data.reduce((s, r) => s + (r.eggs_broken_count || 0), 0);
    const ts = data.reduce((s, r) => s + (r.eggs_sold_count || 0), 0);
    const td = data.reduce((s, r) => s + (r.puyuh_died_count || 0), 0);
    const tr = data.reduce(
      (s, r) => s + (r.eggs_sold_count || 0) * (r.price_per_egg || 0),
      0,
    );
    const ap =
      data.reduce((s, r) => s + (r.price_per_egg || 0), 0) / data.length;

    return {
      total_eggs_produced: tp,
      total_eggs_broken: tb,
      total_eggs_sold: ts,
      total_eggs_available: tp - tb - ts,
      total_puyuh_died: td,
      total_revenue: tr,
      avg_eggs_per_day: Math.round(tp / data.length),
      avg_price_per_egg: ap,
    };
  },

  async update(
    id: string,
    input: Partial<DailyProductionInput>,
  ): Promise<DailyProduction | null> {
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
    updated.eggs_available =
      updated.eggs_produced_count -
      updated.eggs_broken_count -
      updated.eggs_sold_count;
    updated.total_revenue = updated.eggs_sold_count * updated.price_per_egg;

    const { error } = await supabase
      .from("daily_production")
      .update({
        eggs_produced_count: updated.eggs_produced_count,
        eggs_broken_count: updated.eggs_broken_count,
        eggs_sold_count: updated.eggs_sold_count,
        puyuh_died_count: updated.puyuh_died_count,
        price_per_egg: updated.price_per_egg,
        updated_at: now,
      })
      .eq("id", id);
    if (error) throw new Error(error.message);
    return updated;
  },

  async delete(id: string): Promise<boolean> {
    const { error } = await supabase
      .from("daily_production")
      .delete()
      .eq("id", id);
    if (error) throw new Error(error.message);
    return true;
  },
};
