import { createFileRoute } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import { useCards } from "@/hooks/use-cards";
import { PageHeader } from "@/components/PageHeader";
import { recommend, normalize, addDays } from "@/engine";
import { formatLongDate, monthName, shortWeekdays } from "@/lib/format";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import type { Card } from "@/engine";

export const Route = createFileRoute("/takvim")({
  head: () => ({
    meta: [
      { title: "Takvim — KartPilot" },
      { name: "description", content: "Kesim ve son ödeme günlerini aylık takvimde gör; her güne en iyi kartı bul." },
      { property: "og:title", content: "Takvim — KartPilot" },
      { property: "og:description", content: "Kesim ve son ödeme günlerini takvimde gör." },
    ],
  }),
  component: CalendarPage,
});

function clamp(year: number, month: number, day: number): number {
  return Math.min(day, new Date(year, month + 1, 0).getDate());
}

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
      if (!e) { e = { statement: [], due: [] }; map.set(d, e); }
      return e;
    };
    for (const c of cards) {
      if (!c.isActive) continue;
      const sd = clamp(year, month, c.statementDay);
      get(sd).statement.push(c);
      // due may roll into next month — only show if in current month
      const dueDate = new Date(year, month, sd + c.graceDays);
      if (dueDate.getMonth() === month) get(dueDate.getDate()).due.push(c);
      else {
        // also show previous month's due that lands in current month
      }
      // previous month's statement → due might fall into current month
      const prev = new Date(year, month - 1, 1);
      const pSd = clamp(prev.getFullYear(), prev.getMonth(), c.statementDay);
      const pDue = new Date(prev.getFullYear(), prev.getMonth(), pSd + c.graceDays);
      if (pDue.getFullYear() === year && pDue.getMonth() === month) {
        get(pDue.getDate()).due.push(c);
      }
    }
    return map;
  }, [cards, cursor]);

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

  const selectedEvents = selected.getFullYear() === year && selected.getMonth() === month
    ? events.get(selected.getDate())
    : undefined;

  return (
    <div className="pb-8">
      <PageHeader title="Takvim" subtitle="Kesim ve son ödeme günlerin" />

      <div className="mx-5 rounded-2xl bg-surface p-4 shadow-soft">
        <div className="flex items-center justify-between">
          <Button variant="ghost" size="icon" onClick={() => setCursor(new Date(year, month - 1, 1))}>
            <ChevronLeft className="h-5 w-5" />
          </Button>
          <p className="text-base font-semibold">{monthName(month)} {year}</p>
          <Button variant="ghost" size="icon" onClick={() => setCursor(new Date(year, month + 1, 1))}>
            <ChevronRight className="h-5 w-5" />
          </Button>
        </div>

        <div className="mt-3 grid grid-cols-7 gap-1 text-center text-[11px] font-medium text-muted-foreground">
          {shortWeekdays().map((d) => <div key={d}>{d}</div>)}
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
                  "relative flex aspect-square flex-col items-center justify-center rounded-lg text-sm tabular transition " +
                  (isSelected ? "bg-primary text-primary-foreground font-semibold" :
                   isToday ? "bg-primary/10 text-primary font-semibold" : "hover:bg-muted")
                }
              >
                <span>{d}</span>
                {e && (e.statement.length + e.due.length) > 0 && (
                  <span className="absolute bottom-1 flex gap-0.5">
                    {e.statement.slice(0, 3).map((c, idx) => (
                      <span key={"s"+idx} className="block h-0 w-0 border-l-[3px] border-r-[3px] border-b-[4px] border-l-transparent border-r-transparent" style={{ borderBottomColor: c.color }} />
                    ))}
                    {e.due.slice(0, 3).map((c, idx) => (
                      <span key={"d"+idx} className="block h-1.5 w-1.5 rounded-full" style={{ backgroundColor: c.color }} />
                    ))}
                  </span>
                )}
              </button>
            );
          })}
        </div>

        <div className="mt-3 flex items-center gap-4 text-[11px] text-muted-foreground">
          <span className="flex items-center gap-1">
            <span className="block h-0 w-0 border-l-[3px] border-r-[3px] border-b-[4px] border-l-transparent border-r-transparent border-b-foreground" />
            kesim günü
          </span>
          <span className="flex items-center gap-1">
            <span className="block h-1.5 w-1.5 rounded-full bg-foreground" />
            son ödeme
          </span>
        </div>
      </div>

      <div className="mx-5 mt-4 rounded-2xl bg-surface p-4 shadow-soft">
        <p className="text-[12px] font-medium uppercase tracking-wide text-muted-foreground">
          {formatLongDate(selected)}
        </p>

        {selectedEvents && (selectedEvents.statement.length + selectedEvents.due.length) > 0 ? (
          <ul className="mt-2 space-y-1.5">
            {selectedEvents.statement.map((c) => (
              <li key={"s"+c.id} className="flex items-center gap-2 text-[13px]">
                <span className="block h-0 w-0 border-l-[4px] border-r-[4px] border-b-[6px] border-l-transparent border-r-transparent" style={{ borderBottomColor: c.color }} />
                <span>{c.name} — kesim günü</span>
              </li>
            ))}
            {selectedEvents.due.map((c) => (
              <li key={"d"+c.id} className="flex items-center gap-2 text-[13px]">
                <span className="block h-2 w-2 rounded-full" style={{ backgroundColor: c.color }} />
                <span>{c.name} — son ödeme</span>
              </li>
            ))}
          </ul>
        ) : (
          <p className="mt-2 text-sm text-muted-foreground">Bu gün için kart olayı yok.</p>
        )}

        {selectedRec?.best && (
          <p className="mt-3 rounded-xl bg-success/10 px-3 py-2 text-[13px]">
            Bu gün harcamak için en iyi kart:{" "}
            <span className="font-semibold">{selectedRec.best.card.name}</span>{" "}
            <span className="font-semibold text-success tabular">({selectedRec.best.result.days} gün)</span>
          </p>
        )}
      </div>
    </div>
  );
}
