'use client';

import {
  INITIAL_CREATE_SURAT_MASUK_FORM,
  INITIAL_STATE_CREATE_SURAT_MASUK,
} from '@/constant/surat-constant';
import {
  CreateSuratMasukForm,
  createSuratMasukSchema,
} from '@/validations/surat-validation';
import { zodResolver } from '@hookform/resolvers/zod';
import { startTransition, useActionState, useEffect, useRef, useState } from 'react';
import { useForm } from 'react-hook-form';
import { toast } from 'sonner';
import { createSuratMasuk } from '../actions';
import FormSuratMasuk from './form-surat-masuk';
import { Preview } from '@/types/general';

export default function DialogCreateSuratMasuk({
  refetch,
}: {
  refetch: () => void;
}) {
  const form = useForm<CreateSuratMasukForm>({
    resolver: zodResolver(createSuratMasukSchema),
    defaultValues: INITIAL_CREATE_SURAT_MASUK_FORM,
  });

  const [createState, createAction, isPending] = useActionState(
    createSuratMasuk,
    INITIAL_STATE_CREATE_SURAT_MASUK,
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
      toast.error('Gagal membuat surat masuk', {
        description: createState.errors?._form?.[0],
      });
    }
  }, [createState]);

  useEffect(() => {
    if (createState.status === prevCreateStatus.current) return;
    prevCreateStatus.current = createState.status;

    if (createState?.status === 'success') {
      toast.success('Surat masuk berhasil dibuat');
      form.reset();
      setPreview(undefined); // eslint-disable-line react-hooks/set-state-in-effect
      document.querySelector<HTMLButtonElement>('[data-state="open"]')?.click();
      refetch();
    }
  }, [createState]);

  return (
    <FormSuratMasuk
      form={form}
      onSubmit={onSubmit}
      isLoading={isPending}
      type="Create"
      preview={preview}
      setPreview={setPreview}
    />
  );
}
