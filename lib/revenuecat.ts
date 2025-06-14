let isConfigured = false;
let isInitializing = false;
let initializationAttempted = false;
let purchasesInstance: any = null;

// Check if we're in a browser environment
const isBrowser = () => typeof window !== 'undefined';

export const initializeRevenueCat = async (userId?: string) => {
  // Prevent multiple initialization attempts
  if (isConfigured || isInitializing || initializationAttempted) {
    console.log('RevenueCat initialization already attempted or in progress');
    return;
  }
  
  // Temporarily bypass API key check for testing
  const apiKey = 'rcb_BanyGJtoufgcVNwnMdMWcWdfRfme';
  console.log('Bypassing API key validation for testing');

  // Only run in browser environment
  if (!isBrowser()) {
    console.log('RevenueCat initialization skipped - not in browser environment');
    return;
  }

  isInitializing = true;
  initializationAttempted = true;

  try {
    console.log('Attempting to initialize RevenueCat...');
    
    // Dynamic import with better error handling
    const RevenueCatModule = await import('@revenuecat/purchases-js');
    const Purchases = RevenueCatModule.default || RevenueCatModule;
    
    if (!Purchases) {
      throw new Error('RevenueCat module not found');
    }

    if (typeof Purchases.configure !== 'function') {
      throw new Error('RevenueCat configure method not available');
    }

    // Configure RevenueCat
    await Purchases.configure(apiKey, userId);
    
    // Store the instance for later use
    purchasesInstance = Purchases;
    isConfigured = true;
    
    console.log('RevenueCat initialized successfully');
    
    // Test the connection
    try {
      await Purchases.getCustomerInfo();
      console.log('RevenueCat connection test successful');
    } catch (testError) {
      console.warn('RevenueCat connection test failed:', testError);
    }
    
  } catch (error) {
    console.error('Failed to initialize RevenueCat:', error);
    isConfigured = false;
    purchasesInstance = null;
  } finally {
    isInitializing = false;
  }
};

export const getOfferings = async () => {
  if (!isConfigured || !purchasesInstance) {
    console.warn('RevenueCat not configured');
    return [];
  }

  try {
    console.log('Fetching RevenueCat offerings...');
    const offerings = await purchasesInstance.getOfferings();
    
    if (!offerings || !offerings.all) {
      console.warn('No offerings found');
      return [];
    }
    
    const offeringsArray = Object.values(offerings.all);
    console.log(`Found ${offeringsArray.length} offerings`);
    
    return offeringsArray;
  } catch (error) {
    console.error('Failed to get offerings:', error);
    return [];
  }
};

export const purchasePackage = async (packageToPurchase: any) => {
  if (!isConfigured || !purchasesInstance) {
    throw new Error('RevenueCat not configured');
  }

  try {
    console.log('Attempting to purchase package:', packageToPurchase.identifier);
    const { customerInfo } = await purchasesInstance.purchasePackage(packageToPurchase);
    console.log('Purchase successful');
    return customerInfo;
  } catch (error: any) {
    console.error('Purchase failed:', error);
    
    // Handle specific error types
    if (error.userCancelled) {
      throw { userCancelled: true, message: 'Purchase was cancelled' };
    }
    
    throw error;
  }
};

export const getCustomerInfo = async () => {
  if (!isConfigured || !purchasesInstance) {
    console.warn('RevenueCat not configured');
    return null;
  }

  try {
    const customerInfo = await purchasesInstance.getCustomerInfo();
    return customerInfo;
  } catch (error) {
    console.error('Failed to get customer info:', error);
    return null;
  }
};

export const restorePurchases = async () => {
  if (!isConfigured || !purchasesInstance) {
    throw new Error('RevenueCat not configured');
  }

  try {
    console.log('Restoring purchases...');
    const { customerInfo } = await purchasesInstance.restorePurchases();
    console.log('Purchases restored successfully');
    return customerInfo;
  } catch (error) {
    console.error('Failed to restore purchases:', error);
    throw error;
  }
};

export const isRevenueCatConfigured = (): boolean => {
  return isBrowser(); // Temporarily bypass API key validation for testing
};

export const isRevenueCatReady = (): boolean => {
  return isConfigured && !!purchasesInstance && initializationAttempted;
};

export const isPremiumUser = (customerInfo: any): boolean => {
  if (!customerInfo) return false;
  
  try {
    // Check if user has any active entitlements
    const entitlements = customerInfo.entitlements?.active || {};
    return Object.keys(entitlements).length > 0;
  } catch {
    return false;
  }
};

export const getPremiumEntitlement = (customerInfo: any): string | null => {
  if (!customerInfo) return null;
  
  try {
    const entitlements = customerInfo.entitlements?.active || {};
    const entitlementKeys = Object.keys(entitlements);
    
    return entitlementKeys.length > 0 ? entitlementKeys[0] : null;
  } catch {
    return null;
  }
};

// Force re-initialization (useful for debugging)
export const reinitializeRevenueCat = async (userId?: string) => {
  console.log('Force reinitializing RevenueCat...');
  isConfigured = false;
  isInitializing = false;
  initializationAttempted = false;
  purchasesInstance = null;
  
  await initializeRevenueCat(userId);
};