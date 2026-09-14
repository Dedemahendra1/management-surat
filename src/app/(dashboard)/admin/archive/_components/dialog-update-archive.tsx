'use client';

import { INITIAL_STATE_UPDATE_ARCHIVE } from '@/constant/archive-constant';
import {
  UpdateArchiveForm,
  updateArchiveSchema,
} from '@/validations/archive-validation';
import { zodResolver } from '@hookform/resolvers/zod';
import { startTransition, useActionState, useEffect, useRef, useState } from 'react';
import { useForm } from 'react-hook-form';
import { toast } from 'sonner';
import { updateArchive } from '../actions';
import FormArchive from './form-archive';
import { Preview } from '@/types/general';
import { Archive, ArchiveCategory } from '@/types/archive';
import { Dialog } from '@radix-ui/react-dialog';

export default function DialogUpdateArchive({
  refetch,
  currentData,
  open,
  handleChangeAction,
  categories,
}: {
  refetch: () => void;
  currentData?: Archive;
  open: boolean;
  handleChangeAction: (open: boolean) => void;
  categories: ArchiveCategory[];
}) {
  const form = useForm<UpdateArchiveForm>({
    resolver: zodResolver(updateArchiveSchema),
  });

  const [updateState, updateAction, isPending] = useActionState(
    updateArchive,
    INITIAL_STATE_UPDATE_ARCHIVE,
  );

  const [preview, setPreview] = useState<Preview | undefined>(undefined);
  const prevUpdateStatus = useRef(updateState.status);
  const isInitialized = useRef(false);

  const onSubmit = form.handleSubmit((data) => {
    const formData = new FormData();
    const hasNewFile = preview?.file && preview.file.size > 0;

    Object.entries(data).forEach(([key, value]) => {
      if (key === 'file_url' && hasNewFile) {
        formData.append(key, preview.file);
      } else {
        formData.append(key, value ?? '');
      }
    });

    formData.append('old_file_url', currentData?.file_url ?? '');
    formData.append('old_file_path', currentData?.file_path ?? '');
    formData.append('old_file_name', currentData?.file_name ?? '');
    formData.append('old_file_size', String(currentData?.file_size ?? 0));
    formData.append('id', currentData?.id ?? '');

    startTransition(() => {
      updateAction(formData);
    });
  });

  useEffect(() => {
    if (updateState.status === prevUpdateStatus.current) return;
    prevUpdateStatus.current = updateState.status;

    if (updateState?.status === 'error') {
      toast.error('Gagal memperbarui arsip', {
        description: updateState.errors?._form?.[0],
      });
    }

    if (updateState?.status === 'success') {
      toast.success('Arsip berhasil diperbarui');
      form.reset();
      setPreview(undefined); // eslint-disable-line react-hooks/set-state-in-effect
      handleChangeAction(false);
      refetch();
    }
  }, [updateState]);

  useEffect(() => {
    if (!currentData) return;
    if (!isInitialized.current) {
      isInitialized.current = true;
      return;
    }
    form.setValue('title', currentData.title);
    form.setValue('category_id', currentData.category_id ?? '');
    form.setValue('number', currentData.number ?? '');
    form.setValue('date', currentData.date ?? '');
    form.setValue('description', currentData.description ?? '');
    form.setValue('file_url', currentData.file_url ?? '');

    if (currentData.file_url) {
      setPreview({ // eslint-disable-line react-hooks/set-state-in-effect
        file: new File([], currentData.file_name || 'current'),
        displayUrl: currentData.file_url,
      });
    }
  }, [currentData]);

  return (
    <Dialog open={open} onOpenChange={handleChangeAction}>
      <FormArchive
        form={form}
        onSubmit={onSubmit}
        isLoading={isPending}
        type="Update"
        preview={preview}
        setPreview={setPreview}
        categories={categories}
      />
    </Dialog>
  );
}
