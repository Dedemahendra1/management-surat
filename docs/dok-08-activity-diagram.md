# 8. Activity Diagram (Swimlane)

Semua diagram memakai **swimlane/partition berbentuk kolom** — satu kolom (lane) per aktor/komponen yang benar-benar terlibat pada kode. Aturan:

- Kolom lane = tanggung jawab aktor (dasar dari kode, bukan dibuat-buat), setiap kolom punya header lane yang jelas.
- Panah lintas lane = perpindahan tanggung jawab antar aktor (mis. Admin → Sistem → Pimpinan).
- Node `([...])` = aktivitas (box sudut membulat); `{...}` = keputusan; `((Mulai))`/`((Selesai))` = titik awal/akhir (lingkaran).
- Kearsipan otomatis adalah proses internal server → lane tunggal `SISTEM`.

Notasi: Mermaid **`swimlane-beta`** (arah `TB`) — subgraph tingkat atas dirender sebagai lane kolom vertikal yang berdampingan, panah boleh menyilang antar-lane.

Konsistensi dengan Use Case ([dok-10](./dok-10-use-case-diagram.md)) dan Class Diagram ([dok-11](./dok-11-class-diagram.md)):

| Activity | Use Case yang dijalankan | Kelas pendukung |
| --- | --- | --- |
| 8.1 Login | UC1 | `LoginActions`, `SupabaseServerClient`, `Profile`, `SessionGuard` |
| 8.2 Tambah Surat Masuk | UC3, UC15 | `SuratMasukActions`, `StorageActions`, `SuratArchiveService`, `CreateSuratMasukSchema` |
| 8.3 Persetujuan Surat Keluar | UC10 | `SuratKeluarActions` (`approveSuratKeluar` + `getUserRole`) |
| 8.4 Kearsipan Otomatis | UC15 | `SuratArchiveService`, `SupabaseServerClient` |
| 8.5 Soft Delete & Restore | UC5, UC9, UC11, UC12 | `SuratMasukActions`, `SuratKeluarActions`, `ArchiveActions`, `StorageActions` |
| 8.6 Guard Akses Proxy | lintas use case | `SessionGuard`, `SupabaseServerClient` |

## 8.1 Login

| Lane | Aktor |
| --- | --- |
| PENGGUNA | Pengguna / browser |
| SISTEM | Server Action + Supabase Auth + cookie `user_profile` |

```mermaid
swimlane-beta TB
  subgraph LNU["PENGGUNA / Browser"]
    U1((Mulai))
    U2(["Buka halaman /login"])
    U3(["Isi email dan password"])
    U4(["Klik tombol Masuk"])
    U1 --> U2 --> U3 --> U4
  end
  subgraph LNS["SISTEM (Server Action + Supabase Auth)"]
    S1(["Validasi schema (zod)"])
    S2{"Kredensial valid?"}
    S3(["Toast error: Login Failed"])
    S4(["signInWithPassword"])
    S5(["Ambil profil dari tabel profiles"])
    S6(["Set cookie user_profile"])
    S7(["Redirect ke halaman utama"])
    S8((Selesai))
    S1 --> S2
    S2 -- Tidak --> S3 --> S8
    S2 -- Ya --> S4 --> S5 --> S6 --> S7 --> S8
  end
  U4 --> S1
```

## 8.2 Tambah Surat Masuk + Kearsipan Otomatis

| Lane | Aktor/Role |
| --- | --- |
| ADMIN | Petugas/Admin (role `admin`) |
| SISTEM | Server Action + Storage + DB |

```mermaid
swimlane-beta TB
  subgraph LNA["ADMIN"]
    A1((Mulai))
    A2(["Buka halaman Surat Masuk"])
    A3(["Klik tombol + Surat Masuk Baru"])
    A4(["Isi form: nomor, asal, perihal, status, disposisi"])
    A5(["Pilih lampiran file (opsional)"])
    A6(["Klik Simpan"])
    A1 --> A2 --> A3 --> A4 --> A5 --> A6
  end
  subgraph LNS2["SISTEM (Server Action + Storage + DB)"]
    B1(["Validasi createSuratMasukSchema"])
    B2{"Data valid?"}
    B3(["Tampilkan error validasi"])
    B4(["Ambil user id sesi"])
    B5{"Ada file baru?"}
    B6(["Unggah ke bucket images/surat-masuk"])
    B7(["Insert baris ke tabel surat_masuk"])
    B8{"Insert berhasil?"}
    B9(["Tulis log create di surat_logs"])
    B10{"Status = diarsipkan?"}
    B11(["Jalankan kearsipan otomatis"])
    B12(["Toast: surat berhasil disimpan"])
    B13((Selesai))
    B1 --> B2
    B2 -- Tidak --> B3 --> B13
    B2 -- Ya --> B4 --> B5
    B5 -- Ya --> B6 --> B7
    B5 -- Tidak --> B7
    B7 --> B8
    B8 -- Tidak --> B3
    B8 -- Ya --> B9 --> B10
    B10 -- Ya --> B11 --> B12 --> B13
    B10 -- Tidak --> B12 --> B13
  end
  A6 --> B1
```

> Alur yang sama berlaku untuk **Tambah Surat Keluar** (`createSuratKeluarSchema`, bucket `images/surat-keluar`) — bedanya field `tujuan` menggantikan `asal_surat`.

## 8.3 Persetujuan Surat Keluar

| Lane | Aktor/Role |
| --- | --- |
| PIMPINAN | Pejabat (role `pimpinan`) |
| SISTEM | Server Action + DB |

