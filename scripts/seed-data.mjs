/**
 * seed-data.mjs
 * ------------------------------------------------------------------
 * Seed data generator untuk aplikasi Management Surat / Arsip Digital.
 *
 * Membuat data dummy yang realistis dan idempotent (aman dijalankan
 * ulang) untuk tabel: profiles (via auth), archive_categories,
 * surat_masuk, surat_keluar, dan surat_logs.
 *
 * PEMAKAIAN:
 *   node --env-file=.env.local scripts/seed-data.mjs
 *
 * MENGANDUNG KONFIGURASI:
 *   - READONLY=true  -> hanya menampilkan ringkasan, tanpa menulis data
 *   - FORCE=true     -> jalankan insert meski tabel sudah berisi data
 * ------------------------------------------------------------------
 */

import { createClient } from '@supabase/supabase-js';

/* ─────────────────────────────────────────────────────────────
 * Konfigurasi & env
 * ───────────────────────────────────────────────────────────── */
const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY,
);

const READONLY = process.env.READONLY === 'true';
const FORCE = process.env.FORCE === 'true';

const log = (...a) => console.log(...a);
const ok = (msg) => log('  \u2713', msg);
const warn = (msg) => log('  \u26a0', msg);

/* ─────────────────────────────────────────────────────────────
 * Helper PDF (PFD valid minimal)
 * ───────────────────────────────────────────────────────────── */
function makePdf(lines = ['Dokumen Surat', 'Arsip Digital']) {
  const objects = [];
  objects.push('<< /Type /Catalog /Pages 2 0 R >>');
  objects.push('<< /Type /Pages /Kids [3 0 R] /Count 1 >>');
  objects.push(
    '<< /Type /Page /Parent 2 0 R /MediaBox [0 0 595 842] /Resources << /Font << /F1 5 0 R >> >> /Contents 4 0 R >>',
  );
  const text = lines.map((l, i) => `BT /F1 14 Tf 60 ${740 - i * 28} Td (${l}) Tj ET`).join('\n');
  objects.push(`<< /Length ${Buffer.byteLength(text, 'utf8')} >>\nstream\n${text}\nendstream`);
  objects.push('<< /Type /Font /Subtype /Type1 /BaseFont /Helvetica >>');

  let pdf = '%PDF-1.4\n';
  const offsets = [];
  for (let i = 0; i < objects.length; i++) {
    offsets.push(Buffer.byteLength(pdf, 'utf8'));
    pdf += `${i + 1} 0 obj\n${objects[i]}\nendobj\n`;
  }
  const xrefStart = Buffer.byteLength(pdf, 'utf8');
  pdf += `xref\n0 ${objects.length + 1}\n0000000000 65535 f \n`;
  for (const off of offsets) pdf += `${String(off).padStart(10, '0')} 00000 n \n`;
  pdf += `trailer\n<< /Size ${objects.length + 1} /Root 1 0 R >>\nstartxref\n${xrefStart}\n%%EOF\n`;
  return Buffer.from(pdf, 'utf8');
}

/* PNG 1x1 placeholder (biru) */
const PNG_BASE64 =
  'iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNk+M9QDwADhgGAWjR9awAAAABJRU5ErkJggg==';
const PNG_BUFFER = Buffer.from(PNG_BASE64, 'base64');

/* ─────────────────────────────────────────────────────────────
 * Definisi data
 * ───────────────────────────────────────────────────────────── */

/* 1. USER (role yang tersedia: admin & pimpinan). Email unik. */
const USERS = [
  {
    email: 'petugas.surat@arsipku.test',
    password: 'Petugas123!',
    name: 'Budi Santoso',
    role: 'admin',
  },
  {
    email: 'sekretaris@arsipku.test',
    password: 'Sekretaris123!',
    name: 'Siti Rahayu',
    role: 'admin',
  },
  {
    email: 'staf.tata.usaha@arsipku.test',
    password: 'Staf123!',
    name: 'Andi Pratama',
    role: 'admin',
  },
  {
    email: 'kepala.dinas@arsipku.test',
    password: 'Kepala123!',
    name: 'Dr. H. Mulyadi, M.Si.',
    role: 'pimpinan',
  },
  {
    email: 'kabid.pelayanan@arsipku.test',
    password: 'Kabid123!',
    name: 'Rina Kartika, S.E.',
    role: 'pimpinan',
  },
];

