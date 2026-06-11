# Kredi Kart Takvimi — Kapsamlı Ürün Dokümanı

> **Sürüm:** 1.0 · **Tarih:** 10 Haziran 2026
> **Kapsam:** Ürün stratejisi, marka, MVP, algoritma tasarımı, UX/UI, teknik mimari, veri modeli, monetizasyon, growth, hukuk ve yol haritası.
> **Önerilen çalışma adı:** **KartPilot** (gerekçe Bölüm 3'te)

---

## İçindekiler

1. [Proje Özeti](#1-proje-özeti)
2. [Ürün Konumlandırması](#2-ürün-konumlandırması)
3. [İsim ve Marka Analizi](#3-isim-ve-marka-analizi)
4. [MVP Özellikleri](#4-mvp-özellikleri)
5. [Kullanıcı Akışı](#5-kullanıcı-akışı)
6. [Öneri Algoritması](#6-öneri-algoritması)
7. [Faizsiz Gün Hesaplama Mantığı](#7-faizsiz-gün-hesaplama-mantığı)
8. [Ekran Tasarımları](#8-ekran-tasarımları)
9. [UI/UX Önerileri](#9-uiux-önerileri)
10. [Teknik Mimari](#10-teknik-mimari)
11. [Veritabanı Modeli](#11-veritabanı-modeli)
12. [Bildirim Sistemi](#12-bildirim-sistemi)
13. [Monetizasyon Modeli](#13-monetizasyon-modeli)
14. [Growth ve Pazarlama Stratejisi](#14-growth-ve-pazarlama-stratejisi)
15. [SEO Stratejisi](#15-seo-stratejisi)
16. [Riskler ve Hukuki Konular](#16-riskler-ve-hukuki-konular)
17. [Rakip Analizi](#17-rakip-analizi)
18. [Kullanıcı Güvenini Artırma](#18-kullanıcı-güvenini-artırma)
19. [Örnek Uygulama Metinleri](#19-örnek-uygulama-metinleri)
20. [Sonuç ve Yol Haritası](#20-sonuç-ve-yol-haritası)
21. [Ekstra: Yapay Zekâ Destekli Geliştirme Planı](#21-ekstra-yapay-zekâ-destekli-geliştirme-planı)

---

# 1. Proje Özeti

## Uygulama ne işe yarar?

Kredi Kart Takvimi, birden fazla kredi kartı olan kullanıcının **"bu harcamayı bugün hangi kartla yapmalıyım?"** sorusuna saniyeler içinde, hesaplanmış bir cevap veren bankalar-üstü bir kişisel finans asistanıdır. Kullanıcı kartlarının hesap kesim ve son ödeme tarihlerini bir kez girer; uygulama her harcama anında en uzun faizsiz kullanım süresini sağlayan kartı önerir, tüm kesim/ödeme tarihlerini tek takvimde toplar ve ödeme gününü kaçırmaması için kullanıcıyı uyarır.

## Hangi problemi çözer?

Türkiye'de kredi kartı sahibi bir yetişkinin ortalama 2–4 kartı vardır ve her kartın:

- hesap kesim tarihi farklıdır,
- son ödeme tarihi farklıdır,
- limiti ve doluluk oranı farklıdır,
- dönemsel kampanya/puan avantajı farklıdır.

Bu tablo üç somut soruna yol açar:

| Problem | Sonucu | Maliyeti |
|---|---|---|
| **Yanlış günde yanlış kart** | Kesimden 1 gün önce yapılan harcama 10–11 gün faizsiz kalırken, 1 gün sonra yapılsa 38–40 gün faizsiz kalabilirdi | Kaçırılan ~28 günlük faizsiz finansman; nakit sıkışıklığında faizli devir riski |
| **Tarih karmaşası** | 4 kart × 2 kritik tarih = ayda 8 tarihi akılda tutma yükü | Gecikme faizi + gecikme bildirimi + kredi notu hasarı |
| **Limit körlüğü** | Hangi kartta ne kadar yer kaldığı bilinmez | Reddedilen işlem, plansız asgari ödeme, faizli bakiye |

Banka uygulamaları bu problemi çöz**e**mez: her banka yalnızca kendi kartını gösterir ve müşterinin faizsiz dönemi maksimize etmesi bankanın gelir modeliyle çelişir. Boşluk tam olarak burada.

## Hedef kullanıcı kimdir?

**Birincil persona — "Optimizasyoncu Maaşlı" (çekirdek hedef):**
- 25–45 yaş, maaşlı çalışan, büyükşehirde yaşıyor
- 2–5 kredi kartı var; kartları bilinçli olarak "ücretsiz kısa vadeli kredi" gibi kullanmak istiyor
- Maaş günü ile son ödeme tarihlerini hizalamaya çalışıyor
- Finansal okuryazarlığı orta-üstü; Excel'de tablo tutmayı denemiş ama sürdürememiş

**İkincil persona — "Tarih Kaçıran Yoğun Profesyonel":**
- Önceliği optimizasyon değil, **hiçbir ödemeyi kaçırmamak**
- Asıl değer önerisi: tek takvim + zamanında hatırlatma

**Üçüncül persona — "KOBİ / Esnaf":**
- Şahsi + ticari kartları karışık kullanıyor, nakit akışı kart takvimine birebir bağlı
- (Faz 3'te ayrı sürümle hedeflenir; MVP'de kapsam dışı)

## Kullanıcının hayatında nasıl bir fayda sağlar?

1. **Ölçülebilir parasal fayda:** Ortalama faizsiz gün sayısını ~15–18 günden ~30–35 güne çıkarmak, 8.000 TL'lik tipik bir aylık kart harcamasında (aylık ~%4 akdi faizle fırsat maliyeti üzerinden) her ay yüzlerce TL'lik faizsiz finansman alanı yaratır. Gecikme faizi ve kredi notu hasarı sıfırlanır.
2. **Zihinsel yük devri:** 8 tarihi hatırlama işi uygulamaya devredilir; kullanıcının aklında tek kural kalır: *"Uygulama ne diyorsa o kartla öde."*
3. **Nakit akışı kontrolü:** Harcamanın hangi ekstreye yansıyacağını ve hangi maaşla ödeneceğini önceden görür.
4. **Davranış değişimi:** Uygulama zamanla kullanıcıya kesim tarihi mantığını öğretir; bu eğitim etkisi güveni ve tavsiye etmeyi (word-of-mouth) besler.

---

# 2. Ürün Konumlandırması

## Pazar konumu

> **"Bankaların değil, senin tarafında olan kart asistanı."**

Uygulama; bütçe uygulaması, banka uygulaması veya kart başvuru karşılaştırma sitesi **değildir**. Yeni bir kategori açar: **kart zamanlama optimizasyonu (card timing optimization)**. Konumlandırma üçgeni:

| Eksen | Banka uygulamaları | Bütçe uygulamaları | **Kredi Kart Takvimi** |
|---|---|---|---|
| Kapsam | Tek bankanın kartı | Geçmiş harcama analizi | **Tüm kartlar, geleceğe dönük karar** |
| Soru | "Borcun ne kadar?" | "Neye harcadın?" | **"Şimdi hangi kartla harcamalısın?"** |
| Çıkar | Bankanın geliri | Nötr | **Kullanıcının faizsiz günü** |
| Veri | Tüm hesap verisi | Banka bağlantısı ister | **Sadece 5-6 alan, kart numarası YOK** |

## Banka uygulamalarından farkı

1. **Bankalar-üstü tarafsızlık:** 4 kartı yan yana koyup karşılaştıran tek taraf biziz; hiçbir banka rakibinin kartını "bugün bununla harca" diye öneremez.
2. **Çıkar hizalaması:** Bankanın geliri kullanıcının faiz ödemesinden gelir; bizim değerimiz kullanıcının faiz **ödememesinden** gelir. Bu cümle pazarlamanın da omurgasıdır.
3. **Geleceğe dönüklük:** Banka uygulaması geçmişi raporlar; biz harcama **öncesi** karar verdiririz.
4. **Sıfır hassas veri:** İnternet bankacılığı şifresi, kart numarası, CVV asla istenmez — banka uygulamalarının aksine kaybedilecek hassas veri yoktur.

## Kullanıcı neden indirmeli?

İndirme anındaki vaat tek cümlelik ve somut olmalı:

> **"Kartlarını 1 dakikada ekle; bugün hangi kartla harcarsan kaç gün faizsiz kullanacağını anında gör."**

İlk oturumda "aha" anı garanti edilmeli: kullanıcı 2 kart ekler eklemez uygulama *"X kartında bugün harcarsan 38 gün, Y kartında 12 gün faizsiz kullanırsın — aradaki fark 26 gün"* sonucunu gösterir. Bu fark, indirme gerekçesinin kendisidir.

## Ana değer önerisi

- **Birincil:** "Doğru günde doğru kart — her harcamada maksimum faizsiz gün."
- **Destekleyici:** "Tüm kartların tek takvimde; hiçbir son ödeme tarihini kaçırma."
- **Güven:** "Kart numaranı asla istemiyoruz."

---

# 3. İsim ve Marka Analizi

Puanlama 1–10 arasıdır. Kriterler: marka gücü (ayırt edicilik, sahiplenilebilirlik), akılda kalıcılık, SEO potansiyeli (arama hacmiyle örtüşme), mobil uygulama ismi uygunluğu (kısalık, ikonlaşabilirlik, store araması), güven hissi, genişleme potansiyeli (kart dışı finans ürünlerine taşınabilirlik).

| İsim | Marka gücü | Akılda kalıcılık | SEO | App ismi uygunluğu | Güven | Genişleme | **Toplam /60** |
|---|---|---|---|---|---|---|---|
| **KartPilot** | 9 | 8 | 6 | 9 | 8 | 9 | **49** |
| **HangiKart** | 8 | 9 | 9 | 9 | 7 | 6 | **48** |
| **KartAsistan** | 7 | 7 | 7 | 8 | 8 | 8 | **45** |
| KartPlan | 6 | 6 | 6 | 8 | 7 | 7 | 40 |
| Faizsiz Gün | 7 | 8 | 9 | 5 | 6 | 4 | 39 |
| KartZamanı | 6 | 7 | 5 | 7 | 6 | 6 | 37 |
| KartRotası | 7 | 6 | 4 | 7 | 6 | 7 | 37 |
| KartTakip | 5 | 6 | 8 | 7 | 7 | 5 | 38 |

**İsim bazında notlar:**

- **KartPilot (49):** "Pilot" metaforu tam olarak ürünün yaptığı işi anlatır: senin yerine rotayı hesaplar, sen sadece onaylarsın. Ayırt edici, tescillenebilir, ikonlaştırılabilir (pusula/uçuş ibresi). SEO'su zayıf (kimse "kart pilot" aramaz) ama bu, içerik sitesiyle kapatılır. Genişlemeye en uygun isim: "PilotPuan", "PilotRapor" gibi alt ürünler türetilebilir.
- **HangiKart (48):** Kullanıcının sorusunun kendisi — akılda kalıcılığı ve SEO'su mükemmel ("hangi kart" kalıbı yüksek hacimli arama). Zayıf yanı: HangiKredi ile karışma riski ve "karşılaştırma/başvuru sitesi" algısı yaratması; ayrıca isim, ürün kart önerisinin ötesine (bütçe, ödeme takvimi) genişlerse daralır.
- **KartAsistan (45):** Güvenli, açıklayıcı, genişlemeye uygun; ama jenerik kaldığı için marka olarak sahiplenmesi ve tescili zor.
- **Faizsiz Gün (39):** Değer önerisini birebir söyler ve SEO'su güçlü; ancak iki kelimeli app ismi zayıftır, "faiz" kelimesi store ve reklam tarafında finansal ürün algısı/uyum hassasiyeti doğurur, marka genişlemesi neredeyse imkânsızdır. **İsim olarak değil, slogan/içerik markası olarak kullanılmalı.**
- **KartTakip (38):** SEO'su iyi ama tamamen jenerik; rakip her uygulama bu kelimeyi açıklamasında kullanır, sahiplenilemez.
- **KartPlan / KartZamanı / KartRotası:** Telaffuzu temiz fakat ne ayırt edicilikte ne SEO'da öne çıkıyor.

## Önerilen ilk 3

1. **KartPilot** — ana marka önerim. Ayırt edici, güven veren, genişleyebilir. Slogan ile SEO açığı kapatılır: **"KartPilot — Doğru günde doğru kart."**
2. **HangiKart** — kullanıcı kazanımı en hızlı isim; özellikle organik aramaya yaslanan bir büyüme planlanıyorsa öne geçer.
3. **KartAsistan** — iki ismin tescil/domain sorunu çıkması hâlinde sağlam yedek.

**Taktik öneri:** Marka **KartPilot** olsun; `hangikart` ve `faizsizgun` kalıpları, KartPilot'un web sitesinde ücretsiz hesaplama araçlarının ve blog içeriklerinin adı olarak kullanılsın (ör. `kartpilot.com/hangi-kart`, `kartpilot.com/faizsiz-gun-hesaplama`). Böylece üç ismin gücü tek markada birleşir. Lansman öncesi `kartpilot.com / .app / .com.tr` domain ve Türk Patent marka taraması yapılmalıdır.

> Dokümanın geri kalanında ürün **KartPilot** çalışma adıyla anılacaktır.

# 4. MVP Özellikleri

MVP'nin tek görevi şu döngüyü kusursuz çalıştırmaktır: **kart ekle → harcama tutarı gir → doğru öneriyi al → ödeme gününü kaçırma.** Bunun dışındaki her şey ertelenebilir.

## Mutlaka olmalı (MVP — v1.0)

| # | Özellik | Kapsam notu |
|---|---|---|
| 1 | **Misafir modu ile başlama** | Kayıt zorunluluğu yok; veriler cihazda tutulur. Hesap oluşturmak isteyene e-posta/Google ile kayıt + bulut senkron. Güven ve aktivasyon için kritik. |
| 2 | **Kart ekleme (kart numarasız)** | Alanlar: kart adı, banka (hazır liste + "diğer"), toplam limit, kullanılabilir limit, hesap kesim günü (1–31), son ödeme günü, aktif/pasif. Akıllı varsayılan: son ödeme = kesim + 10 gün. |
| 3 | **Harcama simülasyonu (öneri motoru)** | Tutar + tarih (varsayılan bugün) → sıralı kart önerisi: faizsiz gün, kesim tarihi, son ödeme tarihi, hangi ekstreye yansır, elenenler ve gerekçeleri. |
| 4 | **"Bugünün kartı" ana ekran kartı** | Tutar girmeden, bugün için en avantajlı kartı ve gün sayısını gösteren hero alanı. |
| 5 | **Takvim görünümü** | Aylık takvimde tüm kartların kesim ve son ödeme günleri renk kodlu; güne dokununca o günün en avantajlı kartı. |
| 6 | **Son ödeme hatırlatması** | 3 gün ve 1 gün kala bildirim (PWA push destekleyen cihazda push, yoksa e-posta). Saat tercihi sabit: 09:00. |
| 7 | **Onboarding (3 ekran)** | Problem → güven mesajı ("kart numarası istemiyoruz") → ilk kartı ekle. |
| 8 | **Limit güncelleme kısayolu** | Kart kartında "kullanılabilir limiti güncelle" hızlı aksiyonu (MVP'de elle güncelleme). |
| 9 | **Yasal zemin** | Sorumluluk reddi, KVKK aydınlatma metni, veri silme (tek tuşla hesabı/veriyi sil). |

## Sonraki sürümde olabilir (v1.1–v1.5)

- Ekstre/borç takibi: dönem borcu girme, "ödendi" işaretleme, gecikme tespiti
- Kampanya modülü: kart bazında cashback/puan/taksit kampanyası girişi ve önerinin kampanyayı hesaba katması (motor MVP'de destekler, UI sonra açılır)
- Bildirim merkezi (uygulama içi liste) ve bildirim tercihlerinin kişiselleştirilmesi
- Ana ekran widget'ı (iOS/Android), karanlık mod
- Haftalık özet e-postası ("bu hafta en avantajlı kartın değişti")
- Taksit simülasyonu ("bu harcamayı 3 taksitte hangi kartla yapmalı?")
- CSV/JSON veri dışa aktarma

## İleri seviye olabilir (v2+)

- Açık bankacılık entegrasyonu ile limit/borç bilgisini otomatik çekme (TR'de BKM/açık bankacılık API olgunluğuna bağlı; ayrı hukuki değerlendirme ister)
- Yapay zekâ harcama koçu: alışkanlıklardan öğrenen kişisel öneriler ("maaşın 15'inde yatıyor; D kartının kesimini 20'sine aldır")
- Kesim tarihi değiştirme rehberi: "kartlarının kesim tarihlerini şu günlere dağıtırsan ayın her günü 30+ gün faizsiz alan açılır" optimizasyonu
- Aile/ortak hesap: eşler arası kart havuzu
- Banka kampanyalarının merkezi feed'i (içerik ekibi/iş ortaklıklarıyla)
- KOBİ sürümü (çoklu kullanıcı, ticari kart, muhasebe dışa aktarımı)

**MVP'ye bilinçli olarak alınmayanlar:** harcama kategorisi takibi, bütçe modülü, banka entegrasyonu, kart başvuru önerisi. Bunlar ürünü "bir bütçe uygulaması daha"ya dönüştürüp odağı bulandırır.

---

# 5. Kullanıcı Akışı

## 5.1 İlk kayıt ve aktivasyon

```
Uygulamayı aç
 └─ Karşılama 1: "Hangi kartla ne zaman harcayacağını söyleyen asistan"
 └─ Karşılama 2 (güven): "Kart numaranı, CVV'ni, banka şifreni ASLA istemiyoruz.
     Sadece kesim ve ödeme tarihlerinle çalışırız."
 └─ Karşılama 3: [Hadi ilk kartını ekle] / küçük link: "Önce gezinmek istiyorum"
 └─ Misafir olarak devam (varsayılan) — kayıt duvarı YOK
```

**Tasarım kuralı:** Bildirim izni ve hesap oluşturma, değer gösterilmeden **asla** istenmez. Sıralama: önce ilk öneri gösterilir → ardından "son ödeme gününü hatırlatalım mı?" bağlamıyla bildirim izni → veri kaybetmemesi için hesap önerisi (2.–3. oturumda).

## 5.2 Kart ekleme

```
[+ Kart Ekle]
 ├─ Banka seç (logo listesi / arama / "Diğer")
 ├─ Kart adı (varsayılan öneri: "Bonus", "Maximum"… banka seçimine göre)
 ├─ Hesap kesim günü seç (1–31 arası gün seçici)
 │   └─ Bilgi notu: "Ekstrenin kesildiği gün. Ekstrenin üstünde yazar."
 ├─ Son ödeme günü seç
 │   └─ Otomatik öneri: kesim + 10 gün → "Çoğu bankada son ödeme,
 │      kesimden 10 gün sonradır. Senin ekstrende farklıysa düzelt."
 │   └─ Doğrulama: fark < 10 gün ise uyarı (Türkiye'de yasal asgari 10 gündür)
 ├─ Toplam limit (₺) — isteğe bağlı ama önerilir
 ├─ Kullanılabilir limit (₺) — isteğe bağlı
 └─ [Kartı Kaydet] → konfeti yok; doğrudan değer:
     "Bu kartla BUGÜN harcarsan ~23 gün faizsiz kullanırsın."
     → "İkinci kartını eklersen karşılaştırma başlar" teşviki
```

## 5.3 Harcama → öneri alma (çekirdek döngü)

```
Ana ekran: "Ne kadar harcayacaksın?" [tutar gir: 8.000] [tarih: Bugün ▾]
 └─ [Hesapla]
     └─ SONUÇ EKRANI
         ★ Önerilen: Akbank Axess — 38 gün faizsiz
           • Kesim: 9 Temmuz · Son ödeme: 19 Temmuz · Temmuz ekstresine yansır
           • Limit uygun: 12.400 ₺ kullanılabilir
         ○ Alternatif: İş Bankası Maximum — 31 gün
         ○ Alternatif: Garanti Bonus — 18 gün
         ✕ Elendi: Yapı Kredi World — kullanılabilir limit yetersiz (5.200 ₺)
         ⓘ "2 gün beklersen Bonus ile 41 gün faizsiz kullanabilirsin."
```

## 5.4 Ödeme günü hatırlatma döngüsü

```
Son ödemeye 3 gün kala  → push/e-posta: "Maximum'un son ödemesi 22 Haziran Pazartesi."
Son ödemeye 1 gün kala  → "Yarın: Maximum son ödeme günü."
Son ödeme günü 09:00    → "Bugün son gün."
(v1.1+) Ertesi gün      → "Ödedin mi?" [Ödedim ✓] [Henüz değil]
                          └─ "Henüz değil" → gecikme faizi bilgilendirmesi + yarın tekrar sor
```

## 5.5 Kart performansı görme (v1.1)

Aylık özet ekranı: "Bu ay önerilerle ortalama **34 gün** faizsiz kullandın (geçen ay 21). Tüm ödemeler zamanında ✓". Bu ekran paylaşske edilebilir bir başarı kartı üretir (growth mekanizması, Bölüm 14).

## 5.6 Kenar akışları

- **Tek kartlı kullanıcı:** Karşılaştırma yerine "en iyi harcama penceresi" gösterilir: "Bu kartta en avantajlı harcama günleri 10–25 Haziran arası."
- **Limit bilgisi girmemiş kullanıcı:** Öneri yine çalışır; sonuçta "limit bilgisi olmadan sıraladık" rozeti görünür.
- **Tüm kartlar elenirse:** "Bu tutar için kullanılabilir limitli kartın yok. En yakın: World (5.200 ₺)." — asla boş ekran bırakılmaz.
- **Pasif kart:** Listelerde soluk görünür, hesaba katılmaz, tek dokunuşla aktifleştirilir.

---

# 6. Öneri Algoritması

## 6.1 Tasarım ilkeleri

1. **Açıklanabilirlik:** Her önerinin yanında gerekçesi yazar ("38 gün faizsiz + %1 cashback"). Kara kutu skoru gösterilmez; skor sadece sıralamayı belirler.
2. **Muhafazakârlık:** Belirsizlikte daima kullanıcı aleyhine yuvarla (gün sayısını az göster, riski erken göster). Yanlış pozitif vaat, güveni tek seferde bitirir.
3. **Eleme önce, skor sonra:** Uygun olmayan kart hiç skorlanmaz; ama kullanıcıya **neden** elendiği söylenir.

## 6.2 Faktörler ve rolleri

| Faktör | Algoritmadaki rolü |
|---|---|
| Harcama tarihi + hesap kesim tarihi | Faizsiz gün sayısının ana belirleyicisi (Bölüm 7'deki motor) |
| Son ödeme tarihi | Faizsiz sürenin bitiş noktası |
| Harcama tutarı + kullanılabilir limit | **Eleme kriteri** (limit yetmiyorsa kart dışı) + doluluk cezası |
| Kampanya/puan/cashback | TL değeri "gün eşdeğerine" çevrilip skora eklenir |
| Kullanıcının ödeme alışkanlığı | Borç taşıyan (ekstresini tam ödemeyen) kullanıcıda faizsiz gün avantajı fiilen yoktur → uyarı + ağır ceza |
| Kartın son ödeme riski | Son ödemesi çok yakın ve ödenmemiş borcu olan karta yeni yük bindirme cezası |
| Kart borç yoğunluğu | Harcama sonrası doluluk %80'i aşarsa artan ceza |

## 6.3 Skor formülü

Ortak birim **"faizsiz gün eşdeğeri"** dir — her avantaj ve risk güne çevrilir, böylece formül tek satırda anlaşılır:

```
SKOR = faizsizGün
     + kampanyaGünEşdeğeri          // kampanyanın TL değeri güne çevrilir
     - dolulukCezası                 // limit doluluğu %80'i aşarsa 0–5 gün
     - riskCezası                    // ödenmemiş yakın ekstre: 0–3 gün
     - borçTaşımaCezası              // devreden borç varsa 30 gün (fiilen eleme)
```

**Kampanyanın güne çevrilmesi:** 1 faizsiz gün, tutarın `günlükFaiz` kadarı değerindedir (aylık akdi faiz ~%4 ⇒ günlük ~%0,13 — uygulamada güncellenebilir parametre). Örnek: 8.000 TL harcamada %1 cashback = 80 TL = 80 / (8.000 × 0,0013) ≈ **7,5 gün eşdeğeri**. Yani "%1 cashback ≈ 7–8 ekstra faizsiz gün değerinde" — kullanıcıya da bu sadelikte anlatılır.

## 6.4 Pseudo-code

```text
FONKSIYON kartOner(kartlar, tutar, harcamaTarihi, parametreler):

    uygunlar  = []
    elenenler = []

    HER kart İÇİN kartlar İÇİNDE:
        EĞER kart.aktif DEĞİL:
            elenenler.ekle(kart, sebep: "Kart pasif")
            DEVAM
        EĞER kart.kullanilabilirLimit TANIMLI VE kart.kullanilabilirLimit < tutar:
            elenenler.ekle(kart, sebep: "Kullanılabilir limit yetersiz")
            DEVAM

        // ---- Çekirdek hesap (Bölüm 7) ----
        sonuc = faizsizGunHesapla(kart, harcamaTarihi)
        //  sonuc: { kesimTarihi, sonOdemeTarihi, gun }

        skor = sonuc.gun
        gerekceler = ["{sonuc.gun} gün faizsiz"]

        // ---- Kampanya ----
        kampanyaTL = aktifKampanyaDegeri(kart, tutar, harcamaTarihi)
        EĞER kampanyaTL > 0:
            gunEsdegeri = kampanyaTL / (tutar * parametreler.gunlukFaiz)
            skor += gunEsdegeri
            gerekceler.ekle("+{kampanyaTL}₺ kampanya (≈{gunEsdegeri} gün değerinde)")

        // ---- Doluluk cezası ----
        EĞER kart.toplamLimit TANIMLI:
            dolulukSonrasi = (kart.toplamLimit - kart.kullanilabilirLimit + tutar)
                             / kart.toplamLimit
            EĞER dolulukSonrasi > 0.80:
                ceza = (dolulukSonrasi - 0.80) * 25     // %100 dolulukta 5 gün
                skor -= ceza
                uyarilar.ekle("Bu harcamayla limit doluluğu %{dolulukSonrasi}")

        // ---- Risk cezaları ----
        EĞER kart.odenmemisEkstreVar VE (kart.sonOdemeyeKalanGun <= 3):
            skor -= 3
            uyarilar.ekle("Bu kartın ödenmemiş ekstresi var, son ödeme çok yakın")

        EĞER kart.devredenBorcVar:                      // kullanıcı işaretler (v1.1)
            skor -= 30
            uyarilar.ekle("Devreden borç varken yeni harcama faizsiz olmaz.
                           Önce bu kartın borcunu kapatmanı öneririz.")

        uygunlar.ekle({kart, skor, sonuc, gerekceler, uyarilar})

    uygunlar.SIRALA(skor AZALAN)

    DÖNDÜR {
        onerilen     : uygunlar[0],
        alternatifler: uygunlar[1..],
        elenenler    : elenenler,
        ipucu        : beklemeIpucuUret(kartlar, tutar, harcamaTarihi)
        // "2 gün beklersen X ile 41 gün" — sonraki 7 günü tarayıp
        // bugünkü en iyi skoru >5 gün aşan ilk fırsatı bulur
    }
```

**`beklemeIpucuUret`** uygulamanın imza özelliğidir: sonraki 7 gün için aynı simülasyonu çalıştırır; bugünkü en iyi sonuçtan en az 5 gün daha iyi bir pencere bulursa "şu tarihte harcarsan" ipucu üretir. Kullanıcının ertelenebilir harcamalarında (beyaz eşya, tatil ödemesi) en çok paylaşılan özellik bu olacaktır.

## 6.5 Örnek çalışma (10 Haziran 2026, 8.000 TL)

| Kart | Kesim günü | Son ödeme | Kalan limit | Faizsiz gün | Kampanya | Skor | Sonuç |
|---|---|---|---|---|---|---|---|
| Axess | 9'u | kesim+10 | 12.400 ₺ | **39** (9 Tem kesim → 19 Tem) | — | 39,0 | ★ Önerilen |
| Maximum | 17'si | kesim+10 | 9.000 ₺ | 17 (17 Haz → 27 Haz) | %1 cashback (~7,5 g) | 24,5 | Alternatif |
| Bonus | 1'i | kesim+10 | 20.000 ₺ | 31 (1 Tem → 11 Tem) | — | 31,0 | Alternatif (2.) |
| World | 25'i | kesim+10 | 5.200 ₺ | — | — | — | ✕ Limit yetersiz |

Çıktı: *"Önerilen: Axess — 39 gün faizsiz. Alternatif: Bonus 31 gün, Maximum 25 gün eşdeğeri (17 gün + cashback). World limit nedeniyle elendi."*

# 7. Faizsiz Gün Hesaplama Mantığı

Bu bölüm uygulamanın kalbidir. Hesaplama motoru saf (pure) fonksiyonlardan oluşmalı, arayüzden tamamen bağımsız yazılmalı ve %100 birim test kapsamına sahip olmalıdır.

## 7.1 Kavramlar

- **Hesap kesim tarihi (kesim):** Dönem harcamalarının ekstreye bağlandığı gün. Kesimden sonraki harcama **bir sonraki** ekstreye yazılır.
- **Son ödeme tarihi:** Ekstre borcunun faizsiz kapatılabileceği son gün. Türkiye'de mevzuat gereği kesimden **en az 10 gün** sonradır; bankaların çoğunda tam 10 gündür.
- **Ödemesiz dönem (grace):** `grace = sonÖdeme − kesim` (gün). Motor, kullanıcının girdiği iki günden bu sabiti türetir ve saklar — çünkü bankalar "kesim + N gün" mantığıyla çalışır; ay uzunluğu değiştikçe son ödemenin **günü** kayar ama N sabittir.
- **Faizsiz gün:** `sonÖdemeTarihi − harcamaTarihi` (takvim günü farkı).

## 7.2 Çekirdek algoritma

```text
FONKSIYON gunKisitla(yil, ay, gun):
    // Kesim günü 29/30/31 olan kartların kısa aylardaki davranışı
    DÖNDÜR min(gun, ayinSonGunu(yil, ay))

FONKSIYON ekstreKesimTarihi(harcamaTarihi, kesimGunu):
    buAyKesim = tarih(harcamaTarihi.yil, harcamaTarihi.ay,
                      gunKisitla(harcamaTarihi.yil, harcamaTarihi.ay, kesimGunu))

    EĞER harcamaTarihi <= buAyKesim:
        DÖNDÜR buAyKesim                  // harcama bu dönemin ekstresine girer
    DEĞİLSE:
        sonrakiAy = buAyKesim.ayEkle(1)   // yıl devri otomatik (Aralık → Ocak)
        DÖNDÜR tarih(sonrakiAy.yil, sonrakiAy.ay,
                     gunKisitla(sonrakiAy.yil, sonrakiAy.ay, kesimGunu))

FONKSIYON faizsizGunHesapla(kart, harcamaTarihi):
    kesim    = ekstreKesimTarihi(harcamaTarihi, kart.kesimGunu)
    sonOdeme = kesim + kart.graceGun          // gün ekleme; ay/yıl taşması otomatik
    DÖNDÜR {
        kesimTarihi   : kesim,
        sonOdemeTarihi: sonOdeme,
        gun           : takvimGunuFarki(sonOdeme, harcamaTarihi)
    }
```

**Kritik tasarım kararları:**

1. **Kesim günü kuralı (muhafazakâr):** Kesim gününde yapılan harcamanın hangi ekstreye gireceği bankadan bankaya, hatta işlemin bankaya düşme saatine göre değişir. Motor kötümser senaryoyu varsayar: *kesim günü harcaması o günün ekstresine girer* (yani en kısa faizsiz süre). Arayüz bunu fırsata çevirir: **"Kesim günündesin — yarın harcarsan +29 gün kazanırsın."** (v1.1'de kart bazında "kesim günü harcamaları sonraki ekstreye yazılır" ayarı eklenebilir.)
2. **Saat yok, gün var:** Tüm tarihler `Europe/Istanbul` dilimine göre günün başına normalize edilir. Saat bazlı hesap, yanlış kesinlik üretir.
3. **Hafta sonu/resmî tatil:** Bazı bankalar tatile denk gelen son ödemeyi ilk iş gününe uzatır; motor uzatma **varsaymaz** (muhafazakârlık ilkesi), arayüz bilgi notu gösterir: "Son ödeme cumartesiye denk geliyor; bankan uzatma tanısa bile o güne kadar ödemeni öneririz."

## 7.3 Örnek senaryolar

Tüm örneklerde grace = 10 gün.

| # | Senaryo | Kesim günü | Harcama | Gireceği ekstre kesimi | Son ödeme | Faizsiz gün |
|---|---|---|---|---|---|---|
| 1 | Kesimden 1 gün **sonra** | 10 | 11 Haz 2026 | 10 Tem | 20 Tem | **39** ✅ en iyi pencere |
| 2 | Kesimden 1 gün **önce** | 10 | 9 Haz 2026 | 10 Haz | 20 Haz | **11** |
| 3 | Kesim **günü** (muhafazakâr) | 10 | 10 Haz 2026 | 10 Haz | 20 Haz | **10** ⚠️ "yarın harca, +29 gün" |
| 4 | Ay sonu kesimli kart | 31 | 1 Tem 2026 | 31 Tem | 10 Ağu | **40** |
| 5 | Ay sonu kesimli, ay ortası harcama | 31 | 15 Haz 2026 | 30 Haz (Haziran 30 çeker) | 10 Tem | **25** |
| 6 | Kısa ay: Şubat | 30 | 1 Şub 2027 | 28 Şub (kısıtlandı) | 10 Mar | **37** |
| 7 | Artık yıl Şubat | 30 | 1 Şub 2028 | 29 Şub (kısıtlandı) | 10 Mar | **38** |
| 8 | Yıl devri | 5 | 20 Ara 2026 | 5 Oca 2027 | 15 Oca 2027 | **26** |

Senaryo 1 ile 2 arasındaki fark uygulamanın varlık sebebidir: **aynı kart, 2 gün arayla 39'a karşı 11 gün.**

## 7.4 Kenar durumlar ve kurallar listesi

1. **Kesim günü 29/30/31:** Kesim, kısa aylarda ayın son gününe çekilir (`gunKisitla`). Takip eden ayda tekrar normal gününe döner. Kullanıcıya kart detayında not düşülür: "Şubat'ta kesimin 28/29'una çekilir."
2. **Son ödeme ay devri:** Kesim 25 + grace 10 → son ödeme sonraki ayın 4–5'i. Gün ekleme tarih kütüphanesiyle yapıldığı için otomatik doğrudur; "son ödeme günü" diye sabit bir gün saklamak **yanlış** olur — saklanması gereken `graceGun`'dür.
3. **Geçersiz girişler:** kesim günü ∉ [1,31] reddedilir; grace < 10 ise uyarı ("Türkiye'de son ödeme, kesimden en az 10 gün sonradır — tarihleri ekstrenden kontrol et"); grace > 20 ise uyarı (muhtemel yanlış giriş); kullanılabilir limit > toplam limit ise hata.
4. **Aynı güne iki kart:** Skorlar eşitse kullanılabilir limiti yüksek olan önerilir (ikincil sıralama anahtarı), o da eşitse doluluk oranı düşük olan.
5. **Geçmiş tarihli simülasyon:** İzin verilir (kullanıcı "dün harcasaydım?" diye bakabilir) ama "geçmiş tarih" rozeti gösterilir.

---

# 8. Ekran Tasarımları

## 8.1 Ana ekran (Bugün)

| Öğe | İçerik |
|---|---|
| **Bilgiler** | Hero kart: "Bugün en avantajlı kartın: **Axess** — 39 gün faizsiz". Altında: hızlı simülasyon alanı (tutar girişi), yaklaşan 2 kritik tarih ("Maximum son ödeme: 3 gün kaldı"), mini takvim şeridi (7 gün). |
| **Aksiyonlar** | Tutar girip hesaplama; hero karta dokunup kart detayına gitme; yaklaşan ödemeye dokunup takvime gitme. |
| **Butonlar** | `[Hesapla]` (birincil), `[+ Kart Ekle]` (kart sayısı < 2 ise belirgin), alt sekme çubuğu: Bugün · Kartlarım · Takvim · Ayarlar. |
| **Uyarılar** | Son ödemesi ≤3 gün olan kart varsa turuncu banner: "Maximum'un son ödemesi Pazartesi — 4.350 ₺". Bugün kesim günü olan kart varsa bilgi şeridi: "Bonus bugün kesiyor; bu kartla harcamayı yarına bırak." |
| **Metinler** | Boş durum (kart yok): "Kartlarını ekle, hangi gün hangi kartla harcayacağını söyleyelim." |

## 8.2 Kartlarım

| Öğe | İçerik |
|---|---|
| **Bilgiler** | Kart listesi; her satırda: kart rengi/baş harfi, ad + banka, "bugün harcarsan X gün" rozeti, kesim ve son ödeme günleri, limit doluluk çubuğu, aktif/pasif durumu. |
| **Aksiyonlar** | Karta dokun → detay; uzun bas → hızlı menü (limit güncelle / pasifleştir / sil); sürükleyerek sıralama. |
| **Butonlar** | `[+ Kart Ekle]` (sabit alt buton). |
| **Uyarılar** | Limit doluluğu >%80 kartta turuncu çubuk; devreden borç işaretli kartta kırmızı "borç taşıyor" rozeti. |
| **Metinler** | Pasif kart altında: "Hesaplamalara dahil edilmiyor." |

## 8.3 Kart detay

| Öğe | İçerik |
|---|---|
| **Bilgiler** | Bu kartın harcama penceresi görseli (30 günlük şerit: yeşil = avantajlı günler, gri = nötr, turuncu = kesim, kırmızı nokta = son ödeme); "bu kartta en avantajlı dönem: 10–25 Haziran"; limit durumu; sonraki 3 kesim/ödeme tarihi listesi; varsa kampanyalar (v1.1). |
| **Aksiyonlar** | Düzenle, limit güncelle, pasifleştir, sil (onaylı), kampanya ekle (v1.1). |
| **Butonlar** | `[Düzenle]`, `[Limiti Güncelle]`. |
| **Uyarılar** | grace < 10 girilmişse kalıcı sarı not: "Tarihler olağandışı görünüyor, ekstrenden doğrula." |
| **Metinler** | "Kesim günü 31 → kısa aylarda ayın son gününe çekilir." |

## 8.4 Harcama simülasyonu (sonuç ekranı)

| Öğe | İçerik |
|---|---|
| **Bilgiler** | Girilen tutar/tarih; önerilen kart büyük kartla: gün sayısı (en büyük punto), kesim tarihi, son ödeme tarihi, "yansıyacağı ekstre: Temmuz"; alternatifler sıralı liste; elenenler gerekçeli; bekleme ipucu kutusu ("2 gün beklersen…"). |
| **Aksiyonlar** | Tarihi değiştirip yeniden hesaplama (tarih kaydırıcı: ±15 gün — gün değiştikçe sıralama canlı güncellenir, ürünün "vay be" anı); sonucu paylaşma (görsel kart). |
| **Butonlar** | `[Tarihi Değiştir]`, `[Paylaş]`, `[Bu kartla harcadım →  limiti güncelle]` (v1.1). |
| **Uyarılar** | Önerilen kartta doluluk >%80 olacaksa: "Bu harcamayla limitinin %87'si dolacak." Devreden borçlu kart: kırmızı uyarı + öneri dışı bırakıldığı notu. |
| **Metinler** | Alt not: "Hesaplar girdiğin tarihlere dayanır; bankanın ekstresi esastır." |

## 8.5 Ödeme takvimi

| Öğe | İçerik |
|---|---|
| **Bilgiler** | Aylık takvim; her günde kart renkleriyle noktalar: ▲ kesim, ● son ödeme; gün seçilince alt panel: o günün olayları + "bu gün harcamak için en iyi kart: X (Y gün)". Ay toplamı: "Bu ay 3 son ödeme: toplam ~12.400 ₺" (borç girilmişse, v1.1). |
| **Aksiyonlar** | Ay değiştirme, güne dokunup detay, olaydan karta gitme, takvimi cihaz takvimine ekleme (ICS dışa aktarım — v1.1). |
| **Butonlar** | `[Bugüne Dön]`, `[ICS olarak ekle]` (v1.1). |
| **Uyarılar** | Aynı haftada 2+ son ödeme yığılması: "Bu hafta yoğun: Çar Maximum, Cum Bonus." |
| **Metinler** | Lejant: "▲ kesim günü · ● son ödeme · yeşil gün = uzun faizsiz pencere". |

## 8.6 Bildirimler

| Öğe | İçerik |
|---|---|
| **Bilgiler** | Kronolojik bildirim listesi (okunmamış vurgulu): hatırlatmalar, fırsat bildirimleri, sistem mesajları. |
| **Aksiyonlar** | Bildirime dokun → ilgili karta/takvime derin bağlantı; tümünü okundu işaretle; bildirim ayarlarına kısayol. |
| **Butonlar** | `[Ayarları Yönet]`. |
| **Uyarılar** | Push izni verilmemişse üstte kalıcı kart: "Son ödeme hatırlatmaları kapalı — açmak için dokun." |
| **Metinler** | Boş durum: "Şimdilik sessizlik. Kritik tarihler yaklaşınca burada görürsün." |

## 8.7 Ayarlar

| Öğe | İçerik |
|---|---|
| **Bilgiler** | Profil/hesap durumu (misafir ↔ kayıtlı), bildirim tercihleri (kaç gün önce, hangi kanal), varsayılan grace, gizlilik sayfaları, veri yönetimi, uygulama hakkında + sürüm. |
| **Aksiyonlar** | Hesap oluştur/giriş, bildirim gün/kanal seçimi, verileri dışa aktar (JSON), **tüm verileri sil**, KVKK metinlerini görüntüleme. |
| **Butonlar** | `[Hesap Oluştur]`, `[Verilerimi İndir]`, `[Tüm Verilerimi Sil]` (kırmızı, çift onay). |
| **Uyarılar** | Misafir modda: "Verilerin sadece bu cihazda. Telefon değişiminde kaybolmaması için hesap oluştur." |
| **Metinler** | Güven bloğu: "Kart numaranı, CVV'ni, banka şifreni hiçbir ekranda sormayız." |

## 8.8 Kampanyalar (v1.1)

| Öğe | İçerik |
|---|---|
| **Bilgiler** | Kart bazında kullanıcı girişli kampanya listesi: tür (cashback/puan/taksit), oran veya tutar, alt limit, geçerlilik aralığı, kategori; bitmek üzere olanlar üstte "son X gün" rozetiyle. |
| **Aksiyonlar** | Kampanya ekle/düzenle/sil; kampanyayı öneri motoruna dahil et/etme anahtarı. |
| **Butonlar** | `[+ Kampanya Ekle]`. |
| **Uyarılar** | Süresi geçen kampanya otomatik pasifleşir: "Bonus %5 market kampanyası dün bitti — motor artık hesaba katmıyor." |
| **Metinler** | "Kampanya değeri, faizsiz gün eşdeğerine çevrilerek öneriye yansır (%1 ≈ 7-8 gün)." |

---

# 9. UI/UX Önerileri

## 9.1 Renk paleti

Finans uygulamasında palet iki şeyi aynı anda söylemeli: **güven** (koyu, durağan zemin) ve **kazanç** (canlı, tek vurgu rengi).

| Rol | Renk | Kullanım |
|---|---|---|
| Zemin (koyu tema ana) | Gece laciverti `#0E1726` | Üst bloklar, hero, koyu tema zemini |
| Zemin (açık tema) | Kırık beyaz `#F7F9FC` | Sayfa zemini |
| **Marka/CTA** | Petrol mavisi `#1E5AF5` → veya teal `#0E9F8A` | Birincil butonlar, marka öğeleri |
| **Kazanç/avantaj** | Canlı yeşil `#16C784` | Faizsiz gün rozetleri, "bugünün kartı", avantajlı takvim günleri |
| Dikkat | Amber `#F5A623` | Yaklaşan kesim, %80+ doluluk |
| Risk | Mercan kırmızı `#E5484D` | Son ödeme günü, gecikme, devreden borç |
| Nötr metin | `#0F172A` / `#64748B` | Başlık / ikincil metin |

Kural: kırmızı yalnızca gerçek risk için; "yeşil = gün kazandın, kırmızı = para kaybedersin" eşleşmesi hiçbir ekranda bozulmamalı. Her durum çift kodlanır (renk + ikon/metin) — renk körü erişilebilirliği, WCAG AA kontrast.

## 9.2 Tipografi

- **Tek aile:** Inter veya Manrope (TR karakter desteği tam, SIL açık lisans, rakamları net).
- **Rakamlar kahramandır:** Gün sayıları ve tutarlar `tabular-nums` ile; sonuç ekranındaki gün sayısı 48–64 pt. Kullanıcı ekranı 1 metreden okusa "38" rakamını görmeli.
- Hiyerarşi: Başlık 24/semibold · kart başlığı 17/semibold · gövde 15/regular · destek 13/regular. Tutarlarda binlik ayraç her zaman: `8.000 ₺`.

## 9.3 Kart tasarımı

- Gerçek kredi kartı görseline **benzetme**. Numara girilmediği mesajını görsel dil de vermeli: kartlar; banka rengi + baş harf rozeti + ad taşıyan yumuşak köşeli (16px) "bilgi kartları"dır, embossed numara taklidi yapılmaz.
- Banka logoları yerine kullanıcının seçtiği renk + banka adı (logo telif/marka riski sıfırlanır, v2'de izinli logo anlaşmaları değerlendirilir).
- Her kartın sabit rengi tüm uygulamada kimliktir: takvim noktası, bildirim ikonu, grafik çizgisi aynı renk.

## 9.4 Grafik kullanımı

- **30 günlük pencere şeridi** (kart detayında): yatay şerit üzerinde günler; yükseklik/renk = o gün harcanırsa kaç gün faizsiz. Tek bakışta "dalga" deseni kesim mantığını öğretir.
- Limit doluluğu: ince yatay çubuk (yüzde + ₺ birlikte). Pasta grafik kullanma — küçük ekranda okunmaz.
- Aylık özet (v1.1): "ortalama faizsiz gün" çizgisi, ay-ay; tek metrik, tek çizgi.

## 9.5 Takvim görünümü

- Isı haritası mantığı: gün hücresinin zemin tonu o günün "en iyi kartla faizsiz gün" değerine göre açık→koyu yeşil; kesim günleri ▲, son ödemeler ● kart renginde.
- Bugün hücresi her zaman çerçeveli; geçmiş günler soluk.
- Alt panel takvimle aynı ekranda (modala gizleme) — seçilen günün "bu gün harcanır mı?" cevabı tek dokunuş uzaklıkta.

## 9.6 Hızlı karar arayüzü

- **3 saniye kuralı:** Uygulama açılışından "hangi kart" cevabına en fazla 3 saniye, 0 zorunlu dokunuş (hero kart açılışta hazır).
- **Tek girdili simülasyon:** Sadece tutar; tarih varsayılan "bugün". Gelişmiş alanlar (tarih, taksit) ikinci adımda.
- Sonuç ekranında önce karar ("Axess — 39 gün"), sonra gerekçe; detaylar akordeon altında.
- Sayısal klavye otomatik açılır; tutar alanında hızlı çipler: `1.000` `5.000` `10.000` `Diğer`.

## 9.7 Riskli durum uyarı tasarımı

| Seviye | Görsel dil | Örnek |
|---|---|---|
| Bilgi (mavi, ⓘ) | Satır içi not | "Bu harcama Temmuz ekstresine yansır." |
| Dikkat (amber, ⚠ bottom-sheet) | Alttan kart, tek aksiyon | "Bugün Bonus'un kesim günü. Yarın harcarsan +29 gün." `[Yine de Bonus'u göster]` |
| Risk (kırmızı, tam genişlik banner + push) | Kalıcı banner, iki aksiyon | "Maximum'un son ödemesi YARIN — 4.350 ₺. Gecikme, faiz ve kredi notu kaybı demek." `[Ödedim]` `[Yarın tekrar hatırlat]` |

Kural: kırmızı uyarı her zaman **parasal sonucu** söyler (neden umursamalı?) ve her uyarının kapatma/erteleme aksiyonu vardır — çıkmaz sokak uyarı yok. Korku değil kontrol hissi: "kaçırdın" değil, "şimdi ödersen sorun yok" dili.

# 10. Teknik Mimari

## 10.1 Platform kararı: Mobil mi, web mi, PWA mı?

| Kriter | Native mobil (RN/Flutter) | Web + PWA | Salt web |
|---|---|---|---|
| Geliştirme hızı (AI araçlarla) | Orta | **En hızlı** | En hızlı |
| Dağıtım | Store onayı (gün/hafta) | **Anında** | Anında |
| Push bildirim | **Mükemmel** | Android iyi; iOS 16.4+ PWA push var ama "ana ekrana ekle" şartı sürtünmeli | Yok |
| SEO/organik büyüme | Yok | **Var** (büyüme motorumuz web içeriği) | Var |
| Widget/derin OS entegrasyonu | Var | Yok | Yok |
| Tek kod tabanı | Evet ama store yükü | **Evet** | Evet |

**Karar:** **Faz 1 = Responsive web + PWA.** Gerekçe: (1) Büyüme stratejisi SEO/içerik üzerine kurulu — web zaten şart; (2) AI destekli araçların (Lovable/Bolt) en güçlü olduğu yüzey; (3) hesaplama motoru doğrulanmadan store yatırımı erken. Push zayıflığı Faz 1'de **e-posta hatırlatma + cihaz takvimine ICS ekleme** ile telafi edilir. **Faz 2'de** aynı motoru paylaşan **Expo (React Native)** uygulamasıyla store'lara çıkılır — push ve widget orada çözülür.

## 10.2 Önerilen yığın (stack)

| Katman | Seçim | Gerekçe |
|---|---|---|
| Frontend | **Next.js 14+ (App Router) + TypeScript + Tailwind + shadcn/ui** | AI araçlarının en akıcı ürettiği kombinasyon; PWA desteği; SEO sayfaları aynı projede |
| Hesaplama motoru | **`lib/engine/` altında saf TypeScript modülü** | Sıfır bağımlılıkla UI'dan ve veritabanından bağımsız; hem web'de hem ileride RN'de aynen kullanılır. **Projenin kalbi budur.** |
| Tarih kütüphanesi | **date-fns** (+ `Europe/Istanbul` normalizasyonu) | Hafif, tree-shake edilebilir, test etmesi kolay |
| Backend | **Supabase** (PostgreSQL + Auth + Row Level Security + Edge Functions) | Sunucu yazmadan auth+DB+API; RLS ile kullanıcı izolasyonu DB seviyesinde |
| Barındırma | Vercel (EU bölgesi) + Supabase (Frankfurt `eu-central-1`) | KVKK veri aktarımı açısından AB altyapısı tercih; yine de aydınlatma metninde yurt dışı aktarım beyanı yapılır |
| Bildirim | Faz 1: **Resend** (e-posta) + Web Push (destekleyen cihazlarda) · Faz 2: OneSignal/FCM | Kademeli karmaşıklık |
| Zamanlanmış işler | Supabase `pg_cron` veya Vercel Cron → "yarın son ödemesi olanlar" sorgusu → bildirim kuyruğu | Tek cron, tek sorgu — basit |
| Hata izleme | Sentry | Özellikle tarih hesaplama hatalarını yakalamak için |
| Test | **Vitest** — motor için tablo bazlı (table-driven) birim testler | Bölüm 7.3'teki senaryolar birebir test vakasıdır |

## 10.3 Mimari ilkeler

1. **Motor izole:** `engine/` klasörü React'e, Supabase'e, hiçbir şeye bağımlı olmaz. Girdi: kart nesneleri + tutar + tarih; çıktı: öneri nesnesi. Hesaplama istemci tarafında çalışır (gizlilik + hız); sunucu yalnızca saklama ve bildirim içindir.
2. **Misafir modu = local-first:** Veriler önce `localStorage/IndexedDB`'de; hesap açılırsa Supabase'e taşınır. Auth: Supabase Auth (e-posta sihirli bağlantı + Google). Şifre saklamayız.
3. **Kimlik doğrulama:** Magic link birincil (şifre yönetimi yükü yok), Google OAuth ikincil. Oturum: Supabase JWT, kısa ömürlü access + refresh.

## 10.4 Güvenlik ve KVKK

| Konu | Uygulama |
|---|---|
| **Veri minimizasyonu** | En güçlü güvenlik önlemimiz mimaride: kart numarası/CVV/şifre alanı **yoktur** — sızsa bile finansal işlem yapılabilir veri yok. PCI-DSS kapsamına girilmez. |
| Aktarımda şifreleme | TLS 1.2+ zorunlu, HSTS |
| Durağan şifreleme | Supabase varsayılan AES-256 (disk); hassasiyeti artırmak istenirse limit alanları için `pgcrypto` ile sütun şifreleme (v2) |
| Erişim izolasyonu | **RLS:** her tabloda `user_id = auth.uid()` politikası — yanlış yazılmış tek bir API bile başkasının verisini döndüremez |
| KVKK | Aydınlatma metni + açık rıza (kayıt anında, ayrı onay kutuları: zorunlu işleme / pazarlama); veri sahibi hakları: **dışa aktar (JSON)** ve **tamamen sil (hard delete)** ayarlardan tek tuş; saklama süresi politikası (silinen hesap 30 gün içinde yedeklerden de temizlenir); VERBİS yükümlülüğü eşikleri için hukuk görüşü |
| Loglama | Yapısal log (JSON), **PII'siz** (user_id hash'li, tutar/limit loglanmaz); erişim logları 90 gün |
| Yedekleme | Supabase otomatik günlük yedek + PITR (7 gün); aylık şifreli arşiv |
| Diğer | Rate limiting (Edge), bağımlılık taraması (Dependabot), `npm audit` CI'da |

---

# 11. Veritabanı Modeli

PostgreSQL (Supabase) şeması. Tüm tablolarda RLS aktif; `id` alanları `uuid default gen_random_uuid()`.

```sql
-- USERS: Supabase auth.users'ı genişleten profil
create table profiles (
  id              uuid primary key references auth.users(id) on delete cascade,
  display_name    text,
  created_at      timestamptz not null default now(),
  onboarded_at    timestamptz,            -- ilk kartını eklediği an
  premium_until   timestamptz,            -- null = free
  kvkk_consent_at timestamptz not null,   -- açık rıza zaman damgası
  marketing_opt_in boolean not null default false
);

-- CARDS: kart numarası/CVV alanı YOKTUR (bilinçli tasarım)
create table cards (
  id               uuid primary key default gen_random_uuid(),
  user_id          uuid not null references profiles(id) on delete cascade,
  name             text not null,                  -- "Bonus Platinum"
  bank_name        text not null,                  -- listeden veya serbest
  color            text not null default '#1E5AF5',
  total_limit      numeric(12,2),                  -- null olabilir (girmek istemeyen)
  available_limit  numeric(12,2),
  statement_day    smallint not null check (statement_day between 1 and 31),
  grace_days       smallint not null default 10 check (grace_days between 1 and 30),
  is_active        boolean not null default true,
  carries_debt     boolean not null default false, -- devreden borç işareti (v1.1)
  sort_order       smallint not null default 0,
  notes            text,
  created_at       timestamptz not null default now(),
  updated_at       timestamptz not null default now()
);

-- BILLING_CYCLES: dönem kayıtları (v1.1'de ekstre takibiyle dolar;
-- MVP'de bildirim üretimi için ileriye dönük üretilir)
create table billing_cycles (
  id               uuid primary key default gen_random_uuid(),
  card_id          uuid not null references cards(id) on delete cascade,
  cutoff_date      date not null,                  -- bu dönemin kesimi
  due_date         date not null,                  -- bu dönemin son ödemesi
  statement_amount numeric(12,2),                  -- kullanıcı girer (v1.1)
  paid_amount      numeric(12,2) not null default 0,
  status           text not null default 'open'
                   check (status in ('open','closed','paid','partial','overdue')),
  unique (card_id, cutoff_date)
);

-- PAYMENTS: ödeme işaretlemeleri (v1.1)
create table payments (
  id          uuid primary key default gen_random_uuid(),
  card_id     uuid not null references cards(id) on delete cascade,
  cycle_id    uuid references billing_cycles(id) on delete set null,
  amount      numeric(12,2) not null,
  paid_at     date not null,
  note        text
);

-- SPENDING_SIMULATIONS: ürün analitiği + "son hesaplamalarım"
create table spending_simulations (
  id                  uuid primary key default gen_random_uuid(),
  user_id             uuid not null references profiles(id) on delete cascade,
  amount              numeric(12,2) not null,
  spend_date          date not null,
  recommended_card_id uuid references cards(id) on delete set null,
  result              jsonb not null,   -- tam öneri çıktısı (gün sayıları, elenenler)
  created_at          timestamptz not null default now()
);

-- NOTIFICATIONS: planlanan ve gönderilen bildirimler
create table notifications (
  id            uuid primary key default gen_random_uuid(),
  user_id       uuid not null references profiles(id) on delete cascade,
  card_id       uuid references cards(id) on delete cascade,
  type          text not null check (type in
                ('due_soon','due_today','cutoff_soon','cutoff_today',
                 'opportunity','limit_low','campaign_ending','weekly_summary')),
  title         text not null,
  body          text not null,
  channel       text not null check (channel in ('push','email','inapp')),
  scheduled_for timestamptz not null,
  sent_at       timestamptz,
  read_at       timestamptz,
  unique (user_id, card_id, type, scheduled_for)   -- aynı bildirimi iki kez kurma
);

-- CAMPAIGNS: kullanıcı girişli kampanyalar (v1.1)
create table campaigns (
  id          uuid primary key default gen_random_uuid(),
  card_id     uuid not null references cards(id) on delete cascade,
  title       text not null,                       -- "Market %5 iade"
  type        text not null check (type in ('cashback','points','installment')),
  value_pct   numeric(5,2),                        -- %5 → 5.00
  value_fixed numeric(12,2),                       -- sabit TL iade
  max_benefit numeric(12,2),                       -- iade tavanı
  min_amount  numeric(12,2),                       -- alt harcama şartı
  valid_from  date not null,
  valid_to    date not null,
  is_active   boolean not null default true
);

-- USER_PREFERENCES
create table user_preferences (
  user_id                 uuid primary key references profiles(id) on delete cascade,
  timezone                text not null default 'Europe/Istanbul',
  remind_days_before_due  smallint[] not null default '{3,1}',  -- kaç gün önce
  remind_hour             smallint not null default 9,
  channels                text[] not null default '{email}',    -- email|push|inapp
  conservative_mode       boolean not null default true,        -- kesim günü kuralı
  daily_interest_pct      numeric(6,4) not null default 0.0013, -- kampanya çevrimi
  language                text not null default 'tr'
);

-- RLS örneği (tüm tablolara aynı kalıp uygulanır)
alter table cards enable row level security;
create policy "own cards" on cards
  for all using (auth.uid() = user_id) with check (auth.uid() = user_id);
```

**Tasarım notları:** (1) `cards.grace_days` saklanır, "son ödeme günü" saklanmaz — Bölüm 7.4/2'deki nedenle. (2) `billing_cycles` MVP'de yalnızca bildirim cron'unun ürettiği ileriye dönük kayıtlardır; ekstre tutarı v1.1'de eklenir. (3) `spending_simulations.result` JSONB'dir — motor sürümü değişse de geçmiş sonuçlar bozulmaz; `result.engine_version` alanı tutulur.

---

# 12. Bildirim Sistemi

## 12.1 İlkeler

- **Her bildirim ya para kazandırır ya zarar önler.** "Uygulamaya dönün" tipi içeriksiz bildirim yok.
- Frekans tavanı: kullanıcı başına günde en fazla 1 fırsat bildirimi; **kritik ödeme uyarıları tavandan muaf**.
- Sessiz saatler (fırsat bildirimleri için): 21:00–09:00. Kritikler 09:00'a planlanır.
- Her bildirim derin bağlantıyla ilgili ekrana açılır; her türü ayarlardan tek tek kapatılabilir.

## 12.2 Tetikleyiciler ve örnek metinler

| # | Tetikleyici | Zamanlama | Kanal | Başlık | Gövde |
|---|---|---|---|---|---|
| 1 | Son ödeme yaklaşıyor | D-3, 09:00 | push+e-posta | **Maximum: son ödemeye 3 gün** | 22 Haziran Pazartesi son gün. Şimdi öde, gecikme faizini hiç tanışma listene alma. |
| 2 | Son ödeme yarın | D-1, 09:00 | push+e-posta | **Yarın son gün: Maximum** | Yarın 4.350 ₺ son ödeme günü. 2 dakikanı ayır, rahat uyu. |
| 3 | Son ödeme bugün | D-0, 09:00 | push+e-posta | **Bugün son gün ⏰** | Maximum'un son ödeme günü bugün. Gecikme = faiz + kredi notu hasarı. |
| 4 | Kesim tarihi yaklaşıyor | D-1, 18:00 | push | **Bonus yarın kesiyor** | Büyük harcaman varsa yarına bırak: kesimden sonra ~40 gün faizsiz olur. |
| 5 | Bugün harcama avantajlı (fırsat) | kesim ertesi gün 10:00 | push | **Bugün Bonus günü 🎯** | Bonus dün kesti. Bugünkü harcamalar 11 Ağustos'a kadar faizsiz — tam 40 gün. |
| 6 | Limit azaldı | doluluk >%80 olunca | uygulama içi+push | **Bonus'ta yer azalıyor** | Kullanılabilir limit 2.100 ₺'ye indi (%84 dolu). Büyük harcamaları başka karta yönlendiriyoruz. |
| 7 | Gecikme riski | D+1, borç ödendi işaretlenmediyse (v1.1) | push+e-posta | **Maximum ödendi mi?** | Dün son ödeme günüydü. Ödediysen işaretle; ödemediysen bugün ödemek farkı küçültür. |
| 8 | Kampanya bitiyor | bitişe 2 gün kala 10:00 (v1.1) | push | **%5 iade için son 2 gün** | Bonus market kampanyası 30 Haziran'da bitiyor. Market alışverişini öne çekmek mantıklı olabilir. |
| 9 | Haftalık özet / en avantajlı kart değişti | Pazartesi 09:00 | e-posta | **Bu haftanın kartı: Axess** | Hafta boyu en uzun faizsiz süre Axess'te (35–39 gün). Perşembe'den itibaren Bonus öne geçiyor. Takvimin: … |
| 10 | Veri bakımı dürtmesi | limit 45+ gündür güncellenmediyse | uygulama içi | **Limitler güncel mi?** | Önerilerin isabeti senin verine bağlı. 30 saniyede kullanılabilir limitleri tazele. |

**Metin dili kuralları:** Türkçe, samimi ama ciddiyetini koruyan ton ("sen" dili); sayı ve tarih her zaman somut; korkutma yok, sonuç + aksiyon var; emoji yalnızca fırsat bildirimlerinde, risk bildirimlerinde asla (⏰ istisna).

## 12.3 Teknik akış

```
Günlük cron (09:00 Europe/Istanbul)
 → her aktif kart için motorla sonraki kesim/son ödeme tarihleri hesaplanır
 → user_preferences.remind_days_before_due ile eşleşenlere bildirim kaydı (unique constraint çift kaydı engeller)
 → kanal önceliği: push izni varsa push, yoksa e-posta; ikisi de yoksa uygulama içi
 → gönderim sonucu notifications.sent_at'e işlenir
```

# 13. Monetizasyon Modeli

## 13.1 Modellerin değerlendirmesi

| Model | Potansiyel | Riskler | Karar |
|---|---|---|---|
| **Freemium + Premium abonelik** | Yüksek ve öngörülebilir (MRR); finans uygulamalarında kanıtlanmış | Free katman değeri çözmezse dönüşüm olmaz; erken paywall büyümeyi öldürür | ✅ **Ana model (Faz 2'de açılır)** |
| **Affiliate (kart başvuru yönlendirme)** | TR'de kart başına onaylı başvuru komisyonu yüksek; veri tabanımız "hangi kart eksik" içgörüsü üretir ("kesim tarihlerin 1–10 arasına yığılmış; ay sonu kesimli bir kart portföyünü tamamlar") | **Tarafsızlık algısı** — ürünün varlık nedeni bankadan değil kullanıcıdan yana olmak. Yanlış kurgulanırsa marka intihari | ✅ İkincil model (Faz 3, katı şeffaflık kurallarıyla: "sponsorlu" etiketi + "öneri sıralamasını asla etkilemez" beyanı) |
| Reklamsız kullanım (reklam + kaldırma ücreti) | Düşük ARPU | Finans uygulamasında 3. taraf reklam = güven erozyonu + KVKK karmaşası | ❌ Önerilmez |
| Finansal danışmanlık raporları | Premium içinde "yıllık kart raporu" olarak değerli | Ayrı ürün olarak talep belirsiz; "danışmanlık" kelimesi hukuki yük (Bölüm 16) | ⚠️ Premium'un bir özelliği olsun, ayrı SKU olmasın |
| KOBİ/işletme sürümü | Esnafın nakit akışı kart takvimine birebir bağlı; ödeme istekliliği yüksek | Ayrı ürün yüzeyi, muhasebe entegrasyonu beklentisi | ⏳ Faz 3+ değerlendirme |
| Tek seferlik satın alma | Basit | Sürekli gelir yok, sürdürülemez | ❌ |

## 13.2 Önerilen kurgu

- **Faz 1 (MVP, ilk 3–6 ay): tamamen ücretsiz.** Tek hedef aktivasyon ve elde tutma verisi. Erken paywall, henüz kanıtlanmamış üründe büyümeyi keser.
- **Faz 2: Freemium.**
  - **Free:** 3 kart, temel öneri motoru, standart hatırlatmalar (D-3/D-1), takvim.
  - **Premium (~59–79 ₺/ay veya ~599 ₺/yıl — TR abonelik fiyat bandına göre lansmanla test edilir):** sınırsız kart, kampanya modülü, gelişmiş bildirimler (fırsat bildirimleri, haftalık özet, özel gün/saat), widget, ekstre-borç takibi, yıllık "Kart Karnesi" raporu, ICS takvim aboneliği, öncelikli destek.
  - Paywall ilkesi: **çekirdek söz (doğru kart önerisi) daima ücretsiz** — para, konfor ve derinlikten kazanılır. Bu hem etik hem pazarlama açısından savunulabilir konum.
- **Faz 3: Affiliate katmanı.** "Portföy boşluğu" önerileri ayrı, açıkça işaretlenmiş bir alanda ("Senin takvimine uyacak kartlar"); komisyon beyanı görünür; öneri motorunun çıktısına asla karışmaz.

Kaba hedef matematik (Faz 2 sonu): 100K indirme → ~%40 aktivasyon → ~%25 aylık aktif → ~10K MAU → %4–6 premium dönüşümü → 400–600 abone ≈ 25–45K ₺ MRR + affiliate. Erken dönemde ölçülecek tek şey dönüşüm değil, **D30 elde tutma**dır.

---

# 14. Growth ve Pazarlama Stratejisi

## 14.1 Büyüme tezi

Bu ürünün pazarlaması, ürünün kendisinin yaptığı hesabı içerik olarak dışarı açmaktır: **"insanlar kesim tarihi oyununu bilmiyor; öğreten viral olur."** Türkiye'de "40 gün faizsiz kullanma taktiği" hâlihazırda organik ilgi gören bir konu — sahibi olan marka yok. Boşluk bu.

## 14.2 Kanal planı

| Kanal | Rol | Taktik |
|---|---|---|
| **TikTok/Reels/Shorts** | Farkındalık + viral | 30–45 sn'lik "tek beyaz tahta hesabı" videoları (aşağıda format örnekleri). Haftada 3; ilk 90 gün tutarlılık. |
| **Web hesaplama araçları** | SEO + dönüşüm | Üyeliksiz çalışan "Faizsiz Gün Hesaplayıcı" (kesim günü + harcama tarihi gir → gün sayısını gör). Araç sayfası = en güçlü backlink mıknatısı + uygulamaya geçiş köprüsü. |
| **SEO/Blog** | Sürekli organik akış | Bölüm 15'teki küme planı. |
| **X/Twitter finans topluluğu + Ekşi Sözlük** | Güven ve erken benimseyenler | Kurucu hesabından "build in public" + kesim tarihi ipuçları; Ekşi'de başlık doğal açılmalı (satış dili değil). |
| **Finans içerik üreticileri** | Ölçekli erişim | Orta boy (50–300K) kişisel finans YouTube/Instagram hesaplarıyla iş birliği; anlatması 1 dakika süren somut bir numara olduğu için içerikçi dostu. |
| **Referans (ürün içi)** | Döngü | "Davet et, ikiniz de 1 ay Premium kazanın" (Faz 2). |

## 14.3 Viral mekanizmalar (ürünün içinde)

1. **Paylaşılabilir sonuç kartı:** Simülasyon sonucu tek dokunuşla şık bir görsele dönüşür: "Bugün doğru kartı seçtim → 39 gün faizsiz". Kart numarası zaten yok, paylaşım risksiz.
2. **Aylık karne:** "Haziran'da ortalama 34 gün faizsiz kullandım, 0 gecikme" rozeti.
3. **Hesaplayıcı widget'ı:** Araç sayfası gömülebilir (embed) — finans blogları kendi sitesine ekler, her embed backlink'tir.

## 14.4 İstenen içerik fikirlerinin işlenmesi

| Fikir | Format ve kanca |
|---|---|
| **"Bugün hangi kartla harcama yapmalısın?"** | Haftalık seri (Reels + X başlığı). Kanca: "Bugün ayın 11'i. Kesimi dün olan kartın varsa bugün senin günün." Her bölüm tek kural öğretir; CTA: "Kendi kartların için: KartPilot". |
| **"40 gün faizsiz kullanım taktiği"** | İmza içerik — 60 sn beyaz tahta: "Kesim 10'u. 9'unda harcarsan 11 gün, 11'inde harcarsan 39 gün faizsiz. Aynı kart, 2 gün fark, 28 gün kazanç." En paylaşılabilir varlık; sabit profil videosu yapılır. |
| **"Kredi kartı hesap kesim tarihi nasıl seçilir?"** | Blog uzun yazı + video özeti. Kanca: "Bankaya bir telefonla kesim tarihini değiştirebileceğini biliyor muydun?" — maaş gününe göre ideal kesim formülü + banka banka değiştirme adımları. |
| **"Maaş gününe göre ideal son ödeme tarihi"** | Etkileşimli mini araç + içerik: maaş gününü gir → ideal kesim/son ödeme aralığını gör. Kural: son ödeme, maaştan 1–5 gün sonra olmalı. |
| **"Birden fazla kredi kartı nasıl yönetilir?"** | Kapsamlı rehber (SEO ana sayfası) + "3 kartlı sistem" videosu: kartları kesim tarihlerine göre ayın başı/ortası/sonuna dağıtma stratejisi — ürünün v2 "takvim optimizasyonu" özelliğinin tohumu. |

## 14.5 Lansman dizisi

1. **Hafta -4 → 0:** Hesaplayıcı aracı + 10 temel blog yazısı yayında (uygulamadan önce SEO tohumlanır); bekleme listesi sayfası.
2. **Lansman haftası:** "40 gün taktiği" videosu tüm kanallarda; Product Hunt TR toplulukları, Ekşi, r/finansal paylaşımları; içerikçi iş birliği 2 adet.
3. **Hafta 1–12:** Haftada 3 kısa video + 1 blog; her ayın 1'i "bu ay kartlarını şöyle kullan" e-bülteni (bülten, uygulamasız da değer veren ayrı bir varlıktır).

---

# 15. SEO Stratejisi

## 15.1 Site mimarisi

```
kartpilot.com
├── /                            → değer önerisi + uygulama
├── /araclar/faizsiz-gun-hesaplama        (etkileşimli araç — para sayfası)
├── /araclar/son-odeme-tarihi-hesaplama   (araç)
├── /araclar/maasa-gore-kesim-tarihi      (araç)
├── /blog/...                    → bilgi kümeleri
└── /bankalar/[banka]-hesap-kesim-tarihi  → programatik sayfalar (15+ banka:
        "X bankası hesap kesim tarihi öğrenme ve değiştirme")
```

Araç sayfaları + programatik banka sayfaları, blogdan daha hızlı sıralama getirir; blog kümeleri otoriteyi besler.

## 15.2 Anahtar kelime → içerik planı

| Anahtar kelime | Arama niyeti | Önerilen içerik başlığı | Format |
|---|---|---|---|
| kredi kartı hesap kesim tarihi | Bilgi | "Hesap Kesim Tarihi Nedir? Son Ödeme Tarihiyle Farkı ve Doğru Kullanımı (2026)" | Küme ana sayfası |
| kredi kartı son ödeme tarihi | Bilgi | "Son Ödeme Tarihi Geçerse Ne Olur? Gecikmenin Gerçek Maliyeti" | Blog + SSS şeması |
| hangi kredi kartını kullanmalıyım | Karar | "Bugün Hangi Kredi Kartını Kullanmalısın? 30 Saniyede Hesapla" | Araç + yönlendirme |
| faizsiz kredi kartı kullanımı | Bilgi/Karar | "Kredi Kartını 40 Güne Kadar Faizsiz Kullanmanın Tek Kuralı" | İmza rehber |
| kredi kartı ödeme takibi | Ürün arayışı | "Kredi Kartı Ödemelerini Takip Etmenin En Kolay Yolu (Excel'siz)" | Karşılaştırma + ürün |
| kredi kartı takvimi | Ürün arayışı | "Kredi Kartı Takvimi: Tüm Kesim ve Ödeme Tarihlerin Tek Ekranda" | Ürün sayfası |
| kredi kartı borç takip uygulaması | Ürün arayışı | "En İyi Kredi Kartı Takip Uygulamaları (Banka Şifresi İstemeyenler)" | Liste + güven açısı |
| kredi kartı faizsiz gün hesaplama | İşlem | "Faizsiz Gün Hesaplama Aracı — Kesim Tarihini Gir, Gününü Gör" | **Araç sayfası** |

**Uzun kuyruk eklentileri:** "hesap kesim tarihi değiştirilir mi", "kesim tarihinden sonra yapılan harcama ne zaman ödenir", "kredi kartı asgari ödeme yapılırsa faiz işler mi", "[banka adı] kesim tarihi öğrenme" (programatik), "şubatta hesap kesim tarihi". Her blog yazısı, içinde canlı mini hesaplayıcı gömülü olarak yayınlanır (etkileşim + dönüşüm + dwell time).

---

# 16. Riskler ve Hukuki Konular

> Not: Bu bölüm yol gösterici analizdir; lansman öncesi fintech deneyimli bir avukattan yazılı görüş alınmalıdır.

| Risk | Değerlendirme | Önlem |
|---|---|---|
| **Yanlış yönlendirme (hesap hatası veya yanlış kullanıcı girdisi)** | En kritik ürün riski: kullanıcı "38 gün" diye güvenip öderse ve tarih yanlışsa gecikme faizi öder, suçu uygulamada arar | (1) Muhafazakâr hesap ilkesi (Bölüm 7); (2) her sonuçta "tahmini" ifadesi + "bankanın ekstresi esastır" notu; (3) giriş doğrulamaları (grace<10 uyarısı); (4) ilk ekstreden sonra "tarihler tuttu mu?" teyit sorusu; (5) gün sayısını aralık olarak sunma seçeneği ("~38 gün") |
| **Finansal tavsiye/danışmanlık sayılma** | Uygulama yatırım ürünü önermez, kredi aracılığı yapmaz; matematiksel bilgilendirme sunar — SPK yatırım danışmanlığı kapsamına girmemesi beklenir; BDDK lisanslı faaliyet (ödeme hizmeti, kredi aracılığı) yürütülmez | Tüm metinlerde "bilgilendirme amaçlıdır" çerçevesi; "danışmanlık/tavsiye" kelimelerinden kaçınan UX yazımı ("öneri" yerine yer yer "hesaplama sonucu"); affiliate fazında kredi/kart aracılığı mevzuatı yeniden değerlendirilir (kritik eşik burasıdır); avukat görüşü |
| **KVKK** | Finansal durum verisi (limit, borç) kişisel veridir; sağlık gibi özel nitelikli değildir ama hassastır | Bölüm 10.4'teki paket: açık rıza, aydınlatma, veri minimizasyonu, silme/dışa aktarma hakları, AB bölgesi barındırma + yurt dışı aktarım beyanı, VERBİS değerlendirmesi |
| **Veri sızıntısı** | Kart numarası olmadığı için sızıntının finansal istismar değeri düşük — yine de itibar riski | Veri minimizasyonu (en az veri = en az risk), RLS, loglarda PII yok, sızıntı müdahale planı (72 saat KVKK bildirimi) |
| **Banka verisi/marka kullanımı** | Banka logosu kullanmak marka hakkı sorunu doğurabilir | MVP'de logo yok (renk+ad); banka adları nominatif kullanım; kampanya verisini bankadan kazımak (scraping) yok — kullanıcı girer |
| **Kullanıcı güveni kaybı** | Tek bir "uygulama yüzünden gecikme yaşadım" viral şikâyeti ürünü bitirebilir | Hatırlatmalarda çoklu kanal yedekliliği (push+e-posta), kritik bildirim gönderim logları, müşteri desteğinde önce telafi dili |
| **Store/reklam politikaları** | Finans kategorisinde Apple/Google ek beyanlar ister | Gizlilik beslemeleri (privacy nutrition labels) baştan doğru doldurulur; "finansal hizmet sağlamaz" açıklaması |

## Sorumluluk reddi (uygulama içi örnek metin)

> "KartPilot bir bankacılık veya finansal danışmanlık hizmeti değildir. Uygulamadaki tüm hesaplamalar, sizin girdiğiniz tarih ve tutarlara dayanan **tahminlerdir**. Hesap kesim tarihi, son ödeme tarihi ve borç tutarınız için bankanızın ekstresi ve resmî kanalları esastır. Faizsiz kullanım, dönem borcunuzun son ödeme tarihine kadar **tamamının** ödenmesi koşuluna bağlıdır; aksi durumda bankanız faiz uygular. KartPilot, girilen bilgilerin doğruluğundan ve buna bağlı sonuçlardan sorumlu tutulamaz."

Bu metin: (1) onboarding'in güven ekranında kısaltılmış hâliyle, (2) her simülasyon sonucunun altında tek cümle olarak ("Tahminidir; bankanızın ekstresi esastır."), (3) ayarlar > yasal bölümünde tam metin olarak yaşar.

---

# 17. Rakip Analizi

## 17.1 Manzara

| Kategori | Örnekler | Ne yapar | Bizim soruya cevabı |
|---|---|---|---|
| **Banka uygulamaları** | Garanti BBVA, İş Bankası (İşCep), Yapı Kredi, Akbank | Kendi kartının ekstre/borç/limitini gösterir, öder | ❌ Yalnız kendi kartı; "hangi kartla harca" sorusunu yapısal olarak soramaz (çıkar çatışması) |
| **Karşılaştırma/başvuru platformları** | HangiKredi, EnUygun, Teklifimgelsin | Yeni kart/kredi başvurusu karşılaştırır | ❌ Sahip olduğun kartların gündelik yönetimi yok; gelir modeli başvuru komisyonu |
| **Bütçe/harcama takip** | Spendee, Money Manager, Wallet, Monay; TR'de banka bağlantılı PFM girişimleri | Geçmiş harcamayı kategorize eder | ❌ Geçmişe bakar; kesim tarihi optimizasyonu yok; çoğu banka bağlantısı/SMS erişimi ister (güven bariyeri) |
| **Fatura/ödeme hatırlatıcılar** | Genel hatırlatma uygulamaları, takvim | Tarih hatırlatır | ⚠️ Sadece modül 4'ümüzü kısmen yapar; hesaplama zekâsı yok |
| **Global kart optimizasyonu** | MaxRewards, CardPointers (ABD) | "Hangi kartla ödersen en çok **puan/cashback**" | ⚠️ En yakın akrabalar — ama optimizasyon ekseni **ödül**; faizsiz gün (grace) optimizasyonu ikincil bile değil. TR pazarında yoklar |
| **Kapanmış örnek** | Tally (ABD, 2024'te kapandı) | Kart borcu refinansmanı | Ders: kart borcu acı noktası gerçek; sermaye yoğun modeller (kredi verme) riskli — bizim modelimiz yazılım-hafif |

## 17.2 Sonuç ve farkımız

**Türkiye'de "kesim tarihine göre kart öneren" konumlanmış bir oyuncu yok; globalde de bu eksen (grace optimizasyonu) boş.** Nedeni muhtemelen pazarların farkı: ABD'de kartlar ödül ekonomisiyle yarışır (MaxRewards oraya kurulmuş), Türkiye'de ise yüksek faiz ortamında **faizsiz gün** somut paradır. Yani model, TR pazar koşullarının ürünüdür ve yerel oyun alanı açıktır.

Fark cümlemiz: **"Banka şifren olmadan, kart numaran olmadan, 1 dakikalık kurulumla: her harcamada en uzun faizsiz gün."**

Savunma hattı (moat): ürün matematiği kopyalanabilir; kalıcı avantaj (1) kategori adını sahiplenen içerik/SEO varlığı, (2) güven markası ("şifre istemeyen uygulama"), (3) kullanıcının girdiği veri + alışkanlık verisiyle kişiselleşen öneriler. Bu yüzden growth (Bölüm 14) ürünün parçasıdır, sonrası değil.

# 18. Kullanıcı Güvenini Artırma

## 18.1 Mimari güven (söylemden önce yapı)

Güven önce mimaride kurulur, sonra anlatılır:

- **Toplanan veri listesi kapalıdır:** kart adı, banka adı, kesim günü, son ödeme günü, limit (isteğe bağlı), kullanılabilir limit (isteğe bağlı). Bu altı alan dışında finansal veri alanı **uygulamada var olmaz** — form tasarımı bile bunu gösterir (16 haneli kutu yok).
- **Asla istenmeyenler:** kart numarası, CVV, son kullanma tarihi, internet bankacılığı kullanıcı/şifresi, SMS erişimi, e-posta gelen kutusu erişimi, rehber, konum.
- **Misafir modu:** Hiç hesap açmadan, e-posta bile vermeden tam değer alınabilir.
- **Çıkış kapısı görünür:** "Verilerimi indir" ve "Hepsini sil" ayarların en üst seviyesinde — gömülü değil.
- Limit alanları **isteğe bağlıdır**: "limitini yazmak istemiyorsan boş bırak, sıralamayı yine yaparız."

## 18.2 Güven mesajlarının yerleşimi

| Yer | Mesaj |
|---|---|
| Onboarding 2. ekran (tam sayfa) | Büyük kalkan görseli + **"Kart numaranı asla istemiyoruz."** Alt metin: "KartPilot'un işi tarih matematiği. Bunun için sadece kesim ve ödeme günlerin yeterli. Kart numaran, CVV'n, banka şifren — bunların hiçbirini sormayız, saklamayız." |
| Kart ekleme formunun üstü | 🔒 satırı: "Bu formda kart numarası alanı yok — bilerek." |
| Limit alanının yanı (ⓘ) | "Limit bilgisi sadece 'bu kartın limiti yeter mi?' kontrolü için. İstemezsen boş bırak." |
| App Store / Play Store açıklaması | İlk paragrafta: "Banka şifresi yok. Kart numarası yok. SMS izni yok." |
| Web ana sayfa | "Neden güvenli?" bölümü: 3 madde + "Hangi veriyi neden topluyoruz" tablosuna bağlantı |
| Ayarlar > Gizlilik | Sade dille yazılmış "Veri Sözümüz" sayfası (hukuki metinden ayrı, okunabilir versiyon) |

## 18.3 "Veri Sözümüz" (uygulama içi sade metin önerisi)

> **Ne topluyoruz?** Kartına taktığın isim, bankasının adı, kesim ve son ödeme günleri; istersen limitlerin.
> **Ne toplamıyoruz?** Kart numarası, CVV, şifre, SMS, harcama dökümü. Bu uygulamayla kartından tek kuruş harcanamaz — çünkü harcamaya yarayan hiçbir bilgi bizde yok.
> **Veri kimde?** Hesap açmadıysan sadece telefonunda. Hesap açtıysan şifreli olarak AB'deki sunucumuzda; dilediğin an indir ya da kalıcı olarak sil.
> **Para nereden?** Premium abonelikten. Verini satmıyoruz, reklamcıya açmıyoruz.

---

# 19. Örnek Uygulama Metinleri

## 19.1 İstenen mikro metinler

| Bağlam | Metin |
|---|---|
| Kart ekleme butonu | **Kart Ekle** · boş durumda: **İlk kartını ekle — 1 dakika sürer** |
| Hesap kesim tarihi alanı | **Hesap kesim günün hangisi?** · yardım: "Ekstrenin kesildiği gün. Son ekstrenin üstünde yazar." |
| Bugünün kartı (ana ekran) | **Bugünün kartı: Axess** · "Bugün harcarsan **39 gün** faizsiz kullanırsın." |
| Simülasyon sonucu | **Bu kartla ~38 gün faizsiz kullanım** · alt: "Kesim: 12 Haziran · Son ödeme: 22 Temmuz · Temmuz ekstresine yansır" |
| Limit yetersiz | **Limit yetersiz** · "World'de 5.200 ₺ kullanılabilir alan var; bu harcama 8.000 ₺. Bu yüzden sıralamaya almadık." |
| Son ödeme yaklaşıyor | **Son ödemeye 3 gün: Maximum** · "22 Haziran Pazartesi'ye kadar 4.350 ₺. Şimdi ödersen mesele kalmaz." |
| Ekstre bilgilendirme | **Bu harcama bir sonraki ekstreye yansıyabilir** · "Bugün kesim günü. Banka işlemi yarına yazarsa Temmuz, bugüne yazarsa Haziran ekstresinde görünür — garantiye almak için yarın harca." |
| Güvenlik (genel) | **Bilgilerin güvende** · "Kart numarası, CVV ve şifre istemiyoruz; istemeyeceğiz." |
| Güvenlik (form üstü) | **Kart numarası istemiyoruz** · "Bu formda 16 haneli kutu görmeyeceksin — bilerek yok." |

## 19.2 Ek mikro metinler (durumlar)

| Durum | Metin |
|---|---|
| Boş ana ekran | "Kartlarını ekle; sana her gün 'bugün hangi kart' diyelim." |
| İkinci kart teşviki | "Bir kart daha ekle — karşılaştırma asıl o zaman başlıyor." |
| Bildirim izni isteme (bağlamlı) | "Son ödeme gününü kaçırmaman için tam zamanında bir hatırlatma göndereceğiz. Başka bildirim yok, söz." |
| Hesap oluşturma teşviki (misafir) | "Verilerin şu an sadece bu telefonda. 10 saniyede hesap aç, telefon değişse de kaybolmasın." |
| Kart silme onayı | "Axess silinsin mi? Bu kartın tarihleri ve hatırlatmaları da silinir. Bu işlem geri alınamaz." |
| Veri silme onayı | "Tüm verilerin kalıcı olarak silinecek. İstersen önce bir kopyasını indir. → [Önce İndir] [Kalıcı Olarak Sil]" |
| Kesim günü uyarısı | "Bugün bu kartın kesim günü. Acelesi olmayan harcamayı yarına bırak: +29 gün kazanırsın." |
| Genel hata | "Bir şeyler ters gitti, hesaplayamadık. Verilerin güvende — tekrar dener misin?" |
| Tarih doğrulama uyarısı | "Kesim ile son ödeme arası 10 günden az görünüyor. Türkiye'de bu süre en az 10 gündür — ekstrenden kontrol etmeni öneririz." |
| Yıllık karne (premium) | "2026'da ortalama 33 gün faizsiz kullandın; 0 gecikme. Kartlarını senden iyi yöneten yok." |

**Yazım tonu rehberi:** "Sen" dili; kısa cümle; her metinde ya somut sayı ya net aksiyon; suçlayıcılık yok ("kaçırdın" değil "şimdi ödersen sorun yok"); finans jargonu yerine gündelik Türkçe ("ekstre borcunun tamamı" gibi zorunlu terimler ilk kullanımda bir cümleyle açıklanır).

---

# 20. Sonuç ve Yol Haritası

## Aşama 1 — MVP (≈ 4–6 hafta; AI araçlarıyla 2–3 hafta)

**Hedef:** Çekirdek döngünün ("kart ekle → öneri al → ödemeyi kaçırma") gerçek kullanıcıyla doğrulanması.

| Öncelik | İş | Kapsam |
|---|---|---|
| P0 | Hesaplama motoru + birim testler | Bölüm 7 algoritması; 8 senaryo + kenar durumlar; tablo bazlı testler — **ilk yazılacak kod budur** |
| P0 | Kart CRUD (numarasız) + doğrulamalar | Bölüm 5.2 formu |
| P0 | Simülasyon ekranı + "bugünün kartı" | Bölüm 8.1, 8.4 |
| P0 | Misafir modu (local-first) + opsiyonel hesap (Supabase) | Bölüm 10.3 |
| P1 | Takvim ekranı | Bölüm 8.5 (ICS hariç) |
| P1 | E-posta hatırlatma (D-3/D-1) + günlük cron | Bölüm 12.3 |
| P1 | Onboarding + güven ekranı + yasal metinler | Bölüm 18 |
| P2 | Web hesaplayıcı aracı + 10 SEO yazısı | Büyüme tohumu, uygulamayla eşzamanlı |

**Başarı ölçütleri:** kayıt→ilk kart ekleme ≥ %60; kart ekleyenlerin ilk hafta simülasyon kullanımı ≥ %70; D30 elde tutma ≥ %20; hesap hatası bildirimi = 0.

## Aşama 2 — Gelişmiş takip ve bildirimler (≈ 2–3 ay)

Öncelik sırasıyla: (1) Expo ile iOS/Android uygulama (aynı motor) + gerçek push; (2) ekstre-borç takibi ve "ödendi" akışı (billing_cycles doldurulur); (3) bildirim merkezi + kişiselleştirilmiş tercihleri; (4) widget + karanlık mod; (5) ICS takvim aboneliği; (6) haftalık özet e-bülteni; (7) Premium altyapısı (RevenueCat/Stripe) ve paywall — **fiyat testiyle**.

**Başarı ölçütleri:** push opt-in ≥ %55; D30 ≥ %30; gecikme yaşayan kullanıcı oranında ölçülebilir düşüş; premium dönüşüm ≥ %3 (ilk kohortlarda).

## Aşama 3 — Kampanyalar, premium derinlik, yapay zekâ (3–6 ay)

(1) Kampanya modülü (kullanıcı girişli) + kampanyalı öneri; (2) takvim optimizasyonu önerileri ("kesim tarihlerini şöyle dağıt"); (3) yıllık Kart Karnesi raporu; (4) affiliate katmanı (Bölüm 13 kurallarıyla, hukuk görüşü sonrası); (5) AI asistan: alışkanlık öğrenme, doğal dille soru ("tatil ödemesini hangi kartla, ne zaman yapayım?"); (6) açık bankacılık fizibilitesi; (7) KOBİ sürümü değerlendirmesi.

**Başarı ölçütleri:** MRR hedefi (Bölüm 13.2 matematiği), organik trafikten kurulum payı ≥ %40, NPS ≥ 50.

---

# 21. Ekstra: Yapay Zekâ Destekli Geliştirme Planı

## 21.1 Araç seçimi

| Araç | Bu projedeki yeri |
|---|---|
| **Cursor (veya Claude Code)** | **Motor + testler burada yazılır.** Hesaplama mantığı projenin tek "yanlış yapılamaz" parçası; test-first, kontrollü ortamda geliştirilmeli. |
| **Lovable** | **UI + Supabase iskeleti burada.** React+Supabase entegrasyonu yerleşik; ekranları hızlı kurar. Motor, hazır dosya olarak içine yapıştırılır. |
| Bolt / Replit | Lovable alternatifi; Lovable tıkanırsa B planı. Replit, cron/edge function denemeleri için pratik. |
| v0 | Tekil ekran tasarım varyasyonları üretmek için takviye. |

**İş bölümü ilkesi:** *Matematik Cursor'da test-first; görünüm Lovable'da hızlı; ikisinin sınırı `engine` klasörüdür.* AI aracına "faizsiz gün mantığını kendin kur" dedirtmeyin — hazır motoru verin, sadece çağırmasını isteyin. (Bunun için hazır başlangıç promptu: [lovable-starter-prompt.md](lovable-starter-prompt.md))

## 21.2 Adım adım plan (≈ 2–3 hafta)

1. **Gün 1–2 — Motor (Cursor):** `engine/` paketi: `interestFreeDays()`, `recommend()`, tipler; Bölüm 7.3'teki 8 senaryo + eşitlik bozma + eleme vakaları Vitest'te. Tüm testler yeşil olmadan UI'a geçilmez.
2. **Gün 3–5 — İskelet (Lovable):** Starter prompt ile: Next.js + Supabase projesi, kart CRUD, misafir modu (localStorage), 4 sekmeli gezinme, tasarım sistemi (Bölüm 9 paleti).
3. **Gün 6–8 — Entegrasyon:** Motor dosyaları projeye eklenir; simülasyon ekranı + "bugünün kartı" motora bağlanır; elenen kart gerekçeleri ve bekleme ipucu UI'da.
4. **Gün 9–11 — Takvim + bildirim:** takvim ekranı; Supabase cron + Resend ile D-3/D-1 e-postaları (hesap açan kullanıcılar için).
5. **Gün 12–14 — Cila + yasal + yayın:** onboarding, güven ekranları, KVKK metinleri, boş/hata durumları, PWA manifesti, Vercel yayını.
6. **Sürekli:** Her Lovable değişikliğinden sonra motor testleri lokalde koşulur (Lovable'ın motora dokunmadığının sigortası).

## 21.3 Kaçınılacak karmaşıklık (MVP için "hayır" listesi)

- Mikroservis, ayrı backend API, Docker, Redis — **hayır**: Supabase + istemci motoru yeter.
- Banka entegrasyonu, SMS okuma, ekstre PDF parse — **hayır**: güven modelini ve kapsamı bozar.
- Çoklu dil, çoklu para birimi — **hayır**: TR/₺ sabit.
- Global state kütüphaneleri, aşırı soyutlama — **hayır**: React Query + yerel durum yeter.
- Özel tasarım sistemi — **hayır**: shadcn/ui + Bölüm 9 paleti.

## 21.4 Test edilebilirlik sözleşmesi

- `engine/` %100 satır kapsamı (küçük modül için gerçekçi); tablo bazlı testler Bölüm 7.3 tablosuyla birebir aynı isimleri taşır.
- Kabul testi (E2E, Playwright — v1.0 sonunda bir mutlu yol): kart ekle → 8.000 ₺ simüle et → önerilen kart ve gün sayısı doğrula.
- Her motor değişikliği `engine_version` artırır; simülasyon kayıtlarına yazılır (geriye dönük hata ayıklama).

---

*Doküman sonu. Bu doküman canlıdır: her faz kapanışında "öğrendiklerimiz" bölümü eklenerek güncellenmesi önerilir.*





