'use client';

import {
  INITIAL_CREATE_SURAT_KELUAR_FORM,
  INITIAL_STATE_CREATE_SURAT_KELUAR,
} from '@/constant/surat-constant';
import {
  CreateSuratKeluarForm,
  createSuratKeluarSchema,
} from '@/validations/surat-validation';
import { zodResolver } from '@hookform/resolvers/zod';
import { startTransition, useActionState, useEffect, useRef, useState } from 'react';
import { useForm } from 'react-hook-form';
import { toast } from 'sonner';
import { createSuratKeluar } from '../actions';
import FormSuratKeluar from './form-surat-keluar';
import { Preview } from '@/types/general';
import { SuratMasuk } from '@/types/surat';
import { createClient } from '@/lib/supabase/client';

export default function DialogCreateSuratKeluar({
  refetch,
}: {
  refetch: () => void;
}) {
  const supabase = createClient();

  const form = useForm<CreateSuratKeluarForm>({
    resolver: zodResolver(createSuratKeluarSchema),
    defaultValues: INITIAL_CREATE_SURAT_KELUAR_FORM,
  });

  const [createState, createAction, isPending] = useActionState(
    createSuratKeluar,
    INITIAL_STATE_CREATE_SURAT_KELUAR,
  );

  const [preview, setPreview] = useState<Preview | undefined>(undefined);
  const [suratMasukList, setSuratMasukList] = useState<SuratMasuk[]>([]);
  const prevCreateStatus = useRef(createState.status);

  useEffect(() => {
    const fetchSuratMasuk = async () => {
      const result = await supabase
        .from('surat_masuk')
        .select('*')
        .eq('is_deleted', false)
        .order('created_at', { ascending: false });
      setSuratMasukList((result.data || []) as SuratMasuk[]);
    };
    fetchSuratMasuk();
  }, [supabase]);

  const onSubmit = form.handleSubmit((data) => {
    const formData = new FormData();
    Object.entries(data).forEach(([key, value]) => {
      if (key === 'surat_masuk_id' && value === 'none') {
        formData.append(key, '');
        return;
      }
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
      toast.error('Gagal membuat surat keluar', {
        description: createState.errors?._form?.[0],
      });
    }
  }, [createState]);

  useEffect(() => {
    if (createState.status === prevCreateStatus.current) return;
    prevCreateStatus.current = createState.status;

    if (createState?.status === 'success') {
      toast.success('Surat keluar berhasil dibuat');
      form.reset();
      setPreview(undefined); // eslint-disable-line react-hooks/set-state-in-effect
      document.querySelector<HTMLButtonElement>('[data-state="open"]')?.click();
      refetch();
    }
  }, [createState]);

  return (
    <FormSuratKeluar
      form={form}
      onSubmit={onSubmit}
      isLoading={isPending}
      type="Create"
      preview={preview}
      setPreview={setPreview}
      suratMasukList={suratMasukList}
    />
  );
}