/* 2. KATEGORI SURAT/ARSIP (disimpan di archive_categories) */
const CATEGORIES = [
  { name: 'Undangan', description: 'Undangan rapat, acara, atau kegiatan', color: '#3b82f6' },
  { name: 'Permohonan', description: 'Permohonan izin, data, atau fasilitas', color: '#8b5cf6' },
  { name: 'Pemberitahuan', description: 'Pemberitahuan/informasi resmi', color: '#06b6d4' },
  { name: 'Pengajuan', description: 'Pengajuan anggaran, proposal, atau usulan', color: '#f59e0b' },
  { name: 'Kerja Sama', description: 'MoU / perjanjian kerja sama', color: '#10b981' },
  { name: 'Keputusan', description: 'Keputusan atau penetapan resmi', color: '#ef4444' },
  { name: 'Dinas', description: 'Surat dinas resmi instansi', color: '#6366f1' },
  { name: 'Laporan', description: 'Laporan kegiatan, bulanan, tahunan', color: '#14b8a6' },
  { name: 'Administrasi', description: 'Surat administratif umum', color: '#64748b' },
  { name: 'Surat Edaran', description: 'Surat edaran resmi', color: '#a855f7' },
  { name: 'Undangan Rapat', description: 'Undangan khusus rapat koordinasi', color: '#0ea5e9' },
  { name: 'Tugas', description: 'Surat perintah, penugasan, surat tugas', color: '#f97316' },
];

/* 3. Instansi/pihak eksternal fiktif */
const ASAL = [
  'PT Nusantara Jaya', 'Pemerintah Kota Bandung', 'Kementerian Dalam Negeri',
  'Dinas Pendidikan Jawa Barat', 'PT Telekomunikasi Nusantara', 'Universitas Padjadjaran',
  'PT Bank Niaga Sejahtera', 'Dinas Kesehatan Provinsi', 'PT Energi Terbarukan Nusantara',
  'Kepala Desa Cibiru Wetan', 'PT Mitra Logistik Indonesia', 'Badan Kepegawaian Daerah',
  'PT Agro Nusantara Sejahtera', 'Dinas Perhubungan Kota', 'Yayasan Pendidikan Harapan Bangsa',
  'PT Konstruksi Cipta Karya', 'Dinas Sosial Provinsi', 'PT Digital Solusi Indonesia',
  'Sekretariat Daerah', 'PT Perkebunan Nusantara', 'Instalasi Pemasyarakatan',
  'PT Aksara Mandiri', 'Balai Pengelolaan Air', 'Perusahaan Umum Air Minum',
];

const TUJUAN = [
  'Kepala Dinas', 'Sekretariat Daerah', 'PT Nusantara Jaya', 'Dinas Pendidikan Jawa Barat',
  'Universitas Padjadjaran', 'PT Bank Niaga Sejahtera', 'Dinas Kesehatan Provinsi',
  'PT Mitra Logistik Indonesia', 'Badan Kepegawaian Daerah', 'PT Agro Nusantara Sejahtera',
  'Dinas Perhubungan Kota', 'Yayasan Pendidikan Harapan Bangsa', 'PT Konstruksi Cipta Karya',
  'Dinas Sosial Provinsi', 'Perusahaan Umum Air Minum', 'Balai Pengelolaan Air',
  'PT Digital Solusi Indonesia', 'PT Perkebunan Nusantara',
];

