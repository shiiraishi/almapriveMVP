alter table public.profiles enable row level security;

drop policy if exists "Profiles are publicly visible" on public.profiles;

create policy "Profiles are publicly visible"
on public.profiles
for select
to anon, authenticated
using (true);