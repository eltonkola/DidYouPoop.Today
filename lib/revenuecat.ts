let isConfigured = false;
let isInitializing = false;
let initializationAttempted = false;
let purchasesInstance: any = null;

const isBrowser = () => typeof window !== 'undefined';

export const initializeRevenueCat = async (userId?: string) => {
  if (!isBrowser()) {
    console.log('RevenueCat initialization skipped - not in browser');
    return;
  }

  if (isConfigured || isInitializing || initializationAttempted) {
    console.log('RevenueCat initialization already attempted or in progress');
    return;
  }

  const apiKey = 'rcb_BanyGJtoufgcVNwnMdMWcWdfRfme';
  isInitializing = true;
  initializationAttempted = true;

  try {
    console.log('Attempting to initialize RevenueCat...');
    const { default: Purchases } = await import('@revenuecat/purchases-js');

    if (!Purchases || typeof Purchases.configure !== 'function') {
      throw new Error('RevenueCat Purchases module or configure function not found');
    }

    await Purchases.configure(apiKey, userId);
    purchasesInstance = Purchases;
    isConfigured = true;

    console.log('RevenueCat initialized successfully');

    // Optional test
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

export const isRevenueCatConfigured = (): boolean => {
  return isConfigured;
};

export const isRevenueCatReady = (): boolean => {
  return isConfigured && !!purchasesInstance && initializationAttempted;
};

export const getOfferings = async () => {
  if (!isRevenueCatReady()) {
    console.warn('RevenueCat not ready');
    return [];
  }

  try {
    const offerings = await purchasesInstance.getOfferings();
    return Object.values(offerings.all || {});
  } catch (error) {
    console.error('Failed to get offerings:', error);
    return [];
  }
};

export const purchasePackage = async (packageToPurchase: any) => {
  if (!isRevenueCatReady()) throw new Error('RevenueCat not ready');

  try {
    const { customerInfo } = await purchasesInstance.purchasePackage(packageToPurchase);
    return customerInfo;
  } catch (error: any) {
    if (error?.userCancelled) {
      throw { userCancelled: true, message: 'Purchase was cancelled' };
    }
    throw error;
  }
};

export const getCustomerInfo = async () => {
  if (!isRevenueCatReady()) return null;

  try {
    return await purchasesInstance.getCustomerInfo();
  } catch (error) {
    console.error('Failed to get customer info:', error);
    return null;
  }
};

export const restorePurchases = async () => {
  if (!isRevenueCatReady()) throw new Error('RevenueCat not ready');

  try {
    const { customerInfo } = await purchasesInstance.restorePurchases();
    return customerInfo;
  } catch (error) {
    console.error('Failed to restore purchases:', error);
    throw error;
  }
};

export const isPremiumUser = (customerInfo: any): boolean => {
  if (!customerInfo) return false;
  try {
    return Object.keys(customerInfo.entitlements?.active || {}).length > 0;
  } catch {
    return false;
  }
};

export const getPremiumEntitlement = (customerInfo: any): string | null => {
  if (!customerInfo) return null;
  try {
    const keys = Object.keys(customerInfo.entitlements?.active || {});
    return keys[0] ?? null;
  } catch {
    return null;
  }
};

export const reinitializeRevenueCat = async (userId?: string) => {
  isConfigured = false;
  isInitializing = false;
  initializationAttempted = false;
  purchasesInstance = null;
  await initializeRevenueCat(userId);
};
