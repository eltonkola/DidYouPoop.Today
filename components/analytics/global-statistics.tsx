'use client';

import { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { BarChart3, TrendingUp, Clock, Leaf } from 'lucide-react';
import { supabase } from '@/lib/supabase';
import { useAuthStore } from '@/lib/auth-store';

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
    const fetchGlobalStats = async () => {
      try {
        if (!user) {
          setError('Please sign in to view global statistics');
          setLoading(false);
          return;
        }

        if (!supabase) {
          setError('Failed to initialize Supabase client. Please try refreshing the page.');
          setLoading(false);
          return;
        }

        // Call the Supabase Edge Function
        const { data, error: fetchError } = await supabase.functions.invoke('global-stats');

        if (fetchError) {
          setError('Failed to fetch global statistics: ' + (fetchError as any).message);
          setLoading(false);
          return;
        }

        if (!data) {
          setError('No data returned from global statistics function');
          setLoading(false);
          return;
        }

        setStats(data);
      } catch (err) {
        console.error('Error fetching global stats:', err);
        setError('Failed to load global statistics. Please try again later.');
      } finally {
        setLoading(false);
      }
    };

    fetchGlobalStats();
  }, [user]);

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

  return (
    <div className="flex items-center justify-center min-h-[400px]">
      <Card className="w-full max-w-md">
        <CardHeader>
          <CardTitle>Global Statistics</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div>
              <div className="flex justify-between items-center">
                <div>
                  <h3 className="text-sm font-medium">Total Users</h3>
                  <p className="mt-1 text-3xl font-semibold">{stats.totalUsers.toLocaleString()}</p>
                </div>
                <div className="w-6 h-6" />
              </div>
            </div>

            <div>
              <div className="flex justify-between items-center">
                <div>
                  <h3 className="text-sm font-medium">Daily Average Poops</h3>
                  <p className="mt-1 text-2xl font-semibold">{stats.dailyAverage.poops.toFixed(1)}</p>
                </div>
                <BarChart3 className="w-6 h-6" />
              </div>
            </div>

            <div>
              <div className="flex justify-between items-center">
                <div>
                  <h3 className="text-sm font-medium">Happy Poop Rate</h3>
                  <p className="mt-1 text-2xl font-semibold">{moodPercentage.toFixed(1)}%</p>
                </div>
                <TrendingUp className="w-6 h-6" />
              </div>
            </div>

            <div>
              <div className="flex justify-between items-center">
                <div>
                  <h3 className="text-sm font-medium">Consistency Score</h3>
                  <p className="mt-1 text-2xl font-semibold">{consistencyScore}%</p>
                </div>
                <Clock className="w-6 h-6" />
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );

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
    const fetchGlobalStats = async () => {
      try {
        if (!user) {
          setError('Please sign in to view global statistics');
          setLoading(false);
          return;
        }

        if (!supabase) {
          setError('Failed to initialize Supabase client. Please try refreshing the page.');
          setLoading(false);
          return;
        }

        // Call the Supabase Edge Function
        const { data, error: fetchError } = await supabase.functions.invoke('global-stats');

        if (fetchError) {
          setError('Failed to fetch global statistics: ' + (fetchError as any).message);
          setLoading(false);
          return;
        }

        if (!data) {
          setError('No data returned from global statistics function');
          setLoading(false);
          return;
        }

        setStats(data);
      } catch (err) {
        console.error('Error fetching global stats:', err);
        setError('Failed to load global statistics. Please try again later.');
      } finally {
        setLoading(false);
      }
    };

    fetchGlobalStats();
  }, [user]);

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

  return (
    <div className="flex items-center justify-center min-h-[400px]">
      <Card className="w-full max-w-md">
        <CardHeader>
          <CardTitle>Global Statistics</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div>
              <div className="flex justify-between items-center">
                <div>
                  <h3 className="text-sm font-medium">Total Users</h3>
                  <p className="mt-1 text-3xl font-semibold">{stats.totalUsers.toLocaleString()}</p>
                </div>
                <div className="w-6 h-6" />
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
