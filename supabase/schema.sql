-- ============================================================
-- CAXANDRA — Esquema de base de datos (Supabase / PostgreSQL)
-- Ejecutar en el SQL Editor de Supabase, BLOQUE POR BLOQUE, en orden.
-- ============================================================


-- ============================================================
-- BLOQUE 1 — PERFILES
-- Un perfil por cada usuario registrado. Se crea solo (trigger) al
-- registrarse. is_admin = la pronosticadora / superadmin.
-- ============================================================

create table if not exists public.profiles (
  id          uuid primary key references auth.users (id) on delete cascade,
  email       text not null,
  full_name   text,
  is_admin    boolean not null default false,
  created_at  timestamptz not null default now()
);

alter table public.profiles enable row level security;

-- Cada quien lee y edita SU perfil; el admin lo ve todo.
create policy "perfil propio - leer"
  on public.profiles for select
  using (auth.uid() = id or exists (
    select 1 from public.profiles p where p.id = auth.uid() and p.is_admin
  ));

create policy "perfil propio - actualizar"
  on public.profiles for update
  using (auth.uid() = id);

-- Crear perfil automáticamente cuando nace un usuario en auth.users
create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer set search_path = public
as $$
begin
  insert into public.profiles (id, email)
  values (new.id, new.email)
  on conflict (id) do nothing;
  return new;
end;
$$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();


-- ============================================================
-- BLOQUE 2 — CATÁLOGO (paquetes y servicios)
-- Lectura pública. Solo el admin escribe.
-- ============================================================

create table if not exists public.packages (
  id              uuid primary key default gen_random_uuid(),
  slug            text unique not null,          -- 'p30', 'p90', 'p240'
  name            text not null,
  total_predictions int not null,                -- 30 / 90 / 240
  daily_rate      int not null,                  -- 1 / 3 / 8 (tope: 8)
  price_usd       numeric(10,2) not null,
  active          boolean not null default true,
  sort_order      int not null default 0
);

create table if not exists public.services (
  id          uuid primary key default gen_random_uuid(),
  slug        text unique not null,              -- 'analisis', 'seminario'
  name        text not null,
  price_usd   numeric(10,2) not null,
  once_per_user boolean not null default false,  -- seminario = true
  active      boolean not null default true
);

alter table public.packages enable row level security;
alter table public.services enable row level security;

create policy "catalogo paquetes - lectura publica"
  on public.packages for select using (true);

create policy "catalogo servicios - lectura publica"
  on public.services for select using (true);

-- Datos iniciales (precios viven aquí, no en el código del front)
insert into public.packages (slug, name, total_predictions, daily_rate, price_usd, sort_order) values
  ('p30',  '30 Predicciones Mensuales',  30, 1, 1.99, 1),
  ('p90',  '90 Predicciones Mensuales',  90, 3, 4.99, 2),
  ('p240', '240 Predicciones Mensuales', 240, 8, 8.99, 3)
on conflict (slug) do nothing;

insert into public.services (slug, name, price_usd, once_per_user) values
  ('analisis',  'Análisis Personalizado', 4.99,  false),
  ('seminario', 'Seminario Especializado', 99.99, true)
on conflict (slug) do nothing;


-- ============================================================
-- BLOQUE 3 — SUSCRIPCIONES (el saldo de pronósticos)
-- Una suscripción activa por usuario. El saldo baja con cada entrega.
-- ============================================================

create table if not exists public.subscriptions (
  id                  uuid primary key default gen_random_uuid(),
  user_id             uuid not null references public.profiles (id) on delete cascade,
  package_id          uuid not null references public.packages (id),
  daily_rate          int not null,              -- copiado del paquete al comprar
  total_predictions   int not null,              -- saldo inicial
  remaining_predictions int not null,            -- saldo restante (llega a 0 -> vencida)
  status              text not null default 'active'
                        check (status in ('active', 'expired')),
  created_at          timestamptz not null default now(),
  expired_at          timestamptz
);

-- Solo UNA suscripción activa por usuario (la mejora reemplaza, no suma).
create unique index if not exists one_active_sub_per_user
  on public.subscriptions (user_id)
  where (status = 'active');

create index if not exists idx_sub_user on public.subscriptions (user_id);

alter table public.subscriptions enable row level security;

create policy "suscripcion propia - leer"
  on public.subscriptions for select
  using (auth.uid() = user_id or exists (
    select 1 from public.profiles p where p.id = auth.uid() and p.is_admin
  ));


