import { createClient } from '@supabase/supabase-js';

// Check if Supabase is configured
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '';

// Create a dummy client if not configured
export const supabase = supabaseUrl && supabaseAnonKey 
  ? createClient(supabaseUrl, supabaseAnonKey)
  : null;

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