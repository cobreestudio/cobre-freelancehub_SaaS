-- ============================================================
-- Cobre — Invoice Management SaaS
-- Run this in your Supabase SQL editor to set up the database
-- ============================================================

-- Enable UUID extension (already enabled in Supabase by default)
create extension if not exists "uuid-ossp";


-- ── Profiles ─────────────────────────────────────────────────
create table if not exists profiles (
  id          uuid primary key references auth.users(id) on delete cascade,
  full_name   text,
  business_name text,
  email       text,
  phone       text,
  address     text,
  tax_id      text,
  payment_info text,
  updated_at  timestamptz default now()
);

alter table profiles enable row level security;

create policy "Users manage own profile"
  on profiles for all
  using (auth.uid() = id)
  with check (auth.uid() = id);


-- ── Clients ──────────────────────────────────────────────────
create table if not exists clients (
  id          uuid primary key default uuid_generate_v4(),
  user_id     uuid not null references auth.users(id) on delete cascade,
  name        text not null,
  email       text not null,
  phone       text,
  company     text,
  status      text not null default 'active' check (status in ('active', 'inactive')),
  notes       text,
  created_at  timestamptz not null default now()
);

alter table clients enable row level security;

create policy "Users manage own clients"
  on clients for all
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);


-- ── Projects ─────────────────────────────────────────────────
create table if not exists projects (
  id           uuid primary key default uuid_generate_v4(),
  user_id      uuid not null references auth.users(id) on delete cascade,
  client_id    uuid references clients(id) on delete set null,
  client_name  text not null,
  title        text not null,
  description  text,
  status       text not null default 'pending'
                check (status in ('pending', 'in_progress', 'completed', 'cancelled')),
  budget       numeric(12, 2) not null default 0,
  start_date   date not null,
  end_date     date,
  created_at   timestamptz not null default now()
);

alter table projects enable row level security;

create policy "Users manage own projects"
  on projects for all
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);


-- ── Invoices ─────────────────────────────────────────────────
create table if not exists invoices (
  id             uuid primary key default uuid_generate_v4(),
  invoice_number text,
  user_id        uuid not null references auth.users(id) on delete cascade,
  project_id     uuid references projects(id) on delete set null,
  client_id      uuid references clients(id) on delete set null,
  client_name    text not null,
  project_title  text not null,
  amount         numeric(12, 2) not null,
  status         text not null default 'draft'
                  check (status in ('draft', 'sent', 'paid', 'overdue')),
  due_date       date not null,
  paid_at        timestamptz,
  created_at     timestamptz not null default now()
);

alter table invoices enable row level security;

create policy "Users manage own invoices"
  on invoices for all
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);


-- ── Reminder logs ────────────────────────────────────────────
-- Tracks when automated payment reminder emails were sent
-- to avoid sending duplicates within a 7-day window
create table if not exists reminder_logs (
  id              uuid primary key default uuid_generate_v4(),
  invoice_id      uuid not null references invoices(id) on delete cascade,
  recipient_email text not null,
  sent_at         timestamptz not null default now()
);

alter table reminder_logs enable row level security;

-- Only the service role (used by the cron API route) can write to this table
create policy "Service role only"
  on reminder_logs for all
  using (false)
  with check (false);
