'use server';

import { deleteFile, uploadFile } from '@/actions/storage-action';
import { createClient } from '@/lib/supabase/server';
import { archiveSuratRecord } from '@/lib/surat-archive';
import { SuratMasukFormState } from '@/types/surat';
import {
  createSuratMasukSchema,
  updateSuratMasukSchema,
} from '@/validations/surat-validation';

async function addLog(
  supabase: Awaited<ReturnType<typeof createClient>>,
  suratId: string,
  userId: string,
  action: string,
  details?: Record<string, unknown>,
) {
  await supabase.from('surat_logs').insert({
    surat_id: suratId,
    surat_type: 'masuk',
    user_id: userId,
    action,
    details: details || null,
  });
}

export async function createSuratMasuk(
  prevState: SuratMasukFormState,
  formData: FormData,
) {
  const validatedFields = createSuratMasukSchema.safeParse({
    nomor: formData.get('nomor'),
    tanggal: formData.get('tanggal'),
    asal_surat: formData.get('asal_surat'),
    perihal: formData.get('perihal'),
    status: formData.get('status'),
    disposisi: formData.get('disposisi'),
    keterangan: formData.get('keterangan'),
    file_url: formData.get('file_url'),
    lokasi_lemari: formData.get('lokasi_lemari'),
    lokasi_rak: formData.get('lokasi_rak'),
    lokasi_map: formData.get('lokasi_map'),
    lokasi_box: formData.get('lokasi_box'),
    keterangan_fisik: formData.get('keterangan_fisik'),
  });

  if (!validatedFields.success) {
    return {
      status: 'error',
      errors: {
        ...validatedFields.error.flatten().fieldErrors,
        _form: [],
      },
    };
  }

  const supabase = await createClient();
  const user = await supabase.auth.getUser();
  const userId = user.data.user?.id || '';

  let fileUrl = '';
  let filePath = '';
  let fileName = '';
  let fileSize = 0;

  if (validatedFields.data.file_url instanceof File) {
    const file = validatedFields.data.file_url;
    const { errors, data } = await uploadFile('images', 'surat-masuk', file);
    if (errors) {
      return {
        status: 'error',
        errors: {
          ...prevState.errors,
          _form: [...errors._form],
        },
      };
    }
    fileUrl = data.url;
    filePath = data.path;
    fileName = file.name;
    fileSize = file.size;
  }

  const { data: inserted, error } = await supabase
    .from('surat_masuk')
    .insert({
      nomor: validatedFields.data.nomor,
      tanggal: validatedFields.data.tanggal || null,
      asal_surat: validatedFields.data.asal_surat || null,
      perihal: validatedFields.data.perihal,
      status: validatedFields.data.status,
      disposisi: validatedFields.data.disposisi || null,
      keterangan: validatedFields.data.keterangan || null,
      file_url: fileUrl || null,
      file_path: filePath || null,
      file_name: fileName || null,
      file_size: fileSize || null,
      lokasi_lemari: validatedFields.data.lokasi_lemari || null,
      lokasi_rak: validatedFields.data.lokasi_rak || null,
      lokasi_map: validatedFields.data.lokasi_map || null,
      lokasi_box: validatedFields.data.lokasi_box || null,
      keterangan_fisik: validatedFields.data.keterangan_fisik || null,
      created_by: userId || null,
    })
    .select('id')
    .single();

  if (error) {
    return {
      status: 'error',
      errors: {
        ...prevState.errors,
        _form: [error.message],
      },
    };
  }

  if (inserted) {
    await addLog(supabase, inserted.id, userId, 'create', {
      nomor: validatedFields.data.nomor,
      perihal: validatedFields.data.perihal,
    });

    if (validatedFields.data.status === 'diarsipkan') {
      await archiveSuratRecord(supabase, {
        suratType: 'masuk',
        suratId: inserted.id,
        userId,
        nomor: validatedFields.data.nomor,
        tanggal: validatedFields.data.tanggal,
        perihal: validatedFields.data.perihal,
        meta: validatedFields.data.asal_surat,
        keterangan: validatedFields.data.keterangan,
        fileUrl,
        filePath,
        fileName,
        fileSize,
      });
    }
  }

  return { status: 'success' };
}

