import type { Card } from "@/engine";

const KEY = "kartpilot.cards.v1";
// Eski sürümlerden kalmış olabilecek anahtarlar (temizlik için)
const LEGACY_KEYS = ["kartpilot.onboarded.v1", "kartpilot.seeded.v1"];

export const PRESET_COLORS = [
  "#1E5AF5",
  "#16C784",
  "#F5A623",
  "#E5484D",
  "#8B5CF6",
  "#EC4899",
  "#0EA5E9",
  "#0F172A",
];

export const TR_BANKS = [
  "Akbank",
  "Garanti BBVA",
  "İş Bankası",
  "Yapı Kredi",
  "QNB",
  "Ziraat",
  "Halkbank",
  "VakıfBank",
  "DenizBank",
  "TEB",
  "ING",
  "Enpara",
  "Diğer",
];

// localStorage yalnızca buluttaki verinin yerel önbelleğidir (anlık çizim için).
// Kaynak gerçek, oturum açık kullanıcının Supabase'teki satırlarıdır.
export function loadCards(): Card[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = localStorage.getItem(KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    if (!Array.isArray(parsed)) return [];
    return parsed as Card[];
  } catch {
    return [];
  }
}

export function saveCards(cards: Card[]): void {
  if (typeof window === "undefined") return;
  localStorage.setItem(KEY, JSON.stringify(cards));
}

export function clearAll(): void {
  if (typeof window === "undefined") return;
  localStorage.removeItem(KEY);
  for (const k of LEGACY_KEYS) localStorage.removeItem(k);
}

export function computeGraceDays(statementDay: number, dueDay: number): number {
  if (dueDay >= statementDay) return dueDay - statementDay;
  return dueDay + 30 - statementDay;
}

export function dueDayFromStatement(statementDay: number): number {
  const d = statementDay + 10;
  return d > 30 ? d - 30 : d;
}
