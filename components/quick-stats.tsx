'use client';

import { useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { TrendingUp, Target, Calendar, Award } from 'lucide-react';
import { usePoopStore } from '@/lib/store';
import { subDays, isAfter, parseISO } from 'date-fns';

export function QuickStats() {
  const { entries, streak, achievements } = usePoopStore();

  const weeklyStats = useMemo(() => {
    const now = new Date();
    const weekAgo = subDays(now, 7);
    
    const weekEntries = entries.filter(entry => 
      isAfter(parseISO(entry.date), weekAgo)
    );
    
    const poopDays = weekEntries.filter(e => e.didPoop).length;
    const totalScore = weekEntries.reduce((sum, e) => sum + e.score, 0);
    const avgScore = weekEntries.length > 0 ? Math.round(totalScore / weekEntries.length) : 0;
    const consistency = Math.round((poopDays / 7) * 100);
    
    return {
      poopDays,
      avgScore,
      consistency,
      totalEntries: weekEntries.length,
    };
  }, [entries]);

  return (
    <Card className="bg-gradient-to-br from-blue-50 to-indigo-50 dark:from-blue-950/50 dark:to-indigo-950/50">
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-lg">
          <TrendingUp className="w-5 h-5" />
          Quick Stats
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Current Streak */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Calendar className="w-4 h-4 text-blue-600" />
            <span className="text-sm font-medium">Current Streak</span>
          </div>
          <Badge variant="secondary" className="bg-blue-100 text-blue-800">
            {streak} days
          </Badge>
        </div>

        {/* Weekly Consistency */}
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Target className="w-4 h-4 text-green-600" />
              <span className="text-sm font-medium">Weekly Consistency</span>
            </div>
            <span className="text-sm text-muted-foreground">
              {weeklyStats.poopDays}/7 days
            </span>
          </div>
          <Progress value={weeklyStats.consistency} className="h-2" />
          <div className="text-xs text-center text-muted-foreground">
            {weeklyStats.consistency}%
          </div>
        </div>

        {/* Average Score */}
        <div className="flex items-center justify-between">
          <span className="text-sm font-medium">Weekly Avg Score</span>
          <Badge 
            variant="outline" 
            className={`${
              weeklyStats.avgScore >= 80 
                ? 'border-green-200 text-green-700 bg-green-50' 
                : weeklyStats.avgScore >= 60
                ? 'border-yellow-200 text-yellow-700 bg-yellow-50'
                : 'border-red-200 text-red-700 bg-red-50'
            }`}
          >
            {weeklyStats.avgScore}/100
          </Badge>
        </div>

        {/* Achievements */}
        <div className="flex items-center justify-between pt-2 border-t">
          <div className="flex items-center gap-2">
            <Award className="w-4 h-4 text-yellow-600" />
            <span className="text-sm font-medium">Achievements</span>
          </div>
          <Badge variant="secondary" className="bg-yellow-100 text-yellow-800">
            {achievements.length}
          </Badge>
        </div>

        {/* Motivational Message */}
        <div className="bg-white/50 dark:bg-gray-800/50 p-3 rounded-lg text-center">
          <p className="text-xs text-muted-foreground">
            {streak > 0 
              ? `Amazing! Keep your ${streak}-day streak alive! 🔥`
              : weeklyStats.consistency > 70
              ? `Great consistency this week! You're doing well! 👍`
              : `Focus on building consistent habits. You've got this! 💪`
            }
          </p>
        </div>
      </CardContent>
    </Card>
  );
}