'use client';

import { startTransition, useActionState, useEffect } from 'react';
import { deleteSuratKeluar } from '../actions';
import { toast } from 'sonner';
import DialogDelete from '@/components/common/dialog-delete';
import { INITIAL_STATE_ACTION } from '@/constant/general-constant';
import { SuratKeluar } from '@/types/surat';

export default function DialogDeleteSuratKeluar({
  open,
  refetch,
  currentData,
  handleChangeAction,
}: {
  refetch: () => void;
  currentData?: SuratKeluar;
  open: boolean;
  handleChangeAction: (open: boolean) => void;
}) {
  const [deleteState, deleteAction, isPending] = useActionState(
    deleteSuratKeluar,
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
      toast.error('Gagal menghapus surat keluar', {
        description: deleteState.errors?._form?.[0],
      });
    }

    if (deleteState?.status === 'success') {
      toast.success('Surat keluar berhasil dihapus');
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
      title="Surat Keluar"
    />
  );
}