const PERIHAL_MASUK = [
  'Permohonan Kerja Sama Pengembangan Digitalisasi Arsip',
  'Undangan Rapat Koordinasi Percepatan Layanan Publik',
  'Pemberitahuan Penyesuaian Tarif Pelayanan Umum',
  'Permohonan Data Statistik Ketersediaan Tenaga Ahli',
  'Undangan Sosialisasi Regulasi Administrasi Perkantoran',
  'Pengajuan Kerja Sama Pemanfaatan Gedung Serbaguna',
  'Pemberitahuan Perubahan Nomor Rekening Instansi',
  'Permohonan Peninjauan Kembali Penetapan Angka Kredit',
  'Undangan Workshop Digitalisasi Dokumen dan Manajemen Surat',
  'Permohonan Fasilitasi Program Magang Mahasiswa',
  'Laporan Akhir Kegiatan Pelatihan Manajemen Perkantoran',
  'Permohonan Izin Penelitian dan Pengumpulan Data',
  'Undangan Rapat Evaluasi Kinerja Triwulan III',
  'Pemberitahuan Hasil Seleksi Calon Mitra Kerja Sama',
  'Permohonan Bantuan Sarana Prasarana Pendukung Layanan',
  'Informasi Jadwal Pelaksanaan Audit Internal',
  'Permohonan Rekomendasi Teknis Kelayakan Bangunan',
  'Undangan Apel Akbar dan Rakor Seluruh Pimpinan',
  'Pengajuan Proposal Kerja Sama Beasiswa Studi Lanjut',
  'Pemberitahuan Cutoff Penyusunan Laporan Keuangan',
  'Permohonan Data Nomenklatur Jabatan Fungsional',
  'Undangan Sidang Pengawasan Arus Dokumen',
  'Pengaduan Masyarakat Terkait Layanan Administrasi',
  'Permohonan Penyediaan Kendaraan Dinas Operasional',
  'Undangan Rapat Persiapan Akreditasi Lembaga',
  'Pemberitahuan Kebijakan Relokasi Kantor Cabang',
  'Permohonan Verifikasi Legalitas Dokumen Perusahaan',
  'Laporan Pelaksanaan Program Pengabdian Masyarakat',
  'Permohonan Penetapan Pengurus Baru Organisasi Mitra',
  'Undangan Coffee Morning Lintas Sektor Pelayanan Publik',
  'Pengajuan Anggaran Tambahan Tahun Anggaran Berjalan',
  'Pemberitahuan Moratorium Pengadaan Barang/Jasa',
  'Permohonan Klarifikasi Perbedaan Data Antar Instansi',
  'Undangan Expo Inovasi Layanan Pemerintahan',
  'Permohonan Konsultasi Penyusunan Standar Operasional',
  'Pemberitahuan Perubahan Jam Operasional Layanan',
  'Permohonan Penjadwalan Ulang Rapat Koordinasi',
  'Undangan Peluncuran Aplikasi Layanan Terintegrasi',
  'Pengajuan Penugasan Personel pada Kegiatan Nasional',
  'Permohonan Data Realisasi Anggaran Kegiatan',
  'Konfirmasi Kehadiran pada Rapat Akhir Tahun',
  'Permohonan Fasilitasi Penggunaan Ruang Aula',
  'Undangan Rapat Pembahasan Ranperda Pelayanan',
  'Pemberitahuan Pembekuan Sementara Akun Sistem',
  'Permohonan Revisi Perjanjian Kerja Sama yang Telah Berjalan',
  'Laporan Komplain Penyelenggaraan Layanan Publik',
  'Undangan Briefing Persiapan Acara Peresmian Gedung',
  'Permohonan Penambahan Kuota Pengguna Sistem',
  'Pengajuan Permohonan Pindah Layanan ke Cabang Lain',
  'Pemberitahuan Pemeliharaan Berkala Prasarana',
  'Permohonan Surat Keterangan Belum Pernah Terpidana',
  'Undangan Rapat Forkopimda Percepatan Vaksinasi',
  'Informasi Terkait Insiden Gangguan Sistem Layanan',
  'Permohonan Evaluasi Kepatuhan Administrasi',
  'Undangan Diskusi Terbatas Penyusunan Kebijakan Baru',
  'Pengajuan Proposal Program Tanggung Jawab Sosial',
  'Pemberitahuan Penyesuaian Perangkat Layanan Digital',
];

