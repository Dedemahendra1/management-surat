'use client';

import { startTransition, useActionState, useEffect } from 'react';
import { deleteSuratMasuk } from '../actions';
import { toast } from 'sonner';
import DialogDelete from '@/components/common/dialog-delete';
import { INITIAL_STATE_ACTION } from '@/constant/general-constant';
import { SuratMasuk } from '@/types/surat';

export default function DialogDeleteSuratMasuk({
  open,
  refetch,
  currentData,
  handleChangeAction,
}: {
  refetch: () => void;
  currentData?: SuratMasuk;
  open: boolean;
  handleChangeAction: (open: boolean) => void;
}) {
  const [deleteState, deleteAction, isPending] = useActionState(
    deleteSuratMasuk,
    INITIAL_STATE_ACTION,
  );

  const onSubmit = () => {
    const formData = new FormData();
    formData.append('id', currentData!.id);
    formData.append('file_path', currentData?.file_path ?? '');
    startTransition(() => {
      deleteAction(formData);
    });
  };

  useEffect(() => {
    if (deleteState?.status === 'error') {
      toast.error('Gagal menghapus surat masuk', {
        description: deleteState.errors?._form?.[0],
      });
    }

    if (deleteState?.status === 'success') {
      toast.success('Surat masuk berhasil dihapus');
      handleChangeAction(false);
      refetch();
    }
  }, [deleteState]);

  return (
    <DialogDelete
      open={open}
      onOpenChange={handleChangeAction}
      isLoading={isPending}
      onSubmit={onSubmit}
      title="Surat Masuk"
    />
  );
}