export async function updateSuratMasuk(
  prevState: SuratMasukFormState,
  formData: FormData,
) {
  const validatedFields = updateSuratMasukSchema.safeParse({
    nomor: formData.get('nomor'),
    tanggal: formData.get('tanggal'),
    asal_surat: formData.get('asal_surat'),
    perihal: formData.get('perihal'),
    status: formData.get('status'),
    disposisi: formData.get('disposisi'),
    keterangan: formData.get('keterangan'),
    file_url: formData.get('file_url'),
    lokasi_lemari: formData.get('lokasi_lemari'),
    lokasi_rak: formData.get('lokasi_rak'),
    lokasi_map: formData.get('lokasi_map'),
    lokasi_box: formData.get('lokasi_box'),
    keterangan_fisik: formData.get('keterangan_fisik'),
  });

  if (!validatedFields.success) {
    return {
      status: 'error',
      errors: {
        ...validatedFields.error.flatten().fieldErrors,
        _form: [],
      },
    };
  }

  const supabase = await createClient();
  const user = await supabase.auth.getUser();
  const userId = user.data.user?.id || '';
  const suratId = formData.get('id') as string;

  let fileUrl = (formData.get('old_file_url') as string) || '';
  let filePath = (formData.get('old_file_path') as string) || '';
  let fileName = (formData.get('old_file_name') as string) || '';
  let fileSize = Number(formData.get('old_file_size') as string) || 0;

  if (validatedFields.data.file_url instanceof File) {
    const file = validatedFields.data.file_url;
    const oldPath = formData.get('old_file_path') as string;
    const { errors, data } = await uploadFile(
      'images',
      'surat-masuk',
      file,
      oldPath || undefined,
    );
    if (errors) {
      return {
        status: 'error',
        errors: {
          ...prevState.errors,
          _form: [...errors._form],
        },
      };
    }
    fileUrl = data.url;
    filePath = data.path;
    fileName = file.name;
    fileSize = file.size;
  }

  const { error } = await supabase
    .from('surat_masuk')
    .update({
      nomor: validatedFields.data.nomor,
      tanggal: validatedFields.data.tanggal || null,
      asal_surat: validatedFields.data.asal_surat || null,
      perihal: validatedFields.data.perihal,
      status: validatedFields.data.status,
      disposisi: validatedFields.data.disposisi || null,
      keterangan: validatedFields.data.keterangan || null,
      file_url: fileUrl || null,
      file_path: filePath || null,
      file_name: fileName || null,
      file_size: fileSize || null,
      lokasi_lemari: validatedFields.data.lokasi_lemari || null,
      lokasi_rak: validatedFields.data.lokasi_rak || null,
      lokasi_map: validatedFields.data.lokasi_map || null,
      lokasi_box: validatedFields.data.lokasi_box || null,
      keterangan_fisik: validatedFields.data.keterangan_fisik || null,
    })
    .eq('id', suratId);

  if (error) {
    return {
      status: 'error',
      errors: {
        ...prevState.errors,
        _form: [error.message],
      },
    };
  }

  await addLog(supabase, suratId, userId, 'update', {
    nomor: validatedFields.data.nomor,
    perihal: validatedFields.data.perihal,
  });

  if (validatedFields.data.status === 'diarsipkan') {
    await archiveSuratRecord(supabase, {
      suratType: 'masuk',
      suratId,
      userId,
      nomor: validatedFields.data.nomor,
      tanggal: validatedFields.data.tanggal,
      perihal: validatedFields.data.perihal,
      meta: validatedFields.data.asal_surat,
      keterangan: validatedFields.data.keterangan,
      fileUrl,
      filePath,
      fileName,
      fileSize,
    });
  }

  return { status: 'success' };
}

export async function deleteSuratMasuk(
  prevState: SuratMasukFormState,
  formData: FormData,
) {
  const supabase = await createClient();
  const user = await supabase.auth.getUser();
  const userId = user.data.user?.id || '';
  const suratId = formData.get('id') as string;
  const filePath = formData.get('file_path') as string;

  if (filePath) {
    const { status, errors } = await deleteFile('images', filePath);
    if (status === 'error') {
      return {
        status: 'error',
        errors: {
          ...prevState.errors,
          _form: [errors?._form?.[0] ?? 'Gagal menghapus file'],
        },
      };
    }
  }

  const { error } = await supabase
    .from('surat_masuk')
    .update({ is_deleted: true, deleted_at: new Date().toISOString() })
    .eq('id', suratId);

  if (error) {
    return {
      status: 'error',
      errors: {
        ...prevState.errors,
        _form: [error.message],
      },
    };
  }

  await addLog(supabase, suratId, userId, 'delete');

  return { status: 'success' };
}

export async function restoreSuratMasuk(
  prevState: SuratMasukFormState,
  formData: FormData,
) {
  const supabase = await createClient();
  const user = await supabase.auth.getUser();
  const userId = user.data.user?.id || '';
  const suratId = formData.get('id') as string;

  const { error } = await supabase
    .from('surat_masuk')
    .update({ is_deleted: false, deleted_at: null })
    .eq('id', suratId);

  if (error) {
    return {
      status: 'error',
      errors: {
        ...prevState.errors,
        _form: [error.message],
      },
    };
  }

  await addLog(supabase, suratId, userId, 'restore');

  return { status: 'success' };
}