const PERIHAL_KELUAR = [
  'Balasan Undangan Rapat Koordinasi Antarlintas Instansi',
  'Permohonan Konfirmasi Kehadiran pada Acara Dinas',
  'Undangan Pelaksanaan Rapat Evaluasi Kinerja Semester',
  'Pemberitahuan Penetapan Hasil Verifikasi Dokumen',
  'Permohonan Data Laporan Realisasi Anggaran Mitra',
  'Balasan Surat Permohonan Kerja Sama Pemanfaatan Fasilitas',
  'Undangan Sosialisasi Standar Pelayanan Publik Terbaru',
  'Pemberitahuan Perubahan Jadwal Kerja Selama Musim Libur',
  'Permohonan Pembaruan Data Kepegawaian Pendukung',
  'Undangan Rapat Koordinasi Persiapan Akreditasi',
  'Permohonan Penyerahan Dokumen Pendukung Kemitraan',
  'Balasan Permohonan Fasilitasi Program Magang',
  'Undangan Workshop Penguatan Kapasitas Sumber Daya',
  'Pemberitahuan Hasil Seleksi Administrasi Calon Mitra',
  'Permohonan Penjadwalan Ulang Kegiatan Bersama',
  'Balasan Surat Pengaduan Masyarakat tentang Layanan',
  'Undangan Pelatihan Pengelolaan Arsip dan Dokumen Digital',
  'Permohonan Klarifikasi dan Tindak Lanjut Temuan Audit',
  'Balasan Permohonan Beasiswa dan Studi Lanjut',
  'Undangan Rapat Paripurna Pembahasan Kebijakan',
  'Pemberitahuan Kebijakan Pengelolaan Kearsipan Baru',
  'Permohonan Kerja Sama Pengembangan Sistem Informasi',
  'Undangan Benchmarking Layanan Antarwilayah',
  'Balasan Permohonan Izin Penelitian dan Pendataan',
  'Permohonan Penetapan Prioritas Anggaran Tahun Depan',
  'Undangan Evaluasi Pelaksanaan Program Prioritas',
  'Permohonan Penyampaian Laporan Kegiatan Berkala',
  'Balasan Pengajuan Proposal Kerja Sama Beasiswa',
  'Undangan Coffee Morning Forkopimda',
  'Permohonan Penambahan Kuota Jaringan Layanan',
  'Pemberitahuan Pemeliharaan Berkala Infrastruktur',
  'Balasan Permohonan Verifikasi Legalitas Dokumen',
  'Undangan Acara Launching Layanan Unggulan',
  'Permohonan Data Statistik Kinerja Regional',
  'Balasan Permohonan Peninjauan Angka Kredit',
  'Undangan Rapat Persiapan Pembangunan Prasarana',
  'Permohonan Rekomendasi Terkait Perizinan Bangunan',
  'Balasan Laporan Komplain Penyelenggaraan Layanan',
  'Undangan Dinner Dinas Antarinstansi',
  'Permohonan Konfirmasi Perubahan Data Kelembagaan',
  'Balasan Permohonan Penjadwalan Ulang Rapat',
  'Undangan Briefing Persiapan Audit Eksternal',
  'Permohonan Evaluasi Capaian Indikator Kinerja',
  'Undangan Rapat Pembahasan Anggaran Tambahan',
  'Permohonan Fasilitasi Penyelenggaraan Event Publik',
  'Balasan Permohonan Revisi Perjanjian Kerja Sama',
  'Pemberitahuan Pemberlakuan Prosedur Baru Pelayanan',
  'Permohonan Pembaruan Data Kemitraan Institusi',
  'Undangan Peluncuran Sistem Aplikasi Terbaru',
  'Balasan Permohonan Penambahan Kuota Pengguna',
  'Permohonan Koordinasi Penjadwalan Layanan Terpadu',
  'Undangan Musyawarah Perencanaan Pembangunan',
  'Balasan Pengajuan Program Tanggung Jawab Sosial',
  'Permohonan Data Pelatihan dan Pengembangan SDM',
];

