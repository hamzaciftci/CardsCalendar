import { createFileRoute, Link } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { Gauge } from "@/components/Gauge";
import { DayStrip } from "@/components/DayStrip";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/hooks/use-auth";
import { interestFreeDays, normalize } from "@/engine";
import {
  ArrowRight,
  CalendarDays,
  Calculator,
  CloudUpload,
  Compass,
  CreditCard,
  Gauge as GaugeIcon,
  BarChart3,
  ShieldCheck,
  Sparkles,
} from "lucide-react";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "KartPilot — Doğru günde doğru kart" },
      {
        name: "description",
        content:
          "Birden fazla kredi kartın mı var? KartPilot hangi gün hangi kartla harcarsan en uzun faizsiz süreyi kazanacağını söyler. Kart numarası istemez, 1 dakikada kurulur.",
      },
      { property: "og:title", content: "KartPilot — Doğru günde doğru kart" },
      {
        property: "og:description",
        content: "Her harcamada maksimum faizsiz gün. Kart numarası yok, şifre yok.",
      },
    ],
  }),
  component: LandingPage,
});

const DEMO_CARD = { statementDay: 9, graceDays: 10 };

const STEPS = [
  {
    icon: CreditCard,
    title: "Kartlarını ekle",
    body: "Sadece kart adı, banka ve kesim/ödeme günleri. Kart numarası ve CVV alanı yok — bilerek.",
  },
  {
    icon: Calculator,
    title: "Tutarı yaz",
    body: "“8.000 ₺ harcayacağım” de. KartPilot tüm kartlarını saniyeler içinde karşılaştırsın.",
  },
  {
    icon: Sparkles,
    title: "Önerilen kartla harca",
    body: "En uzun faizsiz süreyi veren kartı, tarihleriyle birlikte gör. Gerekirse “2 gün bekle” ipucunu al.",
  },
];

const FEATURES = [
  {
    icon: GaugeIcon,
    title: "Faizsiz gün göstergesi",
    body: "Bugün harcarsan kaç gün faizsiz kullanacağını tek bakışta gör — kart kart, gün gün.",
  },
  {
    icon: BarChart3,
    title: "30 günlük pencere",
    body: "Harcamayı 1-2 gün ertelemek bazen +28 gün kazandırır. Pencere şeridi tam bunu gösterir.",
  },
  {
    icon: CalendarDays,
    title: "Tek takvim",
    body: "Tüm kartların kesim ve son ödeme tarihleri tek aylık görünümde. Hiçbir tarihi kaçırma.",
  },
  {
    icon: CloudUpload,
    title: "Bulut senkron",
    body: "E-postanla şifresiz giriş yap; kartların yedeklensin, telefon ve bilgisayarında eşitlensin.",
  },
];

