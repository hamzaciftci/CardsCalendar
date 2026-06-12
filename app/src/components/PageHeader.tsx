import type { ReactNode } from "react";

export function PageHeader({
  title,
  subtitle,
  right,
}: {
  title: string;
  subtitle?: string;
  right?: ReactNode;
}) {
  return (
    <header className="animate-rise flex flex-wrap items-end justify-between gap-3 pb-5 pt-7 lg:pb-7 lg:pt-12">
      <div>
        <p className="tabular text-[10px] uppercase tracking-[0.32em] text-muted-foreground/80">
          KartPilot
        </p>
        <h1 className="font-display mt-1.5 text-[34px] leading-none lg:text-[44px]">{title}</h1>
        {subtitle && <p className="tabular mt-2 text-[13px] text-muted-foreground">{subtitle}</p>}
      </div>
      {right}
    </header>
  );
}
