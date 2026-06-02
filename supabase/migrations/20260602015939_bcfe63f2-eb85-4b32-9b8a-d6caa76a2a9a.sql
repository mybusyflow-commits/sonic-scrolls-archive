
-- Fix function search_path
create or replace function public.set_updated_at()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

-- Lock down SECURITY DEFINER functions
revoke execute on function public.has_role(uuid, public.app_role) from public, anon, authenticated;
revoke execute on function public.set_updated_at() from public, anon, authenticated;

-- Remove broad listing policies on storage. Public buckets still serve files
-- via their direct public URL (which does not require a SELECT policy).
drop policy if exists "Public read covers" on storage.objects;
drop policy if exists "Public read audio" on storage.objects;
