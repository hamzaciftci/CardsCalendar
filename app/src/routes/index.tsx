import { createFileRoute } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import { Link } from "@tanstack/react-router";
import { useCards } from "@/hooks/use-cards";
import { Onboarding } from "@/components/Onboarding";
import { PageHeader } from "@/components/PageHeader";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { recommend, normalize, diffInDays, nextDueDate } from "@/engine";
import {
  formatLongDate,
  formatMonthYear,
  formatTRY,
  toDateInputValue,
  fromDateInputValue,
} from "@/lib/format";
import { isOnboarded } from "@/lib/storage";
import { AlertTriangle, Plus, Sparkles } from "lucide-react";

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
        <PageHeader title="Bugün" />
        <div className="mx-5 mt-8 rounded-2xl bg-surface p-6 text-center shadow-soft">
          <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-full bg-primary/10">
            <Sparkles className="h-7 w-7 text-primary" />
          </div>
          <h2 className="text-lg font-semibold">
            Kartlarını ekle, hangi gün hangi kartla harcayacağını söyleyelim.
          </h2>
          <p className="mt-2 text-sm text-muted-foreground">
            Sadece kart adı, banka ve tarihler. Numara, CVV, şifre yok.
          </p>
          <Button asChild className="mt-5 h-11 w-full text-base font-semibold">
            <Link to="/kartlarim">İlk kartını ekle</Link>
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="pb-8">
      <PageHeader title="Bugün" subtitle={formatLongDate(new Date())} />

      {upcomingDues.length > 0 && (
        <div className="mx-5 mb-4 space-y-2">
          {upcomingDues.map(({ card, days }) => (
            <div
              key={card.id}
              className="flex items-center gap-2 rounded-xl bg-warning/15 px-3 py-2.5 text-[13px] text-warning-foreground"
            >
              <AlertTriangle className="h-4 w-4 flex-none text-warning" />
              <p>
                {days === 0 ? (
                  <>
                    Bugün son ödeme günü: <span className="font-semibold">{card.name}</span>
                  </>
                ) : (
                  <>
                    Son ödemeye <span className="font-semibold tabular">{days} gün</span>:{" "}
                    {card.name}
                  </>
                )}
              </p>
            </div>
          ))}
        </div>
      )}

      {todayBest && (
        <section
          className="mx-5 overflow-hidden rounded-3xl bg-surface p-5 shadow-soft"
          style={{ borderTop: `4px solid ${todayBest.card.color}` }}
        >
          <p className="text-[12px] font-medium uppercase tracking-wide text-muted-foreground">
            Bugünün kartı
          </p>
          <p className="mt-1 text-xl font-bold">{todayBest.card.name}</p>
          <p className="text-xs text-muted-foreground">{todayBest.card.bankName}</p>
          <div className="mt-3 flex items-baseline gap-2">
            <span className="text-[48px] font-extrabold leading-none text-success tabular">
              {todayBest.result.days}
            </span>
            <span className="text-sm font-medium text-success">gün faizsiz</span>
          </div>
          <p className="mt-2 text-[12px] text-muted-foreground tabular">
            Kesim: {formatLongDate(todayBest.result.cutoffDate)} · Son ödeme:{" "}
            {formatLongDate(todayBest.result.dueDate)}
          </p>
        </section>
      )}

      <section className="mx-5 mt-5 rounded-2xl bg-surface p-5 shadow-soft">
        <p className="text-[15px] font-semibold">Ne kadar harcayacaksın?</p>
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
                "rounded-full border px-3.5 py-1.5 text-sm font-medium transition " +
                (amountStr === String(v)
                  ? "border-primary bg-primary/10 text-primary"
                  : "border-border bg-background text-foreground")
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
            className="rounded-full border border-border bg-background px-3.5 py-1.5 text-sm font-medium"
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
            className="h-11 text-base tabular"
          />
          <input
            type="date"
            value={spendDateStr}
            onChange={(e) => setSpendDateStr(e.target.value)}
            className="h-11 rounded-md border border-input bg-background px-3 text-sm tabular"
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
        <section className="mx-5 mt-5 space-y-4">
          {result.best ? (
            <div
              className="rounded-2xl bg-surface p-5 shadow-soft"
              style={{ borderLeft: `4px solid ${result.best.card.color}` }}
            >
              <p className="text-[12px] font-medium uppercase tracking-wide text-muted-foreground">
                Önerilen kart
              </p>
              <p className="mt-1 text-lg font-bold">{result.best.card.name}</p>
              <div className="mt-2 flex items-baseline gap-2">
                <span className="text-[40px] font-extrabold leading-none text-success tabular">
                  {result.best.result.days}
                </span>
                <span className="text-sm font-medium text-success">gün faizsiz</span>
              </div>
              <p className="mt-2 text-[12px] text-muted-foreground tabular">
                Kesim: {formatLongDate(result.best.result.cutoffDate)} · Son ödeme:{" "}
                {formatLongDate(result.best.result.dueDate)}
              </p>
              <p className="mt-1 text-[12px] text-muted-foreground">
                {formatMonthYear(result.best.result.cutoffDate)} ekstresine yansır.
              </p>
              {result.best.warnings.map((w, i) => (
                <p
                  key={i}
                  className="mt-2 rounded-lg bg-warning/15 px-3 py-2 text-[12px] text-warning-foreground"
                >
                  {w}
                </p>
              ))}
            </div>
          ) : (
            <div className="rounded-2xl bg-surface p-5 text-sm text-muted-foreground shadow-soft">
              Bu tutar için uygun kart bulunamadı.
            </div>
          )}

          {result.alternatives.length > 0 && (
            <div className="rounded-2xl bg-surface p-4 shadow-soft">
              <p className="mb-2 text-[12px] font-medium uppercase tracking-wide text-muted-foreground">
                Alternatifler
              </p>
              <ul className="divide-y divide-border">
                {result.alternatives.map((a) => (
                  <li key={a.card.id} className="flex items-center justify-between py-2.5">
                    <div className="flex items-center gap-2 min-w-0">
                      <span
                        className="h-2.5 w-2.5 flex-none rounded-full"
                        style={{ backgroundColor: a.card.color }}
                      />
                      <p className="truncate text-sm">{a.card.name}</p>
                    </div>
                    <p className="text-sm font-semibold text-success tabular">
                      {a.result.days} gün
                    </p>
                  </li>
                ))}
              </ul>
            </div>
          )}

          {result.waitTip && (
            <div className="rounded-2xl bg-primary/10 p-4 text-[13px] text-foreground">
              <p>
                <span className="font-semibold text-primary">İpucu:</span>{" "}
                {diffInDays(result.waitTip.date, spendDate)} gün beklersen{" "}
                <span className="font-semibold">{result.waitTip.card.name}</span> ile{" "}
                <span className="font-semibold text-success tabular">
                  {result.waitTip.days} gün
                </span>{" "}
                faizsiz kullanabilirsin.
              </p>
            </div>
          )}

          {result.excluded.length > 0 && (
            <div className="rounded-2xl bg-surface p-4 shadow-soft">
              <p className="mb-2 text-[12px] font-medium uppercase tracking-wide text-muted-foreground">
                Hariç tutulanlar
              </p>
              <ul className="space-y-1.5">
                {result.excluded.map((e) => (
                  <li key={e.card.id} className="text-[13px] text-muted-foreground">
                    <span className="font-medium text-foreground/70">{e.card.name}</span> —{" "}
                    {e.reason}
                  </li>
                ))}
              </ul>
            </div>
          )}

          <p className="px-1 text-[11px] text-muted-foreground">
            Tahminidir; bankanızın ekstresi esastır.
          </p>
        </section>
      )}

      <div className="mx-5 mt-6 flex justify-center">
        <Button asChild variant="outline" size="sm">
          <Link to="/kartlarim">
            <Plus className="mr-1 h-4 w-4" /> Yeni kart ekle
          </Link>
        </Button>
      </div>
    </div>
  );
}
