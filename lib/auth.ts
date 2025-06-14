import { supabase, isSupabaseConfigured } from './supabase';
import { User } from '@supabase/supabase-js';

export interface AuthUser extends User {
  subscription_tier?: 'free' | 'premium';
}

export const authService = {
  // Sign up with email and password
  async signUp(email: string, password: string, fullName?: string) {
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
          subscription_tier: 'premium', // Default to premium for registered users
        });

      if (profileError) {
        console.error('Error creating profile:', profileError);
      }
    }

    return data;
  },

  // Sign in with email and password
  async signIn(email: string, password: string) {
    if (!isSupabaseConfigured() || !supabase) {
      throw new Error('Authentication is not available. Please configure Supabase.');
    }
    
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (error) throw error;
    return data;
  },

  // Sign out
  async signOut() {
    if (!isSupabaseConfigured() || !supabase) {
      throw new Error('Authentication is not available. Please configure Supabase.');
    }
    
    const { error } = await supabase.auth.signOut();
    if (error) throw error;
  },

  // Get current user with timeout
  async getCurrentUser(): Promise<AuthUser | null> {
    if (!isSupabaseConfigured() || !supabase) return null;
    
    // Add timeout to prevent hanging
    const timeoutPromise = new Promise<never>((_, reject) => {
      setTimeout(() => reject(new Error('Auth timeout')), 3000);
    });
    
    try {
      const { data: { user } } = await Promise.race([
        supabase.auth.getUser(),
        timeoutPromise
      ]);
      
      if (!user) return null;

      // Get user profile with subscription info (with timeout)
      const profilePromise = supabase
        .from('profiles')
        .select('subscription_tier')
        .eq('id', user.id)
        .single();
        
      const profileTimeoutPromise = new Promise<never>((_, reject) => {
        setTimeout(() => reject(new Error('Profile fetch timeout')), 2000);
      });

      let profile = null;
      try {
        const { data } = await Promise.race([profilePromise, profileTimeoutPromise]);
        profile = data;
      } catch (error) {
        console.log('Profile fetch failed, using default:', error);
      }

      return {
        ...user,
        subscription_tier: profile?.subscription_tier || 'premium',
      };
    } catch (error) {
      console.log('getCurrentUser failed:', error);
      return null;
    }
  },

  // Get user profile
  async getUserProfile(userId: string) {
    if (!isSupabaseConfigured() || !supabase) {
      throw new Error('Authentication is not available. Please configure Supabase.');
    }
    
    const { data, error } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', userId)
      .single();

    if (error) throw error;
    return data;
  },

  // Update user profile
  async updateProfile(userId: string, updates: {
    full_name?: string;
    avatar_url?: string;
  }) {
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
      .single();

    if (error) throw error;
    return data;
  },

  // Check if user is premium
  async isPremiumUser(userId: string): Promise<boolean> {
    if (!isSupabaseConfigured() || !supabase) return false;
    
    try {
      const { data } = await supabase
        .from('profiles')
        .select('subscription_tier')
        .eq('id', userId)
        .single();

      return data?.subscription_tier === 'premium';
    } catch (error) {
      console.log('Error checking premium status:', error);
      return false;
    }
  },
};