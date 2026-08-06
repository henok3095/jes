-- Drop and recreate everything cleanly
drop table if exists public.thoughts cascade;

create table public.thoughts (
  id          uuid primary key default gen_random_uuid(),
  user_id     uuid references auth.users(id) on delete cascade not null,
  title       text not null,
  content     text default '',
  preview     text default '',
  category    text default 'personal',
  tags        text[] default '{}',
  connections uuid[] default '{}',
  date        date default current_date,
  created_at  timestamptz default now()
);

-- Enable RLS
alter table public.thoughts enable row level security;

-- Drop any existing policies
drop policy if exists "select own thoughts" on public.thoughts;
drop policy if exists "insert own thoughts" on public.thoughts;
drop policy if exists "update own thoughts" on public.thoughts;
drop policy if exists "delete own thoughts" on public.thoughts;

-- Recreate policies
create policy "select own thoughts"
  on public.thoughts for select
  using (auth.uid() = user_id);

create policy "insert own thoughts"
  on public.thoughts for insert
  with check (auth.uid() = user_id);

create policy "update own thoughts"
  on public.thoughts for update
  using (auth.uid() = user_id);

create policy "delete own thoughts"
  on public.thoughts for delete
  using (auth.uid() = user_id);

-- Grant access to authenticated users
grant usage on schema public to authenticated;
grant all on public.thoughts to authenticated;

-- Indexes
create index thoughts_user_id_idx on public.thoughts(user_id);
create index thoughts_date_idx on public.thoughts(user_id, date desc);
