import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { User } from '@supabase/supabase-js';
import { supabase } from './supabase';
import { authService, AuthUser } from './auth';
import { usePoopStore } from './store';
import { revenueCat } from './revenuecat';

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

          // Initialize RevenueCat with user ID
          if (user) {
            try {
              await revenueCat.initialize(user.id);
              await revenueCat.setUserId(user.id);
            } catch (error) {
              console.error('Failed to initialize RevenueCat after sign in:', error);
            }

            // Load user data from cloud after successful sign in
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

          // Initialize RevenueCat with user ID
          if (user) {
            try {
              await revenueCat.initialize(user.id);
              await revenueCat.setUserId(user.id);
            } catch (error) {
              console.error('Failed to initialize RevenueCat after sign up:', error);
            }

            // Sync local data to cloud after successful sign up
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
          
          // Log out from RevenueCat
          try {
            await revenueCat.logOut();
          } catch (error) {
            console.error('Failed to log out from RevenueCat:', error);
          }
          
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

            // Initialize RevenueCat if user is authenticated
            if (user) {
              try {
                await revenueCat.initialize(user.id);
                await revenueCat.setUserId(user.id);
              } catch (error) {
                console.error('Failed to initialize RevenueCat during app initialization:', error);
              }

              // Load user data from cloud if authenticated
              try {
                await usePoopStore.getState().loadFromCloud(user.id);
              } catch (error) {
                console.error('Failed to load data from cloud during initialization:', error);
              }
            } else {
              // Initialize RevenueCat for anonymous user
              try {
                await revenueCat.initialize();
              } catch (error) {
                console.error('Failed to initialize RevenueCat for anonymous user:', error);
              }
            }
          } else {
            // No Supabase config - run in free mode
            clearTimeout(timeoutId);
            set({ user: null, loading: false, initialized: true });
            
            // Still initialize RevenueCat for anonymous user
            try {
              await revenueCat.initialize();
            } catch (error) {
              console.error('Failed to initialize RevenueCat in free mode:', error);
            }
          }
        } catch (error) {
          // Fail gracefully - app works without auth
          console.log('Auth initialization failed, running in free mode:', error);
          clearTimeout(timeoutId);
          set({ user: null, loading: false, initialized: true });
          
          // Still try to initialize RevenueCat
          try {
            await revenueCat.initialize();
          } catch (rcError) {
            console.error('Failed to initialize RevenueCat after auth failure:', rcError);
          }
        }
      },

      updateUser: (user: AuthUser | null) => {
        const currentUser = get().user;
        set({ user });

        // If user just signed in, load their cloud data and initialize RevenueCat
        if (user && !currentUser) {
          // Initialize RevenueCat
          revenueCat.initialize(user.id).then(() => {
            return revenueCat.setUserId(user.id);
          }).catch(error => {
            console.error('Failed to initialize RevenueCat after user update:', error);
          });

          // Load cloud data
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