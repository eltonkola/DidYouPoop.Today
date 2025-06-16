import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { supabase } from './supabase';
import { authService, AuthUser } from './auth';
import { isPremiumUser, getCustomerInfo, initializeRevenueCat, isRevenueCatConfigured } from './revenuecat';

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
        set({ user, error: null });
      },
      updateUserPremiumStatus: async (userId: string, isPremium: boolean) => {
        try {
          await authService.updateUserPremiumStatus(userId, isPremium);
          const user = await authService.getCurrentUser();
          if (user) {
            set({ user });
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

          // First set the user in the store
          set({ user: currentUser });

          // Then initialize RevenueCat with current user
          await initializeRevenueCat(currentUser.id);

          // Set up Supabase auth state listener
          const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, session) => {
            const { updateUser } = useAuthStore.getState();
            
            try {
              if (session?.user) {
                const user = await authService.getCurrentUser();
                updateUser(user);
                // Reinitialize RevenueCat when user signs in
                await initializeRevenueCat(session.user.id);
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
      }
    }),
    {
      name: 'auth-storage',
      partialize: (state) => ({ user: state.user })
    }
  )
);

export default useAuthStore;