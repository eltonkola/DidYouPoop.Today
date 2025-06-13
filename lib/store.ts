import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export interface PoopEntry {
  id: string;
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
  addEntry: (entry: PoopEntry) => void;
  updateEntry: (id: string, entry: Partial<PoopEntry>) => void;
  deleteEntry: (id: string) => void;
  addAchievement: (achievement: Achievement) => void;
  updateStreak: () => void;
  clearAllData: () => void;
}

export const usePoopStore = create<PoopStore>()(
  persist(
    (set, get) => ({
      entries: [],
      achievements: [],
      streak: 0,

      addEntry: (entry) => {
        set((state) => {
          const newEntries = [...state.entries.filter(e => e.date !== entry.date), entry];
          const updatedState = { ...state, entries: newEntries };
          
          // Update streak after adding entry
          const streak = calculateStreak(newEntries);
          
          return { ...updatedState, streak };
        });
      },

      updateEntry: (id, updates) => {
        set((state) => ({
          entries: state.entries.map(entry =>
            entry.id === id ? { ...entry, ...updates } : entry
          ),
        }));
      },

      deleteEntry: (id) => {
        set((state) => ({
          entries: state.entries.filter(entry => entry.id !== id),
        }));
      },

      addAchievement: (achievement) => {
        set((state) => {
          if (state.achievements.some(a => a.id === achievement.id)) {
            return state; // Achievement already exists
          }
          return {
            achievements: [...state.achievements, achievement],
          };
        });
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
        });
      },
    }),
    {
      name: 'poop-tracker-storage',
      version: 1,
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