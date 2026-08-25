-- Run this in Supabase SQL Editor (https://supabase.com/dashboard)

create extension if not exists "pgcrypto";

create table if not exists families (
  id uuid primary key default gen_random_uuid(),
  name text unique not null,
  invite_code text unique not null,
  created_at timestamptz not null default now()
);

create table if not exists expenses (
  id uuid primary key default gen_random_uuid(),
  family_id uuid not null references families(id) on delete cascade,
  amount text not null,
  category_id text not null,
  date text not null,
  note text not null default '',
  scope text not null check (scope in ('family', 'personal')),
  spender_name text not null,
  created_at timestamptz not null default now()
);

create index if not exists expenses_family_id_idx on expenses(family_id);
create index if not exists expenses_family_date_idx on expenses(family_id, date desc);

alter table families enable row level security;
alter table expenses enable row level security;

create policy "Anyone can create a family"
  on families for insert
  to anon, authenticated
  with check (true);

create policy "Anyone can read families by invite code lookup"
  on families for select
  to anon, authenticated
  using (true);

create policy "Family expenses are readable"
  on expenses for select
  to anon, authenticated
  using (true);

create policy "Family expenses can be inserted"
  on expenses for insert
  to anon, authenticated
  with check (family_id is not null);

create policy "Family expenses can be updated"
  on expenses for update
  to anon, authenticated
  using (true)
  with check (family_id is not null);

create policy "Family expenses can be deleted"
  on expenses for delete
  to anon, authenticated
  using (true);

alter publication supabase_realtime add table expenses;

create or replace function generate_invite_code()
returns text
language plpgsql
as $$
declare
  chars text := 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
  result text := 'FAM-';
  i int;
begin
  for i in 1..4 loop
    result := result || substr(chars, floor(random() * length(chars) + 1)::int, 1);
  end loop;
  return result;
end;
$$;
