import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { useCards } from "@/hooks/use-cards";
import { useAuth } from "@/hooks/use-auth";
import { deleteAllCloudCards } from "@/lib/cloud";
import { PageHeader } from "@/components/PageHeader";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { clearAll } from "@/lib/storage";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { CloudUpload, Download, LogOut, ShieldCheck, Trash2 } from "lucide-react";

export const Route = createFileRoute("/ayarlar")({
  head: () => ({
    meta: [
      { title: "Ayarlar — KartPilot" },
      {
        name: "description",
        content: "Hesabını yönet, verilerini indir veya sil. Veri sözümüz ve sorumluluk reddi.",
      },
      { property: "og:title", content: "Ayarlar — KartPilot" },
      { property: "og:description", content: "Hesap, veri sözümüz, indirme ve silme." },
    ],
  }),
  component: SettingsPage,
});

/** Hesap + bulut senkron paneli (Supabase yapılandırılmışsa görünür) */
function AccountPanel() {
  const { session, signInWithEmail, signOut, enabled } = useAuth();
  const [mounted, setMounted] = useState(false);
  const [email, setEmail] = useState("");
  const [state, setState] = useState<"idle" | "sending" | "sent" | "error">("idle");

  useEffect(() => setMounted(true), []);
  if (!mounted || !enabled) return null;

  const send = async () => {
    if (!email.includes("@")) return;
    setState("sending");
    const { error } = await signInWithEmail(email.trim());
    setState(error ? "error" : "sent");
  };

  return (
    <section className="panel animate-rise p-5 lg:col-span-2">
      <p className="tabular text-[11px] uppercase tracking-[0.28em] text-muted-foreground">Hesap</p>

      {session ? (
        <div className="mt-3 flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 flex-none items-center justify-center rounded-xl bg-success/10">
              <CloudUpload className="h-5 w-5 text-success" />
            </div>
            <div>
              <p className="text-sm font-semibold">{session.user.email}</p>
              <p className="text-[12px] text-muted-foreground">
                Bulut senkron açık — kartların bu hesaba yedekleniyor.
              </p>
            </div>
          </div>
          <Button variant="outline" size="sm" onClick={() => void signOut()}>
            <LogOut className="mr-1.5 h-4 w-4" /> Çıkış yap
          </Button>
        </div>
      ) : state === "sent" ? (
        <p className="mt-3 text-sm">
          Giriş bağlantısı gönderildi — <span className="font-semibold">{email}</span> gelen
          kutusunu kontrol et. Bağlantıya tıkladığında kartların bu hesaba eşitlenmeye başlar.
        </p>
      ) : (
        <div className="mt-3">
          <p className="text-sm text-muted-foreground">
            Kartlarını bulutta yedekle, telefon ve bilgisayar arasında eşitle. Şifre yok — e-postana
            tek kullanımlık giriş bağlantısı göndeririz.
          </p>
          <div className="mt-3 flex max-w-md gap-2">
            <Input
              type="email"
              inputMode="email"
              placeholder="e-posta adresin"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && void send()}
              className="h-10"
            />
            <Button
              className="h-10 flex-none font-semibold"
              disabled={state === "sending" || !email.includes("@")}
              onClick={() => void send()}
            >
              {state === "sending" ? "Gönderiliyor…" : "Bağlantı gönder"}
            </Button>
          </div>
          {state === "error" && (
            <p className="mt-2 text-[12px] text-destructive">
              Bağlantı gönderilemedi — adresi kontrol edip tekrar dene.
            </p>
          )}
          <p className="mt-2 text-[11px] text-muted-foreground">
            Bağlantı isteyerek kart verilerinin hesabında saklanmasını kabul etmiş olursun.
          </p>
        </div>
      )}
    </section>
  );
}

