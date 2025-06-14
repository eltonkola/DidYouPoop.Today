'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { Crown, Sparkles, Check, Loader2, Star, BarChart3, Calendar, TrendingUp } from 'lucide-react';
import { useAuthStore } from '@/lib/auth-store';
import { revenueCat, SubscriptionStatus } from '@/lib/revenuecat';
import { toast } from 'sonner';
import { PurchasesOffering, PurchasesPackage } from 'revenuecat-web';

export function PremiumUpgrade() {
  const { user } = useAuthStore();
  const [loading, setLoading] = useState(false);
  const [offerings, setOfferings] = useState<PurchasesOffering[]>([]);
  const [subscriptionStatus, setSubscriptionStatus] = useState<SubscriptionStatus | null>(null);
  const [initLoading, setInitLoading] = useState(true);

  useEffect(() => {
    initializeRevenueCat();
  }, [user]);

  const initializeRevenueCat = async () => {
    try {
      setInitLoading(true);
      
      // Initialize RevenueCat
      await revenueCat.initialize(user?.id);
      
      // Set user ID if authenticated
      if (user?.id) {
        await revenueCat.setUserId(user.id);
      }
      
      // Get offerings and subscription status
      const [offeringsData, statusData] = await Promise.all([
        revenueCat.getOfferings(),
        revenueCat.getSubscriptionStatus(),
      ]);
      
      setOfferings(offeringsData);
      setSubscriptionStatus(statusData);
    } catch (error) {
      console.error('Failed to initialize RevenueCat:', error);
      toast.error('Failed to load subscription options');
    } finally {
      setInitLoading(false);
    }
  };

  const handleUpgrade = async (packageToPurchase: PurchasesPackage) => {
    if (!user) {
      toast.error('Please sign in to upgrade to premium');
      return;
    }

    setLoading(true);
    
    try {
      // Purchase the package
      const customerInfo = await revenueCat.purchasePackage(packageToPurchase);
      
      // Check if purchase was successful
      const premiumEntitlement = customerInfo.entitlements.active['premium'];
      
      if (premiumEntitlement) {
        toast.success('Welcome to Premium! 🎉');
        
        // Update subscription status
        const newStatus = await revenueCat.getSubscriptionStatus();
        setSubscriptionStatus(newStatus);
        
        // Redirect to success page
        window.location.href = '/premium/success';
      } else {
        toast.error('Purchase completed but premium access not activated. Please contact support.');
      }
    } catch (error: any) {
      console.error('Purchase error:', error);
      
      if (error.userCancelled) {
        toast.info('Purchase cancelled');
      } else {
        toast.error(error.message || 'Purchase failed. Please try again.');
      }
    } finally {
      setLoading(false);
    }
  };

  const handleRestorePurchases = async () => {
    setLoading(true);
    
    try {
      const customerInfo = await revenueCat.restorePurchases();
      const premiumEntitlement = customerInfo.entitlements.active['premium'];
      
      if (premiumEntitlement) {
        toast.success('Premium subscription restored! 🎉');
        const newStatus = await revenueCat.getSubscriptionStatus();
        setSubscriptionStatus(newStatus);
      } else {
        toast.info('No premium subscription found to restore');
      }
    } catch (error: any) {
      console.error('Restore error:', error);
      toast.error('Failed to restore purchases');
    } finally {
      setLoading(false);
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

  if (initLoading) {
    return (
      <div className="max-w-2xl mx-auto space-y-6">
        <div className="text-center space-y-4">
          <div className="flex items-center justify-center gap-2 text-6xl mb-4">
            <Crown className="w-16 h-16 text-yellow-600" />
            <Sparkles className="w-12 h-12 text-yellow-500" />
          </div>
          <h1 className="text-4xl font-bold bg-gradient-to-r from-yellow-600 via-orange-600 to-red-600 bg-clip-text text-transparent">
            Loading Premium Options...
          </h1>
          <div className="flex items-center justify-center">
            <Loader2 className="w-8 h-8 animate-spin" />
          </div>
        </div>
      </div>
    );
  }

  // If user is already premium
  if (subscriptionStatus?.isPremium) {
    return (
      <div className="max-w-2xl mx-auto space-y-6">
        <div className="text-center space-y-4">
          <div className="flex items-center justify-center gap-2 text-6xl mb-4">
            <Crown className="w-16 h-16 text-yellow-600" />
            <Sparkles className="w-12 h-12 text-yellow-500" />
          </div>
          <h1 className="text-4xl font-bold bg-gradient-to-r from-yellow-600 via-orange-600 to-red-600 bg-clip-text text-transparent">
            You're Already Premium!
          </h1>
          <p className="text-xl text-muted-foreground">
            Enjoy all the premium features and thank you for your support!
          </p>
          
          <Card className="bg-gradient-to-br from-yellow-50 to-amber-50 dark:from-yellow-950/20 dark:to-amber-950/20 border-2 border-yellow-200 dark:border-yellow-800">
            <CardContent className="p-6 text-center">
              <Badge className="bg-yellow-500 hover:bg-yellow-600 text-white text-lg px-4 py-2 mb-4">
                <Crown className="w-4 h-4 mr-2" />
                Premium Active
              </Badge>
              
              {subscriptionStatus.expirationDate && (
                <p className="text-sm text-muted-foreground">
                  {subscriptionStatus.willRenew ? 'Renews' : 'Expires'} on{' '}
                  {subscriptionStatus.expirationDate.toLocaleDateString()}
                </p>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

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

      {/* Subscription Options */}
      {offerings.length > 0 ? (
        <div className="space-y-4">
          {offerings.map((offering) => (
            <div key={offering.identifier} className="space-y-4">
              <h2 className="text-2xl font-bold text-center">{offering.serverDescription}</h2>
              
              {offering.availablePackages.map((pkg) => (
                <Card key={pkg.identifier} className="bg-gradient-to-br from-yellow-50 to-amber-50 dark:from-yellow-950/20 dark:to-amber-950/20 border-2 border-yellow-200 dark:border-yellow-800">
                  <CardHeader className="text-center">
                    <div className="flex items-center justify-center gap-2 mb-2">
                      <Crown className="w-6 h-6 text-yellow-600" />
                      <CardTitle className="text-2xl">{pkg.product.title}</CardTitle>
                    </div>
                    <div className="text-4xl font-bold text-yellow-700 dark:text-yellow-300">
                      {pkg.product.priceString}
                      {pkg.packageType === 'MONTHLY' && (
                        <span className="text-lg font-normal text-muted-foreground">/month</span>
                      )}
                      {pkg.packageType === 'ANNUAL' && (
                        <span className="text-lg font-normal text-muted-foreground">/year</span>
                      )}
                    </div>
                    <p className="text-muted-foreground">{pkg.product.description}</p>
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
                        <span>30-day money-back guarantee</span>
                        <Check className="w-4 h-4 text-green-600" />
                      </div>
                    </div>

                    <Button
                      onClick={() => handleUpgrade(pkg)}
                      disabled={loading || !user}
                      size="lg"
                      className="w-full bg-yellow-600 hover:bg-yellow-700 text-white"
                    >
                      {loading ? (
                        <>
                          <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                          Processing...
                        </>
                      ) : (
                        <>
                          <Crown className="w-4 h-4 mr-2" />
                          Upgrade to Premium
                        </>
                      )}
                    </Button>
                  </CardContent>
                </Card>
              ))}
            </div>
          ))}
        </div>
      ) : (
        <Card className="bg-gradient-to-br from-yellow-50 to-amber-50 dark:from-yellow-950/20 dark:to-amber-950/20 border-2 border-yellow-200 dark:border-yellow-800">
          <CardContent className="p-6 text-center">
            <p className="text-muted-foreground mb-4">
              No subscription options available at the moment.
            </p>
            <Button
              onClick={initializeRevenueCat}
              variant="outline"
              disabled={loading}
            >
              {loading ? (
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
              ) : (
                'Retry'
              )}
            </Button>
          </CardContent>
        </Card>
      )}

      {!user && (
        <p className="text-center text-sm text-muted-foreground">
          Please sign in to upgrade to premium
        </p>
      )}

      {user && (
        <div className="text-center">
          <Button
            onClick={handleRestorePurchases}
            variant="outline"
            disabled={loading}
          >
            Restore Purchases
          </Button>
        </div>
      )}

      <div className="text-center text-sm text-muted-foreground">
        <p>
          Secure payment processing by RevenueCat. Your payment information is encrypted and secure.
        </p>
      </div>
    </div>
  );
}