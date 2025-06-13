'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useRouter } from 'next/navigation';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Separator } from '@/components/ui/separator';
import { ArrowLeft, Trophy, Target, Clock, Wheat, Smile } from 'lucide-react';
import { usePoopStore } from '@/lib/store';
import { getScoreBadge, getScoreMessage } from '@/lib/utils';
import { ConfettiCelebration } from '@/components/confetti-celebration';
import { format } from 'date-fns';

export default function ScorePage() {
  const router = useRouter();
  const { entries } = usePoopStore();
  const [latestEntry, setLatestEntry] = useState<any>(null);
  const [showCelebration, setShowCelebration] = useState(false);

  useEffect(() => {
    const today = format(new Date(), 'yyyy-MM-dd');
    const entry = entries.find(e => e.date === today) || null;
    setLatestEntry(entry);
    
    if (entry && entry.didPoop && entry.score > 70) {
      setShowCelebration(true);
    }
  }, [entries]);

  if (!latestEntry) {
    return (
      <div className="max-w-2xl mx-auto text-center">
        <h1 className="text-2xl font-bold mb-4">No entry found</h1>
        <p className="text-muted-foreground mb-6">
          You haven't logged anything for today yet.
        </p>
        <Button onClick={() => router.push('/log')}>
          Log Your Poop
        </Button>
      </div>
    );
  }

  const { score, didPoop } = latestEntry;
  const badge = getScoreBadge(score);
  const message = getScoreMessage(score, didPoop);

  return (
    <div className="max-w-2xl mx-auto">
      {showCelebration && <ConfettiCelebration />}

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <div className="flex items-center gap-4 mb-6">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => router.push('/')}
            className="flex items-center gap-2"
          >
            <ArrowLeft className="w-4 h-4" />
            Home
          </Button>
          <h1 className="text-3xl font-bold">Your Poop Score</h1>
        </div>

        <div className="space-y-6">
          {/* Score Card */}
          <Card className="bg-gradient-to-br from-amber-50 to-orange-50 dark:from-amber-950/50 dark:to-orange-950/50 border-2 border-amber-200 dark:border-amber-800">
            <CardHeader className="text-center pb-4">
              <div className="text-6xl mb-4">
                {didPoop ? '🎯' : '😔'}
              </div>
              <CardTitle className="text-4xl font-bold text-amber-700 dark:text-amber-300">
                {score}/100
              </CardTitle>
            </CardHeader>
            <CardContent className="text-center space-y-4">
              <Badge 
                variant="secondary" 
                className="px-4 py-2 text-lg font-semibold"
                style={{ backgroundColor: badge.color, color: 'white' }}
              >
                <Trophy className="w-4 h-4 mr-2" />
                {badge.title}
              </Badge>
              
              <Progress 
                value={score} 
                className="w-full h-4"
              />
              
              <p className="text-lg text-muted-foreground max-w-md mx-auto">
                {message}
              </p>
            </CardContent>
          </Card>

          {didPoop && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.2 }}
            >
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Target className="w-5 h-5" />
                    Score Breakdown
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                    <div className="text-center p-4 bg-blue-50 dark:bg-blue-950/20 rounded-lg">
                      <Clock className="w-6 h-6 text-blue-600 mx-auto mb-2" />
                      <div className="font-semibold">{Math.floor(latestEntry.duration / 60)} min</div>
                      <div className="text-sm text-muted-foreground">Duration</div>
                    </div>
                    
                    <div className="text-center p-4 bg-green-50 dark:bg-green-950/20 rounded-lg">
                      <Wheat className="w-6 h-6 text-green-600 mx-auto mb-2" />
                      <div className="font-semibold">{latestEntry.fiber}g</div>
                      <div className="text-sm text-muted-foreground">Fiber</div>
                    </div>
                    
                    <div className="text-center p-4 bg-yellow-50 dark:bg-yellow-950/20 rounded-lg">
                      <Smile className="w-6 h-6 text-yellow-600 mx-auto mb-2" />
                      <div className="font-semibold capitalize">{latestEntry.mood}</div>
                      <div className="text-sm text-muted-foreground">Mood</div>
                    </div>
                  </div>

                  {latestEntry.notes && (
                    <>
                      <Separator />
                      <div>
                        <h4 className="font-medium mb-2">Your Notes</h4>
                        <p className="text-muted-foreground bg-muted p-3 rounded-lg">
                          {latestEntry.notes}
                        </p>
                      </div>
                    </>
                  )}
                </CardContent>
              </Card>
            </motion.div>
          )}

          {/* Action Buttons */}
          <div className="flex flex-col sm:flex-row gap-4">
            <Button 
              onClick={() => router.push('/history')}
              variant="outline"
              className="flex-1"
            >
              View History
            </Button>
            <Button 
              onClick={() => router.push('/achievements')}
              variant="outline"
              className="flex-1"
            >
              Check Achievements
            </Button>
            <Button 
              onClick={() => router.push('/')}
              className="flex-1"
            >
              Back to Home
            </Button>
          </div>
        </div>
      </motion.div>
    </div>
  );
}