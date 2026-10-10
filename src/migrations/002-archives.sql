-- ─────────────────────────────────────────────────────────────────────────────
-- 002-archives.sql — Sistem Manajemen Arsip Digital
-- ─────────────────────────────────────────────────────────────────────────────

-- ─── 1. Table: archive_categories ────────────────────────────────────────────
create table public.archive_categories (
  id uuid primary key default gen_random_uuid(),
  name text not null unique,
  description text,
  color text,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  updated_at timestamp with time zone default timezone('utc'::text, now()) not null
);

alter table public.archive_categories enable row level security;

-- ─── 2. Table: archives ──────────────────────────────────────────────────────
create table public.archives (
  id uuid primary key default gen_random_uuid(),
  category_id uuid references public.archive_categories(id) on delete set null,
  created_by uuid references public.profiles(id) on delete set null,
  title text not null,
  number text,
  date date,
  description text,
  file_url text,
  file_path text,
  file_name text,
  file_size bigint,
  is_deleted boolean not null default false,
  deleted_at timestamp with time zone,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  updated_at timestamp with time zone default timezone('utc'::text, now()) not null
);

alter table public.archives enable row level security;

-- ─── 3. Table: archive_logs ──────────────────────────────────────────────────
create table public.archive_logs (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references public.profiles(id) on delete set null,
  archive_id uuid references public.archives(id) on delete cascade,
  action text not null,
  details jsonb,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

alter table public.archive_logs enable row level security;

-- ─── 4. Trigger function: auto-update updated_at ─────────────────────────────
create or replace function public.handle_updated_at()
returns trigger
language plpgsql
security definer set search_path = ''
as $$
begin
  new.updated_at = timezone('utc'::text, now());
  return new;
end;
$$;

create trigger on_archive_categories_updated
  before update on public.archive_categories
  for each row execute procedure public.handle_updated_at();

create trigger on_archives_updated
  before update on public.archives
  for each row execute procedure public.handle_updated_at();

-- ─── 5. RLS Policies ─────────────────────────────────────────────────────────

-- archive_categories
create policy "Categories are viewable by authenticated users"
  on public.archive_categories for select
  to authenticated
  using (true);

create policy "Categories are insertable by authenticated users"
  on public.archive_categories for insert
  to authenticated
  with check (true);

create policy "Categories are updatable by authenticated users"
  on public.archive_categories for update
  to authenticated
  using (true)
  with check (true);

create policy "Categories are deletable by authenticated users"
  on public.archive_categories for delete
  to authenticated
  using (true);

-- archives
-- SELECT tidak boleh memakai USING (is_deleted = false): PostgreSQL mengevaluasi
-- policy SELECT terhadap baris BARU hasil UPDATE, sehingga soft delete
-- (is_deleted = true) gagal dengan "new row violates row-level security policy".
-- Arsip boleh dihapus/dipulihkan oleh kedua role (admin & pimpinan); filter
-- aktif/sampah dilakukan di query aplikasi.
create policy "Archives are viewable by authenticated users"
  on public.archives for select
  to authenticated
  using (true);

create policy "Archives are insertable by authenticated users"
  on public.archives for insert
  to authenticated
  with check (true);

create policy "Archives are updatable by authenticated users"
  on public.archives for update
  to authenticated
  using (true)
  with check (true);

create policy "Archives are deletable by authenticated users"
  on public.archives for delete
  to authenticated
  using (true);

-- archive_logs
create policy "Logs are viewable by authenticated users"
  on public.archive_logs for select
  to authenticated
  using (true);

create policy "Logs are insertable by authenticated users"
  on public.archive_logs for insert
  to authenticated
  with check (true);

-- ─── 6. Indexes ──────────────────────────────────────────────────────────────
create index idx_archives_category_id on public.archives(category_id);
create index idx_archives_created_by on public.archives(created_by);
create index idx_archives_is_deleted on public.archives(is_deleted);
create index idx_archives_date on public.archives(date);
create index idx_archive_logs_archive_id on public.archive_logs(archive_id);
create index idx_archive_logs_user_id on public.archive_logs(user_id);
