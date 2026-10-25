'use server';

import { deleteFile, uploadFile } from '@/actions/storage-action';
import { createClient } from '@/lib/supabase/server';
import { ArchiveFormState } from '@/types/archive';
import {
  createArchiveSchema,
  updateArchiveSchema,
} from '@/validations/archive-validation';

async function addLog(
  supabase: Awaited<ReturnType<typeof createClient>>,
  archiveId: string,
  userId: string,
  action: string,
  details?: Record<string, unknown>,
) {
  await supabase.from('archive_logs').insert({
    archive_id: archiveId,
    user_id: userId,
    action,
    details: details || null,
  });
}

export async function createArchive(
  prevState: ArchiveFormState,
  formData: FormData,
) {
  const supabase = await createClient();
  const user = await supabase.auth.getUser();
  const userId = user.data.user?.id || '';

  const { data: profile } = await supabase
    .from('profiles')
    .select('role')
    .eq('id', userId)
    .single();

  if (profile?.role?.toLowerCase() !== 'pimpinan') {
    return {
      status: 'error',
      errors: {
        ...prevState.errors,
        _form: ['Hanya pimpinan yang dapat menambah arsip'],
      },
    };
  }

  const validatedFields = createArchiveSchema.safeParse({
    title: formData.get('title'),
    category_id: formData.get('category_id'),
    number: formData.get('number'),
    date: formData.get('date'),
    description: formData.get('description'),
    file_url: formData.get('file_url'),
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

  let fileUrl = '';
  let filePath = '';
  let fileName = '';
  let fileSize = 0;

  if (validatedFields.data.file_url instanceof File) {
    const file = validatedFields.data.file_url;
    const { errors, data } = await uploadFile('images', 'archives', file);
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
    .from('archives')
    .insert({
      title: validatedFields.data.title,
      category_id: validatedFields.data.category_id || null,
      number: validatedFields.data.number || null,
      date: validatedFields.data.date || null,
      description: validatedFields.data.description || null,
      file_url: fileUrl || null,
      file_path: filePath || null,
      file_name: fileName || null,
      file_size: fileSize || null,
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
      title: validatedFields.data.title,
    });
  }

  return { status: 'success' };
}

export async function updateArchive(
  prevState: ArchiveFormState,
  formData: FormData,
) {
  const supabase = await createClient();
  const user = await supabase.auth.getUser();
  const userId = user.data.user?.id || '';

  const { data: profile } = await supabase
    .from('profiles')
    .select('role')
    .eq('id', userId)
    .single();

  if (profile?.role?.toLowerCase() !== 'pimpinan') {
    return {
      status: 'error',
      errors: {
        ...prevState.errors,
        _form: ['Hanya pimpinan yang dapat mengubah arsip'],
      },
    };
  }

  const validatedFields = updateArchiveSchema.safeParse({
    title: formData.get('title'),
    category_id: formData.get('category_id'),
    number: formData.get('number'),
    date: formData.get('date'),
    description: formData.get('description'),
    file_url: formData.get('file_url'),
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

  const archiveId = formData.get('id') as string;

  let fileUrl = (formData.get('old_file_url') as string) || '';
  let filePath = (formData.get('old_file_path') as string) || '';
  let fileName = (formData.get('old_file_name') as string) || '';
  let fileSize = Number(formData.get('old_file_size') as string) || 0;

  if (validatedFields.data.file_url instanceof File) {
    const file = validatedFields.data.file_url;
    const oldPath = formData.get('old_file_path') as string;
    const { errors, data } = await uploadFile(
      'images',
      'archives',
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
    .from('archives')
    .update({
      title: validatedFields.data.title,
      category_id: validatedFields.data.category_id || null,
      number: validatedFields.data.number || null,
      date: validatedFields.data.date || null,
      description: validatedFields.data.description || null,
      file_url: fileUrl || null,
      file_path: filePath || null,
      file_name: fileName || null,
      file_size: fileSize || null,
    })
    .eq('id', archiveId);

  if (error) {
    return {
      status: 'error',
      errors: {
        ...prevState.errors,
        _form: [error.message],
      },
    };
  }

  await addLog(supabase, archiveId, userId, 'update', {
    title: validatedFields.data.title,
  });

  return { status: 'success' };
}

export async function deleteArchive(
  prevState: ArchiveFormState,
  formData: FormData,
) {
  const supabase = await createClient();
  const user = await supabase.auth.getUser();
  const userId = user.data.user?.id || '';

  const { data: profile } = await supabase
    .from('profiles')
    .select('role')
    .eq('id', userId)
    .single();

  if (profile?.role?.toLowerCase() !== 'pimpinan') {
    return {
      status: 'error',
      errors: {
        ...prevState.errors,
        _form: ['Hanya pimpinan yang dapat menghapus arsip'],
      },
    };
  }

  const archiveId = formData.get('id') as string;
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
    .from('archives')
    .update({ is_deleted: true, deleted_at: new Date().toISOString() })
    .eq('id', archiveId);

  if (error) {
    return {
      status: 'error',
      errors: {
        ...prevState.errors,
        _form: [error.message],
      },
    };
  }

  await addLog(supabase, archiveId, userId, 'delete');

  return { status: 'success' };
}

export async function restoreArchive(
  prevState: ArchiveFormState,
  formData: FormData,
) {
  const supabase = await createClient();
  const user = await supabase.auth.getUser();
  const userId = user.data.user?.id || '';

  const { data: profile } = await supabase
    .from('profiles')
    .select('role')
    .eq('id', userId)
    .single();

  if (profile?.role?.toLowerCase() !== 'pimpinan') {
    return {
      status: 'error',
      errors: {
        ...prevState.errors,
        _form: ['Hanya pimpinan yang dapat memulihkan arsip'],
      },
    };
  }

  const archiveId = formData.get('id') as string;

  const { error } = await supabase
    .from('archives')
    .update({ is_deleted: false, deleted_at: null })
    .eq('id', archiveId);

  if (error) {
    return {
      status: 'error',
      errors: {
        ...prevState.errors,
        _form: [error.message],
      },
    };
  }

  await addLog(supabase, archiveId, userId, 'restore');

  return { status: 'success' };
}
