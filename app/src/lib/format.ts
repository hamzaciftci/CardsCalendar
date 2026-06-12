export function formatTRY(amount: number): string {
  return `${Math.round(amount).toLocaleString("tr-TR")} ₺`;
}

const TR_MONTHS = [
  "Ocak",
  "Şubat",
  "Mart",
  "Nisan",
  "Mayıs",
  "Haziran",
  "Temmuz",
  "Ağustos",
  "Eylül",
  "Ekim",
  "Kasım",
  "Aralık",
];

const TR_DAYS_SHORT = ["Pzt", "Sal", "Çar", "Per", "Cum", "Cmt", "Paz"];

export function formatLongDate(d: Date): string {
  return `${d.getDate()} ${TR_MONTHS[d.getMonth()]} ${d.getFullYear()}`;
}

export function formatMonthYear(d: Date): string {
  return `${TR_MONTHS[d.getMonth()]} ${d.getFullYear()}`;
}

export function formatShortDate(d: Date): string {
  return `${d.getDate()} ${TR_MONTHS[d.getMonth()].slice(0, 3)}`;
}

export function monthName(idx: number): string {
  return TR_MONTHS[idx];
}

export function shortWeekdays(): string[] {
  return TR_DAYS_SHORT;
}

// ISO-like local date string (yyyy-mm-dd) for <input type="date">
export function toDateInputValue(d: Date): string {
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${y}-${m}-${day}`;
}

export function fromDateInputValue(s: string): Date {
  const [y, m, d] = s.split("-").map(Number);
  const dt = new Date(y, m - 1, d);
  if (isNaN(dt.getTime())) {
    const now = new Date();
    return new Date(now.getFullYear(), now.getMonth(), now.getDate());
  }
  return dt;
}
