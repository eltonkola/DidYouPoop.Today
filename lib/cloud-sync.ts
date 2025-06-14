import { supabase, isSupabaseConfigured } from './supabase';
import { PoopEntry, Achievement } from './store';

export interface CloudPoopEntry {
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
}

export interface CloudAchievement {
  id: string;
  user_id: string;
  achievement_id: string;
  title: string;
  unlocked_at: string;
}

export const cloudSync = {
  // Sync local entries to cloud
  async syncEntriesToCloud(userId: string, entries: PoopEntry[]): Promise<void> {
    if (!isSupabaseConfigured() || !supabase) return;

    try {
      // Convert local entries to cloud format
      const cloudEntries = entries.map(entry => ({
        id: entry.id,
        user_id: userId,
        date: entry.date,
        did_poop: entry.didPoop,
        duration: entry.duration,
        fiber: entry.fiber,
        mood: entry.mood,
        notes: entry.notes,
        score: entry.score,
        created_at: entry.createdAt,
        updated_at: entry.createdAt,
      }));

      // Upsert entries (insert or update if exists)
      const { error } = await supabase
        .from('poop_entries')
        .upsert(cloudEntries, {
          onConflict: 'id'
        });

      if (error) {
        console.error('Error syncing entries to cloud:', error);
        throw error;
      }

      console.log(`Synced ${entries.length} entries to cloud`);
    } catch (error) {
      console.error('Failed to sync entries to cloud:', error);
      throw error;
    }
  },

  // Sync local achievements to cloud
  async syncAchievementsToCloud(userId: string, achievements: Achievement[]): Promise<void> {
    if (!isSupabaseConfigured() || !supabase) return;

    try {
      // Convert local achievements to cloud format
      const cloudAchievements = achievements.map(achievement => ({
        id: crypto.randomUUID(),
        user_id: userId,
        achievement_id: achievement.id,
        title: achievement.title,
        unlocked_at: achievement.unlockedAt,
      }));

      // Upsert achievements
      const { error } = await supabase
        .from('achievements')
        .upsert(cloudAchievements, {
          onConflict: 'user_id,achievement_id'
        });

      if (error) {
        console.error('Error syncing achievements to cloud:', error);
        throw error;
      }

      console.log(`Synced ${achievements.length} achievements to cloud`);
    } catch (error) {
      console.error('Failed to sync achievements to cloud:', error);
      throw error;
    }
  },

  // Load entries from cloud
  async loadEntriesFromCloud(userId: string): Promise<PoopEntry[]> {
    if (!isSupabaseConfigured() || !supabase) return [];

    try {
      const { data, error } = await supabase
        .from('poop_entries')
        .select('*')
        .eq('user_id', userId)
        .order('date', { ascending: false });

      if (error) {
        console.error('Error loading entries from cloud:', error);
        throw error;
      }

      // Convert cloud entries to local format
      const localEntries: PoopEntry[] = (data || []).map(entry => ({
        id: entry.id,
        date: entry.date,
        didPoop: entry.did_poop,
        duration: entry.duration,
        fiber: entry.fiber,
        mood: entry.mood,
        notes: entry.notes,
        score: entry.score,
        createdAt: entry.created_at,
      }));

      console.log(`Loaded ${localEntries.length} entries from cloud`);
      return localEntries;
    } catch (error) {
      console.error('Failed to load entries from cloud:', error);
      return [];
    }
  },

  // Load achievements from cloud
  async loadAchievementsFromCloud(userId: string): Promise<Achievement[]> {
    if (!isSupabaseConfigured() || !supabase) return [];

    try {
      const { data, error } = await supabase
        .from('achievements')
        .select('*')
        .eq('user_id', userId)
        .order('unlocked_at', { ascending: false });

      if (error) {
        console.error('Error loading achievements from cloud:', error);
        throw error;
      }

      // Convert cloud achievements to local format
      const localAchievements: Achievement[] = (data || []).map(achievement => ({
        id: achievement.achievement_id,
        title: achievement.title,
        unlockedAt: achievement.unlocked_at,
      }));

      console.log(`Loaded ${localAchievements.length} achievements from cloud`);
      return localAchievements;
    } catch (error) {
      console.error('Failed to load achievements from cloud:', error);
      return [];
    }
  },

  // Save single entry to cloud
  async saveEntryToCloud(userId: string, entry: PoopEntry): Promise<void> {
    if (!isSupabaseConfigured() || !supabase) return;

    try {
      const cloudEntry = {
        id: entry.id,
        user_id: userId,
        date: entry.date,
        did_poop: entry.didPoop,
        duration: entry.duration,
        fiber: entry.fiber,
        mood: entry.mood,
        notes: entry.notes,
        score: entry.score,
        created_at: entry.createdAt,
        updated_at: new Date().toISOString(),
      };

      const { error } = await supabase
        .from('poop_entries')
        .upsert(cloudEntry, {
          onConflict: 'id'
        });

      if (error) {
        console.error('Error saving entry to cloud:', error);
        throw error;
      }

      console.log('Entry saved to cloud:', entry.id);
    } catch (error) {
      console.error('Failed to save entry to cloud:', error);
      throw error;
    }
  },

  // Save single achievement to cloud
  async saveAchievementToCloud(userId: string, achievement: Achievement): Promise<void> {
    if (!isSupabaseConfigured() || !supabase) return;

    try {
      const cloudAchievement = {
        id: crypto.randomUUID(),
        user_id: userId,
        achievement_id: achievement.id,
        title: achievement.title,
        unlocked_at: achievement.unlockedAt,
      };

      const { error } = await supabase
        .from('achievements')
        .upsert(cloudAchievement, {
          onConflict: 'user_id,achievement_id'
        });

      if (error) {
        console.error('Error saving achievement to cloud:', error);
        throw error;
      }

      console.log('Achievement saved to cloud:', achievement.id);
    } catch (error) {
      console.error('Failed to save achievement to cloud:', error);
      throw error;
    }
  },

  // Delete entry from cloud
  async deleteEntryFromCloud(userId: string, entryId: string): Promise<void> {
    if (!isSupabaseConfigured() || !supabase) return;

    try {
      const { error } = await supabase
        .from('poop_entries')
        .delete()
        .eq('id', entryId)
        .eq('user_id', userId);

      if (error) {
        console.error('Error deleting entry from cloud:', error);
        throw error;
      }

      console.log('Entry deleted from cloud:', entryId);
    } catch (error) {
      console.error('Failed to delete entry from cloud:', error);
      throw error;
    }
  },

  // Merge local and cloud data (for conflict resolution)
  mergeEntries(localEntries: PoopEntry[], cloudEntries: PoopEntry[]): PoopEntry[] {
    const entryMap = new Map<string, PoopEntry>();

    // Add cloud entries first
    cloudEntries.forEach(entry => {
      entryMap.set(entry.id, entry);
    });

    // Add local entries, preferring newer ones
    localEntries.forEach(localEntry => {
      const cloudEntry = entryMap.get(localEntry.id);
      if (!cloudEntry || new Date(localEntry.createdAt) > new Date(cloudEntry.createdAt)) {
        entryMap.set(localEntry.id, localEntry);
      }
    });

    return Array.from(entryMap.values()).sort((a, b) => 
      new Date(b.date).getTime() - new Date(a.date).getTime()
    );
  },

  // Merge achievements (cloud takes precedence for unlock time)
  mergeAchievements(localAchievements: Achievement[], cloudAchievements: Achievement[]): Achievement[] {
    const achievementMap = new Map<string, Achievement>();

    // Add local achievements first
    localAchievements.forEach(achievement => {
      achievementMap.set(achievement.id, achievement);
    });

    // Add cloud achievements, preferring earlier unlock times
    cloudAchievements.forEach(cloudAchievement => {
      const localAchievement = achievementMap.get(cloudAchievement.id);
      if (!localAchievement || new Date(cloudAchievement.unlockedAt) < new Date(localAchievement.unlockedAt)) {
        achievementMap.set(cloudAchievement.id, cloudAchievement);
      }
    });

    return Array.from(achievementMap.values()).sort((a, b) => 
      new Date(b.unlockedAt).getTime() - new Date(a.unlockedAt).getTime()
    );
  },
};