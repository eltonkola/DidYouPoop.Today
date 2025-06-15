'use client';

import { useRouter } from 'next/navigation';
import { useState, useEffect } from 'react';
import { toast } from 'sonner';
import { useAuthStore } from '@/lib/auth-store';
import { initializeRevenueCat, getOfferings, getCustomerInfo, purchasePackage, isPremiumUser } from '@/lib/revenuecat';
import { Offering, Package, PurchaseResult, Product } from '@revenuecat/purchases-js';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { Crown, Sparkles, Check, Loader2, Star, BarChart3, Calendar, TrendingUp, AlertCircle } from 'lucide-react';
import { ReactNode } from 'react';

// Type definitions
interface ExtendedPackage {
  package: Package;
  storeProduct: Product;
  identifier: string;
  title: string;
  description: string;
  price: string;
  period: string;
}

// Type definitions
interface StoreProduct {
  title?: string;
  name?: string;
  displayName?: string;
  description?: string;
  summary?: string;
  localizedDescription?: string;
  price?: number | string;
  price_string?: string;
  displayPrice?: string;
  period?: string;
  subscriptionPeriod?: string;
  subscription_period?: string;
  duration?: string;
  identifier?: string;
  subscriptionPeriods?: {
    period?: string;
    periodType?: string;
    numberOfUnits?: number;
  }[];
  webBillingProduct?: {
    title?: string;
    description?: string;
    currentPrice?: {
      formattedPrice?: string;
    };
    normalPeriodDuration?: string;
  };
  rcBillingProduct?: {
    title?: string;
    description?: string;
    currentPrice?: {
      formattedPrice?: string;
    };
    normalPeriodDuration?: string;
  };
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

// Helper function to get formatted price
const getFormattedPrice = (pkg: ExtendedPackage): string => {
  if (!pkg) {
    console.log('Package is undefined');
    return 'N/A';
  }

  // Use price from package
  return pkg.price || 'N/A';
};

// Helper function to get period
const getPeriod = (pkg: ExtendedPackage): string => {
  if (!pkg) {
    console.log('Package is undefined');
    return 'Monthly';
  }

  return pkg.period;
};

// Helper function to get title
const getPackageTitle = (pkg: ExtendedPackage): string => {
  if (!pkg) {
    return 'Unknown Package';
  }

  return pkg.title;
};

// Helper function to get description
const getPackageDescription = (pkg: ExtendedPackage): string => {
  if (!pkg) return '';

  return pkg.description;
};

export default function PremiumUpgrade() {
  const [isInitializing, setIsInitializing] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [offerings, setOfferings] = useState<Offering | null>(null);
  const [selectedPackage, setSelectedPackage] = useState<ExtendedPackage | null>(null);
  const router = useRouter();
  const { user } = useAuthStore();

  useEffect(() => {
    initializeRevenueCat();
  }, []);

  const initializeRevenueCat = async () => {
    try {
      setIsInitializing(true);
      setError(null);
      
      // Initialize RevenueCat
      const instance = await Purchases.configure(
        process.env.NEXT_PUBLIC_REVENUECAT_API_KEY || '',
        useAuthStore.getState().user?.id || Purchases.generateRevenueCatAnonymousAppUserId(),
        undefined
      );

      // Get offerings
      const offerings = await instance.getOfferings();
      setOfferings(offerings);

      console.log('RevenueCat initialized successfully');
      return instance;
    } catch (err) {
      console.error('Error initializing RevenueCat:', err);
      setError('Failed to initialize subscription system. Please try again later.');
      throw err;
    } finally {
      setIsInitializing(false);
    }
  };

  const handleUpgrade = async () => {
    if (!selectedPackage) {
      toast.error('Please select a subscription plan first');
      return;
    }

    try {
      // Use the instance from initializeRevenueCat
      const instance = await initializeRevenueCat();

      // Purchase the selected package
      const purchaseResult = await instance.purchasePackage(selectedPackage.package);

      if (purchaseResult) {
        toast.success('Successfully upgraded to premium!');
        router.push('/premium/success');
      } else {
        toast.error('Purchase failed. Please try again.');
      }
    } catch (err) {
      console.error('Error during purchase:', err);
      toast.error('Error during purchase. Please try again.');
    }
  };

  return (
    <div className="container mx-auto py-8">
      <h1 className="text-3xl font-bold mb-4">Premium Upgrade</h1>
      
      {error && (
        <div className="bg-red-50 border border-red-200 text-red-600 px-4 py-3 rounded relative" role="alert">
          <span className="block sm:inline">{error}</span>
        </div>
      )}

      {isInitializing ? (
        <div className="flex justify-center items-center min-h-[200px]">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </div>
      ) : offerings && Object.keys(offerings.all).length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {Object.values(offerings.all).map((offering) => (
            <Card key={offering.identifier}>
              <CardHeader>
                <CardTitle>{offering.displayName || offering.identifier}</CardTitle>
              </CardHeader>
              <CardContent>
                {offering.availablePackages.map((pkg) => (
                  <div key={pkg.identifier} className="space-y-4">
                    <div className="flex items-center justify-between">
                      <h3 className="text-xl font-semibold">
                        {getPackageTitle(pkg)}
                      </h3>
                      <Badge variant="premium">
                        {getPeriod(pkg)}
                      </Badge>
                    </div>
                    <p className="text-muted-foreground">
                      {getPackageDescription(pkg)}
                    </p>
                    <div className="flex items-center justify-between">
                      <div className="text-2xl font-bold">
                        {getFormattedPrice(pkg)}
                      </div>
                      <Button
                        onClick={() => setSelectedPackage({
                          package: pkg,
                          storeProduct: pkg.storeProduct,
                          identifier: pkg.identifier,
                          title: pkg.storeProduct?.title || pkg.identifier,
                          description: pkg.storeProduct?.description || pkg.identifier,
                          price: pkg.storeProduct?.currentPrice?.formattedPrice || 'N/A',
                          period: pkg.storeProduct?.subscriptionPeriod || 'Monthly'
                        })}
                        variant={selectedPackage?.package === pkg ? "default" : "outline"}
                        className="w-full"
                      >
                        {selectedPackage?.package === pkg ? "Selected" : "Select"}
                      </Button>
                    </div>
                  </div>
                ))}
              </CardContent>
            </Card>
          ))}
        </div>
      ) : (
        <div className="text-center py-8">
          <p className="text-muted-foreground">No premium plans available at this time.</p>
        </div>
      )}

      {selectedPackage && (
        <div className="mt-8">
          <Separator />
          <div className="mt-4">
            <Button
              onClick={handleUpgrade}
              className="w-full"
              disabled={isInitializing}
            >
              {isInitializing ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Processing...
                </>
              ) : (
                <>
                  <Crown className="w-4 h-4 mr-2" />
                  Upgrade to Selected Plan
                </>
              )}
            </Button>
          </div>
        </div>
      )}

      <div className="text-center text-sm text-muted-foreground mt-8">
        <p>
          Secure payment processing by RevenueCat. Your payment information is encrypted and secure.
        </p>
      </div>
    </div>
  );
}