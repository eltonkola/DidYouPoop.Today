'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useRouter } from 'next/navigation';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { CheckCircle, XCircle, Plus, RotateCcw } from 'lucide-react';
import { usePoopStore } from '@/lib/store';
import { useAuthStore } from '@/lib/auth-store';
import { PoopEntry } from '@/lib/store';
import { getMoodEmoji, formatDuration, getScoreBadge } from '@/lib/utils';
import { format } from 'date-fns';

interface PoopPromptProps {
  todaysEntry: PoopEntry | null;
}

export function PoopPrompt({ todaysEntry }: PoopPromptProps) {
  const router = useRouter();
  const { deleteEntry } = usePoopStore();
  const { user } = useAuthStore();
  const [showConfirmDelete, setShowConfirmDelete] = useState(false);

  const handleDeleteEntry = async () => {
    if (todaysEntry) {
      try {
        await deleteEntry(todaysEntry.id, user?.id);
        setShowConfirmDelete(false);
      } catch (error) {
        console.error('Error deleting entry:', error);
      }
    }
  };

  if (todaysEntry) {
    const badge = getScoreBadge(todaysEntry.score);
    
    return (
      <Card className="bg-gradient-to-br from-green-50 to-emerald-50 dark:from-green-950/50 dark:to-emerald-950/50 border-2 border-green-200 dark:border-green-800">
        <CardHeader className="text-center pb-4">
          <div className="text-6xl mb-2">
            {todaysEntry.didPoop ? '🎉' : '😔'}
          </div>
          <CardTitle className="text-2xl">
            {todaysEntry.didPoop ? 'Great job today!' : 'No poop today'}
          </CardTitle>
          <p className="text-muted-foreground">
            {format(new Date(), 'EEEE, MMMM d, yyyy')}
          </p>
          {user && (
            <Badge variant="secondary" className="mt-2">
              Synced to Cloud ☁️
            </Badge>
          )}
        </CardHeader>
        
        <CardContent className="space-y-4">
          {todaysEntry.didPoop && (
            <>
              <div className="flex items-center justify-center gap-4">
                <Badge 
                  variant="secondary" 
                  className="px-4 py-2 text-lg font-semibold"
                  style={{ backgroundColor: badge.color, color: 'white' }}
                >
                  {todaysEntry.score}/100 - {badge.title}
                </Badge>
              </div>
              
              <Separator />
              
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-center">
                <div>
                  <div className="text-2xl font-bold text-blue-600">
                    {formatDuration(todaysEntry.duration)}
                  </div>
                  <div className="text-sm text-muted-foreground">Duration</div>
                </div>
                
                <div>
                  <div className="text-2xl font-bold text-green-600">
                    {todaysEntry.fiber}g
                  </div>
                  <div className="text-sm text-muted-foreground">Fiber</div>
                </div>
                
                <div>
                  <div className="text-2xl">
                    {getMoodEmoji(todaysEntry.mood)}
                  </div>
                  <div className="text-sm text-muted-foreground capitalize">
                    {todaysEntry.mood}
                  </div>
                </div>
                
                <div>
                  <div className="text-2xl font-bold text-purple-600">
                    {todaysEntry.score}
                  </div>
                  <div className="text-sm text-muted-foreground">Score</div>
                </div>
              </div>
              
              {todaysEntry.notes && (
                <>
                  <Separator />
                  <div className="bg-muted p-3 rounded-lg">
                    <h4 className="font-medium mb-1">Your Notes</h4>
                    <p className="text-sm text-muted-foreground">
                      {todaysEntry.notes}
                    </p>
                  </div>
                </>
              )}
            </>
          )}
          
          <div className="flex flex-col sm:flex-row gap-3 pt-4">
            <Button
              onClick={() => router.push('/log')}
              variant="outline"
              className="flex-1 flex items-center gap-2"
            >
              <RotateCcw className="w-4 h-4" />
              Update Entry
            </Button>
            
            <AnimatePresence>
              {!showConfirmDelete ? (
                <Button
                  onClick={() => setShowConfirmDelete(true)}
                  variant="ghost"
                  size="sm"
                  className="text-red-600 hover:text-red-700 hover:bg-red-50"
                >
                  Delete Entry
                </Button>
              ) : (
                <motion.div
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.95 }}
                  className="flex gap-2"
                >
                  <Button
                    onClick={handleDeleteEntry}
                    variant="destructive"
                    size="sm"
                  >
                    Confirm Delete
                  </Button>
                  <Button
                    onClick={() => setShowConfirmDelete(false)}
                    variant="outline"
                    size="sm"
                  >
                    Cancel
                  </Button>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="bg-gradient-to-br from-amber-50 to-orange-50 dark:from-amber-950/50 dark:to-orange-950/50 border-2 border-amber-200 dark:border-amber-800">
      <CardHeader className="text-center pb-6">
        <motion.div
          animate={{ 
            scale: [1, 1.1, 1],
            rotate: [0, 5, -5, 0]
          }}
          transition={{ 
            duration: 2, 
            repeat: Infinity, 
            repeatDelay: 3 
          }}
          className="text-8xl mb-4"
        >
          💩
        </motion.div>
        <CardTitle className="text-3xl font-bold">
          Did you poop today?
        </CardTitle>
        <p className="text-xl text-muted-foreground">
          {format(new Date(), 'EEEE, MMMM d, yyyy')}
        </p>
        {user && (
          <Badge variant="secondary" className="mt-2">
            Cloud Sync Active ☁️
          </Badge>
        )}
      </CardHeader>
      
      <CardContent className="space-y-6">
        <div className="flex flex-col sm:flex-row gap-4">
          <Button
            onClick={() => router.push('/log')}
            size="lg"
            className="flex-1 text-lg py-6 bg-green-600 hover:bg-green-700"
          >
            <CheckCircle className="w-6 h-6 mr-2" />
            Yes! Let's log it 🎉
          </Button>
          
          <Button
            onClick={() => router.push('/log')}
            size="lg"
            variant="outline"
            className="flex-1 text-lg py-6 border-red-200 text-red-700 hover:bg-red-50"
          >
            <XCircle className="w-6 h-6 mr-2" />
            No, not today 😔
          </Button>
        </div>
        
        <div className="text-center text-sm text-muted-foreground">
          <p>
            Track your daily movements and build healthy habits!
            {user && ' Your data syncs automatically across all devices.'}
          </p>
        </div>
      </CardContent>
    </Card>
  );
}