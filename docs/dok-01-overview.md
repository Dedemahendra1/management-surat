# 1. Overview Aplikasi

## 1.1 Identitas Aplikasi

| Aspek | Keterangan |
| --- | --- |
| Nama aplikasi | **Manajemen Surat & Arsip Digital** |
| Jenis | Web application (SPA-style di atas Next.js App Router) |
| Basis backend | Supabase (PostgreSQL, Auth, Storage) |
| Target pengguna | Petugas/sekretariat (admin), pejabat (pimpinan) pada instansi/OPD |
| Lokasi kode | Repositori `management-surat` |

## 1.2 Masalah yang Ingin Diselesaikan

Pengelolaan surat secara manual (kertas / spreadsheet) menimbulkan beberapa masalah:

| Masalah | Dampak |
| --- | --- |
| Data surat & arsip tersebar di banyak tempat | Sulit dicari, mudah hilang |
| Tidak ada jejak perubahan (siapa mengubah kapan) | Sulit audit |
| Alur persetujuan surat keluar tidak terkendali | Surat keluar tanpa persetujuan pimpinan |
| Arsip fisik dan digital tidak sinkron | Lokasi arsip sulit dilacak |
| Tidak ada status yang jelas | Tidak tahu di tahap mana suatu surat |

## 1.3 Solusi Aplikasi

Aplikasi menyediakan satu tempat untuk:

1. **Mencatat surat masuk & keluar** beserta lampiran berkas digital (file).
2. **Status alur** yang jelas untuk setiap surat (lihat diagram status di section 1.4).
3. **Persetujuan surat keluar oleh pimpinan** dengan pengaman di sisi server.
4. **Arsip digital otomatis** saat surat diarsipkan (tanpa duplikat) + arsip manual.
5. **Sampah dengan pemulihan** (soft delete + restore) agar data tidak hilang permanen.
6. **Audit log** di setiap perubahan (siapa, kapan, aksi apa).
7. **Kontrol akses berbasis role** (menu berbeda untuk admin dan pimpinan).

## 1.4 Alur Status Surat

### Surat Masuk

```text
Diterima → Disposisi → Diproses → Selesai → Diarsipkan
```

| Status | Arti | Pengubah |
| --- | --- | --- |
| `Diterima` | Surat baru dicatat | Admin / Pimpinan (edit) |
| `Disposisi` | Sedang didisposisikan (ada instruksi) | Admin / Pimpinan (edit) |
| `Diproses` | Sedang diproses | Admin / Pimpinan (edit) |
| `Selesai` | Sudah selesai diproses | Admin / Pimpinan (edit) |
| `Diarsipkan` | Masuk arsip digital otomatis | Admin / Pimpinan (edit) |

### Surat Keluar

```text
Dibuat → Disetujui → Dikirim → Selesai → Diarsipkan
```

| Status | Arti | Pengubah |
| --- | --- | --- |
| `Dibuat` | Surat baru dicatat | Admin |
| `Disetujui` | **Disetujui pimpinan** (hanya via tombol Setujui) | **Pimpinan saja** |
| `Dikirim` | Sudah dikirim | Admin / Pimpinan (edit) |
| `Selesai` | Selesai | Admin / Pimpinan (edit) |
| `Diarsipkan` | Masuk arsip digital otomatis | Admin / Pimpinan (edit) |

> Pengecualian penting: transisi `Dibuat → Disetujui` **tidak** bisa dilakukan lewat edit biasa — hanya lewat aksi **Setujui** milik pimpinan. Ini dijaga dua lapis: menu (tombol Setujui hanya muncul untuk role pimpinan) **dan** server action (`approveSuratKeluar`).

## 1.5 Ringkasan Fitur per Modul

| Modul | Fitur | Admin | Pimpinan |
| --- | --- | --- | --- |
| Login | Autentikasi email & password | ✔ | ✔ |
| Dashboard | Statistik & ringkasan | ✔ (lengkap) | ✔ (ringkas) |
| Surat Masuk | Lihat / Detail | ✔ | ✔ |
| | Tambah | ✔ | — |
| | Ubah (termasuk disposisi & status) | ✔ | ✔ |
| | Hapus (soft delete) | ✔ | — |
| Surat Keluar | Lihat / Detail | ✔ | ✔ |
| | Tambah | ✔ | — |
| | Ubah | ✔ | — |
| | **Setujui** (status dibuat) | — | **✔** (guard server) |
| | Hapus (soft delete) | ✔ | — |
| Sampah | Pulihkan (surat masuk/keluar/arsip) | ✔ | ✔ |
| Arsip Digital | Tambah / Ubah / Hapus / Detail / Pulihkan | ✔ | ✔ |
| Kategori Arsip | Tambah / Ubah / Hapus | ✔ | **Diblokir** (redirect `/admin`) |
| Pengguna | Tambah / Ubah / Hapus akun | ✔ | **Diblokir** (redirect `/admin`) |

## 1.6 Diagram Sistem (ringkasan visual)

Berikut alur utama sistem dalam satu diagram (workflow ringkas). Versi lengkap (10 diagram alur) ada di [dok-07-workflow-alur-sistem.md](./dok-07-workflow-alur-sistem.md).

![Alur persetujuan surat keluar oleh pimpinan](assets/diagrams/flow-approve.png)