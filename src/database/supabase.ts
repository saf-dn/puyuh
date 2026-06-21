import { createClient } from "@supabase/supabase-js";

const SUPABASE_URL = "https://wuoqgxyfcqweawqlsdax.supabase.co";
const SUPABASE_ANON_KEY =
  "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Ind1b3FneHlmY3F3ZWF3cWxzZGF4Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODE4ODYwMDMsImV4cCI6MjA5NzQ2MjAwM30.NZjdrBqdfUHO95K6-Km10CihuGUsWWn4eBSQ0VNtInc";

export const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);
