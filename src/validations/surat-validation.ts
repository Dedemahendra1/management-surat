import z from 'zod';

// ─── Surat Masuk ─────────────────────────────────────────────────────────────

export const suratMasukStatusSchema = z.enum([
  'diterima',
  'disposisi',
  'diproses',
  'selesai',
  'diarsipkan',
]);

export const createSuratMasukSchema = z.object({
  nomor: z.string().min(1, 'Nomor surat wajib diisi'),
  tanggal: z.string().optional(),
  asal_surat: z.string().optional(),
  perihal: z.string().min(1, 'Perihal wajib diisi'),
  status: suratMasukStatusSchema,
  disposisi: z.string().optional(),
  keterangan: z.string().optional(),
  file_url: z.union([z.string(), z.instanceof(File)]).optional(),
  lokasi_lemari: z.string().optional(),
  lokasi_rak: z.string().optional(),
  lokasi_map: z.string().optional(),
  lokasi_box: z.string().optional(),
  keterangan_fisik: z.string().optional(),
});

export const updateSuratMasukSchema = z.object({
  nomor: z.string().min(1, 'Nomor surat wajib diisi'),
  tanggal: z.string().optional(),
  asal_surat: z.string().optional(),
  perihal: z.string().min(1, 'Perihal wajib diisi'),
  status: suratMasukStatusSchema,
  disposisi: z.string().optional(),
  keterangan: z.string().optional(),
  file_url: z.union([z.string(), z.instanceof(File)]).optional(),
  lokasi_lemari: z.string().optional(),
  lokasi_rak: z.string().optional(),
  lokasi_map: z.string().optional(),
  lokasi_box: z.string().optional(),
  keterangan_fisik: z.string().optional(),
});

// ─── Surat Keluar ────────────────────────────────────────────────────────────

export const suratKeluarStatusSchema = z.enum([
  'dibuat',
  'disetujui',
  'dikirim',
  'selesai',
  'diarsipkan',
]);

export const createSuratKeluarSchema = z.object({
  nomor: z.string().min(1, 'Nomor surat wajib diisi'),
  tanggal: z.string().optional(),
  tujuan: z.string().optional(),
  perihal: z.string().min(1, 'Perihal wajib diisi'),
  status: suratKeluarStatusSchema,
  surat_masuk_id: z.string().optional().nullable(),
  keterangan: z.string().optional(),
  file_url: z.union([z.string(), z.instanceof(File)]).optional(),
  lokasi_lemari: z.string().optional(),
  lokasi_rak: z.string().optional(),
  lokasi_map: z.string().optional(),
  lokasi_box: z.string().optional(),
  keterangan_fisik: z.string().optional(),
});

export const updateSuratKeluarSchema = z.object({
  nomor: z.string().min(1, 'Nomor surat wajib diisi'),
  tanggal: z.string().optional(),
  tujuan: z.string().optional(),
  perihal: z.string().min(1, 'Perihal wajib diisi'),
  status: suratKeluarStatusSchema,
  surat_masuk_id: z.string().optional().nullable(),
  keterangan: z.string().optional(),
  file_url: z.union([z.string(), z.instanceof(File)]).optional(),
  lokasi_lemari: z.string().optional(),
  lokasi_rak: z.string().optional(),
  lokasi_map: z.string().optional(),
  lokasi_box: z.string().optional(),
  keterangan_fisik: z.string().optional(),
});

// ─── Inferred Types ──────────────────────────────────────────────────────────

export type CreateSuratMasukForm = z.infer<typeof createSuratMasukSchema>;
export type UpdateSuratMasukForm = z.infer<typeof updateSuratMasukSchema>;
export type CreateSuratKeluarForm = z.infer<typeof createSuratKeluarSchema>;
export type UpdateSuratKeluarForm = z.infer<typeof updateSuratKeluarSchema>;
