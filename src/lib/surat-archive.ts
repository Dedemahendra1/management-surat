'use server';

import { createClient } from '@/lib/supabase/server';

type SupabaseClient = Awaited<ReturnType<typeof createClient>>;

export type SuratArchiveSource = {
  suratType: 'masuk' | 'keluar';
  suratId: string;
  userId: string;
  nomor: string;
  tanggal?: string | null;
  perihal: string;
  meta?: string | null;
  keterangan?: string | null;
  fileUrl?: string | null;
  filePath?: string | null;
  fileName?: string | null;
  fileSize?: number | null;
};

const CATEGORY_META: Record<
  SuratArchiveSource['suratType'],
  { name: string; color: string; description: string }
> = {
  masuk: {
    name: 'Surat Masuk',
    color: '#0ea5e9',
    description: 'Arsip otomatis dari surat masuk',
  },
  keluar: {
    name: 'Surat Keluar',
    color: '#f97316',
    description: 'Arsip otomatis dari surat keluar',
  },
};

async function getOrCreateCategory(
  supabase: SupabaseClient,
  suratType: SuratArchiveSource['suratType'],
): Promise<string | null> {
  const meta = CATEGORY_META[suratType];

  const { data: existing } = await supabase
    .from('archive_categories')
    .select('id')
    .eq('name', meta.name)
    .limit(1)
    .maybeSingle();

  if (existing) return existing.id;

  const { data: created, error } = await supabase
    .from('archive_categories')
    .insert({
      name: meta.name,
      color: meta.color,
      description: meta.description,
    })
    .select('id')
    .single();

  if (error) return null;
  return created?.id || null;
}

export async function archiveSuratRecord(
  supabase: SupabaseClient,
  source: SuratArchiveSource,
) {
  const {
    suratType,
    suratId,
    userId,
    nomor,
    tanggal,
    perihal,
    meta,
    keterangan,
    fileUrl,
    filePath,
    fileName,
    fileSize,
  } = source;

  // Cegah duplikat: satu entri arsip otomatis per surat.
  const { data: existingLog } = await supabase
    .from('archive_logs')
    .select('archive_id')
    .eq('action', 'auto_archive')
    .eq('details->>surat_id', suratId)
    .eq('details->>surat_type', suratType)
    .limit(1)
    .maybeSingle();

  const title = `${nomor} — ${perihal}`;
  const description =
    [
      suratType === 'masuk' && meta ? `Dari: ${meta}` : '',
      suratType === 'keluar' && meta ? `Tujuan: ${meta}` : '',
      keterangan || '',
    ]
      .filter(Boolean)
      .join('\n') || null;

  // Jika sudah pernah diarsipkan otomatis, sinkronkan datanya saja.
  if (existingLog?.archive_id) {
    await supabase
      .from('archives')
      .update({
        title,
        number: nomor,
        date: tanggal || null,
        description,
        file_url: fileUrl ?? null,
        file_path: filePath ?? null,
        file_name: fileName ?? null,
        file_size: fileSize ?? null,
      })
      .eq('id', existingLog.archive_id);
    return;
  }

  const categoryId = await getOrCreateCategory(supabase, suratType);

  const { data: inserted, error } = await supabase
    .from('archives')
    .insert({
      category_id: categoryId,
      created_by: userId,
      title,
      number: nomor,
      date: tanggal || null,
      description,
      file_url: fileUrl ?? null,
      file_path: filePath ?? null,
      file_name: fileName ?? null,
      file_size: fileSize ?? null,
    })
    .select('id')
    .single();

  if (error || !inserted) return;

  await supabase.from('archive_logs').insert({
    archive_id: inserted.id,
    user_id: userId,
    action: 'create',
    details: { surat_id: suratId, surat_type: suratType },
  });

  await supabase.from('archive_logs').insert({
    archive_id: inserted.id,
    user_id: userId,
    action: 'auto_archive',
    details: { surat_id: suratId, surat_type: suratType },
  });
}