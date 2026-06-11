import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import {
  Outlet,
  Link,
  createRootRouteWithContext,
  useRouter,
  useRouterState,
  HeadContent,
  Scripts,
} from "@tanstack/react-router";
import { useEffect, type ReactNode } from "react";
import { Home, CreditCard, CalendarDays, Settings } from "lucide-react";

import appCss from "../styles.css?url";
import { reportLovableError } from "../lib/lovable-error-reporting";

function NotFoundComponent() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-background px-4">
      <div className="max-w-md text-center">
        <h1 className="text-7xl font-bold text-foreground">404</h1>
        <h2 className="mt-4 text-xl font-semibold text-foreground">Sayfa bulunamadı</h2>
        <p className="mt-2 text-sm text-muted-foreground">
          Aradığın sayfa burada değil.
        </p>
        <div className="mt-6">
          <Link
            to="/"
            className="inline-flex items-center justify-center rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground"
          >
            Ana sayfa
          </Link>
        </div>
      </div>
    </div>
  );
}

function ErrorComponent({ error, reset }: { error: Error; reset: () => void }) {
  console.error(error);
  const router = useRouter();
  useEffect(() => {
    reportLovableError(error, { boundary: "tanstack_root_error_component" });
  }, [error]);

  return (
    <div className="flex min-h-screen items-center justify-center bg-background px-4">
      <div className="max-w-md text-center">
        <h1 className="text-xl font-semibold tracking-tight">Bir şeyler ters gitti</h1>
        <p className="mt-2 text-sm text-muted-foreground">
          Sayfa yüklenemedi. Tekrar denemek ister misin?
        </p>
        <div className="mt-6 flex flex-wrap justify-center gap-2">
          <button
            onClick={() => {
              router.invalidate();
              reset();
            }}
            className="rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground"
          >
            Tekrar dene
          </button>
          <a href="/" className="rounded-md border border-input bg-background px-4 py-2 text-sm">
            Ana sayfa
          </a>
        </div>
      </div>
    </div>
  );
}

export const Route = createRootRouteWithContext<{ queryClient: QueryClient }>()({
  head: () => ({
    meta: [
      { charSet: "utf-8" },
      { name: "viewport", content: "width=device-width, initial-scale=1, viewport-fit=cover" },
      { title: "KartPilot — Hangi kartla harcayayım?" },
      { name: "description", content: "Türkiye'deki kredi kartların için her güne en uzun faizsiz süreyi öneren akıllı asistan." },
      { name: "author", content: "KartPilot" },
      { name: "theme-color", content: "#1E5AF5" },
      { property: "og:title", content: "KartPilot — Hangi kartla harcayayım?" },
      { property: "og:description", content: "Her güne en uzun faizsiz süreyi öneren kart asistanı." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
    ],
    links: [
      { rel: "preconnect", href: "https://fonts.googleapis.com" },
      { rel: "preconnect", href: "https://fonts.gstatic.com", crossOrigin: "" },
      {
        rel: "stylesheet",
        href: "https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800&display=swap",
      },
      { rel: "stylesheet", href: appCss },
    ],
  }),
  shellComponent: RootShell,
  component: RootComponent,
  notFoundComponent: NotFoundComponent,
  errorComponent: ErrorComponent,
});

function RootShell({ children }: { children: ReactNode }) {
  return (
    <html lang="tr">
      <head>
        <HeadContent />
      </head>
      <body>
        {children}
        <Scripts />
      </body>
    </html>
  );
}

const tabs = [
  { to: "/", label: "Bugün", icon: Home },
  { to: "/kartlarim", label: "Kartlarım", icon: CreditCard },
  { to: "/takvim", label: "Takvim", icon: CalendarDays },
  { to: "/ayarlar", label: "Ayarlar", icon: Settings },
] as const;

function BottomNav() {
  const pathname = useRouterState({ select: (s) => s.location.pathname });
  return (
    <nav className="fixed bottom-0 left-1/2 z-40 w-full max-w-[480px] -translate-x-1/2 border-t border-border bg-surface/95 backdrop-blur">
      <ul className="grid grid-cols-4">
        {tabs.map((t) => {
          const active = pathname === t.to;
          const Icon = t.icon;
          return (
            <li key={t.to}>
              <Link
                to={t.to}
                className={
                  "flex flex-col items-center gap-1 py-2.5 text-[11px] font-medium transition-colors " +
                  (active ? "text-primary" : "text-muted-foreground hover:text-foreground")
                }
              >
                <Icon className="h-5 w-5" strokeWidth={active ? 2.4 : 2} />
                {t.label}
              </Link>
            </li>
          );
        })}
      </ul>
      <div style={{ paddingBottom: "env(safe-area-inset-bottom)" }} />
    </nav>
  );
}

function RootComponent() {
  const { queryClient } = Route.useRouteContext();

  return (
    <QueryClientProvider client={queryClient}>
      <div className="mx-auto min-h-screen w-full max-w-[480px] bg-background pb-24">
        <Outlet />
      </div>
      <BottomNav />
    </QueryClientProvider>
  );
}
