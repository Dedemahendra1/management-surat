import { ModeToggle } from '@/components/common/darkmode-toggle';
import Image from 'next/image';

import { ReactNode } from 'react';

type AuthLayoutProps = {
  children: ReactNode;
};

export default function AuthLayout({ children }: AuthLayoutProps) {
  return (
    <div className="relative bg-muted flex min-h-svh flex-col items-center justify-center gap-6 p-6 md:p-10">
      <div className="absolute top-4 right-4">
        <ModeToggle />
      </div>
      <div className="flex w-full max-w-sm flex-col gap-6">
        <div className="flex flex-col items-center self-center text-center">
          <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-white shadow-sm ring-1 ring-zinc-200 dark:ring-zinc-700">
            <Image
              src="/branding/logo-dispora-medan.gif"
              alt="Logo Dinas Pemuda dan Olahraga Kota Medan"
              width={200}
              height={200}
              className="h-12 w-12 object-contain"
              priority
            />
          </div>
          <div className="mt-2 leading-tight">
            <p className="text-sm font-semibold text-foreground">
              Dinas Pemuda dan Olahraga
            </p>
            <p className="mt-0.5 text-xs text-muted-foreground">
              Pemerintah Kota Medan
            </p>
          </div>
        </div>
        {children}
      </div>
    </div>
  );
}
