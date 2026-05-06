-- Ejecuta este SQL en el editor de Supabase (SQL Editor)

-- Clientes
create table clients (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references auth.users(id) on delete cascade not null,
  name text not null,
  email text not null,
  phone text,
  company text,
  status text not null default 'active' check (status in ('active', 'inactive')),
  created_at timestamptz default now()
);

-- Proyectos
create table projects (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references auth.users(id) on delete cascade not null,
  client_id uuid references clients(id) on delete cascade not null,
  client_name text not null,
  title text not null,
  description text,
  status text not null default 'pending' check (status in ('pending', 'in_progress', 'completed', 'cancelled')),
  budget numeric not null default 0,
  start_date date not null,
  end_date date,
  created_at timestamptz default now()
);

-- Facturas
create table invoices (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references auth.users(id) on delete cascade not null,
  project_id uuid references projects(id) on delete cascade not null,
  client_id uuid references clients(id) on delete cascade not null,
  client_name text not null,
  project_title text not null,
  amount numeric not null,
  status text not null default 'draft' check (status in ('draft', 'sent', 'paid', 'overdue')),
  due_date date not null,
  created_at timestamptz default now()
);

-- Row Level Security (cada usuario solo ve sus datos)
alter table clients enable row level security;
alter table projects enable row level security;
alter table invoices enable row level security;

create policy "Clients: own data" on clients for all using (auth.uid() = user_id);
create policy "Projects: own data" on projects for all using (auth.uid() = user_id);
create policy "Invoices: own data" on invoices for all using (auth.uid() = user_id);
