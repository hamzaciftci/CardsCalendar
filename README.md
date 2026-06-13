# KartPilot (Kredi Kart Takvimi)

Birden fazla kredi kartı olan kullanıcıya, **hangi gün hangi kartla harcarsa en uzun faizsiz süreyi elde edeceğini** söyleyen uygulama. Kart numarası, CVV veya banka şifresi asla istenmez — yalnızca kesim/ödeme günleri ve isteğe bağlı limitlerle çalışır.

> Bu depo bağımsızdır: geliştirme doğrudan burada yapılır. Lovable dönemi kapanmıştır; tüm Lovable bağımlılıkları kaldırılmıştır (ilk commit o dönemin anlık görüntüsünü saklar).

## Depo yapısı

```
├── URUN-DOKUMANI.md          # 20 bölümlük ürün dokümanı (strateji → yol haritası)
├── lovable-starter-prompt.md # (arşiv) ilk sürümü üreten başlangıç promptu
├── app/                      # ⭐ Uygulama — TanStack Start + React 19 + TypeScript
│   ├── src/engine/           #   hesaplama motoru + 36 birim testi (TEK doğru kaynak)
│   ├── src/routes/           #   / (vitrin) · /giris (giriş+kayıt) · /uygulama (Bugün) · Kartlarım · Takvim · Ayarlar
│   ├── src/components/       #   CardForm, CardTile, Onboarding + shadcn/ui
│   └── src/lib/              #   storage (localStorage), format, SSR hata katmanı
└── supabase/
    └── schema.sql            # bulut senkron fazı için hazır Postgres şeması (RLS'li)
```

## Komutlar (`app/` içinde)

```powershell
npm run dev        # geliştirme sunucusu → http://localhost:8080
npm test           # motor birim testleri (36 senaryo: Şubat, artık yıl, yıl devri…)
npm run typecheck  # tsc --noEmit
npm run lint       # eslint (+ prettier kuralı)
npm run format     # prettier --write
npm run build      # production build → dist/client + dist/server (SSR)
```

## Mimari kurallar

1. **Tarih matematiği yalnızca [app/src/engine/index.ts](app/src/engine/index.ts)'te yaşar.** Ekranlar `interestFreeDays`, `recommend`, `nextDueDate`, `cycleForMonth`, `upcomingCycles` çağırır; hiçbir route/bileşen kendi tarih hesabını kurmaz.
2. **Motor değişikliği = önce test.** Davranış değişikliği [index.test.ts](app/src/engine/index.test.ts)'e senaryo olarak eklenir, sonra kod değişir, `npm test` yeşilken commit edilir.
3. **Muhafazakâr hesap ilkesi:** belirsizlikte kullanıcı aleyhine yuvarla (kesim günü harcaması o ekstreye sayılır; tatil uzatması varsayılmaz).
4. **Veri minimizasyonu:** kart numarası/CVV/şifre alanı hiçbir formda, tipte veya tabloda yer almaz.

## Bilinen notlar

- **Node sürümü:** TanStack Start resmî olarak Node ≥ 22.12 ister. Node 20.19 ile dev/test/build doğrulandı ve çalışıyor; yine de ilk fırsatta Node 22 LTS'e geçilmesi önerilir (`winget install OpenJS.NodeJS.LTS`).
- **MVP veri katmanı:** misafir modu — kartlar `localStorage`'da (`kartpilot.cards.v1`). Hesap + bulut senkron fazına geçerken [supabase/schema.sql](supabase/schema.sql) Supabase SQL Editor'de bir kez çalıştırılır.
- SSR hata yakalama katmanı ([src/server.ts](app/src/server.ts), [src/start.ts](app/src/start.ts)) Lovable'a özgü değildir, bilinçli olarak korunmuştur.

## SaaS / Bulut senkron kurulumu (Supabase)

