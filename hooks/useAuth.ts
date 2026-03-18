'use client';

import { useEffect, useState } from 'react';
import { createClient } from '@/lib/supabase/client';
import { User } from '@supabase/supabase-js';
import { Profile } from '@/lib/types';
import { useProfile } from './useProfile';

export function useAuth() {
  const [user, setUser] = useState<User | null>(null);
  const { profile, loading: profileLoading, setProfile, refetchProfile } = useProfile();
  const [loading, setLoading] = useState(true);
  const supabase = createClient();

  useEffect(() => {
    async function getSession() {
      const { data: { session } } = await supabase.auth.getSession();
      setUser(session?.user ?? null);
      setLoading(false);
    }

    getSession();

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null);
      setLoading(false);
    });

    return () => {
      subscription.unsubscribe();
    };
  }, [supabase]);

  const signOut = async () => {
    await supabase.auth.signOut();
    setUser(null);
    setProfile(null);
  };

  return {
    user,
    profile,
    loading: loading || profileLoading,
    signOut,
    refreshProfile: refetchProfile,
  };
}
