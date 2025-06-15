import { NextResponse } from 'next/server';
import { PoopEntry } from '@/lib/store';
import { supabase } from '@/lib/supabase';

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

export async function GET() {
  try {
    // Get all entries while maintaining privacy
    const { data: entries, error: entriesError } = await supabase
      .from('poop_entries')
      .select('*')
      .order('created_at', { ascending: true });

    if (entriesError) {
      console.error('Error fetching entries:', entriesError);
      return NextResponse.json({ error: 'Failed to fetch data' }, { status: 500 });
    }

    // Get user count
    const { count: userCount, error: userCountError } = await supabase
      .from('users')
      .select('id', { count: 'exact' });

    if (userCountError) {
      console.error('Error fetching user count:', userCountError);
      return NextResponse.json({ error: 'Failed to fetch data' }, { status: 500 });
    }

    if (!entries || !userCount) {
      return NextResponse.json({ error: 'No data available' }, { status: 404 });
    }

    // Calculate statistics
    const stats = calculateGlobalStats(entries, userCount);

    return NextResponse.json(stats);
  } catch (error) {
    console.error('Error in global-stats endpoint:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

function calculateGlobalStats(entries: PoopEntry[], userCount: number): GlobalStats {
  const totalEntries = entries.length;
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
      const time = new Date(e.createdAt).getHours();
      return time >= 5 && time < 12;
    }).length,
    afternoon: entries.filter(e => {
      const time = new Date(e.createdAt).getHours();
      return time >= 12 && time < 18;
    }).length,
    evening: entries.filter(e => {
      const time = new Date(e.createdAt).getHours();
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
        new Date(e.createdAt).getTime() < new Date(entry.createdAt).getTime()
      );

      if (prevEntry && 
          new Date(entry.createdAt).getTime() - new Date(prevEntry.createdAt).getTime() <= 86400000) {
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
