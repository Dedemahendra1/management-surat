'use client';

import { useAuthStore } from '@/store/auth-store';
import { createClient } from '@/lib/supabase/client';
import { useQuery } from '@tanstack/react-query';
import {
  FileArchive,
  Users,
  Search,
  Eye,
  Download,
  ArrowUpRight,
  FileText,
  Inbox,
  Send,
} from 'lucide-react';
import Link from 'next/link';
import { Archive, ArchiveLog } from '@/types/archive';
import { Profile } from '@/types/auth';
import { SuratMasuk, SuratKeluar } from '@/types/surat';
import StatCard from '@/components/dashboard/stat-card';
import WelcomeSection from '@/components/dashboard/welcome-section';
import RecentActivity from '@/components/dashboard/recent-activity';
import ArchiveChart from '@/components/dashboard/archive-chart';
import RecentSurat from '@/components/dashboard/recent-surat';

function formatDate(date?: string | null): string {
  if (!date) return '-';
  return new Date(date).toLocaleDateString('id-ID', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  });
}

export default function AdminDashboardPage() {
  const profile = useAuthStore((state) => state.profile);
  const role = profile?.role?.toLowerCase() || '';
  const name = profile?.name || (role === 'pimpinan' ? 'Pimpinan' : 'Admin');
  const supabase = createClient();

  const { data: archiveCount } = useQuery({
    queryKey: ['dashboard-archive-count'],
    queryFn: async () => {
      const { count } = await supabase
        .from('archives')
        .select('*', { count: 'exact', head: true })
        .eq('is_deleted', false);
      return count || 0;
    },
  });

  const { data: thisMonthCount } = useQuery({
    queryKey: ['dashboard-month-count'],
    queryFn: async () => {
      const start = new Date();
      start.setDate(1);
      start.setHours(0, 0, 0, 0);
      const { count } = await supabase
        .from('archives')
        .select('*', { count: 'exact', head: true })
        .eq('is_deleted', false)
        .gte('created_at', start.toISOString());
      return count || 0;
    },
  });

  const { data: categoryCount } = useQuery({
    queryKey: ['dashboard-category-count'],
    queryFn: async () => {
      const { count } = await supabase
        .from('archive_categories')
        .select('*', { count: 'exact', head: true });
      return count || 0;
    },
  });

  const { data: userCount } = useQuery({
    queryKey: ['dashboard-user-count'],
    queryFn: async () => {
      const { count } = await supabase
        .from('profiles')
        .select('*', { count: 'exact', head: true });
      return count || 0;
    },
  });

  const { data: suratMasukCount } = useQuery({
    queryKey: ['dashboard-surat-masuk-count'],
    queryFn: async () => {
      const { count } = await supabase
        .from('surat_masuk')
        .select('*', { count: 'exact', head: true })
        .eq('is_deleted', false);
      return count || 0;
    },
  });

  const { data: suratKeluarCount } = useQuery({
    queryKey: ['dashboard-surat-keluar-count'],
    queryFn: async () => {
      const { count } = await supabase
        .from('surat_keluar')
        .select('*', { count: 'exact', head: true })
        .eq('is_deleted', false);
      return count || 0;
    },
  });

  const { data: recentSuratMasuk } = useQuery({
    queryKey: ['dashboard-recent-surat-masuk'],
    queryFn: async () => {
      const result = await supabase
        .from('surat_masuk')
        .select('*')
        .eq('is_deleted', false)
        .order('created_at', { ascending: false })
        .limit(5);
      return (result.data || []) as SuratMasuk[];
    },
  });

  const { data: recentSuratKeluar } = useQuery({
    queryKey: ['dashboard-recent-surat-keluar'],
    queryFn: async () => {
      const result = await supabase
        .from('surat_keluar')
        .select('*')
        .eq('is_deleted', false)
        .order('created_at', { ascending: false })
        .limit(5);
      return (result.data || []) as SuratKeluar[];
    },
  });

  const { data: recentArchives } = useQuery({
    queryKey: ['dashboard-recent-archives'],
    queryFn: async () => {
      const result = await supabase
        .from('archives')
        .select('*, category:archive_categories(name, color), profiles(name)')
        .eq('is_deleted', false)
        .order('created_at', { ascending: false })
        .limit(5);
      return (result.data || []) as (Archive & {
        profiles?: { name?: string };
      })[];
    },
  });

  const { data: categoryDistribution } = useQuery({
    queryKey: ['dashboard-category-dist'],
    queryFn: async () => {
      const result = await supabase
        .from('archives')
        .select('category:archive_categories(name)')
        .eq('is_deleted', false);
      const rows = result.data || [];
      const map = new Map<string, number>();
      for (const row of rows) {
        const name = (row as { category?: { name?: string } }).category
          ?.name;
        if (name) map.set(name, (map.get(name) || 0) + 1);
      }
      return Array.from(map.entries()).map(([name, count]) => ({
        name,
        count,
      }));
    },
  });

  const { data: recentLogs } = useQuery({
    queryKey: ['dashboard-recent-logs'],
    queryFn: async () => {
      const result = await supabase
        .from('archive_logs')
        .select('*, profiles(name)')
        .order('created_at', { ascending: false })
        .limit(10);
      return (result.data || []) as (ArchiveLog & {
        profiles?: { name?: string };
      })[];
    },
  });

  const { data: pendingSuratKeluar } = useQuery({
    queryKey: ['dashboard-pending-surat-keluar'],
    queryFn: async () => {
      const result = await supabase
        .from('surat_keluar')
        .select('*')
        .eq('is_deleted', false)
        .eq('status', 'dibuat')
        .order('created_at', { ascending: false })
        .limit(5);
      return (result.data || []) as SuratKeluar[];
    },
  });

  /* ── Pimpinan Dashboard ── */
  if (role === 'pimpinan') {
    return (
      <div className="mx-auto w-full max-w-5xl space-y-8">
        <WelcomeSection
          name={name}
          role="Pimpinan"
          totalArchives={archiveCount}
        />

        {/* Search */}
        <div className="relative">
          <Search className="absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-zinc-400" />
          <Link href="/admin/archive">
            <div className="flex h-14 w-full items-center rounded-xl border border-zinc-200 bg-white pl-12 pr-4 text-sm text-zinc-400 shadow-sm transition-colors hover:border-zinc-300 dark:border-zinc-800 dark:bg-zinc-900 dark:text-zinc-500 dark:hover:border-zinc-700">
              Cari nama dokumen atau kategori...
              <kbd className="ml-auto hidden rounded-md border border-zinc-200 bg-zinc-50 px-2 py-0.5 text-xs text-zinc-400 md:inline-block dark:border-zinc-700 dark:bg-zinc-800 dark:text-zinc-500">
                Enter
              </kbd>
            </div>
          </Link>
        </div>

        {/* Latest Archives */}
        <section>
          <div className="mb-4 flex items-center justify-between">
            <h2 className="text-lg font-semibold text-zinc-900 dark:text-zinc-100">
              Arsip Terbaru
            </h2>
            <Link
              href="/admin/archive"
              className="flex items-center gap-1 text-sm font-medium text-zinc-500 hover:text-zinc-900 dark:text-zinc-400 dark:hover:text-zinc-100"
            >
              Lihat Semua
              <ArrowUpRight className="h-3.5 w-3.5" />
            </Link>
          </div>

          <div className="overflow-hidden rounded-xl border border-zinc-200 dark:border-zinc-800">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-zinc-100 bg-zinc-50 dark:border-zinc-800 dark:bg-zinc-900/50">
                  <th className="px-4 py-3 text-left font-medium text-zinc-500 dark:text-zinc-400">
                    Nama Dokumen
                  </th>
                  <th className="px-4 py-3 text-left font-medium text-zinc-500 dark:text-zinc-400">
                    Kategori
                  </th>
                  <th className="hidden px-4 py-3 text-left font-medium text-zinc-500 dark:text-zinc-400 md:table-cell">
                    Tanggal
                  </th>
                  <th className="px-4 py-3 text-right font-medium text-zinc-500 dark:text-zinc-400">
                    Aksi
                  </th>
                </tr>
              </thead>
              <tbody>
                {(!recentArchives || recentArchives.length === 0) && (
                  <tr>
                    <td
                      colSpan={4}
                      className="px-4 py-8 text-center text-sm text-zinc-400"
                    >
                      Belum ada arsip
                    </td>
                  </tr>
                )}
                {recentArchives?.map((archive) => (
                  <tr
                    key={archive.id}
                    className="border-b border-zinc-100 last:border-0 dark:border-zinc-800"
                  >
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-3">
                        <FileText className="h-4 w-4 shrink-0 text-zinc-400" />
                        <span className="font-medium text-zinc-900 dark:text-zinc-100">
                          {archive.title}
                        </span>
                      </div>
                    </td>
                    <td className="px-4 py-3 text-zinc-500 dark:text-zinc-400">
                      {archive.category?.name || '-'}
                    </td>
                    <td className="hidden px-4 py-3 text-zinc-500 md:table-cell dark:text-zinc-400">
                      {formatDate(archive.date || archive.created_at)}
                    </td>
                    <td className="px-4 py-3 text-right">
                      <div className="flex items-center justify-end gap-1">
                        <Link
                          href={`/admin/archive`}
                          className="inline-flex h-8 w-8 items-center justify-center rounded-lg text-zinc-400 hover:bg-zinc-100 hover:text-zinc-600 dark:hover:bg-zinc-800 dark:hover:text-zinc-300"
                        >
                          <Eye className="h-4 w-4" />
                        </Link>
                        {archive.file_url && (
                          <a
                            href={archive.file_url}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="inline-flex h-8 w-8 items-center justify-center rounded-lg text-zinc-400 hover:bg-zinc-100 hover:text-zinc-600 dark:hover:bg-zinc-800 dark:hover:text-zinc-300"
                          >
                            <Download className="h-4 w-4" />
                          </a>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>

        {/* Summary */}
        <section className="grid gap-4 sm:grid-cols-3">
          <StatCard
            label="Surat Masuk"
            value={suratMasukCount ?? '-'}
            icon={<Inbox className="h-4 w-4" />}
          />
          <StatCard
            label="Surat Keluar"
            value={suratKeluarCount ?? '-'}
            icon={<Send className="h-4 w-4" />}
          />
          <StatCard
            label="Total Arsip"
            value={archiveCount ?? '-'}
            icon={<FileArchive className="h-4 w-4" />}
          />
        </section>

        {/* Menunggu Persetujuan */}
        <section>
          <div className="mb-4 flex items-center justify-between">
            <h2 className="text-lg font-semibold text-zinc-900 dark:text-zinc-100">
              Menunggu Persetujuan
            </h2>
            <Link
              href="/admin/surat-keluar"
              className="flex items-center gap-1 text-sm font-medium text-zinc-500 hover:text-zinc-900 dark:text-zinc-400 dark:hover:text-zinc-100"
            >
              Lihat Semua
              <ArrowUpRight className="h-3.5 w-3.5" />
            </Link>
          </div>

          <div className="overflow-hidden rounded-xl border border-zinc-200 dark:border-zinc-800">
            {(!pendingSuratKeluar || pendingSuratKeluar.length === 0) ? (
              <p className="px-4 py-8 text-center text-sm text-zinc-400">
                Tidak ada surat keluar yang menunggu persetujuan.
              </p>
            ) : (
              <div className="divide-y divide-zinc-100 dark:divide-zinc-800">
                {pendingSuratKeluar.map((sk) => (
                  <div
                    key={sk.id}
                    className="flex items-center gap-3 px-4 py-3"
                  >
                    <div className="min-w-0 flex-1">
                      <p className="truncate text-sm font-medium text-zinc-900 dark:text-zinc-100">
                        {sk.nomor}
                      </p>
                      <p className="truncate text-xs text-zinc-500 dark:text-zinc-400">
                        {sk.perihal}
                      </p>
                      <p className="truncate text-xs text-zinc-400 dark:text-zinc-500">
                        {sk.tujuan || '-'}
                      </p>
                    </div>
                    <div className="flex shrink-0 items-center gap-1">
                      <a
                        href={`/admin/surat-keluar`}
                        className="inline-flex h-8 w-8 items-center justify-center rounded-lg text-zinc-400 hover:bg-zinc-100 hover:text-zinc-600 dark:hover:bg-zinc-800 dark:hover:text-zinc-300"
                      >
                        <Eye className="h-4 w-4" />
                      </a>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </section>

        {/* Recent Surat */}
        <section className="grid gap-4 sm:grid-cols-2">
          <RecentSurat
            type="masuk"
            data={(recentSuratMasuk || []).map((s) => ({
              id: s.id,
              nomor: s.nomor,
              tanggal: s.tanggal,
              perihal: s.perihal,
              status: s.status,
              counterpart: s.asal_surat,
            }))}
          />
          <RecentSurat
            type="keluar"
            data={(recentSuratKeluar || []).map((s) => ({
              id: s.id,
              nomor: s.nomor,
              tanggal: s.tanggal,
              perihal: s.perihal,
              status: s.status,
              counterpart: s.tujuan,
            }))}
          />
        </section>
      </div>
    );
  }

  /* ── Admin Dashboard ── */
  return (
    <div className="mx-auto w-full max-w-5xl space-y-8">
      {/* Section 1: Welcome */}
      <WelcomeSection name={name} role="Admin" totalArchives={archiveCount} />

      {/* Section 2: Summary Cards */}
      <section className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard
          label="Surat Masuk"
          value={suratMasukCount ?? '-'}
          icon={<Inbox className="h-4 w-4" />}
        />
        <StatCard
          label="Surat Keluar"
          value={suratKeluarCount ?? '-'}
          icon={<Send className="h-4 w-4" />}
        />
        <StatCard
          label="Total Arsip"
          value={archiveCount ?? '-'}
          icon={<FileArchive className="h-4 w-4" />}
          trend={
            thisMonthCount && thisMonthCount > 0
              ? {
                  value: `${thisMonthCount} baru bulan ini`,
                  positive: true,
                }
              : undefined
          }
        />
        <StatCard
          label="User"
          value={userCount ?? '-'}
          icon={<Users className="h-4 w-4" />}
        />
      </section>

      {/* Section 2b: Recent Surat Masuk & Keluar */}
      <section className="grid gap-6 lg:grid-cols-2">
        <RecentSurat
          type="masuk"
          data={(recentSuratMasuk || []).map((s) => ({
            id: s.id,
            nomor: s.nomor,
            tanggal: s.tanggal,
            perihal: s.perihal,
            status: s.status,
            counterpart: s.asal_surat,
          }))}
        />
        <RecentSurat
          type="keluar"
          data={(recentSuratKeluar || []).map((s) => ({
            id: s.id,
            nomor: s.nomor,
            tanggal: s.tanggal,
            perihal: s.perihal,
            status: s.status,
            counterpart: s.tujuan,
          }))}
        />
      </section>

      {/* Section 3: Recent Archives + Activity */}
      <section className="grid gap-6 lg:grid-cols-3">
        {/* Archives Table */}
        <div className="lg:col-span-2">
          <div className="mb-4 flex items-center justify-between">
            <h2 className="text-lg font-semibold text-zinc-900 dark:text-zinc-100">
              Arsip Terbaru
            </h2>
            <Link
              href="/admin/archive"
              className="flex items-center gap-1 text-sm font-medium text-zinc-500 hover:text-zinc-900 dark:text-zinc-400 dark:hover:text-zinc-100"
            >
              Lihat Semua
              <ArrowUpRight className="h-3.5 w-3.5" />
            </Link>
          </div>

          <div className="overflow-hidden rounded-xl border border-zinc-200 dark:border-zinc-800">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-zinc-100 bg-zinc-50 dark:border-zinc-800 dark:bg-zinc-900/50">
                  <th className="px-4 py-3 text-left font-medium text-zinc-500 dark:text-zinc-400">
                    Nama Arsip
                  </th>
                  <th className="hidden px-4 py-3 text-left font-medium text-zinc-500 dark:text-zinc-400 sm:table-cell">
                    Kategori
                  </th>
                  <th className="hidden px-4 py-3 text-left font-medium text-zinc-500 dark:text-zinc-400 md:table-cell">
                    Pengunggah
                  </th>
                  <th className="hidden px-4 py-3 text-left font-medium text-zinc-500 dark:text-zinc-400 md:table-cell">
                    Tanggal
                  </th>
                  <th className="px-4 py-3 text-right font-medium text-zinc-500 dark:text-zinc-400">
                    Aksi
                  </th>
                </tr>
              </thead>
              <tbody>
                {(!recentArchives || recentArchives.length === 0) && (
                  <tr>
                    <td
                      colSpan={5}
                      className="px-4 py-8 text-center text-sm text-zinc-400"
                    >
                      Belum ada arsip
                    </td>
                  </tr>
                )}
                {recentArchives?.map((archive) => (
                  <tr
                    key={archive.id}
                    className="border-b border-zinc-100 last:border-0 dark:border-zinc-800"
                  >
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-3">
                        <FileText className="h-4 w-4 shrink-0 text-zinc-400" />
                        <span className="font-medium text-zinc-900 dark:text-zinc-100">
                          {archive.title}
                        </span>
                      </div>
                    </td>
                    <td className="hidden px-4 py-3 text-zinc-500 sm:table-cell dark:text-zinc-400">
                      {archive.category?.name || '-'}
                    </td>
                    <td className="hidden px-4 py-3 text-zinc-500 md:table-cell dark:text-zinc-400">
                      {(archive as Archive & { profiles?: { name?: string } })
                        .profiles?.name || '-'}
                    </td>
                    <td className="hidden px-4 py-3 text-zinc-500 md:table-cell dark:text-zinc-400">
                      {formatDate(archive.created_at)}
                    </td>
                    <td className="px-4 py-3 text-right">
                      <Link
                        href="/admin/archive"
                        className="inline-flex h-8 w-8 items-center justify-center rounded-lg text-zinc-400 hover:bg-zinc-100 hover:text-zinc-600 dark:hover:bg-zinc-800 dark:hover:text-zinc-300"
                      >
                        <Eye className="h-4 w-4" />
                      </Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Recent Activity */}
        <div>
          <h2 className="mb-4 text-lg font-semibold text-zinc-900 dark:text-zinc-100">
            Aktivitas Terbaru
          </h2>
          <div className="rounded-xl border border-zinc-200 dark:border-zinc-800">
            <RecentActivity logs={recentLogs || []} />
          </div>
        </div>
      </section>

      {/* Section 4: Archive Statistics */}
      <section className="grid gap-6 lg:grid-cols-2">
        <div>
          <h2 className="mb-4 text-lg font-semibold text-zinc-900 dark:text-zinc-100">
            Arsip per Kategori
          </h2>
          <div className="rounded-xl border border-zinc-200 p-4 dark:border-zinc-800">
            <ArchiveChart data={categoryDistribution || []} />
          </div>
        </div>

        <div className="space-y-4">
          <h2 className="text-lg font-semibold text-zinc-900 dark:text-zinc-100">
            Ringkasan
          </h2>
          <div className="rounded-xl border border-zinc-200 p-4 dark:border-zinc-800">
            <div className="space-y-4">
              <div className="flex items-center justify-between text-sm">
                <span className="text-zinc-500 dark:text-zinc-400">
                  Surat Masuk
                </span>
                <span className="font-semibold text-zinc-900 dark:text-zinc-100">
                  {suratMasukCount ?? '-'}
                </span>
              </div>
              <div className="h-px bg-zinc-100 dark:bg-zinc-800" />
              <div className="flex items-center justify-between text-sm">
                <span className="text-zinc-500 dark:text-zinc-400">
                  Surat Keluar
                </span>
                <span className="font-semibold text-zinc-900 dark:text-zinc-100">
                  {suratKeluarCount ?? '-'}
                </span>
              </div>
              <div className="h-px bg-zinc-100 dark:bg-zinc-800" />
              <div className="flex items-center justify-between text-sm">
                <span className="text-zinc-500 dark:text-zinc-400">
                  Total Arsip
                </span>
                <span className="font-semibold text-zinc-900 dark:text-zinc-100">
                  {archiveCount ?? '-'}
                </span>
              </div>
              <div className="h-px bg-zinc-100 dark:bg-zinc-800" />
              <div className="flex items-center justify-between text-sm">
                <span className="text-zinc-500 dark:text-zinc-400">
                  Upload Bulan Ini
                </span>
                <span className="font-semibold text-zinc-900 dark:text-zinc-100">
                  {thisMonthCount ?? '-'}
                </span>
              </div>
              <div className="h-px bg-zinc-100 dark:bg-zinc-800" />
              <div className="flex items-center justify-between text-sm">
                <span className="text-zinc-500 dark:text-zinc-400">
                  Kategori
                </span>
                <span className="font-semibold text-zinc-900 dark:text-zinc-100">
                  {categoryCount ?? '-'}
                </span>
              </div>
              <div className="h-px bg-zinc-100 dark:bg-zinc-800" />
              <div className="flex items-center justify-between text-sm">
                <span className="text-zinc-500 dark:text-zinc-400">
                  User Terdaftar
                </span>
                <span className="font-semibold text-zinc-900 dark:text-zinc-100">
                  {userCount ?? '-'}
                </span>
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
