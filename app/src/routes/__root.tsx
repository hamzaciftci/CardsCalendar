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
import { useEffect, useState, type ReactNode } from "react";
import { Home, CreditCard, CalendarDays, Settings, Compass, ShieldCheck } from "lucide-react";

import appCss from "../styles.css?url";
import { useAuth } from "@/hooks/use-auth";
import { Onboarding } from "@/components/Onboarding";

function NotFoundComponent() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-background px-4">
      <div className="max-w-md text-center">
        <h1 className="tabular text-7xl font-bold text-foreground">404</h1>
        <h2 className="mt-4 text-xl font-semibold text-foreground">Sayfa bulunamadı</h2>
        <p className="mt-2 text-sm text-muted-foreground">Aradığın sayfa burada değil.</p>
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
      {
        name: "description",
        content:
          "Türkiye'deki kredi kartların için her güne en uzun faizsiz süreyi öneren akıllı asistan.",
      },
      { name: "author", content: "KartPilot" },
      { name: "theme-color", content: "#f7f7f5" },
      { property: "og:title", content: "KartPilot — Hangi kartla harcayayım?" },
      {
        property: "og:description",
        content: "Her güne en uzun faizsiz süreyi öneren kart asistanı.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
    ],
    links: [
      { rel: "preconnect", href: "https://fonts.googleapis.com" },
      { rel: "preconnect", href: "https://fonts.gstatic.com", crossOrigin: "" },
      {
        rel: "stylesheet",
        href: "https://fonts.googleapis.com/css2?family=Geist:wght@400;500;600;700&family=Geist+Mono:wght@400;500;600&family=Instrument+Serif&display=swap",
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
  { to: "/uygulama", label: "Bugün", icon: Home },
  { to: "/kartlarim", label: "Kartlarım", icon: CreditCard },
  { to: "/takvim", label: "Takvim", icon: CalendarDays },
  { to: "/ayarlar", label: "Ayarlar", icon: Settings },
] as const;

/** Masaüstü: sol kokpit menüsü */
function SideNav() {
  const pathname = useRouterState({ select: (s) => s.location.pathname });
  return (
    <aside className="fixed inset-y-0 left-0 z-40 hidden w-64 flex-col border-r border-border bg-background lg:flex">
      <div className="flex items-center gap-3 px-6 pb-10 pt-8">
        <div className="flex h-10 w-10 flex-none items-center justify-center rounded-xl bg-foreground text-background">
          <Compass className="h-5 w-5" />
        </div>
        <div>
          <p className="text-lg font-bold leading-none tracking-tight">KartPilot</p>
          <p className="tabular mt-1 text-[10px] uppercase tracking-[0.24em] text-muted-foreground">
            kart asistanı
          </p>
        </div>
      </div>

      <nav className="flex-1 space-y-1 px-3">
        {tabs.map((t) => {
          const active = pathname === t.to;
          const Icon = t.icon;
          return (
            <Link
              key={t.to}
              to={t.to}
              className={
                "relative flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition-colors " +
                (active
                  ? "border border-border bg-surface text-foreground shadow-[0_1px_2px_rgb(16_24_40_/_0.05)]"
                  : "text-muted-foreground hover:bg-muted/70 hover:text-foreground")
              }
            >
              {active && (
                <span className="absolute left-0 top-1/2 h-5 w-[3px] -translate-y-1/2 rounded-full bg-foreground" />
              )}
              <Icon
                className={"h-[18px] w-[18px] " + (active ? "text-primary" : "")}
                strokeWidth={active ? 2.4 : 2}
              />
              {t.label}
            </Link>
          );
        })}
      </nav>

      <div className="space-y-3 px-4 pb-6">
        <div className="flex items-start gap-2.5 rounded-xl border border-success/20 bg-success/10 p-3 text-[12px] leading-snug text-success-foreground/90">
          <ShieldCheck className="mt-0.5 h-4 w-4 flex-none text-success" />
          <p>Kart numarası, CVV, şifre — hiçbirini istemiyoruz.</p>
        </div>
        <p className="tabular px-1 text-[10px] uppercase tracking-widest text-muted-foreground/70">
          KartPilot v1.0
        </p>
      </div>
    </aside>
  );
}

/** Mobil: yüzen cam dock */
function BottomDock() {
  const pathname = useRouterState({ select: (s) => s.location.pathname });
  return (
    <nav className="fixed inset-x-0 bottom-0 z-40 px-3 pb-[calc(env(safe-area-inset-bottom)+10px)] lg:hidden">
      <ul className="mx-auto grid max-w-md grid-cols-4 rounded-2xl border border-border bg-surface/95 shadow-[0_12px_32px_rgb(16_24_40_/_0.14)] backdrop-blur-xl">
        {tabs.map((t) => {
          const active = pathname === t.to;
          const Icon = t.icon;
          return (
            <li key={t.to}>
              <Link
                to={t.to}
                className={
                  "flex flex-col items-center gap-1 py-2.5 text-[10px] font-semibold uppercase tracking-wide transition-colors " +
                  (active ? "text-foreground" : "text-muted-foreground hover:text-foreground")
                }
              >
                <Icon className="h-5 w-5" strokeWidth={active ? 2.4 : 2} />
                {t.label}
              </Link>
            </li>
          );
        })}
      </ul>
    </nav>
  );
}

function FullScreenLoader() {
  return (
    <div className="flex min-h-screen items-center justify-center">
      <div className="h-7 w-7 animate-spin rounded-full border-2 border-border border-t-foreground" />
    </div>
  );
}

/**
 * App rotaları için kapı: oturum zorunludur (yoksa /giris'e yönlendirir);
 * oturum açık ama onboarding tamamlanmamışsa onboarding gösterir.
 */
function AppGate({ children }: { children: ReactNode }) {
  const router = useRouter();
  const { session, loading, needsOnboarding, completeOnboarding } = useAuth();
  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);

  useEffect(() => {
    if (mounted && !loading && !session) {
      router.navigate({ to: "/giris", search: { mode: "giris" }, replace: true });
    }
  }, [mounted, loading, session, router]);

  // SSR + ilk istemci render + auth çözülürken ya da yönlendirme sırasında
  if (!mounted || loading || !session) return <FullScreenLoader />;

  if (needsOnboarding) {
    return (
      <Onboarding
        onDone={async (goToCards) => {
          await completeOnboarding();
          if (goToCards) void router.navigate({ to: "/kartlarim" });
        }}
      />
    );
  }

  return <>{children}</>;
}

function RootComponent() {
  const { queryClient } = Route.useRouteContext();
  const pathname = useRouterState({ select: (s) => s.location.pathname });
  // Vitrin ("/") ve kimlik ("/giris") kendi düzenini taşır; kabuk app rotalarında
  const bareLayout = pathname === "/" || pathname === "/giris";

  return (
    <QueryClientProvider client={queryClient}>
      {bareLayout ? (
        <Outlet />
      ) : (
        <AppGate>
          <SideNav />
          <div className="lg:pl-64">
            <main className="mx-auto w-full max-w-6xl px-4 pb-32 sm:px-6 lg:px-10 lg:pb-16">
              <Outlet />
            </main>
          </div>
          <BottomDock />
        </AppGate>
      )}
    </QueryClientProvider>
  );
}
