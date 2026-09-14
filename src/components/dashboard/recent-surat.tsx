'use client';

import { cn } from '@/lib/utils';
import { SURAT_MASUK_STATUS_LIST, SURAT_KELUAR_STATUS_LIST } from '@/constant/surat-constant';
import { Inbox, Send } from 'lucide-react';
import { ArrowUpRight, Eye } from 'lucide-react';
import Link from 'next/link';

function formatDate(date?: string | null): string {
  if (!date) return '-';
  return new Date(date).toLocaleDateString('id-ID', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  });
}

function statusColor(status: string): string {
  switch (status) {
    case 'diterima':
    case 'dibuat':
      return 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300';
    case 'disposisi':
    case 'disetujui':
      return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-300';
    case 'diproses':
    case 'dikirim':
      return 'bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-300';
    case 'selesai':
      return 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300';
    case 'diarsipkan':
      return 'bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-300';
    default:
      return 'bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-300';
  }
}

type Item = {
  id: string;
  nomor: string;
  tanggal?: string;
  perihal: string;
  status: string;
  counterpart?: string;
};

export default function RecentSurat({
  type,
  data,
}: {
  type: 'masuk' | 'keluar';
  data: Item[];
}) {
  const isMasuk = type === 'masuk';
  const statusList = isMasuk
    ? SURAT_MASUK_STATUS_LIST
    : SURAT_KELUAR_STATUS_LIST;
  const label = isMasuk ? 'Surat Masuk Terbaru' : 'Surat Keluar Terbaru';
  const href = isMasuk ? '/admin/surat-masuk' : '/admin/surat-keluar';
  const Icon = isMasuk ? Inbox : Send;
  const counterLabel = isMasuk ? 'Asal' : 'Tujuan';

  return (
    <div className="rounded-xl border border-zinc-200 dark:border-zinc-800">
      <div className="flex items-center justify-between border-b border-zinc-100 px-4 py-3 dark:border-zinc-800">
        <div className="flex items-center gap-2">
          <Icon className="h-4 w-4 text-zinc-400" />
          <h3 className="text-sm font-semibold text-zinc-900 dark:text-zinc-100">
            {label}
          </h3>
        </div>
        <Link
          href={href}
          className="flex items-center gap-1 text-sm font-medium text-zinc-500 hover:text-zinc-900 dark:text-zinc-400 dark:hover:text-zinc-100"
        >
          Lihat Semua
          <ArrowUpRight className="h-3.5 w-3.5" />
        </Link>
      </div>

      {data.length === 0 ? (
        <div className="px-4 py-8 text-center text-sm text-zinc-400">
          Belum ada {isMasuk ? 'surat masuk' : 'surat keluar'}
        </div>
      ) : (
        <div className="divide-y divide-zinc-100 dark:divide-zinc-800">
          {data.map((item) => (
            <div key={item.id} className="flex items-center gap-3 px-4 py-3">
              <div className="min-w-0 flex-1">
                <p className="truncate text-sm font-medium text-zinc-900 dark:text-zinc-100">
                  {item.nomor}
                </p>
                <p className="truncate text-xs text-zinc-500 dark:text-zinc-400">
                  {item.perihal}
                </p>
                <p className="truncate text-xs text-zinc-400 dark:text-zinc-500">
                  {item.counterpart || '-'} • {formatDate(item.tanggal)}
                </p>
              </div>
              <span
                className={cn(
                  'inline-flex shrink-0 items-center rounded-full px-2 py-1 text-xs font-medium',
                  statusColor(item.status),
                )}
              >
                {statusList.find((s) => s.value === item.status)?.label ||
                  item.status}
              </span>
              <Link
                href={href}
                className="inline-flex h-8 w-8 shrink-0 items-center justify-center rounded-lg text-zinc-400 hover:bg-zinc-100 hover:text-zinc-600 dark:hover:bg-zinc-800 dark:hover:text-zinc-300"
              >
                <Eye className="h-4 w-4" />
              </Link>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
