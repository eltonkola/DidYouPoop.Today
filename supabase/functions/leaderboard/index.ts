import { createClient } from 'npm:@supabase/supabase-js@2';
import { type Request } from 'https://deno.land/std@0.177.0/http/server.ts';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

Deno.serve(async (req: Request) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, {
      status: 204,
      headers: corsHeaders,
    });
  }

  try {
    // Create Supabase client with service role key
    const supabase = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? '',
      {
        auth: {
          persistSession: false,
          autoRefreshToken: false,
          detectSessionInUrl: false,
        },
      }
    );

    // Parse query parameters
    const url = new URL(req.url);
    const period = url.searchParams.get('period') || 'day'; // day, week, total
    const limit = parseInt(url.searchParams.get('limit') || '10');

    // Get the user ID from the request
    const userId = req.headers.get('x-user-id');
    if (!userId) {
      return new Response(JSON.stringify({ error: 'No user ID provided' }), {
        status: 401,
        headers: {
          ...corsHeaders,
          'Content-Type': 'application/json',
        },
      });
    }

    // Create Supabase client with service role key
    const supabase = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? '',
      {
        auth: {
          persistSession: false,
          autoRefreshToken: false,
          detectSessionInUrl: false,
        },
      }
    );

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
      .lte('created_at', endDate.toISOString())
      .order('created_at', { ascending: true });

    if (entriesError) {
      console.error('Error fetching poop entries:', entriesError);
      return new Response(JSON.stringify({ 
        error: 'Failed to fetch poop entries',
        details: entriesError.message
      }), {
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
    const currentUserStats = statsArray.find(s => s.user_id === userId) || {
      user_id: userId,
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
