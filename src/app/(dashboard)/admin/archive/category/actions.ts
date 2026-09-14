'use server';

import { createClient } from '@/lib/supabase/server';
import { ArchiveCategoryFormState } from '@/types/archive';
import {
  createCategorySchema,
  updateCategorySchema,
} from '@/validations/archive-validation';

export async function createCategory(
  prevState: ArchiveCategoryFormState,
  formData: FormData,
) {
  const validatedFields = createCategorySchema.safeParse({
    name: formData.get('name'),
    description: formData.get('description'),
    color: formData.get('color'),
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

  const { error } = await supabase.from('archive_categories').insert({
    name: validatedFields.data.name,
    description: validatedFields.data.description || null,
    color: validatedFields.data.color || null,
  });

  if (error) {
    return {
      status: 'error',
      errors: {
        ...prevState.errors,
        _form: [error.message],
      },
    };
  }

  return { status: 'success' };
}

export async function updateCategory(
  prevState: ArchiveCategoryFormState,
  formData: FormData,
) {
  const validatedFields = updateCategorySchema.safeParse({
    name: formData.get('name'),
    description: formData.get('description'),
    color: formData.get('color'),
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

  const { error } = await supabase
    .from('archive_categories')
    .update({
      name: validatedFields.data.name,
      description: validatedFields.data.description || null,
      color: validatedFields.data.color || null,
    })
    .eq('id', formData.get('id'));

  if (error) {
    return {
      status: 'error',
      errors: {
        ...prevState.errors,
        _form: [error.message],
      },
    };
  }

  return { status: 'success' };
}

export async function deleteCategory(
  prevState: ArchiveCategoryFormState,
  formData: FormData,
) {
  const supabase = await createClient();

  const { error } = await supabase
    .from('archive_categories')
    .delete()
    .eq('id', formData.get('id'));

  if (error) {
    return {
      status: 'error',
      errors: {
        ...prevState.errors,
        _form: [error.message],
      },
    };
  }

  return { status: 'success' };
}
