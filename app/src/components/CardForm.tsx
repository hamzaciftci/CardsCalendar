import { useEffect, useState } from "react";
import type { Card } from "@/engine";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from "@/components/ui/select";
import { PRESET_COLORS, TR_BANKS, computeGraceDays, dueDayFromStatement } from "@/lib/storage";
import { Lock } from "lucide-react";

export interface CardFormValues extends Omit<Card, "graceDays"> {
  dueDay: number;
}

export function CardForm({
  initial,
  onSubmit,
  onCancel,
  submitLabel = "Kaydet",
}: {
  initial?: Card;
  onSubmit: (c: Card) => void;
  onCancel: () => void;
  submitLabel?: string;
}) {
  const [name, setName] = useState(initial?.name ?? "");
  const [bankName, setBankName] = useState(initial?.bankName ?? TR_BANKS[0]);
  const [statementDay, setStatementDay] = useState<number>(initial?.statementDay ?? 1);
  const [dueDay, setDueDay] = useState<number>(
    initial ? ((initial.statementDay + initial.graceDays - 1) % 30) + 1 : dueDayFromStatement(1),
  );
  const [totalLimit, setTotalLimit] = useState<string>(
    initial?.totalLimit != null ? String(initial.totalLimit) : "",
  );
  const [availableLimit, setAvailableLimit] = useState<string>(
    initial?.availableLimit != null ? String(initial.availableLimit) : "",
  );
  const [isActive, setIsActive] = useState<boolean>(initial?.isActive ?? true);
  const [color, setColor] = useState<string>(initial?.color ?? PRESET_COLORS[0]);
  const [dueTouched, setDueTouched] = useState<boolean>(!!initial);

  useEffect(() => {
    if (!dueTouched) setDueDay(dueDayFromStatement(statementDay));
  }, [statementDay, dueTouched]);

  const grace = computeGraceDays(statementDay, dueDay);
  const total = totalLimit ? Number(totalLimit) : undefined;
  const avail = availableLimit ? Number(availableLimit) : undefined;

  const errors: string[] = [];
  const warnings: string[] = [];
  if (!name.trim()) errors.push("Kart adı zorunlu.");
  if (total != null && avail != null && avail > total)
    errors.push("Kullanılabilir limit, toplam limitten büyük olamaz.");
  if (grace < 10)
    warnings.push("Türkiye'de son ödeme, kesimden en az 10 gün sonradır — ekstrenden kontrol et.");

  const canSave = errors.length === 0;

  const submit = () => {
    if (!canSave) return;
    onSubmit({
      id: initial?.id ?? crypto.randomUUID(),
      name: name.trim(),
      bankName,
      color,
      statementDay,
      graceDays: grace,
      totalLimit: total,
      availableLimit: avail,
      isActive,
      carriesDebt: initial?.carriesDebt,
    });
  };

  return (
    <div className="space-y-5 px-5 pb-8">
      <div className="flex items-start gap-2 rounded-xl bg-success/10 p-3 text-[12px] text-success-foreground/90">
        <Lock className="mt-0.5 h-4 w-4 flex-none text-success" />
        <p>
          <span className="font-semibold text-success">Bu formda kart numarası alanı yok — bilerek.</span>{" "}
          Kart numaranı, CVV'ni, banka şifreni asla istemeyiz.
        </p>
      </div>

      <Field label="Banka">
        <Select value={bankName} onValueChange={setBankName}>
          <SelectTrigger><SelectValue /></SelectTrigger>
          <SelectContent>
            {TR_BANKS.map((b) => <SelectItem key={b} value={b}>{b}</SelectItem>)}
          </SelectContent>
        </Select>
      </Field>

      <Field label="Kart adı">
        <Input
          placeholder="Örn. Bonus, Axess"
          value={name}
          onChange={(e) => setName(e.target.value)}
        />
      </Field>

      <div className="grid grid-cols-2 gap-3">
        <Field
          label="Hesap kesim günü"
          helper="Ekstrenin kesildiği gün. Son ekstrenin üstünde yazar."
        >
          <DayPicker value={statementDay} onChange={setStatementDay} />
        </Field>
        <Field
          label="Son ödeme günü"
          helper="Çoğu bankada son ödeme, kesimden 10 gün sonradır."
        >
          <DayPicker
            value={dueDay}
            onChange={(v) => { setDueDay(v); setDueTouched(true); }}
          />
        </Field>
      </div>

      <p className="-mt-2 text-[11px] text-muted-foreground tabular">
        Faizsiz süre hesabı: kesim + {grace} gün
      </p>

      <div className="grid grid-cols-2 gap-3">
        <Field label="Toplam limit (₺) — opsiyonel">
          <Input inputMode="numeric" value={totalLimit} onChange={(e) => setTotalLimit(e.target.value.replace(/\D/g, ""))} placeholder="0" />
        </Field>
        <Field label="Kullanılabilir limit (₺) — opsiyonel">
          <Input inputMode="numeric" value={availableLimit} onChange={(e) => setAvailableLimit(e.target.value.replace(/\D/g, ""))} placeholder="0" />
        </Field>
      </div>

      <Field label="Kart rengi">
        <div className="flex flex-wrap gap-2">
          {PRESET_COLORS.map((c) => (
            <button
              key={c}
              type="button"
              onClick={() => setColor(c)}
              className={
                "h-9 w-9 rounded-full ring-2 ring-offset-2 ring-offset-background transition " +
                (c === color ? "ring-foreground" : "ring-transparent")
              }
              style={{ backgroundColor: c }}
              aria-label={c}
            />
          ))}
        </div>
      </Field>

      <div className="flex items-center justify-between rounded-xl bg-surface px-4 py-3 shadow-soft">
        <div>
          <p className="text-sm font-medium">Aktif</p>
          <p className="text-xs text-muted-foreground">Pasif kartlar önerilerde çıkmaz.</p>
        </div>
        <Switch checked={isActive} onCheckedChange={setIsActive} />
      </div>

      {warnings.map((w, i) => (
        <p key={i} className="rounded-xl bg-warning/15 px-3 py-2 text-[12px] text-warning-foreground">
          {w}
        </p>
      ))}
      {errors.map((e, i) => (
        <p key={i} className="rounded-xl bg-destructive/15 px-3 py-2 text-[12px] text-destructive">
          {e}
        </p>
      ))}

      <div className="flex gap-2 pt-2">
        <Button variant="outline" className="flex-1" onClick={onCancel}>İptal</Button>
        <Button className="flex-1" onClick={submit} disabled={!canSave}>{submitLabel}</Button>
      </div>
    </div>
  );
}

function Field({ label, helper, children }: { label: string; helper?: string; children: React.ReactNode }) {
  return (
    <div className="space-y-1.5">
      <Label className="text-[12px] font-medium text-muted-foreground">{label}</Label>
      {children}
      {helper && <p className="text-[11px] text-muted-foreground">{helper}</p>}
    </div>
  );
}

function DayPicker({ value, onChange }: { value: number; onChange: (n: number) => void }) {
  return (
    <Select value={String(value)} onValueChange={(v) => onChange(Number(v))}>
      <SelectTrigger><SelectValue /></SelectTrigger>
      <SelectContent className="max-h-72">
        {Array.from({ length: 31 }, (_, i) => i + 1).map((d) => (
          <SelectItem key={d} value={String(d)}>{d}</SelectItem>
        ))}
      </SelectContent>
    </Select>
  );
}
