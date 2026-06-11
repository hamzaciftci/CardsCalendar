import type { Card } from "@/engine";

const KEY = "kartpilot.cards.v1";
const ONBOARD_KEY = "kartpilot.onboarded.v1";
const SEED_KEY = "kartpilot.seeded.v1";

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
  localStorage.removeItem(ONBOARD_KEY);
  localStorage.removeItem(SEED_KEY);
}

export function isOnboarded(): boolean {
  if (typeof window === "undefined") return true;
  return localStorage.getItem(ONBOARD_KEY) === "1";
}

export function setOnboarded(): void {
  if (typeof window === "undefined") return;
  localStorage.setItem(ONBOARD_KEY, "1");
}

export function hasSeeded(): boolean {
  if (typeof window === "undefined") return true;
  return localStorage.getItem(SEED_KEY) === "1";
}

export function markSeeded(): void {
  if (typeof window === "undefined") return;
  localStorage.setItem(SEED_KEY, "1");
}

export function seedDemoCards(): Card[] {
  return [
    {
      id: crypto.randomUUID(),
      name: "Bonus — Örnek kart",
      bankName: "Garanti BBVA",
      color: "#16C784",
      statementDay: 1,
      graceDays: 10,
      totalLimit: 30000,
      availableLimit: 12400,
      isActive: true,
    },
    {
      id: crypto.randomUUID(),
      name: "Axess — Örnek kart",
      bankName: "Akbank",
      color: "#E5484D",
      statementDay: 9,
      graceDays: 10,
      totalLimit: 25000,
      availableLimit: 18000,
      isActive: true,
    },
    {
      id: crypto.randomUUID(),
      name: "Maximum — Örnek kart",
      bankName: "İş Bankası",
      color: "#1E5AF5",
      statementDay: 17,
      graceDays: 10,
      totalLimit: 20000,
      availableLimit: 9000,
      isActive: true,
    },
  ];
}

export function computeGraceDays(statementDay: number, dueDay: number): number {
  if (dueDay >= statementDay) return dueDay - statementDay;
  return dueDay + 30 - statementDay;
}

export function dueDayFromStatement(statementDay: number): number {
  const d = statementDay + 10;
  return d > 30 ? d - 30 : d;
}
