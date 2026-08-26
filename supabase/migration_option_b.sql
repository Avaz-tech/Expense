-- =============================================================================
-- XARAJAT — Option B migration (EXISTING Supabase project)
-- Run this ONCE in SQL Editor. Do NOT run the full schema.sql on an old project.
--
-- Before running:
--   1. Supabase Dashboard → Authentication → Providers → enable "Anonymous"
--   2. Back up data if needed (existing families without PIN must be recreated
--      or given a PIN manually — see note at bottom)
-- =============================================================================

create extension if not exists pgcrypto with schema extensions;

-- Step 1: Add PIN column to existing families table (nullable for old rows)
alter table families add column if not exists pin_hash text;

-- Step 2: Membership table
create table if not exists family_members (
  user_id uuid not null references auth.users(id) on delete cascade,
  family_id uuid not null references families(id) on delete cascade,
  joined_at timestamptz not null default now(),
  primary key (user_id, family_id)
);

create index if not exists family_members_family_id_idx on family_members(family_id);

alter table family_members enable row level security;

-- Step 3: Functions
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

create or replace function create_family(p_name text, p_pin text)
returns json
language plpgsql
security definer
set search_path = public
as $$
declare
  v_uid uuid := auth.uid();
  v_invite text;
  v_family_id uuid;
  v_attempts int := 0;
  v_trimmed_name text := trim(p_name);
begin
  if v_uid is null then
    raise exception 'Authentication required';
  end if;

  if length(v_trimmed_name) = 0 then
    raise exception 'Oila nomini kiriting';
  end if;

  if p_pin is null or length(p_pin) < 4 or length(p_pin) > 8 then
    raise exception 'PIN 4-8 raqamdan iborat bo''lishi kerak';
  end if;

  if exists (select 1 from families where name = v_trimmed_name) then
    raise exception 'Bu nomdagi oila allaqachon mavjud';
  end if;

  loop
    v_invite := generate_invite_code();
    begin
      insert into families (name, invite_code, pin_hash)
      values (v_trimmed_name, v_invite, extensions.crypt(p_pin, extensions.gen_salt('bf')))
      returning id into v_family_id;
      exit;
    exception when unique_violation then
      v_attempts := v_attempts + 1;
      if v_attempts >= 5 then
        raise exception 'Taklif kodi yaratib bo''lmadi';
      end if;
    end;
  end loop;

  insert into family_members (user_id, family_id)
  values (v_uid, v_family_id)
  on conflict do nothing;

  return json_build_object(
    'id', v_family_id,
    'name', v_trimmed_name,
    'invite_code', v_invite
  );
end;
$$;

create or replace function join_family_by_invite(p_invite_code text)
returns json
language plpgsql
security definer
set search_path = public
as $$
declare
  v_uid uuid := auth.uid();
  v_family families%rowtype;
  v_code text := upper(trim(p_invite_code));
begin
  if v_uid is null then
    raise exception 'Authentication required';
  end if;

  if length(v_code) = 0 then
    raise exception 'Taklif kodini kiriting';
  end if;

  select * into v_family from families where invite_code = v_code;

  if not found then
    raise exception 'Taklif kodi topilmadi';
  end if;

  insert into family_members (user_id, family_id)
  values (v_uid, v_family.id)
  on conflict do nothing;

  return json_build_object(
    'id', v_family.id,
    'name', v_family.name,
    'invite_code', v_family.invite_code
  );
end;
$$;

create or replace function join_family_by_name_pin(p_name text, p_pin text)
returns json
language plpgsql
security definer
set search_path = public
as $$
declare
  v_uid uuid := auth.uid();
  v_family families%rowtype;
  v_trimmed_name text := trim(p_name);
