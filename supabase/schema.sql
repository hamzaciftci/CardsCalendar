-- =====================================================================
-- KartPilot — Supabase/PostgreSQL şeması (v1)
--
-- NE ZAMAN: MVP misafir modla (localStorage) çalışır; bu şema, hesap +
--   bulut senkron fazına geçerken uygulanır. Şimdiden hazır dursun diye var.
-- NASIL: Supabase Dashboard → SQL Editor → bu dosyayı yapıştır → Run.
--   (Bir kez çalıştırılmak üzere yazılmıştır.)
-- GÜVENLİK İLKESİ: Kart numarası / CVV / şifre alanı bilinçli olarak YOKTUR
--   (ürün dokümanı §10.4 ve §18 — veri minimizasyonu).
-- Tüm tablolarda RLS aktiftir: kullanıcı yalnızca kendi verisini görür.
-- =====================================================================

-- ---------------------------------------------------------------------
-- PROFILES — auth.users'ı genişleten profil
-- ---------------------------------------------------------------------
create table public.profiles (
  id               uuid primary key references auth.users(id) on delete cascade,
  display_name     text,
  created_at       timestamptz not null default now(),
  onboarded_at     timestamptz,            -- ilk kartını eklediği an
  premium_until    timestamptz,            -- null = free
  kvkk_consent_at  timestamptz,            -- kayıt akışında uygulama yazar
  marketing_opt_in boolean not null default false
);

alter table public.profiles enable row level security;

create policy "profiles_own" on public.profiles
  for all to authenticated
  using (auth.uid() = id) with check (auth.uid() = id);

-- Yeni auth kullanıcısı oluşunca profil satırı otomatik açılır
create or replace function public.handle_new_user()
returns trigger
language plpgsql security definer set search_path = public
as $$
begin
  insert into public.profiles (id) values (new.id)
  on conflict (id) do nothing;
  return new;
end;
$$;

create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();

-- ---------------------------------------------------------------------
-- CARDS — kart numarası/CVV alanı yoktur (bilinçli tasarım)
-- ---------------------------------------------------------------------
create table public.cards (
  id               uuid primary key default gen_random_uuid(),
  user_id          uuid not null references public.profiles(id) on delete cascade,
  name             text not null,                  -- "Bonus Platinum"
  bank_name        text not null,
  color            text not null default '#1E5AF5',
  total_limit      numeric(12,2) check (total_limit is null or total_limit > 0),
  available_limit  numeric(12,2) check (available_limit is null or available_limit >= 0),
  statement_day    smallint not null check (statement_day between 1 and 31),
  grace_days       smallint not null default 10 check (grace_days between 1 and 30),
  is_active        boolean not null default true,
  carries_debt     boolean not null default false, -- devreden borç işareti (v1.1)
  sort_order       smallint not null default 0,
  notes            text,
  created_at       timestamptz not null default now(),
  updated_at       timestamptz not null default now(),
  -- motorla aynı kural: kullanılabilir limit toplam limiti aşamaz
  constraint available_lte_total
    check (available_limit is null or total_limit is null or available_limit <= total_limit)
);

create index cards_user_idx on public.cards (user_id);

alter table public.cards enable row level security;

create policy "cards_own" on public.cards
  for all to authenticated
  using (auth.uid() = user_id) with check (auth.uid() = user_id);

-- updated_at otomatik güncellensin
create or replace function public.set_updated_at()
returns trigger language plpgsql as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

create trigger cards_set_updated_at
  before update on public.cards
  for each row execute function public.set_updated_at();

-- ---------------------------------------------------------------------
-- BILLING_CYCLES — dönem kayıtları
-- MVP'de bildirim cron'u ileriye dönük üretir; ekstre tutarı v1.1'de dolar
-- ---------------------------------------------------------------------
create table public.billing_cycles (
  id               uuid primary key default gen_random_uuid(),
  card_id          uuid not null references public.cards(id) on delete cascade,
  cutoff_date      date not null,
  due_date         date not null,
  statement_amount numeric(12,2),
  paid_amount      numeric(12,2) not null default 0,
  status           text not null default 'open'
                   check (status in ('open','closed','paid','partial','overdue')),
  unique (card_id, cutoff_date),
  check (due_date > cutoff_date)
);

create index billing_cycles_due_idx on public.billing_cycles (due_date);

alter table public.billing_cycles enable row level security;

create policy "billing_cycles_own" on public.billing_cycles
  for all to authenticated
  using (exists (select 1 from public.cards c
                 where c.id = card_id and c.user_id = auth.uid()))
  with check (exists (select 1 from public.cards c
                      where c.id = card_id and c.user_id = auth.uid()));

-- ---------------------------------------------------------------------
-- PAYMENTS — ödeme işaretlemeleri (v1.1)
-- ---------------------------------------------------------------------
create table public.payments (
  id          uuid primary key default gen_random_uuid(),
  card_id     uuid not null references public.cards(id) on delete cascade,
  cycle_id    uuid references public.billing_cycles(id) on delete set null,
  amount      numeric(12,2) not null check (amount > 0),
  paid_at     date not null,
  note        text
);

