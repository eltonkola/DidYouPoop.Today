import Purchases, { PurchasesOffering, PurchasesPackage, CustomerInfo } from '@revenuecat/purchases-js';

let isConfigured = false;
let isInitializing = false;

export const initializeRevenueCat = async (userId?: string) => {
  // Prevent multiple initialization attempts
  if (isConfigured || isInitializing) return;
  
  const apiKey = process.env.NEXT_PUBLIC_REVENUECAT_API_KEY;
  if (!apiKey) {
    console.warn('RevenueCat API key not found. Premium features will be disabled.');
    return;
  }

  // Only run in browser environment
  if (typeof window === 'undefined') {
    console.log('RevenueCat initialization skipped - not in browser environment');
    return;
  }

  isInitializing = true;

  try {
    // Check if Purchases is available
    if (!Purchases || typeof Purchases.configure !== 'function') {
      console.error('RevenueCat Purchases object not available');
      isInitializing = false;
      return;
    }

    await Purchases.configure(apiKey, userId);
    isConfigured = true;
    console.log('RevenueCat initialized successfully');
  } catch (error) {
    console.error('Failed to initialize RevenueCat:', error);
    isConfigured = false;
  } finally {
    isInitializing = false;
  }
};

export const getOfferings = async (): Promise<PurchasesOffering[]> => {
  if (!isConfigured) {
    console.warn('RevenueCat not configured');
    return [];
  }

  try {
    if (!Purchases || typeof Purchases.getOfferings !== 'function') {
      console.error('RevenueCat getOfferings not available');
      return [];
    }

    const offerings = await Purchases.getOfferings();
    return offerings.all;
  } catch (error) {
    console.error('Failed to get offerings:', error);
    return [];
  }
};

export const purchasePackage = async (packageToPurchase: PurchasesPackage): Promise<CustomerInfo | null> => {
  if (!isConfigured) {
    throw new Error('RevenueCat not configured');
  }

  try {
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

export const getCustomerInfo = async (): Promise<CustomerInfo | null> => {
  if (!isConfigured) {
    console.warn('RevenueCat not configured');
    return null;
  }

  try {
    if (!Purchases || typeof Purchases.getCustomerInfo !== 'function') {
      console.error('RevenueCat getCustomerInfo not available');
      return null;
    }

    const customerInfo = await Purchases.getCustomerInfo();
    return customerInfo;
  } catch (error) {
    console.error('Failed to get customer info:', error);
    return null;
  }
};

export const restorePurchases = async (): Promise<CustomerInfo | null> => {
  if (!isConfigured) {
    throw new Error('RevenueCat not configured');
  }

  try {
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
  return isConfigured && !!Purchases && typeof Purchases.configure === 'function';
};

export const isPremiumUser = (customerInfo: CustomerInfo | null): boolean => {
  if (!customerInfo) return false;
  
  // Check if user has any active entitlements
  const entitlements = customerInfo.entitlements.active;
  return Object.keys(entitlements).length > 0;
};

export const getPremiumEntitlement = (customerInfo: CustomerInfo | null): string | null => {
  if (!customerInfo) return null;
  
  const entitlements = customerInfo.entitlements.active;
  const entitlementKeys = Object.keys(entitlements);
  
  return entitlementKeys.length > 0 ? entitlementKeys[0] : null;
};