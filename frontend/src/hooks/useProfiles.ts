import { useQuery } from "@tanstack/react-query";
import { apiClient } from "@/services/apiClient";
import { Profile } from "@/types/database";
import { useAuth } from "./useAuth";

const PROFILES_KEY = ["profiles"];

/**
 * Fetch all user profiles
 */
async function fetchProfiles(): Promise<Profile[]> {
  return apiClient.getProfiles();
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
