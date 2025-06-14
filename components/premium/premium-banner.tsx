'use client';

import { useState } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Crown, Sparkles, TrendingUp, Calendar, BarChart3, X } from 'lucide-react';
import { AuthModal } from '@/components/auth/auth-modal';

export function PremiumBanner() {
  const [showAuthModal, setShowAuthModal] = useState(false);
  const [dismissed, setDismissed] = useState(false);

  if (dismissed) return null;

  return (
    <>
      <Card className="bg-gradient-to-r from-yellow-50 to-amber-50 dark:from-yellow-950/20 dark:to-amber-950/20 border-yellow-200 dark:border-yellow-800 relative">
        <Button
          variant="ghost"
          size="sm"
          onClick={() => setDismissed(true)}
          className="absolute top-2 right-2 h-6 w-6 p-0 text-yellow-600 hover:text-yellow-700"
        >
          <X className="w-4 h-4" />
        </Button>
        
        <CardContent className="p-6">
          <div className="flex items-start justify-between pr-8">
            <div className="space-y-3">
              <div className="flex items-center gap-2">
                <Crown className="w-5 h-5 text-yellow-600" />
                <h3 className="font-semibold text-yellow-900 dark:text-yellow-100">
                  Upgrade to Premium
                </h3>
                <Badge className="bg-yellow-500 hover:bg-yellow-600 text-white">
                  <Sparkles className="w-3 h-3 mr-1" />
                  Cloud Sync
                </Badge>
              </div>
              
              <p className="text-sm text-yellow-700 dark:text-yellow-300 max-w-md">
                Sign up to sync your data across devices, get advanced analytics, 
                and unlock premium insights to supercharge your gut health journey!
              </p>
              
              <div className="flex flex-wrap gap-4 text-xs text-yellow-600 dark:text-yellow-400">
                <div className="flex items-center gap-1">
                  <BarChart3 className="w-3 h-3" />
                  Advanced Analytics
                </div>
                <div className="flex items-center gap-1">
                  <Calendar className="w-3 h-3" />
                  Cross-Device Sync
                </div>
                <div className="flex items-center gap-1">
                  <TrendingUp className="w-3 h-3" />
                  Premium Insights
                </div>
              </div>
            </div>
            
            <Button 
              size="sm"
              onClick={() => setShowAuthModal(true)}
              className="bg-yellow-600 hover:bg-yellow-700 text-white"
            >
              <Crown className="w-4 h-4 mr-2" />
              Sign Up Free
            </Button>
          </div>
        </CardContent>
      </Card>

      <AuthModal
        isOpen={showAuthModal}
        onClose={() => setShowAuthModal(false)}
        defaultMode="signup"
      />
    </>
  );
}