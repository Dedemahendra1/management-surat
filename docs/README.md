# 📄 Manajemen Surat & Arsip Digital

> Aplikasi web untuk pengelolaan surat masuk, surat keluar, dan arsip digital pada sebuah instansi/OPD (berbasis **Next.js + Supabase**).

Dokumentasi ini disusun agar **akurat terhadap kode yang benar-benar ada** dan mudah digunakan oleh dua kalangan pembaca: **pengguna aplikasi** (petugas, sekretaris, pimpinan) dan **pengembang/administrator** (setup, skema basis data, troubleshooting).

## Daftar Dokumen

| No | Dokumen | Isi | Untuk |
| --- | --- | --- | --- |
| 1 | [dok-01-overview.md](./dok-01-overview.md) | Gambaran aplikasi: tujuan, masalah yang diselesaikan, target pengguna, ringkasan fitur | Semua |
| 2 | [dok-02-teknologi.md](./dok-02-teknologi.md) | Teknologi, dependensi, dan arsitektur | Pengembang |
| 3 | [dok-03-schema-database.md](./dok-03-schema-database.md) | Skema basis data (ERD, tabel, status, log, RLS, indeks) | Pengembang |
| 4 | [dok-04-cara-menjalankan.md](./dok-04-cara-menjalankan.md) | Cara menjalankan dari nol (prerequisities → run) | Administrator |
| 5 | [dok-05-panduan-pengguna.md](./dok-05-panduan-pengguna.md) | **Panduan penggunaan lengkap** + User Guide berurutan | Pengguna |
| 6 | [dok-06-fitur-file-arsip.md](./dok-06-fitur-file-arsip.md) | Khusus fitur file/dokumen/arsip | Pengguna & pengembang |
| 7 | [dok-07-workflow-alur-sistem.md](./dok-07-workflow-alur-sistem.md) | Workflow dalam bahasa sederhana + System Flow 10 diagram | Semua |
| 8 | [dok-08-activity-diagram.md](./dok-08-activity-diagram.md) | Activity diagram (swimlane) 6 diagram | Pengembang |
| 9 | [dok-09-sequence-diagram.md](./dok-09-sequence-diagram.md) | Sequence diagram 5 diagram | Pengembang |
| 10 | [dok-10-use-case-diagram.md](./dok-10-use-case-diagram.md) | Use case diagram + katalog use case | Pengembang |
| 11 | [dok-11-class-diagram.md](./dok-11-class-diagram.md) | Class diagram lapisan UI & server | Pengembang |
| 12 | [dok-12-role-dan-hak-akses.md](./dok-12-role-dan-hak-akses.md) | Role, akun contoh, dan matriks hak akses | Semua |
| 13 | [dok-13-troubleshooting.md](./dok-13-troubleshooting.md) | Memecahkan masalah umum | Administrator |

## Aset Diagram & Screenshot

Semua diagram pada dokumentasi ini adalah **gambar hasil render** (PNG resolusi tinggi) — bukan hanya kode sumber.

| Folder | Isi |
| --- | --- |
| `assets/diagrams/*.png` | 26 diagram hasil render (PNG, resolusi 2×) |
| `assets/diagrams/*.svg` | Versi vektor diagram |
| `assets/diagrams/src/*.mmd` | Kode sumber Mermaid (file pendukung saja) |
| `assets/screenshots/*.png` | Screenshot UI aplikasi nyata (halaman login) |

## Ringkasan Fitur (5 Menit)

1. **Login** dengan email & password (Supabase Auth); sesi disimpan aman (cookie httpOnly).
2. **Dashboard per role** — Admin melihat statistik lengkap; Pimpinan melihat ringkasan + surat yang menunggu persetujuan.
3. **Surat Masuk** — catat, lampirkan berkas, ubah status & disposisi, hapus (admin).
4. **Surat Keluar** — catat, lampirkan berkas, **setujui oleh pimpinan** (status `dibuat → disetujui`).
5. **Status & workflow** — surat mengalir melalui status; saat berstatus *Diarsipkan*, surat **otomatis masuk arsip digital** tanpa duplikat.
6. **Arsip Digital** — kategorisasi, pencarian, filter, unggah manual, restorasi sampah.
7. **Sampah (Trash)** — hapus bersifat *soft delete*, bisa **Pulihkan** kapan saja.
8. **Manajemen Kategori & Pengguna** — khusus admin.

### Batasan yang penting diketahui

Dokumentasi ini **hanya mencatat fitur yang benar-benar ada**. Berikut yang **tidak** ada di aplikasi:

| Hal | Status |
| --- | --- |
| Registrasi mandiri / lupa & reset password | Tidak ada (akun dibuat oleh admin) |
| Notifikasi / email otomatis | Tidak ada |
| Menyetujui surat keluar oleh admin | **Tidak bisa** (hanya pimpinan, guard di server) |
| Dashboard / menu terpisah khusus pimpinan | Tidak ada; pimpinan memakai halaman yang sama (`/admin/*`) dengan menu berbeda |

---

*Status dokumentasi terakhir diperbarui: semua diagram telah di-render sebagai gambar; isi diverifikasi terhadap kode sumber (`src/`).*