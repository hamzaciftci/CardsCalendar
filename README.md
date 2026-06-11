# Kredi Kart Takvimi (KartPilot)

Birden fazla kredi kartı olan kullanıcıya, **hangi gün hangi kartla harcarsa en uzun faizsiz süreyi elde edeceğini** söyleyen uygulama. UI Lovable'da geliştirilir; **hesaplama mantığının kaynak gerçeği (source of truth) bu depodur.**

## Depo yapısı

```
├── URUN-DOKUMANI.md          # 20 bölümlük ürün dokümanı (strateji → yol haritası)
├── lovable-starter-prompt.md # Lovable'a verilen başlangıç promptu
├── README.md                 # bu dosya
├── Kart Günlükleri.zip       # Lovable'dan indirilen SON dışa aktarım (arşiv)
├── app/                      # Lovable bulut kodunun birebir yerel AYNASI
│   └── src/engine/index.ts   #   ← kök motorun alt kümesi; ortak fonksiyonların
│                             #     mantığı her zip'te satır satır doğrulanır
├── engine/                   # ⭐ Hesaplama motoru — test edilen TEK doğru kopya
│   ├── package.json
│   ├── tsconfig.json
│   └── src/
│       ├── index.ts          # motor (faizsiz gün + öneri + dönem + son ödeme)
│       └── index.test.ts     # ürün dokümanı §7.3 senaryoları + kenar durumlar
└── supabase/
    └── schema.sql            # bulut senkron fazı için hazır Postgres şeması
```

> **Çalışma düzeni:** `app/` her zaman son zip'in birebir aynasıdır — yerel
> düzeltme yapılmaz. Düzeltmeler Lovable'a mesajla yaptırılır; yeni zip inince
> burada doğrulanır (motor mantık karşılaştırması + tip kontrolü + build).
> Kök `engine/` paketi üst kümedir: app'te henüz kullanılmayan yardımcılar
> (`upcomingCycles`, `cycleForMonth`, `ENGINE_VERSION`) yalnızca kökte yaşar ve
> ihtiyaç doğunca Lovable'a taşınır. Bu ikilik GitHub senkronuyla ortadan kalkar.

## Motor testlerini çalıştırma

```powershell
cd engine
npm install        # ilk seferde
npm test           # tüm senaryolar (vitest)
npm run typecheck  # tip kontrolü (tsc)
```

## Lovable ile çalışma kuralı

1. **Motor mantığını Lovable'a yazdırma/değiştirtme.** Lovable yalnızca UI üzerinde çalışır; `src/engine/index.ts` dosyasının içeriği her zaman buradaki `engine/src/index.ts` ile **birebir aynı** tutulur.
2. Motorda değişiklik gerekirse akış şudur: önce burada değiştir → `npm test` yeşil → dosya içeriğini Lovable projesindeki `src/engine/index.ts`'e kopyala (Lovable'da Dev Mode/Code görünümünden ya da "replace the entire content of src/engine/index.ts with the following" mesajıyla).
3. Lovable'ın motora dokunduğundan şüphelenirsen Lovable'a şu mesajı gönder:
   > "src/engine/index.ts dosyasını sana verdiğim haline geri döndür; UI'ı ona uydur."
4. Büyük UI değişikliklerinden sonra `lovable-starter-prompt.md` sonundaki 5 maddelik elle doğrulama listesini koştur (9/10/11 Haziran → 11/10/39 gün kontrolü vb.).
5. Lovable projesini GitHub'a bağlamak (Lovable → GitHub sync) bu senkronu kolaylaştırır; o aşamada bu depo da git'e alınabilir.

## `engine` API özeti

| Fonksiyon | Ne yapar |
|---|---|
| `interestFreeDays(card, spendDate)` | Harcamanın gireceği ekstre kesimi, son ödeme tarihi ve faizsiz gün sayısı |
| `recommend(cards, amount, spendDate, params?)` | Sıralı öneri: `best`, `alternatives`, gerekçeli `excluded`, `waitTip` ("2 gün beklersen…") |
| `upcomingCycles(card, fromDate, count)` | Sonraki N dönemin kesim/son ödeme tarihleri (takvim işaretleri + hatırlatma cron'u) |
| `ENGINE_VERSION` | Simülasyon kayıtlarına yazılacak motor sürümü |

Kurallar (ürün dokümanı §7): kesim günü harcaması **muhafazakâr** olarak o ekstreye sayılır; kesim günü 29/30/31 kısa aylarda ayın son gününe kısıtlanır; tüm tarihler günün başına normalize edilir; sabit "son ödeme günü" değil `graceDays` saklanır.

## Supabase şeması ne zaman uygulanır?

MVP **misafir modda (localStorage)** çalışır — Supabase'e şimdi ihtiyaç yok. Hesap + bulut senkron özelliğine geçerken [supabase/schema.sql](supabase/schema.sql) dosyası Supabase SQL Editor'de bir kez çalıştırılır. Şemada RLS tüm tablolarda açıktır ve kart numarası/CVV alanı bilinçli olarak yoktur.

## Sıradaki adımlar

- [ ] Lovable çıktısında 5 maddelik doğrulama listesini koş
- [ ] Lovable ↔ GitHub senkronu kurulunca bu depoyu da git'e al
- [ ] Faz 1.5: Supabase projesi aç (EU/Frankfurt), `schema.sql`'i uygula, magic link auth'u aç
- [ ] Faz 2: bildirim cron'u (pg_cron + Edge Function) — şema sonundaki nota bak
