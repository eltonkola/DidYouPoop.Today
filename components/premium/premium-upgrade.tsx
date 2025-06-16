'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Crown, Sparkles, Check, Loader2, Star, BarChart3, Calendar, TrendingUp, AlertCircle } from 'lucide-react';
import { useAuthStore } from '@/lib/auth-store';
import { toast } from 'sonner';
import { initializeRevenueCat, getOfferings, getCustomerInfo, purchasePackage, isPremiumUser, isRevenueCatReady } from '@/lib/revenuecat';
import { Package, Offering } from '@revenuecat/purchases-js';
// Type for RevenueCat StoreProduct
interface StoreProduct {
  price: number | string;
  priceString?: string;
  displayPrice?: string;
  subscriptionPeriod?: {
    periodType: 'MONTH' | 'YEAR' | string;
  };
  subscriptionPeriods?: {
    periodType: 'MONTH' | 'YEAR' | string;
  }[];
}

// Constants for common identifiers
const COMMON_PRODUCTS = {
  '$rc_monthly': {
    title: 'Monthly Premium',
    description: 'Get monthly access to premium features'
  },
  '$rc_annual': {
    title: 'Annual Premium',
    description: 'Get yearly access to premium features'
  }
};

// Helper function to get period
const getPeriod = (product: StoreProduct | undefined): string => {
  if (!product) {
    return 'Monthly';
  }

  // Check subscriptionPeriods first
  if (product.subscriptionPeriods?.length) {
    const period = product.subscriptionPeriods[0];
    if (period?.periodType === 'MONTH') return 'Monthly';
    if (period?.periodType === 'YEAR') return 'Yearly';
  }

  // Check period string format
  if (product.subscriptionPeriod?.periodType === 'MONTH') return 'Monthly';
  if (product.subscriptionPeriod?.periodType === 'YEAR') return 'Yearly';

  return 'Monthly';
};

// Helper function to get formatted price
const getFormattedPrice = (storeProduct: StoreProduct | null): string => {
  if (!storeProduct) return 'Loading...';
  return storeProduct.priceString || `$${typeof storeProduct.price === 'number' ? storeProduct.price.toFixed(2) : storeProduct.price}`;
};

// Type for package data
interface PackageData {
  identifier: string;
  storeProduct: {
    price: number | string;
    priceString?: string;
    displayPrice?: string;
    subscriptionPeriod?: {
      periodType: 'MONTH' | 'YEAR' | string;
    };
}

// Type for offerings state
interface OfferingsState {
  monthly: Package | null;
  annual: Package | null;
}

export function PremiumUpgrade() {
  const router = useRouter();
  const { user } = useAuthStore();
  const [offerings, setOfferings] = useState<OfferingsState | null>(null);
  const [selectedPackage, setSelectedPackage] = useState<PackageData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isPremium, setIsPremium] = useState(false);

  useEffect(() => {
    const initialize = async () => {
      try {
        // Initialize RevenueCat
        await initializeRevenueCat(user?.id);
        
        // Get offerings
        const fetchedOfferings = await getOfferings();
        if (!fetchedOfferings || fetchedOfferings.length === 0) {
          throw new Error('No offerings found');
        }
        
        // Transform offerings to our state format
        const transformedOfferings: OfferingsState = {
          monthly: null,
          annual: null
        };

        // Get the first offering (RevenueCat usually returns a single offering)
        const mainOffering = fetchedOfferings[0];
        if (mainOffering) {
          if (mainOffering.monthly) {
            transformedOfferings.monthly = mainOffering.monthly;
          }
          if (mainOffering.annual) {
            transformedOfferings.annual = mainOffering.annual;
          }
        }

        setOfferings(transformedOfferings);
        
        // Check if user is premium
        const customerInfo = await getCustomerInfo();
        setIsPremium(isPremiumUser(customerInfo));
      } catch (error) {
        console.error('Failed to initialize premium features:', error);
        toast.error('Failed to load premium features');
      } finally {
        setIsLoading(false);
      }
    };

    // Only initialize if we have a user
    if (user?.id) {
      initialize();
    }
  }, [user?.id]);

  const handleUpgrade = async () => {
    if (!selectedPackage) {
      toast.error('Please select a package');
      return;
    }

    if (!isRevenueCatReady()) {
      toast.error('RevenueCat is not ready. Please try again.');
      return;
    }

    try {
      setIsLoading(true);
      
      // Get customer info before purchase
      const customerInfo = await getCustomerInfo();
      if (isPremiumUser(customerInfo)) {
        toast.info('You already have a premium subscription');
        return;
      }

      // Purchase directly with selected package
      await purchasePackage(selectedPackage);
      toast.success('Premium subscription purchased successfully!');
      router.refresh();
    } catch (error: any) {
      if (error.userCancelled) {
        // User cancelled the purchase
        toast.info('Purchase cancelled');
      } else {
        console.error('Purchase failed:', error);
        toast.error(error.message || 'Failed to purchase premium subscription');
      }
    } finally {
      setIsLoading(false);
    }
  };

