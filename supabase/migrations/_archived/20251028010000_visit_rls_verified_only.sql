-- Enforce that only verified users can create visit requests and only for published properties
-- Assumes tables: profiles (verification_status), properties (status), visit_requests

begin;

-- Helper policy function (optional): check if current user is verified
create or replace function public.is_verified_user()
returns boolean
language sql
stable
security definer
as $$
  select exists (
    select 1 from public.profiles p
    where p.id = auth.uid()
      and p.verification_status = 'verified'
  );
$$;

-- Enable RLS on visit_requests if not already
alter table public.visit_requests enable row level security;

-- Allow select for participants (owner or requester); keep broader read as per existing rules if present
do $$ begin
  if not exists (
    select 1 from pg_policies
    where schemaname = 'public' and tablename = 'visit_requests' and policyname = 'Visit select for participants'
  ) then
    create policy "Visit select for participants" on public.visit_requests
      for select using (
        requester_id = auth.uid()
        or exists (
          select 1 from public.properties pr
          where pr.id = visit_requests.property_id
            and pr.owner_id = auth.uid()
        )
      );
  end if;
end $$;

-- Insert policy: only verified users, and property must be published
do $$ begin
  if not exists (
    select 1 from pg_policies
    where schemaname = 'public' and tablename = 'visit_requests' and policyname = 'Insert only by verified users for published properties'
  ) then
    create policy "Insert only by verified users for published properties" on public.visit_requests
      for insert to authenticated
      with check (
        public.is_verified_user() = true
        and exists (
          select 1 from public.properties pr
          where pr.id = property_id
            and pr.status = 'published'
        )
      );
  end if;
end $$;

-- Update/Delete policies can mirror ownership rules (optional; keeping conservative)

commit;


