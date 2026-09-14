# 6. Fitur File, Dokumen & Arsip

Panduan khusus untuk **berkas lampiran**, **arsip digital**, dan **kearsipan otomatis**.

## 6.1 Penyimpanan Berkas (Storage)

Semua file unggahan disimpan di **bucket `images`** (public) yang sama, dibedakan dengan sub-folder:

| Jenis data | Sub-folder bucket `images` | Catatan |
| --- | --- | --- |
| Lampiran surat masuk | `surat-masuk/` | Dari form Surat Masuk |
| Lampiran surat keluar | `surat-keluar/` | Dari form Surat Keluar |
| Lampiran arsip manual | `archives/` | Dari form Arsip Baru |
| Foto profil pengguna | `users/` | Dari modul Pengguna |

Pola penamaan file: `{folder}/{Date.now()}-{nama-asli-file}` (contoh `surat-masuk/1700000000123-undangan.pdf`).

**URL publik** file mengikuti pola:

```text
{SUPABASE_URL}/storage/v1/object/public/images/{path}
```

| Entitas | Menyimpan di tabel | Kolom |
| --- | --- | --- |
| Surat masuk / keluar | `surat_masuk` / `surat_keluar` | `file_url`, `file_path`, `file_name`, `file_size` |
| Arsip | `archives` | `file_url`, `file_path`, `file_name`, `file_size` |

> `file_url` dipakai **pratinjau/unduh** langsung (bucket public). `file_path` disimpan agar file bisa **dihapus dari storage** ketika data di-soft-delete.

### Alur upload & penghapusan file (rendered diagram)

![Alur upload dan hapus berkas di storage](assets/diagrams/flow-storage.png)

**Aturan penting:**

| Skenario | Perilaku |
| --- | --- |
| Ada `prevPath` (file lama) | File lama dihapus dari storage dulu, lalu file baru diunggah |
| Upload gagal | Form dikembalikan dengan pesan error (data **tidak** tersimpan) |
| Hapus data (soft delete) | File di storage **ikut dihapus** bila `file_path` ada |
| Pulihkan (restore) | Hanya baris yang dipulihkan; file yang sudah dihapus **tidak** kembali |

## 6.2 Format & Batasan Berkas

| Aspek | Keterangan |
| --- | --- |
| Jenis | Tergantung input file form (tidak ada pembatasan ekstensi di kode) |
| Ukuran | Ikut batas form/`intake` (tidak ada aturan khusus; perhatikan kuota bucket) |
| Pratinjau | Cukup klik URL file (buka di tab baru / unduh) |
| Mendukung | Semua jenis file yang bisa dibuka browser (PDF, gambar, dll.) |

## 6.3 Arsip Digital

### Data / Metadata tiap arsip

Form **Arsip Baru** / **Edit** menyimpan:

| Kolom | Keterangan |
| --- | --- |
| Judul (`title`) | Wajib |
| Nomor (`number`) | Nomor arsip/dokumen |
| Kategori (`category_id`) | Dari `archive_categories` (warna ikut kategori) |
| Tanggal (`date`) | Tanggal dokumen |
| Deskripsi (`description`) | Keterangan |
| File | Lampiran (opsional) |
| Lokasi fisik | (lewat kolom deskripsi/keterangan) |

### Mencari & memfilter

| Aksi | Perilaku (sesuai kode) |
| --- | --- |
| Kotak pencarian "Cari judul atau nomor dokumen..." | Pencocokan parsial (`ilike`) pada kolom `title` **atau** `number` |
| Filter "Semua Kategori" | Filter berdasar `category_id` |
| Tab Semua / Aktif / Sampah | `is_deleted` false / true / (default aktif) |

### Menu aksi arsip

| Aksi | Berlaku | Perilaku |
| --- | --- | --- |
| Detail | semua role | Dialog detail + log (subquery `archive_logs`) |
| Edit | semua role | Form update; file baru menggantikan file lama |
| Hapus | semua role | Hapus file (bila ada) + *soft delete* + log `delete` |
| Pulihkan | semua role | `is_deleted=false` + log `restore` |

> Berbeda dari modul surat, halaman arsip **tidak** memiliki guard role: admin dan pimpinan sama-sama bisa tambah/ubah/hapus/pulihkan.

## 6.4 Kearsipan Otomatis (dari Surat Berstatus Diarsipkan)

Ketika surat masuk/keluar diubah statusnya menjadi **Diarsipkan**, sistem otomatis:

1. Membuat/menyinkronkan arsip digital (judul = `"{nomor} — {perihal}"`).
2. Memberi kategori otomatis (Surat Masuk `#0ea5e9` / Surat Keluar `#f97316`).
3. Mencatat log `create` + `auto_archive` (dengan `{surat_id, surat_type}`).
4. **Mencegah duplikat** — jika surat yang sama sudah pernah diarsipkan, isi diperbarui (sinkronisasi), bukan dibuat baris baru.

![Kearsipan otomatis (deduplikasi)](assets/diagrams/flow-auto-archive.png)

Detil `getOrCreateCategory`:

![Alur helper getOrCreateCategory](assets/diagrams/flow-get-category.png)

| Jenis surat | Kategori otomatis | Warna |
| --- | --- | --- |
| Surat masuk | Surat Masuk | `#0ea5e9` |
| Surat keluar | Surat Keluar | `#f97316` |

## 6.5 Workflow Status Terkait Arsip

| Surat Masuk | Surat Keluar | Efek ke Arsip |
| --- | --- | --- |
| Diterima → Disposisi → Diproses → Selesai | Dibuat → Disetujui → Dikirim → Selesai | Belum masuk arsip |
| **Diarsipkan** | **Diarsipkan** | **Arsip otomatis dibuat** (sekali, tanpa duplikat) |

Diagram alur lengkap kearsipan: [dok-07-workflow-alur-sistem.md](./dok-07-workflow-alur-sistem.md).

## 6.6 Catatan Akurasi

| Pernyataan umum | Status sebenarnya |
| --- | --- |
| "Log file unduhan/praktik" | Tidak ada log khusus unduhan |
| "Ekstensi tertentu saja" | Tidak ada whitelist ekstensi |
| "Arsip otomatis untuk tiap upload" | Tidak — hanya saat status **diarsipkan** |
| "Pimpinan tidak bisa kelola arsip" | Salah — arsip dapat dikelola kedua role |