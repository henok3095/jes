-- ============================================================
-- MindVault schema
-- Run this in Supabase SQL Editor
-- ============================================================

-- Thoughts table
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

-- Row Level Security — users only see their own data
alter table public.thoughts enable row level security;

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

-- Indexes
create index thoughts_user_id_idx on public.thoughts(user_id);
create index thoughts_date_idx    on public.thoughts(user_id, date desc);
