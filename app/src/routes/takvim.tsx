import { createFileRoute } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import { useCards } from "@/hooks/use-cards";
import { PageHeader } from "@/components/PageHeader";
import { recommend, normalize, cycleForMonth } from "@/engine";
import { formatLongDate, monthName, shortWeekdays } from "@/lib/format";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import type { Card } from "@/engine";

export const Route = createFileRoute("/takvim")({
  head: () => ({
    meta: [
      { title: "Takvim — KartPilot" },
      {
        name: "description",
        content: "Kesim ve son ödeme günlerini aylık takvimde gör; her güne en iyi kartı bul.",
      },
      { property: "og:title", content: "Takvim — KartPilot" },
      { property: "og:description", content: "Kesim ve son ödeme günlerini takvimde gör." },
    ],
  }),
  component: CalendarPage,
});

function CalendarPage() {
  const { cards, ready } = useCards();
  const today = normalize(new Date());
  const [cursor, setCursor] = useState<Date>(new Date(today.getFullYear(), today.getMonth(), 1));
  const [selected, setSelected] = useState<Date>(today);

  const events = useMemo(() => {
    const year = cursor.getFullYear();
    const month = cursor.getMonth();
    const map = new Map<number, { statement: Card[]; due: Card[] }>();
    const get = (d: number) => {
      let e = map.get(d);
      if (!e) {
        e = { statement: [], due: [] };
        map.set(d, e);
      }
      return e;
    };
    for (const c of cards) {
      if (!c.isActive) continue;
      // tüm tarih matematiği motorda: bu ayın kesimi + bu aya düşen son ödemeler
      const current = cycleForMonth(c, year, month);
      get(current.cutoffDate.getDate()).statement.push(c);
      // bu aya düşen son ödeme, bu ayın ya da önceki ayın kesiminden gelir
      for (const cycle of [cycleForMonth(c, year, month - 1), current]) {
        if (cycle.dueDate.getFullYear() === year && cycle.dueDate.getMonth() === month) {
          get(cycle.dueDate.getDate()).due.push(c);
        }
      }
    }
    return map;
  }, [cards, cursor]);

  // Hook'lar koşullu return'den ÖNCE gelmeli (React kuralı)
  const selectedRec = useMemo(
    () => (cards.length ? recommend(cards, 1, selected) : null),
    [cards, selected],
  );

  if (!ready) return null;

  const year = cursor.getFullYear();
  const month = cursor.getMonth();
  const firstWeekday = (new Date(year, month, 1).getDay() + 6) % 7; // Monday = 0
  const daysInMonth = new Date(year, month + 1, 0).getDate();

  const cells: (number | null)[] = [];
  for (let i = 0; i < firstWeekday; i++) cells.push(null);
  for (let d = 1; d <= daysInMonth; d++) cells.push(d);
  while (cells.length % 7 !== 0) cells.push(null);

  const selectedEvents =
    selected.getFullYear() === year && selected.getMonth() === month
      ? events.get(selected.getDate())
      : undefined;

  return (
    <div>
      <PageHeader title="Takvim" subtitle="Kesim ve son ödeme günlerin" />

      <div className="grid items-start gap-5 lg:grid-cols-[minmax(0,1fr)_360px]">
        {/* ── Takvim paneli ─────────────────────────────────────────── */}
        <section className="panel animate-rise p-4 lg:p-6" style={{ animationDelay: "80ms" }}>
          <div className="flex items-center justify-between">
            <Button
              variant="ghost"
              size="icon"
              className="text-muted-foreground hover:text-foreground"
              onClick={() => setCursor(new Date(year, month - 1, 1))}
            >
              <ChevronLeft className="h-5 w-5" />
            </Button>
            <p className="tabular text-base font-semibold uppercase tracking-[0.18em]">
              {monthName(month)} {year}
            </p>
            <Button
              variant="ghost"
              size="icon"
              className="text-muted-foreground hover:text-foreground"
              onClick={() => setCursor(new Date(year, month + 1, 1))}
            >
              <ChevronRight className="h-5 w-5" />
            </Button>
          </div>

          <div className="tabular mt-4 grid grid-cols-7 gap-1 text-center text-[10px] font-medium uppercase tracking-widest text-muted-foreground">
            {shortWeekdays().map((d) => (
              <div key={d}>{d}</div>
            ))}
          </div>
          <div className="mt-1 grid grid-cols-7 gap-1">
            {cells.map((d, i) => {
              if (d === null) return <div key={i} />;
              const date = new Date(year, month, d);
              const isToday = date.getTime() === today.getTime();
              const isSelected = date.getTime() === selected.getTime();
              const e = events.get(d);
              return (
                <button
                  key={i}
                  onClick={() => setSelected(date)}
                  className={
                    "tabular relative flex aspect-square flex-col items-center justify-center rounded-xl text-sm transition-[color,background-color,box-shadow,transform] duration-150 ease-out active:scale-[0.97] " +
                    (isSelected
                      ? "bg-primary font-semibold text-primary-foreground shadow-[0_0_12px_rgb(89_168_255_/_0.3)]"
                      : isToday
                        ? "font-semibold text-primary ring-1 ring-inset ring-primary/60"
                        : "hover:bg-muted/70")
                  }
                >
                  <span>{d}</span>
                  {e && e.statement.length + e.due.length > 0 && (
                    <span className="absolute bottom-1.5 flex gap-0.5">
                      {e.statement.slice(0, 3).map((c, idx) => (
                        <span
                          key={"s" + idx}
                          className="block h-0 w-0 border-b-[5px] border-l-[3.5px] border-r-[3.5px] border-l-transparent border-r-transparent"
                          style={{ borderBottomColor: isSelected ? "#04101f" : c.color }}
                        />
                      ))}
                      {e.due.slice(0, 3).map((c, idx) => (
                        <span
                          key={"d" + idx}
                          className="block h-1.5 w-1.5 rounded-full"
                          style={{ backgroundColor: isSelected ? "#04101f" : c.color }}
                        />
                      ))}
                    </span>
                  )}
                </button>
              );
            })}
          </div>

          <div className="tabular mt-4 flex items-center gap-5 border-t border-border pt-3 text-[10px] uppercase tracking-wider text-muted-foreground">
            <span className="flex items-center gap-1.5">
              <span className="block h-0 w-0 border-b-[5px] border-l-[3.5px] border-r-[3.5px] border-b-warning border-l-transparent border-r-transparent" />
              kesim günü
            </span>
            <span className="flex items-center gap-1.5">
              <span className="block h-1.5 w-1.5 rounded-full bg-destructive" />
              son ödeme
            </span>
          </div>
        </section>

        {/* ── Seçili gün paneli ─────────────────────────────────────── */}
        <section
          className="panel animate-rise p-5 lg:sticky lg:top-8"
          style={{ animationDelay: "140ms" }}
        >
          <p className="tabular text-[11px] uppercase tracking-[0.28em] text-muted-foreground">
            {formatLongDate(selected)}
          </p>

          {selectedEvents && selectedEvents.statement.length + selectedEvents.due.length > 0 ? (
            <ul className="mt-3 space-y-2">
              {selectedEvents.statement.map((c) => (
                <li key={"s" + c.id} className="flex items-center gap-2.5 text-[13px]">
                  <span
                    className="block h-0 w-0 border-b-[6px] border-l-[4px] border-r-[4px] border-l-transparent border-r-transparent"
                    style={{ borderBottomColor: c.color }}
                  />
                  <span className="min-w-0 flex-1 truncate">{c.name}</span>
                  <span className="tabular rounded-md bg-warning/15 px-2 py-0.5 text-[10px] uppercase tracking-wider text-warning-foreground">
                    kesim
                  </span>
                </li>
              ))}
              {selectedEvents.due.map((c) => (
                <li key={"d" + c.id} className="flex items-center gap-2.5 text-[13px]">
                  <span className="h-2 w-2 rounded-full" style={{ backgroundColor: c.color }} />
                  <span className="min-w-0 flex-1 truncate">{c.name}</span>
                  <span className="tabular rounded-md bg-destructive/15 px-2 py-0.5 text-[10px] uppercase tracking-wider text-destructive">
                    son ödeme
                  </span>
                </li>
              ))}
            </ul>
          ) : (
            <p className="mt-3 text-sm text-muted-foreground">Bu gün için kart olayı yok.</p>
          )}

          {selectedRec?.best && (
            <div className="mt-4 rounded-xl border border-success/25 bg-success/10 px-4 py-3">
              <p className="tabular text-[10px] uppercase tracking-[0.2em] text-success-foreground/80">
                Bu gün için en iyi kart
              </p>
              <p className="mt-1.5 flex items-baseline justify-between gap-3">
                <span className="font-semibold">{selectedRec.best.card.name}</span>
                <span className="tabular font-bold text-success">
                  {selectedRec.best.result.days} gün
                </span>
              </p>
            </div>
          )}
        </section>
      </div>
    </div>
  );
}
