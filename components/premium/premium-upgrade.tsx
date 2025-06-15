'use client';

import { useRouter } from 'next/navigation';
import { useState, useEffect } from 'react';
import { toast } from 'sonner';
import { useAuthStore } from '@/lib/auth-store';
import { initializeRevenueCat, getOfferings, getCustomerInfo, purchasePackage, isPremiumUser } from '@/lib/revenuecat';
import { Package, Offering } from '@revenuecat/purchases-js';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { Crown, Sparkles, Check, Loader2, Star, BarChart3, Calendar, TrendingUp, AlertCircle } from 'lucide-react';
import { Purchases } from '@revenuecat/purchases-js';
import { ReactNode } from 'react';

// Extended Package interface with our additional properties
interface ExtendedPackage extends Package {
  storeProduct?: StoreProduct;
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

interface Package {
  identifier: string;
  storeProduct: StoreProduct;
  webBillingProduct?: StoreProduct;
  rcBillingProduct?: StoreProduct;
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
const getFormattedPrice = (product: any): string => {
  if (!product) {
    console.log('Product is undefined');
    return 'N/A';
  }

  // Try to get price from webBillingProduct or rcBillingProduct
  const priceInfo = product.webBillingProduct?.currentPrice || product.rcBillingProduct?.currentPrice;
  if (!priceInfo) {
    console.log('No price info found');
    return 'N/A';
  }

  // Use formattedPrice directly from priceInfo
  return priceInfo.formattedPrice;
};

// Helper function to get period
const getPeriod = (product: any): string => {
  if (!product) {
    console.log('Product is undefined');
    return 'Monthly';
  }

  // Try to get period from webBillingProduct or rcBillingProduct
  const periodDuration = product.webBillingProduct?.normalPeriodDuration || product.rcBillingProduct?.normalPeriodDuration;
  if (!periodDuration) {
    console.log('No period duration found');
    return 'Monthly';
  }

  // Convert period string to human-readable format
  if (periodDuration.includes('P1M') || periodDuration.includes('month')) return 'Monthly';
  if (periodDuration.includes('P1Y') || periodDuration.includes('year')) return 'Yearly';

  return periodDuration;
  }
  
