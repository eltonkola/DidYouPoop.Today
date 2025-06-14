import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { User } from '@supabase/supabase-js';
import { supabase } from './supabase';
import { authService, AuthUser } from './auth';

interface AuthStore {
  user: AuthUser | null;
  loading: boolean;
  initialized: boolean;
  signIn: (email: string, password: string) => Promise<void>;
  signUp: (email: string, password: string, fullName?: string) => Promise<void>;
  signOut: () => Promise<void>;
  initialize: () => Promise<void>;
  updateUser: (user: AuthUser | null) => void;
}

export const useAuthStore = create<AuthStore>()(
  persist(
    (set, get) => ({
      user: null,
      loading: false,
      initialized: false,

      signIn: async (email: string, password: string) => {
        set({ loading: true });
        try {
          await authService.signIn(email, password);
          const user = await authService.getCurrentUser();
          set({ user, loading: false });
        } catch (error) {
          set({ loading: false });
          throw error;
        }
      },

      signUp: async (email: string, password: string, fullName?: string) => {
        set({ loading: true });
        try {
          await authService.signUp(email, password, fullName);
          const user = await authService.getCurrentUser();
          set({ user, loading: false });
        } catch (error) {
          set({ loading: false });
          throw error;
        }
      },

      signOut: async () => {
        set({ loading: true });
        try {
          await authService.signOut();
          set({ user: null, loading: false });
        } catch (error) {
          set({ loading: false });
          throw error;
        }
      },

      initialize: async () => {
        if (get().initialized) return;
        
        set({ loading: true });
        try {
          // Only try to get user if Supabase is configured
          if (process.env.NEXT_PUBLIC_SUPABASE_URL && process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY) {
            const user = await authService.getCurrentUser();
            set({ user, loading: false, initialized: true });
          } else {
            // No Supabase config - run in free mode
            set({ user: null, loading: false, initialized: true });
          }
        } catch (error) {
          // Fail gracefully - app works without auth
          console.log('Auth initialization failed, running in free mode');
          set({ user: null, loading: false, initialized: true });
        }
      },

      updateUser: (user: AuthUser | null) => {
        set({ user });
      },
    }),
    {
      name: 'auth-storage',
      partialize: (state) => ({ user: state.user }),
    }
  )
);

// Set up auth state listener only if Supabase is configured
if (typeof window !== 'undefined' && process.env.NEXT_PUBLIC_SUPABASE_URL && process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY) {
  supabase.auth.onAuthStateChange(async (event, session) => {
    const { updateUser } = useAuthStore.getState();
    
    if (session?.user) {
      try {
        const user = await authService.getCurrentUser();
        updateUser(user);
      } catch (error) {
        console.log('Error getting user:', error);
        updateUser(null);
      }
    } else {
      updateUser(null);
    }
  });
}