create index payments_card_idx on public.payments (card_id);

alter table public.payments enable row level security;

create policy "payments_own" on public.payments
  for all to authenticated
  using (exists (select 1 from public.cards c
                 where c.id = card_id and c.user_id = auth.uid()))
  with check (exists (select 1 from public.cards c
                      where c.id = card_id and c.user_id = auth.uid()));

-- ---------------------------------------------------------------------
-- SPENDING_SIMULATIONS — "son hesaplamalarım" + ürün analitiği
-- ---------------------------------------------------------------------
create table public.spending_simulations (
  id                  uuid primary key default gen_random_uuid(),
  user_id             uuid not null references public.profiles(id) on delete cascade,
  amount              numeric(12,2) not null,
  spend_date          date not null,
  recommended_card_id uuid references public.cards(id) on delete set null,
  result              jsonb not null,  -- tam motor çıktısı; result.engine_version içerir
  created_at          timestamptz not null default now()
);

create index simulations_user_idx
  on public.spending_simulations (user_id, created_at desc);

alter table public.spending_simulations enable row level security;

create policy "simulations_own" on public.spending_simulations
  for all to authenticated
  using (auth.uid() = user_id) with check (auth.uid() = user_id);

-- ---------------------------------------------------------------------
-- NOTIFICATIONS — planlanan/gönderilen bildirimler
-- ---------------------------------------------------------------------
create table public.notifications (
  id            uuid primary key default gen_random_uuid(),
  user_id       uuid not null references public.profiles(id) on delete cascade,
  card_id       uuid references public.cards(id) on delete cascade,
  type          text not null check (type in
                ('due_soon','due_today','cutoff_soon','cutoff_today',
                 'opportunity','limit_low','campaign_ending','weekly_summary')),
  title         text not null,
  body          text not null,
  channel       text not null check (channel in ('push','email','inapp')),
  scheduled_for timestamptz not null,
  sent_at       timestamptz,
  read_at       timestamptz,
  -- aynı bildirimi iki kez kurmayı engeller (cron tekrar koşsa bile)
  unique (user_id, card_id, type, scheduled_for)
);

create index notifications_pending_idx
  on public.notifications (scheduled_for) where sent_at is null;

alter table public.notifications enable row level security;

create policy "notifications_own" on public.notifications
  for all to authenticated
  using (auth.uid() = user_id) with check (auth.uid() = user_id);

-- ---------------------------------------------------------------------
-- CAMPAIGNS — kullanıcı girişli kampanyalar (v1.1)
-- ---------------------------------------------------------------------
create table public.campaigns (
  id          uuid primary key default gen_random_uuid(),
  card_id     uuid not null references public.cards(id) on delete cascade,
  title       text not null,                       -- "Market %5 iade"
  type        text not null check (type in ('cashback','points','installment')),
  value_pct   numeric(5,2) check (value_pct is null or value_pct > 0),
  value_fixed numeric(12,2) check (value_fixed is null or value_fixed > 0),
  max_benefit numeric(12,2),
  min_amount  numeric(12,2),
  valid_from  date not null,
  valid_to    date not null,
  is_active   boolean not null default true,
  check (valid_to >= valid_from),
  -- yüzde veya sabit tutardan en az biri girilmeli
  check (value_pct is not null or value_fixed is not null)
);

create index campaigns_card_idx on public.campaigns (card_id, valid_to);

alter table public.campaigns enable row level security;

create policy "campaigns_own" on public.campaigns
  for all to authenticated
  using (exists (select 1 from public.cards c
                 where c.id = card_id and c.user_id = auth.uid()))
  with check (exists (select 1 from public.cards c
                      where c.id = card_id and c.user_id = auth.uid()));

-- ---------------------------------------------------------------------
-- USER_PREFERENCES
-- ---------------------------------------------------------------------
create table public.user_preferences (
  user_id                uuid primary key references public.profiles(id) on delete cascade,
  timezone               text not null default 'Europe/Istanbul',
  remind_days_before_due smallint[] not null default '{3,1}',
  remind_hour            smallint not null default 9 check (remind_hour between 0 and 23),
  channels               text[] not null default '{email}',
  conservative_mode      boolean not null default true,   -- kesim günü kuralı (motor §7.2)
  daily_interest_pct     numeric(6,4) not null default 0.0013, -- kampanya→gün çevrimi
  language               text not null default 'tr'
);

alter table public.user_preferences enable row level security;

create policy "preferences_own" on public.user_preferences
  for all to authenticated
  using (auth.uid() = user_id) with check (auth.uid() = user_id);

-- =====================================================================
-- Son. Sonraki adımlar (şema dışı, Supabase panelinden):
--  1. Auth → Providers: Email (magic link) + Google'ı aç.
--  2. Auth → URL Configuration: site URL'ini ekle.
--  3. Faz 2'de bildirim cron'u: pg_cron extension + Edge Function
--     (her gün 09:00 Europe/Istanbul'da yarın/3 gün sonrası son ödemeleri tara).
-- =====================================================================
