import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { supabase } from './supabase';
import { authService, AuthUser } from './auth';
import { isPremiumUser, getCustomerInfo, initializeRevenueCat, isRevenueCatConfigured, reinitializeRevenueCat } from './revenuecat';

interface AuthState {
  user: AuthUser | null;
  isLoading: boolean;
  error: Error | null;
  updateUser: (user: AuthUser | null) => void;
  updateUserPremiumStatus: (userId: string, isPremium: boolean) => Promise<void>;
  initialize: () => Promise<() => void>;
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      user: null,
      isLoading: false,
      error: null,
      updateUser: (user: AuthUser | null) => {
        // Transform Supabase user to AuthUser if user exists
        const authUser = user ? {
          ...user,
          subscription_tier: 'free' as const // Default to free tier
        } : null;
        set({ user: authUser, error: null });
      },
      updateUserPremiumStatus: async (userId: string, isPremium: boolean) => {
        try {
          await authService.updateUserPremiumStatus(userId, isPremium);
          const user = await authService.getCurrentUser();
          if (user) {
            // Transform Supabase user to AuthUser
            const authUser = {
              ...user,
              subscription_tier: user.subscription_tier || 'free'
            };
            set({ user: authUser });
          }
        } catch (error) {
          console.error('Error updating user premium status:', error);
          set({ error: error as Error });
        }
      },
      initialize: async () => {
        if (!supabase) {
          throw new Error('Supabase client not initialized');
        }

        try {
          const { data: { user: currentUser } } = await supabase.auth.getUser();
          
          if (!currentUser?.id) {
            throw new Error('Missing user ID');
          }

          // Transform Supabase user to AuthUser
          const authUser = {
            ...currentUser,
            subscription_tier: 'free' // Default to free tier
          };

          // First set the user in the store
          set({ user: authUser });

          // Then initialize RevenueCat with current user
          await initializeRevenueCat(currentUser.id);

          // Set up Supabase auth state listener
          const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, session) => {
            const { updateUser } = useAuthStore.getState();
            
            try {
              if (session?.user) {
                const user = await authService.getCurrentUser();
                if (user) {
                  // Transform Supabase user to AuthUser
                  const authUser = {
                    ...user,
                    subscription_tier: user.subscription_tier as 'free' | 'premium' || 'free'
                  };
                  updateUser(authUser);
                  // Reinitialize RevenueCat when user signs in
                  await initializeRevenueCat(session.user.id);
                }
              } else {
                updateUser(null);
                // Cleanup RevenueCat when user signs out
                await reinitializeRevenueCat();
              }
            } catch (error) {
              console.error('Error updating auth state:', error);
              set({ error: error as Error });
            }
          });

          return () => {
            subscription.unsubscribe();
            // Cleanup RevenueCat when component unmounts
            reinitializeRevenueCat();
          };

        } catch (error) {
          console.error('Error during auth initialization:', error);
          set({ error: error as Error });
          return () => {};
        }
      },
      signOut: async () => {
        if (!supabase) {
          throw new Error('Supabase client not initialized');
        }

        try {
          // Sign out from Supabase
          await authService.signOut();
          
          // Update store state
          set({ user: null, error: null });
          
          // Cleanup RevenueCat
          await reinitializeRevenueCat();
        } catch (error) {
          console.error('Error during sign out:', error);
          set({ error: error as Error });
          throw error;
        }
      }
    }),
    {
      name: 'auth-storage',
      partialize: (state) => ({ user: state.user })
    }
  )
);

export default useAuthStore;