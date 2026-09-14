'use client';

import { INITIAL_STATE_UPDATE_SURAT_MASUK } from '@/constant/surat-constant';
import {
  UpdateSuratMasukForm,
  updateSuratMasukSchema,
} from '@/validations/surat-validation';
import { zodResolver } from '@hookform/resolvers/zod';
import { startTransition, useActionState, useEffect, useRef, useState } from 'react';
import { useForm } from 'react-hook-form';
import { toast } from 'sonner';
import { updateSuratMasuk } from '../actions';
import FormSuratMasuk from './form-surat-masuk';
import { Preview } from '@/types/general';
import { SuratMasuk } from '@/types/surat';
import { Dialog } from '@radix-ui/react-dialog';

export default function DialogUpdateSuratMasuk({
  refetch,
  currentData,
  open,
  handleChangeAction,
}: {
  refetch: () => void;
  currentData?: SuratMasuk;
  open: boolean;
  handleChangeAction: (open: boolean) => void;
}) {
  const form = useForm<UpdateSuratMasukForm>({
    resolver: zodResolver(updateSuratMasukSchema),
  });

  const [updateState, updateAction, isPending] = useActionState(
    updateSuratMasuk,
    INITIAL_STATE_UPDATE_SURAT_MASUK,
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
      toast.error('Gagal memperbarui surat masuk', {
        description: updateState.errors?._form?.[0],
      });
    }

    if (updateState?.status === 'success') {
      toast.success('Surat masuk berhasil diperbarui');
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
    form.setValue('nomor', currentData.nomor);
    form.setValue('tanggal', currentData.tanggal ?? '');
    form.setValue('asal_surat', currentData.asal_surat ?? '');
    form.setValue('perihal', currentData.perihal);
    form.setValue('status', currentData.status as UpdateSuratMasukForm['status']);
    form.setValue('disposisi', currentData.disposisi ?? '');
    form.setValue('keterangan', currentData.keterangan ?? '');
    form.setValue('file_url', currentData.file_url ?? '');
    form.setValue('lokasi_lemari', currentData.lokasi_lemari ?? '');
    form.setValue('lokasi_rak', currentData.lokasi_rak ?? '');
    form.setValue('lokasi_map', currentData.lokasi_map ?? '');
    form.setValue('lokasi_box', currentData.lokasi_box ?? '');
    form.setValue('keterangan_fisik', currentData.keterangan_fisik ?? '');

    if (currentData.file_url) {
      setPreview({ // eslint-disable-line react-hooks/set-state-in-effect
        file: new File([], currentData.file_name || 'current'),
        displayUrl: currentData.file_url,
      });
    }
  }, [currentData]);

  return (
    <Dialog open={open} onOpenChange={handleChangeAction}>
      <FormSuratMasuk
        form={form}
        onSubmit={onSubmit}
        isLoading={isPending}
        type="Update"
        preview={preview}
        setPreview={setPreview}
      />
    </Dialog>
  );
}
