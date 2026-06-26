import { supabase } from "@/database/supabase";
import type { DailyFeed, DailyFeedInput } from "@/types";
import { v4 as uuid } from "uuid";


export const DailyFeedQueries = {
  async create(input: DailyFeedInput): Promise<DailyFeed> {
    const { data: existing } = await supabase
      .from("daily_feed")
      .select("id")
      .eq("date", input.date)
      .eq("puyuh_id", input.puyuh_id)
      .maybeSingle();

    if (existing) {
      return (await this.update(existing.id, input))!;
    }

    const id = uuid();
    const now = new Date().toISOString();

    const row = {
      id,
      date: input.date,
      puyuh_id: input.puyuh_id,
      photo: input.photo,
      created_at: now,
      updated_at: now,
    };

    const { error } = await supabase.from("daily_feed").insert(row);
    if (error) throw new Error(error.message);

    return row;
  },



  async getById(id: string): Promise<DailyFeed | null> {
    const { data, error } = await supabase
      .from("daily_feed")
      .select("*")
      .eq("id", id)
      .maybeSingle();

    if (error) throw new Error(error.message);
    return data || null;
  },

  async getByDate(date: string): Promise<DailyFeed[]> {
    const { data, error } = await supabase
      .from("daily_feed")
      .select("*")
      .eq("date", date)
      .order("created_at", { ascending: true });

    if (error) throw new Error(error.message);
    return data || [];
  },

  async getByDateAndPuyuh(
    date: string,
    puyuh_id: string,
  ): Promise<DailyFeed[]> {
    const { data, error } = await supabase
      .from("daily_feed")
      .select("*")
      .eq("date", date)
      .eq("puyuh_id", puyuh_id)
      .order("created_at", { ascending: true });

    if (error) throw new Error(error.message);
    return data || [];
  },

  async getRange(startDate: string, endDate: string): Promise<DailyFeed[]> {
    const { data, error } = await supabase
      .from("daily_feed")
      .select("*")
      .gte("date", startDate)
      .lte("date", endDate)
      .order("date", { ascending: true });

    if (error) throw new Error(error.message);
    return data || [];
  },

  async getLatestByPuyuh(puyuh_id: string): Promise<DailyFeed | null> {
    const { data, error } = await supabase
      .from("daily_feed")
      .select("*")
      .eq("puyuh_id", puyuh_id)
      .order("date", { ascending: false })
      .order("created_at", { ascending: false })
      .limit(1)
      .maybeSingle();

    if (error) throw new Error(error.message);
    return data || null;
  },

  async getMonthlyTotal(
    puyuh_id: string,
    year: number,
    month: number,
  ): Promise<{ total_kg: number; total_cost: number }> {
    const startDate = `${year}-${String(month).padStart(2, "0")}-01`;
    const lastDay = new Date(year, month, 0).getDate();
    const endDate = `${year}-${String(month).padStart(2, "0")}-${String(lastDay).padStart(2, "0")}`;

    const { data, error } = await supabase
      .from("daily_feed")
      .select("*, puyuh!inner(count)")
      .eq("puyuh_id", puyuh_id)
      .gte("date", startDate)
      .lte("date", endDate);

    if (error) return { total_kg: 0, total_cost: 0 };

    let total_kg = 0;
    const feedRate = (Number(localStorage.getItem('np_feed_per_quail')) || 25) / 1000;
    for (const record of data || []) {
      const puyuhCount = (record.puyuh as any)?.count || 0;
      total_kg += puyuhCount * feedRate;
    }

    const total_cost = total_kg * 7500;
    return { total_kg, total_cost };
  },

  async getMonthlyTotalAll(
    year: number,
    month: number,
  ): Promise<{ total_kg: number; total_cost: number }> {
    const startDate = `${year}-${String(month).padStart(2, "0")}-01`;
    const lastDay = new Date(year, month, 0).getDate();
    const endDate = `${year}-${String(month).padStart(2, "0")}-${String(lastDay).padStart(2, "0")}`;

    const { data, error } = await supabase
      .from("daily_feed")
      .select("*, puyuh!inner(count)")
      .gte("date", startDate)
      .lte("date", endDate);

    if (error) return { total_kg: 0, total_cost: 0 };

    let total_kg = 0;
    const feedRate = (Number(localStorage.getItem('np_feed_per_quail')) || 25) / 1000;
    for (const record of data || []) {
      const puyuhCount = (record.puyuh as any)?.count || 0;
      total_kg += puyuhCount * feedRate;
    }

    const total_cost = total_kg * 7500;
    return { total_kg, total_cost };
  },

  async getDailyTotal(
    date: string,
  ): Promise<{ total_kg: number; total_cost: number }> {
    const { data, error } = await supabase
      .from("daily_feed")
      .select("*, puyuh!inner(count)")
      .eq("date", date);

    if (error) return { total_kg: 0, total_cost: 0 };

    let total_kg = 0;
    const feedRate = (Number(localStorage.getItem('np_feed_per_quail')) || 25) / 1000;
    for (const record of data || []) {
      const puyuhCount = (record.puyuh as any)?.count || 0;
      total_kg += puyuhCount * feedRate;
    }

    return { total_kg, total_cost: total_kg * 7500 };
  },

  async update(
    id: string,
    input: Partial<DailyFeedInput>,
  ): Promise<DailyFeed | null> {
    const current = await this.getById(id);
    if (!current) return null;

    const now = new Date().toISOString();
    const merged = {
      ...current,
      ...input,
    };

    const { error } = await supabase
      .from("daily_feed")
      .update({
        date: merged.date,
        puyuh_id: merged.puyuh_id,
        photo: merged.photo,
        updated_at: now,
      })
      .eq("id", id);

    if (error) throw new Error(error.message);

    return {
      ...merged,
      id: current.id,
      created_at: current.created_at,
      updated_at: now,
    };
  },

  async delete(id: string): Promise<boolean> {
    const { error } = await supabase.from("daily_feed").delete().eq("id", id);

    if (error) throw new Error(error.message);
    return true;
  },
};

export const FeedStockQueries = {
  async getStock(): Promise<number> {
    const { data, error } = await supabase
      .from("feed_stock")
      .select("id, stock_kg")
      .limit(1)
      .maybeSingle();

    if (error) {
      console.error("Error fetching feed stock:", error.message);
      return 0;
    }
    
    // If table is empty, return 0
    if (!data) return 0;
    
    return data.stock_kg || 0;
  },

  async setStock(kg: number): Promise<void> {
    const { data: existing, error: fetchError } = await supabase
      .from("feed_stock")
      .select("id")
      .limit(1)
      .maybeSingle();

    if (fetchError) {
      console.error("Error checking feed stock:", fetchError.message);
      return;
    }

    if (existing) {
      const { error } = await supabase
        .from("feed_stock")
        .update({ stock_kg: kg, updated_at: new Date().toISOString() })
        .eq("id", existing.id);
      if (error) throw new Error(error.message);
    } else {
      const { error } = await supabase
        .from("feed_stock")
        .insert({ stock_kg: kg });
      if (error) throw new Error(error.message);
    }
  }
};
