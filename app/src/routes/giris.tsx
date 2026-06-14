import { createFileRoute, Link, useRouter } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { useAuth } from "@/hooks/use-auth";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ArrowRight, Compass, Mail, ShieldCheck } from "lucide-react";

type Mode = "giris" | "kayit";

export const Route = createFileRoute("/giris")({
  validateSearch: (search: Record<string, unknown>): { mode: Mode } => ({
    mode: search.mode === "kayit" ? "kayit" : "giris",
  }),
  head: () => ({
    meta: [
      { title: "Giriş yap — KartPilot" },
      {
        name: "description",
        content: "KartPilot hesabına e-posta ile şifresiz giriş yap ya da saniyeler içinde kaydol.",
      },
    ],
  }),
  component: AuthPage,
});

function AuthPage() {
  const { mode } = Route.useSearch();
  const router = useRouter();
  const { session, enabled, signInWithEmail, verifyOtp } = useAuth();
  const [mounted, setMounted] = useState(false);
  const [email, setEmail] = useState("");
  const [code, setCode] = useState("");
  const [state, setState] = useState<
    "idle" | "sending" | "sent" | "error" | "verifying" | "verifyError"
  >("idle");

  useEffect(() => setMounted(true), []);

  // Zaten oturum açıksa doğrudan uygulamaya al
  useEffect(() => {
    if (session) void router.navigate({ to: "/uygulama", replace: true });
  }, [session, router]);

  const isKayit = mode === "kayit";
  const cloudOff = mounted && !enabled;

  const send = async () => {
    if (!email.includes("@")) return;
    setState("sending");
    const { error } = await signInWithEmail(email.trim());
    setState(error ? "error" : "sent");
  };

  const verify = async () => {
    if (code.trim().length < 6) return;
    setState("verifying");
    const { error } = await verifyOtp(email.trim(), code.trim());
    // Başarılıysa onAuthStateChange oturumu set eder → yukarıdaki effect
    // kullanıcıyı /uygulama'ya götürür. Hatada kod adımında kal.
    if (error) setState("verifyError");
  };

  const codeStep = state === "sent" || state === "verifying" || state === "verifyError";

  const tab = (active: boolean) =>
    "rounded-lg px-3 py-2 text-center text-sm font-medium transition-colors " +
    (active
      ? "bg-surface text-foreground shadow-[0_1px_2px_rgb(16_24_40_/_0.05)]"
      : "text-muted-foreground hover:text-foreground");

  return (
    <div className="flex min-h-screen flex-col">
      <header className="mx-auto flex w-full max-w-6xl items-center px-5 py-5 sm:px-8">
        <Link to="/" className="flex items-center gap-2.5">
          <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-foreground text-background">
            <Compass className="h-[18px] w-[18px]" />
          </div>
          <span className="text-[17px] font-bold tracking-tight">KartPilot</span>
        </Link>
      </header>

      <main className="flex flex-1 items-center justify-center px-5 pb-20">
        <div className="w-full max-w-md">
          <div className="panel animate-rise p-6 sm:p-8">
            {codeStep ? (
              <div>
                <div className="text-center">
                  <div className="mx-auto mb-5 flex h-14 w-14 items-center justify-center rounded-2xl bg-primary/10 text-primary">
                    <Mail className="h-7 w-7" />
                  </div>
                  <h1 className="font-display text-[28px] leading-tight">
                    E-postana kod gönderdik
                  </h1>
                  <p className="mt-2 text-sm text-muted-foreground">
                    <span className="font-semibold text-foreground">{email}</span> adresine 6 haneli
                    bir kod gönderdik. Kodu aşağıya gir. (Bilgisayardaysan e-postadaki bağlantıya da
                    tıklayabilirsin.)
                  </p>
                </div>

                <div className="mt-5 space-y-2.5">
                  <Input
                    inputMode="numeric"
                    autoComplete="one-time-code"
                    maxLength={6}
                    placeholder="6 haneli kod"
                    value={code}
                    onChange={(e) => setCode(e.target.value.replace(/\D/g, "").slice(0, 6))}
                    onKeyDown={(e) => e.key === "Enter" && void verify()}
                    className="tabular h-12 bg-surface text-center text-lg tracking-[0.4em]"
                  />
                  <Button
                    className="h-12 w-full text-base font-semibold"
                    disabled={code.length < 6 || state === "verifying"}
                    onClick={() => void verify()}
                  >
                    {state === "verifying" ? "Doğrulanıyor…" : "Doğrula ve gir"}
                    {state !== "verifying" && <ArrowRight className="ml-1.5 h-4 w-4" />}
                  </Button>
                </div>

                {state === "verifyError" && (
                  <p className="mt-2 text-[12px] text-destructive">
                    Kod hatalı veya süresi dolmuş — tekrar dene ya da yeni kod iste.
                  </p>
                )}

                <button
                  type="button"
                  onClick={() => {
                    setState("idle");
                    setCode("");
                  }}
                  className="mt-5 block w-full text-center text-[13px] text-muted-foreground underline underline-offset-2 hover:text-foreground"
                >
                  Farklı bir e-posta dene
                </button>
              </div>
            ) : (
              <>
                <div className="grid grid-cols-2 gap-1 rounded-xl border border-border bg-muted/50 p-1">
                  <Link to="/giris" search={{ mode: "giris" }} className={tab(!isKayit)}>
                    Giriş yap
                  </Link>
                  <Link to="/giris" search={{ mode: "kayit" }} className={tab(isKayit)}>
                    Kayıt ol
                  </Link>
                </div>

                <h1 className="font-display mt-6 text-[28px] leading-tight">
                  {isKayit ? "Hesap oluştur" : "Tekrar hoş geldin"}
                </h1>
                <p className="mt-1.5 text-sm text-muted-foreground">
                  E-postana tek kullanımlık bir kod (ve bağlantı) göndeririz — şifre yok,
                  ezberlenecek bir şey yok.
                </p>

                <div className="mt-5 space-y-2.5">
                  <Input
                    type="email"
                    inputMode="email"
                    autoComplete="email"
                    placeholder="e-posta adresin"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    onKeyDown={(e) => e.key === "Enter" && void send()}
                    disabled={cloudOff}
                    className="h-12 bg-surface text-base"
                  />
                  <Button
                    className="h-12 w-full text-base font-semibold"
                    disabled={cloudOff || state === "sending" || !email.includes("@")}
                    onClick={() => void send()}
                  >
                    {state === "sending"
                      ? "Gönderiliyor…"
                      : isKayit
                        ? "Kayıt kodu gönder"
                        : "Giriş kodu gönder"}
                    {state !== "sending" && <ArrowRight className="ml-1.5 h-4 w-4" />}
                  </Button>
                </div>

                {state === "error" && (
                  <p className="mt-2 text-[12px] text-destructive">
                    Bağlantı gönderilemedi — adresi kontrol edip tekrar dene.
                  </p>
                )}

                {cloudOff && (
                  <p className="mt-3 rounded-lg bg-warning/15 px-3 py-2 text-[12px] text-warning-foreground">
                    Giriş servisi şu an yapılandırılıyor; çok yakında aktif olacak.
                  </p>
                )}

                <p className="mt-4 text-center text-[11px] leading-relaxed text-muted-foreground">
                  Devam ederek kart verilerinin hesabında saklanmasını kabul etmiş olursun. Kart
                  numarası, CVV veya şifre istemiyoruz.
                </p>
              </>
            )}
          </div>

          <p className="mt-4 flex items-center justify-center gap-1.5 text-[12px] text-muted-foreground">
            <ShieldCheck className="h-4 w-4 text-success" />
            Kart numarası, CVV, şifre — hiçbirini istemiyoruz.
          </p>
        </div>
      </main>
    </div>
  );
}