/* Status helpers */
const MASUK_STATUS = ['diterima', 'disposisi', 'diproses', 'selesai', 'diarsipkan'];
const KELUAR_STATUS = ['dibuat', 'disetujui', 'dikirim', 'selesai', 'diarsipkan'];

const DISPOSISI = [
  null, null,
  'Disposisi kepada Kepala Bagian Umum untuk diproses lebih lanjut',
  'Mohon ditindaklanjuti oleh staf terkait',
  'Diteruskan kepada Kabid Pelayanan untuk review',
  'Segera diproses dan diarsipkan',
  null,
  'Disposisi kepada Sekretaris untuk koordinasi',
  null,
  'Diteruskan kepada tim hukum untuk telaah',
];

const LOKASI_LEMARI = ['Lemari A', 'Lemari B', 'Lemari C', 'Lemari D', 'Lemari E'];
const RAK = ['Rak 01', 'Rak 02', 'Rak 03', 'Rak 04', 'Rak 05'];
const MAP = ['Map Surat Masuk 2025', 'Map Surat Masuk 2026', 'Map Surat Keluar 2025', 'Map Surat Keluar 2026', 'Map Dokumen Umum'];
const BOX = ['BOX-01', 'BOX-02', 'BOX-03', 'BOX-04', 'BOX-05'];

/* ─────────────────────────────────────────────────────────────
 * Util
 * ───────────────────────────────────────────────────────────── */
function rand(arr) {
  return arr[Math.floor(Math.random() * arr.length)];
}
function pad(n, w) {
  return String(n).padStart(w, '0');
}

/* ─────────────────────────────────────────────────────────────
 * STEP A - Seed Users (via auth admin, trigger menciptakan profile)
 * ───────────────────────────────────────────────────────────── */
async function seedUsers() {
  log('\n\u2500\u2500 [?] User');
  if (READONLY) {
    warn('READONLY: melewati pembuatan user');
    return { admin: null, pimpinan: null };
  }

  const { data: existing } = await supabase.auth.admin.listUsers();
  const existingEmails = new Set((existing?.users || []).map((u) => u.email?.toLowerCase()));
  const byRole = { admin: null, pimpinan: null };

  for (const u of USERS) {
    if (existingEmails.has(u.email.toLowerCase())) {
      warn(`user ${u.email} sudah ada - dilewati`);
      const found = (existing.users || []).find((x) => x.email?.toLowerCase() === u.email.toLowerCase());
      if (!byRole[u.role]) byRole[u.role] = found?.id || null;
      continue;
    }
    if (READONLY) continue;
    const { data, error } = await supabase.auth.admin.createUser({
      email: u.email,
      password: u.password,
      email_confirm: true,
      user_metadata: { name: u.name, role: u.role },
    });
    if (error) {
      warn(`gagal membuat user ${u.email}: ${error.message}`);
    } else {
      ok(`user dibuat: ${u.email} (${u.role})`);
      if (!byRole[u.role]) byRole[u.role] = data.user.id;
    }
    await sleep(150);
  }

  /* Fallback: pakai user existing bila belum ada yang baru */
  if (!byRole.admin || !byRole.pimpinan) {
    const { data: prof } = await supabase.from('profiles').select('id,role');
    for (const p of prof || []) {
      if (p.role === 'admin' && !byRole.admin) byRole.admin = p.id;
      if (p.role === 'pimpinan' && !byRole.pimpinan) byRole.pimpinan = p.id;
    }
  }
  if (!byRole.admin) byRole.admin = '6c084394-8f6f-4328-82e4-69a8bd9efb48';
  return byRole;
}

/* ─────────────────────────────────────────────────────────────
 * STEP B - Seed Categories
 * ───────────────────────────────────────────────────────────── */
