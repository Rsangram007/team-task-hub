import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Profile } from '@/types/database';
import { useAuth } from './useAuth';

const PROFILES_KEY = ['profiles'];

/**
 * Fetch all user profiles
 */
async function fetchProfiles(): Promise<Profile[]> {
  const { data, error } = await supabase
    .from('profiles')
    .select('*')
    .order('full_name', { ascending: true });

  if (error) throw new Error(error.message);
  return (data || []) as Profile[];
}

/**
 * Hook for fetching all profiles (for user assignment dropdown)
 */
export function useProfiles() {
  const { user } = useAuth();

  return useQuery({
    queryKey: PROFILES_KEY,
    queryFn: fetchProfiles,
    enabled: !!user,
    staleTime: 1000 * 60 * 5, // 5 minutes
  });
}
