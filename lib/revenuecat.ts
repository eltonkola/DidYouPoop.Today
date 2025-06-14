let isConfigured = false;
let isInitializing = false;
let initializationAttempted = false;

// Check if we're in a browser environment and RevenueCat is available
const isRevenueCatAvailable = () => {
  if (typeof window === 'undefined') return false;
  
  try {
    // Dynamic import check
    return typeof window !== 'undefined' && window.Purchases !== undefined;
  } catch {
    return false;
  }
};

export const initializeRevenueCat = async (userId?: string) => {
  // Prevent multiple initialization attempts
  if (isConfigured || isInitializing || initializationAttempted) return;
  
  const apiKey = process.env.NEXT_PUBLIC_REVENUECAT_API_KEY;
  if (!apiKey) {
    console.log('RevenueCat API key not found. Premium features will be disabled.');
    initializationAttempted = true;
    return;
  }

  // Only run in browser environment
  if (typeof window === 'undefined') {
    console.log('RevenueCat initialization skipped - not in browser environment');
    return;
  }

  isInitializing = true;
  initializationAttempted = true;

  try {
    // Try to dynamically import RevenueCat
    const { default: Purchases } = await import('@revenuecat/purchases-js');
    
    if (!Purchases || typeof Purchases.configure !== 'function') {
      console.warn('RevenueCat Purchases object not available');
      return;
    }

    await Purchases.configure(apiKey, userId);
    isConfigured = true;
    console.log('RevenueCat initialized successfully');
  } catch (error) {
    console.warn('RevenueCat not available:', error);
    isConfigured = false;
  } finally {
    isInitializing = false;
  }
};

export const getOfferings = async () => {
  if (!isConfigured) {
    console.warn('RevenueCat not configured');
    return [];
  }

  try {
    const { default: Purchases } = await import('@revenuecat/purchases-js');
    
    if (!Purchases || typeof Purchases.getOfferings !== 'function') {
      console.warn('RevenueCat getOfferings not available');
      return [];
    }

    const offerings = await Purchases.getOfferings();
    return offerings.all;
  } catch (error) {
    console.warn('Failed to get offerings:', error);
    return [];
  }
};

export const purchasePackage = async (packageToPurchase: any) => {
  if (!isConfigured) {
    throw new Error('RevenueCat not configured');
  }

  try {
    const { default: Purchases } = await import('@revenuecat/purchases-js');
    
    if (!Purchases || typeof Purchases.purchasePackage !== 'function') {
      throw new Error('RevenueCat purchasePackage not available');
    }

    const { customerInfo } = await Purchases.purchasePackage(packageToPurchase);
    return customerInfo;
  } catch (error) {
    console.error('Purchase failed:', error);
    throw error;
  }
};

export const getCustomerInfo = async () => {
  if (!isConfigured) {
    console.warn('RevenueCat not configured');
    return null;
  }

  try {
    const { default: Purchases } = await import('@revenuecat/purchases-js');
    
    if (!Purchases || typeof Purchases.getCustomerInfo !== 'function') {
      console.warn('RevenueCat getCustomerInfo not available');
      return null;
    }

    const customerInfo = await Purchases.getCustomerInfo();
    return customerInfo;
  } catch (error) {
    console.warn('Failed to get customer info:', error);
    return null;
  }
};

export const restorePurchases = async () => {
  if (!isConfigured) {
    throw new Error('RevenueCat not configured');
  }

  try {
    const { default: Purchases } = await import('@revenuecat/purchases-js');
    
    if (!Purchases || typeof Purchases.restorePurchases !== 'function') {
      throw new Error('RevenueCat restorePurchases not available');
    }

    const { customerInfo } = await Purchases.restorePurchases();
    return customerInfo;
  } catch (error) {
    console.error('Failed to restore purchases:', error);
    throw error;
  }
};

export const isRevenueCatConfigured = (): boolean => {
  return !!process.env.NEXT_PUBLIC_REVENUECAT_API_KEY && typeof window !== 'undefined';
};

export const isRevenueCatReady = (): boolean => {
  return isConfigured && initializationAttempted;
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