  const handlePackageSelect = (packageToSelect: PackageData | null) => {
    setSelectedPackage(packageToSelect);
  };

  return (
    <div className="container mx-auto py-8">
      <Card>
        <CardHeader>
          <div className="flex flex-col items-center gap-2">
            <Crown className="w-12 h-12 text-yellow-500" />
            <CardTitle className="text-2xl font-bold">Premium Upgrade</CardTitle>
            <p className="text-center text-gray-600">
              Unlock exclusive features and support the development of DidYouPoop.Today
            </p>
          </div>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="flex items-center justify-center py-8">
              <Loader2 className="h-8 w-8 animate-spin" />
            </div>
          ) : isPremium ? (
            <div className="flex flex-col items-center gap-4">
              <Badge variant="default" className="px-4 py-2 bg-yellow-500 text-white">
                <Check className="w-4 h-4 mr-2" />
                Premium Member
              </Badge>
              <p className="text-center text-gray-600">
                You already have a premium subscription. Thank you for supporting us!
              </p>
            </div>
          ) : offerings?.monthly || offerings?.annual ? (
            <div className="space-y-6">
              {offerings?.monthly && (
                <div key="monthly" className="flex flex-col items-center gap-4 p-4 rounded-lg border border-gray-200 hover:border-gray-300 transition-colors">
                  <h3 className="text-lg font-semibold">Monthly Plan</h3>
                  <p className="text-gray-600">Monthly subscription</p>
                  <div className="text-3xl font-bold">
                    {getFormattedPrice(offerings.monthly?.storeProduct)}
                  </div>
                  <Button
                    onClick={() => handlePackageSelect(offerings.monthly)}
                    disabled={isLoading || !offerings.monthly}
                    className="w-full"
                  >
                    {isLoading ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        Loading...
                      </>
                    ) : selectedPackage?.identifier === offerings.monthly?.identifier ? (
                      <>
                        <Check className="mr-2 h-4 w-4" />
                        Selected
                      </>
                    ) : (
                      'Select Monthly Plan'
                    )}
                  </Button>
                </div>
              )}

              {offerings?.annual && (
                <div key="annual" className="flex flex-col items-center gap-4 p-4 rounded-lg border border-gray-200 hover:border-gray-300 transition-colors">
                  <h3 className="text-lg font-semibold">Annual Plan</h3>
                  <p className="text-gray-600">Annual subscription</p>
                  <div className="text-3xl font-bold">
                    {getFormattedPrice(offerings.annual?.storeProduct)}
                  </div>
                  <Button
                    onClick={() => handlePackageSelect(offerings.annual)}
                    disabled={isLoading || !offerings.annual}
                    className="w-full"
                  >
                    {isLoading ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        Loading...
                      </>
                    ) : selectedPackage?.identifier === offerings.annual?.identifier ? (
                      <>
                        <Check className="mr-2 h-4 w-4" />
                        Selected
                      </>
                    ) : (
                      'Select Annual Plan'
                    )}
                  </Button>
                </div>
              )}

              {/* Premium Features */}
              <div className="space-y-4">
                <h3 className="text-lg font-semibold">Premium Features</h3>
                <div className="space-y-2">
                  <div className="flex items-center gap-2">
                    <Sparkles className="w-4 h-4 text-yellow-500" />
                    <span>Access to all premium features</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <BarChart3 className="w-4 h-4 text-blue-500" />
                    <span>Advanced analytics and insights</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Calendar className="w-4 h-4 text-green-500" />
                    <span>Custom reminders and notifications</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <TrendingUp className="w-4 h-4 text-purple-500" />
                    <span>Priority support and updates</span>
                  </div>
                </div>
              </div>

              {/* Upgrade Button */}
              <Button
                onClick={handleUpgrade}
                disabled={!selectedPackage || isLoading}
                className="w-full"
              >
                {isLoading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Processing...
                  </>
                ) : (
                  'Upgrade to Premium'
                )}
              </Button>
            </div>
          ) : (
            <div className="flex flex-col items-center gap-4">
              <AlertCircle className="w-8 h-8 text-red-500" />
              <p className="text-center text-red-500">
                No premium plans available. Please try again later.
              </p>
            </div>
          )}
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