'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { Crown, Sparkles, Check, Loader2, Star, BarChart3, Calendar, TrendingUp, AlertCircle } from 'lucide-react';
import { useAuthStore } from '@/lib/auth-store';
import { toast } from 'sonner';
import { initializeRevenueCat, getOfferings, getCustomerInfo, purchasePackage, isPremiumUser, isRevenueCatReady } from '@/lib/revenuecat';
import { Package, Offering } from '@revenuecat/purchases-js';
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
    console.log('Product is undefined');
    return 'Monthly';
  }
  
  // Log all available period properties
  console.log('Product period properties:', {
    id: product.identifier,
    subscription_period: product.subscription_period,
    period: product.period,
    subscriptionPeriod: product.subscriptionPeriod,
    duration: product.duration,
    subscriptionPeriods: product.subscriptionPeriods
  });
  
  // Try different period formats
  // First check the subscriptionPeriods array if it exists
  if (product.subscriptionPeriods?.length) {
    const period = product.subscriptionPeriods[0];
    if (period) {
      console.log('Found period in subscriptionPeriods:', period);
      if (period.periodType === 'MONTH' || period.periodType === 'MONTHLY') {
        return 'Monthly';
      } else if (period.periodType === 'YEAR' || period.periodType === 'YEARLY') {
        return 'Yearly';
      }
    }
  }
  
  // Then check other period properties
  const period = product.subscription_period || 
                product.subscriptionPeriod || 
                product.period || 
                product.duration;
  
  if (!period) {
    console.log('No period found');
    return 'Monthly';
  }
  
  console.log('Raw period:', period);
  
  // Convert period string to human-readable format
  if (period.includes('P1M') || period.includes('month')) return 'Monthly';
  if (period.includes('P1Y') || period.includes('year')) return 'Yearly';
  
  return period;
};

