# 4. Cara Menjalankan Aplikasi

Panduan langkah-demi-langkah menjalankan aplikasi dari repositori kosong.

## 4.1 Prerequisites

| Kebutuhan | Versi minimum | Keterangan |
| --- | --- | --- |
| Node.js | 20.9+ | Aplikasi memakai Next.js 16.2 (membutuhkan Node modern). Uji: `node -v` |
| npm | 10+ | Pengelola paket. Uji: `npm -v` |
| Akun Proyek Supabase | — | Gratis tier cukup |
| Git | — | Untuk clone repositori |

## 4.2 Instalasi Dependensi

```bash
git clone <url-repositori> management-surat
cd management-surat
npm install
```

## 4.3 Konfigurasi Environment (`.env.local`)

Buat file `.env.local` di root proyek dengan isi berikut (isi nilai dari dashboard Supabase → **Project Settings → API**):

```bash
NEXT_PUBLIC_SUPABASE_URL=https://<project-ref>.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=<anon-public-key>
SUPABASE_SERVICE_ROLE_KEY=<service-role-key>
```

| Variabel | Dari mana | Digunakan untuk |
| --- | --- | --- |
| `NEXT_PUBLIC_SUPABASE_URL` | Project Settings → API → Project URL | Semua client |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Project Settings → API → anon public | Client browser & server |
| `SUPABASE_SERVICE_ROLE_KEY` | Project Settings → API → service_role | `createUser` / `deleteUser` (admin) |

> ⚠️ `SUPABASE_SERVICE_ROLE_KEY` melewati RLS. Jangan pernah menaruhnya di kode browser; hanya dipakai di server action. Jangan commit `.env.local` ke repositori.

## 4.4 Database Setup (Supabase)

1. **Aktifkan provider Auth** → Authentication → Providers → **Email** (allow sign up boleh nonaktif; pengguna dibuat via aplikasi).
2. **Jalankan migration** secara berurutan pada **SQL Editor**:
   1. `src/migrations/001-auth-profiles.sql`
   2. `src/migrations/002-archives.sql`
   3. `src/migrations/003-surat.sql`
3. **Buat bucket storage `images`** (public), lalu buat sub-folder:
   `surat-masuk`, `surat-keluar`, `archives`, `users`.
4. **(Opsional) buat pengguna awal** langsung di dashboard Supabase → Authentication → Users → *Add user*, isi metadata:
   ```json
   { "name": "Petugas", "role": "admin" }
   ```
   Trigger `handle_new_user` otomatis mengisi tabel `profiles`.

> Rincian tiap tabel & policy ada di [dok-03-schema-database.md](./dok-03-schema-database.md).

## 4.5 Data Contoh (Seed)

Proyek menyediakan seed data agar langsung bisa dicoba:

```bash
npm run seed          # menulis data contoh
npm run seed:dry      # mode baca-saja: hanya menampilkan rencana, menulis minimal
```

Akun yang dibuat seed (lihat [dok-12-role-dan-hak-akses.md](./dok-12-role-dan-hak-akses.md)):

| Role | Email | Password |
| --- | --- | --- |
| Petugas (admin) | `petugas.surat@arsipku.test` | `Petugas123!` |
| Sekretaris (admin) | `sekretaris@arsipku.test` | `Sekretaris123!` |
| Staf TU (admin) | `staf.tata.usaha@arsipku.test` | `Staf123!` |
| Kepala Dinas (pimpinan) | `kepala.dinas@arsipku.test` | `Kepala123!` |
| Kabid Pelayanan (pimpinan) | `kabid.pelayanan@arsipku.test` | `Kabid123!` |

## 4.6 Menjalankan Aplikasi

```bash
npm run dev
# siap → http://localhost:3000
```

| Tujuan | Perintah | URL |
| --- | --- | --- |
| Development | `npm run dev` | `http://localhost:3000` |
| Build produksi | `npm run build` | — |
| Menjalankan build | `npm start` | `http://localhost:3000` |
| Lint | `npm run lint` | — |

## 4.7 Checklist Setelah Menjalankan

1. Buka `http://localhost:3000` → otomatis dialihkan ke **/login** (belum login).
2. Login sebagai **petugas** → dashboard admin tampil 4 kartu statistik.
3. Login sebagai **pimpinan** → dashboard ringkas + *Menunggu Persetujuan*.
4. Buat surat masuk dengan lampiran file → cek muncul di tabel.
5. Buat surat keluar → login sebagai pimpinan → **Setujui** → status menjadi *Disetujui*.
6. Ubah status surat menjadi *Diarsipkan* → cek masuk ke **Arsip** secara otomatis (sekali, tanpa duplikat).
7. Hapus sebuah surat/arsip → buka tab **Sampah** → **Pulihkan**.

> Bila ada langkah yang gagal, lihat [dok-13-troubleshooting.md](./dok-13-troubleshooting.md).