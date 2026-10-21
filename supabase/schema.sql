-- Run once in your own Supabase project's SQL Editor.
-- Contains no passwords or secret keys. No service_role use in the website.
begin;
create or replace function public.relica_valid_quiz(value jsonb) returns boolean
language plpgsql immutable set search_path = '' as $$
declare item jsonb;
begin
 if value is null then return true; end if;
 if jsonb_typeof(value) <> 'object' or value->'version' <> '1'::jsonb or value->'version' is null then return false; end if;
 if jsonb_typeof(value->'answers') is distinct from 'array' then return false; end if;
 if jsonb_array_length(value->'answers') <> 8 then return false; end if;
 for item in select * from jsonb_array_elements(value->'answers') loop
  if item not in ('0'::jsonb,'1'::jsonb,'2'::jsonb,'3'::jsonb) then return false; end if;
 end loop;
 return true;
end $$;
create table if not exists public.relica_progress (
 user_id uuid primary key references auth.users(id) on delete cascade,
 best_stage bigint not null default 0 check(best_stage between 0 and 1000000),
 best_endless bigint not null default 0 check(best_endless between 0 and 1000000000000),
 quiz jsonb check(public.relica_valid_quiz(quiz)),
 quiz_updated_at bigint not null default 0 check(quiz_updated_at between 0 and 9007199254740991)
);
alter table public.relica_progress enable row level security;
revoke all on public.relica_progress from anon, authenticated;
grant select, insert, update on public.relica_progress to authenticated;
drop policy if exists relica_read_own on public.relica_progress;
create policy relica_read_own on public.relica_progress for select to authenticated using ((select auth.uid()) = user_id);
drop policy if exists relica_insert_own on public.relica_progress;
create policy relica_insert_own on public.relica_progress for insert to authenticated with check ((select auth.uid()) = user_id);
drop policy if exists relica_update_own on public.relica_progress;
create policy relica_update_own on public.relica_progress for update to authenticated using ((select auth.uid()) = user_id) with check ((select auth.uid()) = user_id);
create or replace function public.relica_merge_progress(p_stage bigint, p_endless bigint, p_quiz jsonb, p_quiz_updated_at bigint)
returns setof public.relica_progress language plpgsql security invoker set search_path = '' as $$
begin
 if auth.uid() is null then raise exception 'Authentication required' using errcode = '42501'; end if;
 return query insert into public.relica_progress as current (user_id,best_stage,best_endless,quiz,quiz_updated_at)
 values (auth.uid(),p_stage,p_endless,p_quiz,p_quiz_updated_at)
 on conflict (user_id) do update set
 best_stage=greatest(current.best_stage,excluded.best_stage),
 best_endless=greatest(current.best_endless,excluded.best_endless),
 quiz=case when excluded.quiz is not null and (current.quiz is null or excluded.quiz_updated_at>current.quiz_updated_at) then excluded.quiz else current.quiz end,
 quiz_updated_at=case when excluded.quiz is not null and (current.quiz is null or excluded.quiz_updated_at>current.quiz_updated_at) then excluded.quiz_updated_at else current.quiz_updated_at end
 returning current.*;
end $$;
revoke all on function public.relica_valid_quiz(jsonb) from public,anon;
grant execute on function public.relica_valid_quiz(jsonb) to authenticated;
revoke all on function public.relica_merge_progress(bigint,bigint,jsonb,bigint) from public,anon;
grant execute on function public.relica_merge_progress(bigint,bigint,jsonb,bigint) to authenticated;
commit;
