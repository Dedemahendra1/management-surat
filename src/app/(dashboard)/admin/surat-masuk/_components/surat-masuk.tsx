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
import {
  HEADER_TABLE_SURAT_MASUK,
  SURAT_MASUK_STATUS_LIST,
} from '@/constant/surat-constant';
import useDataTable from '@/hooks/use-data-table';
import { createClient } from '@/lib/supabase/client';
import { cn } from '@/lib/utils';
import { useAuthStore } from '@/store/auth-store';
import { SuratMasuk } from '@/types/surat';
import { useQuery } from '@tanstack/react-query';
import { Eye, Pencil, Trash2, Undo2 } from 'lucide-react';
import { useMemo, useState } from 'react';
import { toast } from 'sonner';
import DialogCreateSuratMasuk from './dialog-create-surat-masuk';
import DialogUpdateSuratMasuk from './dialog-update-surat-masuk';
import DialogDeleteSuratMasuk from './dialog-delete-surat-masuk';
import DialogDetailSuratMasuk from './dialog-detail-surat-masuk';

function formatDate(date?: string | null): string {
  if (!date) return '-';
  return new Date(date).toLocaleDateString('id-ID', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  });
}

function getStatusLabel(status: string): string {
  const found = SURAT_MASUK_STATUS_LIST.find((s) => s.value === status);
  return found?.label || status;
}

function getStatusColor(status: string): string {
  switch (status) {
    case 'diterima':
      return 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300';
    case 'disposisi':
      return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-300';
    case 'diproses':
      return 'bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-300';
    case 'selesai':
      return 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300';
    case 'diarsipkan':
      return 'bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-300';
    default:
      return 'bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-300';
  }
}

export default function SuratMasukManagement() {
  const supabase = createClient();
  const profile = useAuthStore((state) => state.profile);
  const isPimpinan = profile?.role?.toLowerCase() === 'pimpinan';
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
  const [filterStatus, setFilterStatus] = useState<string>('all');

  const {
    data: suratMasuk,
    isLoading,
    refetch,
  } = useQuery({
    queryKey: [
      'surat-masuk',
      currentPage,
      currentLimit,
      currentSearch,
      activeTab,
      filterStatus,
    ],
    queryFn: async () => {
      let query = supabase
        .from('surat_masuk')
        .select('*, profiles(name, avatar_url)', { count: 'exact' });

      if (activeTab === 'active') {
        query = query.eq('is_deleted', false);
      } else if (activeTab === 'trash') {
        query = query.eq('is_deleted', true);
      } else {
        query = query.eq('is_deleted', false);
      }

      if (filterStatus !== 'all') {
        query = query.eq('status', filterStatus);
      }

      if (currentSearch) {
        query = query.or(
          `nomor.ilike.%${currentSearch}%,perihal.ilike.%${currentSearch}%,asal_surat.ilike.%${currentSearch}%`,
        );
      }

      const result = await query
        .range(
          (currentPage - 1) * currentLimit,
          currentPage * currentLimit - 1,
        )
        .order('created_at', { ascending: false });

      if (result.error)
        toast.error('Gagal memuat data surat masuk', {
          description: result.error.message,
        });

      return result;
    },
  });

  const [selectedAction, setSelectedAction] = useState<{
    data: SuratMasuk;
    type: 'update' | 'delete';
  } | null>(null);

  const [detailData, setDetailData] = useState<SuratMasuk | null>(null);
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
    return (suratMasuk?.data || []).map((item, index) => [
      index + 1,
      item.nomor,
      item.asal_surat || '-',
      item.perihal,
      formatDate(item.tanggal),
      <span
        className={cn(
          'inline-flex items-center rounded-full px-2 py-1 text-xs font-medium',
          getStatusColor(item.status),
        )}
      >
        {getStatusLabel(item.status)}
      </span>,
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
                ...(!isPimpinan
                  ? [
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
                  : []),
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
                    const { restoreSuratMasuk } = await import('../actions');
                    const result = await restoreSuratMasuk(
                      { status: 'idle', errors: {} },
                      formData,
                    );
                    if (result.status === 'success') {
                      toast.success('Surat masuk berhasil dipulihkan');
                      refetch();
                    } else {
                      toast.error('Gagal memulihkan surat masuk');
                    }
                  },
                },
              ]),
        ]}
      />,
    ]);
  }, [suratMasuk, activeTab, isPimpinan]);

  const totalPages = useMemo(() => {
    return suratMasuk && suratMasuk.count !== null
      ? Math.ceil(suratMasuk.count / currentLimit)
      : 0;
  }, [suratMasuk]);

  return (
    <div className="w-full">
      <div className="mb-4 flex flex-col gap-3 lg:flex-row w-full justify-between">
        <h1 className="text-2xl font-bold">Surat Masuk</h1>
        {!isPimpinan && activeTab !== 'trash' && (
          <Dialog>
            <DialogTrigger asChild>
              <Button variant="outline">+ Surat Masuk Baru</Button>
            </DialogTrigger>
            <DialogCreateSuratMasuk refetch={refetch} />
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
          placeholder="Cari nomor, perihal, atau asal surat..."
          onChange={(e) => handleChangeSearch(e.target.value)}
          className="max-w-sm"
        />

        <Select value={filterStatus} onValueChange={setFilterStatus}>
          <SelectTrigger className="w-[180px]">
            <SelectValue placeholder="Semua Status" />
          </SelectTrigger>
          <SelectContent>
            <SelectGroup>
              <SelectLabel>Status</SelectLabel>
              <SelectItem value="all">Semua Status</SelectItem>
              {SURAT_MASUK_STATUS_LIST.map((status) => (
                <SelectItem key={status.value} value={status.value}>
                  {status.label}
                </SelectItem>
              ))}
            </SelectGroup>
          </SelectContent>
        </Select>
      </div>

      <DataTable
        header={HEADER_TABLE_SURAT_MASUK}
        data={filteredData}
        isLoading={isLoading}
        totalPages={totalPages}
        currentPage={currentPage}
        onChangePage={handleChangePage}
        currentLimit={currentLimit}
        onChangeLimit={handleChangeLimit}
      />

      <DialogUpdateSuratMasuk
        open={selectedAction !== null && selectedAction.type === 'update'}
        refetch={refetch}
        currentData={selectedAction?.data}
        handleChangeAction={handleChangeAction}
      />

      <DialogDeleteSuratMasuk
        open={selectedAction !== null && selectedAction.type === 'delete'}
        refetch={refetch}
        currentData={selectedAction?.data}
        handleChangeAction={handleChangeAction}
      />

      <DialogDetailSuratMasuk
        open={showDetail}
        onOpenChange={setShowDetail}
        data={detailData || undefined}
      />
    </div>
  );
}
