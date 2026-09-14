import {
  FileArchive,
  FolderOpen,
  Inbox,
  LayoutDashboard,
  Mail,
  Send,
  Users,
} from 'lucide-react';

export const SIDEBAR_MENU_LIST = {
  admin: [
    {
      title: 'Dashboard',
      url: '/admin',
      icon: LayoutDashboard,
    },
    {
      title: 'User',
      url: '/admin/user',
      icon: Users,
    },
    {
      title: 'Surat Masuk',
      url: '/admin/surat-masuk',
      icon: Inbox,
    },
    {
      title: 'Surat Keluar',
      url: '/admin/surat-keluar',
      icon: Send,
    },
    {
      title: 'Arsip',
      url: '/admin/archive',
      icon: FileArchive,
      children: [
        {
          title: 'Semua Arsip',
          url: '/admin/archive',
          icon: FileArchive,
        },
        {
          title: 'Kategori',
          url: '/admin/archive/category',
          icon: FolderOpen,
        },
      ],
    },
  ],
  pimpinan: [
    {
      title: 'Surat Masuk',
      url: '/admin/surat-masuk',
      icon: Inbox,
    },
    {
      title: 'Surat Keluar',
      url: '/admin/surat-keluar',
      icon: Send,
    },
    {
      title: 'Arsip',
      url: '/admin/archive',
      icon: FileArchive,
    },
  ],
};

export type SidebarMenuKey = keyof typeof SIDEBAR_MENU_LIST;
