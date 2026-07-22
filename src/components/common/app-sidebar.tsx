'use client';

import {
  EllipsisVertical,
  LogOut,
  BookMarked,
  Settings,
  User,
} from 'lucide-react';

import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  useSidebar,
} from '../ui/sidebar';

import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '../ui/dropdown-menu';

import { Avatar, AvatarFallback, AvatarImage } from '../ui/avatar';

import { cn } from '@/lib/utils';
import { usePathname } from 'next/navigation';
import { useAuthStore } from '@/store/auth-store';

import {
  SIDEBAR_MENU_LIST,
  SidebarMenuKey,
} from '@/constant/sidebar-constant';
import { signOut } from '@/actions/auth-actions';

// ─── Helpers ──────────────────────────────────────────────────────────────────

function getInitials(name: string): string {
  return name
    .split(' ')
    .slice(0, 2)
    .map((w) => w[0])
    .join('')
    .toUpperCase();
}

// ─── Logo / Brand mark ───────────────────────────────────────────────────────

function BrandMark() {
  return (
    <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-zinc-900 dark:bg-zinc-100">
      <BookMarked
        className="size-4 text-white dark:text-zinc-900"
        strokeWidth={2}
      />
    </div>
  );
}

// ─── Main component ───────────────────────────────────────────────────────────

