# 2. Teknologi & Arsitektur

## 2.1 Tumpukan Teknologi (hanya yang benar-benar dipakai)

| Lapisan | Teknologi | Peran |
| --- | --- | --- |
| Framework | **Next.js 16.2** (App Router, Turbopack) | Routing, React Server Components, Server Actions |
| Bahasa | TypeScript 5 | Tiping statis |
| UI | React 19 + Tailwind CSS 4 + Radix UI (via `radix-ui`) | Komponen & styling |
| Komponen siap pakai | shadcn (`components/ui/*`) | Button, Card, Dialog, Select, Input, dsb. |
| Ikon | lucide-react | Sidebar, tombol, status |
| Form | react-hook-form + @hookform/resolvers + **zod** | Validasi form (schema `zod` di `src/validations/*`) |
| Data fetching | TanStack Query (`@tanstack/react-query`) | Client-side query (pagination, search, filter) |
| State global | Zustand (`src/store/auth-store.ts`) | Profil pengguna aktif |
| Auth & database | Supabase (`@supabase/ssr`, `@supabase/supabase-js`) | Auth, PostgreSQL (RLS), Storage |
| Tema | next-themes | Dark / light mode |
| Notifikasi | sonner | Toast sukses / error |
| Pengambilan log server | (opsional) | `archive_logs` + `surat_logs` sumber aktivitas |

**Tidak dipakai** (jangan didokumentasikan): tidak ada ORM (PostgREST via supabase-js), tidak ada Redux/Zustand persist, tidak ada backend terpisah selain Supabase.

## 2.2 Skrip NPM (`package.json`)

| Perintah | Fungsi |
| --- | --- |
| `npm run dev` | Menjalankan dev server (Turbopack) |
| `npm run build` | Build produksi |
| `npm start` | Menjalankan hasil build |
| `npm run lint` | ESLint |
| `npm run seed` | Seed data contoh (membaca `.env.local`) |
| `npm run seed:dry` | Seed dengan mode baca-saja (READONLY=true), tidak menulis DB |

## 2.3 Struktur Direktori Penting

```text
management-surat/
├── .env.local                     # Konfigurasi Supabase (rahasia)
├── package.json
├── scripts/
│   └── seed-data.mjs              # Seed data contoh
└── src/
    ├── proxy.ts                   # Middleware guard akses (auth + role)
    ├── store/
    │   └── auth-store.ts          # Store profil pengguna (Zustand)
    ├── providers/                 # AuthStoreProvider, ReactQueryProvider, ThemeProvider
    ├── constant/                  # sidebar, surat (status/disposisi), arsip, auth
    ├── validations/               # Schema Zod (login, surat, arsip, kategori, user)
    ├── lib/
    │   ├── supabase/              # client.ts (browser), server.ts, proxy.ts
    │   ├── surat-archive.ts       # Kearsipan otomatis (dedup)
    │   ├── storage.ts             # upload/delete file bucket "images"
    │   └── format.ts              # format tanggal/ukuran
    ├── migrations/                # SQL: 001 auth+profiles, 002 arsip, 003 surat
    ├── types/                     # auth, surat, archive
    ├── hooks/                     # use-data-table, use-debounce
    ├── components/
    │   ├── common/                # DataTable, DropdownAction, FormInput, dsb.
    │   ├── ui/                    # Komponen shadcn
    │   └── dashboard/             # StatCard, RecentSurat, RecentActivity, ArchiveChart
    └── app/
        ├── (auth)/login/          # Halaman login + server action
        └── (dashboard)/admin/     # Dashboard + surat-masuk/keluar + archive (+category) + user
```

## 2.4 Arsitektur Aliran Data

```text
Browser (React)                        Next.js Server
────────────────────                   ─────────────────────────
Login form      ── server action ──►  login() → supabase.auth.signInWithPassword
profil          ◄── cookie ──────────  user_profile (httpOnly, maxAge 1 tahun)
DataTable       ── TanStack Query ──►  supabase-js (browser client) → PostgREST
Aksi form       ── server action ──►  actions.ts → supabase-js (server client)
                                    Kearsipan otomatis → src/lib/surat-archive.ts
Setiap request  ──►  src/proxy.ts (middleware):
                     1) cek sesi (auth.getUser)
                     2) atur redirect (/login, /)
                     3) blokir pimpinan dari /admin/user & /admin/archive/category
```

Detail kapan browser client vs server client dipakai:

| Konteks | Client yang dipakai | Contoh pemakaian |
| --- | --- | --- |
| Halaman (list, dashboard) | `src/lib/supabase/client.ts` (browser) | DataTable, statistik dashboard |
| Server action | `src/lib/supabase/server.ts` (server) | create/update/delete/approve |
| Guard proxy | `src/lib/supabase/proxy.ts` (server) | updateSession di `src/proxy.ts` |
| Kelola pengguna (tambah/hapus) | server client `isAdmin: true` (**service role**) | `createUser`, `deleteUser` |

> Kunci keakuratan: arsitektur memakai **server actions** untuk semua mutasi (bukan API route), dan **TanStack Query di sisi client** untuk membaca data. Tidak ada endpoint REST khusus yang dibuat manual.

## 2.5 Keamanan yang Diterapkan

| Lapisan | Mekanisme |
| --- | --- |
| Autentikasi | Supabase Auth (email/password); sesi di cookie (`@supabase/ssr`) |
| Sesi aplikasi | Cookie `user_profile` (httpOnly, sameSite=lax, path=/, maxAge 1 tahun) |
| Guard halaman | `src/proxy.ts` (middleware) — redirect belum login → `/login` |
| Role access | Menu berbeda per role (sidebar) + redirect pimpinan dari halaman admin khusus |
| Guard server | `approveSuratKeluar` hanya role `pimpinan` + status `dibuat` |
| RLS | RLS aktif di semua tabel `public` |

## 2.6 Referensi Kode

| Topik | File utama |
| --- | --- |
| Login | `src/app/(auth)/login/actions.ts`, `_components/login.tsx` |
| Dashboard | `src/app/(dashboard)/admin/page.tsx`, `src/components/dashboard/*` |
| Surat Masuk | `src/app/(dashboard)/admin/surat-masuk/` |
| Surat Keluar | `src/app/(dashboard)/admin/surat-keluar/` |
| Arsip | `src/app/(dashboard)/admin/archive/`, `src/lib/surat-archive.ts` |
| Kategori | `src/app/(dashboard)/admin/archive/category/` |
| Pengguna | `src/app/(dashboard)/admin/user/` |
| Sidebar | `src/constant/sidebar-constant.ts` |
| Proxy guard | `src/proxy.ts`, `src/lib/supabase/proxy.ts` |