let purchasesInstance: any = null;

// Check if we're in a browser environment
const isBrowser = () => typeof window !== 'undefined';

// Initialize RevenueCat
export const initializeRevenueCat = async (userId?: string) => {
  if (!isBrowser()) {
    console.log('RevenueCat init skipped: not in browser');
    return;
  }

  try {
    const RevenueCatModule = await import('@revenuecat/purchases-js');
    const Purchases = RevenueCatModule.default || RevenueCatModule;

    const alreadyConfigured = await Purchases.isConfigured?.();
    if (alreadyConfigured) {
      console.log('RevenueCat already configured');
      purchasesInstance = Purchases;
      return;
    }

    const apiKey = 'rcb_BanyGJtoufgcVNwnMdMWcWdfRfme'; // Your public key
    console.log('Initializing RevenueCat for user:', userId);
    await Purchases.configure(apiKey, userId);
    purchasesInstance = Purchases;

    // Test the connection
    const customerInfo = await Purchases.getCustomerInfo();
    console.log('RevenueCat connection test successful:', customerInfo);
  } catch (error) {
    console.error('RevenueCat initialization failed:', error);
    purchasesInstance = null;
  }
};

export const getOfferings = async () => {
  if (!purchasesInstance) {
    console.warn('RevenueCat not configured');
    return [];
  }

  try {
    console.log('Fetching RevenueCat offerings...');
    const offerings = await purchasesInstance.getOfferings();
    return Object.values(offerings.all ?? {});
  } catch (error) {
    console.error('Failed to get offerings:', error);
    return [];
  }
};

export const purchasePackage = async (pkg: any) => {
  if (!purchasesInstance) throw new Error('RevenueCat not configured');

  try {
    console.log('Purchasing package:', pkg.identifier);
    const { customerInfo } = await purchasesInstance.purchasePackage(pkg);
    return customerInfo;
  } catch (error: any) {
    console.error('Purchase failed:', error);
    if (error.userCancelled) {
      throw { userCancelled: true, message: 'User cancelled purchase' };
    }
    throw error;
  }
};

export const getCustomerInfo = async () => {
  if (!purchasesInstance) {
    console.warn('RevenueCat not configured');
    return null;
  }

  try {
    return await purchasesInstance.getCustomerInfo();
  } catch (error) {
    console.error('Failed to get customer info:', error);
    return null;
  }
};

export const restorePurchases = async () => {
  if (!purchasesInstance) throw new Error('RevenueCat not configured');

  try {
    const { customerInfo } = await purchasesInstance.restorePurchases();
    return customerInfo;
  } catch (error) {
    console.error('Failed to restore purchases:', error);
    throw error;
  }
};

export const isRevenueCatReady = (): boolean => {
  return isBrowser() && !!purchasesInstance;
};

export const isPremiumUser = (customerInfo: any): boolean => {
  try {
    const entitlements = customerInfo?.entitlements?.active || {};
    return Object.keys(entitlements).length > 0;
  } catch {
    return false;
  }
};

export const getPremiumEntitlement = (customerInfo: any): string | null => {
  try {
    const entitlements = customerInfo?.entitlements?.active || {};
    const keys = Object.keys(entitlements);
    return keys.length > 0 ? keys[0] : null;
  } catch {
    return null;
  }
};

export const reinitializeRevenueCat = async (userId?: string) => {
  console.log('Force reinitializing RevenueCat...');
  purchasesInstance = null;
  await initializeRevenueCat(userId);
};

