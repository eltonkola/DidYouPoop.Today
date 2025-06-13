import { PoopEntry } from './store';

export interface AchievementDefinition {
  id: string;
  title: string;
  description: string;
  requirement: string;
  icon: string;
  target: number;
  check: (entries: PoopEntry[]) => number;
}

export const allAchievements: AchievementDefinition[] = [
  {
    id: 'first-poop',
    title: 'First Step',
    description: 'Log your first poop! Everyone starts somewhere.',
    requirement: 'Log 1 poop entry',
    icon: 'Trophy',
    target: 1,
    check: (entries) => entries.filter(e => e.didPoop).length,
  },
  {
    id: 'three-day-streak',
    title: '3-Day Flush',
    description: 'Keep a 3-day poop streak going! Consistency is key.',
    requirement: 'Poop 3 days in a row',
    icon: 'Calendar',
    target: 3,
    check: (entries) => calculateCurrentStreak(entries),
  },
  {
    id: 'week-warrior',
    title: 'Week Warrior',
    description: 'Maintain a perfect week of pooping!',
    requirement: 'Poop 7 days in a row',
    icon: 'Zap',
    target: 7,
    check: (entries) => calculateCurrentStreak(entries),
  },
  {
    id: 'fiber-lord',
    title: 'Fiber Lord',
    description: 'Achieve high fiber intake for multiple days.',
    requirement: 'Log 30g+ fiber for 5 days',
    icon: 'Wheat',
    target: 5,
    check: (entries) => entries.filter(e => e.didPoop && e.fiber >= 30).length,
  },
  {
    id: 'speed-demon',
    title: 'Speed Demon',
    description: 'Quick and efficient bathroom visits!',
    requirement: 'Complete in under 3 minutes, 5 times',
    icon: 'Clock',
    target: 5,
    check: (entries) => entries.filter(e => e.didPoop && e.duration <= 180).length,
  },
  {
    id: 'early-bird',
    title: 'Early Bird',
    description: 'Morning poop routine established!',
    requirement: 'Poop before 8 AM, 3 times',
    icon: 'Clock',
    target: 3,
    check: (entries) => {
      // This is a simplified check - in real app, you'd track time of day
      return entries.filter(e => e.didPoop).length >= 10 ? 3 : 0;
    },
  },
  {
    id: 'happy-pooper',
    title: 'Happy Pooper',
    description: 'Maintain a positive attitude about your gut health!',
    requirement: 'Log 10 happy mood entries',
    icon: 'Award',
    target: 10,
    check: (entries) => entries.filter(e => e.didPoop && e.mood === 'happy').length,
  },
  {
    id: 'century-club',
    title: 'Century Club',
    description: 'Reach the perfect poop score!',
    requirement: 'Score 100 points',
    icon: 'Star',
    target: 1,
    check: (entries) => entries.filter(e => e.score >= 100).length,
  },
  {
    id: 'consistency-king',
    title: 'Consistency King',
    description: 'Track your poop for a full month!',
    requirement: 'Log entries for 30 days',
    icon: 'Target',
    target: 30,
    check: (entries) => entries.length,
  },
  {
    id: 'poop-scholar',
    title: 'Poop Scholar',
    description: 'Document your journey with detailed notes.',
    requirement: 'Add notes to 10 entries',
    icon: 'Award',
    target: 10,
    check: (entries) => entries.filter(e => e.notes && e.notes.trim().length > 0).length,
  },
];

export function checkAchievements(entries: PoopEntry[]): Record<string, number> {
  const progress: Record<string, number> = {};
  
  allAchievements.forEach(achievement => {
    progress[achievement.id] = achievement.check(entries);
  });
  
  return progress;
}

export function getNewAchievements(
  entries: PoopEntry[],
  currentAchievements: { id: string }[]
): AchievementDefinition[] {
  const progress = checkAchievements(entries);
  const currentAchievementIds = new Set(currentAchievements.map(a => a.id));
  
  return allAchievements.filter(achievement => 
    !currentAchievementIds.has(achievement.id) &&
    progress[achievement.id] >= achievement.target
  );
}

function calculateCurrentStreak(entries: PoopEntry[]): number {
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