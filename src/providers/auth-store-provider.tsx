'use client';

import { createClient } from '@/lib/supabase/client';
import { useAuthStore } from '@/store/auth-store';
import { ReactNode, useEffect } from 'react';

export default function AuthStoreProvider({
  children,
}: {
  children: ReactNode;
}) {
  useEffect(() => {
    const getProfile = async () => {
      const supabase = createClient();

      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (!user) return;

      useAuthStore.getState().setUser(user);

      const { data: profile, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', user.id)
        .single();

      console.log(profile);
      console.log(error);

      if (profile) {
        useAuthStore.getState().setProfile(profile);
      }
    };

    getProfile();
  }, []);

  return <>{children}</>;
}