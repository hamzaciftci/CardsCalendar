import { createFileRoute, Link } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import { useCards } from "@/hooks/use-cards";
import { Onboarding } from "@/components/Onboarding";
import { PageHeader } from "@/components/PageHeader";
import { DayStrip } from "@/components/DayStrip";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  recommend,
  normalize,
  nextDueDate,
  statementCutoffFor,
  diffInDays,
  type Card,
} from "@/engine";
import {
  formatLongDate,
  formatMonthYear,
  formatShortDate,
  formatTRY,
  toDateInputValue,
  fromDateInputValue,
} from "@/lib/format";
import { isOnboarded } from "@/lib/storage";
import { AlertTriangle, CalendarClock, Lightbulb, Sparkles } from "lucide-react";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "KartPilot — Bugünün kartı" },
      {
        name: "description",
        content: "Bugün hangi kartla harcaman gerektiğini saniyeler içinde öğren.",
      },
      { property: "og:title", content: "KartPilot — Bugünün kartı" },
      {
        property: "og:description",
        content: "Bugün hangi kartla harcaman gerektiğini saniyeler içinde öğren.",
      },
    ],
  }),
  component: TodayPage,
});

/** Yarım daire "faizsiz gün" göstergesi — kokpit altimetresi */
function Gauge({ days }: { days: number }) {
  const max = 45;
  const ratio = Math.min(Math.max(days, 0), max) / max;
  const ticks = Array.from({ length: 10 }, (_, i) => {
    const a = Math.PI - (Math.PI * i) / 9;
    return {
      x1: 110 + Math.cos(a) * 70,
      y1: 108 - Math.sin(a) * 70,
      x2: 110 + Math.cos(a) * 79,
      y2: 108 - Math.sin(a) * 79,
    };
  });

  return (
    <div className="relative mx-auto w-[230px] max-w-full flex-none">
      <svg viewBox="0 0 220 114" className="w-full">
        <defs>
          <linearGradient id="kp-gauge" x1="0" y1="1" x2="1" y2="0">
            <stop offset="0%" stopColor="#1f7a4d" />
            <stop offset="100%" stopColor="#2fa56b" />
          </linearGradient>
        </defs>
        {ticks.map((t, i) => (
          <line key={i} {...t} stroke="rgb(22 24 29 / 0.15)" strokeWidth="1.5" />
        ))}
        <path
          d="M22 108 A 88 88 0 0 1 198 108"
          fill="none"
          stroke="rgb(22 24 29 / 0.08)"
          strokeWidth="10"
          strokeLinecap="round"
        />
        <path
          d="M22 108 A 88 88 0 0 1 198 108"
          pathLength={100}
          fill="none"
          stroke="url(#kp-gauge)"
          strokeWidth="10"
          strokeLinecap="round"
          strokeDasharray={`${Math.max(ratio * 100, 1.5)} 100`}
          className="gauge-arc"
        />
      </svg>
      <div className="absolute inset-x-0 bottom-0 text-center">
        <span className="tabular text-[44px] font-bold leading-none text-success">{days}</span>
        <span className="ml-1 text-xs font-semibold text-success/80">gün</span>
        <p className="tabular mt-0.5 text-[10px] uppercase tracking-[0.25em] text-muted-foreground">
          faizsiz
        </p>
      </div>
    </div>
  );
}

/** Uçuş planı: tüm kartların yaklaşan kesim/son ödeme tarihleri */
function UpcomingEvents({ cards }: { cards: Card[] }) {
  const events = useMemo(() => {
    const today = normalize(new Date());
    const list: { card: Card; type: "kesim" | "son ödeme"; date: Date }[] = [];
    for (const c of cards.filter((c) => c.isActive)) {
      list.push({ card: c, type: "son ödeme", date: nextDueDate(c, today) });
      list.push({ card: c, type: "kesim", date: statementCutoffFor(today, c.statementDay) });
    }
    return list.sort((a, b) => a.date.getTime() - b.date.getTime()).slice(0, 5);
  }, [cards]);

  if (events.length === 0) return null;
  const today = normalize(new Date());

  return (
    <section className="panel animate-rise p-5" style={{ animationDelay: "160ms" }}>
      <div className="flex items-center gap-2">
        <CalendarClock className="h-4 w-4 text-muted-foreground" />
        <p className="tabular text-[11px] uppercase tracking-[0.28em] text-muted-foreground">
          Uçuş planı — yaklaşan tarihler
        </p>
      </div>
      <ul className="mt-2 divide-y divide-border">
        {events.map((e, i) => {
          const d = diffInDays(e.date, today);
          return (
            <li key={i} className="flex items-center gap-3 py-2.5">
              <span
                className="h-2.5 w-2.5 flex-none rounded-full"
                style={{ backgroundColor: e.card.color }}
              />
              <p className="min-w-0 flex-1 truncate text-sm">{e.card.name}</p>
              <span
                className={
                  "tabular rounded-md px-2 py-0.5 text-[10px] uppercase tracking-wider " +
                  (e.type === "kesim"
                    ? "bg-warning/15 text-warning-foreground"
                    : "bg-destructive/15 text-destructive")
                }
              >
                {e.type}
              </span>
              <span className="tabular w-14 text-right text-[13px]">{formatShortDate(e.date)}</span>
              <span className="tabular w-14 text-right text-[12px] text-muted-foreground">
                {d === 0 ? "BUGÜN" : `D-${d}`}
              </span>
            </li>
          );
        })}
      </ul>
    </section>
  );
}