// Helper function to get formatted price
const getFormattedPrice = (product: StoreProduct | undefined): string => {
  if (!product) {
    console.log('Product is undefined');
    return 'N/A';
  }
  
  // Log all available price properties
  console.log('Product price properties:', {
    id: product.identifier,
    price: product.price,
    price_string: product.price_string,
    displayPrice: product.displayPrice,
    priceNumber: typeof product.price === 'string' ? parseFloat(product.price as string) : product.price,
    priceType: typeof product.price
  });
  
  // Try different price formats
  let price: number | undefined;
  if (typeof product.price === 'string') {
    price = parseFloat(product.price);
  } else if (typeof product.price === 'number') {
    price = product.price;
  } else if (product.price_string) {
    price = parseFloat(product.price_string);
  } else if (product.displayPrice) {
    price = parseFloat(product.displayPrice);
  }
  
  if (!price || isNaN(price)) {
    console.log('No valid price found');
    return 'N/A';
  }
  
  const period = getPeriod(product);
  
  if (period === 'Monthly') {
    return `$${price.toFixed(2)}/month`;
  } else if (period === 'Yearly') {
    const yearlyPrice = price;
    const monthlyPrice = yearlyPrice / 12;
    return `$${yearlyPrice.toFixed(2)}/year ($${monthlyPrice.toFixed(2)}/month)`;
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
  const router = useRouter();
  const { user } = useAuthStore();
  const [purchaseLink, setPurchaseLink] = useState<string | null>(null);
  const [offerings, setOfferings] = useState<Offering[]>([]);
  const [loading, setLoading] = useState(true);
  const [isLoading, setIsLoading] = useState(false);
  const [selectedPackage, setSelectedPackage] = useState<any>(null);
  const [monthlyPrice, setMonthlyPrice] = useState<string>('');
  const [annualPrice, setAnnualPrice] = useState<string>('');
  const [monthlyName, setMonthlyName] = useState<string>('');
  const [annualName, setAnnualName] = useState<string>('');
  const [monthlyDescription, setMonthlyDescription] = useState<string>('');
  const [annualDescription, setAnnualDescription] = useState<string>('');

  useEffect(() => {
    // Initialize RevenueCat SDK and fetch offerings
    if (user) {
      initializeRevenueCat(user.id).catch(error => {
        console.error('Failed to initialize RevenueCat:', error);
        toast.error('Failed to initialize premium features');
      });

      // Fetch offerings
      getOfferings().then(fetchedOfferings => {
        setOfferings(fetchedOfferings);
        setLoading(false);
        console.log('Fetched offerings:', fetchedOfferings);

        if (fetchedOfferings.length > 0) {
          const offering = fetchedOfferings[0];
          setMonthlyPrice(offering.monthly?.webBillingProduct.currentPrice.formattedPrice || '');
          setAnnualPrice(offering.annual?.webBillingProduct.currentPrice.formattedPrice || '');
          setMonthlyName(offering.monthly?.webBillingProduct.title || '');
          setAnnualName(offering.annual?.webBillingProduct.title || '');
          setMonthlyDescription(offering.monthly?.webBillingProduct.description || '');
          setAnnualDescription(offering.annual?.webBillingProduct.description || '');

          console.log('Fetched monthly defaultPurchaseOption:', offering.monthly?.webBillingProduct?.defaultPurchaseOption);
          console.log('Fetched annual defaultPurchaseOption:', offering.annual?.webBillingProduct?.defaultPurchaseOption);

        }


      }).catch(error => {
        console.error('Failed to fetch offerings:', error);
        toast.error('Failed to load premium plans');
        setLoading(false);
      });
    }
  }, [user]);

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

      // Get the correct package from offerings
      const offering = offerings[0];
      const packageToPurchase = selectedPackage?.identifier === 'monthly' 
        ? offering.monthly?.webBillingProduct 
        : offering.annual?.webBillingProduct;

        console.log('packageToPurchase:', packageToPurchase);


      if (!packageToPurchase) {
        throw new Error('Package not found');
      }

      // Purchase the package directly
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
            <CardTitle className="text-2xl">Premium Plans</CardTitle>
          </div>
        </CardHeader>
        
        <CardContent className="space-y-6">
          {loading ? (
            <div className="flex items-center justify-center">
              <Loader2 className="h-8 w-8 animate-spin text-yellow-600" />
            </div>
          ) : offerings.length === 0 ? (
            <div className="text-center text-muted-foreground">
              No premium plans available
            </div>
          ) : (
            <div className="space-y-6">
              {offerings.map((offering, index) => (
                <div key={index} className="border rounded-lg p-4 bg-white/50 dark:bg-gray-800/50">
                  <div className="space-y-4">
                    {/* Monthly Plan */}
                    {offering.monthly && (
                      <div className="p-4 border rounded-lg bg-white dark:bg-gray-900">
                        <div className="flex justify-between items-start">
                          <div>
                            <h4 className="font-medium">{monthlyName}</h4>
                            <p className="text-sm text-muted-foreground">{monthlyDescription}</p>
                          </div>
                          <div className="text-right">
                            <p className="text-2xl font-bold text-yellow-700 dark:text-yellow-300">
                              {monthlyPrice}
                            </p>
                            <Badge variant="default">Monthly</Badge>
                          </div>
                        </div>
                        <div className="mt-4 space-y-2">
                          <div className="flex items-center space-x-2">
                            <input
                              type="radio"
                              id={`monthly-package`}
                              name="package"
                              value="monthly"
                              checked={selectedPackage?.identifier === 'monthly'}
                              onChange={() => setSelectedPackage({
                                identifier: 'monthly',
                                storeProduct: offering.monthly?.webBillingProduct
                              })}
                              className="h-4 w-4 text-yellow-600 focus:ring-yellow-500"
                            />
                            <label htmlFor={`monthly-package`} className="text-sm text-muted-foreground">
                              Select this plan
                            </label>
                          </div>
                        </div>
                      </div>
                    )}

                    {/* Annual Plan */}
                    {offering.annual && (
                      <div className="p-4 border rounded-lg bg-white dark:bg-gray-900">
                        <div className="flex justify-between items-start">
                          <div>
                            <h4 className="font-medium">{annualName}</h4>
                            <p className="text-sm text-muted-foreground">{annualDescription}</p>
                          </div>
                          <div className="text-right">
                            <p className="text-2xl font-bold text-yellow-700 dark:text-yellow-300">
                              {annualPrice}
                            </p>
                            <Badge variant="default">Yearly</Badge>
                          </div>
                        </div>
                        <div className="mt-4 space-y-2">
                          <div className="flex items-center space-x-2">
                            <input
                              type="radio"
                              id={`annual-package`}
                              name="package"
                              value="annual"
                              checked={selectedPackage?.identifier === 'annual'}
                              onChange={() => setSelectedPackage({
                                identifier: 'annual',
                                storeProduct: offering.annual?.webBillingProduct
                              })}
                              className="h-4 w-4 text-yellow-600 focus:ring-yellow-500"
                            />
                            <label htmlFor={`annual-package`} className="text-sm text-muted-foreground">
                              Select this plan
                            </label>
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
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