import { supabase } from './supabase';
import { User } from '@supabase/supabase-js';

export interface AuthUser extends User {
  subscription_tier?: 'free' | 'premium';
}

export const authService = {
  // Sign up with email and password
  async signUp(email: string, password: string, fullName?: string) {
    if (!supabase) throw new Error('Supabase not configured');
    
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
    if (!supabase) throw new Error('Supabase not configured');
    
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (error) throw error;
    return data;
  },

  // Sign out
  async signOut() {
    if (!supabase) throw new Error('Supabase not configured');
    
    const { error } = await supabase.auth.signOut();
    if (error) throw error;
  },

  // Get current user
  async getCurrentUser(): Promise<AuthUser | null> {
    if (!supabase) return null;
    
    const { data: { user } } = await supabase.auth.getUser();
    
    if (!user) return null;

    // Get user profile with subscription info
    const { data: profile } = await supabase
      .from('profiles')
      .select('subscription_tier')
      .eq('id', user.id)
      .single();

    return {
      ...user,
      subscription_tier: profile?.subscription_tier || 'premium',
    };
  },

  // Get user profile
  async getUserProfile(userId: string) {
    if (!supabase) throw new Error('Supabase not configured');
    
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
    if (!supabase) throw new Error('Supabase not configured');
    
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
    if (!supabase) return false;
    
    const { data } = await supabase
      .from('profiles')
      .select('subscription_tier')
      .eq('id', userId)
      .single();

    return data?.subscription_tier === 'premium';
  },
};