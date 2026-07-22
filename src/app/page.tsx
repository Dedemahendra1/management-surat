'use client'
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { useAuthStore } from "@/store/auth-store";
import { ArrowRight, ArrowUpRight, BookMarked, FileText, ShieldCheck } from "lucide-react";
import Link from "next/link";
  

export default function Home() {
   const profile = useAuthStore((state) => state.profile);
  return (
   <main className="relative flex min-h-screen items-center justify-center overflow-hidden bg-zinc-50 px-6 dark:bg-zinc-950">
      {/* Background blur */}
      <div className="absolute inset-0 -z-10">
        <div className="absolute left-1/2 top-0 h-[400px] w-[400px] -translate-x-1/2 rounded-full bg-zinc-200/40 blur-3xl dark:bg-zinc-800/30" />
      </div>

      <div className="flex w-full max-w-5xl flex-col items-center gap-10">
        {/* Hero */}
        <div className="flex flex-col items-center text-center">
          {/* Logo */}
          <div className="mb-5 flex h-16 w-16 items-center justify-center rounded-2xl border border-zinc-200 bg-white shadow-sm dark:border-zinc-800 dark:bg-zinc-900">
            <BookMarked className="size-7 text-zinc-700 dark:text-zinc-200" />
          </div>

          {/* Badge */}
          <div className="mb-4 rounded-full border border-zinc-200 bg-white px-3 py-1 text-xs font-medium text-zinc-500 shadow-sm dark:border-zinc-800 dark:bg-zinc-900 dark:text-zinc-400">
            Enterprise Archive Management
          </div>

          {/* Heading */}
          <h1 className="max-w-3xl text-4xl font-bold tracking-tight text-zinc-900 dark:text-zinc-100 md:text-5xl">
            Sistem Manajemen Arsip & Surat Digital
          </h1>
          {/* User info */}
         <div className="mt-6 flex items-center gap-3 rounded-2xl border border-zinc-200/80 bg-white/80 px-3 py-2 backdrop-blur-sm dark:border-zinc-800 dark:bg-zinc-900/80">
        {/* Avatar */}
        <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-zinc-900 text-sm font-semibold text-white dark:bg-zinc-100 dark:text-zinc-900">
          {profile.name?.charAt(0) || 'A'}
        </div>

        {/* User info */}
        <div className="flex flex-col leading-tight text-left">
          <span className="text-[11px] text-zinc-400 dark:text-zinc-500">
            Signed in as
          </span>

          <span className="text-sm font-medium text-zinc-900 dark:text-zinc-100">
            {profile.name || 'Administrator'}
          </span>
        </div>

        {/* Role badge */}
        <div className="ml-2 rounded-full border border-zinc-200 bg-zinc-50 px-2.5 py-1 text-[11px] font-medium text-zinc-500 dark:border-zinc-700 dark:bg-zinc-800 dark:text-zinc-400">
          {profile.role || 'Admin'}
        </div>
      </div>
          {/* CTA */}
          <div className="mt-8 flex items-center gap-3">
              <Link href="/admin">
                <Button 
                className="relative bg-gray-900 text-sm font-medium rounded-full h-12 p-1 ps-6 pe-14 group transition-all duration-500 hover:ps-14 hover:pe-6 w-fit overflow-hidden cursor-pointer">
                <span className="relative z-10 transition-all duration-500">
                  Masuk Dashboard
                </span>
                <div className="absolute right-1 w-10 h-10 bg-background text-foreground rounded-full flex items-center justify-center transition-all duration-500 group-hover:right-[calc(100%-44px)] group-hover:rotate-45">
                  <ArrowUpRight size={16} />
                </div>
              </Button>
              </Link>
            </div>
          </div>
        </div>
    </main>
  );
}