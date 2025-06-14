'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { Calendar, Zap, Target, Trophy, Heart } from 'lucide-react';
import { PoopPrompt } from '@/components/poop-prompt';
import { QuickStats } from '@/components/quick-stats';
import { RecentActivity } from '@/components/recent-activity';
import { FiberTips } from '@/components/fiber-tips';
import { PremiumBanner } from '@/components/premium/premium-banner';
import { usePoopStore } from '@/lib/store';
import { useAuthStore } from '@/lib/auth-store';
import { getTodaysEntry } from '@/lib/utils';
import { format } from 'date-fns';

export default function Home() {
  const { entries, streak, achievements } = usePoopStore();
  const { user } = useAuthStore();
  const [todaysEntry, setTodaysEntry] = useState<any>(null);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    const today = format(new Date(), 'yyyy-MM-dd');
    const entry = getTodaysEntry(entries, today);
    setTodaysEntry(entry);
  }, [entries]);

  if (!mounted) {
    return <div className="flex items-center justify-center min-h-[400px]">Loading...</div>;
  }

  const isPremium = user?.subscription_tier === 'premium';

  return (
    <div className="max-w-6xl mx-auto space-y-8">
      {/* Hero Section */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="text-center space-y-4"
      >
        <div className="flex items-center justify-center gap-2 text-6xl mb-4">
          💩
          <motion.div
            animate={{ rotate: [0, 10, -10, 0] }}
            transition={{ duration: 2, repeat: Infinity, repeatDelay: 3 }}
          >
            ✨
          </motion.div>
        </div>
        <h1 className="text-4xl md:text-6xl font-bold bg-gradient-to-r from-amber-600 via-orange-600 to-red-600 bg-clip-text text-transparent">
          DidYouPoop.online?
        </h1>
        <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
          The fun and functional way to track your gut health with poop scoring, streaks, and achievements!
        </p>

        {/* Welcome message for authenticated users */}
        {user && (
          <div className="flex items-center justify-center gap-2 mt-4">
            <span className="text-lg">Welcome back,</span>
            <Badge variant="secondary" className="text-lg px-3 py-1">
              {user.user_metadata?.full_name || user.email?.split('@')[0] || 'User'}
            </Badge>
            {isPremium && (
              <Badge className="bg-yellow-500 hover:bg-yellow-600 text-white">
                Premium
              </Badge>
            )}
          </div>
        )}

        {/* Quick Stats Bar */}
        <div className="flex flex-wrap items-center justify-center gap-4 mt-8">
          <Badge variant="secondary" className="px-4 py-2 text-lg">
            <Zap className="w-4 h-4 mr-2" />
            {streak} Day Streak
          </Badge>
          <Badge variant="secondary" className="px-4 py-2 text-lg">
            <Trophy className="w-4 h-4 mr-2" />
            {achievements.length} Achievements
          </Badge>
          <Badge variant="secondary" className="px-4 py-2 text-lg">
            <Calendar className="w-4 h-4 mr-2" />
            {entries.length} Total Logs
          </Badge>
        </div>
      </motion.div>

      <Separator />

      {/* Premium Banner for Free Users */}
      {!user && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.1 }}
        >
          <PremiumBanner />
        </motion.div>
      )}

      {/* Main Content Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Primary Column */}
        <div className="lg:col-span-2 space-y-6">
          {/* Daily Poop Prompt */}
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.5, delay: 0.2 }}
          >
            <PoopPrompt todaysEntry={todaysEntry} />
          </motion.div>

          {/* Recent Activity */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.4 }}
          >
            <RecentActivity />
          </motion.div>
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* Quick Stats */}
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.5, delay: 0.3 }}
          >
            <QuickStats />
          </motion.div>

          {/* Fiber Tips */}
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.5, delay: 0.5 }}
          >
            <FiberTips />
          </motion.div>

          {/* Motivational Card */}
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.5, delay: 0.6 }}
          >
            <Card className="bg-gradient-to-br from-pink-100 to-rose-100 dark:from-pink-900/20 dark:to-rose-900/20 border-pink-200 dark:border-pink-800">
              <CardContent className="p-6 text-center">
                <Heart className="w-8 h-8 text-pink-600 mx-auto mb-3" />
                <h3 className="font-semibold text-pink-900 dark:text-pink-100 mb-2">
                  Remember
                </h3>
                <p className="text-sm text-pink-700 dark:text-pink-200">
                  "Today's poop is tomorrow's peace. Keep tracking your gut health journey!"
                </p>
              </CardContent>
            </Card>
          </motion.div>
        </div>
      </div>
    </div>
  );
}