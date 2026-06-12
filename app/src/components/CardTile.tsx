import type { Card } from "@/engine";
import { interestFreeDays, normalize } from "@/engine";
import { DayStrip } from "@/components/DayStrip";
import { formatTRY } from "@/lib/format";

export function CardTile({
  card,
  onClick,
  showToday = true,
}: {
  card: Card;
  onClick?: () => void;
  showToday?: boolean;
}) {
  const today = normalize(new Date());
  const days = interestFreeDays(card, today).days;
  const initials = card.name.trim().charAt(0).toUpperCase() || "?";
  const utilization =
    card.totalLimit && card.availableLimit != null
      ? (card.totalLimit - card.availableLimit) / card.totalLimit
      : null;

  return (
    <button
      type="button"
      onClick={onClick}
      className={
        "panel group relative flex h-full w-full flex-col gap-3 overflow-hidden p-4 text-left transition-transform active:scale-[0.99] " +
        (card.isActive ? "" : "opacity-60")
      }
    >
      <span
        className="pointer-events-none absolute inset-x-0 top-0 h-[3px]"
        style={{ background: `linear-gradient(90deg, ${card.color}, transparent 70%)` }}
      />

      <div className="flex items-center gap-3">
        <div
          className="tabular flex h-10 w-10 flex-none items-center justify-center rounded-xl text-base font-bold text-[#04101f]"
          style={{ backgroundColor: card.color, boxShadow: `0 0 22px ${card.color}55` }}
        >
          {initials}
        </div>
        <div className="min-w-0 flex-1">
          <div className="flex items-center gap-2">
            <p className="truncate text-[15px] font-bold tracking-tight">{card.name}</p>
            {!card.isActive && (
              <span className="tabular rounded-full bg-muted px-2 py-0.5 text-[9px] uppercase tracking-wider text-muted-foreground">
                pasif
              </span>
            )}
          </div>
          <p className="truncate text-xs text-muted-foreground">{card.bankName}</p>
        </div>
        {showToday && card.isActive && (
          <div className="tabular flex-none rounded-full border border-success/25 bg-success/10 px-2.5 py-1 text-[11px] font-semibold text-success">
            {days} gün
          </div>
        )}
      </div>

      <p className="tabular text-[11px] uppercase tracking-wider text-muted-foreground">
        Kesim · ayın {card.statementDay}'i&ensp;/&ensp;ödeme · +{card.graceDays} gün
      </p>

      {utilization != null && card.totalLimit && (
        <div>
          <div className="h-1.5 w-full overflow-hidden rounded-full bg-muted">
            <div
              className={"h-full rounded-full " + (utilization > 0.8 ? "bg-warning" : "bg-primary")}
              style={{ width: `${Math.min(100, Math.max(0, utilization * 100))}%` }}
            />
          </div>
          <p className="tabular mt-1.5 text-[11px] text-muted-foreground">
            {formatTRY(card.availableLimit!)} / {formatTRY(card.totalLimit)}
            <span className="ml-1">(%{Math.round(utilization * 100)} dolu)</span>
          </p>
        </div>
      )}

      {card.isActive && (
        <div className="mt-auto border-t border-border pt-3">
          <DayStrip card={card} compact />
        </div>
      )}
    </button>
  );
}
