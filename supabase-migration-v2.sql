-- Migración v2: líneas de concepto, IVA/IRPF configurables
-- Ejecuta este SQL en Supabase → SQL Editor

alter table invoices add column if not exists items jsonb default '[]'::jsonb;
alter table invoices add column if not exists iva_rate numeric default 21;
alter table invoices add column if not exists irpf_rate numeric default 0;

-- Columnas que pueden faltar del esquema inicial
alter table invoices add column if not exists invoice_number text;
alter table invoices add column if not exists paid_at timestamptz;
alter table clients  add column if not exists notes text;
