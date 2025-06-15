import { Purchases } from '@revenuecat/purchases-js';

// Initialize RevenueCat SDK with API key

// Initialize RevenueCat SDK with API key
if (typeof window !== 'undefined') {
  Purchases.configure({
    apiKey: process.env.NEXT_PUBLIC_REVENUECAT_API_KEY,
    observerMode: true
  });
}

let isConfigured = false;
let isInitializing = false;
let initializationAttempted = false;
let initializationError: Error | null = null;
let purchasesInstance: any = null;

// Improved browser detection
const isBrowser = (): boolean => {
  if (typeof window === 'undefined') return false;
  if (typeof document === 'undefined') return false;
  if (typeof navigator === 'undefined') return false;
  return true;
};

// Define types for RevenueCat objects
interface RevenueCatEntitlementInfo {
  isActive: boolean;
  willRenew: boolean;
  periodEnd: number;
}

interface RevenueCatCustomerInfo {
  entitlements: {
    [key: string]: RevenueCatEntitlementInfo;
  };
  activeSubscriptions: string[];
  allPurchasedProducts: string[];
}

interface RevenueCatPackage {
  identifier: string;
  offeringIdentifier: string;
  platformProductIdentifier: string;
  storeProduct: any;
}

interface RevenueCatOffering {
  identifier: string;
  availablePackages: RevenueCatPackage[];
  lifetime: RevenueCatPackage | null;
  monthly: RevenueCatPackage | null;
  yearly: RevenueCatPackage | null;
}

interface RevenueCatCustomerInfoResponse {
  customerInfo: RevenueCatCustomerInfo;
}

export const initializeRevenueCat = async (userId?: string, maxRetries = 3, retryDelay = 1000) => {
  console.log('[RevenueCat] Starting initialization with userId:', userId);
  
  if (!isBrowser()) {
    console.log('[RevenueCat] Initialization skipped - not in browser');
    initializationError = new Error('Not in browser environment');
    return Promise.reject(initializationError);
  }

  if (isConfigured || isInitializing || initializationAttempted) {
    console.log('[RevenueCat] Initialization already attempted or in progress');
    return Promise.resolve();
  }

  isInitializing = true;
  initializationAttempted = true;
  initializationError = null;

  let retries = 0;

  const attemptInitialization = async () => {
    try {
      console.log('[RevenueCat] Attempting to initialize...');
      
      // Get the Purchases instance
      purchasesInstance = Purchases;
      
      // Configure with user ID if provided
      if (userId) {
        await purchasesInstance.identify(userId);
        console.log('[RevenueCat] User identification completed');
      }

      // Verify configuration
      if (!purchasesInstance) {
        throw new Error('[RevenueCat] Purchases instance not available');
      }

      isConfigured = true;
      console.log('[RevenueCat] Successfully configured');

      // Test connection
      try {
        const customerInfo = await purchasesInstance.getCustomerInfo();
        console.log('[RevenueCat] Connection test successful', {
          hasEntitlements: Object.keys(customerInfo.entitlements || {}).length > 0,
          activeSubscriptions: customerInfo.activeSubscriptions || []
        });
      } catch (testError) {
        console.warn('[RevenueCat] Connection test failed:', testError);
        throw testError;
      }

      return true;
    } catch (error) {
      retries++;
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      console.error(`[RevenueCat] Initialization attempt ${retries} failed:`, errorMessage);
      
      if (retries < maxRetries) {
        console.log(`[RevenueCat] Retrying initialization in ${retryDelay}ms...`);
        await new Promise(resolve => setTimeout(resolve, retryDelay));
        return attemptInitialization();
      }

      initializationError = error as Error;
      isConfigured = false;
      throw error;
    }
  };

  try {
    const success = await attemptInitialization();
    if (success) {
      console.log('[RevenueCat] Initialization successful after', retries, 'retries');
    }
    isInitializing = false;
    return success;
  } catch (error) {
    isInitializing = false;
    console.error('[RevenueCat] Initialization failed after', retries, 'retries:', error);
    throw error;
  }
};

export const isRevenueCatConfigured = (): boolean => {
  return isConfigured && purchasesInstance !== null;
};

export const isRevenueCatReady = (): boolean => {
  if (!isBrowser()) return false;
  if (initializationError) return false;
  if (!purchasesInstance) return false;
  return isConfigured;
};

export const getInitializationError = (): Error | null => {
  return initializationError;
};

