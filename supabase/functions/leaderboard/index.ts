import { createClient } from 'npm:@supabase/supabase-js@2';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, {
      status: 204,
      headers: corsHeaders,
    });
  }

  try {
    const supabase = createClient(Deno.env.get('SUPABASE_URL') ?? '', Deno.env.get('SUPABASE_ANON_KEY') ?? '', {
      global: {
        headers: {
          Authorization: req.headers.get('Authorization') ?? '',
        },
      },
    });

    // Get the current user from the request
    const { data: { session }, error: sessionError } = await supabase.auth.getSession();
    if (sessionError || !session) {
      return new Response(JSON.stringify({ error: 'Authentication required' }), {
        status: 401,
        headers: {
          ...corsHeaders,
          'Content-Type': 'application/json',
        },
      });
    }

    // Parse query parameters
    const url = new URL(req.url);
    const period = url.searchParams.get('period') || 'day'; // day, week, total
    const limit = parseInt(url.searchParams.get('limit') || '10');

    // Get today's date
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    // Calculate date ranges based on period
    const startDate = new Date(today);
    const endDate = new Date(today);

    switch (period) {
      case 'day':
        break;
      case 'week':
        startDate.setDate(startDate.getDate() - 7);
        break;
      case 'total':
        startDate.setFullYear(2000); // Far in the past
        break;
      default:
        return new Response(JSON.stringify({ error: 'Invalid period' }), {
          status: 400,
          headers: {
            ...corsHeaders,
            'Content-Type': 'application/json',
          },
        });
    }

    // Get all poop entries for the period
    const { data: entries, error: entriesError } = await supabase
      .from('poop_entries')
      .select('user_id, score, created_at')
      .gte('created_at', startDate.toISOString())
      .lte('created_at', endDate.toISOString());

    if (entriesError) {
      return new Response(JSON.stringify({ error: entriesError.message }), {
        status: 500,
        headers: {
          ...corsHeaders,
          'Content-Type': 'application/json',
        },
      });
    }

    // Calculate statistics in memory
    const userStats = new Map<string, { poops: number; totalScore: number }>();

    entries.forEach(entry => {
      const userId = entry.user_id;
      const stats = userStats.get(userId) || { poops: 0, totalScore: 0 };
      stats.poops++;
      stats.totalScore += entry.score;
      userStats.set(userId, stats);
    });

    // Convert to array and add position
    const statsArray = Array.from(userStats.entries())
      .map(([userId, stats]) => ({
        user_id: userId,
        poops: stats.poops,
        averageScore: stats.totalScore / stats.poops,
      }))
      .sort((a, b) => b.poops - a.poops || b.averageScore - a.averageScore)
      .map((stats, index) => ({
        ...stats,
        position: index + 1,
      }));

    // Get top users and user's stats
    const topUsers = statsArray.slice(0, limit);
    const currentUserStats = statsArray.find(s => s.user_id === session.user.id) || {
      user_id: session.user.id,
      poops: 0,
      averageScore: 0,
      position: statsArray.length + 1,
    };

    return new Response(JSON.stringify({
      period,
      topUsers,
      currentUser: currentUserStats,
      userPosition: currentUserStats.position,
    }), {
      status: 200,
      headers: {
        ...corsHeaders,
        'Content-Type': 'application/json',
      },
    });

  } catch (error) {
    console.error('Function error:', error);
    return new Response(JSON.stringify({ error: error?.message ?? String(error) }), {
      status: 500,
      headers: {
        ...corsHeaders,
        'Content-Type': 'application/json',
      },
    });
  }
});
