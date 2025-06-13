'use client';

import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Crown, Sparkles, TrendingUp, Calendar, BarChart3 } from 'lucide-react';
import { useAuthStore } from '@/lib/auth-store';

export function PremiumBanner() {
  const { user } = useAuthStore();

  if (!user || user.subscription_tier === 'premium') return null;

  return (
    <Card className="bg-gradient-to-r from-yellow-50 to-amber-50 dark:from-yellow-950/20 dark:to-amber-950/20 border-yellow-200 dark:border-yellow-800">
      <CardContent className="p-6">
        <div className="flex items-start justify-between">
          <div className="space-y-3">
            <div className="flex items-center gap-2">
              <Crown className="w-5 h-5 text-yellow-600" />
              <h3 className="font-semibold text-yellow-900 dark:text-yellow-100">
                Upgrade to Premium
              </h3>
              <Badge className="bg-yellow-500 hover:bg-yellow-600 text-white">
                <Sparkles className="w-3 h-3 mr-1" />
                New
              </Badge>
            </div>
            
            <p className="text-sm text-yellow-700 dark:text-yellow-300 max-w-md">
              Unlock advanced analytics, unlimited history, custom goals, and premium insights 
              to supercharge your gut health journey!
            </p>
            
            <div className="flex flex-wrap gap-4 text-xs text-yellow-600 dark:text-yellow-400">
              <div className="flex items-center gap-1">
                <BarChart3 className="w-3 h-3" />
                Advanced Analytics
              </div>
              <div className="flex items-center gap-1">
                <Calendar className="w-3 h-3" />
                Unlimited History
              </div>
              <div className="flex items-center gap-1">
                <TrendingUp className="w-3 h-3" />
                Custom Goals
              </div>
            </div>
          </div>
          
          <Button 
            size="sm"
            className="bg-yellow-600 hover:bg-yellow-700 text-white"
          >
            <Crown className="w-4 h-4 mr-2" />
            Upgrade Now
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}