# 9. Sequence Diagram

Sequence diagram memakai notasi participant/lifeline dengan blok `alt`/`opt` untuk percabangan. Semua diagram adalah **hasil render** (PNG).

## 9.1 Login

![Sequence diagram login](assets/diagrams/seq-login.png)

## 9.2 Tambah Surat Masuk + Kearsipan Otomatis

![Sequence diagram tambah surat masuk dengan kearsipan otomatis](assets/diagrams/seq-create-surat.png)

> Alur identik untuk `createSuratKeluar` (bucket `surat-keluar`, tabel `surat_keluar`, kategori 'Surat Keluar').

## 9.3 Persetujuan Surat Keluar

![Sequence diagram persetujuan surat keluar](assets/diagrams/seq-approve.png)

## 9.4 CRUD & Restore Arsip (semua role)

![Sequence diagram CRUD dan restore arsip](assets/diagrams/seq-archive-crud.png)

## 9.5 Guard Akses Proxy

![Sequence diagram guard akses proxy](assets/diagrams/seq-guard.png)