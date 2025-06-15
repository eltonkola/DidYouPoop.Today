// RevenueCat Pages configuration
export type CustomerInfo = {
  entitlements: {
    active: Record<string, {
      product_identifier: string;
      expires_date: string;
    }>;
  };
};

export const isPremiumUser = (customerInfo: CustomerInfo): boolean => {
  if (!customerInfo?.entitlements?.active) return false;
  return Object.values(customerInfo.entitlements.active).some(entitlement => 
    entitlement.product_identifier === 'premium_monthly' || 
    entitlement.product_identifier === 'premium_yearly'
  );
};

export const getPremiumEntitlement = (customerInfo: CustomerInfo): string | null => {
  if (!customerInfo?.entitlements?.active) return null;
  const activeEntitlements = Object.values(customerInfo.entitlements.active);
  if (activeEntitlements.length === 0) return null;
  
  // Return the product identifier of the active premium entitlement
  return activeEntitlements.find(e => 
    e.product_identifier === 'premium_monthly' || 
    e.product_identifier === 'premium_yearly'
  )?.product_identifier || null;
};

export const initializeRevenueCat = async (userId?: string) => {
  console.log('RevenueCat Pages initialization skipped - using hosted purchase pages');
  return;
};

export const getOfferings = async () => [];

export const purchasePackage = async (packageToPurchase: any) => {
  console.log('RevenueCat Pages - purchase handled by hosted pages');
  return;
};

export const getCustomerInfo = async () => {
  console.log('RevenueCat Pages - customer info handled by hosted pages');
  return null;
};

export const restorePurchases = async () => {
  console.log('RevenueCat Pages - purchase restoration handled by hosted pages');
  return;
};

export const isRevenueCatConfigured = (): boolean => {
  console.log('RevenueCat Pages - configuration handled by hosted pages');
  return true;
};

export const isRevenueCatReady = (): boolean => {
  console.log('RevenueCat Pages - ready check handled by hosted pages');
  return true;
};