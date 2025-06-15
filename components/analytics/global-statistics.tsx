'use client';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Globe, Users, TrendingUp, TrendingDown, Clock, Leaf, Calendar, BarChart3 } from 'lucide-react';
import { useState, useEffect } from 'react';
import { usePoopStore } from '@/lib/store';
import { useAuthStore } from '@/lib/auth-store';
import { format } from 'date-fns';
import { supabase } from '@/lib/supabase';
import { isSupabaseConfigured } from '@/lib/supabase';
import { PoopEntry } from '@/lib/store';

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

export function GlobalStatistics() {
  const { user } = useAuthStore();
  const [stats, setStats] = useState<GlobalStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!isSupabaseConfigured()) {
      setError('Supabase is not configured');
      setLoading(false);
      return;
    }

    const fetchGlobalStats = async () => {
      try {
        if (!supabase) {
          throw new Error('Supabase client is not initialized');
        }

        // Fetch entries while maintaining privacy
        const { data: entries, error: entriesError } = await supabase
          .from('poop_entries')
          .select('*')
          .order('created_at', { ascending: true });

        if (entriesError) {
          throw new Error('Failed to fetch entries: ' + entriesError.message);
        }

        // Fetch user count
        const { count: userCount, error: userCountError } = await supabase
          .from('profiles')
          .select('id', { count: 'exact' });

        if (userCountError) {
          throw new Error('Failed to fetch user count: ' + userCountError.message);
        }

        if (!entries || entries.length === 0 || !userCount) {
          throw new Error('No data available in the database');
        }

        const stats = calculateGlobalStats(entries, userCount);
        setStats(stats);
      } catch (err) {
        console.error('Error fetching global stats:', err);
        setError('Failed to load global statistics. Please try again later.');
      } finally {
        setLoading(false);
      }
    };

    fetchGlobalStats();
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <Card className="w-full max-w-md">
          <CardHeader>
            <CardTitle>Global Statistics</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center justify-center space-x-2">
              <BarChart3 className="w-6 h-6 animate-spin" />
              <span>Loading global statistics...</span>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <Card className="w-full max-w-md">
          <CardHeader>
            <CardTitle>Global Statistics</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-red-500">{error}</p>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (!stats) {
    return null;
  }

  // Calculate some derived statistics
  const moodPercentage = (stats.moodDistribution.happy / 
    (stats.moodDistribution.happy + stats.moodDistribution.neutral + stats.moodDistribution.sad)) * 100;
  const consistencyScore = Math.round((stats.consistencyScores.filter(score => score >= 80).length / stats.consistencyScores.length) * 100);

  const calculateGlobalStats = (entries: PoopEntry[], userCount: number): GlobalStats => {
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
  };

  return (
    <div className="container mx-auto py-8">
      <div className="flex items-center justify-between mb-8">
        <div className="flex items-center gap-2">
          <Globe className="w-6 h-6 text-blue-500" />
          <h1 className="text-3xl font-bold">Global Statistics</h1>
        </div>
      </div>

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {/* User Base */}
        <Card>
          <CardHeader>
            <div className="flex items-center gap-2">
              <Users className="w-5 h-5 text-purple-500" />
              <CardTitle>Total Users</CardTitle>
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-purple-600">
              {stats.totalUsers.toLocaleString()}
            </div>
            <p className="text-muted-foreground">
              Active users in our community
            </p>
          </CardContent>
        </Card>

        {/* Daily Poop Stats */}
        <Card>
          <CardHeader>
            <div className="flex items-center gap-2">
              <BarChart3 className="w-5 h-5 text-blue-500" />
              <CardTitle>Daily Poop Stats</CardTitle>
            </div>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <span>Average Poops</span>
                <span className="text-blue-600 font-medium">
                  {stats.dailyAverage.poops.toFixed(1)} per day
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span>Average Duration</span>
                <span className="text-blue-600 font-medium">
                  {Math.round(stats.dailyAverage.duration / 60)} min
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span>Average Fiber</span>
                <span className="text-blue-600 font-medium">
                  {stats.dailyAverage.fiber.toFixed(1)}g
                </span>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Mood Distribution */}
        <Card>
          <CardHeader>
            <div className="flex items-center gap-2">
              <TrendingUp className="w-5 h-5 text-green-500" />
              <CardTitle>Mood Distribution</CardTitle>
            </div>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              <div className="flex items-center gap-2">
                <span className="w-2 h-2 bg-green-500 rounded-full" />
                <span>Happy: {moodPercentage.toFixed(1)}%</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="w-2 h-2 bg-yellow-500 rounded-full" />
                <span>Neutral: {(stats.moodDistribution.neutral / 
                  (stats.moodDistribution.happy + stats.moodDistribution.neutral + stats.moodDistribution.sad) * 100).toFixed(1)}%</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="w-2 h-2 bg-red-500 rounded-full" />
                <span>Sad: {(stats.moodDistribution.sad / 
                  (stats.moodDistribution.happy + stats.moodDistribution.neutral + stats.moodDistribution.sad) * 100).toFixed(1)}%</span>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Time of Day */}
        <Card>
          <CardHeader>
            <div className="flex items-center gap-2">
              <Clock className="w-5 h-5 text-orange-500" />
              <CardTitle>Time of Day</CardTitle>
            </div>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              <div className="flex items-center gap-2">
                <span className="w-2 h-2 bg-yellow-500 rounded-full" />
                <span>Morning: {(stats.timeOfDay.morning / 
                  (stats.timeOfDay.morning + stats.timeOfDay.afternoon + stats.timeOfDay.evening) * 100).toFixed(1)}%</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="w-2 h-2 bg-orange-500 rounded-full" />
                <span>Afternoon: {(stats.timeOfDay.afternoon / 
                  (stats.timeOfDay.morning + stats.timeOfDay.afternoon + stats.timeOfDay.evening) * 100).toFixed(1)}%</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="w-2 h-2 bg-purple-500 rounded-full" />
                <span>Evening: {(stats.timeOfDay.evening / 
                  (stats.timeOfDay.morning + stats.timeOfDay.afternoon + stats.timeOfDay.evening) * 100).toFixed(1)}%</span>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Streak Stats */}
        <Card>
          <CardHeader>
            <div className="flex items-center gap-2">
              <Calendar className="w-5 h-5 text-blue-500" />
              <CardTitle>Streak Statistics</CardTitle>
            </div>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <span>Longest Streak</span>
                <span className="text-blue-600 font-medium">
                  {stats.streakStats.longest} days
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span>Average Streak</span>
                <span className="text-blue-600 font-medium">
                  {stats.streakStats.average.toFixed(1)} days
                </span>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Consistency */}
        <Card>
          <CardHeader>
            <div className="flex items-center gap-2">
              <Leaf className="w-5 h-5 text-green-500" />
              <CardTitle>Consistency Score</CardTitle>
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">
              {consistencyScore}%
            </div>
            <p className="text-muted-foreground">
              Percentage of users with high consistency
            </p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
