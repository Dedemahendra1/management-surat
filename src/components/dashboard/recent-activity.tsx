'use client';

import { ArchiveLog } from '@/types/archive';

function getActionLabel(action: string): string {
  switch (action) {
    case 'create':
      return 'mengupload';
    case 'update':
      return 'memperbarui';
    case 'delete':
      return 'menghapus';
    case 'restore':
      return 'memulihkan';
    default:
      return action;
  }
}

function formatTime(date: string): string {
  const d = new Date(date);
  const now = new Date();
  const diff = now.getTime() - d.getTime();
  const mins = Math.floor(diff / 60000);
  if (mins < 1) return 'Baru saja';
  if (mins < 60) return `${mins} menit lalu`;
  const hours = Math.floor(mins / 60);
  if (hours < 24) return `${hours} jam lalu`;
  const days = Math.floor(hours / 24);
  if (days < 7) return `${days} hari lalu`;
  return d.toLocaleDateString('id-ID', {
    day: 'numeric',
    month: 'short',
  });
}

export default function RecentActivity({
  logs,
}: {
  logs: (ArchiveLog & { profiles?: { name?: string } })[];
}) {
  if (!logs || logs.length === 0) {
    return (
      <div className="rounded-xl border border-zinc-200 p-6 text-center text-sm text-zinc-400 dark:border-zinc-800 dark:text-zinc-500">
        Belum ada aktivitas
      </div>
    );
  }

  return (
    <div className="space-y-0">
      {logs.slice(0, 10).map((log, idx) => (
        <div
          key={log.id}
          className="flex items-start gap-3 border-b border-zinc-100 py-3 last:border-0 dark:border-zinc-800"
        >
          <div className="mt-1.5 flex h-2 w-2 shrink-0 rounded-full bg-zinc-300 dark:bg-zinc-600" />
          <div className="min-w-0 flex-1">
            <p className="text-sm text-zinc-700 dark:text-zinc-300">
              <span className="font-medium text-zinc-900 dark:text-zinc-100">
                {log.profiles?.name || 'System'}
              </span>{' '}
              {getActionLabel(log.action)} arsip
            </p>
            {log.details && (
              <p className="truncate text-xs text-zinc-400 dark:text-zinc-500">
                {(log.details as { title?: string })?.title || ''}
              </p>
            )}
            <p className="mt-0.5 text-xs text-zinc-400 dark:text-zinc-500">
              {formatTime(log.created_at)}
            </p>
          </div>
        </div>
      ))}
    </div>
  );
}
