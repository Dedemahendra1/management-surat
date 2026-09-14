# 7. Workflow Aplikasi & Alur Sistem

Dua bagian: **(A) Workflow dalam bahasa sederhana** untuk semua pembaca, dan **(B) System Flow** (10 diagram hasil render) untuk pengembang.

## Bagian A — Workflow dalam Bahasa Sederhana

### Alur 1: Surat Masuk

```text
Surat datang
   ↓
Petugas mencatat (nomor, asal, perihal, lampiran)
   ↓
Diikuti statusnya: Diterima → Disposisi → Diproses → Selesai
   ↓
Setelah selesai diproses, diubah ke status "Diarsipkan"
   ↓
Sistem otomatis membuat Arsip Digital (sekali saja)
```

### Alur 2: Surat Keluar

```text
Petugas mencatat surat keluar (status "Dibuat")
   ↓
Pimpinan menyetujui (tombol "Setujui") → status "Disetujui"
   ↓
Petugas melengkapi: Dikirim → Selesai
   ↓
Diubah ke status "Diarsipkan" → Arsip Digital (sekali saja)
```

### Alur 3: Sampah & Pulihkan

```text
Hapus (soft delete)  ──►  pindah ke tab "Sampah"
   │
   └────────►  "Pulihkan"  ──►  kembali ke daftar aktif
```

### Alur 4: Login & Keamanan

```text
Buka aplikasi → belum login? → dialihkan ke /login
Login benar → cookie sesi → Dashboard sesuai role
Pimpinan buka User/Kategori → diblokir → kembali ke /admin
```

## Bagian B — System Flow (10 diagram)

> Notasi: stadium = mulai/selesai, kotak = proses, belah ketupat = keputusan.

### 1. Alur Login & Setup Sesi

![Alur login dan setup sesi](assets/diagrams/flow-login.png)

### 2. Guard Akses (Proxy `src/proxy.ts`)

![Guard akses pada proxy](assets/diagrams/flow-guard.png)

### 3. Surat Masuk — Buat / Ubah / Hapus

![Alur buat, ubah, dan hapus surat masuk](assets/diagrams/flow-surat-masuk.png)

### 4. Surat Keluar — Persetujuan Pimpinan

Transisi `dibuat → disetujui` **hanya** lewat `approveSuratKeluar`.

![Alur persetujuan surat keluar](assets/diagrams/flow-approve.png)

### 5. Kearsipan Otomatis (`src/lib/surat-archive.ts`)

![Kearsipan otomatis](assets/diagrams/flow-auto-archive.png)

Detil `getOrCreateCategory`:

![getOrCreateCategory](assets/diagrams/flow-get-category.png)

### 6. Arsip Digital — CRUD & Restore (semua role)

> Tidak ada guard role di UI arsip; admin & pimpinan sama-sama dapat menambah/mengubah/hapus/memulihkan. Guard hanya di proxy untuk halaman Kategori.

![CRUD dan restore arsip](assets/diagrams/flow-archive-crud.png)

### 7. Upload & Hapus Berkas (Storage)

![Upload dan hapus berkas](assets/diagrams/flow-storage.png)

### 8. Manajemen Kategori Arsip (hanya admin — pimpinan diblokir proxy)

![Manajemen kategori](assets/diagrams/flow-category.png)

### 9. Manajemen Pengguna (hanya admin — pimpinan diblokir proxy)

![Manajemen pengguna](assets/diagrams/flow-user.png)

---

### Ambang batas yang tidak ada

| Alur | Tidak ada di aplikasi |
| --- | --- |
| Registrasi / lupa password | Tidak ada |
| Notifikasi email | Tidak ada |
| Admin menyetujui surat keluar | Tidak bisa (guard server) |
| Disposisi kompleks multi-unit | Disposisi adalah teks pilihan preset pada surat masuk |