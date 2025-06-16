import { supabase, isSupabaseConfigured } from './supabase';
import { User } from '@supabase/supabase-js';

export interface AuthUser extends User {
  subscription_tier: 'free' | 'premium';
  error?: any;
}

export const authService = {
  // Sign up with email and password
  async signUp(email: string, password: string, fullName?: string): Promise<{ user: AuthUser | null; session: any; error: any }> {
    if (!isSupabaseConfigured() || !supabase) {
      throw new Error('Authentication is not available. Please configure Supabase.');
    }
    
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: {
          full_name: fullName,
        },
      },
    });

    if (error) throw error;

    // Create profile record
    if (data.user) {
      const { error: profileError } = await supabase
        .from('profiles')
        .insert({
          id: data.user.id,
          email: data.user.email!,
          full_name: fullName || null,
          subscription_tier: 'free' as const, // Default to free tier for registered users
        });

      if (profileError) {
        console.error('Error creating profile:', profileError);
      }
    }

    return {
      ...data,
      error: null,
      user: data.user ? {
        ...data.user,
        subscription_tier: 'free'
      } : null
    };
  },

  // Sign in with email and password
  async signIn(email: string, password: string): Promise<{ user: AuthUser | null; session: any; error: any }> {
    if (!isSupabaseConfigured() || !supabase) {
      throw new Error('Authentication is not available. Please configure Supabase.');
    }
    
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (error) throw error;

    // Get user profile to determine premium status
    const profile = await this.getUserProfile(data.user!.id);
    const subscriptionTier = profile?.subscription_tier || 'free';

    return {
      ...data,
      user: {
        ...data.user,
        subscription_tier: subscriptionTier
      }
    };
  },

  // Sign out
  async signOut(): Promise<void> {
    if (!isSupabaseConfigured() || !supabase) {
      throw new Error('Authentication is not available. Please configure Supabase.');
    }
    
    const { error } = await supabase.auth.signOut();
    if (error) throw error;
  },

  // Get current user with improved timeout and error handling
  async getCurrentUser(): Promise<AuthUser | null> {
    if (!isSupabaseConfigured() || !supabase) return null;
    
    try {
      // Increased timeout and better error handling
      const authTimeoutPromise = new Promise<never>((_, reject) => {
        setTimeout(() => reject(new Error('Auth timeout')), 5000); // Increased to 5 seconds
      });
      
      const { data: { user }, error: authError } = await Promise.race([
        supabase.auth.getUser(),
        authTimeoutPromise
      ]);
      
      if (authError) {
        console.log('Auth error:', authError);
        return null;
      }
      
      if (!user) return null;

      // Return user with default subscription tier if profile fetch fails
      let subscriptionTier: 'free' | 'premium' = 'free';
      
      try {
        // Longer timeout for profile fetch
        const profileTimeoutPromise = new Promise<never>((_, reject) => {
          setTimeout(() => reject(new Error('Profile fetch timeout')), 3000); // Increased to 3 seconds
        });
        
        const { data: profile, error: profileError } = await Promise.race([
          supabase
            .from('profiles')
            .select('subscription_tier')
            .eq('id', user.id)
            .maybeSingle(),
          profileTimeoutPromise
        ]);
        
        if (profileError) {
          console.log('Profile fetch error:', profileError);
          // Try to create profile if it doesn't exist
          if (profileError.code === 'PGRST116' || profileError.message?.includes('No rows found')) {
            // Don't wait for profile creation, just continue
            this.createUserProfile(user).catch(() => {
              // Silently handle profile creation errors
            });
          }
        } else if (profile) {
          subscriptionTier = profile.subscription_tier as 'free' | 'premium';
        }
      } catch (error) {
        // Only log profile fetch errors in development
        if (process.env.NODE_ENV === 'development') {
          console.log('Profile fetch failed, using default subscription tier:', error);
        }
      }

      return {
        ...user,
        subscription_tier: subscriptionTier,
      };
    } catch (error) {
      // Only log auth errors in development
      if (process.env.NODE_ENV === 'development') {
        console.log('getCurrentUser failed:', error);
      }
      return null;
    }
  },

  // Create user profile if it doesn't exist (non-blocking)
  async createUserProfile(user: User): Promise<void> {
    if (!isSupabaseConfigured() || !supabase) return;
    
    try {
      const { error } = await supabase
        .from('profiles')
        .upsert({
          id: user.id,
          email: user.email!,
          full_name: user.user_metadata?.full_name || null,
          subscription_tier: 'free',
        }, {
          onConflict: 'id'
        });

      if (error) {
        console.error('Error creating user profile:', error);
      } else {
        console.log('User profile created successfully');
      }
    } catch (error) {
      console.error('Failed to create user profile:', error);
    }
  },

  // Get user profile
  async getUserProfile(userId: string): Promise<any> {
    if (!isSupabaseConfigured() || !supabase) {
      throw new Error('Authentication is not available. Please configure Supabase.');
    }
    
    const { data, error } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', userId)
      .maybeSingle();

    if (error) throw error;
    return data;
  },

  // Update user's premium status
  async updateUserPremiumStatus(userId: string, isPremium: boolean): Promise<void> {
    if (!isSupabaseConfigured() || !supabase) {
      throw new Error('Authentication is not available. Please configure Supabase.');
    }

    const { error } = await supabase
      .from('profiles')
      .update({
        subscription_tier: isPremium ? 'premium' : 'free',
        updated_at: new Date().toISOString()
      })
      .eq('id', userId);

    if (error) throw error;
  },

  // Update user profile
  async updateProfile(userId: string, updates: {
    full_name?: string;
    avatar_url?: string;
  }): Promise<any> {
    if (!isSupabaseConfigured() || !supabase) {
      throw new Error('Authentication is not available. Please configure Supabase.');
    }
    
    const { data, error } = await supabase
      .from('profiles')
      .update({
        ...updates,
        updated_at: new Date().toISOString(),
      })
      .eq('id', userId)
      .select()
      .maybeSingle();

    if (error) throw error;
    return data;
  },

  // Check if user is premium
  async isUserPremium(userId: string): Promise<boolean> {
    if (!isSupabaseConfigured() || !supabase) {
      throw new Error('Authentication is not available. Please configure Supabase.');
    }

    const { data, error } = await supabase
      .from('profiles')
      .select('subscription_tier')
      .eq('id', userId)
      .maybeSingle();

    if (error) throw error;
    return data?.subscription_tier === 'premium';
  }
};