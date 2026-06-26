// Common types
export type ID = string;
export type DateString = string; // YYYY-MM-DD format
export type DateTimeString = string; // ISO 8601 format

// Status types
export enum PuyuhStatus {
  ACTIVE = "active",
  INACTIVE = "inactive",
  SICK = "sick",
}

export enum TransactionType {
  INCOME = "INCOME",
  EXPENSE = "EXPENSE",
}

// Puyuh Types
export interface Puyuh {
  id: ID;
  age_months: number;
  count: number;
  status: PuyuhStatus;
  notes?: string;
  kandang?: string;
  row?: string;
  kolom?: string;
  created_at: DateTimeString;
  updated_at: DateTimeString;
}

export interface PuyuhInput {
  age_months: number;
  count: number;
  status?: PuyuhStatus;
  notes?: string;
  kandang?: string;
  row?: string;
  kolom?: string;
}

// Feed Types
export interface DailyFeed {
  id: ID;
  date: DateString;
  puyuh_id: ID;
  photo?: string;
  created_at: DateTimeString;
  updated_at: DateTimeString;
  // Relations (populated separately)
  puyuh?: Puyuh;
}

export interface DailyFeedInput {
  date: DateString;
  puyuh_id: ID;
  photo?: string;
}

// Production Types
export interface DailyProduction {
  id: ID;
  date: DateString;
  eggs_produced_count: number;
  eggs_broken_count: number;
  eggs_sold_count: number;
  eggs_available: number; // computed: produced - broken - sold
  puyuh_died_count: number;
  price_per_egg: number;
  total_revenue: number; // computed: sold_count * price_per_egg
  buyer_name?: string;
  photo_eggs?: string;
  photo_transfer?: string;
  payment_status?: string;
  created_at: DateTimeString;
  updated_at: DateTimeString;
}

export interface DailyProductionInput {
  date: DateString;
  eggs_produced_count?: number;
  eggs_broken_count?: number;
  eggs_sold_count?: number;
  puyuh_died_count?: number;
  price_per_egg?: number;
  buyer_name?: string;
  photo_eggs?: string;
  photo_transfer?: string;
  payment_status?: string;
}

// Category Types
export enum ExpenseCategoryType {
  FEED = "feed",
  MEDICATION = "medication",
  EQUIPMENT = "equipment",
  SHIPPING = "shipping",
  OTHER = "other",
}

export enum IncomeCategoryType {
  EGG_SALES = "egg_sales",
  BIRD_SALES = "bird_sales",
  MANURE = "manure",
  OTHER = "other",
}

export interface ExpenseCategory {
  id: ID;
  name: string;
  category_type: ExpenseCategoryType;
  created_at: DateTimeString;
}

export interface IncomeCategory {
  id: ID;
  name: string;
  category_type: IncomeCategoryType;
  created_at: DateTimeString;
}

export type Category = ExpenseCategory | IncomeCategory;

// Transaction Types
export interface Transaction {
  id: ID;
  date: DateString;
  transaction_type: TransactionType;
  category_id: ID;
  amount: number;
  description?: string;
  created_at: DateTimeString;
  updated_at: DateTimeString;
  // Relations (populated separately)
  category?: Category;
}

export interface TransactionInput {
  date: DateString;
  transaction_type: TransactionType;
  category_id: ID;
  amount: number;
  description?: string;
}

// Summary/Report Types
export interface MonthlySummary {
  period: string; // YYYY-MM format
  // Population
  total_puyuh: number;
  puyuh_by_age: PuyuhSummary[];
  puyuh_died_count: number;
  // Production
  eggs_produced: number;
  eggs_broken: number;
  eggs_sold: number;
  eggs_available: number;
  avg_eggs_per_day: number;
  avg_price_per_egg: number;
  // Feed
  total_feed_cost: number;
  total_feed_kg: number;
  avg_feed_per_day: number;
  // Finance
  total_income: number;
  total_expense: number;
  profit: number;
  roi_percentage: number;
  // Income breakdown
  income_by_category: { [key: string]: number };
  // Expense breakdown
  expense_by_category: { [key: string]: number };
  // Weekly profit breakdown
  weekly_profit: number[];
  weekly_income?: number[];
  weekly_expense?: number[];
}

export interface PuyuhSummary {
  age_months: number;
  count: number;
  status: PuyuhStatus;
  created_at: string;
}

export interface DailySummary {
  date: DateString;
  production?: DailyProduction;
  feeds?: DailyFeed[];
  transactions?: Transaction[];
  feed_cost: number;
  feed_kg: number;
}

// API Response Types
export interface ApiResponse<T> {
  success: boolean;
  data?: T;
  error?: string;
}

export interface ListResponse<T> {
  items: T[];
  total: number;
  page: number;
  perPage: number;
}

// Form validation types
export interface FormError {
  [key: string]: string;
}

// Date range filter
export interface DateRange {
  start: DateString;
  end: DateString;
}