Uygulama env değişkenleri olmadan **misafir modda** çalışır (localStorage).
Hesap + cihazlar arası senkronu açmak için:

1. [supabase.com](https://supabase.com) → **New Project** (bölge: `eu-central-1` Frankfurt — KVKK notu için).
2. **SQL Editor** → depodaki [supabase/schema.sql](supabase/schema.sql) içeriğini yapıştır → Run (bir kez).
3. **Authentication → Providers → Email**: açık olduğundan emin ol (magic link varsayılan).
4. **Authentication → URL Configuration**: Site URL = `https://cards-calendar.vercel.app`.
5. **Project Settings → API**: `Project URL` ve `anon public` anahtarını kopyala.
6. Vercel → Project Settings → **Environment Variables**:
   - `VITE_SUPABASE_URL` = Project URL
   - `VITE_SUPABASE_ANON_KEY` = anon anahtar
   → kaydet, **Redeploy**. Yerel için: `app/.env.example` → `app/.env`.

Env'ler tanımlanınca vitrinin sağ üstündeki **Giriş yap / Kayıt ol** butonları,
`/giris` kimlik sayfası ve Ayarlar'daki **Hesap** paneli aktifleşir. Kayıt akışı:
vitrin → sağ üst **Kayıt ol** → `/giris` (e-posta, şifresiz) → gelen kutusundaki
bağlantı → `/uygulama` → yeni kullanıcıda onboarding otomatik başlar ve "İlk
kartını ekle" ile Kartlarım'a taşır.

`/giris` tek sayfada hem giriş hem kaydı taşır (magic link ikisini ayırmaz);
`?mode=giris|kayit` yalnızca başlık/buton metnini değiştirir. Oturum açık kullanıcı
`/giris`'e girerse `/uygulama`'ya yönlenir. **Vitrin (`/`) herkese açık kalır —
yönlendirme yok;** geri dönen/oturumlu kullanıcıda sağ üst ve hero CTA'sı
"Uygulamaya git"e döner. Supabase env'leri yokken `/giris` "hesapsız devam et"
yolunu sunar (uygulama misafir modda çalışır). Senkron kuralı: girişte bulut doluysa bulut kazanır; boşsa yerel
kartlar yüklenir; sonraki tüm değişiklikler anında buluta yazılır.
Faturalama (Stripe/premium) Faz 2'de eklenecek.

## Vercel kurulum notları

1. Vercel → **Add New → Project** → `hamzaciftci/CardsCalendar-` deposunu içe aktar.
2. **Root Directory: `app`** seç (depo kökünde dokümanlar var; uygulama `app/` altında).
3. Framework: **TanStack Start** otomatik algılanmalı (algılarsa build/output ayarlarına dokunma).
4. **Node.js Version: 22.x** seç (Project Settings → General — TanStack Start ≥ 22.12 ister).
5. Ortam değişkeni gerekmez: MVP tamamen istemci tarafında, localStorage ile çalışır.
6. Build preset algılanmadan başarısız olursa: nitro'nun `vercel` preset'i eklenmeli — tek commit'lik iş, Claude'a söylemen yeter.

## Sıradaki adımlar (ürün dokümanı §20 ile hizalı)

- [x] GitHub'a push'landı → [hamzaciftci/CardsCalendar](https://github.com/hamzaciftci/CardsCalendar)
- [x] Vercel'de canlı → **<https://cards-calendar.vercel.app>** (Root Directory: `app`, nitro `vercel` preset)
- [ ] CI'da `test + typecheck + build` koş (GitHub Actions)
- [x] Faz 1.5 (SaaS altyapısı): Supabase auth + bulut senkron kodu hazır —
      kullanıcının Supabase projesi açıp env eklemesi bekleniyor (yukarıdaki bölüm)
- [ ] PWA manifesti + ikonlar (telefona eklenebilirlik)
- [ ] Faz 2: Stripe/premium, push bildirimleri, ekstre/borç takibi
