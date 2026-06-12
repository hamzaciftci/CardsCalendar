/** Yarım daire "faizsiz gün" göstergesi */
export function Gauge({ days }: { days: number }) {
  const max = 45;
  const ratio = Math.min(Math.max(days, 0), max) / max;
  // Sabit hassasiyet: SSR ve istemci aynı koordinat dizgisini üretsin
  // (yuvarlama olmadan ondalık serileştirme farkı hydration uyarısı doğurur)
  const round = (n: number) => Number(n.toFixed(2));
  const ticks = Array.from({ length: 10 }, (_, i) => {
    const a = Math.PI - (Math.PI * i) / 9;
    return {
      x1: round(110 + Math.cos(a) * 70),
      y1: round(108 - Math.sin(a) * 70),
      x2: round(110 + Math.cos(a) * 79),
      y2: round(108 - Math.sin(a) * 79),
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
