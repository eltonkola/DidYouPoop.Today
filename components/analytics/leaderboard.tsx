import { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Crown, ArrowUp, ArrowDown } from 'lucide-react';
import { supabase } from '@/lib/supabase';
import { useAuthStore } from '@/lib/auth-store';

interface LeaderboardEntry {
  user_id: string;
  poops: number;
  averageScore: number;
  position: number;
}

interface LeaderboardData {
  period: string;
  topUsers: LeaderboardEntry[];
  currentUser: LeaderboardEntry;
  userPosition: number;
}

export function Leaderboard() {
  const { user } = useAuthStore();
  const [data, setData] = useState<LeaderboardData | null>(null);
  const [loading, setLoading] = useState(true);
  const [period, setPeriod] = useState<'day' | 'week' | 'total'>('day');

  useEffect(() => {
    const fetchLeaderboard = async () => {
      try {
        if (!user) {
          setData(null);
          setLoading(false);
          return;
        }

        const { data, error } = await supabase.functions.invoke('leaderboard', {
          headers: {
            'x-user-id': user.id,
          },
          body: {
            period,
            limit: 10,
          },
        });

        if (error) throw error;
        setData(data);
      } catch (error) {
        console.error('Error fetching leaderboard:', error);
        setData(null);
      } finally {
        setLoading(false);
      }
    };

    fetchLeaderboard();
  }, [user, period]);

  if (loading) {
    return (
      <Card className="p-6">
        <CardHeader>
          <CardTitle>Loading leaderboard...</CardTitle>
        </CardHeader>
      </Card>
    );
  }

  if (!data) {
    return (
      <Card className="p-6">
        <CardHeader>
          <CardTitle>Failed to load leaderboard</CardTitle>
        </CardHeader>
      </Card>
    );
  }

  return (
    <Card className="p-6 space-y-4">
      <CardHeader>
        <CardTitle>Leaderboard</CardTitle>
      </CardHeader>

      {/* Period Selector */}
      <div className="flex gap-2">
        <Button
          variant={period === 'day' ? 'default' : 'outline'}
          size="sm"
          onClick={() => setPeriod('day')}
        >
          Today
        </Button>
        <Button
          variant={period === 'week' ? 'default' : 'outline'}
          size="sm"
          onClick={() => setPeriod('week')}
        >
          This Week
        </Button>
        <Button
          variant={period === 'total' ? 'default' : 'outline'}
          size="sm"
          onClick={() => setPeriod('total')}
        >
          All Time
        </Button>
      </div>

      {/* Top Users List */}
      <div className="space-y-2">
        {data.topUsers.map((user, index) => (
          <div
            key={user.user_id}
            className="flex items-center justify-between p-2 rounded-lg hover:bg-muted/50"
          >
            <div className="flex items-center gap-3">
              <span className="w-6 h-6 rounded-full bg-primary/10 flex items-center justify-center">
                {index + 1}
              </span>
              <div>
                <p className="font-medium">User #{user.user_id.slice(0, 4)}</p>
                <p className="text-sm text-muted-foreground">
                  {user.poops} poops • Score: {user.averageScore.toFixed(1)}
                </p>
              </div>
            </div>
            {index === 0 && <Crown className="w-5 h-5 text-yellow-500" />}
          </div>
        ))}
      </div>

      {/* Your Position */}
      <div className="border-t pt-4">
        <h3 className="text-lg font-semibold">Your Position</h3>
        <div className="mt-2 p-4 bg-muted/50 rounded-lg">
          <p className="text-2xl font-bold">
            #{data.userPosition}
          </p>
          <p className="text-sm text-muted-foreground">
            {data.currentUser.poops} poops • Score: {data.currentUser.averageScore.toFixed(1)}
          </p>
        </div>
      </div>
    </Card>
  );
}
