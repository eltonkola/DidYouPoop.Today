'use client';

import { useEffect, useState } from 'react';
import { usePoopStore } from '@/lib/store';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { BarChart3, TrendingUp, Calendar, Clock, Globe,  Leaf } from 'lucide-react';
import { format } from 'date-fns';
import { PoopEntry } from '@/lib/store';;
interface AnalyticsData {
  averageDuration: number;
  averageFiber: number;
  moodDistribution: { happy: number; neutral: number; sad: number };
  consistencyScore: number;
  streakStats: {
    longest: number;
    current: number;
    average: number;
  };
  timeOfDay: {
    morning: number;
    afternoon: number;
    evening: number;
  };
}

export function AdvancedAnalytics() {
  const { entries } = usePoopStore();
  const [selectedDateRange, setSelectedDateRange] = useState<'week' | 'month' | 'year'>('month');
  const [analyticsData, setAnalyticsData] = useState<AnalyticsData | null>(null);

  const calculateAnalytics = (entries: PoopEntry[]) => {
    if (entries.length === 0) return null;

    const filteredEntries = entries.filter(entry => {
      const entryDate = new Date(entry.date);
      const now = new Date();
      
      switch (selectedDateRange) {
        case 'week':
          return entryDate >= new Date(now.setDate(now.getDate() - 7));
        case 'month':
          return entryDate >= new Date(now.setMonth(now.getMonth() - 1));
        case 'year':
          return entryDate >= new Date(now.setFullYear(now.getFullYear() - 1));
      }
      return true;
    });

    if (filteredEntries.length === 0) return null;

    const moodDistribution = {
      happy: filteredEntries.filter(e => e.mood === 'happy').length,
      neutral: filteredEntries.filter(e => e.mood === 'neutral').length,
      sad: filteredEntries.filter(e => e.mood === 'sad').length,
    };

    const totalEntries = filteredEntries.length;
    const totalDuration = filteredEntries.reduce((sum, entry) => sum + entry.duration, 0);
    const totalFiber = filteredEntries.reduce((sum, entry) => sum + entry.fiber, 0);

    const timeOfDay = {
      morning: filteredEntries.filter(e => {
        const time = new Date(e.createdAt).getHours();
        return time >= 5 && time < 12;
      }).length,
      afternoon: filteredEntries.filter(e => {
        const time = new Date(e.createdAt).getHours();
        return time >= 12 && time < 18;
      }).length,
      evening: filteredEntries.filter(e => {
        const time = new Date(e.createdAt).getHours();
        return time >= 18 || time < 5;
      }).length,
    };

    const streakStats = {
      longest: 0,
      current: 0,
      average: 0,
    };

    let currentStreak = 0;
    let longestStreak = 0;
    let totalStreaks = 0;

    // Sort entries by date
    const sortedEntries = [...filteredEntries].sort((a, b) => 
      new Date(a.date).getTime() - new Date(b.date).getTime()
    );

    // Calculate streaks
    for (let i = 0; i < sortedEntries.length; i++) {
      if (i === 0 || new Date(sortedEntries[i].date).getTime() === 
          new Date(sortedEntries[i - 1].date).getTime() + 86400000) {
        currentStreak++;
      } else {
        if (currentStreak > 1) {
          totalStreaks++;
          longestStreak = Math.max(longestStreak, currentStreak);
        }
        currentStreak = 1;
      }
    }

    if (currentStreak > 1) {
      totalStreaks++;
      longestStreak = Math.max(longestStreak, currentStreak);
    }

    streakStats.longest = longestStreak;
    streakStats.current = currentStreak;
    streakStats.average = totalStreaks > 0 ? 
      (longestStreak + currentStreak) / totalStreaks : 
      currentStreak;

    return {
      averageDuration: totalDuration / totalEntries,
      averageFiber: totalFiber / totalEntries,
      moodDistribution,
      consistencyScore: Math.round((filteredEntries.filter(e => e.score >= 80).length / totalEntries) * 100),
      streakStats,
      timeOfDay,
    };
  };

  useEffect(() => {
    const data = calculateAnalytics(entries);
    setAnalyticsData(data);
  }, [entries, selectedDateRange]);

  if (!analyticsData) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <Card className="w-full max-w-md">
          <CardHeader>
            <CardTitle>No Data Available</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-center text-muted-foreground">
              No poop data available for the selected time range.
            </p>
          </CardContent>
        </Card>
      </div>
    );
  }

  const dateRangeText = {
    week: 'Last 7 Days',
    month: 'Last 30 Days',
    year: 'Last Year'
  };

  const totalEntries = entries.length;

  return (
    <div className="container mx-auto py-8">
      <div className="flex items-center justify-between mb-8">
        <div className="flex items-center gap-2">
          <BarChart3 className="w-6 h-6 text-blue-500" />
          <h1 className="text-3xl font-bold">Advanced Analytics</h1>
        </div>
        <select
          value={selectedDateRange}
          onChange={(e) => setSelectedDateRange(e.target.value as 'week' | 'month' | 'year')}
          className="px-4 py-2 rounded-lg border bg-background text-foreground"
        >
          <option value="week">Last 7 Days</option>
          <option value="month">Last 30 Days</option>
          <option value="year">Last Year</option>
        </select>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        {/* Duration Analysis */}
        <Card>
          <CardHeader>
            <div className="flex items-center gap-2">
              <Clock className="w-5 h-5 text-orange-500" />
              <CardTitle>Average Duration</CardTitle>
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-orange-600">
              {Math.round(analyticsData.averageDuration / 60)} min
            </div>
            <p className="text-muted-foreground">
              Average time spent on the toilet
            </p>
          </CardContent>
        </Card>

        {/* Fiber Analysis */}
        <Card>
          <CardHeader>
            <div className="flex items-center gap-2">
              <Leaf className="w-5 h-5 text-green-500" />
              <CardTitle>Average Fiber Intake</CardTitle>
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">
              {Math.round(analyticsData.averageFiber)}g
            </div>
            <p className="text-muted-foreground">
              Average daily fiber intake
            </p>
          </CardContent>
        </Card>

        {/* Mood Distribution */}
        <Card>
          <CardHeader>
            <div className="flex items-center gap-2">
              <TrendingUp className="w-5 h-5 text-purple-500" />
              <CardTitle>Mood Distribution</CardTitle>
            </div>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              <div className="flex items-center gap-2">
                <span className="w-2 h-2 bg-green-500 rounded-full" />
                <span>Happy: {analyticsData.moodDistribution.happy} times</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="w-2 h-2 bg-yellow-500 rounded-full" />
                <span>Neutral: {analyticsData.moodDistribution.neutral} times</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="w-2 h-2 bg-red-500 rounded-full" />
                <span>Sad: {analyticsData.moodDistribution.sad} times</span>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Streak Statistics */}
        <Card>
          <CardHeader>
            <div className="flex items-center gap-2">
              <Calendar className="w-5 h-5 text-blue-500" />
              <CardTitle>Streak Statistics</CardTitle>
            </div>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              <div className="flex items-center gap-2">
                <span className="w-2 h-2 bg-blue-500 rounded-full" />
                <span>Longest Streak: {analyticsData.streakStats.longest} days</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="w-2 h-2 bg-blue-500 rounded-full" />
                <span>Current Streak: {analyticsData.streakStats.current} days</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="w-2 h-2 bg-blue-500 rounded-full" />
                <span>Average Streak: {Math.round(analyticsData.streakStats.average)} days</span>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Time of Day Analysis */}
        <Card>
          <CardHeader>
            <div className="flex items-center gap-2">
              <Clock className="w-5 h-5 text-orange-500" />
              <CardTitle>Time of Day Analysis</CardTitle>
            </div>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              <div className="flex items-center gap-2">
                <span className="w-2 h-2 bg-yellow-500 rounded-full" />
                <span>Morning: {analyticsData.timeOfDay.morning} times</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="w-2 h-2 bg-orange-500 rounded-full" />
                <span>Afternoon: {analyticsData.timeOfDay.afternoon} times</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="w-2 h-2 bg-purple-500 rounded-full" />
                <span>Evening: {analyticsData.timeOfDay.evening} times</span>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
