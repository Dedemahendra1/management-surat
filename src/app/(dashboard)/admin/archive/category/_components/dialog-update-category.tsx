'use client';

import {
  INITIAL_STATE_UPDATE_CATEGORY,
} from '@/constant/archive-constant';
import {
  UpdateCategoryForm,
  updateCategorySchema,
} from '@/validations/archive-validation';
import { zodResolver } from '@hookform/resolvers/zod';
import { startTransition, useActionState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { toast } from 'sonner';
import { updateCategory } from '../actions';
import FormCategory from './form-category';
import { ArchiveCategory } from '@/types/archive';
import { Dialog } from '@radix-ui/react-dialog';

export default function DialogUpdateCategory({
  refetch,
  currentData,
  open,
  handleChangeAction,
}: {
  refetch: () => void;
  currentData?: ArchiveCategory;
  open: boolean;
  handleChangeAction: (open: boolean) => void;
}) {
  const form = useForm<UpdateCategoryForm>({
    resolver: zodResolver(updateCategorySchema),
  });

  const [updateState, updateAction, isPending] = useActionState(
    updateCategory,
    INITIAL_STATE_UPDATE_CATEGORY,
  );

  const onSubmit = form.handleSubmit((data) => {
    const formData = new FormData();
    Object.entries(data).forEach(([key, value]) => {
      formData.append(key, value ?? '');
    });
    formData.append('id', currentData?.id ?? '');

    startTransition(() => {
      updateAction(formData);
    });
  });

  useEffect(() => {
    if (updateState?.status === 'error') {
      toast.error('Gagal memperbarui kategori', {
        description: updateState.errors?._form?.[0],
      });
    }

    if (updateState?.status === 'success') {
      toast.success('Kategori berhasil diperbarui');
      form.reset();
      handleChangeAction(false);
      refetch();
    }
  }, [updateState]);

  useEffect(() => {
    if (currentData) {
      form.setValue('name', currentData.name);
      form.setValue('description', currentData.description ?? '');
      form.setValue('color', currentData.color ?? '#3b82f6');
    }
  }, [currentData]);

  return (
    <Dialog open={open} onOpenChange={handleChangeAction}>
      <FormCategory
        form={form}
        onSubmit={onSubmit}
        isLoading={isPending}
        type="Update"
      />
    </Dialog>
  );
}