async function seedCategories() {
  log('\n\u2500\u2500 [?] Kategori Arsip');
  const { data: existing } = await supabase.from('archive_categories').select('name');
  const existingNames = new Set((existing || []).map((c) => c.name));
  const inserted = [];

  for (const c of CATEGORIES) {
    if (existingNames.has(c.name)) {
      warn(`kategori "${c.name}" sudah ada - dilewati`);
      continue;
    }
    if (READONLY) continue;
    const { error } = await supabase.from('archive_categories').insert(c);
    if (error) {
      warn(`gagal membuat kategori "${c.name}": ${error.message}`);
    } else {
      ok(`kategori dibuat: ${c.name}`);
      inserted.push(c.name);
    }
  }
  return inserted.length;
}

/* ─────────────────────────────────────────────────────────────
 * STEP C - Seed Surat Masuk
 * ───────────────────────────────────────────────────────────── */
async function seedSuratMasuk(userIds, existingFiles) {
  log('\n\u2500\u2500 [?] Surat Masuk');
  const { count, error } = await supabase
    .from('surat_masuk')
    .select('*', { count: 'exact', head: true });
  if (!FORCE && !error && count > 0) {
    warn(`surat_masuk sudah berisi ${count} data (pakai FORCE=true untuk menambah)`);
    return 0;
  }

  const rows = [];
  const n = PERIHAL_MASUK.length; // 57
  for (let i = 0; i < n; i++) {
    const tahun = 2025 + (i % 2 === 0 ? 0 : 1); // mix 2025 & 2026
    const bulan = ((i % 8) + 1); // Jan-Aug
    const tanggalSurat = new Date(Date.UTC(tahun, bulan - 1, (i % 27) + 1));
    const tanggalTerima = new Date(tanggalSurat.getTime() + (i % 3) * 86400000);
    const asal = ASAL[i % ASAL.length];
    const status = MASUK_STATUS[i % MASUK_STATUS.length];

    const hasFile = i % 4 !== 0; // ~75% punya arsip digital
    let file = null;
    if (hasFile) {
      const variant = i % 3;
      file = createFileRef({
        kind: 'masuk',
        variant,
        year: tahun,
        index: i + 1,
      }, existingFiles);
    }

    rows.push({
      nomor: `${pad((i % 120) + 1, 3)}/${asinPrefix(asal)}/${tahun}${String.fromCharCode(65 + (i % 26))}`,
      tanggal: tanggalSurat.toISOString().slice(0, 10),
      asal_surat: asal,
      perihal: PERIHAL_MASUK[i],
      status,
      disposisi: DISPOSISI[i % DISPOSISI.length] || null,
      keterangan: i % 5 === 0 ? 'Surat telah diverifikasi dan diproses sesuai prosedur yang berlaku.' : null,
      ...file,
      lokasi_lemari: hasFile ? LOKASI_LEMARI[i % LOKASI_LEMARI.length] : null,
      lokasi_rak: hasFile ? RAK[i % RAK.length] : null,
      lokasi_map: hasFile ? MAP[i % MAP.length] : null,
      lokasi_box: hasFile ? BOX[i % BOX.length] : null,
      keterangan_fisik: hasFile && i % 6 === 0 ? 'Berada pada rak sesuai penomoran berkas surat masuk.' : null,
      created_by: userIds.admin,
      is_deleted: false,
      created_at: tanggalTerima.toISOString(),
      updated_at: tanggalSurat.toISOString(),
    });
  }

  if (READONLY) {
    warn(`READONLY: ${rows.length} data surat masuk hanya disimulasikan`);
    return rows.length;
  }

  /* insert per batch */
  let success = 0;
  for (let i = 0; i < rows.length; i += 20) {
    const batch = rows.slice(i, i + 20);
    const { data, error } = await supabase.from('surat_masuk').insert(batch).select('id,nomor');
    if (error) {
      warn(`gagal batch ${i / 20 + 1}: ${error.message}`);
    } else {
      success += data?.length || 0;
      for (const r of data || []) r._seedNo = r.nomor;
    }
    await sleep(250);
  }
  ok(`surat_masuk dibuat: ${success} data`);
  return success;
}

/* ─────────────────────────────────────────────────────────────
 * STEP D - Seed Surat Keluar
 * ───────────────────────────────────────────────────────────── */
