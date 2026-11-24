-- =========================================================
-- TRACKDAY Sports Portal — integrity helpers & write RPCs
-- =========================================================

-- Safe manual-position parser
create or replace function public.parse_manual_position(p_text text)
returns integer
language plpgsql immutable
as $$
begin
  return nullif(regexp_replace(coalesce(p_text, ''), '[^0-9]', '', 'g'), '')::integer;
exception when others then
  return null;
end;
$$;

-- Recompute score_num + positions for every entry of one game
create or replace function public.recompute_game_entries(p_game_id uuid)
returns void
language plpgsql security definer set search_path = public
as $$
declare
  m text;
begin
  select metric into m from public.games where id = p_game_id;
  if m is null then
    return;
  end if;

  if m = 'manual' then
    update public.entries
       set score_num = null,
           position = case when dnf then null else public.parse_manual_position(score_text) end
     where game_id = p_game_id;
  else
    update public.entries
       set score_num = public.parse_score(score_text, m),
           position = null
     where game_id = p_game_id;
  end if;

  perform public.recalc_positions(p_game_id);
end;
$$;

revoke all on function public.parse_manual_position(text) from public;
revoke all on function public.recompute_game_entries(uuid) from public;
grant execute on function public.recompute_game_entries(uuid) to authenticated;

-- When a student's age group changes, remove entries that no longer fit
create or replace function public.students_after_group_change()
returns trigger
language plpgsql security definer set search_path = public
as $$
begin
  if new.group_code is distinct from old.group_code then
    delete from public.entries e
     using public.games g
     where e.game_id = g.id
       and e.student_id = new.id
       and g.group_code is distinct from new.group_code;
  end if;
  return null;
end;
$$;

drop trigger if exists students_after_group_change on public.students;
create trigger students_after_group_change
after update of dob on public.students
for each row execute function public.students_after_group_change();

-- When a game's group/metric changes, drop invalid entries and recompute
create or replace function public.games_after_change()
returns trigger
language plpgsql security definer set search_path = public
as $$
begin
  if new.group_code is distinct from old.group_code then
    delete from public.entries e
     using public.students s
     where e.game_id = new.id
       and e.student_id = s.id
       and s.group_code is distinct from new.group_code;
  end if;

  if new.metric is distinct from old.metric then
    perform public.recompute_game_entries(new.id);
  end if;

  return null;
end;
$$;

drop trigger if exists games_after_change on public.games;
create trigger games_after_change
after update of group_code, metric on public.games
for each row execute function public.games_after_change();

-- Admin-only: save scores for every entry of a game in one transaction
create or replace function public.save_game_entries(p_game_id uuid, p_items jsonb)
returns void
language plpgsql
as $$
declare
  it jsonb;
begin
  if not public.is_admin() then
    raise exception 'Only admins can enter results';
  end if;
  if p_items is null or jsonb_typeof(p_items) <> 'array' then
    raise exception 'Items must be a JSON array';
  end if;

  for it in select value from jsonb_array_elements(p_items) loop
    update public.entries
       set score_text = nullif(btrim(coalesce(it->>'score', '')), ''),
           dnf = coalesce((it->>'dnf')::boolean, false)
     where id = (it->>'id')::uuid
       and game_id = p_game_id;
  end loop;

  perform public.recompute_game_entries(p_game_id);
end;
$$;

revoke all on function public.save_game_entries(uuid, jsonb) from public;
grant execute on function public.save_game_entries(uuid, jsonb) to authenticated;

-- Assign / unassign students for a game.
-- RLS still decides what a teacher is allowed to insert or delete.
create or replace function public.set_game_assignments(p_game_id uuid, p_student_ids uuid[])
returns void
language plpgsql
as $$
begin
  if not public.is_active_user() then
    raise exception 'Active account required';
  end if;

  delete from public.entries e
   where e.game_id = p_game_id
     and not (e.student_id = any(coalesce(p_student_ids, '{}'::uuid[])));

  insert into public.entries (game_id, student_id)
  select p_game_id, sid
    from unnest(coalesce(p_student_ids, '{}'::uuid[])) as sid
   where not exists (
     select 1 from public.entries e
      where e.game_id = p_game_id and e.student_id = sid
   )
  on conflict (game_id, student_id) do nothing;
end;
$$;

revoke all on function public.set_game_assignments(uuid, uuid[]) from public;
grant execute on function public.set_game_assignments(uuid, uuid[]) to authenticated;
