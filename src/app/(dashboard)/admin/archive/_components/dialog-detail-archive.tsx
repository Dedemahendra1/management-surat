'use client';

import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
} from '@/components/ui/sheet';
import { Button } from '@/components/ui/button';
import { Archive, ArchiveLog } from '@/types/archive';
import { useQuery } from '@tanstack/react-query';
import { createClient } from '@/lib/supabase/client';
import { cn } from '@/lib/utils';
import { formatDate, formatDateTime, formatFileSize } from '@/lib/format';
import {
  Download,
  FileText,
  Calendar,
  Hash,
  Loader2,
  Tags,
  AlignLeft,
} from 'lucide-react';

function getActionLabel(action: string): string {
  switch (action) {
    case 'create':
      return 'Dibuat';
    case 'update':
      return 'Diperbarui';
    case 'delete':
      return 'Dihapus';
    case 'restore':
      return 'Dipulihkan';
    default:
      return action;
  }
}

function InfoRow({
  icon: Icon,
  label,
  children,
}: {
  icon: React.ComponentType<{ className?: string }>;
  label: string;
  children: React.ReactNode;
}) {
  return (
    <div className="flex items-start gap-2.5">
      <div className="mt-0.5 flex h-6 w-6 shrink-0 items-center justify-center rounded-md bg-muted">
        <Icon className="h-3.5 w-3.5 text-muted-foreground" />
      </div>
      <div className="min-w-0">
        <p className="text-xs font-medium text-muted-foreground">{label}</p>
        <div className="text-sm font-medium">{children}</div>
      </div>
    </div>
  );
}

export default function DialogDetailArchive({
  open,
  onOpenChange,
  data,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  data?: Archive;
}) {
  const supabase = createClient();

  const {
    data: logs,
    isLoading: logsLoading,
    isError: logsError,
  } = useQuery({
    queryKey: ['archive-logs', data?.id],
    queryFn: async () => {
      if (!data?.id) return [];
      const result = await supabase
        .from('archive_logs')
        .select('*, profiles(name)')
        .eq('archive_id', data.id)
        .order('created_at', { ascending: false });
      return (result.data || []) as (ArchiveLog & {
        profiles?: { name?: string };
      })[];
    },
    enabled: open && !!data?.id,
  });

  if (!data) return null;

  const isImage = data.file_name?.match(/\.(jpg|jpeg|png)$/i);

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent className="w-full overflow-y-auto sm:max-w-[520px]">
        <SheetHeader>
          <div className="flex flex-wrap items-center justify-between gap-2 pr-8">
            <SheetTitle className="max-w-[85%] flex-1">
              <span className="line-clamp-2">{data.title}</span>
            </SheetTitle>
            {data.category && (
              <span
                className={cn(
                  'inline-flex shrink-0 items-center gap-1.5 rounded-full border px-2.5 py-1 text-xs font-medium',
                )}
              >
                <span
                  className="h-2 w-2 rounded-full"
                  style={{
                    backgroundColor: data.category.color || '#71717a',
                  }}
                />
                {data.category.name}
              </span>
            )}
          </div>
          <SheetDescription>
            {data.number ? `Nomor: ${data.number}` : 'Arsip dokumen'}
          </SheetDescription>
        </SheetHeader>

        <div className="space-y-6 px-4 pb-6">
          {/* Info Arsip */}
          <div className="space-y-4">
            <InfoRow icon={AlignLeft} label="Judul">
              {data.title}
            </InfoRow>

            {data.number && (
              <InfoRow icon={Hash} label="Nomor Dokumen">
                {data.number}
              </InfoRow>
            )}

            {data.category && (
              <InfoRow icon={Tags} label="Kategori">
                {data.category.name}
              </InfoRow>
            )}

            {data.date && (
              <InfoRow icon={Calendar} label="Tanggal">
                {formatDate(data.date)}
              </InfoRow>
            )}

            {data.description && (
              <InfoRow icon={FileText} label="Deskripsi">
                {data.description}
              </InfoRow>
            )}
          </div>

          {/* File Section */}
          <div className="border-t pt-4">
            <div className="flex items-center gap-2 mb-3">
              <FileText className="h-4 w-4 text-muted-foreground" />
              <p className="text-xs font-medium text-muted-foreground">
                Dokumen
              </p>
            </div>

            {data.file_url ? (
              <div className="space-y-3">
                {isImage ? (
                  <div className="overflow-hidden rounded-lg border bg-muted/30">
                    <img
                      src={data.file_url}
                      alt={data.file_name || 'Preview'}
                      className="max-h-[60vh] w-full object-contain"
                    />
                  </div>
                ) : (
                  <div className="flex items-center gap-3 rounded-lg border p-3">
                    <FileText className="h-8 w-8 shrink-0 text-muted-foreground" />
                    <div className="min-w-0 flex-1">
                      <p className="truncate text-sm font-medium">
                        {data.file_name}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        {formatFileSize(data.file_size)}
                      </p>
                    </div>
                  </div>
                )}

                <Button variant="outline" size="sm" asChild>
                  <a
                    href={data.file_url}
                    target="_blank"
                    rel="noopener noreferrer"
                    download
                  >
                    <Download className="mr-2 h-4 w-4" />
                    Download
                  </a>
                </Button>
              </div>
            ) : (
              <p className="text-sm text-muted-foreground">
                Tidak ada file terlampir.
              </p>
            )}
          </div>

          {/* Metadata */}
          <div className="border-t pt-4 space-y-1">
            <p className="text-xs text-muted-foreground">
              Diunggah oleh{' '}
              <span className="font-medium text-foreground">
                {data.profiles?.name || '-'}
              </span>
            </p>
            <p className="text-xs text-muted-foreground">
              Dibuat: {formatDateTime(data.created_at)}
            </p>
            {data.updated_at !== data.created_at && (
              <p className="text-xs text-muted-foreground">
                Diperbarui: {formatDateTime(data.updated_at)}
              </p>
            )}
          </div>

          {/* Activity Log */}
          <div className="border-t pt-4">
            <p className="mb-3 text-xs font-medium text-muted-foreground">
              Aktivitas
            </p>

            {logsLoading ? (
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <Loader2 className="h-4 w-4 animate-spin" />
                Memuat aktivitas...
              </div>
            ) : logsError ? (
              <p className="text-sm text-red-500">
                Gagal memuat aktivitas arsip.
              </p>
            ) : logs && logs.length > 0 ? (
              <div className="space-y-3">
                {logs.map((log) => (
                  <div
                    key={log.id}
                    className="flex items-start gap-2 text-xs"
                  >
                    <div className="mt-0.5 h-1.5 w-1.5 shrink-0 rounded-full bg-zinc-300" />
                    <div>
                      <p className="text-zinc-700 dark:text-zinc-300">
                        <span className="font-medium">
                          {log.profiles?.name || 'System'}
                        </span>{' '}
                        melakukan{' '}
                        <span className="font-medium">
                          {getActionLabel(log.action)}
                        </span>
                      </p>
                      <p className="text-muted-foreground">
                        {formatDateTime(log.created_at)}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-sm text-muted-foreground">
                Belum ada aktivitas.
              </p>
            )}
          </div>
        </div>
      </SheetContent>
    </Sheet>
  );
}