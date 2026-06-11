import type { Card } from "@/engine";
import { interestFreeDays, normalize } from "@/engine";
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
      className="group flex w-full flex-col gap-3 rounded-2xl bg-surface p-4 text-left shadow-soft transition-transform active:scale-[0.99]"
      style={{ borderLeft: `4px solid ${card.color}` }}
    >
      <div className="flex items-center gap-3">
        <div
          className="flex h-10 w-10 flex-none items-center justify-center rounded-xl text-base font-bold text-white"
          style={{ backgroundColor: card.color }}
        >
          {initials}
        </div>
        <div className="min-w-0 flex-1">
          <div className="flex items-center gap-2">
            <p className="truncate text-[15px] font-semibold">{card.name}</p>
            {!card.isActive && (
              <span className="rounded-full bg-muted px-2 py-0.5 text-[10px] font-medium text-muted-foreground">
                pasif
              </span>
            )}
          </div>
          <p className="truncate text-xs text-muted-foreground">{card.bankName}</p>
        </div>
        {showToday && card.isActive && (
          <div className="flex-none rounded-full bg-success/15 px-2.5 py-1 text-[11px] font-semibold text-success tabular">
            bugün: {days} gün
          </div>
        )}
      </div>

      <p className="text-xs text-muted-foreground tabular">
        Kesim: her ayın {card.statementDay}'i · Son ödeme: kesim + {card.graceDays} gün
      </p>

      {utilization != null && card.totalLimit && (
        <div>
          <div className="h-1.5 w-full overflow-hidden rounded-full bg-muted">
            <div
              className={"h-full rounded-full " + (utilization > 0.8 ? "bg-warning" : "bg-primary")}
              style={{ width: `${Math.min(100, Math.max(0, utilization * 100))}%` }}
            />
          </div>
          <p className="mt-1.5 text-[11px] text-muted-foreground tabular">
            Kullanılabilir {formatTRY(card.availableLimit!)} / {formatTRY(card.totalLimit)}
            <span className="ml-1">(%{Math.round(utilization * 100)} dolu)</span>
          </p>
        </div>
      )}
    </button>
  );
}
