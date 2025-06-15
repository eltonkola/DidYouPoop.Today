'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { Crown, Sparkles, Check, Loader2, Star, BarChart3, Calendar, TrendingUp, AlertCircle } from 'lucide-react';
import { useAuthStore } from '@/lib/auth-store';
import { toast } from 'sonner';
import { initializeRevenueCat, getOfferings, getCustomerInfo, purchasePackage, isPremiumUser } from '@/lib/revenuecat';

export function PremiumUpgrade() {
  const { user } = useAuthStore();
  const [purchaseLink, setPurchaseLink] = useState<string | null>(null);

  useEffect(() => {
    // Initialize RevenueCat SDK
    if (user) {
      initializeRevenueCat(user.id).catch(error => {
        console.error('Failed to initialize RevenueCat:', error);
        toast.error('Failed to initialize premium features');
      });
    }
  }, [user]);

  const handleUpgrade = async () => {
    try {
      // Get offerings
      const offerings = await getOfferings();
      if (!offerings.length) {
        toast.error('No premium plans available');
        return;
      }

      // Get customer info
      const customerInfo = await getCustomerInfo();
      if (isPremiumUser(customerInfo)) {
        toast.info('You already have a premium subscription');
        return;
      }

      // Show the first offering (you might want to implement a selection UI)
      const offering = offerings[0];
      if (!offering) {
        toast.error('No premium plan found');
        return;
      }

      // Get the first package from the offering
      const packageToPurchase = offering.availablePackages[0];
      if (!packageToPurchase) {
        toast.error('No package found in offering');
        return;
      }

      // Purchase the package
      await purchasePackage(packageToPurchase);
      toast.success('Premium subscription purchased successfully!');
      router.push('/premium/success');
    } catch (error: any) {
      if (error.userCancelled) {
        // User cancelled the purchase
        return;
      }
      console.error('Purchase failed:', error);
      toast.error(error.message || 'Failed to purchase premium subscription');
    }
  };

  const features = [
    {
      icon: BarChart3,
      title: 'Advanced Analytics',
      description: 'Detailed insights into your gut health patterns and trends',
    },
    {
      icon: Calendar,
      title: 'Cross-Device Sync',
      description: 'Access your data from any device with cloud synchronization',
    },
    {
      icon: TrendingUp,
      title: 'Premium Insights',
      description: 'AI-powered recommendations for better digestive health',
    },
    {
      icon: Star,
      title: 'Priority Support',
      description: 'Get help faster with premium customer support',
    },
  ];

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <div className="text-center space-y-4">
        <div className="flex items-center justify-center gap-2 text-6xl mb-4">
          <Crown className="w-16 h-16 text-yellow-600" />
          <Sparkles className="w-12 h-12 text-yellow-500" />
        </div>
        <h1 className="text-4xl font-bold bg-gradient-to-r from-yellow-600 via-orange-600 to-red-600 bg-clip-text text-transparent">
          Upgrade to Premium
        </h1>
        <p className="text-xl text-muted-foreground">
          Unlock advanced features and take your gut health tracking to the next level!
        </p>
      </div>

      <Card className="bg-gradient-to-br from-yellow-50 to-amber-50 dark:from-yellow-950/20 dark:to-amber-950/20 border-2 border-yellow-200 dark:border-yellow-800">
        <CardHeader className="text-center">
          <div className="flex items-center justify-center gap-2 mb-2">
            <Crown className="w-6 h-6 text-yellow-600" />
            <CardTitle className="text-2xl">Premium Plan</CardTitle>
          </div>
          <div className="text-4xl font-bold text-yellow-700 dark:text-yellow-300">
            $4.99/month
          </div>
          <p className="text-muted-foreground">Monthly subscription with all premium features</p>
        </CardHeader>
        
        <CardContent className="space-y-6">
          <div className="space-y-4">
            <h3 className="font-semibold text-lg">What's included:</h3>
            <div className="grid gap-4">
              {features.map((feature, index) => {
                const IconComponent = feature.icon;
                return (
                  <div key={index} className="flex items-start gap-3">
                    <div className="p-2 bg-yellow-100 dark:bg-yellow-900/30 rounded-lg">
                      <IconComponent className="w-5 h-5 text-yellow-600 dark:text-yellow-400" />
                    </div>
                    <div>
                      <h4 className="font-medium">{feature.title}</h4>
                      <p className="text-sm text-muted-foreground">{feature.description}</p>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          <Separator />

          <div className="space-y-4">
            <div className="flex items-center justify-between text-sm">
              <span>Free features included</span>
              <Check className="w-4 h-4 text-green-600" />
            </div>
            <div className="flex items-center justify-between text-sm">
              <span>Cancel anytime</span>
              <Check className="w-4 h-4 text-green-600" />
            </div>
            <div className="flex items-center justify-between text-sm">
              <span>Secure payment processing</span>
              <Check className="w-4 h-4 text-green-600" />
            </div>
          </div>

          <Button
            onClick={handleUpgrade}
            className="w-full bg-gradient-to-r from-yellow-600 to-orange-600 hover:from-yellow-700 hover:to-orange-700 text-white"
          >
            <Crown className="w-4 h-4 mr-2" />
            Upgrade to Premium
          </Button>
        </CardContent>
      </Card>

      <div className="text-center text-sm text-muted-foreground">
        <p>
          Secure payment processing by RevenueCat. Your payment information is encrypted and secure.
        </p>
      </div>
    </div>
  );
}