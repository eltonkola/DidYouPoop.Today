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
import { Package } from '@revenuecat/purchases-js';

// Extended Package interface with our additional properties
interface ExtendedPackage extends Package {
  storeProduct?: StoreProduct;
}

// Constants for common identifiers
const COMMON_PRODUCTS: Record<string, StoreProduct> = {
  '$rc_monthly': {
    title: 'Monthly Premium',
    description: 'Get monthly access to premium features'
  },
  '$rc_annual': {
    title: 'Annual Premium',
    description: 'Get yearly access to premium features'
  }
};

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
const getPeriod = (product: StoreProduct) => {
  if (!product) return 'Monthly';
  const period = product.subscriptionPeriod || product.subscription_period || product.period || product.duration;
  if (!period) return 'Monthly';
  
  // Common period formats
  const periodMap: Record<string, string> = {
    'P1M': 'Monthly',
    'P1Y': 'Yearly',
    'P1W': 'Weekly',
    'P7D': '7 Days',
    'P30D': '30 Days',
    'P365D': 'Yearly'
  };
  
  return periodMap[period] || period;
};

// Helper function to get formatted price
const getFormattedPrice = (product: StoreProduct) => {
  if (!product) return 'N/A';
  
  // Try different price formats
  const price = product.price || product.price_string || product.displayPrice;
  if (!price) return 'N/A';
  
  // Format price based on period
  const period = getPeriod(product);
  if (period === 'Monthly') {
    return `$${price}/month`;
  } else if (period === 'Yearly') {
    return `$${price}/year`;
  }
  return `$${price}`;
};

// Helper function to get title
// Helper function to get title
const getPackageTitle = (pkg: ExtendedPackage) => {
  if (!pkg) return 'Unknown Package';
  
  // Get product info from storeProduct or common products
  const product = pkg.storeProduct || COMMON_PRODUCTS[pkg.identifier];
  
  // Try to get title from product data first
  const title = product?.title || product?.name || product?.displayName;
  if (title) return title;
  
  // If no title found, use identifier
  return pkg.identifier;
};

// Helper function to get description
// Helper function to get description
const getPackageDescription = (pkg: ExtendedPackage) => {
  if (!pkg) return '';
  
  // Get product info from storeProduct or common products
  const product = pkg.storeProduct || COMMON_PRODUCTS[pkg.identifier];
  
  // Try to get description from product data first
  const description = product?.description || product?.summary || product?.localizedDescription;
  if (description) return description;
  
  // If no description found, use default based on period
  const period = getPeriod(pkg.storeProduct || product);
  return `Get ${period} access to premium features`;
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
      await purchasePackage(selectedPackage as ExtendedPackage);
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
                  <h3 className="font-semibold mb-4">Premium</h3>
                  <div className="space-y-4">
                    {offering.availablePackages.map((pkg, pkgIndex) => (
                      <div key={pkgIndex} className="p-4 border rounded-lg bg-white dark:bg-gray-900">
                        <div className="flex justify-between items-start">
                          <div>
                            <h4 className="font-medium">{getPackageTitle(pkg)}</h4>
                            <p className="text-sm text-muted-foreground">{getPackageDescription(pkg)}</p>
                          </div>
                          <div className="text-right">
                            <p className="text-2xl font-bold text-yellow-700 dark:text-yellow-300">
                              {getFormattedPrice(pkg.storeProduct || COMMON_PRODUCTS[pkg.identifier])}
                            </p>
                            <p className="text-sm text-muted-foreground">
                              {getPeriod(pkg.storeProduct || COMMON_PRODUCTS[pkg.identifier])}
                            </p>
                          </div>
                        </div>
                        <div className="mt-4 space-y-2">
                          <div className="flex items-center space-x-2">
                            <input
                              type="radio"
                              id={`package-${pkg.identifier}`}
                              name="package"
                              value={pkg.identifier}
                              checked={selectedPackage?.identifier === pkg.identifier}
                              onChange={() => setSelectedPackage(pkg)}
                              className="h-4 w-4 text-yellow-600 focus:ring-yellow-500"
                            />
                            <label htmlFor={`package-${pkg.identifier}`} className="text-sm text-muted-foreground">
                              Select this plan
                            </label>
                          </div>
                          {pkg.storeProduct?.introductory_price && (
                            <p className="text-sm text-green-600">
                              Introductory price: {pkg.storeProduct.introductory_price_string}
                            </p>
                          )}
                          {pkg.storeProduct?.discounts && pkg.storeProduct.discounts.length > 0 && (
                            <p className="text-sm text-blue-600">
                              Discount available
                            </p>
                          )}
                        </div>
                      </div>
                    ))}
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