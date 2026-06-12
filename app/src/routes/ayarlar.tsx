import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { useCards } from "@/hooks/use-cards";
import { PageHeader } from "@/components/PageHeader";
import { Button } from "@/components/ui/button";
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
import { Download, ShieldCheck, Trash2 } from "lucide-react";

export const Route = createFileRoute("/ayarlar")({
  head: () => ({
    meta: [
      { title: "Ayarlar — KartPilot" },
      {
        name: "description",
        content: "Verilerini indir veya sil. Veri sözümüz ve sorumluluk reddini oku.",
      },
      { property: "og:title", content: "Ayarlar — KartPilot" },
      { property: "og:description", content: "Veri sözümüz, indirme ve silme." },
    ],
  }),
  component: SettingsPage,
});

function SettingsPage() {
  const { cards } = useCards();
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

  const deleteAll = () => {
    clearAll();
    location.reload();
  };

  return (
    <div>
      <PageHeader title="Ayarlar" />

      <div className="grid items-start gap-5 lg:grid-cols-2">
        <section className="panel animate-rise p-5" style={{ animationDelay: "80ms" }}>
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
            Verilerin yalnızca bu cihazda tutulur; dilediğin an indirebilir ya da kalıcı olarak
            silebilirsin.
          </p>
        </section>

        <section className="panel animate-rise p-5" style={{ animationDelay: "140ms" }}>
          <p className="tabular text-[11px] uppercase tracking-[0.28em] text-muted-foreground">
            Veri Sözümüz
          </p>
          <div className="mt-3 flex items-start gap-3">
            <div className="flex h-10 w-10 flex-none items-center justify-center rounded-xl bg-success/15 shadow-[0_0_22px_rgb(43_227_164_/_0.2)]">
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
          style={{ animationDelay: "200ms" }}
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
        KartPilot v1.0 · gece uçuşu
      </p>

      <AlertDialog open={step === 1} onOpenChange={(o) => !o && setStep(0)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Tüm verilerini silmek istediğine emin misin?</AlertDialogTitle>
            <AlertDialogDescription>
              Kartların, tarihlerin ve ayarların tamamı bu cihazdan silinecek.
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
              onClick={deleteAll}
            >
              Evet, sil
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
