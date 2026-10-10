-- ─────────────────────────────────────────────────────────────────────────────
-- 003-surat.sql — Sistem Manajemen Surat Masuk & Keluar
-- ─────────────────────────────────────────────────────────────────────────────

-- ─── 1. Table: surat_masuk ───────────────────────────────────────────────────
create table public.surat_masuk (
  id uuid primary key default gen_random_uuid(),
  nomor text not null,
  tanggal date,
  asal_surat text,
  perihal text not null,
  status text not null default 'diterima',
  disposisi text,
  keterangan text,
  -- arsip digital
  file_url text,
  file_path text,
  file_name text,
  file_size bigint,
  -- arsip fisik
  lokasi_lemari text,
  lokasi_rak text,
  lokasi_map text,
  lokasi_box text,
  keterangan_fisik text,
  -- metadata
  created_by uuid references public.profiles(id) on delete set null,
  is_deleted boolean not null default false,
  deleted_at timestamp with time zone,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  updated_at timestamp with time zone default timezone('utc'::text, now()) not null
);

alter table public.surat_masuk enable row level security;

-- ─── 2. Table: surat_keluar ──────────────────────────────────────────────────
create table public.surat_keluar (
  id uuid primary key default gen_random_uuid(),
  nomor text not null,
  tanggal date,
  tujuan text,
  perihal text not null,
  status text not null default 'dibuat',
  surat_masuk_id uuid references public.surat_masuk(id) on delete set null,
  keterangan text,
  -- arsip digital
  file_url text,
  file_path text,
  file_name text,
  file_size bigint,
  -- arsip fisik
  lokasi_lemari text,
  lokasi_rak text,
  lokasi_map text,
  lokasi_box text,
  keterangan_fisik text,
  -- metadata
  created_by uuid references public.profiles(id) on delete set null,
  is_deleted boolean not null default false,
  deleted_at timestamp with time zone,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  updated_at timestamp with time zone default timezone('utc'::text, now()) not null
);

alter table public.surat_keluar enable row level security;

-- ─── 3. Table: surat_logs ────────────────────────────────────────────────────
create table public.surat_logs (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references public.profiles(id) on delete set null,
  surat_id uuid not null,
  surat_type text not null, -- 'masuk' atau 'keluar'
  action text not null,
  details jsonb,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

alter table public.surat_logs enable row level security;

-- ─── 4. Trigger function: auto-update updated_at ─────────────────────────────
-- menggunakan handle_updated_at() yang sudah ada dari 002-archives.sql

create trigger on_surat_masuk_updated
  before update on public.surat_masuk
  for each row execute procedure public.handle_updated_at();

create trigger on_surat_keluar_updated
  before update on public.surat_keluar
  for each row execute procedure public.handle_updated_at();

-- ─── 5. RLS Policies ─────────────────────────────────────────────────────────

-- surat_masuk
-- Lihat catatan pada policy surat_keluar: SELECT tidak boleh memakai
-- USING (is_deleted = false) agar soft delete tidak gagal (RLS 42501).
create policy "Surat Masuk are viewable by authenticated users"
  on public.surat_masuk for select
  to authenticated
  using (true);

create policy "Surat Masuk are insertable by authenticated users"
  on public.surat_masuk for insert
  to authenticated
  with check (true);

create policy "Surat Masuk are updatable by authenticated users"
  on public.surat_masuk for update
  to authenticated
  using (true)
  with check (true);

create policy "Surat Masuk are deletable by admins"
  on public.surat_masuk for delete
  to authenticated
  using (
    (select role from public.profiles where id = (select auth.uid())) = 'admin'
  );

-- surat_keluar
-- Catatan: SELECT tidak boleh menyembunyikan baris terhapus (is_deleted = true).
-- PostgreSQL mengevaluasi ulang policy SELECT terhadap baris BARU hasil UPDATE,
-- sehingga soft delete (is_deleted = true) akan gagal dengan
-- "new row violates row-level security policy" bila policy memakai
-- USING (is_deleted = false). Filter aktif/sampah dilakukan di query aplikasi.
create policy "Surat Keluar are viewable by authenticated users"
  on public.surat_keluar for select
  to authenticated
  using (true);

create policy "Surat Keluar are insertable by authenticated users"
  on public.surat_keluar for insert
  to authenticated
  with check (true);

create policy "Surat Keluar are updatable by authenticated users"
  on public.surat_keluar for update
  to authenticated
  using (true)
  with check (true);

create policy "Surat Keluar are deletable by admins"
  on public.surat_keluar for delete
  to authenticated
  using (
    (select role from public.profiles where id = (select auth.uid())) = 'admin'
  );

-- surat_logs
create policy "Surat Logs are viewable by authenticated users"
  on public.surat_logs for select
  to authenticated
  using (true);

create policy "Surat Logs are insertable by authenticated users"
  on public.surat_logs for insert
  to authenticated
  with check (true);

-- ─── 6. Indexes ──────────────────────────────────────────────────────────────
create index idx_surat_masuk_nomor on public.surat_masuk(nomor);
create index idx_surat_masuk_status on public.surat_masuk(status);
create index idx_surat_masuk_is_deleted on public.surat_masuk(is_deleted);
create index idx_surat_masuk_tanggal on public.surat_masuk(tanggal);
create index idx_surat_masuk_created_by on public.surat_masuk(created_by);

create index idx_surat_keluar_nomor on public.surat_keluar(nomor);
create index idx_surat_keluar_status on public.surat_keluar(status);
create index idx_surat_keluar_is_deleted on public.surat_keluar(is_deleted);
create index idx_surat_keluar_tanggal on public.surat_keluar(tanggal);
create index idx_surat_keluar_surat_masuk_id on public.surat_keluar(surat_masuk_id);
create index idx_surat_keluar_created_by on public.surat_keluar(created_by);

create index idx_surat_logs_surat_id on public.surat_logs(surat_id);
create index idx_surat_logs_surat_type on public.surat_logs(surat_type);
create index idx_surat_logs_user_id on public.surat_logs(user_id);
