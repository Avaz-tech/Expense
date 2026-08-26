-- Fix: gen_salt does not exist (Supabase stores pgcrypto in "extensions" schema)
-- Run this once in SQL Editor if create/join family fails with gen_salt error.

create extension if not exists pgcrypto with schema extensions;

-- Re-create create_family (copy from migration_option_b.sql with extensions.crypt)
create or replace function create_family(p_name text, p_pin text)
returns json
language plpgsql
security definer
set search_path = public, extensions
as $$
declare
  v_uid uuid := auth.uid();
  v_invite text;
  v_family_id uuid;
  v_attempts int := 0;
  v_trimmed_name text := trim(p_name);
begin
  if v_uid is null then raise exception 'Authentication required'; end if;
  if length(v_trimmed_name) = 0 then raise exception 'Oila nomini kiriting'; end if;
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
      if v_attempts >= 5 then raise exception 'Taklif kodi yaratib bo''lmadi'; end if;
    end;
  end loop;
  insert into family_members (user_id, family_id) values (v_uid, v_family_id) on conflict do nothing;
  return json_build_object('id', v_family_id, 'name', v_trimmed_name, 'invite_code', v_invite);
end;
$$;

create or replace function join_family_by_name_pin(p_name text, p_pin text)
returns json
language plpgsql
security definer
set search_path = public, extensions
as $$
declare
  v_uid uuid := auth.uid();
  v_family families%rowtype;
  v_trimmed_name text := trim(p_name);
begin
  if v_uid is null then raise exception 'Authentication required'; end if;
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
  insert into family_members (user_id, family_id) values (v_uid, v_family.id) on conflict do nothing;
  return json_build_object('id', v_family.id, 'name', v_family.name, 'invite_code', v_family.invite_code);
end;
$$;

grant execute on function create_family(text, text) to authenticated;
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
