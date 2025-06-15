import { createClient } from '@supabase/supabase-js';

// Check if Supabase is configured
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '';

// Validate that we have proper URLs and keys (not placeholders)
const isValidUrl = (url: string) => {
  try {
    new URL(url);
    return !url.includes('your_supabase_project_url_here') && !url.includes('placeholder');
  } catch {
    return false;
  }
};

const isValidKey = (key: string) => {
  return key.length > 0 && !key.includes('your_anon_key_here') && !key.includes('placeholder');
};

// Only create client if both URL and key are valid
let supabaseClient: ReturnType<typeof createClient> | null = null;

// Initialize Supabase client
if (isValidUrl(supabaseUrl) && isValidKey(supabaseAnonKey)) {
  supabaseClient = createClient(supabaseUrl, supabaseAnonKey);
}

export const supabase = supabaseClient;

// Helper to check if Supabase is configured
export const isSupabaseConfigured = () => {
  return isValidUrl(supabaseUrl) && isValidKey(supabaseAnonKey);
};

export type Database = {
  public: {
    Tables: {
      profiles: {
        Row: {
          id: string;
          email: string;
          full_name: string | null;
          avatar_url: string | null;
          subscription_tier: 'free' | 'premium';
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id: string;
          email: string;
          full_name?: string | null;
          avatar_url?: string | null;
          subscription_tier?: 'free' | 'premium';
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          email?: string;
          full_name?: string | null;
          avatar_url?: string | null;
          subscription_tier?: 'free' | 'premium';
          created_at?: string;
          updated_at?: string;
        };
      };
      poop_entries: {
        Row: {
          id: string;
          user_id: string;
          date: string;
          did_poop: boolean;
          duration: number;
          fiber: number;
          mood: 'happy' | 'neutral' | 'sad';
          notes: string;
          score: number;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          date: string;
          did_poop: boolean;
          duration: number;
          fiber: number;
          mood: 'happy' | 'neutral' | 'sad';
          notes: string;
          score: number;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          user_id?: string;
          date?: string;
          did_poop?: boolean;
          duration?: number;
          fiber?: number;
          mood?: 'happy' | 'neutral' | 'sad';
          notes?: string;
          score?: number;
          created_at?: string;
          updated_at?: string;
        };
      };
      achievements: {
        Row: {
          id: string;
          user_id: string;
          achievement_id: string;
          title: string;
          unlocked_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          achievement_id: string;
          title: string;
          unlocked_at?: string;
        };
        Update: {
          id?: string;
          user_id?: string;
          achievement_id?: string;
          title?: string;
          unlocked_at?: string;
        };
      };
    };
  };
};