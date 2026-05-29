-- Seed script for local / staging admin user.
-- Replace the email below, then run AFTER creating the user in Supabase Auth dashboard
-- or via sign-up with the promote-to-admin edge function.
--
-- Example (run in SQL editor after user exists in auth.users):
--
-- update public.profiles
-- set is_admin = true, full_name = 'Demo Admin'
-- where id = (select id from auth.users where email = 'admin@example.com');

-- Helper function for one-time admin promotion (service role / SQL editor only)
create or replace function public.promote_user_to_admin(user_email text)
returns void
language plpgsql
security definer
set search_path = public
as $$
declare
  target_id uuid;
begin
  select id into target_id from auth.users where email = user_email;
  if target_id is null then
    raise exception 'User with email % not found', user_email;
  end if;

  insert into public.profiles (id, full_name, is_admin)
  values (target_id, 'Admin User', true)
  on conflict (id) do update set is_admin = true;
end;
$$;

comment on function public.promote_user_to_admin is
  'Run once in SQL editor: select public.promote_user_to_admin(''admin@example.com'');';
