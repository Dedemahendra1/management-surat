import { ReactNode } from 'react';
import { Card } from '../ui/card';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '../ui/table';
import { Skeleton } from '../ui/skeleton';
import { FolderOpen } from 'lucide-react';
import { cn } from '@/lib/utils';
import PaginationDataTable from './pagination-data-table';
import { Label } from '../ui/label';
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectLabel,
  SelectTrigger,
  SelectValue,
} from '../ui/select';
import { LIMIT_LISTS } from '@/constant/data-table-constant';

// ─── Loading skeleton rows ────────────────────────────────────────────────────

function TableSkeleton({ cols }: { cols: number }) {
  return (
    <>
      {Array.from({ length: 5 }).map((_, rowIndex) => (
        <TableRow
          key={`skeleton-row-${rowIndex}`}
          className="border-zinc-100 dark:border-zinc-800/60"
        >
          {Array.from({ length: cols }).map((_, colIndex) => (
            <TableCell
              key={`skeleton-cell-${rowIndex}-${colIndex}`}
              className="px-5 py-3.5"
            >
              <Skeleton
                className={cn(
                  'h-4 rounded-md bg-zinc-100 dark:bg-zinc-800',
                  colIndex === 0 ? 'w-3/4' : 'w-1/2',
                  rowIndex % 2 === 0 ? 'opacity-80' : 'opacity-50'
                )}
              />
            </TableCell>
          ))}
        </TableRow>
      ))}
    </>
  );
}

// ─── Empty state ──────────────────────────────────────────────────────────────

function EmptyState({ cols }: { cols: number }) {
  return (
    <TableRow className="hover:bg-transparent">
      <TableCell colSpan={cols} className="h-64 text-center align-middle">
        <div className="flex flex-col items-center justify-center gap-3 py-10">
          <div className="flex h-14 w-14 items-center justify-center rounded-2xl border border-zinc-200 bg-zinc-50 dark:border-zinc-700/60 dark:bg-zinc-800/50">
            <FolderOpen
              className="size-6 text-zinc-400 dark:text-zinc-500"
              strokeWidth={1.5}
            />
          </div>
          <div className="flex flex-col gap-1">
            <p className="text-[13px] font-medium text-zinc-700 dark:text-zinc-300">
              Tidak ada data
            </p>
            <p className="text-[12px] text-zinc-400 dark:text-zinc-500">
              Belum ada dokumen yang tersedia saat ini
            </p>
          </div>
        </div>
      </TableCell>
    </TableRow>
  );
}

// ─── Main component ───────────────────────────────────────────────────────────

export default function DataTable({
  header,
  data,
  isLoading,
  totalPages,
  currentPage,
  onChangePage,
  currentLimit,
  onChangeLimit,
}: {
  header: string[];
  data: (string | ReactNode)[][];
  isLoading?: boolean;
  totalPages: number;
  currentPage: number;
  onChangePage: (page: number) => void;
  currentLimit: number;
  onChangeLimit: (limit: number) => void;
}) {
  const hasData = data?.length > 0;

  return (
    <div className="w-full flex flex-col gap-4">
      {/* ── Table card ── */}
      <Card
        className={cn(
          'overflow-hidden rounded-xl p-0',
          'border border-zinc-200 dark:border-zinc-800',
          'bg-white shadow-none dark:bg-zinc-950'
        )}
      >
        <div className="w-full overflow-x-auto">
          <Table className="w-full">
            {/* Header */}
            <TableHeader>
              <TableRow
                className={cn(
                  'border-b border-zinc-200 dark:border-zinc-800',
                  'bg-zinc-50/80 dark:bg-zinc-900/60',
                  'hover:bg-zinc-50/80 dark:hover:bg-zinc-900/60'
                )}
              >
                {header.map((column) => (
                  <TableHead
                    key={`th-${column}`}
                    className={cn(
                      'px-5 py-3 whitespace-nowrap',
                      'text-[11px] font-semibold uppercase tracking-wider',
                      'text-zinc-500 dark:text-zinc-400'
                    )}
                  >
                    {column}
                  </TableHead>
                ))}
              </TableRow>
            </TableHeader>

            {/* Body */}
            <TableBody>
              {/* Loading */}
              {isLoading && <TableSkeleton cols={header.length} />}

              {/* Empty */}
              {!isLoading && !hasData && (
                <EmptyState cols={header.length} />
              )}

              {/* Rows */}
              {!isLoading &&
                hasData &&
                data.map((row, rowIndex) => (
                  <TableRow
                    key={`tr-${rowIndex}`}
                    className={cn(
                      'border-b border-zinc-100 last:border-0 dark:border-zinc-800/60',
                      'transition-colors duration-100',
                      'hover:bg-zinc-50 dark:hover:bg-zinc-900/50',
                      rowIndex % 2 === 0
                        ? 'bg-white dark:bg-zinc-950'
                        : 'bg-zinc-50/40 dark:bg-zinc-900/20'
                    )}
                  >
                    {row.map((column, columnIndex) => (
                      <TableCell
                        key={`tc-${rowIndex}-${columnIndex}`}
                        className={cn(
                          'px-5 py-3.5 whitespace-nowrap',
                          'text-[13px] text-zinc-700 dark:text-zinc-300',
                          columnIndex === 0 &&
                            'font-medium text-zinc-900 dark:text-zinc-100'
                        )}
                      >
                        {column}
                      </TableCell>
                    ))}
                  </TableRow>
                ))}
            </TableBody>
          </Table>
        </div>
      </Card>

      {/* ── Footer: limit + pagination ── */}
      <div className="flex items-center justify-between gap-3">
        {/* Rows per page */}
        <div className="flex items-center gap-2.5">
          <Label className="shrink-0 text-[12px] text-zinc-500 dark:text-zinc-400">
            Baris per halaman
          </Label>
          <Select
            value={currentLimit.toString()}
            onValueChange={(value) => onChangeLimit(Number(value))}
          >
            <SelectTrigger
              className={cn(
                'h-8 w-[72px] rounded-lg text-[12px]',
                'border-zinc-200 bg-white dark:border-zinc-800 dark:bg-zinc-900',
                'text-zinc-700 dark:text-zinc-300',
                'focus:ring-1 focus:ring-zinc-300 dark:focus:ring-zinc-700'
              )}
            >
            <SelectValue placeholder="Limit" />
            </SelectTrigger>
            <SelectContent className="rounded-xl border-zinc-200 dark:border-zinc-800 dark:bg-zinc-900">
              <SelectGroup>
                <SelectLabel className="text-[11px] uppercase tracking-wider text-zinc-400 dark:text-zinc-500">
                  Limit
                </SelectLabel>
                {LIMIT_LISTS.map((limit) => (
                  <SelectItem
                    key={limit}
                    value={limit.toString()}
                    className="text-[13px] text-zinc-700 dark:text-zinc-300"
                  >
                    {limit}
                  </SelectItem>
                ))}
              </SelectGroup>
            </SelectContent>
          </Select>
        </div>

        {/* Pagination — tampil jika lebih dari 1 halaman */}
        {totalPages > 1 && (
          <PaginationDataTable
            currentPage={currentPage}
            onChangePage={onChangePage}
            totalPages={totalPages}
          />
        )}
      </div>
    </div>
  );
}