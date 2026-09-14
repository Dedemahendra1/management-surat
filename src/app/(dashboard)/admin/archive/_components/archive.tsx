'use client';

import DataTable from '@/components/common/data-table';
import DropdownAction from '@/components/common/dropdown-action';
import { Button } from '@/components/ui/button';
import { Dialog, DialogTrigger } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectLabel,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { HEADER_TABLE_ARCHIVE } from '@/constant/archive-constant';
import useDataTable from '@/hooks/use-data-table';
import { createClient } from '@/lib/supabase/client';
import { cn } from '@/lib/utils';
import { Archive, ArchiveCategory } from '@/types/archive';
import { useQuery } from '@tanstack/react-query';
import { Eye, Pencil, Trash2, Undo2 } from 'lucide-react';
import { useMemo, useState } from 'react';
import { toast } from 'sonner';
import DialogCreateArchive from './dialog-create-archive';
import DialogUpdateArchive from './dialog-update-archive';
import DialogDeleteArchive from './dialog-delete-archive';
import DialogDetailArchive from './dialog-detail-archive';

function formatDate(date?: string | null): string {
  if (!date) return '-';
  return new Date(date).toLocaleDateString('id-ID', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  });
}

export default function ArchiveManagement() {
  const supabase = createClient();
  const {
    currentPage,
    currentLimit,
    currentSearch,
    handleChangePage,
    handleChangeLimit,
    handleChangeSearch,
  } = useDataTable();

  const [activeTab, setActiveTab] = useState<'all' | 'active' | 'trash'>(
    'all',
  );
  const [filterCategory, setFilterCategory] = useState<string>('all');

  const { data: categories } = useQuery({
    queryKey: ['categories'],
    queryFn: async () => {
      const result = await supabase
        .from('archive_categories')
        .select('*')
        .order('name');
      return (result.data || []) as ArchiveCategory[];
    },
  });

  const {
    data: archives,
    isLoading,
    refetch,
  } = useQuery({
    queryKey: [
      'archives',
      currentPage,
      currentLimit,
      currentSearch,
      activeTab,
      filterCategory,
    ],
    queryFn: async () => {
      let query = supabase
        .from('archives')
        .select(
          '*, category:archive_categories(name, color), profiles(name, avatar_url)',
          {
            count: 'exact',
          },
        );

      if (activeTab === 'active') {
        query = query.eq('is_deleted', false);
      } else if (activeTab === 'trash') {
        query = query.eq('is_deleted', true);
      } else {
        query = query.eq('is_deleted', false);
      }

      if (filterCategory !== 'all') {
        query = query.eq('category_id', filterCategory);
      }

      if (currentSearch) {
        query = query.or(
          `title.ilike.%${currentSearch}%,number.ilike.%${currentSearch}%`,
        );
      }

      const result = await query
        .range(
          (currentPage - 1) * currentLimit,
          currentPage * currentLimit - 1,
        )
        .order('created_at', { ascending: false });

      if (result.error)
        toast.error('Gagal memuat data arsip', {
          description: result.error.message,
        });

      return result;
    },
  });

  const [selectedAction, setSelectedAction] = useState<{
    data: Archive;
    type: 'update' | 'delete';
  } | null>(null);

  const [detailData, setDetailData] = useState<Archive | null>(null);
  const [showDetail, setShowDetail] = useState(false);

  const handleChangeAction = (open: boolean) => {
    if (!open) setSelectedAction(null);
  };

  const tabs = [
    { key: 'all' as const, label: 'Semua' },
    { key: 'active' as const, label: 'Aktif' },
    { key: 'trash' as const, label: 'Sampah' },
  ];

  const filteredData = useMemo(() => {
    return (archives?.data || []).map((item, index) => [
      index + 1,
      item.number || '-',
      item.title,
      item.category?.name || '-',
      formatDate(item.date),
      <DropdownAction
        menu={[
          ...(activeTab !== 'trash'
            ? [
                {
                  label: (
                    <span className="flex items-center gap-2">
                      <Eye />
                      Detail
                    </span>
                  ),
                  action: () => {
                    setDetailData(item);
                    setShowDetail(true);
                  },
                },
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
                  variant: 'destructive' as const,
                  action: () => {
                    setSelectedAction({ data: item, type: 'delete' });
                  },
                },
              ]
            : [
                {
                  label: (
                    <span className="flex items-center gap-2">
                      <Undo2 />
                      Pulihkan
                    </span>
                  ),
                  action: async () => {
                    const formData = new FormData();
                    formData.append('id', item.id);
                    const { restoreArchive } = await import('../actions');
                    const result = await restoreArchive(
                      { status: 'idle', errors: {} },
                      formData,
                    );
                    if (result.status === 'success') {
                      toast.success('Arsip berhasil dipulihkan');
                      refetch();
                    } else {
                      toast.error('Gagal memulihkan arsip');
                    }
                  },
                },
              ]),
        ]}
      />,
    ]);
  }, [archives, activeTab]);

  const totalPages = useMemo(() => {
    return archives && archives.count !== null
      ? Math.ceil(archives.count / currentLimit)
      : 0;
  }, [archives]);

  return (
    <div className="w-full">
      <div className="mb-4 flex flex-col gap-3 lg:flex-row w-full justify-between">
        <h1 className="text-2xl font-bold">Manajemen Arsip</h1>
        {activeTab !== 'trash' && (
          <Dialog>
            <DialogTrigger asChild>
              <Button variant="outline">+ Arsip Baru</Button>
            </DialogTrigger>
            <DialogCreateArchive
              refetch={refetch}
              categories={categories || []}
            />
          </Dialog>
        )}
      </div>

      {/* Tabs */}
      <div className="mb-4 flex gap-1 rounded-lg border p-1 w-fit">
        {tabs.map((tab) => (
          <button
            key={tab.key}
            onClick={() => {
              setActiveTab(tab.key);
              handleChangePage(1);
            }}
            className={cn(
              'rounded-md px-3 py-1.5 text-sm font-medium transition-colors',
              activeTab === tab.key
                ? 'bg-zinc-900 text-white dark:bg-zinc-100 dark:text-zinc-900'
                : 'text-zinc-500 hover:text-zinc-900 dark:text-zinc-400 dark:hover:text-zinc-100',
            )}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Filters */}
      <div className="mb-4 flex flex-wrap gap-2">
        <Input
          placeholder="Cari judul atau nomor dokumen..."
          onChange={(e) => handleChangeSearch(e.target.value)}
          className="max-w-sm"
        />

        <Select value={filterCategory} onValueChange={setFilterCategory}>
          <SelectTrigger className="w-[180px]">
            <SelectValue placeholder="Semua Kategori" />
          </SelectTrigger>
          <SelectContent>
            <SelectGroup>
              <SelectLabel>Kategori</SelectLabel>
              <SelectItem value="all">Semua Kategori</SelectItem>
              {(categories || []).map((cat) => (
                <SelectItem key={cat.id} value={cat.id}>
                  {cat.name}
                </SelectItem>
              ))}
            </SelectGroup>
          </SelectContent>
        </Select>
      </div>

      <DataTable
        header={HEADER_TABLE_ARCHIVE}
        data={filteredData}
        isLoading={isLoading}
        totalPages={totalPages}
        currentPage={currentPage}
        onChangePage={handleChangePage}
        currentLimit={currentLimit}
        onChangeLimit={handleChangeLimit}
      />

      <DialogUpdateArchive
        open={selectedAction !== null && selectedAction.type === 'update'}
        refetch={refetch}
        currentData={selectedAction?.data}
        handleChangeAction={handleChangeAction}
        categories={categories || []}
      />

      <DialogDeleteArchive
        open={selectedAction !== null && selectedAction.type === 'delete'}
        refetch={refetch}
        currentData={selectedAction?.data}
        handleChangeAction={handleChangeAction}
      />

      <DialogDetailArchive
        open={showDetail}
        onOpenChange={setShowDetail}
        data={detailData || undefined}
      />
    </div>
  );
}
