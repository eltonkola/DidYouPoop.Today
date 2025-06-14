'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { Crown, Sparkles, Check, Loader2, Star, BarChart3, Calendar, TrendingUp, AlertCircle } from 'lucide-react';
import { useAuthStore } from '@/lib/auth-store';
import { toast } from 'sonner';

export function PremiumUpgrade() {
  const { user } = useAuthStore();
  const [loading, setLoading] = useState(false);
  const [loadingOfferings, setLoadingOfferings] = useState(true);
  const [offerings, setOfferings] = useState<any[]>([]);
  const [selectedPackage, setSelectedPackage] = useState<any>(null);
  const [revenueCatAvailable, setRevenueCatAvailable] = useState(false);

  useEffect(() => {
    checkRevenueCatAndLoadOfferings();
  }, []);

  const checkRevenueCatAndLoadOfferings = async () => {
    try {
      const { isRevenueCatConfigured, getOfferings } = await import('@/lib/revenuecat');
      
      if (!isRevenueCatConfigured()) {
        setRevenueCatAvailable(false);
        setLoadingOfferings(false);
        return;
      }

      setRevenueCatAvailable(true);
      
      // Wait a bit for RevenueCat to initialize
      setTimeout(async () => {
        try {
          const availableOfferings = await getOfferings();
          setOfferings(availableOfferings);
          
          // Auto-select the first package if available
          if (availableOfferings.length > 0 && availableOfferings[0].availablePackages?.length > 0) {
            setSelectedPackage(availableOfferings[0].availablePackages[0]);
          }
        } catch (error) {
          console.error('Failed to load offerings:', error);
        } finally {
          setLoadingOfferings(false);
        }
      }, 2000);
    } catch (error) {
      console.error('RevenueCat not available:', error);
      setRevenueCatAvailable(false);
      setLoadingOfferings(false);
    }
  };

  const handleUpgrade = async () => {
    if (!selectedPackage) {
      toast.error('Please select a subscription package');
      return;
    }

    setLoading(true);
    
    try {
      const { purchasePackage, isRevenueCatReady } = await import('@/lib/revenuecat');
      
      if (!isRevenueCatReady()) {
        toast.error('Payment system not ready. Please try again in a moment.');
        return;
      }

      const customerInfo = await purchasePackage(selectedPackage);
      
      if (customerInfo) {
        toast.success('Welcome to Premium! 🎉');
        // Redirect to success page
        window.location.href = '/premium/success';
      }
    } catch (error: any) {
      console.error('Purchase error:', error);
      
      if (error.userCancelled) {
        toast.info('Purchase cancelled');
      } else {
        toast.error(error.message || 'Failed to complete purchase');
      }
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

  if (!revenueCatAvailable) {
    return (
      <div className="max-w-2xl mx-auto space-y-6">
        <div className="text-center space-y-4">
          <div className="flex items-center justify-center gap-2 text-6xl mb-4">
            <AlertCircle className="w-16 h-16 text-yellow-600" />
          </div>
          <h1 className="text-4xl font-bold">Premium Features Coming Soon</h1>
          <p className="text-xl text-muted-foreground">
            We're working on bringing you premium features. Check back soon!
          </p>
          <div className="bg-blue-50 dark:bg-blue-950/20 p-4 rounded-lg">
            <p className="text-sm text-blue-700 dark:text-blue-300">
              💡 <strong>Good news!</strong> All features are currently free while we set up premium subscriptions.
              Enjoy unlimited access to advanced analytics, cloud sync, and all premium features!
            </p>
          </div>
        </div>
      </div>
    );
  }

  if (loadingOfferings) {
    return (
      <div className="max-w-2xl mx-auto space-y-6">
        <div className="text-center space-y-4">
          <div className="flex items-center justify-center gap-2 text-6xl mb-4">
            <Loader2 className="w-16 h-16 text-blue-600 animate-spin" />
          </div>
          <h1 className="text-4xl font-bold">Loading Premium Options</h1>
          <p className="text-xl text-muted-foreground">
            Please wait while we load available subscription plans...
          </p>
        </div>
      </div>
    );
  }

  if (offerings.length === 0) {
    return (
      <div className="max-w-2xl mx-auto space-y-6">
        <div className="text-center space-y-4">
          <div className="flex items-center justify-center gap-2 text-6xl mb-4">
            <Crown className="w-16 h-16 text-yellow-600" />
          </div>
          <h1 className="text-4xl font-bold">Premium Features Available</h1>
          <p className="text-xl text-muted-foreground">
            Premium plans are being configured. All features are currently free!
          </p>
          <div className="bg-green-50 dark:bg-green-950/20 p-4 rounded-lg">
            <p className="text-sm text-green-700 dark:text-green-300">
              🎉 <strong>Special Launch Offer!</strong> All premium features are currently free while we finalize our subscription plans.
              Enjoy unlimited access to advanced analytics, cloud sync, and priority support!
            </p>
          </div>
          <Button onClick={checkRevenueCatAndLoadOfferings} variant="outline">
            <Loader2 className="w-4 h-4 mr-2" />
            Check Again
          </Button>
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

      {offerings.map((offering) => (
        <div key={offering.identifier} className="space-y-4">
          {offering.availablePackages?.map((pkg: any) => (
            <Card 
              key={pkg.identifier}
              className={`bg-gradient-to-br from-yellow-50 to-amber-50 dark:from-yellow-950/20 dark:to-amber-950/20 border-2 ${
                selectedPackage?.identifier === pkg.identifier 
                  ? 'border-yellow-400 ring-2 ring-yellow-200' 
                  : 'border-yellow-200 dark:border-yellow-800'
              } cursor-pointer transition-all`}
              onClick={() => setSelectedPackage(pkg)}
            >
              <CardHeader className="text-center">
                <div className="flex items-center justify-center gap-2 mb-2">
                  <Crown className="w-6 h-6 text-yellow-600" />
                  <CardTitle className="text-2xl">{pkg.product?.title || 'Premium Plan'}</CardTitle>
                </div>
                <div className="text-4xl font-bold text-yellow-700 dark:text-yellow-300">
                  {pkg.product?.priceString || '$2.99'}
                  {pkg.packageType === 'MONTHLY' && (
                    <span className="text-lg font-normal text-muted-foreground">/month</span>
                  )}
                  {pkg.packageType === 'ANNUAL' && (
                    <span className="text-lg font-normal text-muted-foreground">/year</span>
                  )}
                </div>
                <p className="text-muted-foreground">{pkg.product?.description || 'Premium subscription with all features'}</p>
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
              </CardContent>
            </Card>
          ))}
        </div>
      ))}

      <Button
        onClick={handleUpgrade}
        disabled={loading || !selectedPackage}
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

      <div className="text-center text-sm text-muted-foreground">
        <p>
          Secure payment processing by RevenueCat. Your payment information is encrypted and secure.
        </p>
      </div>
    </div>
  );
}