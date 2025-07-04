import { Offering, Package } from '@revenuecat/purchases-js';

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
  
  const apiKey = process.env.NEXT_PUBLIC_REVENUECAT_API_KEY;
  if (!apiKey || apiKey.includes('your_revenuecat') || apiKey === '') {
    console.log('RevenueCat API key not configured. Premium features will be disabled.');
    initializationAttempted = true;
    return;
  }

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
    const Purchases = RevenueCatModule.Purchases;
    
    if (!Purchases) {
      throw new Error('RevenueCat module not found');
    }

    // Configure RevenueCat
    const instance = await Purchases.configure(
      apiKey,
      userId || Purchases.generateRevenueCatAnonymousAppUserId(),
      undefined
    );
    
    // Store the instance
    purchasesInstance = instance;
    isConfigured = true;
    
    console.log('RevenueCat initialized successfully');
    
    // Test the connection
    try {
      const customerInfo = await instance.getCustomerInfo();
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

export const getOfferings = async (): Promise<Offering[]> => {
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
    
    // Type assertion to ensure we get the correct type
    const offeringsArray = Object.values(offerings.all) as Offering[];
    console.log(`Found ${offeringsArray.length} offerings`);
    
    return offeringsArray;
  } catch (error) {
    console.error('Failed to get offerings:', error);
    return [];
  }
};

export const purchasePackage = async (packageToPurchase: Package) => {
  // Ensure RevenueCat is initialized
  if (!isConfigured || !purchasesInstance) {
    console.error('RevenueCat not configured');
    throw new Error('RevenueCat not configured');
  }

  try {
    console.log('Attempting to purchase package:', packageToPurchase.identifier);
    
    // Get customer info before purchase
    const customerInfo = await purchasesInstance.getCustomerInfo();
    console.log('Current customer info:', customerInfo);
    
    // Make the purchase
    const { customerInfo: updatedInfo } = await purchasesInstance.purchasePackage(packageToPurchase);
    
    console.log('Purchase successful');
    return updatedInfo;
  } catch (error: any) {
    console.error('Purchase failed:', error);
    
    // Handle specific error cases
    if (error?.userCancelled) {
      throw { userCancelled: true, message: 'Purchase was cancelled' };
    } else if (error?.code === 'PURCHASE_ERROR') {
      throw { userCancelled: false, message: 'Purchase failed. Please try again.' };
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
  const apiKey = process.env.NEXT_PUBLIC_REVENUECAT_API_KEY;
  return !!(apiKey && !apiKey.includes('your_revenuecat') && apiKey !== '' && isBrowser());
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