-- ============================================================
-- BLOQUE 4 — PRONÓSTICOS Y ENTREGAS (el corazón del control)
-- ============================================================

-- Lo que crea la pronosticadora cada día. Posición 1..8.
create table if not exists public.predictions (
  id          uuid primary key default gen_random_uuid(),
  match_date  date not null,                     -- día del set de pronósticos
  position    int not null check (position between 1 and 8),
  title       text not null,                     -- p.ej. "Real Madrid vs Barcelona"
  content     text not null,                     -- el análisis / pick
  created_at  timestamptz not null default now(),
  unique (match_date, position)                  -- no dos pronósticos en la misma posición/día
);

-- Registro de envíos: qué pronóstico se mandó a qué usuario.
create table if not exists public.prediction_deliveries (
  id            uuid primary key default gen_random_uuid(),
  prediction_id uuid not null references public.predictions (id) on delete cascade,
  user_id       uuid not null references public.profiles (id) on delete cascade,
  delivered_at  timestamptz not null default now(),
  unique (prediction_id, user_id)                -- IMPOSIBLE reenviar el mismo a la misma persona
);

create index if not exists idx_deliv_user on public.prediction_deliveries (user_id);

alter table public.predictions enable row level security;
alter table public.prediction_deliveries enable row level security;

-- El usuario NO lee predictions directamente; solo ve las que se le entregaron.
create policy "entregas propias - leer"
  on public.prediction_deliveries for select
  using (auth.uid() = user_id or exists (
    select 1 from public.profiles p where p.id = auth.uid() and p.is_admin
  ));

-- predictions: solo el admin las lee directo (el usuario las recibe por correo).
create policy "predicciones - solo admin lee"
  on public.predictions for select
  using (exists (
    select 1 from public.profiles p where p.id = auth.uid() and p.is_admin
  ));


-- ============================================================
-- BLOQUE 5 — ÓRDENES DE SERVICIO Y PAGOS
-- ============================================================

-- Análisis personalizado y seminario (compras únicas).
create table if not exists public.service_orders (
  id            uuid primary key default gen_random_uuid(),
  user_id       uuid not null references public.profiles (id) on delete cascade,
  service_id    uuid not null references public.services (id),
  request_text  text,                            -- el partido pedido (solo análisis)
  status        text not null default 'pending_payment'
                  check (status in ('pending_payment', 'paid', 'delivered')),
  delivered_content text,                         -- lo que se envió (auditoría)
  created_at    timestamptz not null default now(),
  delivered_at  timestamptz
);

create index if not exists idx_order_user on public.service_orders (user_id);
create index if not exists idx_order_status on public.service_orders (status);

-- Pagos de NOWPayments. Enlazados a UNA cosa: suscripción u orden.
create table if not exists public.payments (
  id                uuid primary key default gen_random_uuid(),
  user_id           uuid not null references public.profiles (id) on delete cascade,
  provider          text not null default 'nowpayments',
  provider_payment_id text,                       -- id que devuelve NOWPayments
  amount_usd        numeric(10,2) not null,
  pay_currency      text,                          -- BTC / ETH / USDT...
  status            text not null default 'waiting'
                      check (status in ('waiting','confirming','confirmed','failed','expired')),
  -- a qué corresponde el pago (uno de los dos):
  package_id        uuid references public.packages (id),
  service_order_id  uuid references public.service_orders (id),
  raw_webhook       jsonb,                         -- copia íntegra del webhook (auditoría)
  created_at        timestamptz not null default now(),
  updated_at        timestamptz not null default now()
);

create index if not exists idx_pay_user on public.payments (user_id);
create index if not exists idx_pay_provider on public.payments (provider_payment_id);

alter table public.service_orders enable row level security;
alter table public.payments enable row level security;

create policy "ordenes propias - leer"
  on public.service_orders for select
  using (auth.uid() = user_id or exists (
    select 1 from public.profiles p where p.id = auth.uid() and p.is_admin
  ));

create policy "pagos propios - leer"
  on public.payments for select
  using (auth.uid() = user_id or exists (
    select 1 from public.profiles p where p.id = auth.uid() and p.is_admin
  ));

-- ============================================================
-- NOTA: las ESCRITURAS (insertar pagos, descontar saldo, marcar
-- entregas, crear suscripciones) NO se permiten desde el cliente.
-- Se harán desde el servidor (Server Actions / webhooks) con la
-- clave de servicio, que se salta RLS. Por eso aquí solo definimos
-- políticas de LECTURA. Esto es intencional y seguro.
-- ============================================================