import {
  FileArchive,
  LayoutDashboard,
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
      title: 'Arsip',
      url: '/admin/archive',
      icon: FileArchive,
    },
  ],
  pimpinan: [],
};

export type SidebarMenuKey = keyof typeof SIDEBAR_MENU_LIST;
