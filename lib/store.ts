import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { cloudSync } from './cloud-sync';

export interface PoopEntry {
  id: string;
  user_id: string; // auth.users id
  date: string; // YYYY-MM-DD format
  didPoop: boolean;
  duration: number; // in seconds
  fiber: number; // in grams
  mood: 'happy' | 'neutral' | 'sad';
  notes: string;
  score: number; // 0-100
  createdAt: string; // ISO string
}

export interface Achievement {
  id: string;
  title: string;
  unlockedAt: string; // ISO string
}

interface PoopStore {
  entries: PoopEntry[];
  achievements: Achievement[];
  streak: number;
  isLoading: boolean;
  lastSyncTime: string | null;
  addEntry: (entry: PoopEntry, userId?: string) => Promise<void>;
  updateEntry: (id: string, entry: Partial<PoopEntry>, userId?: string) => Promise<void>;
  deleteEntry: (id: string, userId?: string) => Promise<void>;
  addAchievement: (achievement: Achievement, userId?: string) => Promise<void>;
  updateStreak: () => void;
  clearAllData: () => void;
  syncWithCloud: (userId: string) => Promise<void>;
  loadFromCloud: (userId: string) => Promise<void>;
  setLoading: (loading: boolean) => void;
}

export const usePoopStore = create<PoopStore>()(
  persist(
    (set, get) => ({
      entries: [],
      achievements: [],
      streak: 0,
      isLoading: false,
      lastSyncTime: null,

      setLoading: (loading) => set({ isLoading: loading }),

      addEntry: async (entry, userId) => {
        set((state) => {
          const newEntries = [...state.entries.filter(e => e.date !== entry.date), entry];
          const updatedState = { ...state, entries: newEntries };
          
          // Update streak after adding entry
          const streak = calculateStreak(newEntries);
          
          return { ...updatedState, streak };
        });

        // Sync to cloud if user is authenticated
        if (userId) {
          try {
            await cloudSync.saveEntryToCloud(userId, entry);
            set({ lastSyncTime: new Date().toISOString() });
          } catch (error) {
            console.error('Failed to sync entry to cloud:', error);
            // Continue with local storage even if cloud sync fails
          }
        }
      },

      updateEntry: async (id, updates, userId) => {
        let updatedEntry: PoopEntry | null = null;
        
        set((state) => {
          const newEntries = state.entries.map(entry => {
            if (entry.id === id) {
              updatedEntry = { ...entry, ...updates };
              return updatedEntry;
            }
            return entry;
          });
          return { entries: newEntries };
        });

        // Sync to cloud if user is authenticated and entry was found
        if (userId && updatedEntry) {
          try {
            await cloudSync.saveEntryToCloud(userId, updatedEntry);
            set({ lastSyncTime: new Date().toISOString() });
          } catch (error) {
            console.error('Failed to sync updated entry to cloud:', error);
          }
        }
      },

      deleteEntry: async (id, userId) => {
        set((state) => ({
          entries: state.entries.filter(entry => entry.id !== id),
        }));

        // Delete from cloud if user is authenticated
        if (userId) {
          try {
            await cloudSync.deleteEntryFromCloud(userId, id);
            set({ lastSyncTime: new Date().toISOString() });
          } catch (error) {
            console.error('Failed to delete entry from cloud:', error);
          }
        }
      },

      addAchievement: async (achievement, userId) => {
        set((state) => {
          if (state.achievements.some(a => a.id === achievement.id)) {
            return state; // Achievement already exists
          }
          return {
            achievements: [...state.achievements, achievement],
          };
        });

        // Sync to cloud if user is authenticated
        if (userId) {
          try {
            await cloudSync.saveAchievementToCloud(userId, achievement);
            set({ lastSyncTime: new Date().toISOString() });
          } catch (error) {
            console.error('Failed to sync achievement to cloud:', error);
          }
        }
      },

      updateStreak: () => {
        set((state) => ({
          streak: calculateStreak(state.entries),
        }));
      },

      clearAllData: () => {
        set({
          entries: [],
          achievements: [],
          streak: 0,
          lastSyncTime: null,
        });
      },

      // Sync local data to cloud
      syncWithCloud: async (userId: string) => {
        const state = get();
        set({ isLoading: true });

        try {
          // Sync entries and achievements to cloud
          await Promise.all([
            cloudSync.syncEntriesToCloud(userId, state.entries),
            cloudSync.syncAchievementsToCloud(userId, state.achievements),
          ]);

          set({ 
            lastSyncTime: new Date().toISOString(),
            isLoading: false 
          });
          
          console.log('Successfully synced local data to cloud');
        } catch (error) {
          console.error('Failed to sync with cloud:', error);
          set({ isLoading: false });
          throw error;
        }
      },

      // Load data from cloud and merge with local
      loadFromCloud: async (userId: string) => {
        set({ isLoading: true });

        try {
          // Load data from cloud
          const [cloudEntries, cloudAchievements] = await Promise.all([
            cloudSync.loadEntriesFromCloud(userId),
            cloudSync.loadAchievementsFromCloud(userId),
          ]);

          const state = get();

          // Merge cloud and local data
          const mergedEntries = cloudSync.mergeEntries(state.entries, cloudEntries);
          const mergedAchievements = cloudSync.mergeAchievements(state.achievements, cloudAchievements);

          // Update state with merged data
          set({
            entries: mergedEntries,
            achievements: mergedAchievements,
            streak: calculateStreak(mergedEntries),
            lastSyncTime: new Date().toISOString(),
            isLoading: false,
          });

          console.log('Successfully loaded and merged data from cloud');
        } catch (error) {
          console.error('Failed to load from cloud:', error);
          set({ isLoading: false });
          throw error;
        }
      },
    }),
    {
      name: 'poop-tracker-storage',
      version: 1,
      partialize: (state) => ({
        entries: state.entries,
        achievements: state.achievements,
        streak: state.streak,
        lastSyncTime: state.lastSyncTime,
      }),
    }
  )
);

// Helper function to calculate current streak
function calculateStreak(entries: PoopEntry[]): number {
  if (entries.length === 0) return 0;

  const sortedEntries = entries
    .filter(e => e.didPoop)
    .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());

  if (sortedEntries.length === 0) return 0;

  let streak = 0;
  const today = new Date();
  const todayStr = today.toISOString().split('T')[0];
  const yesterdayStr = new Date(today.getTime() - 24 * 60 * 60 * 1000).toISOString().split('T')[0];

  // Check if there's an entry for today or yesterday to start the streak
  const latestEntry = sortedEntries[0];
  if (latestEntry.date !== todayStr && latestEntry.date !== yesterdayStr) {
    return 0;
  }

  // Count consecutive days
  let currentDate = new Date(latestEntry.date);
  for (const entry of sortedEntries) {
    const entryDate = new Date(entry.date);
    if (entryDate.toISOString().split('T')[0] === currentDate.toISOString().split('T')[0]) {
      streak++;
      currentDate = new Date(currentDate.getTime() - 24 * 60 * 60 * 1000);
    } else {
      break;
    }
  }

  return streak;
}