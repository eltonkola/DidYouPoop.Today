import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { User } from '@supabase/supabase-js';
import { supabase } from './supabase';
import { authService, AuthUser } from './auth';
import { usePoopStore } from './store';

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

// Safe RevenueCat initialization
const safeInitializeRevenueCat = async (userId?: string) => {
  try {
    const { initializeRevenueCat, isRevenueCatConfigured } = await import('./revenuecat');
    if (isRevenueCatConfigured()) {
      await initializeRevenueCat(userId);
    }
  } catch (error) {
    console.log('RevenueCat initialization skipped:', error);
  }
};

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

          // Initialize RevenueCat with user ID (with error handling)
          if (user) {
            safeInitializeRevenueCat(user.id);
          }

          // Load user data from cloud after successful sign in
          if (user) {
            try {
              await usePoopStore.getState().loadFromCloud(user.id);
            } catch (error) {
              console.error('Failed to load data from cloud after sign in:', error);
            }
          }
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

          // Initialize RevenueCat with user ID (with error handling)
          if (user) {
            safeInitializeRevenueCat(user.id);
          }

          // Sync local data to cloud after successful sign up
          if (user) {
            try {
              const poopStore = usePoopStore.getState();
              // If user has local data, sync it to cloud
              if (poopStore.entries.length > 0 || poopStore.achievements.length > 0) {
                await poopStore.syncWithCloud(user.id);
              }
            } catch (error) {
              console.error('Failed to sync local data to cloud after sign up:', error);
            }
          }
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
          
          // Note: We don't clear local data on sign out
          // This allows users to continue using the app offline
          // and sync when they sign back in
        } catch (error) {
          set({ loading: false });
          throw error;
        }
      },

      initialize: async () => {
        if (get().initialized) return;
        
        set({ loading: true });
        
        // Shorter timeout to prevent hanging
        const timeoutId = setTimeout(() => {
          console.log('Auth initialization timeout - proceeding in free mode');
          set({ user: null, loading: false, initialized: true });
        }, 3000); // Reduced to 3 seconds
        
        try {
          // Check if Supabase is properly configured
          if (supabase && typeof window !== 'undefined') {
            const user = await authService.getCurrentUser();
            clearTimeout(timeoutId);
            set({ user, loading: false, initialized: true });

            // Initialize RevenueCat if configured (with error handling)
            safeInitializeRevenueCat(user?.id);

            // Load user data from cloud if authenticated
            if (user) {
              try {
                await usePoopStore.getState().loadFromCloud(user.id);
              } catch (error) {
                console.error('Failed to load data from cloud during initialization:', error);
              }
            }
          } else {
            // No Supabase config - run in free mode
            clearTimeout(timeoutId);
            set({ user: null, loading: false, initialized: true });
            
            // Still initialize RevenueCat for anonymous users if configured
            safeInitializeRevenueCat();
          }
        } catch (error) {
          // Fail gracefully - app works without auth
          console.log('Auth initialization failed, running in free mode:', error);
          clearTimeout(timeoutId);
          set({ user: null, loading: false, initialized: true });
          
          // Still try to initialize RevenueCat
          safeInitializeRevenueCat();
        }
      },

      updateUser: (user: AuthUser | null) => {
        const currentUser = get().user;
        set({ user });

        // Initialize RevenueCat when user signs in (with error handling)
        if (user && !currentUser) {
          safeInitializeRevenueCat(user.id);
        }

        // If user just signed in, load their cloud data
        if (user && !currentUser) {
          usePoopStore.getState().loadFromCloud(user.id).catch(error => {
            console.error('Failed to load data from cloud after user update:', error);
          });
        }
      },
    }),
    {
      name: 'auth-storage',
      partialize: (state) => ({ user: state.user }),
    }
  )
);

// Set up auth state listener only if Supabase is configured
if (typeof window !== 'undefined' && supabase) {
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