```mermaid
swimlane-beta TB
  subgraph LNP["PIMPINAN"]
    P1((Mulai))
    P2(["Buka halaman Surat Keluar"])
    P3(["Buka Detail surat"])
    P4(["Klik menu Setujui (muncul hanya bila status Dibuat)"])
    P5(["Lihat hasil operasi"])
    P1 --> P2 --> P3 --> P4
  end
  subgraph LNA2["SISTEM (Server Action + DB)"]
    Q1(["Ambil role dari tabel profiles"])
    Q2{"Role = pimpinan?"}
    Q3(["Toast error: Hanya pimpinan yang dapat menyetujui surat keluar"])
    Q4(["Ambil data surat keluar"])
    Q5{"Surat ditemukan?"}
    Q6(["Toast error: Surat tidak ditemukan"])
    Q7{"Status = dibuat?"}
    Q8(["Toast error: Hanya surat berstatus Dibuat yang dapat disetujui"])
    Q9(["Update status menjadi disetujui"])
    Q10{"Update berhasil?"}
    Q11(["Tulis log approve (detail: role)"])
    Q12(["Toast: surat berhasil disetujui"])
    Q13((Selesai))
    Q1 --> Q2
    Q2 -- Tidak --> Q3 --> Q13
    Q2 -- Ya --> Q4 --> Q5
    Q5 -- Tidak --> Q6 --> Q13
    Q5 -- Ya --> Q7
    Q7 -- Tidak --> Q8 --> Q13
    Q7 -- Ya --> Q9 --> Q10
    Q10 -- Tidak --> Q3
    Q10 -- Ya --> Q11 --> Q12 --> Q13
  end
  P4 --> Q1
  Q3 -.-> P5
  Q6 -.-> P5
  Q8 -.-> P5
  Q12 -.-> P5
```

## 8.4 Kearsipan Otomatis (internal sistem)

Lane tunggal `SISTEM` karena hanya server yang terlibat (dipanggil dari Tambah/Ubah surat saat status `diarsipkan`).

```mermaid
swimlane-beta TB
  subgraph LNZ["SISTEM (server action)"]
    R1((Mulai))
    R2(["Dijalankan saat status surat = diarsipkan"])
    R3(["Cek duplikat di archive_logs aksi auto_archive (surat_id + surat_type)"])
    R4{"Sudah pernah diarsipkan?"}
    R5(["Sinkronkan/update data arsip"])
    R6(["Dapatkan atau buat kategori Surat Masuk / Surat Keluar"])
    R7(["Insert baris ke tabel archives"])
    R8(["Tulis log create dan auto_archive"])
    R9((Selesai))
    R1 --> R2 --> R3 --> R4
    R4 -- Ya --> R5 --> R9
    R4 -- Tidak --> R6 --> R7 --> R8 --> R9
  end
```

## 8.5 Soft Delete & Restore (Surat / Arsip)

| Lane | Aktor/Role |
| --- | --- |
| PENGGUNA | Admin & Pimpinan (Hapus surat hanya admin; Hapus/Pulihkan arsip semua role) |
| SISTEM | Server Action + Storage + DB |

```mermaid
swimlane-beta TB
  subgraph LNT["PENGGUNA (Admin atau Pimpinan)"]
    T1((Mulai))
    T2(["Buka modul Surat atau Arsip"])
    T3(["Pilih baris data (tab Semua/Aktif atau Sampah)"])
    T4(["Klik menu Hapus atau Pulihkan"])
    T1 --> T2 --> T3 --> T4
  end
  subgraph LNW["SISTEM (Server Action + Storage + DB)"]
    W1{"Aksi yang dipilih?"}
    W2(["Hapus file lampiran bila ada"])
    W3(["Soft delete: is_deleted = true dan deleted_at"])
    W4(["Tulis log delete"])
    W5(["Restore: is_deleted = false dan deleted_at = null"])
    W6(["Tulis log restore"])
    W7(["Toast hasil operasi"])
    W8((Selesai))
    W1 -- Hapus --> W2 --> W3 --> W4 --> W7 --> W8
    W1 -- Pulihkan --> W5 --> W6 --> W7 --> W8
  end
  T4 --> W1
```

## 8.6 Guard Akses Proxy

| Lane | Aktor/Role |
| --- | --- |
| BROWSER | Pengguna |
| PROXY | `src/proxy.ts` → `updateSession` |

```mermaid
swimlane-beta TB
  subgraph LNB["BROWSER"]
    G1((Mulai))
    G2(["Akses /login"])
    G3(["Akses halaman /admin/*"])
    G1 --> G2
    G1 --> G3
  end
  subgraph LNP2["PROXY (updateSession)"]
    H1(["Ambil sesi via getUser"])
    H2{"Pengguna ditemukan?"}
    H3{"Path = /login?"}
    H4(["Redirect ke /login"])
    H5(["Baca cookie user_profile"])
    H6{"Path = /login?"}
    H7(["Redirect ke /"])
    H8{"Role = pimpinan?"}
    H9{"Path dimulai /admin/user atau /admin/archive/category?"}
    H10(["Redirect ke /admin"])
    H11(["Lanjutkan request"])
    H12((Selesai))
    H13((Selesai))
    H1 --> H2
    H2 -- Tidak --> H3
    H3 -- Ya --> H12
    H3 -- Tidak --> H4 --> H12
    H2 -- Ya --> H5 --> H6
    H6 -- Ya --> H7 --> H12
    H6 -- Tidak --> H8
    H8 -- Tidak --> H11 --> H13
    H8 -- Ya --> H9
    H9 -- Ya --> H10 --> H13
    H9 -- Tidak --> H11 --> H13
  end
  G2 --> H1
  G3 --> H1
```