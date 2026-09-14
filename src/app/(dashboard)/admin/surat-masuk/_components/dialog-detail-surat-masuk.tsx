'use client';

import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
} from '@/components/ui/sheet';
import { Button } from '@/components/ui/button';
import { SuratMasuk, SuratKeluar } from '@/types/surat';
import { SURAT_MASUK_STATUS_LIST, SURAT_KELUAR_STATUS_LIST } from '@/constant/surat-constant';
import { useQuery } from '@tanstack/react-query';
import { createClient } from '@/lib/supabase/client';
import { cn } from '@/lib/utils';
import { formatDate, formatDateTime, formatFileSize } from '@/lib/format';
import {
  Download,
  FileText,
  Calendar,
  Hash,
  MapPin,
  Mail,
  Link as LinkIcon,
  StickyNote,
  Loader2,
} from 'lucide-react';
import Link from 'next/link';

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

function getKeluarStatusLabel(status: string): string {
  const found = SURAT_KELUAR_STATUS_LIST.find((s) => s.value === status);
  return found?.label || status;
}

function getKeluarStatusColor(status: string): string {
  switch (status) {
    case 'dibuat':
      return 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300';
    case 'disetujui':
      return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-300';
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

export default function DialogDetailSuratMasuk({
  open,
  onOpenChange,
  data,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  data?: SuratMasuk;
}) {
  const supabase = createClient();

  const {
    data: suratKeluarList,
    isLoading: relatedLoading,
    isError: relatedError,
  } = useQuery({
    queryKey: ['surat-keluar-related', data?.id],
    queryFn: async () => {
      if (!data?.id) return [];
      const result = await supabase
        .from('surat_keluar')
        .select('*')
        .eq('surat_masuk_id', data.id)
        .eq('is_deleted', false)
        .order('created_at', { ascending: false });
      return (result.data || []) as SuratKeluar[];
    },
    enabled: open && !!data?.id,
  });

  if (!data) return null;

  const isImage = data.file_name?.match(/\.(jpg|jpeg|png)$/i);
  const hasPhysicalArchive =
    data.lokasi_lemari ||
    data.lokasi_rak ||
    data.lokasi_map ||
    data.lokasi_box;

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent className="w-full overflow-y-auto sm:max-w-[520px]">
        <SheetHeader>
          <div className="flex flex-wrap items-center justify-between gap-2 pr-8">
            <SheetTitle className="max-w-[85%] flex-1">
              <span className="line-clamp-2">{data.nomor}</span>
            </SheetTitle>
            <span
              className={cn(
                'inline-flex items-center rounded-full px-2.5 py-1 text-xs font-medium',
                getStatusColor(data.status),
              )}
            >
              {getStatusLabel(data.status)}
            </span>
          </div>
          <SheetDescription>
            {data.perihal ? `Perihal: ${data.perihal}` : 'Surat masuk'}
          </SheetDescription>
        </SheetHeader>

        <div className="space-y-6 px-4 pb-6">
          {/* Info Surat */}
          <div className="space-y-4">
            <InfoRow icon={Hash} label="Nomor Surat">
              {data.nomor}
            </InfoRow>

            {data.tanggal && (
              <InfoRow icon={Calendar} label="Tanggal Surat">
                {formatDate(data.tanggal)}
              </InfoRow>
            )}

            {data.asal_surat && (
              <InfoRow icon={Mail} label="Asal Surat">
                {data.asal_surat}
              </InfoRow>
            )}

            {data.disposisi && (
              <InfoRow icon={StickyNote} label="Disposisi">
                {data.disposisi}
              </InfoRow>
            )}

            {data.keterangan && (
              <InfoRow icon={FileText} label="Keterangan">
                {data.keterangan}
              </InfoRow>
            )}
          </div>

          {/* File Section */}
          <div className="border-t pt-4">
            <div className="flex items-center gap-2 mb-3">
              <FileText className="h-4 w-4 text-muted-foreground" />
              <p className="text-xs font-medium text-muted-foreground">Dokumen</p>
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

          {/* Arsip Fisik */}
          {hasPhysicalArchive && (
            <div className="border-t pt-4">
              <div className="flex items-center gap-2 mb-3">
                <MapPin className="h-4 w-4 text-muted-foreground" />
                <p className="text-xs font-medium text-muted-foreground">
                  Lokasi Arsip Fisik
                </p>
              </div>
              <div className="grid grid-cols-2 gap-2 text-sm">
                {data.lokasi_lemari && (
                  <div className="rounded-lg border p-2">
                    <p className="text-xs text-muted-foreground">Lemari</p>
                    <p className="font-medium">{data.lokasi_lemari}</p>
                  </div>
                )}
                {data.lokasi_rak && (
                  <div className="rounded-lg border p-2">
                    <p className="text-xs text-muted-foreground">Rak</p>
                    <p className="font-medium">{data.lokasi_rak}</p>
                  </div>
                )}
                {data.lokasi_map && (
                  <div className="rounded-lg border p-2">
                    <p className="text-xs text-muted-foreground">Map</p>
                    <p className="font-medium">{data.lokasi_map}</p>
                  </div>
                )}
                {data.lokasi_box && (
                  <div className="rounded-lg border p-2">
                    <p className="text-xs text-muted-foreground">Box</p>
                    <p className="font-medium">{data.lokasi_box}</p>
                  </div>
                )}
              </div>
              {data.keterangan_fisik && (
                <p className="mt-2 text-sm text-muted-foreground">
                  {data.keterangan_fisik}
                </p>
              )}
            </div>
          )}

          {/* Surat Keluar Terkait */}
          <div className="border-t pt-4">
            <div className="flex items-center gap-2 mb-3">
              <Mail className="h-4 w-4 text-muted-foreground" />
              <p className="text-xs font-medium text-muted-foreground">
                Surat Keluar Terkait
              </p>
            </div>

            {relatedLoading ? (
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <Loader2 className="h-4 w-4 animate-spin" />
                Memuat surat keluar terkait...
              </div>
            ) : relatedError ? (
              <p className="text-sm text-red-500">
                Gagal memuat surat keluar terkait.
              </p>
            ) : suratKeluarList && suratKeluarList.length > 0 ? (
              <div className="space-y-2">
                {suratKeluarList.map((sk) => (
                  <div
                    key={sk.id}
                    className="flex items-start justify-between gap-2 rounded-lg border p-3"
                  >
                    <div className="min-w-0 flex-1">
                      <div className="flex flex-wrap items-center gap-2">
                        <p className="text-sm font-medium truncate">
                          {sk.nomor}
                        </p>
                        <span
                          className={cn(
                            'inline-flex shrink-0 items-center rounded-full px-2 py-0.5 text-[10px] font-medium',
                            getKeluarStatusColor(sk.status),
                          )}
                        >
                          {getKeluarStatusLabel(sk.status)}
                        </span>
                      </div>
                      <p className="text-xs text-muted-foreground truncate">
                        {sk.perihal}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        {formatDate(sk.tanggal)} • {sk.tujuan || '-'}
                      </p>
                    </div>
                    <Link href={`/admin/surat-keluar`}>
                      <Button variant="ghost" size="sm">
                        <LinkIcon className="h-4 w-4" />
                      </Button>
                    </Link>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-sm text-muted-foreground">
                Belum ada surat keluar terkait.
              </p>
            )}
          </div>

          {/* Metadata */}
          <div className="border-t pt-4 space-y-1">
            <p className="text-xs text-muted-foreground">
              Dibuat oleh:{' '}
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
        </div>
      </SheetContent>
    </Sheet>
  );
}