'use client';

import {
  INITIAL_CREATE_CATEGORY_FORM,
  INITIAL_STATE_CREATE_CATEGORY,
} from '@/constant/archive-constant';
import {
  CreateCategoryForm,
  createCategorySchema,
} from '@/validations/archive-validation';
import { zodResolver } from '@hookform/resolvers/zod';
import { startTransition, useActionState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { toast } from 'sonner';
import { createCategory } from '../actions';
import FormCategory from './form-category';

export default function DialogCreateCategory({
  refetch,
}: {
  refetch: () => void;
}) {
  const form = useForm<CreateCategoryForm>({
    resolver: zodResolver(createCategorySchema),
    defaultValues: INITIAL_CREATE_CATEGORY_FORM,
  });

  const [createState, createAction, isPending] = useActionState(
    createCategory,
    INITIAL_STATE_CREATE_CATEGORY,
  );

  const onSubmit = form.handleSubmit((data) => {
    const formData = new FormData();
    Object.entries(data).forEach(([key, value]) => {
      formData.append(key, value ?? '');
    });

    startTransition(() => {
      createAction(formData);
    });
  });

  useEffect(() => {
    if (createState?.status === 'error') {
      toast.error('Gagal membuat kategori', {
        description: createState.errors?._form?.[0],
      });
    }

    if (createState?.status === 'success') {
      toast.success('Kategori berhasil dibuat');
      form.reset();
      document.querySelector<HTMLButtonElement>('[data-state="open"]')?.click();
      refetch();
    }
  }, [createState]);

  return (
    <FormCategory
      form={form}
      onSubmit={onSubmit}
      isLoading={isPending}
      type="Create"
    />
  );
}
