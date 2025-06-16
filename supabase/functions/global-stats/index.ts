import { createClient } from 'npm:@supabase/supabase-js@2';

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

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type, Authorization, apikey, x-client-info',
  'Access-Control-Max-Age': '86400'
};

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, {
      status: 204,
      headers: corsHeaders
    });
  }

  try {
    const supabase = createClient(Deno.env.get('SUPABASE_URL') ?? '', Deno.env.get('SUPABASE_ANON_KEY') ?? '', {
      global: {
        headers: {
          Authorization: req.headers.get('Authorization') ?? ''
        }
      }
    });

    const { data: entries, error } = await supabase.from('poop_entries').select('*').order('date', {
      ascending: true
    });

    if (error) {
      console.error('Supabase error:', error);
      return new Response(JSON.stringify({
        error: 'Failed to fetch poop entries'
      }), {
        status: 500,
        headers: {
          ...corsHeaders,
          'Content-Type': 'application/json'
        }
      });
    }

    if (!entries || entries.length === 0) {
      return new Response(JSON.stringify({
        error: 'No poop entries found',
        details: 'The poop_entries table is empty or no entries match the query'
      }), {
        status: 404,
        headers: {
          ...corsHeaders,
          'Content-Type': 'application/json'
        }
      });
    }

    // Calculate statistics
    const totalEntries = entries.length;
    const userCount = new Set(entries.map((entry: PoopEntry) => entry.user_id)).size;
    const totalDays = Math.max(1, Math.ceil(totalEntries / userCount));

    // Calculate daily averages
    const dailyAverage = {
      poops: totalEntries / totalDays,
      duration: entries.reduce((sum: number, entry: PoopEntry) => sum + entry.duration, 0) / totalEntries,
      fiber: entries.reduce((sum: number, entry: PoopEntry) => sum + entry.fiber, 0) / totalEntries,
    };

    // Calculate mood distribution
    const moodDistribution = {
      happy: entries.filter((e: PoopEntry) => e.mood === 'happy').length,
      neutral: entries.filter((e: PoopEntry) => e.mood === 'neutral').length,
      sad: entries.filter((e: PoopEntry) => e.mood === 'sad').length,
    };

    // Calculate time of day distribution
    const timeOfDay = {
      morning: entries.filter((e: PoopEntry) => {
        const time = new Date(e.created_at).getHours();
        return time >= 5 && time < 12;
      }).length,
      afternoon: entries.filter((e: PoopEntry) => {
        const time = new Date(e.created_at).getHours();
        return time >= 12 && time < 18;
      }).length,
      evening: entries.filter((e: PoopEntry) => {
        const time = new Date(e.created_at).getHours();
        return time >= 18 || time < 5;
      }).length,
    };

    // Calculate consistency scores
    const consistencyScores = entries.map((entry: PoopEntry) => entry.score);

    // Calculate streak stats
    const streakStats = {
      average: 0,
      longest: 0,
    };

    // Calculate streaks for each user
    const userStreaks = new Map<string, { current: number; longest: number }>();

    entries.forEach((entry: PoopEntry) => {
      const userId = entry.user_id;
      if (!userStreaks.has(userId)) {
        userStreaks.set(userId, { current: 1, longest: 1 });
      } else {
        const streak = userStreaks.get(userId)!;
        const prevEntry = entries.find((e: PoopEntry) => 
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
    streakStats.average = streakData.reduce((sum: number, streak) => sum + streak.longest, 0) / streakData.length;
    streakStats.longest = Math.max(...streakData.map(streak => streak.longest));

    // Create response with calculated statistics
    const stats: GlobalStats = {
      totalUsers: userCount,
      dailyAverage,
      moodDistribution,
      timeOfDay,
      consistencyScores,
      streakStats,
    };

    return new Response(JSON.stringify(stats), {
      status: 200,
      headers: {
        ...corsHeaders,
        'Content-Type': 'application/json'
      }
    });

  } catch (error) {
    console.error('Function error:', error);
    return new Response(JSON.stringify({
      error: error?.message ?? String(error)
    }), {
      status: 500,
      headers: {
        ...corsHeaders,
        'Content-Type': 'application/json'
      }
    });
  }
});
