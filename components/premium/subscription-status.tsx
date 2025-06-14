'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { Crown, CreditCard, Calendar, AlertCircle, CheckCircle, Loader2 } from 'lucide-react';
import { useAuthStore } from '@/lib/auth-store';
import { getUserSubscription, getSubscriptionPlan, formatSubscriptionStatus, formatPeriodEnd, UserSubscription } from '@/lib/subscription';

export function SubscriptionStatus() {
  const router = useRouter();
  const { user } = useAuthStore();
  const [subscription, setSubscription] = useState<UserSubscription | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (user) {
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

  const handleUpgradeClick = () => {
    router.push('/premium');
  };

  if (!user) {
    return null;
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

        {subscription && subscription.current_period_end && (
          <>
            <Separator />
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <span className="font-medium">Billing Period</span>
                <div className="flex items-center gap-2">
                  <Calendar className="w-4 h-4 text-muted-foreground" />
                  <span className="text-sm">
                    {formatPeriodEnd(subscription.current_period_end)}
                  </span>
                </div>
              </div>
              
              {subscription.cancel_at_period_end && (
                <div className="text-sm text-yellow-600 bg-yellow-50 dark:bg-yellow-950/20 p-2 rounded">
                  ⚠️ Your subscription will cancel at the end of the current period
                </div>
              )}
            </div>
          </>
        )}

        {subscription && subscription.payment_method_last4 && (
          <>
            <Separator />
            <div className="flex items-center justify-between">
              <span className="font-medium">Payment Method</span>
              <div className="text-sm">
                {subscription.payment_method_brand?.toUpperCase()} •••• {subscription.payment_method_last4}
              </div>
            </div>
          </>
        )}

        {!plan.isPremium && (
          <>
            <Separator />
            <div className="text-center">
              <p className="text-sm text-muted-foreground mb-3">
                Upgrade to premium for advanced features and cloud sync
              </p>
              <Button 
                size="sm" 
                onClick={handleUpgradeClick}
                className="bg-yellow-600 hover:bg-yellow-700 text-white"
              >
                <Crown className="w-4 h-4 mr-2" />
                Upgrade to Premium
              </Button>
            </div>
          </>
        )}
      </CardContent>
    </Card>
  );
}