function TodayPage() {
  const { cards, ready } = useCards();
  const [showOnboarding, setShowOnboarding] = useState<boolean>(() =>
    typeof window === "undefined" ? false : !isOnboarded(),
  );
  const [amountStr, setAmountStr] = useState<string>("");
  const [spendDateStr, setSpendDateStr] = useState<string>(() => toDateInputValue(new Date()));
  const [calculated, setCalculated] = useState<boolean>(false);

  const spendDate = useMemo(() => fromDateInputValue(spendDateStr), [spendDateStr]);
  const amount = Math.max(0, Number(amountStr || 0));

  const todayBest = useMemo(
    () => (cards.length ? recommend(cards, 1, normalize(new Date())).best : null),
    [cards],
  );

  const result = useMemo(() => {
    if (!calculated || !amount) return null;
    return recommend(cards, amount, spendDate);
  }, [calculated, amount, spendDate, cards]);

  const upcomingDues = useMemo(() => {
    const today = normalize(new Date());
    return cards
      .filter((c) => c.isActive)
      .map((c) => {
        const due = nextDueDate(c, today);
        return { card: c, due, days: diffInDays(due, today) };
      })
      .filter((x) => x.days >= 0 && x.days <= 3)
      .sort((a, b) => a.days - b.days);
  }, [cards]);

  if (!ready) return null;

  if (showOnboarding) return <Onboarding onDone={() => setShowOnboarding(false)} />;

  if (cards.length === 0) {
    return (
      <div>
        <PageHeader title="Bugün" subtitle={formatLongDate(new Date())} />
        <div className="panel animate-rise mx-auto max-w-xl p-8 text-center lg:p-12">
          <div className="mx-auto mb-5 flex h-16 w-16 items-center justify-center rounded-2xl bg-primary/10 text-primary">
            <Sparkles className="h-8 w-8" />
          </div>
          <h2 className="text-xl font-bold tracking-tight">
            Kartlarını ekle, hangi gün hangi kartla harcayacağını söyleyelim.
          </h2>
          <p className="mt-2 text-sm text-muted-foreground">
            Sadece kart adı, banka ve tarihler. Numara, CVV, şifre yok.
          </p>
          <Button asChild className="mt-6 h-11 px-8 text-base font-semibold">
            <Link to="/kartlarim">İlk kartını ekle</Link>
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div>
      <PageHeader title="Bugün" subtitle={formatLongDate(new Date())} />

      {upcomingDues.length > 0 && (
        <div className="animate-rise mb-5 space-y-2">
          {upcomingDues.map(({ card, days }) => (
            <div
              key={card.id}
              className="flex items-center gap-3 rounded-2xl border border-warning/25 bg-warning/10 px-4 py-3 text-[13px] text-warning-foreground"
            >
              <AlertTriangle className="h-4 w-4 flex-none text-warning" />
              <p>
                {days === 0 ? (
                  <>
                    Bugün <span className="font-semibold">son ödeme günü</span>: {card.name}
                  </>
                ) : (
                  <>
                    Son ödemeye <span className="tabular font-semibold">{days} gün</span>:{" "}
                    {card.name}
                  </>
                )}
              </p>
            </div>
          ))}
        </div>
      )}

      <div className="grid items-start gap-5 lg:grid-cols-12">
        {/* ── Gösterge paneli (mobilde 1. sıra) ─────────────────────── */}
        <div className="lg:col-span-7">
          {todayBest && (
            <section
              className="panel animate-rise relative overflow-hidden p-5 lg:p-7"
              style={{ animationDelay: "80ms" }}
            >
              <div
                className="pointer-events-none absolute -right-20 -top-24 h-64 w-64 rounded-full"
                style={{
                  background: `radial-gradient(closest-side, ${todayBest.card.color}1a, transparent)`,
                }}
              />
              <div className="flex items-center justify-between gap-3">
                <p className="tabular text-[11px] uppercase tracking-[0.28em] text-muted-foreground">
                  Bugünün kartı
                </p>
                <span className="tabular rounded-full border border-border bg-muted/60 px-2.5 py-1 text-[10px] uppercase tracking-widest text-muted-foreground">
                  {todayBest.card.bankName}
                </span>
              </div>

              <div className="mt-4 grid gap-6 sm:grid-cols-[minmax(0,1fr)_auto] sm:items-center">
                <div>
                  <h2 className="text-2xl font-bold tracking-tight lg:text-[28px]">
                    {todayBest.card.name}
                  </h2>
                  <dl className="tabular mt-4 space-y-2 text-[13px]">
                    <div className="flex items-baseline gap-3">
                      <dt className="w-24 text-[10px] uppercase tracking-[0.2em] text-muted-foreground">
                        Kesim
                      </dt>
                      <dd>{formatLongDate(todayBest.result.cutoffDate)}</dd>
                    </div>
                    <div className="flex items-baseline gap-3">
                      <dt className="w-24 text-[10px] uppercase tracking-[0.2em] text-muted-foreground">
                        Son ödeme
                      </dt>
                      <dd>{formatLongDate(todayBest.result.dueDate)}</dd>
                    </div>
                    <div className="flex items-baseline gap-3">
                      <dt className="w-24 text-[10px] uppercase tracking-[0.2em] text-muted-foreground">
                        Ekstre
                      </dt>
                      <dd>{formatMonthYear(todayBest.result.cutoffDate)}</dd>
                    </div>
                  </dl>
                </div>
                <Gauge days={todayBest.result.days} />
              </div>

              <div className="mt-6 border-t border-border pt-4">
                <p className="tabular mb-2 text-[10px] uppercase tracking-[0.2em] text-muted-foreground">
                  30 günlük pencere — bugün harcamak yerine beklersen
                </p>
                <DayStrip card={todayBest.card} />
              </div>
            </section>
          )}
        </div>

        {/* ── Sağ kolon: simülasyon kokpiti ─────────────────────────── */}
        <div className="space-y-4 lg:sticky lg:top-8 lg:col-span-5 lg:row-span-2">
          <section className="panel animate-rise p-5 lg:p-6" style={{ animationDelay: "120ms" }}>
            <p className="text-[16px] font-bold tracking-tight">Ne kadar harcayacaksın?</p>
            <div className="mt-3 flex flex-wrap gap-2">
              {[1000, 5000, 10000].map((v) => (
                <button
                  key={v}
                  type="button"
                  onClick={() => {
                    setAmountStr(String(v));
                    setCalculated(false);
                  }}
                  className={
                    "tabular rounded-full border px-3.5 py-1.5 text-sm font-medium transition-[color,background-color,border-color,transform] duration-150 ease-out active:scale-[0.97] " +
                    (amountStr === String(v)
                      ? "border-primary bg-primary/15 text-primary"
                      : "border-border bg-muted/40 text-foreground hover:border-muted-foreground/40")
                  }
                >
                  {formatTRY(v)}
                </button>
              ))}
              <button
                type="button"
                onClick={() => {
                  setAmountStr("");
                  setCalculated(false);
                }}
                className="rounded-full border border-border bg-muted/40 px-3.5 py-1.5 text-sm font-medium transition-[border-color,transform] duration-150 ease-out hover:border-muted-foreground/40 active:scale-[0.97]"
              >
                Diğer
              </button>
            </div>

            <div className="mt-3 flex gap-2">
              <Input
                inputMode="numeric"
                placeholder="Tutar (₺)"
                value={amountStr}
                onChange={(e) => {
                  setAmountStr(e.target.value.replace(/\D/g, ""));
                  setCalculated(false);
                }}
                className="tabular h-11 text-base"
              />
              <input
                type="date"
                value={spendDateStr}
                onChange={(e) => setSpendDateStr(e.target.value)}
                className="tabular h-11 rounded-md border border-input bg-surface px-3 text-sm"
              />
            </div>

            <Button
              className="mt-3 h-11 w-full text-base font-semibold"
              disabled={!amount}
              onClick={() => setCalculated(true)}
            >
              Hesapla
            </Button>
          </section>

          {result && (
            <div className="space-y-4">
              {result.best ? (
                <section
                  className="panel animate-rise relative overflow-hidden p-5"
                  style={{ borderColor: `${result.best.card.color}55` }}
                >
                  <p className="tabular text-[11px] uppercase tracking-[0.28em] text-muted-foreground">
                    Önerilen kart
                  </p>
                  <div className="mt-2 flex items-start justify-between gap-4">
                    <div>
                      <p className="text-lg font-bold tracking-tight">{result.best.card.name}</p>
                      <p className="text-xs text-muted-foreground">{result.best.card.bankName}</p>
                    </div>
                    <div className="text-right">
                      <span className="tabular text-[40px] font-bold leading-none text-success">
                        {result.best.result.days}
                      </span>
                      <span className="ml-1 text-xs font-semibold text-success/80">gün</span>
                    </div>
                  </div>
                  <dl className="tabular mt-3 space-y-1 text-[12px] text-muted-foreground">
                    <dd>
                      Kesim {formatLongDate(result.best.result.cutoffDate)} · Son ödeme{" "}
                      {formatLongDate(result.best.result.dueDate)}
                    </dd>
                    <dd>{formatMonthYear(result.best.result.cutoffDate)} ekstresine yansır.</dd>
                  </dl>
                  {result.best.warnings.map((w, i) => (
                    <p
                      key={i}
                      className="mt-2 rounded-lg bg-warning/15 px-3 py-2 text-[12px] text-warning-foreground"
                    >
                      {w}
                    </p>
                  ))}
                </section>
              ) : (
                <section className="panel animate-rise p-5 text-sm text-muted-foreground">
                  Bu tutar için uygun kart bulunamadı.
                </section>
              )}

              {result.waitTip && (
                <div className="animate-rise flex items-start gap-3 rounded-2xl border border-primary/30 bg-primary/10 p-4 text-[13px]">
                  <Lightbulb className="mt-0.5 h-4 w-4 flex-none text-primary" />
                  <p>
                    <span className="tabular font-semibold">
                      {diffInDays(result.waitTip.date, spendDate)} gün
                    </span>{" "}
                    beklersen <span className="font-semibold">{result.waitTip.card.name}</span> ile{" "}
                    <span className="tabular font-semibold text-success">
                      {result.waitTip.days} gün
                    </span>{" "}
                    faizsiz kullanabilirsin.
                  </p>
                </div>
              )}

              {result.alternatives.length > 0 && (
                <section className="panel animate-rise p-4">
                  <p className="tabular mb-1 px-1 text-[11px] uppercase tracking-[0.28em] text-muted-foreground">
                    Alternatifler
                  </p>
                  <ul className="divide-y divide-border">
                    {result.alternatives.map((a) => (
                      <li key={a.card.id} className="flex items-center justify-between px-1 py-2.5">
                        <div className="flex min-w-0 items-center gap-2">
                          <span
                            className="h-2.5 w-2.5 flex-none rounded-full"
                            style={{ backgroundColor: a.card.color }}
                          />
                          <p className="truncate text-sm">{a.card.name}</p>
                        </div>
                        <p className="tabular text-sm font-semibold text-success">
                          {a.result.days} gün
                        </p>
                      </li>
                    ))}
                  </ul>
                </section>
              )}

              {result.excluded.length > 0 && (
                <section className="panel animate-rise p-4">
                  <p className="tabular mb-1 px-1 text-[11px] uppercase tracking-[0.28em] text-muted-foreground">
                    Hariç tutulanlar
                  </p>
                  <ul className="space-y-1.5 px-1">
                    {result.excluded.map((e) => (
                      <li key={e.card.id} className="text-[13px] text-muted-foreground">
                        <span className="font-medium text-foreground/70">{e.card.name}</span> —{" "}
                        {e.reason}
                      </li>
                    ))}
                  </ul>
                </section>
              )}

              <p className="px-1 text-[11px] text-muted-foreground">
                Tahminidir; bankanızın ekstresi esastır.
              </p>
            </div>
          )}
        </div>

        {/* ── Uçuş planı: yaklaşan tarihler (mobilde 3. sıra) ───────── */}
        <div className="lg:col-span-7">
          <UpcomingEvents cards={cards} />
        </div>
      </div>
    </div>
  );
}
