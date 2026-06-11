# KartPilot — AI Araçları için Başlangıç Promptu

> **Nasıl kullanılır:** Aşağıdaki promptu olduğu gibi kopyalayıp Lovable'a (veya Bolt/Replit'e) ilk mesaj olarak yapıştır. Prompt İngilizce (AI araçları İngilizce promptla daha tutarlı sonuç verir), üreteceği arayüz metinleri Türkçe olacak. İçindeki `engine` kodu **hazır ve test edilmiş mantıktır** — araca "bu dosyaları aynen kullan, değiştirme" talimatı verilmiştir; tarih matematiğini AI'ın kendisinin kurmasına izin verme.
>
> Önerilen sıra: önce bu promptu gönder → çıkan uygulamada kart ekleyip Bölüm "Acceptance tests" senaryolarını elle doğrula → sonra ekran ekran iyileştirme istekleri gönder (her mesajda tek konu).

---

```
You are building "KartPilot", a Turkish web app (PWA-ready) that tells users which
credit card to spend with on any given day to maximize the interest-free period.

LANGUAGE: All UI text must be in TURKISH. Code, comments and variable names in English.
Currency formatting: tr-TR locale, ₺ symbol, thousands separator (8.000 ₺).
Dates shown to users: "12 Haziran 2026" format. Timezone: Europe/Istanbul.

=====================================================================
1. CORE CONCEPT
=====================================================================
Turkish credit cards have a statement date (hesap kesim tarihi) and a due date
(son ödeme tarihi, typically statement + 10 days). A purchase made right AFTER
the statement date lands on the NEXT statement, giving up to ~40 interest-free
days. A purchase right BEFORE the statement date gives only ~10-11 days.
KartPilot stores each card's statement day and grace period, then recommends
the best card for a given amount and date.

CRITICAL TRUST RULE: The app NEVER asks for card number, CVV, expiry date or
banking passwords. There must be no such fields anywhere. Only: card name, bank
name, statement day (1-31), due day, optional total limit, optional available
limit, active flag.

=====================================================================
2. TECH STACK & CONSTRAINTS
=====================================================================
- React + TypeScript + Tailwind + shadcn/ui. Vite or Next.js (your default).
- State: keep it simple (React state + localStorage). No Redux.
- GUEST-FIRST: app fully works WITHOUT signup, storing data in localStorage
  under key "kartpilot.cards.v1". (Supabase auth/sync can be added later —
  do not build it now.)
- Mobile-first responsive layout, max content width 480px centered on desktop.
- No backend calls for calculations: the engine below runs client-side.
- Do NOT add: charts libraries, i18n frameworks, analytics, bank logos,
  camera/OCR, any payment processing.

=====================================================================
3. THE CALCULATION ENGINE — USE EXACTLY AS GIVEN, DO NOT MODIFY LOGIC
=====================================================================
Create file src/engine/index.ts with EXACTLY this content:

----------------------------------------------------------------------
// KartPilot calculation engine v1.0 — pure functions, no UI imports.
// Conservative rule: a purchase made ON the statement day is assumed to land
// on THAT statement (worst case). All dates normalized to local midnight.

export interface Card {
  id: string;
  name: string;
  bankName: string;
  color: string;            // hex, used as the card's identity color
  totalLimit?: number;
  availableLimit?: number;
  statementDay: number;     // 1-31
  graceDays: number;        // dueDate - statementDate in days (TR minimum 10)
  isActive: boolean;
  carriesDebt?: boolean;    // user-flagged revolving debt (v1.1 UI, keep in type)
}

export interface InterestFreeResult {
  cutoffDate: Date;         // statement the purchase lands on
  dueDate: Date;
  days: number;             // interest-free days from spend date
}

export function normalize(d: Date): Date {
  return new Date(d.getFullYear(), d.getMonth(), d.getDate());
}

function daysInMonth(year: number, monthIndex: number): number {
  return new Date(year, monthIndex + 1, 0).getDate();
}

// Statement day 29/30/31 falls back to the last day of short months.
function clampedDate(year: number, monthIndex: number, day: number): Date {
  return new Date(year, monthIndex, Math.min(day, daysInMonth(year, monthIndex)));
}

export function addDays(d: Date, n: number): Date {
  const r = new Date(d);
  r.setDate(r.getDate() + n);
  return r;
}

export function diffInDays(a: Date, b: Date): number {
  const MS = 86_400_000;
  return Math.round((normalize(a).getTime() - normalize(b).getTime()) / MS);
}

/** The statement a purchase lands on (conservative on the statement day itself). */
export function statementCutoffFor(spendDate: Date, statementDay: number): Date {
  const d = normalize(spendDate);
  const thisMonth = clampedDate(d.getFullYear(), d.getMonth(), statementDay);
  if (d <= thisMonth) return thisMonth;
  // JS Date auto-rolls month 12 into January of the next year.
  return clampedDate(d.getFullYear(), d.getMonth() + 1, statementDay);
}

export function interestFreeDays(
  card: Pick<Card, 'statementDay' | 'graceDays'>,
  spendDate: Date,
): InterestFreeResult {
  const cutoffDate = statementCutoffFor(spendDate, card.statementDay);
  const dueDate = addDays(cutoffDate, card.graceDays);
  return { cutoffDate, dueDate, days: diffInDays(dueDate, spendDate) };
}

export interface EngineParams {
  utilizationThreshold: number;    // 0.8
  utilizationPenaltyScale: number; // 25 → 100% utilization costs 5 days
  debtPenaltyDays: number;         // 30 → effectively disqualifies
  waitTipHorizonDays: number;      // 7
  waitTipMinGain: number;          // 5
}

export const DEFAULT_PARAMS: EngineParams = {
  utilizationThreshold: 0.8,
  utilizationPenaltyScale: 25,
  debtPenaltyDays: 30,
  waitTipHorizonDays: 7,
  waitTipMinGain: 5,
};

export interface CardRecommendation {
  card: Card;
  score: number;
  result: InterestFreeResult;
  reasons: string[];   // Turkish, shown to user
  warnings: string[];  // Turkish, shown to user
}

export interface Recommendation {
  best: CardRecommendation | null;
  alternatives: CardRecommendation[];
  excluded: { card: Card; reason: string }[];
  waitTip: { date: Date; card: Card; days: number } | null;
}

export function recommend(
  cards: Card[],
  amount: number,
  spendDate: Date,
  params: Partial<EngineParams> = {},
): Recommendation {
  const p = { ...DEFAULT_PARAMS, ...params };
  const eligible: CardRecommendation[] = [];
  const excluded: { card: Card; reason: string }[] = [];

  for (const card of cards) {
    if (!card.isActive) {
      excluded.push({ card, reason: 'Kart pasif' });
      continue;
    }
    if (card.availableLimit != null && card.availableLimit < amount) {
      excluded.push({
        card,
        reason: `Kullanılabilir limit yetersiz (${card.availableLimit.toLocaleString('tr-TR')} ₺)`,
      });
      continue;
    }

    const result = interestFreeDays(card, spendDate);
    let score = result.days;
    const reasons = [`${result.days} gün faizsiz`];
    const warnings: string[] = [];

    if (card.totalLimit && card.availableLimit != null) {
      const utilizationAfter =
        (card.totalLimit - card.availableLimit + amount) / card.totalLimit;
      if (utilizationAfter > p.utilizationThreshold) {
        score -= (utilizationAfter - p.utilizationThreshold) * p.utilizationPenaltyScale;
        warnings.push(
          `Bu harcamayla limit doluluğu %${Math.round(utilizationAfter * 100)} olur`,
        );
      }
    }

    if (card.carriesDebt) {
      score -= p.debtPenaltyDays;
      warnings.push(
        'Bu kart devreden borç taşıyor — yeni harcama fiilen faizsiz olmaz. Önce borcu kapatmanı öneririz.',
      );
    }

    eligible.push({ card, score, result, reasons, warnings });
  }

  eligible.sort(
    (a, b) =>
      b.score - a.score ||
      (b.card.availableLimit ?? 0) - (a.card.availableLimit ?? 0),
  );

  // Wait tip: would waiting up to 7 days gain ≥5 extra interest-free days?
  const todayBest = eligible[0]?.result.days ?? 0;
  let waitTip: Recommendation['waitTip'] = null;
  for (let i = 1; i <= p.waitTipHorizonDays && !waitTip; i++) {
    const date = addDays(normalize(spendDate), i);
    const future = cards
      .filter(
        (c) =>
          c.isActive &&
          !c.carriesDebt &&
          (c.availableLimit == null || c.availableLimit >= amount),
      )
      .map((c) => ({ card: c, days: interestFreeDays(c, date).days }))
      .sort((a, b) => b.days - a.days)[0];
    if (future && future.days >= todayBest + p.waitTipMinGain) {
      waitTip = { date, card: future.card, days: future.days };
    }
  }

  return { best: eligible[0] ?? null, alternatives: eligible.slice(1), excluded, waitTip };
}
// NOTE (v1.1): campaign value will be converted to "day equivalents" and added
// to score here. Do not implement now.
----------------------------------------------------------------------

ACCEPTANCE TESTS — the engine must produce exactly these results
(grace 10 days unless noted). If you support a test runner, add them as unit
tests in src/engine/index.test.ts; construct dates as new Date(y, m-1, d):

| statementDay | spend date  | expected cutoff | expected due | expected days |
|--------------|-------------|-----------------|--------------|---------------|
| 10           | 2026-06-11  | 2026-07-10      | 2026-07-20   | 39            |
| 10           | 2026-06-09  | 2026-06-10      | 2026-06-20   | 11            |
| 10           | 2026-06-10  | 2026-06-10      | 2026-06-20   | 10            |
| 31           | 2026-07-01  | 2026-07-31      | 2026-08-10   | 40            |
| 31           | 2026-06-15  | 2026-06-30      | 2026-07-10   | 25            |
| 30           | 2027-02-01  | 2027-02-28      | 2027-03-10   | 37            |
| 30           | 2028-02-01  | 2028-02-29      | 2028-03-10   | 38            |
| 5            | 2026-12-20  | 2027-01-05      | 2027-01-15   | 26            |

Also: a card with availableLimit < amount must appear in `excluded` with the
limit reason; an inactive card must be excluded as "Kart pasif".

=====================================================================
4. SCREENS (4 bottom tabs: Bugün · Kartlarım · Takvim · Ayarlar)
=====================================================================

TAB 1 — "Bugün" (home):
- Hero card: today's best card via recommend(cards, 1, today) →
  "Bugünün kartı: {name}" + huge number "{days} gün faizsiz" (48px, green).
- Amount input below: "Ne kadar harcayacaksın?" with quick chips
  1.000 / 5.000 / 10.000 / Diğer, numeric keyboard, [Hesapla] primary button.
- Result panel (after Hesapla): recommended card (name, days as big number,
  "Kesim: {date} · Son ödeme: {date}", "{month} ekstresine yansır"),
  then alternatives as smaller rows (name + days), then excluded cards in
  muted style with their Turkish reason, then waitTip if present in an info
  box: "{n} gün beklersen {card} ile {days} gün faizsiz kullanabilirsin."
- A date picker (default today) lets the user re-run for another date; when
  the date changes, results update live.
- Footer note on every result: "Tahminidir; bankanızın ekstresi esastır."
- Upcoming payments strip: any card whose dueDate (from interestFreeDays of
  its CURRENT cycle) is within 3 days → amber banner.
- Empty state (no cards): "Kartlarını ekle, hangi gün hangi kartla
  harcayacağını söyleyelim." + [İlk kartını ekle] button.

TAB 2 — "Kartlarım":
- List of cards: color dot + name + bank, badge "bugün: {days} gün",
  "Kesim: her ayın {statementDay}'i · Son ödeme: kesim + {graceDays} gün",
  utilization bar if limits provided (amber when >80%).
- Add/edit card form (sheet or page). Fields with Turkish labels:
  Banka (select from: Akbank, Garanti BBVA, İş Bankası, Yapı Kredi, QNB,
  Ziraat, Halkbank, VakıfBank, DenizBank, TEB, ING, Enpara, Diğer),
  Kart adı (text), Hesap kesim günü (1-31 picker, helper: "Ekstrenin
  kesildiği gün. Son ekstrenin üstünde yazar."), Son ödeme günü (picker,
  auto-suggested as statementDay+10 with helper "Çoğu bankada son ödeme,
  kesimden 10 gün sonradır."), Toplam limit (₺, optional),
  Kullanılabilir limit (₺, optional), Aktif (switch, default on),
  color picker (8 preset colors).
- Derive graceDays from the two day inputs (handle month wrap: if dueDay <
  statementDay, grace = dueDay + 30 - statementDay). Validate: grace < 10 →
  warning "Türkiye'de son ödeme, kesimden en az 10 gün sonradır — ekstrenden
  kontrol et"; availableLimit > totalLimit → error.
- Above the form, a trust line with a lock icon:
  "🔒 Bu formda kart numarası alanı yok — bilerek. Kart numaranı, CVV'ni,
  banka şifreni asla istemeyiz."
- Delete with confirm dialog: "Bu kartın tarihleri ve hatırlatmaları da
  silinir. Bu işlem geri alınamaz."

TAB 3 — "Takvim":
- Month grid (Monday-first, Turkish day/month names). For each card: ▲ marker
  in card color on statement days, ● marker on due days (compute for visible
  month with the clamping rule from the engine).
- Tapping a day shows a panel: events that day + "Bu gün harcamak için en iyi
  kart: {name} ({days} gün)" using recommend(cards, 1, thatDay).
- Legend: "▲ kesim günü · ● son ödeme".

TAB 4 — "Ayarlar":
- Data section: [Verilerimi İndir] (downloads JSON of cards),
  [Tüm Verilerimi Sil] (red, double confirm, clears localStorage).
- Trust block ("Veri Sözümüz"): "Ne topluyoruz? Kart adı, banka, kesim ve
  ödeme günleri, istersen limitler. Ne toplamıyoruz? Kart numarası, CVV,
  şifre, SMS. Bu uygulamayla kartından harcama yapılamaz — çünkü harcamaya
  yarayan hiçbir bilgi bizde yok."
- Legal text block (sorumluluk reddi): "KartPilot bir bankacılık veya finansal
  danışmanlık hizmeti değildir. Hesaplamalar girdiğiniz tarihlere dayanan
  tahminlerdir; bankanızın ekstresi esastır."
- App version.

FIRST-RUN ONBOARDING (3 slides, skippable):
1. "Hangi kartla ne zaman harcayacağını söyleyen asistan" + illustration.
2. Trust slide, full screen: shield icon + "Kart numaranı asla istemiyoruz."
3. CTA: [İlk kartını ekle].

=====================================================================
5. DESIGN SYSTEM
=====================================================================
- Light theme. Background #F7F9FC, surface white, radius 16px, soft shadows.
- Primary/CTA: #1E5AF5. Gain/advantage green: #16C784 (all "days" numbers).
- Warning amber #F5A623, risk red #E5484D (red ONLY for real risk).
- Font: Inter (Google Fonts), tabular numerals for all numbers.
- Day counts are the heroes: large, bold, green. Amounts always "8.000 ₺".
- Cards in UI must NOT look like real credit cards (no 16-digit pattern,
  no chip): they are rounded info tiles with a colored left border + initial.
- Friendly-but-serious Turkish tone, "sen" form. No exclamation overuse.

=====================================================================
6. DO NOT BUILD (out of scope for MVP)
=====================================================================
Signup/auth, push notifications, campaigns module, statement debt tracking,
bank API connections, multi-currency, dark mode, charts. Leave clean seams
(the engine already has carriesDebt and params for later).

Build the whole app in one go. Seed it with 3 demo cards on first run
(clearly marked "Örnek kart — düzenle ya da sil": Bonus kesim 1, Axess kesim
9, Maximum kesim 17, each grace 10, limits 30.000/12.400, 25.000/18.000,
20.000/9.000) so the value is visible immediately; deleting them is one tap.
```

---

## Prompt sonrası kontrol listesi (elle doğrulama)

Uygulama üretildikten sonra şu 5 kontrolü yap:

1. **Motor doğruluğu:** Kesim günü 10, grace 10 olan kartla tarihi **9 / 10 / 11 Haziran 2026** seçerek hesapla → sırasıyla **11 / 10 / 39** gün görmelisin.
2. **Kısa ay:** Kesim günü 31 olan kart ekle, takvimde Şubat ve Haziran'a bak → işaret ayın son gününde olmalı.
3. **Eleme:** Kullanılabilir limiti 5.000 ₺ olan kartla 8.000 ₺ hesapla → "Limit yetersiz" gerekçesiyle elenmiş bölümünde görünmeli.
4. **Güven:** Hiçbir ekranda/formda kart numarası benzeri alan olmamalı; form üstünde kilit satırı durmalı.
5. **Kalıcılık:** Sayfayı yenile → kartlar localStorage'dan geri gelmeli.

Bir kontrol başarısızsa Lovable'a tek cümlelik düzeltme mesajı gönder (ör. *"Engine dosyasındaki mantığı değiştirmişsin; src/engine/index.ts'i prompttaki haline geri döndür, UI'ı ona uydur"*).