export default function AppSidebar() {
  const { isMobile } = useSidebar();
  const pathname = usePathname();
  const profile = useAuthStore((state) => state.profile);
  const role = (profile?.role?.toLowerCase?.() || 'admin') as SidebarMenuKey;

const menuList = SIDEBAR_MENU_LIST[role] || [];

const userName = profile?.name || '';
const userRole = profile?.role || '';
const userAvatar =
  profile?.avatar_url ||'';


  return (
    <Sidebar
      className="border-r border-zinc-200 bg-white dark:border-zinc-800 dark:bg-zinc-950"
    >
      {/* ── Header ── */}
      <SidebarHeader className="border-b border-zinc-100 px-3 py-3 dark:border-zinc-800/80">
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton
              size="lg"
              asChild
              className="cursor-default hover:bg-transparent active:bg-transparent"
            >
              <div className="flex items-center gap-3">
                <BrandMark />

                {/* Visible only when sidebar is expanded */}
                <div className="flex min-w-0 flex-col leading-none">
                  <span className="truncate text-[13px] font-semibold tracking-tight text-zinc-900 dark:text-zinc-100">
                    ArsipKu
                  </span>
                  <span className="mt-0.5 truncate text-[10px] text-zinc-400 dark:text-zinc-500">
                    Manajemen Surat &amp; Arsip
                  </span>
                </div>
              </div>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarHeader>

      {/* ── Content / Navigation ── */}
      <SidebarContent className="px-2 py-3">
        <SidebarGroup className="p-0">
          <SidebarGroupLabel className="mb-1 px-2 text-[10px] font-semibold uppercase tracking-widest text-zinc-400 dark:text-zinc-600">
            Menu Utama
          </SidebarGroupLabel>

          <SidebarGroupContent>
            <SidebarMenu className="gap-0.5">
              {menuList.map((item) => {
                const isActive = pathname === item.url;

                return (
                  <SidebarMenuItem key={item.title}>
                    <SidebarMenuButton
                      asChild
                      tooltip={item.title}
                      className={cn(
                        // Base
                        'group relative h-auto rounded-xl px-3 py-2 text-sm font-medium transition-all duration-150',
                        // Default state
                        'text-zinc-500 dark:text-zinc-400',
                        // Hover
                        'hover:bg-zinc-100 hover:text-zinc-900 dark:hover:bg-zinc-800/70 dark:hover:text-zinc-100',
                        // Active
                        isActive &&
                          'bg-zinc-900 text-white hover:bg-zinc-900 hover:text-white dark:bg-zinc-100 dark:text-zinc-900 dark:hover:bg-zinc-100 dark:hover:text-zinc-900'
                      )}
                    >
                      <a href={item.url} className="flex items-center gap-3">
                        {/* Active accent bar */}
                        {isActive && (
                          <span className="absolute left-0 top-1/2 h-4 w-0.5 -translate-y-1/2 rounded-full bg-white dark:bg-zinc-900" />
                        )}

                        {item.icon && (
                          <item.icon
                            className={cn(
                              'size-4 shrink-0 transition-colors',
                              isActive
                                ? 'text-white dark:text-zinc-900'
                                : 'text-zinc-400 dark:text-zinc-500 group-hover:text-zinc-600 dark:group-hover:text-zinc-300'
                            )}
                          />
                        )}

                        <span className="truncate">{item.title}</span>
                      </a>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                );
              })}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>

      {/* ── Footer / Profile ── */}
      <SidebarFooter className="border-t border-zinc-100 px-2 py-3 dark:border-zinc-800/80">
        <SidebarMenu>
          <SidebarMenuItem>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <SidebarMenuButton
                  size="lg"
                  className={cn(
                    'h-auto rounded-xl px-3 py-2 transition-all duration-150',
                    'text-zinc-600 dark:text-zinc-300',
                    'hover:bg-zinc-100 dark:hover:bg-zinc-800/70',
                    'data-[state=open]:bg-zinc-100 dark:data-[state=open]:bg-zinc-800/70'
                  )}
                >
                  {/* Avatar */}
                  <Avatar className="h-8 w-8 shrink-0 rounded-lg">
                    <AvatarImage src={userAvatar} alt={userName} />
                    <AvatarFallback className="rounded-lg bg-zinc-200 text-[11px] font-semibold text-zinc-600 dark:bg-zinc-700 dark:text-zinc-300">
                      {getInitials(userName)}
                    </AvatarFallback>
                  </Avatar>

                  {/* Name + role */}
                  <div className="min-w-0 flex-1 leading-none">
                    <p className="truncate text-[13px] font-medium text-zinc-900 dark:text-zinc-100">
                      {userName}
                    </p>
                    <p className="mt-0.5 truncate text-[11px] text-zinc-400 dark:text-zinc-500">
                      {userRole}
                    </p>
                  </div>

                  <EllipsisVertical className="ml-auto size-3.5 shrink-0 text-zinc-400 dark:text-zinc-500" />
                </SidebarMenuButton>
              </DropdownMenuTrigger>

              <DropdownMenuContent
                className="min-w-56 rounded-xl border border-zinc-200 bg-white p-1 shadow-lg dark:border-zinc-800 dark:bg-zinc-900"
                side={isMobile ? 'bottom' : 'right'}
                align="end"
                sideOffset={8}
              >
                {/* Profile header inside dropdown */}
                <DropdownMenuLabel className="p-0 font-normal">
                  <div className="flex items-center gap-3 rounded-lg px-2 py-2">
                    <Avatar className="h-9 w-9 shrink-0 rounded-lg">
                      <AvatarImage
                          src={userAvatar || 'https://oxsfezfqpktjumnqtowq.supabase.co/storage/v1/object/public/images/users/Gemini_Generated_Image_qad7ozqad7ozqad7.png'}
                          alt={userName}
                        />
                      <AvatarFallback className="rounded-lg bg-zinc-100 text-[12px] font-semibold text-zinc-600 dark:bg-zinc-800 dark:text-zinc-300">
                        {getInitials(userName)}
                      </AvatarFallback>
                    </Avatar>
                    <div className="min-w-0 leading-none">
                      <p className="truncate text-[13px] font-medium text-zinc-900 dark:text-zinc-100">
                        {userName}
                      </p>
                      <p className="mt-0.5 truncate text-[11px] text-zinc-400 dark:text-zinc-500">
                        {userRole}
                      </p>
                    </div>
                  </div>
                </DropdownMenuLabel>

                <DropdownMenuSeparator className="my-1 bg-zinc-100 dark:bg-zinc-800" />

                <DropdownMenuGroup>
                  <DropdownMenuItem className="flex cursor-pointer items-center gap-2 rounded-lg px-2 py-1.5 text-[13px] text-zinc-600 transition-colors hover:bg-zinc-50 hover:text-zinc-900 dark:text-zinc-400 dark:hover:bg-zinc-800 dark:hover:text-zinc-100">
                    <User className="size-4 shrink-0" />
                    <span>Profil Saya</span>
                  </DropdownMenuItem>

                  <DropdownMenuItem className="flex cursor-pointer items-center gap-2 rounded-lg px-2 py-1.5 text-[13px] text-zinc-600 transition-colors hover:bg-zinc-50 hover:text-zinc-900 dark:text-zinc-400 dark:hover:bg-zinc-800 dark:hover:text-zinc-100">
                    <Settings className="size-4 shrink-0" />
                    <span>Pengaturan</span>
                  </DropdownMenuItem>
                </DropdownMenuGroup>

                <DropdownMenuSeparator className="my-1 bg-zinc-100 dark:bg-zinc-800" />

                <DropdownMenuGroup>
                  <DropdownMenuItem className="flex cursor-pointer items-center gap-2 rounded-lg px-2 py-1.5 text-[13px] text-red-500 transition-colors hover:bg-red-50 hover:text-red-600 dark:hover:bg-red-950/40 dark:hover:text-red-400"
                  onClick={() => signOut()}
                  >
                    <LogOut className="size-4 shrink-0" />
                    <span>Keluar</span>
                  </DropdownMenuItem>
                </DropdownMenuGroup>
              </DropdownMenuContent>
            </DropdownMenu>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarFooter>
    </Sidebar>
  );
}