-- Run this once in the Supabase SQL Editor (Dashboard → SQL Editor → New query).

-- The whole budget object lives in one JSONB row.
create table if not exists budget (
  id int primary key,
  data jsonb not null,
  updated_at timestamptz not null default now()
);

-- Open access for the anon key. This is a single-user personal app with no
-- login — anyone holding the project URL + anon key can read/write this row.
-- Add Supabase Auth and tighten these policies if that ever matters.
alter table budget enable row level security;

drop policy if exists "public budget access" on budget;
create policy "public budget access" on budget
  for all
  using (true)
  with check (true);

-- Realtime: broadcast row changes so other devices pick them up live.
alter publication supabase_realtime add table budget;
