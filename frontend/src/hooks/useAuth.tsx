import {
  createContext,
  useContext,
  useEffect,
  useState,
  ReactNode,
} from "react";
import { apiClient } from "@/services/apiClient";

/**
 * Authentication context interface
 */
interface User {
  id: string;
  email: string;
  fullName: string;
  avatarUrl?: string;
}

interface AuthContextType {
  user: User | null;
  loading: boolean;
  signUp: (
    email: string,
    password: string,
    fullName: string
  ) => Promise<{ error: Error | null }>;
  signIn: (email: string, password: string) => Promise<{ error: Error | null }>;
  signOut: () => Promise<void>;
  updateProfile: (updates: Partial<User>) => Promise<{ error: Error | null }>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

/**
 * Authentication provider component
 */
export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Check for existing token and fetch user data
    const token = localStorage.getItem("authToken");
    if (token) {
      apiClient.setToken(token);
      fetchCurrentUser()
        .catch(() => {
          // If fetching user fails, remove invalid token
          localStorage.removeItem("authToken");
          apiClient.setToken(null);
        })
        .finally(() => setLoading(false));
    } else {
      setLoading(false);
    }
  }, []);

  const fetchCurrentUser = async () => {
    try {
      const response = await apiClient.getCurrentUser();
      setUser(response.user);
    } catch (error) {
      throw error;
    }
  };

  const signUp = async (email: string, password: string, fullName: string) => {
    try {
      const response = await apiClient.register({ email, password, fullName });
      localStorage.setItem("authToken", response.token);
      apiClient.setToken(response.token);
      setUser(response.user);
      return { error: null };
    } catch (error: any) {
      return { error: error as Error };
    }
  };

  const signIn = async (email: string, password: string) => {
    try {
      const response = await apiClient.login({ email, password });
      localStorage.setItem("authToken", response.token);
      apiClient.setToken(response.token);
      setUser(response.user);
      return { error: null };
    } catch (error: any) {
      return { error: error as Error };
    }
  };

  const signOut = async () => {
    localStorage.removeItem("authToken");
    apiClient.setToken(null);
    setUser(null);
  };

  const updateProfile = async (updates: Partial<User>) => {
    if (!user) return { error: new Error("Not authenticated") };

    try {
      // Make API call to update profile on the server
      const response = await apiClient.updateProfile(updates);

      // Update local user state with server response
      setUser((prev) => (prev ? { ...prev, ...response.profile } : null));

      return { error: null };
    } catch (error: any) {
      return { error: error as Error };
    }
  };

  return (
    <AuthContext.Provider
      value={{ user, loading, signUp, signIn, signOut, updateProfile }}
    >
      {children}
    </AuthContext.Provider>
  );
}

/**
 * Hook to access authentication context
 */
export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
}
