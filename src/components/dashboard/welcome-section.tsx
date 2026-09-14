'use client';

type WelcomeSectionProps = {
  name: string;
  role: string;
  totalArchives?: number;
};

export default function WelcomeSection({
  name,
  role,
  totalArchives,
}: WelcomeSectionProps) {
  const today = new Date().toLocaleDateString('id-ID', {
    weekday: 'long',
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  });

  return (
    <div className="space-y-1">
      <h1 className="text-2xl font-semibold tracking-tight text-zinc-900 dark:text-zinc-100">
        Selamat datang kembali, {name}
      </h1>
      <p className="text-sm text-zinc-500 dark:text-zinc-400">{today}</p>
      {totalArchives !== undefined && (
        <p className="text-sm text-zinc-500 dark:text-zinc-400">
          {totalArchives} dokumen arsip tersedia
        </p>
      )}
    </div>
  );
}
