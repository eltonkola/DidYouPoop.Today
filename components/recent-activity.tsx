'use client';

import { useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { Button } from '@/components/ui/button';
import { Calendar, Clock, Wheat, TrendingUp, ArrowRight } from 'lucide-react';
import { usePoopStore } from '@/lib/store';
import { getMoodEmoji, formatDuration, getScoreBadge } from '@/lib/utils';
import { format, parseISO } from 'date-fns';
import { useRouter } from 'next/navigation';

export function RecentActivity() {
  const router = useRouter();
  const { entries } = usePoopStore();

  const recentEntries = useMemo(() => {
    return entries
      .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
      .slice(0, 5);
  }, [entries]);

  if (recentEntries.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Calendar className="w-5 h-5" />
            Recent Activity
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center py-8">
            <div className="text-4xl mb-4">📝</div>
            <h3 className="text-lg font-medium mb-2">No entries yet</h3>
            <p className="text-muted-foreground mb-4">
              Start tracking your poop to see your activity here!
            </p>
            <Button onClick={() => router.push('/log')}>
              Log Your First Poop
            </Button>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2">
            <Calendar className="w-5 h-5" />
            Recent Activity
          </CardTitle>
          <Button 
            variant="ghost" 
            size="sm"
            onClick={() => router.push('/history')}
            className="flex items-center gap-1"
          >
            View All
            <ArrowRight className="w-4 h-4" />
          </Button>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        {recentEntries.map((entry, index) => {
          const badge = getScoreBadge(entry.score);
          const date = parseISO(entry.date);
          
          return (
            <div key={entry.id}>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="text-2xl">
                    {entry.didPoop ? '✅' : '❌'}
                  </div>
                  <div>
                    <div className="font-medium">
                      {format(date, 'MMM d, yyyy')}
                    </div>
                    <div className="text-sm text-muted-foreground">
                      {format(date, 'EEEE')}
                    </div>
                  </div>
                </div>
                
                <div className="flex items-center gap-2">
                  {entry.didPoop && (
                    <>
                      <div className="flex items-center gap-4 text-xs text-muted-foreground">
                        <div className="flex items-center gap-1">
                          <Clock className="w-3 h-3" />
                          {formatDuration(entry.duration)}
                        </div>
                        <div className="flex items-center gap-1">
                          <Wheat className="w-3 h-3" />
                          {entry.fiber}g
                        </div>
                        <div className="flex items-center gap-1">
                          {getMoodEmoji(entry.mood)}
                        </div>
                      </div>
                      <Badge 
                        variant="secondary" 
                        className="text-xs"
                        style={{ 
                          backgroundColor: badge.color + '20', 
                          color: badge.color,
                          border: `1px solid ${badge.color}40`
                        }}
                      >
                        {entry.score}
                      </Badge>
                    </>
                  )}
                </div>
              </div>
              
              {entry.notes && (
                <div className="mt-2 ml-11 text-sm text-muted-foreground bg-muted p-2 rounded text-xs">
                  {entry.notes}
                </div>
              )}
              
              {index < recentEntries.length - 1 && (
                <Separator className="mt-4" />
              )}
            </div>
          );
        })}
        
        <div className="pt-2">
          <Button 
            variant="outline" 
            className="w-full"
            onClick={() => router.push('/history')}
          >
            <TrendingUp className="w-4 h-4 mr-2" />
            View Full History
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}