import Purchases, { PurchasesOffering, PurchasesPackage, CustomerInfo } from '@revenuecat/purchases-js';

let isConfigured = false;

export const initializeRevenueCat = async (userId?: string) => {
  if (isConfigured) return;
  
  const apiKey = process.env.NEXT_PUBLIC_REVENUECAT_API_KEY;
  if (!apiKey) {
    console.warn('RevenueCat API key not found. Premium features will be disabled.');
    return;
  }

  try {
    await Purchases.configure(apiKey, userId);
    isConfigured = true;
    console.log('RevenueCat initialized successfully');
  } catch (error) {
    console.error('Failed to initialize RevenueCat:', error);
  }
};

export const getOfferings = async (): Promise<PurchasesOffering[]> => {
  try {
    const offerings = await Purchases.getOfferings();
    return offerings.all;
  } catch (error) {
    console.error('Failed to get offerings:', error);
    return [];
  }
};

export const purchasePackage = async (packageToPurchase: PurchasesPackage): Promise<CustomerInfo | null> => {
  try {
    const { customerInfo } = await Purchases.purchasePackage(packageToPurchase);
    return customerInfo;
  } catch (error) {
    console.error('Purchase failed:', error);
    throw error;
  }
};

export const getCustomerInfo = async (): Promise<CustomerInfo | null> => {
  try {
    const customerInfo = await Purchases.getCustomerInfo();
    return customerInfo;
  } catch (error) {
    console.error('Failed to get customer info:', error);
    return null;
  }
};

export const restorePurchases = async (): Promise<CustomerInfo | null> => {
  try {
    const { customerInfo } = await Purchases.restorePurchases();
    return customerInfo;
  } catch (error) {
    console.error('Failed to restore purchases:', error);
    return null;
  }
};

export const isRevenueCatConfigured = (): boolean => {
  return !!process.env.NEXT_PUBLIC_REVENUECAT_API_KEY;
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