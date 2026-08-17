drop policy if exists payment_requests_admin_select on public.payment_requests;
create policy payment_requests_admin_select
on public.payment_requests
for select
using (
  exists (
    select 1
    from public.profiles
    where profiles.id = auth.uid()
      and profiles.role = 'admin'
  )
);

drop policy if exists payment_requests_admin_update on public.payment_requests;
create policy payment_requests_admin_update
on public.payment_requests
for update
using (
  exists (
    select 1
    from public.profiles
    where profiles.id = auth.uid()
      and profiles.role = 'admin'
  )
)
with check (
  exists (
    select 1
    from public.profiles
    where profiles.id = auth.uid()
      and profiles.role = 'admin'
  )
);
