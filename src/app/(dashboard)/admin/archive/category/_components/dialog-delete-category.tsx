'use client';

import { startTransition, useActionState, useEffect } from 'react';
import { deleteCategory } from '../actions';
import { toast } from 'sonner';
import DialogDelete from '@/components/common/dialog-delete';
import { INITIAL_STATE_ACTION } from '@/constant/general-constant';
import { ArchiveCategory } from '@/types/archive';

export default function DialogDeleteCategory({
  open,
  refetch,
  currentData,
  handleChangeAction,
}: {
  refetch: () => void;
  currentData?: ArchiveCategory;
  open: boolean;
  handleChangeAction: (open: boolean) => void;
}) {
  const [deleteState, deleteAction, isPending] = useActionState(
    deleteCategory,
    INITIAL_STATE_ACTION,
  );

  const onSubmit = () => {
    const formData = new FormData();
    formData.append('id', currentData!.id);
    startTransition(() => {
      deleteAction(formData);
    });
  };

  useEffect(() => {
    if (deleteState?.status === 'error') {
      toast.error('Gagal menghapus kategori', {
        description: deleteState.errors?._form?.[0],
      });
    }

    if (deleteState?.status === 'success') {
      toast.success('Kategori berhasil dihapus');
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
      title="Kategori"
    />
  );
}
