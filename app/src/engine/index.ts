// KartPilot calculation engine v1.0 — pure functions, no UI imports.
// Conservative rule: a purchase made ON the statement day is assumed to land
// on THAT statement (worst case). All dates normalized to local midnight.
//
// Tests: src/engine/index.test.ts (`npm test`). Keep this module dependency-free
// and UI-agnostic — routes/components consume it, never reimplement date math.

export const ENGINE_VERSION = "1.0.0";

export interface Card {
  id: string;
  name: string;
  bankName: string;
  color: string; // hex, used as the card's identity color
  totalLimit?: number;
  availableLimit?: number;
  statementDay: number; // 1-31
  graceDays: number; // dueDate - statementDate in days (TR minimum 10)
  isActive: boolean;
  carriesDebt?: boolean; // user-flagged revolving debt (v1.1 UI, keep in type)
}

export interface InterestFreeResult {
  cutoffDate: Date; // statement the purchase lands on
  dueDate: Date;
  days: number; // interest-free days from spend date
}

export function normalize(d: Date): Date {
  return new Date(d.getFullYear(), d.getMonth(), d.getDate());
}

function daysInMonth(year: number, monthIndex: number): number {
  return new Date(year, monthIndex + 1, 0).getDate();
}

// Statement day 29/30/31 falls back to the last day of short months.
function clampedDate(year: number, monthIndex: number, day: number): Date {
  return new Date(year, monthIndex, Math.min(day, daysInMonth(year, monthIndex)));
}

export function addDays(d: Date, n: number): Date {
  const r = new Date(d);
  r.setDate(r.getDate() + n);
  return r;
}

export function diffInDays(a: Date, b: Date): number {
  const MS = 86_400_000;
  return Math.round((normalize(a).getTime() - normalize(b).getTime()) / MS);
}

/** The statement a purchase lands on (conservative on the statement day itself). */
export function statementCutoffFor(spendDate: Date, statementDay: number): Date {
  const d = normalize(spendDate);
  const thisMonth = clampedDate(d.getFullYear(), d.getMonth(), statementDay);
  if (d <= thisMonth) return thisMonth;
  // JS Date auto-rolls month 12 into January of the next year.
  return clampedDate(d.getFullYear(), d.getMonth() + 1, statementDay);
}

export function interestFreeDays(
  card: Pick<Card, "statementDay" | "graceDays">,
  spendDate: Date,
): InterestFreeResult {
  const cutoffDate = statementCutoffFor(spendDate, card.statementDay);
  const dueDate = addDays(cutoffDate, card.graceDays);
  return { cutoffDate, dueDate, days: diffInDays(dueDate, spendDate) };
}

export interface BillingCycle {
  cutoffDate: Date;
  dueDate: Date;
}

/**
 * Upcoming statement cycles from a given date (calendar markers, reminders).
 * The current month's cycle is included when its cutoff is today or later.
 */
export function upcomingCycles(
  card: Pick<Card, "statementDay" | "graceDays">,
  fromDate: Date,
  count = 3,
): BillingCycle[] {
  const start = normalize(fromDate);
  let month = start.getMonth();
  if (clampedDate(start.getFullYear(), month, card.statementDay) < start) {
    month += 1;
  }
  const cycles: BillingCycle[] = [];
  for (let i = 0; i < count; i++) {
    const cutoffDate = clampedDate(start.getFullYear(), month + i, card.statementDay);
    cycles.push({ cutoffDate, dueDate: addDays(cutoffDate, card.graceDays) });
  }
  return cycles;
}

/**
 * The next real-world due date from a given day (reminders, "due soon" banners).
 * Note this is NOT interestFreeDays(card, today).dueDate — that is the due of
 * the statement a NEW purchase would land on (always ≥ graceDays away). The
 * urgent due date belongs to the most recently CUT statement when still ahead;
 * otherwise the next statement's due applies.
 */
export function nextDueDate(card: Pick<Card, "statementDay" | "graceDays">, fromDate: Date): Date {
  const start = normalize(fromDate);
  // statement most recently cut (cutoff <= start)
  let lastCutoff = clampedDate(start.getFullYear(), start.getMonth(), card.statementDay);
  if (lastCutoff > start) {
    lastCutoff = clampedDate(start.getFullYear(), start.getMonth() - 1, card.statementDay);
  }
  const lastDue = addDays(lastCutoff, card.graceDays);
  if (lastDue >= start) return lastDue;
  return addDays(statementCutoffFor(start, card.statementDay), card.graceDays);
}