export const getOfferings = async (): Promise<RevenueCatOffering[]> => {
  if (!isRevenueCatReady()) {
    console.warn('[RevenueCat] Not ready to get offerings');
    return [];
  }

  try {
    console.log('[RevenueCat] Fetching offerings...');
    const offerings = await purchasesInstance.getOfferings();
    const offeringValues = Object.values(offerings.all || {}) as RevenueCatOffering[];
    console.log('[RevenueCat] Retrieved offerings:', {
      count: offeringValues.length,
      identifiers: offeringValues.map(o => o.identifier)
    });
    return offeringValues;
  } catch (error) {
    console.error('[RevenueCat] Failed to get offerings:', error);
    return [];
  }
};

export const purchasePackage = async (packageToPurchase: RevenueCatPackage): Promise<RevenueCatCustomerInfo> => {
  if (!isRevenueCatReady()) {
    throw new Error('[RevenueCat] Not ready to process purchase');
  }

  try {
    console.log('[RevenueCat] Initiating purchase...', {
      packageId: packageToPurchase?.identifier,
      offeringId: packageToPurchase?.offeringIdentifier
    });
    
    const { customerInfo } = await purchasesInstance.purchasePackage(packageToPurchase);
    console.log('[RevenueCat] Purchase completed successfully', {
      hasEntitlements: Object.keys(customerInfo?.entitlements || {}).length > 0,
      activeSubscriptions: customerInfo?.activeSubscriptions || []
    });
    return customerInfo;
  } catch (error: any) {
    console.error('[RevenueCat] Purchase failed:', error);
    if (error?.userCancelled) {
      throw { userCancelled: true, message: 'Purchase was cancelled' };
    }
    throw error;
  }
};

export const getCustomerInfo = async (): Promise<RevenueCatCustomerInfo | null> => {
  if (!isRevenueCatReady()) {
    console.log('[RevenueCat] Not ready to get customer info');
    return null;
  }

  try {
    console.log('[RevenueCat] Fetching customer info...');
    const customerInfo = await purchasesInstance.getCustomerInfo();
    console.log('[RevenueCat] Retrieved customer info', {
      hasEntitlements: Object.keys(customerInfo?.entitlements || {}).length > 0,
      activeSubscriptions: customerInfo?.activeSubscriptions || []
    });
    return customerInfo;
  } catch (error) {
    console.error('[RevenueCat] Failed to get customer info:', error);
    return null;
  }
};

export const restorePurchases = async (): Promise<RevenueCatCustomerInfo | null> => {
  if (!isRevenueCatReady()) {
    throw new Error('[RevenueCat] Not ready to restore purchases');
  }

  try {
    console.log('[RevenueCat] Initiating purchase restoration...');
    const { customerInfo } = await purchasesInstance.restorePurchases();
    console.log('[RevenueCat] Purchase restoration completed', {
      hasEntitlements: Object.keys(customerInfo?.entitlements || {}).length > 0,
      activeSubscriptions: customerInfo?.activeSubscriptions || []
    });
    return customerInfo;
  } catch (error) {
    console.error('[RevenueCat] Failed to restore purchases:', error);
    throw error;
  }
};

export const isPremiumUser = (customerInfo: RevenueCatCustomerInfo): boolean => {
  if (!customerInfo) {
    console.warn('[RevenueCat] No customer info provided for premium check');
    return false;
  }

  const premiumEntitlement = getPremiumEntitlement(customerInfo);
  const hasActiveSubscription = customerInfo.activeSubscriptions?.length > 0;

  console.log('[RevenueCat] Premium status check', {
    hasPremiumEntitlement: !!premiumEntitlement,
    hasActiveSubscription,
    activeSubscriptions: customerInfo.activeSubscriptions || []
  });

  return !!premiumEntitlement || hasActiveSubscription;
};

export const getPremiumEntitlement = (customerInfo: RevenueCatCustomerInfo): string | null => {
  if (!customerInfo) {
    console.warn('[RevenueCat] No customer info provided for entitlement check');
    return null;
  }

  const entitlements = customerInfo.entitlements || {};
  const activeEntitlements = Object.entries(entitlements)
    .filter(([_, info]) => info?.isActive)
    .map(([id]) => id);

  console.log('[RevenueCat] Checking entitlements', {
    activeEntitlements,
    allEntitlements: Object.keys(entitlements)
  });

  return activeEntitlements[0] || null;
};

export const reinitializeRevenueCat = async (userId?: string) => {
  console.log('[RevenueCat] Starting reinitialization');
  
  // Reset state
  isConfigured = false;
  isInitializing = false;
  initializationAttempted = false;
  purchasesInstance = null;
  initializationError = null;

  // Reinitialize
  await initializeRevenueCat(userId);
};
