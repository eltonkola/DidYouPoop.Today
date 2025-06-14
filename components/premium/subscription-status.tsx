'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { Crown, CreditCard, Calendar, AlertCircle, CheckCircle, Loader2, RefreshCw } from 'lucide-react';
import { useAuthStore } from '@/lib/auth-store';
import { getUserSubscription, getSubscriptionPlan, formatSubscriptionStatus, formatPeriodEnd, UserSubscription } from '@/lib/subscription';
import { restorePurchases, isRevenueCatConfigured } from '@/lib/revenuecat';
import { toast } from 'sonner';

export function SubscriptionStatus() {
  const router = useRouter();
  const { user } = useAuthStore();
  const [subscription, setSubscription] = useState<UserSubscription | null>(null);
  const [loading, setLoading] = useState(true);
  const [restoring, setRestoring] = useState(false);

  useEffect(() => {
    if (user && isRevenueCatConfigured()) {
      loadSubscription();
    } else {
      setLoading(false);
    }
  }, [user]);

  const loadSubscription = async () => {
    try {
      const data = await getUserSubscription();
      setSubscription(data);
    } catch (error) {
      console.error('Error loading subscription:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleRestorePurchases = async () => {
    setRestoring(true);
    try {
      const customerInfo = await restorePurchases();
      if (customerInfo) {
        await loadSubscription();
        toast.success('Purchases restored successfully!');
      } else {
        toast.info('No purchases found to restore');
      }
    } catch (error) {
      console.error('Error restoring purchases:', error);
      toast.error('Failed to restore purchases');
    } finally {
      setRestoring(false);
    }
  };

  const handleUpgradeClick = () => {
    router.push('/premium');
  };

  if (!user) {
    return null;
  }

  if (!isRevenueCatConfigured()) {
    return (
      <Card>
        <CardContent className="p-6">
          <div className="text-center">
            <AlertCircle className="w-8 h-8 text-yellow-600 mx-auto mb-2" />
            <p className="text-sm text-muted-foreground">
              Premium features are not available at this time
            </p>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (loading) {
    return (
      <Card>
        <CardContent className="p-6">
          <div className="flex items-center justify-center">
            <Loader2 className="w-6 h-6 animate-spin" />
            <span className="ml-2">Loading subscription...</span>
          </div>
        </CardContent>
      </Card>
    );
  }

  const plan = getSubscriptionPlan(subscription);

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          {plan.isPremium ? (
            <Crown className="w-5 h-5 text-yellow-600" />
          ) : (
            <CreditCard className="w-5 h-5" />
          )}
          Subscription Status
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex items-center justify-between">
          <span className="font-medium">Current Plan</span>
          <Badge 
            variant={plan.isPremium ? "default" : "secondary"}
            className={plan.isPremium ? "bg-yellow-500 hover:bg-yellow-600 text-white" : ""}
          >
            {plan.isPremium && <Crown className="w-3 h-3 mr-1" />}
            {plan.name}
          </Badge>
        </div>

        <div className="flex items-center justify-between">
          <span className="font-medium">Status</span>
          <div className="flex items-center gap-2">
            {plan.isActive ? (
              <CheckCircle className="w-4 h-4 text-green-600" />
            ) : (
              <AlertCircle className="w-4 h-4 text-yellow-600" />
            )}
            <span className="text-sm">
              {formatSubscriptionStatus(plan.status)}
            </span>
          </div>
        </div>

        {subscription && subscription.expirationDate && (
          <>
            <Separator />
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <span className="font-medium">Expires</span>
                <div className="flex items-center gap-2">
                  <Calendar className="w-4 h-4 text-muted-foreground" />
                  <span className="text-sm">
                    {formatPeriodEnd(subscription.expirationDate)}
                  </span>
                </div>
              </div>
              
              {subscription.willRenew === false && (
                <div className="text-sm text-yellow-600 bg-yellow-50 dark:bg-yellow-950/20 p-2 rounded">
                  ⚠️ Your subscription will not renew automatically
                </div>
              )}
            </div>
          </>
        )}

        <Separator />

        <div className="flex flex-col gap-2">
          <Button
            onClick={handleRestorePurchases}
            disabled={restoring}
            variant="outline"
            size="sm"
            className="w-full"
          >
            {restoring ? (
              <>
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                Restoring...
              </>
            ) : (
              <>
                <RefreshCw className="w-4 h-4 mr-2" />
                Restore Purchases
              </>
            )}
          </Button>

          {!plan.isPremium && (
            <Button 
              size="sm" 
              onClick={handleUpgradeClick}
              className="w-full bg-yellow-600 hover:bg-yellow-700 text-white"
            >
              <Crown className="w-4 h-4 mr-2" />
              Upgrade to Premium
            </Button>
          )}
        </div>
      </CardContent>
    </Card>
  );
}