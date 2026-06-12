import { addDays, interestFreeDays, normalize, type Card } from "@/engine";
import { formatLongDate } from "@/lib/format";

/**
 * 30 günlük harcama penceresi şeridi: her çubuk, o gün harcanırsa kaç gün
 * faizsiz kalınacağını gösterir. Kesim gününden hemen sonraki sıçrama,
 * uygulamanın öğrettiği temel davranıştır.
 */
export function DayStrip({
  card,
  compact = false,
}: {
  card: Pick<Card, "statementDay" | "graceDays">;
  compact?: boolean;
}) {
  const today = normalize(new Date());
  const cells = Array.from({ length: 30 }, (_, i) => {
    const date = addDays(today, i);
    return { date, days: interestFreeDays(card, date).days };
  });
  const max = Math.max(...cells.map((c) => c.days), 1);

  return (
    <div>
      <div className={"flex items-end gap-[3px] " + (compact ? "h-8" : "h-14")}>
        {cells.map((c, i) => (
          <span
            key={i}
            title={`${formatLongDate(c.date)} → ${c.days} gün faizsiz`}
            className="min-w-0 flex-1 rounded-[2px]"
            style={{
              height: `${18 + (c.days / max) * 82}%`,
              backgroundColor:
                i === 0
                  ? "#59a8ff"
                  : `rgb(43 227 164 / ${(0.15 + (c.days / max) * 0.75).toFixed(2)})`,
            }}
          />
        ))}
      </div>
      {!compact && (
        <div className="tabular mt-1.5 flex justify-between text-[10px] uppercase tracking-wider text-muted-foreground">
          <span>Bugün</span>
          <span>+30 gün</span>
        </div>
      )}
    </div>
  );
}
