'use client';

import { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { BarChart3, TrendingUp, Clock, Leaf, Globe } from 'lucide-react';
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

interface GlobalStatisticsProps {
  isPremium: boolean;
}

export function GlobalStatistics({ isPremium }: GlobalStatisticsProps) {
  const [stats, setStats] = useState<GlobalStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchGlobalStats = async () => {
      try {
        if (!isPremium) {
          setError('Global statistics are available to premium users only');
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

        // Calculate derived statistics from the received data
        const moodPercentage = (data.moodDistribution.happy / 
          (data.moodDistribution.happy + data.moodDistribution.neutral + data.moodDistribution.sad)) * 100;
        const consistencyScore = Math.round((data.consistencyScores.filter((score: number) => score >= 80).length / data.consistencyScores.length) * 100);

        setStats({
          ...data,
          moodPercentage,
          consistencyScore
        });
      } catch (err) {
        console.error('Error fetching global stats:', err);
        setError('Failed to load global statistics. Please try again later.');
      } finally {
        setLoading(false);
      }
    };

    fetchGlobalStats();
  }, [isPremium]);

  if (loading) {
    return (
      <div className="container mx-auto py-8">
        <Card>
          <CardHeader>
            <div className="flex items-center gap-2">
              <Globe className="w-6 h-6 text-blue-500 animate-spin" />
              <CardTitle>Loading Global Statistics</CardTitle>
            </div>
          </CardHeader>
          <CardContent>
            <div className="flex items-center justify-center h-48">
              <div className="text-center">
                <BarChart3 className="w-8 h-8 animate-spin mx-auto" />
                <p className="mt-2 text-muted-foreground">
                  Analyzing global poop data...
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (error) {
    return (
      <div className="container mx-auto py-8">
        <Card>
          <CardHeader>
            <div className="flex items-center gap-2">
              <Globe className="w-6 h-6 text-red-500" />
              <CardTitle>Global Statistics</CardTitle>
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-center">
              <p className="text-red-500 mb-2">{error}</p>
              <p className="text-muted-foreground">
                Please try refreshing the page or contact support if the issue persists.
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (!stats) {
    return (
      <div className="container mx-auto py-8">
        <Card>
          <CardHeader>
            <div className="flex items-center gap-2">
              <Globe className="w-6 h-6 text-gray-400" />
              <CardTitle>Global Statistics</CardTitle>
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-center">
              <p className="text-muted-foreground">
                No global statistics available yet.
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  // Calculate some derived statistics
  const moodPercentage = (stats.moodDistribution.happy / 
    (stats.moodDistribution.happy + stats.moodDistribution.neutral + stats.moodDistribution.sad)) * 100;
  const consistencyScore = Math.round((stats.consistencyScores.filter(score => score >= 80).length / stats.consistencyScores.length) * 100);

  return (
    <div className="container mx-auto py-8">
      <Card>
        <CardHeader>
          <div className="flex items-center gap-2">
            <Globe className="w-6 h-6 text-blue-500" />
            <CardTitle>Global Statistics</CardTitle>
          </div>
        </CardHeader>
        <CardContent>
          <div className="grid gap-6 md:grid-cols-2">
            <div className="flex justify-between items-center">
              <div>
                <h3 className="text-sm font-medium">Total Users</h3>
                <p className="mt-1 text-3xl font-semibold">{stats.totalUsers.toLocaleString()}</p>
              </div>
              <div className="w-6 h-6" />
            </div>

            <div className="flex justify-between items-center">
              <div>
                <h3 className="text-sm font-medium">Daily Average Poops</h3>
                <p className="mt-1 text-2xl font-semibold">{stats.dailyAverage.poops.toFixed(1)}</p>
              </div>
              <BarChart3 className="w-6 h-6 text-orange-500" />
            </div>

            <div className="flex justify-between items-center">
              <div>
                <h3 className="text-sm font-medium">Happy Poop Rate</h3>
                <p className="mt-1 text-2xl font-semibold">{moodPercentage.toFixed(1)}%</p>
              </div>
              <TrendingUp className="w-6 h-6 text-green-500" />
            </div>

            <div className="flex justify-between items-center">
              <div>
                <h3 className="text-sm font-medium">Consistency Score</h3>
                <p className="mt-1 text-2xl font-semibold">{consistencyScore}%</p>
              </div>
              <Clock className="w-6 h-6 text-blue-500" />
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}