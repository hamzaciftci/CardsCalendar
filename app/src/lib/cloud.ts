import type { Card } from "@/engine";
import { supabase } from "@/lib/supabase";

// cards tablosu (supabase/schema.sql) ↔ Card tipi eşlemesi.
// RLS her satırı user_id = auth.uid() ile korur; insert'te user_id zorunludur.

type CardRow = {
  id: string;
  name: string;
  bank_name: string;
  color: string;
  total_limit: number | null;
  available_limit: number | null;
  statement_day: number;
  grace_days: number;
  is_active: boolean;
  carries_debt: boolean;
  sort_order: number;
};

function toCard(r: CardRow): Card {
  return {
    id: r.id,
    name: r.name,
    bankName: r.bank_name,
    color: r.color,
    totalLimit: r.total_limit ?? undefined,
    availableLimit: r.available_limit ?? undefined,
    statementDay: r.statement_day,
    graceDays: r.grace_days,
    isActive: r.is_active,
    carriesDebt: r.carries_debt || undefined,
  };
}

function toRow(c: Card, userId: string, sortOrder = 0) {
  return {
    id: c.id,
    user_id: userId,
    name: c.name,
    bank_name: c.bankName,
    color: c.color,
    total_limit: c.totalLimit ?? null,
    available_limit: c.availableLimit ?? null,
    statement_day: c.statementDay,
    grace_days: c.graceDays,
    is_active: c.isActive,
    carries_debt: c.carriesDebt ?? false,
    sort_order: sortOrder,
  };
}

/** Kullanıcının buluttaki kartları; hata/yapılandırma yoksa null. */
export async function fetchCloudCards(): Promise<Card[] | null> {
  if (!supabase) return null;
  const { data, error } = await supabase
    .from("cards")
    .select(
      "id,name,bank_name,color,total_limit,available_limit,statement_day,grace_days,is_active,carries_debt,sort_order",
    )
    .order("sort_order")
    .order("created_at");
  if (error) {
    console.error("[cloud] kartlar okunamadı:", error.message);
    return null;
  }
  return (data as CardRow[]).map(toCard);
}

export async function upsertCloudCards(cards: Card[], userId: string): Promise<void> {
  if (!supabase || cards.length === 0) return;
  const { error } = await supabase.from("cards").upsert(cards.map((c, i) => toRow(c, userId, i)));
  if (error) console.error("[cloud] kart yazılamadı:", error.message);
}

export async function deleteCloudCard(id: string): Promise<void> {
  if (!supabase) return;
  const { error } = await supabase.from("cards").delete().eq("id", id);
  if (error) console.error("[cloud] kart silinemedi:", error.message);
}

export async function deleteAllCloudCards(userId: string): Promise<void> {
  if (!supabase) return;
  const { error } = await supabase.from("cards").delete().eq("user_id", userId);
  if (error) console.error("[cloud] kartlar silinemedi:", error.message);
}
