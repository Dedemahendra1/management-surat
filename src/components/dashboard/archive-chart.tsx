'use client';

type CategoryStat = {
  name: string;
  count: number;
};

const BAR_COLORS = [
  'bg-zinc-900 dark:bg-zinc-100',
  'bg-zinc-700 dark:bg-zinc-300',
  'bg-zinc-500 dark:bg-zinc-500',
  'bg-zinc-400 dark:bg-zinc-600',
  'bg-zinc-300 dark:bg-zinc-700',
];

export default function ArchiveChart({
  data,
}: {
  data: CategoryStat[];
}) {
  if (!data || data.length === 0) {
    return (
      <div className="flex h-40 items-center justify-center text-sm text-zinc-400">
        Belum ada data
      </div>
    );
  }

  const maxCount = Math.max(...data.map((d) => d.count), 1);

  return (
    <div className="space-y-3">
      {data.map((item, idx) => (
        <div key={item.name} className="space-y-1">
          <div className="flex items-center justify-between text-sm">
            <span className="text-zinc-700 dark:text-zinc-300">
              {item.name}
            </span>
            <span className="font-medium text-zinc-900 dark:text-zinc-100">
              {item.count}
            </span>
          </div>
          <div className="h-2 w-full overflow-hidden rounded-full bg-zinc-100 dark:bg-zinc-800">
            <div
              className={`h-full rounded-full transition-all duration-500 ${BAR_COLORS[idx % BAR_COLORS.length]}`}
              style={{ width: `${(item.count / maxCount) * 100}%` }}
            />
          </div>
        </div>
      ))}
    </div>
  );
}
