-- Migración v3: columna stripe_customer_id en profiles
-- Ejecuta este SQL en Supabase → SQL Editor

alter table profiles add column if not exists stripe_customer_id text;
create index if not exists profiles_stripe_customer_id_idx on profiles(stripe_customer_id);