async function seedSuratKeluar(userIds, existingFiles) {
  log('\n\u2500\u2500 [?] Surat Keluar');
  const { count, error } = await supabase
    .from('surat_keluar')
    .select('*', { count: 'exact', head: true });
  if (!FORCE && !error && count > 0) {
    warn(`surat_keluar sudah berisi ${count} data (pakai FORCE=true untuk menambah)`);
    return 0;
  }

  /* Ambil id surat masuk untuk relasi */
  const { data: sm } = await supabase
    .from('surat_masuk')
    .select('id')
    .eq('is_deleted', false);
  const smIds = sm || [];

  const rows = [];
  const n = PERIHAL_KELUAR.length; // 54
  for (let i = 0; i < n; i++) {
    const tahun = 2025 + (i % 2 === 0 ? 0 : 1);
    const bulan = ((i % 8) + 1);
    const tanggalSurat = new Date(Date.UTC(tahun, bulan - 1, (i % 25) + 1));
    const tujuan = TUJUAN[i % TUJUAN.length];
    const status = KELUAR_STATUS[i % KELUAR_STATUS.length];

    /* ~60% surat keluar terhubung ke surat masuk tertentu */
    let suratMasukId = null;
    if (i % 5 !== 3 && smIds.length > 0) {
      suratMasukId = smIds[i % smIds.length].id;
    }

    const hasFile = i % 3 !== 0; // ~66% punya arsip digital
    let file = null;
    if (hasFile) {
      const variant = i % 3;
      file = createFileRef({
        kind: 'keluar',
        variant,
        year: tahun,
        index: i + 1,
      }, existingFiles);
    }

    rows.push({
      nomor: `${pad((i % 150) + 1, 3)}/OUT/${tahun}${String.fromCharCode(75 + (i % 20))}`,
      tanggal: tanggalSurat.toISOString().slice(0, 10),
      tujuan,
      perihal: PERIHAL_KELUAR[i],
      status,
      surat_masuk_id: suratMasukId,
      keterangan: i % 5 === 0 ? 'Dokumen telah disetujui dan ditandatangani oleh pejabat berwenang.' : null,
      ...file,
      lokasi_lemari: hasFile ? LOKASI_LEMARI[i % LOKASI_LEMARI.length] : null,
      lokasi_rak: hasFile ? RAK[(i + 1) % RAK.length] : null,
      lokasi_map: hasFile ? MAP[(i + 2) % MAP.length] : null,
      lokasi_box: hasFile ? BOX[(i + 2) % BOX.length] : null,
      keterangan_fisik: hasFile && i % 7 === 0 ? 'Tersimpan pada box surat keluar berkala.' : null,
      created_by: userIds.admin,
      is_deleted: false,
      created_at: tanggalSurat.toISOString(),
      updated_at: new Date(tanggalSurat.getTime() + 86400000).toISOString(),
    });
  }

  if (READONLY) {
    warn(`READONLY: ${rows.length} data surat keluar hanya disimulasikan`);
    return rows.length;
  }

  let success = 0;
  for (let i = 0; i < rows.length; i += 20) {
    const batch = rows.slice(i, i + 20);
    const { data, error } = await supabase.from('surat_keluar').insert(batch).select('id');
    if (error) {
      warn(`gagal batch ${i / 20 + 1}: ${error.message}`);
    } else {
      success += data?.length || 0;
    }
    await sleep(250);
  }
  ok(`surat_keluar dibuat: ${success} data`);
  return success;
}

/* ─────────────────────────────────────────────────────────────
 * STEP E - Seed Logs
 * ───────────────────────────────────────────────────────────── */
