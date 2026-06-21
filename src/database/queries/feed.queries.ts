import { supabase } from "@/database/supabase";
import { DailyFeed, DailyFeedInput, FeedType, FeedTypeInput } from "@/types";
import { v4 as uuid } from "uuid";

export const FeedTypeQueries = {
  async create(input: FeedTypeInput): Promise<FeedType> {
    const id = uuid();
    const now = new Date().toISOString();

    const row = {
      id,
      name: input.name,
      unit: input.unit,
      price_per_unit: input.price_per_unit || 0,
      created_at: now,
    };

    const { error } = await supabase.from("feed_type").insert(row);
    if (error) throw new Error(error.message);

    return {
      id,
      name: input.name,
      unit: input.unit,
      price_per_unit: input.price_per_unit || 0,
      created_at: now,
    };
  },

  async getById(id: string): Promise<FeedType | null> {
    const { data, error } = await supabase
      .from("feed_type")
      .select("*")
      .eq("id", id)
      .maybeSingle();

    if (error) throw new Error(error.message);
    return data || null;
  },

  async getAll(): Promise<FeedType[]> {
    const { data, error } = await supabase
      .from("feed_type")
      .select("*")
      .order("name", { ascending: true });

    if (error) throw new Error(error.message);
    return data || [];
  },

  async update(
    id: string,
    input: Partial<FeedTypeInput>,
  ): Promise<FeedType | null> {
    const current = await this.getById(id);
    if (!current) return null;

    const updated: FeedType = {
      ...current,
      ...input,
      id: current.id,
      created_at: current.created_at,
    };

    const { error } = await supabase
      .from("feed_type")
      .update({
        name: updated.name,
        unit: updated.unit,
        price_per_unit: updated.price_per_unit,
      })
      .eq("id", id);

    if (error) throw new Error(error.message);
    return updated;
  },

  async delete(id: string): Promise<boolean> {
    const { error } = await supabase.from("feed_type").delete().eq("id", id);

    if (error) throw new Error(error.message);
    return true;
  },
};

export const DailyFeedQueries = {
  async create(input: DailyFeedInput): Promise<DailyFeed> {
    // Check if entry already exists for this date + puyuh
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
    const { total_amount, cost } = await this.calculateTotals(input);

    const row = {
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

    const { error } = await supabase.from("daily_feed").insert(row);
    if (error) throw new Error(error.message);

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

  async calculateTotals(
    input: DailyFeedInput,
  ): Promise<{ total_amount: number; cost: number }> {
    const { data: puyuh } = await supabase
      .from("puyuh")
      .select("count")
      .eq("id", input.puyuh_id)
      .maybeSingle();

    const { data: feedType } = await supabase
      .from("feed_type")
      .select("price_per_unit")
      .eq("id", input.feed_type_id)
      .maybeSingle();

    const birdCount = puyuh?.count || 1;
    const totalGrams =
      birdCount * input.amount_per_bird * input.frequency_per_day;
    const total_amount = totalGrams / 1000;
    const cost = total_amount * (feedType?.price_per_unit || 0);

    return { total_amount, cost };
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
    const startDate = new Date(year, month - 1, 1).toISOString().split("T")[0];
    const endDate = new Date(year, month, 0).toISOString().split("T")[0];

    const { data, error } = await supabase
      .from("daily_feed")
      .select("total_amount, cost")
      .eq("puyuh_id", puyuh_id)
      .gte("date", startDate)
      .lte("date", endDate);

    if (error) throw new Error(error.message);
    if (!data || data.length === 0) return { total_kg: 0, total_cost: 0 };

    return {
      total_kg: data.reduce(
        (sum: number, r: any) => sum + (r.total_amount || 0),
        0,
      ),
      total_cost: data.reduce((sum: number, r: any) => sum + (r.cost || 0), 0),
    };
  },

  async getMonthlyTotalAll(
    year: number,
    month: number,
  ): Promise<{ total_kg: number; total_cost: number }> {
    const startDate = new Date(year, month - 1, 1).toISOString().split("T")[0];
    const endDate = new Date(year, month, 0).toISOString().split("T")[0];

    const { data, error } = await supabase
      .from("daily_feed")
      .select("total_amount, cost")
      .gte("date", startDate)
      .lte("date", endDate);

    if (error) throw new Error(error.message);
    if (!data || data.length === 0) return { total_kg: 0, total_cost: 0 };

    return {
      total_kg: data.reduce(
        (sum: number, r: any) => sum + (r.total_amount || 0),
        0,
      ),
      total_cost: data.reduce((sum: number, r: any) => sum + (r.cost || 0), 0),
    };
  },

  async getDailyTotal(
    date: string,
  ): Promise<{ total_kg: number; total_cost: number }> {
    const { data, error } = await supabase
      .from("daily_feed")
      .select("total_amount, cost")
      .eq("date", date);

    if (error) throw new Error(error.message);
    if (!data || data.length === 0) return { total_kg: 0, total_cost: 0 };

    return {
      total_kg: data.reduce(
        (sum: number, r: any) => sum + (r.total_amount || 0),
        0,
      ),
      total_cost: data.reduce((sum: number, r: any) => sum + (r.cost || 0), 0),
    };
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

    const { total_amount, cost } = await this.calculateTotals({
      date: merged.date,
      puyuh_id: merged.puyuh_id,
      feed_type_id: merged.feed_type_id,
      frequency_per_day: merged.frequency_per_day,
      amount_per_bird: merged.amount_per_bird,
    });

    const { error } = await supabase
      .from("daily_feed")
      .update({
        date: merged.date,
        puyuh_id: merged.puyuh_id,
        feed_type_id: merged.feed_type_id,
        frequency_per_day: merged.frequency_per_day,
        amount_per_bird: merged.amount_per_bird,
        total_amount,
        cost,
        updated_at: now,
      })
      .eq("id", id);

    if (error) throw new Error(error.message);

    return {
      ...merged,
      total_amount,
      cost,
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