begin
  if v_uid is null then
    raise exception 'Authentication required';
  end if;

  if length(v_trimmed_name) = 0 or p_pin is null or length(p_pin) = 0 then
    raise exception 'Oila nomi yoki PIN noto''g''ri';
  end if;

  select * into v_family from families where name = v_trimmed_name;

  if not found or v_family.pin_hash is null or v_family.pin_hash = '' then
    raise exception 'Oila topilmadi yoki PIN noto''g''ri';
  end if;

  if v_family.pin_hash != extensions.crypt(p_pin, v_family.pin_hash) then
    raise exception 'Oila topilmadi yoki PIN noto''g''ri';
  end if;

  insert into family_members (user_id, family_id)
  values (v_uid, v_family.id)
  on conflict do nothing;

  return json_build_object(
    'id', v_family.id,
    'name', v_family.name,
    'invite_code', v_family.invite_code
  );
end;
$$;

grant execute on function create_family(text, text) to authenticated;
grant execute on function join_family_by_invite(text) to authenticated;
grant execute on function join_family_by_name_pin(text, text) to authenticated;

create or replace function check_family_name_available(p_name text)
returns boolean
language plpgsql
security definer
set search_path = public
as $$
declare
  v_trimmed_name text := trim(p_name);
begin
  if length(v_trimmed_name) < 2 then
    return false;
  end if;

  return not exists (
    select 1 from families where name = v_trimmed_name
  );
end;
$$;

grant execute on function check_family_name_available(text) to authenticated;

-- Step 4: Drop OLD open policies
drop policy if exists "Anyone can create a family" on families;
drop policy if exists "Anyone can read families by invite code lookup" on families;
drop policy if exists "Family expenses are readable" on expenses;
drop policy if exists "Family expenses can be inserted" on expenses;
drop policy if exists "Family expenses can be updated" on expenses;
drop policy if exists "Family expenses can be deleted" on expenses;

-- Drop new policies too (safe re-run)
drop policy if exists "Members can read their families" on families;
drop policy if exists "Users can read own memberships" on family_members;
drop policy if exists "Users can delete own memberships" on family_members;
drop policy if exists "Members can read family expenses" on expenses;
drop policy if exists "Members can insert family expenses" on expenses;
drop policy if exists "Members can update family expenses" on expenses;
drop policy if exists "Members can delete family expenses" on expenses;

-- Step 5: NEW strict policies
create policy "Members can read their families"
  on families for select
  to authenticated
  using (
    id in (select family_id from family_members where user_id = auth.uid())
  );

create policy "Users can read own memberships"
  on family_members for select
  to authenticated
  using (user_id = auth.uid());

create policy "Users can delete own memberships"
  on family_members for delete
  to authenticated
  using (user_id = auth.uid());

create policy "Members can read family expenses"
  on expenses for select
  to authenticated
  using (
    family_id in (select family_id from family_members where user_id = auth.uid())
  );

create policy "Members can insert family expenses"
  on expenses for insert
  to authenticated
  with check (
    family_id in (select family_id from family_members where user_id = auth.uid())
  );

create policy "Members can update family expenses"
  on expenses for update
  to authenticated
  using (
    family_id in (select family_id from family_members where user_id = auth.uid())
  )
  with check (
    family_id in (select family_id from family_members where user_id = auth.uid())
  );

create policy "Members can delete family expenses"
  on expenses for delete
  to authenticated
  using (
    family_id in (select family_id from family_members where user_id = auth.uid())
  );

-- Step 6: Realtime (skip if already added — this causes errors on re-run otherwise)
do $$
begin
  if not exists (
    select 1 from pg_publication_tables
    where pubname = 'supabase_realtime' and schemaname = 'public' and tablename = 'expenses'
  ) then
    alter publication supabase_realtime add table expenses;
  end if;
end $$;

-- =============================================================================
-- OLD FAMILIES (created before Option B):
--   They have no PIN. Either delete them and create fresh in the app, OR run:
--
--   update families
--   set pin_hash = extensions.crypt('1234', extensions.gen_salt('bf'))
--   where pin_hash is null;
--
--   (replace 1234 with your chosen PIN, tell all family members)
-- =============================================================================
