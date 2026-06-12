import { useState } from "react";
import { setOnboarded } from "@/lib/storage";
import { Button } from "@/components/ui/button";
import { ShieldCheck, Compass, CreditCard } from "lucide-react";

export function Onboarding({ onDone }: { onDone: () => void }) {
  const [step, setStep] = useState(0);

  const finish = () => {
    setOnboarded();
    onDone();
  };

  const slides = [
    {
      icon: <Compass className="h-14 w-14 text-primary" />,
      title: "Hangi kartla ne zaman?",
      body: "KartPilot, her güne en uzun faizsiz süreyi öneren küçük asistanın. Kart ekle, sor, kazan.",
      cta: "Devam et",
    },
    {
      icon: <ShieldCheck className="h-14 w-14 text-success" />,
      title: "Kart numaranı asla istemiyoruz",
      body: "Bu uygulama harcama yapamaz, çünkü harcamaya yarayan hiçbir bilgiyi tutmuyor. Sadece kart adı, banka ve tarihler — o kadar.",
      cta: "Anladım",
    },
    {
      icon: <CreditCard className="h-14 w-14 text-primary" />,
      title: "Hadi başlayalım",
      body: "Üç örnek kartla başlattık. Düzenleyebilir, silebilir ya da kendi kartlarını ekleyebilirsin.",
      cta: "İlk kartını ekle",
    },
  ];

  const s = slides[step];

  return (
    <div className="fixed inset-0 z-50 flex flex-col bg-background">
      <button
        onClick={finish}
        className="tabular absolute right-5 top-5 text-[11px] uppercase tracking-widest text-muted-foreground hover:text-foreground"
      >
        Geç
      </button>
      <div
        key={step}
        className="animate-rise flex flex-1 flex-col items-center justify-center px-8 text-center"
      >
        <div className="shadow-soft mb-7 flex h-28 w-28 items-center justify-center rounded-3xl border border-border bg-surface">
          {s.icon}
        </div>
        <h2 className="max-w-sm text-[26px] font-bold leading-tight tracking-tight">{s.title}</h2>
        <p className="mt-3 max-w-xs text-[15px] leading-relaxed text-muted-foreground">{s.body}</p>
      </div>
      <div className="mx-auto w-full max-w-md px-6 pb-10">
        <div className="mb-5 flex justify-center gap-1.5">
          {slides.map((_, i) => (
            <span
              key={i}
              className={
                "h-1.5 rounded-full transition-[width,background-color,box-shadow] duration-200 ease-out " +
                (i === step ? "w-7 bg-primary" : "w-1.5 bg-border")
              }
            />
          ))}
        </div>
        <Button
          className="h-12 w-full text-base font-semibold"
          onClick={() => (step === slides.length - 1 ? finish() : setStep(step + 1))}
        >
          {s.cta}
        </Button>
      </div>
    </div>
  );
}
