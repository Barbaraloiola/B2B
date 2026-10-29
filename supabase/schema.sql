-- MercadoInteligente v0.2 — Supabase
-- Execute no SQL Editor do seu próprio projeto Supabase.
create table if not exists public.user_app_data (
  user_id uuid primary key references auth.users(id) on delete cascade,
  payload jsonb not null default '{"items":[],"purchases":[]}'::jsonb,
  updated_at timestamptz not null default now()
);

alter table public.user_app_data enable row level security;

drop policy if exists "Users can read their own app data" on public.user_app_data;
create policy "Users can read their own app data"
on public.user_app_data for select to authenticated
using (auth.uid() = user_id);

drop policy if exists "Users can insert their own app data" on public.user_app_data;
create policy "Users can insert their own app data"
on public.user_app_data for insert to authenticated
with check (auth.uid() = user_id);

drop policy if exists "Users can update their own app data" on public.user_app_data;
create policy "Users can update their own app data"
on public.user_app_data for update to authenticated
using (auth.uid() = user_id)
with check (auth.uid() = user_id);

-- O aplicativo usa somente a chave pública anon/publishable.
-- Nunca exponha a service_role key no frontend.