async function seedLogs(userIds) {
  log('\n\u2500\u2500 [?] Logs');
  const { count, error } = await supabase
    .from('surat_logs')
    .select('*', { count: 'exact', head: true });
  if (!FORCE && !error && count > 0) {
    warn(`surat_logs sudah berisi ${count} data`);
    return 0;
  }
  if (READONLY) return 0;

  const { data: sm } = await supabase.from('surat_masuk').select('id').limit(10);
  const { data: sk } = await supabase.from('surat_keluar').select('id').limit(10);
  const logs = [];
  for (const r of sm || []) {
    logs.push({
      user_id: userIds.admin,
      surat_id: r.id,
      surat_type: 'masuk',
      action: 'create',
      details: { source: 'seed' },
    });
  }
  for (const r of sk || []) {
    logs.push({
      user_id: userIds.admin,
      surat_id: r.id,
      surat_type: 'keluar',
      action: 'create',
      details: { source: 'seed' },
    });
  }
  if (logs.length === 0) {
    warn('tidak ada log untuk dibuat');
    return 0;
  }
  const { data, error: e } = await supabase.from('surat_logs').insert(logs);
  if (e) warn(`gagal membuat log: ${e.message}`);
  else ok(`log dibuat: ${data?.length || logs.length} data`);
  return logs.length;
}

/* ─────────────────────────────────────────────────────────────
 * Upload file dummy ke storage (sekali saja), kembalikan peta
 * ───────────────────────────────────────────────────────────── */
async function seedFiles() {
  log('\n\u2500\u2500 [?] Arsip Digital (Storage)');
  const pool = {};
  if (READONLY) return pool;

  const upload = async (folder, filename, buf, contentType) => {
    const path = `${folder}/${filename}`;
    const { error } = await supabase.storage.from('images').upload(path, buf, {
      contentType,
      upsert: true,
    });
    if (error) warn(`gagal upload ${path}: ${error.message}`);
    return { ok: !error, path };
  };

  /* PDF dan PNG placeholder per (tipe, varian) */
  for (const kind of ['masuk', 'keluar']) {
    for (let v = 0; v < 3; v++) {
      const isPdf = v !== 2; // varian 0,1 PDF ; varian 2 PNG
      const name = `surat-${kind}-sample-${v + 1}.${isPdf ? 'pdf' : 'png'}`;
      const buf = isPdf
        ? makePdf([`Contoh dokumen ${kind}`, `Halaman ${v + 1}`])
        : PNG_BUFFER;
      const res = await upload(`surat-${kind}`, name, buf, isPdf ? 'application/pdf' : 'image/png');
      if (res.ok) {
        pool[`${kind}-${v}`] = {
          file_url: `${process.env.NEXT_PUBLIC_SUPABASE_URL}/storage/v1/object/public/images/${res.path}`,
          file_path: res.path,
          file_name: name,
          file_size: buf.length,
        };
      }
      await sleep(120);
    }
  }
  return pool;
}

/* helper: bangun ref file dari pool */
function createFileRef({ kind, variant, index }, pool) {
  const f = pool[`${kind}-${variant}`];
  if (!f) return {};
  return { ...f };
}

/* helper: ambil awalan kode dari asal (untuk nomor) */
function asinPrefix(asal) {
  const words = asal.split(' ');
  if (words.length === 1) return words[0].slice(0, 3).toUpperCase();
  const initials = words.slice(0, 2).map((w) => w[0]).join('');
  return (initials || 'XX').toUpperCase();
}

function sleep(ms) {
  return new Promise((r) => setTimeout(r, ms));
}

/* ─────────────────────────────────────────────────────────────
 * MAIN
 * ───────────────────────────────────────────────────────────── */
async function main() {
  log('Seed data Management Surat / Arsip Digital');
  log('===========================================');
  log('Mode:', READONLY ? 'READONLY (hanya simulasi)' : 'WRITE');
  if (FORCE) log('Flag FORCE aktif: akan menambah data meski tabel sudah terisi');

  const filePool = await seedFiles();
  const userIds = await seedUsers();
  const nCat = await seedCategories();
  const nMasuk = await seedSuratMasuk(userIds, filePool);
  const nKeluar = await seedSuratKeluar(userIds, filePool);
  await seedLogs(userIds);

  log('\n===========================================');
  log('RINGKASAN');
  log(`  Kategori: ${nCat}`);
  log(`  Surat Masuk: ${nMasuk}`);
  log(`  Surat Keluar: ${nKeluar}`);
  log('Selesai.');
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
