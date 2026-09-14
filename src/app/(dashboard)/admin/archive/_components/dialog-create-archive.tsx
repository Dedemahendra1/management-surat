'use client';

import {
  INITIAL_CREATE_ARCHIVE_FORM,
  INITIAL_STATE_CREATE_ARCHIVE,
} from '@/constant/archive-constant';
import {
  CreateArchiveForm,
  createArchiveSchema,
} from '@/validations/archive-validation';
import { zodResolver } from '@hookform/resolvers/zod';
import { startTransition, useActionState, useEffect, useRef, useState } from 'react';
import { useForm } from 'react-hook-form';
import { toast } from 'sonner';
import { createArchive } from '../actions';
import FormArchive from './form-archive';
import { Preview } from '@/types/general';
import { ArchiveCategory } from '@/types/archive';

export default function DialogCreateArchive({
  refetch,
  categories,
}: {
  refetch: () => void;
  categories: ArchiveCategory[];
}) {
  const form = useForm<CreateArchiveForm>({
    resolver: zodResolver(createArchiveSchema),
    defaultValues: INITIAL_CREATE_ARCHIVE_FORM,
  });

  const [createState, createAction, isPending] = useActionState(
    createArchive,
    INITIAL_STATE_CREATE_ARCHIVE,
  );

  const [preview, setPreview] = useState<Preview | undefined>(undefined);
  const prevCreateStatus = useRef(createState.status);

  const onSubmit = form.handleSubmit((data) => {
    const formData = new FormData();
    Object.entries(data).forEach(([key, value]) => {
      if (key === 'file_url' && preview?.file) {
        formData.append(key, preview.file);
      } else {
        formData.append(key, value ?? '');
      }
    });

    startTransition(() => {
      createAction(formData);
    });
  });

  useEffect(() => {
    if (createState?.status === 'error') {
      toast.error('Gagal membuat arsip', {
        description: createState.errors?._form?.[0],
      });
    }
  }, [createState]);

  useEffect(() => {
    if (createState.status === prevCreateStatus.current) return;
    prevCreateStatus.current = createState.status;

    if (createState?.status === 'success') {
      toast.success('Arsip berhasil dibuat');
      form.reset();
      setPreview(undefined); // eslint-disable-line react-hooks/set-state-in-effect
      document.querySelector<HTMLButtonElement>('[data-state="open"]')?.click();
      refetch();
    }
  }, [createState]);

  return (
    <FormArchive
      form={form}
      onSubmit={onSubmit}
      isLoading={isPending}
      type="Create"
      preview={preview}
      setPreview={setPreview}
      categories={categories}
    />
  );
}
