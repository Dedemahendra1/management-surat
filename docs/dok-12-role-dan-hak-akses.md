# 12. Role & Hak Akses

Aplikasi punya **dua role**: `admin` (petugas/sekretariat) dan `pimpinan` (pejabat).

## 12.1 Daftar Akun (Seed)

| Role | Nama | Email | Password |
| --- | --- | --- | --- |
| Admin | Petugas Surat | `petugas.surat@arsipku.test` | `Petugas123!` |
| Admin | Sekretaris | `sekretaris@arsipku.test` | `Sekretaris123!` |
| Admin | Staf Tata Usaha | `staf.tata.usaha@arsipku.test` | `Staf123!` |
| Pimpinan | Kepala Dinas | `kepala.dinas@arsipku.test` | `Kepala123!` |
| Pimpinan | Kabid Pelayanan | `kabid.pelayanan@arsipku.test` | `Kabid123!` |

> Seed juga membuat 12 kategori, 57 surat masuk, 54 surat keluar, dan 20 log (tidak membuat arsip).

## 12.2 Matriks Hak Akses per Modul

| Modul / Fitur | Admin | Pimpinan |
| --- | --- | --- |
| **Dashboard** | ✔ Lengkap (4 StatCard, aktivitas, grafik) | ✔ Ringkas (pencarian, 3 StatCard, Menunggu Persetujuan) |
| **Surat Masuk** — Lihat / Detail | ✔ | ✔ |
| **Surat Masuk** — Tambah | ✔ | — |
| **Surat Masuk** — Ubah (termasuk disposisi & status) | ✔ | ✔ |
| **Surat Masuk** — Hapus | ✔ | — |
| **Surat Keluar** — Lihat / Detail | ✔ | ✔ |
| **Surat Keluar** — Tambah / Ubah / Hapus | ✔ | — |
| **Surat Keluar** — Setujui (status Dibuat) | — | **✔** (guard server) |
| **Arsip** — Tambah / Ubah / Hapus / Detail | ✔ | ✔ |
| **Arsip** — Pulihkan dari Sampah | ✔ | ✔ |
| **Kategori Arsip** — CRUD | ✔ | **Diblokir** (redirect `/admin`) |
| **Pengguna** — CRUD | ✔ | **Diblokir** (redirect `/admin`) |

## 12.3 Menu Sidebar per Role

| Admin | Pimpinan |
| --- | --- |
| Dashboard | *(tidak ada)* |
| User | *(tidak ada)* |
| Surat Masuk | Surat Masuk |
| Surat Keluar | Surat Keluar |
| Arsip → Semua Arsip, Kategori | Arsip |

> Sumber: `src/constant/sidebar-constant.ts`. Halaman `/admin` tetap bisa dibuka pimpinan lewat URL (proxy tidak memblokir), namun bukan menu resmi.

## 12.4 Bagaimana Hak Akses Diterapkan

| Lapisan | Mekanisme | Modul yang terpengaruh |
| --- | --- | --- |
| **Menu (UI)** | Sidebar menampilkan menu sesuai roll; tombol aksi disembunyikan (`isPimpinan`) | Tambah/Hapus pada Surat Masuk & Keluar |
| **UI condition** | Tombol `+ X Baru` dan menu **Hapus** hanya dirender untuk admin; **Setujui** hanya untuk pimpinan | Pengguna & surat |
| **Proxy (middleware)** | `src/proxy.ts`: pimpinan yang membuka `/admin/user` atau `/admin/archive/category` **di-redirect** ke `/admin` | Kategori & Pengguna |
| **Server action (guard)** | `approveSuratKeluar`: `getUserRole(id) !== 'pimpinan'` → error `"Hanya pimpinan yang dapat menyetujui surat keluar."`; status ≠ `dibuat` → error tersendiri | Persetujuan surat keluar |
| **RLS (database)** | Semua policy `to authenticated` (tanpa role); tidak ada pembatasan role di DB | — |

## 12.5 Diagram Guard Akses

Guard akses proxy digambarkan penuh dengan swimlane di [dok-08-activity-diagram.md](./dok-08-activity-diagram.md) dan alur keputusan di [dok-07-workflow-alur-sistem.md](./dok-07-workflow-alur-sistem.md).

![Guard akses pada proxy](assets/diagrams/flow-guard.png)

## 12.6 Batasan Penting

| Pernyataan | Status |
| --- | --- |
| Admin dapat menyetujui surat keluar | **Salah** — hanya pimpinan |
| Pimpinan punya dashboard & menu khusus | **Salah** — memakai `/admin/*` yang sama dengan menu tersaring |
| Pimpinan diblokir dari halaman Arsip | **Salah** — arsip dapat dikelola penuh oleh kedua role |
| Kategori arsip dikelola pimpinan | **Salah** — diblokir proxy |
| Registrasi mandiri | **Tidak ada** — akun dibuat oleh admin |