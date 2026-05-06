-- Ejecuta esto en Supabase SQL Editor

create table profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  full_name text,
  business_name text,
  email text,
  phone text,
  address text,
  tax_id text,
  updated_at timestamptz default now()
);

alter table profiles enable row level security;
create policy "Profiles: own data" on profiles for all using (auth.uid() = id);

-- Crea perfil vacío automáticamente al registrarse
create or replace function handle_new_user()
returns trigger as $$
begin
  insert into profiles (id, email) values (new.id, new.email);
  return new;
end;
$$ language plpgsql security definer;

create trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure handle_new_user();
