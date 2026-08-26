-- Run once in SQL Editor to enable live family name availability checks.

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