function SettingsPage() {
  const { cards } = useCards();
  const { session } = useAuth();
  const [step, setStep] = useState<0 | 1 | 2>(0);

  const download = () => {
    const blob = new Blob([JSON.stringify(cards, null, 2)], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `kartpilot-${new Date().toISOString().slice(0, 10)}.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const deleteAll = async () => {
    if (session) await deleteAllCloudCards(session.user.id);
    clearAll();
    location.reload();
  };

  return (
    <div>
      <PageHeader title="Ayarlar" />

      <div className="grid items-start gap-5 lg:grid-cols-2">
        <AccountPanel />

        <section className="panel animate-rise p-5" style={{ animationDelay: "60ms" }}>
          <p className="tabular text-[11px] uppercase tracking-[0.28em] text-muted-foreground">
            Veriler
          </p>
          <div className="mt-3 space-y-2">
            <Button variant="outline" className="w-full justify-start" onClick={download}>
              <Download className="mr-2 h-4 w-4" /> Verilerimi indir (JSON)
            </Button>
            <Button
              variant="ghost"
              className="w-full justify-start text-destructive hover:bg-destructive/10 hover:text-destructive"
              onClick={() => setStep(1)}
            >
              <Trash2 className="mr-2 h-4 w-4" /> Tüm verilerimi sil
            </Button>
          </div>
          <p className="mt-3 text-[12px] leading-relaxed text-muted-foreground">
            Hesap açmadıysan verilerin yalnızca bu cihazda tutulur; dilediğin an indirebilir ya da
            kalıcı olarak silebilirsin.
          </p>
        </section>

        <section className="panel animate-rise p-5" style={{ animationDelay: "120ms" }}>
          <p className="tabular text-[11px] uppercase tracking-[0.28em] text-muted-foreground">
            Veri Sözümüz
          </p>
          <div className="mt-3 flex items-start gap-3">
            <div className="flex h-10 w-10 flex-none items-center justify-center rounded-xl bg-success/10">
              <ShieldCheck className="h-5 w-5 text-success" />
            </div>
            <div className="space-y-2 text-[13px] leading-relaxed">
              <p>
                <span className="font-semibold">Ne topluyoruz?</span> Kart adı, banka, kesim ve
                ödeme günleri, istersen limitler.
              </p>
              <p>
                <span className="font-semibold">Ne toplamıyoruz?</span> Kart numarası, CVV, şifre,
                SMS.
              </p>
              <p className="text-muted-foreground">
                Bu uygulamayla kartından harcama yapılamaz — çünkü harcamaya yarayan hiçbir bilgi
                bizde yok.
              </p>
            </div>
          </div>
        </section>

        <section
          className="panel animate-rise p-5 lg:col-span-2"
          style={{ animationDelay: "180ms" }}
        >
          <p className="tabular text-[11px] uppercase tracking-[0.28em] text-muted-foreground">
            Sorumluluk Reddi
          </p>
          <p className="mt-3 text-[12px] leading-relaxed text-muted-foreground">
            KartPilot bir bankacılık veya finansal danışmanlık hizmeti değildir. Hesaplamalar
            girdiğiniz tarihlere dayanan tahminlerdir; bankanızın ekstresi esastır.
          </p>
        </section>
      </div>

      <p className="tabular mt-8 text-center text-[10px] uppercase tracking-widest text-muted-foreground/70">
        KartPilot v1.1
      </p>

      <AlertDialog open={step === 1} onOpenChange={(o) => !o && setStep(0)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Tüm verilerini silmek istediğine emin misin?</AlertDialogTitle>
            <AlertDialogDescription>
              {session
                ? "Kartların hem bu cihazdan hem de bulut hesabından silinecek."
                : "Kartların, tarihlerin ve ayarların tamamı bu cihazdan silinecek."}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Vazgeç</AlertDialogCancel>
            <AlertDialogAction
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
              onClick={() => setStep(2)}
            >
              Devam et
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      <AlertDialog open={step === 2} onOpenChange={(o) => !o && setStep(0)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Son onay</AlertDialogTitle>
            <AlertDialogDescription>
              Bu işlem geri alınamaz. Tüm verilerini şimdi silmek istiyor musun?
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Vazgeç</AlertDialogCancel>
            <AlertDialogAction
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
              onClick={() => void deleteAll()}
            >
              Evet, sil
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
