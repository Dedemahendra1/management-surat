# 13. Troubleshooting

Daftar masalah umum yang relevan dengan aplikasi ini, dikelompokkan per area. Hanya masalah yang benar-benar bisa terjadi pada kode yang ada.

## 13.1 Autentikasi & Login

| Gejala | Kemungkinan penyebab | Solusi |
| --- | --- | --- |
| `Login Failed - Invalid login credentials` | Email/password salah | Pastikan akun ada di Supabase Auth; cek via dashboard Supabase |
| Diarahkan terus ke `/login` walau kredensial benar | Sesinya tidak terpasang; cookie tidak ke-set | Clear cookies browser, login ulang; pastikan `next.config` tidak mengubah cookie |
| Toast error tiba-tiba saat submit | Server action error (misal Supabase tidak terjangkau) | Buka tab Network: cek URL Supabase reachable; pastikan `.env.local` benar |
| Setelah login muncul loop redirect | Proxy tidak mendapati sesi (cookies Supabase malformed) | Hapus cookies `sb-*` dan `user_profile`; cek waktu server (clock drift) |

## 13.2 Database & Konfigurasi

| Gejala | Kemungkinan penyebab | Solusi |
| --- | --- | --- |
| Halaman daftar kosong / toast *"Gagal memuat data..."* | RLS & tabel belum dibuat, atau policy deny | Jalankan ketiga migration SQL berurutan (lihat [dok-03](./dok-03-schema-database.md)) |
| Tabel ada tapi INSERT gagal | RLS policy `authenticated` belum ada | Pastikan policy INSERT `to authenticated` dibuat (003/migrasi) |
| Halaman `/admin/user` error saat buka | `SUPABASE_SERVICE_ROLE_KEY` kosong/salah | Isi service role key di `.env.local` (server-side only) |
| Login admin berhasil tapi dashboard kosong | `profiles` belum berisi baris untuk akun | Buat pengguna via dashboard dengan metadata `{ name, role }`, atau `npm run seed` |
| Pimpinan tidak terdeteksi (menunya admin) | Cookie `user_profile` lama (role dari sesi sebelumnya) | Logout → login ulang agar cookie diperbarui |

## 13.3 Upload & Storage

| Gejala | Kemungkinan penyebab | Solusi |
| --- | --- | --- |
| Upload gagal, form error | Bucket `images` belum dibuat / bukan public | Buat bucket di Storage; pastikan public |
| Ambil file 404 walau data tersimpan | `file_url` menyimpan path lama / folder salah | Upload ulang dari form; cek sub-folder (`surat-masuk`, `surat-keluar`, `archives`, `users`) |
| File lama tidak terhapus saat ganti | `prevPath` kosong saat update | Pastikan data lama punya `file_path` |
| File hilang saat surat dihapus | Perilaku normal: soft delete menghapus file dari storage | Pulihkan hanya mengembalikan baris, bukan file |

## 13.4 Environment / Run / Build

| Gejala | Kemungkinan penyebab | Solusi |
| --- | --- | --- |
| `npm run dev` gagal | Node lama / dependensi belum terpasang | `node -v` (20.9+), lalu `npm install` |
| `npm run build` error lint/type | Type error / lint | `npm run lint`; perbaiki sesuai pesan |
| Port 3000 dipakai | Aplikasi lain menghuninya | Jalankan dengan port lain: `npx next dev -p 3001` |
| Behavior di produksi berbeda | Build tanpa env / `.env.local` tidak dibaca produksi | Set `NEXT_PUBLIC_*` di environment produksi |
| `npm run seed` gagal | `.env.local` belum ada / key salah | Buat `.env.local` sesuai [dok-04](./dok-04-cara-menjalankan.md) |

## 13.5 Perilaku Aplikasi (bukan bug)

| Gejala | Penjelasan |
| --- | --- |
| Pimpinan tidak melihat tombol *Tambah* | Memang tidak ada untuk role pimpinan (hanya lihat/edit/detail/setujui) |
| Pimpinan tidak bisa buka halaman Kategori/User | Diblokir proxy → redirect `/admin` |
| Admin tidak melihat tombol *Setujui* | Hanya untuk role pimpinan |
| Surat tidak muncul di Arsip saat diupload | Kearsipan otomatis hanya terjadi saat status **diarsipkan** |
| Arsip muncul ganda | Seharusnya tidak; sistem dedup via `archive_logs` (`auto_archive`). Jika terjadi, cek duplikasi log |
| Menyetujui surat muncul error walau role pimpinan | Status harus tepat `dibuat` dan cookie `user_profile` role pimpinan |

## 13.6 Kurangnya Fitur (sengaja tidak ada)

| Fitur | Status |
| --- | --- |
| Registrasi & reset password | Tidak ada — akun dibuat admin |
| Notifikasi/email | Tidak ada |
| Halaman khusus role pimpinan | Tidak ada — memakai `/admin/*` |
| Admin menyetujui surat keluar | Tidak bisa |

---

> Bila masalah tidak tercantum, kumpulkan data: pesan error di toast/browser console (F12 → Console) dan status/timestamp terkait. Dokumentasi ini menyertakan patokan kode tiap modul agar diagnosis cepat (lihat [dok-02](./dok-02-teknologi.md)).