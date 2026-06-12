import { createClient, type SupabaseClient } from "@supabase/supabase-js";

// SaaS katmanı isteğe bağlıdır: env değişkenleri yoksa uygulama tamamen
// misafir modda (localStorage) çalışmaya devam eder.
const url = import.meta.env.VITE_SUPABASE_URL as string | undefined;
const anonKey = import.meta.env.VITE_SUPABASE_ANON_KEY as string | undefined;

export const supabase: SupabaseClient | null =
  url && anonKey && typeof window !== "undefined" ? createClient(url, anonKey) : null;

export const isCloudEnabled = () => supabase !== null;
