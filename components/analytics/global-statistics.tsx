'use client';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Globe, Users, TrendingUp, TrendingDown, Clock, Leaf, Calendar, BarChart3 } from 'lucide-react';
import { useState, useEffect } from 'react';
import { usePoopStore } from '@/lib/store';
import { useAuthStore } from '@/lib/auth-store';
import { format } from 'date-fns';

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
        const response = await fetch('/api/global-stats');
        if (!response.ok) {
          throw new Error('Failed to fetch global statistics');
        }
        const data = await response.json();
        setStats(data);
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
