'use client';

import { useState, useMemo } from 'react';
import { motion } from 'framer-motion';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Calendar, BarChart3, TrendingUp, Clock, Wheat, Smile } from 'lucide-react';
import { usePoopStore } from '@/lib/store';
import { PoopCalendar } from '@/components/poop-calendar';
import { PoopCharts } from '@/components/poop-charts';
import { format, parseISO, subDays, isAfter } from 'date-fns';

export default function HistoryPage() {
  const { entries, streak } = usePoopStore();
  const [selectedPeriod, setSelectedPeriod] = useState('7');

  const stats = useMemo(() => {
    const now = new Date();
    const periodDays = parseInt(selectedPeriod);
    const startDate = subDays(now, periodDays);
    
    const periodEntries = entries.filter(entry => 
      isAfter(parseISO(entry.date), startDate)
    );

    const totalDays = periodDays;
    const poopDays = periodEntries.filter(e => e.didPoop).length;
    const avgScore = periodEntries.length > 0 
      ? Math.round(periodEntries.reduce((sum, e) => sum + e.score, 0) / periodEntries.length)
      : 0;
    const avgFiber = periodEntries.filter(e => e.didPoop).length > 0
      ? Math.round(periodEntries.filter(e => e.didPoop).reduce((sum, e) => sum + e.fiber, 0) / periodEntries.filter(e => e.didPoop).length)
      : 0;
    const avgDuration = periodEntries.filter(e => e.didPoop).length > 0
      ? Math.round(periodEntries.filter(e => e.didPoop).reduce((sum, e) => sum + e.duration, 0) / periodEntries.filter(e => e.didPoop).length / 60)
      : 0;

    return {
      totalDays,
      poopDays,
      consistency: Math.round((poopDays / totalDays) * 100),
      avgScore,
      avgFiber,
      avgDuration,
    };
  }, [entries, selectedPeriod]);

  return (
    <div className="max-w-6xl mx-auto space-y-6">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <div className="flex items-center justify-between mb-6">
          <h1 className="text-3xl font-bold flex items-center gap-2">
            <Calendar className="w-8 h-8" />
            Your Poop History
          </h1>
          <div className="flex gap-2">
            {['7', '30', '90'].map((days) => (
              <Button
                key={days}
                variant={selectedPeriod === days ? 'default' : 'outline'}
                size="sm"
                onClick={() => setSelectedPeriod(days)}
              >
                {days} days
              </Button>
            ))}
          </div>
        </div>

        {/* Quick Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4 mb-6">
          <Card className="bg-gradient-to-br from-blue-50 to-blue-100 dark:from-blue-950/50 dark:to-blue-900/50">
            <CardContent className="p-4 text-center">
              <TrendingUp className="w-6 h-6 text-blue-600 mx-auto mb-2" />
              <div className="text-2xl font-bold text-blue-700 dark:text-blue-300">{streak}</div>
              <div className="text-sm text-blue-600 dark:text-blue-400">Day Streak</div>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-br from-green-50 to-green-100 dark:from-green-950/50 dark:to-green-900/50">
            <CardContent className="p-4 text-center">
              <div className="text-2xl font-bold text-green-700 dark:text-green-300">{stats.consistency}%</div>
              <div className="text-sm text-green-600 dark:text-green-400">Consistency</div>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-br from-yellow-50 to-yellow-100 dark:from-yellow-950/50 dark:to-yellow-900/50">
            <CardContent className="p-4 text-center">
              <div className="text-2xl font-bold text-yellow-700 dark:text-yellow-300">{stats.avgScore}</div>
              <div className="text-sm text-yellow-600 dark:text-yellow-400">Avg Score</div>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-br from-purple-50 to-purple-100 dark:from-purple-950/50 dark:to-purple-900/50">
            <CardContent className="p-4 text-center">
              <Clock className="w-6 h-6 text-purple-600 mx-auto mb-2" />
              <div className="text-2xl font-bold text-purple-700 dark:text-purple-300">{stats.avgDuration}m</div>
              <div className="text-sm text-purple-600 dark:text-purple-400">Avg Time</div>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-br from-orange-50 to-orange-100 dark:from-orange-950/50 dark:to-orange-900/50">
            <CardContent className="p-4 text-center">
              <Wheat className="w-6 h-6 text-orange-600 mx-auto mb-2" />
              <div className="text-2xl font-bold text-orange-700 dark:text-orange-300">{stats.avgFiber}g</div>
              <div className="text-sm text-orange-600 dark:text-orange-400">Avg Fiber</div>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-br from-pink-50 to-pink-100 dark:from-pink-950/50 dark:to-pink-900/50">
            <CardContent className="p-4 text-center">
              <div className="text-2xl font-bold text-pink-700 dark:text-pink-300">{stats.poopDays}</div>
              <div className="text-sm text-pink-600 dark:text-pink-400">Poop Days</div>
            </CardContent>
          </Card>
        </div>

        {/* Main Content */}
        <Tabs defaultValue="calendar" className="space-y-6">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="calendar" className="flex items-center gap-2">
              <Calendar className="w-4 h-4" />
              Calendar View
            </TabsTrigger>
            <TabsTrigger value="charts" className="flex items-center gap-2">
              <BarChart3 className="w-4 h-4" />
              Charts & Trends
            </TabsTrigger>
          </TabsList>

          <TabsContent value="calendar">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3 }}
            >
              <PoopCalendar entries={entries} />
            </motion.div>
          </TabsContent>

          <TabsContent value="charts">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3 }}
            >
              <PoopCharts entries={entries} period={selectedPeriod} />
            </motion.div>
          </TabsContent>
        </Tabs>
      </motion.div>
    </div>
  );
}