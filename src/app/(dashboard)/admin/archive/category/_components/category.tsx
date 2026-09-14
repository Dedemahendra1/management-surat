'use client';

import DataTable from '@/components/common/data-table';
import DropdownAction from '@/components/common/dropdown-action';
import { Button } from '@/components/ui/button';
import { Dialog, DialogTrigger } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { HEADER_TABLE_CATEGORY } from '@/constant/archive-constant';
import useDataTable from '@/hooks/use-data-table';
import { createClient } from '@/lib/supabase/client';
import { useQuery } from '@tanstack/react-query';
import { Pencil, Trash2 } from 'lucide-react';
import { useMemo, useState } from 'react';
import { toast } from 'sonner';
import DialogCreateCategory from './dialog-create-category';
import DialogUpdateCategory from './dialog-update-category';
import DialogDeleteCategory from './dialog-delete-category';
import { ArchiveCategory } from '@/types/archive';
import { cn } from '@/lib/utils';

export default function CategoryManagement() {
  const supabase = createClient();
  const {
    currentPage,
    currentLimit,
    currentSearch,
    handleChangePage,
    handleChangeLimit,
    handleChangeSearch,
  } = useDataTable();

  const {
    data: categories,
    isLoading,
    refetch,
  } = useQuery({
    queryKey: ['categories', currentPage, currentLimit, currentSearch],
    queryFn: async () => {
      const result = await supabase
        .from('archive_categories')
        .select('*', { count: 'exact' })
        .range(
          (currentPage - 1) * currentLimit,
          currentPage * currentLimit - 1,
        )
        .order('created_at', { ascending: false })
        .ilike('name', `%${currentSearch}%`);

      if (result.error)
        toast.error('Gagal memuat data kategori', {
          description: result.error.message,
        });

      return result;
    },
  });

  const [selectedAction, setSelectedAction] = useState<{
    data: ArchiveCategory;
    type: 'update' | 'delete';
  } | null>(null);

  const handleChangeAction = (open: boolean) => {
    if (!open) setSelectedAction(null);
  };

  const filteredData = useMemo(() => {
    return (categories?.data || []).map((item, index) => [
      index + 1,
      item.name,
      item.description || '-',
      item.color ? (
        <span
          className={cn(
            'inline-flex items-center rounded-md border px-2 py-0.5 text-xs font-medium',
          )}
          style={{ borderColor: item.color, color: item.color }}
        >
          {item.color}
        </span>
      ) : (
        '-'
      ),
      <DropdownAction
        menu={[
          {
            label: (
              <span className="flex items-center gap-2">
                <Pencil />
                Edit
              </span>
            ),
            action: () => {
              setSelectedAction({ data: item, type: 'update' });
            },
          },
          {
            label: (
              <span className="flex items-center gap-2">
                <Trash2 className="text-red-400" />
                Hapus
              </span>
            ),
            variant: 'destructive',
            action: () => {
              setSelectedAction({ data: item, type: 'delete' });
            },
          },
        ]}
      />,
    ]);
  }, [categories]);

  const totalPages = useMemo(() => {
    return categories && categories.count !== null
      ? Math.ceil(categories.count / currentLimit)
      : 0;
  }, [categories]);

  return (
    <div className="w-full">
      <div className="mb-4 flex flex-col gap-2 lg:flex-row w-full justify-between">
        <h1 className="text-2xl font-bold">Kategori Arsip</h1>
        <div className="flex gap-2">
          <Input
            placeholder="Cari nama kategori"
            onChange={(e) => handleChangeSearch(e.target.value)}
          />
          <Dialog>
            <DialogTrigger asChild>
              <Button variant="outline">Tambah</Button>
            </DialogTrigger>
            <DialogCreateCategory refetch={refetch} />
          </Dialog>
        </div>
      </div>
      <DataTable
        header={HEADER_TABLE_CATEGORY}
        data={filteredData}
        isLoading={isLoading}
        totalPages={totalPages}
        currentPage={currentPage}
        onChangePage={handleChangePage}
        currentLimit={currentLimit}
        onChangeLimit={handleChangeLimit}
      />

      <DialogUpdateCategory
        open={selectedAction !== null && selectedAction.type === 'update'}
        refetch={refetch}
        currentData={selectedAction?.data}
        handleChangeAction={handleChangeAction}
      />

      <DialogDeleteCategory
        open={selectedAction !== null && selectedAction.type === 'delete'}
        refetch={refetch}
        currentData={selectedAction?.data}
        handleChangeAction={handleChangeAction}
      />
    </div>
  );
}
