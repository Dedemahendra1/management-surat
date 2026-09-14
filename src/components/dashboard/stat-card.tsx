'use client';

import { cn } from '@/lib/utils';
import { ReactNode } from 'react';

type StatCardProps = {
  label: string;
  value: string | number;
  icon: ReactNode;
  trend?: { value: string; positive: boolean };
};

export default function StatCard({ label, value, icon, trend }: StatCardProps) {
  return (
    <div className="rounded-xl border border-zinc-200 bg-white p-4 dark:border-zinc-800 dark:bg-zinc-900">
      <div className="flex items-start justify-between">
        <div className="space-y-1">
          <p className="text-xs font-medium text-zinc-500 dark:text-zinc-400">
            {label}
          </p>
          <p className="text-2xl font-semibold tracking-tight text-zinc-900 dark:text-zinc-100">
            {value}
          </p>
          {trend && (
            <p
              className={cn(
                'text-xs',
                trend.positive
                  ? 'text-emerald-600 dark:text-emerald-400'
                  : 'text-red-600 dark:text-red-400',
              )}
            >
              {trend.value}
            </p>
          )}
        </div>
        <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-zinc-100 text-zinc-600 dark:bg-zinc-800 dark:text-zinc-400">
          {icon}
        </div>
      </div>
    </div>
  );
}