function LandingPage() {
  const { session } = useAuth();
  const [isReturning, setIsReturning] = useState(false);
  const demoDays = interestFreeDays(DEMO_CARD, normalize(new Date())).days;

  // Vitrin herkese görünür (yönlendirme YOK). Oturum açık kullanıcıda üst bar ve
  // hero CTA'sı "Uygulamaya git"e döner.
  useEffect(() => {
    setIsReturning(Boolean(session));
  }, [session]);

  return (
    <div className="min-h-screen">
      {/* ── Üst bar ──────────────────────────────────────────────────── */}
      <header className="mx-auto flex w-full max-w-6xl items-center justify-between px-5 py-5 sm:px-8">
        <div className="flex items-center gap-2.5">
          <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-foreground text-background">
            <Compass className="h-[18px] w-[18px]" />
          </div>
          <span className="text-[17px] font-bold tracking-tight">KartPilot</span>
        </div>
        <nav className="flex items-center gap-2">
          {isReturning ? (
            <Button asChild size="sm" className="font-semibold">
              <Link to="/uygulama">Uygulamaya git</Link>
            </Button>
          ) : (
            <>
              <Button asChild variant="ghost" size="sm">
                <Link to="/giris" search={{ mode: "giris" }}>
                  Giriş yap
                </Link>
              </Button>
              <Button asChild size="sm" className="font-semibold">
                <Link to="/giris" search={{ mode: "kayit" }}>
                  Kayıt ol
                </Link>
              </Button>
            </>
          )}
        </nav>
      </header>

      <main>
        {/* ── Hero ─────────────────────────────────────────────────────── */}
        <section className="mx-auto grid w-full max-w-6xl items-center gap-12 px-5 pb-20 pt-10 sm:px-8 lg:grid-cols-2 lg:pt-20">
          <div className="animate-rise">
            <p className="tabular text-[11px] uppercase tracking-[0.32em] text-muted-foreground">
              Kredi kartı asistanı
            </p>
            <h1 className="font-display mt-3 text-[44px] leading-[1.04] sm:text-[56px] lg:text-[64px]">
              Doğru günde
              <br />
              doğru kart.
            </h1>
            <p className="mt-5 max-w-md text-[17px] leading-relaxed text-muted-foreground">
              Aynı kart, kesimden bir gün önce 11 gün, bir gün sonra 39 gün faizsiz. KartPilot her
              harcamada hangi kartı kullanacağını söyler — sen sadece onayla.
            </p>
            <div className="mt-7 flex flex-wrap items-center gap-3">
              {isReturning ? (
                <Button asChild className="h-12 px-7 text-base font-semibold">
                  <Link to="/uygulama">
                    Uygulamaya git <ArrowRight className="ml-1.5 h-4 w-4" />
                  </Link>
                </Button>
              ) : (
                <Button asChild className="h-12 px-7 text-base font-semibold">
                  <Link to="/giris" search={{ mode: "kayit" }}>
                    Ücretsiz başla <ArrowRight className="ml-1.5 h-4 w-4" />
                  </Link>
                </Button>
              )}
              <Button asChild variant="outline" className="h-12 px-6 text-base">
                <a href="#nasil">Nasıl çalışır?</a>
              </Button>
            </div>
            <p className="mt-5 flex items-center gap-2 text-[13px] text-muted-foreground">
              <ShieldCheck className="h-4 w-4 text-success" />
              Kart numarası, CVV, şifre — hiçbirini istemiyoruz.
            </p>
          </div>

          {/* Gerçek üründen canlı demo paneli */}
          <div className="panel animate-rise p-6 lg:p-7" style={{ animationDelay: "100ms" }}>
            <div className="flex items-center justify-between gap-3">
              <p className="tabular text-[11px] uppercase tracking-[0.28em] text-muted-foreground">
                Bugünün kartı
              </p>
              <span className="tabular rounded-full border border-border bg-muted/60 px-2.5 py-1 text-[10px] uppercase tracking-widest text-muted-foreground">
                Örnek
              </span>
            </div>
            <h2 className="mt-3 text-xl font-bold tracking-tight">Garanti Bonus</h2>
            <div className="mt-2">
              <Gauge days={demoDays} />
            </div>
            <div className="mt-5 border-t border-border pt-4">
              <p className="tabular mb-2 text-[10px] uppercase tracking-[0.2em] text-muted-foreground">
                30 günlük pencere — beklersen ne kazanırsın
              </p>
              <DayStrip card={DEMO_CARD} />
            </div>
          </div>
        </section>

        {/* ── Nasıl çalışır ───────────────────────────────────────────── */}
        <section id="nasil" className="border-t border-border bg-surface/60">
          <div className="mx-auto w-full max-w-6xl px-5 py-16 sm:px-8 lg:py-20">
            <h2 className="font-display text-[32px] leading-tight lg:text-[40px]">
              Üç adımda kurulur.
            </h2>
            <div className="mt-8 grid gap-4 md:grid-cols-3">
              {STEPS.map((s, i) => {
                const Icon = s.icon;
                return (
                  <div key={s.title} className="panel p-6">
                    <div className="flex items-center justify-between">
                      <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary/10">
                        <Icon className="h-5 w-5 text-primary" />
                      </div>
                      <span className="tabular text-[13px] text-muted-foreground">
                        0{i + 1} / 03
                      </span>
                    </div>
                    <h3 className="mt-4 text-[17px] font-bold tracking-tight">{s.title}</h3>
                    <p className="mt-2 text-sm leading-relaxed text-muted-foreground">{s.body}</p>
                  </div>
                );
              })}
            </div>
          </div>
        </section>

        {/* ── Özellikler ──────────────────────────────────────────────── */}
        <section className="mx-auto w-full max-w-6xl px-5 py-16 sm:px-8 lg:py-20">
          <h2 className="font-display text-[32px] leading-tight lg:text-[40px]">
            Kart yönetimi, kokpit netliğinde.
          </h2>
          <div className="mt-8 grid gap-4 sm:grid-cols-2">
            {FEATURES.map((f) => {
              const Icon = f.icon;
              return (
                <div key={f.title} className="panel p-6">
                  <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-success/10">
                    <Icon className="h-5 w-5 text-success" />
                  </div>
                  <h3 className="mt-4 text-[17px] font-bold tracking-tight">{f.title}</h3>
                  <p className="mt-2 text-sm leading-relaxed text-muted-foreground">{f.body}</p>
                </div>
              );
            })}
          </div>
        </section>

        {/* ── Kayıt CTA ───────────────────────────────────────────────── */}
        <section id="kayit" className="border-t border-border bg-surface/60">
          <div className="mx-auto flex w-full max-w-3xl flex-col items-center px-5 py-16 text-center sm:px-8 lg:py-20">
            <h2 className="font-display text-[32px] leading-tight lg:text-[40px]">
              Hesabını aç, kartların seninle gelsin.
            </h2>
            <p className="mt-3 max-w-md text-[15px] text-muted-foreground">
              Kayıt ol; kartların buluta yedeklensin, telefon ve bilgisayar arasında eşitlensin.
              İstersen hesapsız, tamamen cihazında da kullanabilirsin.
            </p>
            <div className="mt-7 flex flex-wrap items-center justify-center gap-3">
              <Button asChild className="h-12 px-7 text-base font-semibold">
                <Link to="/giris" search={{ mode: "kayit" }}>
                  Kayıt ol <ArrowRight className="ml-1.5 h-4 w-4" />
                </Link>
              </Button>
              <Button asChild variant="outline" className="h-12 px-6 text-base">
                <Link to="/giris" search={{ mode: "giris" }}>
                  Zaten hesabım var
                </Link>
              </Button>
            </div>
          </div>
        </section>
      </main>

      {/* ── Alt bilgi ─────────────────────────────────────────────────── */}
      <footer className="border-t border-border">
        <div className="mx-auto w-full max-w-6xl px-5 py-8 sm:px-8">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <p className="tabular text-[11px] uppercase tracking-widest text-muted-foreground">
              © 2026 KartPilot
            </p>
            <Link
              to="/uygulama"
              className="text-[13px] text-muted-foreground underline-offset-2 hover:text-foreground hover:underline"
            >
              Uygulamayı aç
            </Link>
          </div>
          <p className="mt-4 max-w-3xl text-[11px] leading-relaxed text-muted-foreground/80">
            KartPilot bir bankacılık veya finansal danışmanlık hizmeti değildir. Hesaplamalar
            girdiğiniz tarihlere dayanan tahminlerdir; bankanızın ekstresi esastır. Faizsiz
            kullanım, dönem borcunun son ödeme tarihine kadar tamamının ödenmesi koşuluna bağlıdır.
          </p>
        </div>
      </footer>
    </div>
  );
}
