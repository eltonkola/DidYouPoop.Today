import { createClient } from '@supabase/supabase-js';

interface PoopEntry {
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

interface GlobalStats {
  totalUsers: number;
  dailyAverage: {
    poops: number;
    duration: number;
    fiber: number;
  };
  moodDistribution: {
    happy: number;
    neutral: number;
    sad: number;
  };
  timeOfDay: {
    morning: number;
    afternoon: number;
    evening: number;
  };
  consistencyScores: number[];
  streakStats: {
    average: number;
    longest: number;
  };
}

export async function calculateGlobalStats(entries: PoopEntry[]): Promise<GlobalStats> {
  const totalEntries = entries.length;
  const userCount = new Set(entries.map(entry => entry.user_id)).size;
  const totalDays = Math.max(1, Math.ceil(totalEntries / userCount));

  // Calculate daily averages
  const dailyAverage = {
    poops: totalEntries / totalDays,
    duration: entries.reduce((sum, entry) => sum + entry.duration, 0) / totalEntries,
    fiber: entries.reduce((sum, entry) => sum + entry.fiber, 0) / totalEntries,
  };

  // Calculate mood distribution
  const moodDistribution = {
    happy: entries.filter(e => e.mood === 'happy').length,
    neutral: entries.filter(e => e.mood === 'neutral').length,
    sad: entries.filter(e => e.mood === 'sad').length,
  };

  // Calculate time of day distribution
  const timeOfDay = {
    morning: entries.filter(e => {
      const time = new Date(e.created_at).getHours();
      return time >= 5 && time < 12;
    }).length,
    afternoon: entries.filter(e => {
      const time = new Date(e.created_at).getHours();
      return time >= 12 && time < 18;
    }).length,
    evening: entries.filter(e => {
      const time = new Date(e.created_at).getHours();
      return time >= 18 || time < 5;
    }).length,
  };

  // Calculate consistency scores
  const consistencyScores = entries.map(e => e.score);

  // Calculate streak statistics
  const streakStats = {
    average: 0,
    longest: 0,
  };

  // Calculate streaks for each user
  const userStreaks = new Map<string, { current: number; longest: number }>();

  entries.forEach(entry => {
    const userId = entry.user_id;
    if (!userStreaks.has(userId)) {
      userStreaks.set(userId, { current: 1, longest: 1 });
    } else {
      const streak = userStreaks.get(userId)!;
      const prevEntry = entries.find(e => 
        e.user_id === userId && 
        new Date(e.created_at).getTime() < new Date(entry.created_at).getTime()
      );

      if (prevEntry && 
          new Date(entry.created_at).getTime() - new Date(prevEntry.created_at).getTime() <= 86400000) {
        streak.current++;
        streak.longest = Math.max(streak.longest, streak.current);
      } else {
        streak.current = 1;
      }
    }
  });

  // Calculate average and longest streak
  const streakData = Array.from(userStreaks.values());
  streakStats.average = streakData.reduce((sum, streak) => sum + streak.longest, 0) / streakData.length;
  streakStats.longest = Math.max(...streakData.map(streak => streak.longest));

  return {
    totalUsers: userCount,
    dailyAverage,
    moodDistribution,
    timeOfDay,
    consistencyScores,
    streakStats,
  };
}

export default async function handler(req: Request) {
  try {
    const supabaseUrl = process.env.SUPABASE_URL;
    const supabaseKey = process.env.SUPABASE_ANON_KEY;

    if (!supabaseUrl || !supabaseKey) {
      return new Response(JSON.stringify({ error: 'Supabase configuration missing' }), {
        status: 500,
        headers: { 'Content-Type': 'application/json' },
      });
    }

    const supabase = createClient(supabaseUrl, supabaseKey);

    // Fetch all entries
    const { data: entries, error: entriesError } = await supabase
      .from('poop_entries')
      .select('*')
      .order('created_at', { ascending: true });

    if (entriesError) {
      return new Response(JSON.stringify({ error: entriesError.message }), {
        status: 500,
        headers: { 'Content-Type': 'application/json' },
      });
    }

    if (!entries || entries.length === 0) {
      return new Response(JSON.stringify({ error: 'No entries found' }), {
        status: 404,
        headers: { 'Content-Type': 'application/json' },
      });
    }

    const stats = await calculateGlobalStats(entries);
    return new Response(JSON.stringify({ data: stats }), {
      headers: { 'Content-Type': 'application/json' },
    });

  } catch (error) {
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' },
    });
  }
}