  return `$${price.toFixed(2)}`;
};

// Helper function to get title
const getPackageTitle = (pkg: ExtendedPackage): string => {
  if (!pkg) return 'Unknown Package';
  
  const product = pkg.storeProduct;
  if (!product) return pkg.identifier || 'Unknown Package';
  
  const productTitle = product.title || product.name || product.displayName;
  if (productTitle) return productTitle;
  
  const period = getPeriod(product);
  if (period === 'Monthly') {
    return 'Monthly Premium';
  } else if (period === 'Yearly') {
    return 'Annual Premium (Save 20%)';
  }
  return pkg.identifier || 'Unknown Package';
};

// Helper function to get description
const getPackageDescription = (pkg: ExtendedPackage): string => {
  if (!pkg) return '';
  
  const product = pkg.storeProduct;
  if (!product) return '';
  
  const productDescription = product.description || product.summary || product.localizedDescription;
  if (productDescription) return productDescription;
  
  const period = getPeriod(product);
  if (period === 'Monthly') {
    return 'Monthly subscription with all premium features';
  } else if (period === 'Yearly') {
    return 'Annual subscription with all premium features (20% off)';
  }
  return 'Premium subscription with all features';
};

export function PremiumUpgrade() {
  const { user } = useAuthStore();
  const [purchaseLink, setPurchaseLink] = useState<string | null>(null);
  const [offerings, setOfferings] = useState<Offering[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedPackage, setSelectedPackage] = useState<any>(null);

  useEffect(() => {
    // Initialize RevenueCat SDK and fetch offerings
    if (user) {
      initializeRevenueCat(user.id).catch(error => {
        console.error('Failed to initialize RevenueCat:', error);
        toast.error('Failed to initialize premium features');
      });

      // Fetch offerings
      getOfferings().then(fetchedOfferings => {
        console.log('Raw fetched offerings:', JSON.stringify(fetchedOfferings, null, 2));
        
        // Log each offering and its packages
        fetchedOfferings.forEach(offering => {
          console.log('Offering:', offering.identifier);
          console.log('Packages:', JSON.stringify(offering.availablePackages, null, 2));
        });

        setOfferings(fetchedOfferings);
        setLoading(false);
      }).catch(error => {
        console.error('Failed to fetch offerings:', error);
        toast.error('Failed to load premium plans');
        setLoading(false);
      });
    }
  }, [user]);

  const handleUpgrade = async () => {
    try {
      if (!selectedPackage) {
        toast.error('Please select a package first');
        return;
      }

      // Get customer info
      const customerInfo = await getCustomerInfo();
      if (isPremiumUser(customerInfo)) {
        toast.info('You already have a premium subscription');
        return;
      }

      // Purchase the selected package
      const purchaseResult = await instance.purchasePackage(selectedPackage);

      if (purchaseResult.success) {
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
    <div className="max-w-2xl mx-auto p-4">
      <Card>
        <CardContent>
          <div className="space-y-6">
            <div className="text-center">
              <h2 className="text-3xl font-bold">Upgrade to Premium</h2>
              <p className="text-gray-600 mt-2">
                Get access to all premium features and support the development of DidYouPoop.Today
              </p>
            </div>

            {isInitializing ? (
              <div className="text-center">
                <Loader2 className="mx-auto h-8 w-8 animate-spin text-gray-400" />
                <p className="mt-2 text-sm text-gray-500">Initializing subscription system...</p>
              </div>
            ) : error ? (
              <div className="text-center text-red-600">
                <p>{error}</p>
                <Button
                  onClick={initializeRevenueCat}
                  className="mt-4 bg-red-600 hover:bg-red-700"
                >
                  Try Again
                </Button>
              </div>
            ) : (
              <div className="space-y-8">
                {offerings.map((offering, index) => (
                  <div key={index} className="space-y-4">
                    {offering.availablePackages.map((pkg: Package) => (
                      <div key={pkg.identifier} className="bg-white rounded-lg shadow p-6">
                        <div className="flex items-center justify-between">
                          <h4 className="text-lg font-semibold">{getPackageTitle(pkg)}</h4>
                          <div className="flex items-center space-x-2">
                            <span className="text-2xl font-bold">{getFormattedPrice(pkg)}</span>
                            <span className="text-sm text-gray-500">{getPeriod(pkg)}</span>
                          </div>
                        </div>
                        <div className="mt-4 space-y-2">
                          <p className="text-gray-600">{getPackageDescription(pkg)}</p>
                          <button
                            onClick={() => setSelectedPackage(pkg)}
                            className="w-full bg-blue-600 text-white py-2 px-4 rounded-md hover:bg-blue-700 transition-colors"
                          >
                            Select this plan
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                ))}
              </div>
            )}
          </div>

          {selectedPackage && (
            <div className="mt-6">
              <Button
                onClick={handleUpgrade}
                className="w-full bg-gradient-to-r from-yellow-600 to-orange-600 hover:from-yellow-700 hover:to-orange-700 text-white"
                disabled={!selectedPackage}
              >
                <Crown className="w-4 h-4 mr-2" />
                {selectedPackage ? 'Upgrade to Selected Plan' : 'Please select a plan first'}
              </Button>
              <p className="text-center text-sm text-gray-500 mt-2">
                You have selected: {selectedPackage.storeProduct?.title || selectedPackage.identifier}
              </p>

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

          {offerings.length > 0 && (
            <div className="space-y-4">
              <div className="text-center">
                <Button
                  onClick={handleUpgrade}
                  className="w-full bg-gradient-to-r from-yellow-600 to-orange-600 hover:from-yellow-700 hover:to-orange-700 text-white"
                  disabled={!selectedPackage}
                >
                  <Crown className="w-4 h-4 mr-2" />
                  {selectedPackage ? 'Upgrade to Selected Plan' : 'Please select a plan first'}
                </Button>
              </div>
              {selectedPackage && (
                <div className="text-center text-sm text-muted-foreground">
                  You have selected: {selectedPackage.storeProduct?.title || selectedPackage.identifier}
                </div>
              )}
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