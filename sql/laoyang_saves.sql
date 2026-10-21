-- 老羊传奇云存档表（与暗夜挂机 public.saves 隔离）
-- 同一 Supabase 项目、同一 auth.users；绝不要改动 public.saves
-- 执行人：拥有该 Supabase 项目 SQL 权限的管理员（或 hua yang）在 Dashboard → SQL Editor 执行本文件一次。
-- 表名：public.cq_saves

create table if not exists public.cq_saves (
  user_id uuid primary key references auth.users(id) on delete cascade,
  data jsonb not null default '{}'::jsonb,
  version int not null default 1,
  updated_at timestamptz not null default now()
);

alter table public.cq_saves enable row level security;

drop policy if exists cq_saves_select_own on public.cq_saves;
drop policy if exists cq_saves_insert_own on public.cq_saves;
drop policy if exists cq_saves_update_own on public.cq_saves;
drop policy if exists cq_saves_delete_own on public.cq_saves;

create policy cq_saves_select_own on public.cq_saves
  for select using (auth.uid() = user_id);
create policy cq_saves_insert_own on public.cq_saves
  for insert with check (auth.uid() = user_id);
create policy cq_saves_update_own on public.cq_saves
  for update using (auth.uid() = user_id) with check (auth.uid() = user_id);
create policy cq_saves_delete_own on public.cq_saves
  for delete using (auth.uid() = user_id);

grant select, insert, update, delete on public.cq_saves to authenticated;