/** The statement cycle anchored in a given calendar month (calendar views). */
export function cycleForMonth(
  card: Pick<Card, "statementDay" | "graceDays">,
  year: number,
  monthIndex: number,
): BillingCycle {
  const cutoffDate = clampedDate(year, monthIndex, card.statementDay);
  return { cutoffDate, dueDate: addDays(cutoffDate, card.graceDays) };
}

export interface EngineParams {
  utilizationThreshold: number; // 0.8
  utilizationPenaltyScale: number; // 25 → 100% utilization costs 5 days
  debtPenaltyDays: number; // 30 → effectively disqualifies
  waitTipHorizonDays: number; // 7
  waitTipMinGain: number; // 5
}

export const DEFAULT_PARAMS: EngineParams = {
  utilizationThreshold: 0.8,
  utilizationPenaltyScale: 25,
  debtPenaltyDays: 30,
  waitTipHorizonDays: 7,
  waitTipMinGain: 5,
};

export interface CardRecommendation {
  card: Card;
  score: number;
  result: InterestFreeResult;
  reasons: string[]; // Turkish, shown to user
  warnings: string[]; // Turkish, shown to user
}

export interface Recommendation {
  best: CardRecommendation | null;
  alternatives: CardRecommendation[];
  excluded: { card: Card; reason: string }[];
  waitTip: { date: Date; card: Card; days: number } | null;
}

export function recommend(
  cards: Card[],
  amount: number,
  spendDate: Date,
  params: Partial<EngineParams> = {},
): Recommendation {
  const p = { ...DEFAULT_PARAMS, ...params };
  const eligible: CardRecommendation[] = [];
  const excluded: { card: Card; reason: string }[] = [];

  for (const card of cards) {
    if (!card.isActive) {
      excluded.push({ card, reason: "Kart pasif" });
      continue;
    }
    if (card.availableLimit != null && card.availableLimit < amount) {
      excluded.push({
        card,
        reason: `Kullanılabilir limit yetersiz (${card.availableLimit.toLocaleString("tr-TR")} ₺)`,
      });
      continue;
    }

    const result = interestFreeDays(card, spendDate);
    let score = result.days;
    const reasons = [`${result.days} gün faizsiz`];
    const warnings: string[] = [];

    if (card.totalLimit && card.availableLimit != null) {
      const utilizationAfter = (card.totalLimit - card.availableLimit + amount) / card.totalLimit;
      if (utilizationAfter > p.utilizationThreshold) {
        score -= (utilizationAfter - p.utilizationThreshold) * p.utilizationPenaltyScale;
        warnings.push(`Bu harcamayla limit doluluğu %${Math.round(utilizationAfter * 100)} olur`);
      }
    }

    if (card.carriesDebt) {
      score -= p.debtPenaltyDays;
      warnings.push(
        "Bu kart devreden borç taşıyor — yeni harcama fiilen faizsiz olmaz. Önce borcu kapatmanı öneririz.",
      );
    }

    eligible.push({ card, score, result, reasons, warnings });
  }

  eligible.sort(
    (a, b) => b.score - a.score || (b.card.availableLimit ?? 0) - (a.card.availableLimit ?? 0),
  );

  // Wait tip: would waiting up to 7 days gain ≥5 extra interest-free days?
  const todayBest = eligible[0]?.result.days ?? 0;
  let waitTip: Recommendation["waitTip"] = null;
  for (let i = 1; i <= p.waitTipHorizonDays && !waitTip; i++) {
    const date = addDays(normalize(spendDate), i);
    const future = cards
      .filter(
        (c) =>
          c.isActive && !c.carriesDebt && (c.availableLimit == null || c.availableLimit >= amount),
      )
      .map((c) => ({ card: c, days: interestFreeDays(c, date).days }))
      .sort((a, b) => b.days - a.days)[0];
    if (future && future.days >= todayBest + p.waitTipMinGain) {
      waitTip = { date, card: future.card, days: future.days };
    }
  }

  return { best: eligible[0] ?? null, alternatives: eligible.slice(1), excluded, waitTip };
}
// NOTE (v1.1): campaign value will be converted to "day equivalents" and added
// to score here. Do not implement now.
