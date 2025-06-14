import { CustomerInfo } from '@revenuecat/purchases-js';
import { getCustomerInfo, isPremiumUser, getPremiumEntitlement } from './revenuecat';

export interface UserSubscription {
  isPremium: boolean;
  entitlement: string | null;
  expirationDate: string | null;
  willRenew: boolean;
  periodType: string | null;
}

export async function getUserSubscription(): Promise<UserSubscription | null> {
  try {
    const customerInfo = await getCustomerInfo();
    
    if (!customerInfo) {
      return {
        isPremium: false,
        entitlement: null,
        expirationDate: null,
        willRenew: false,
        periodType: null,
      };
    }

    const premium = isPremiumUser(customerInfo);
    const entitlement = getPremiumEntitlement(customerInfo);
    
    let expirationDate = null;
    let willRenew = false;
    let periodType = null;
    
    if (premium && entitlement) {
      const entitlementInfo = customerInfo.entitlements.active[entitlement];
      expirationDate = entitlementInfo.expirationDate;
      willRenew = entitlementInfo.willRenew;
      periodType = entitlementInfo.periodType;
    }

    return {
      isPremium: premium,
      entitlement,
      expirationDate,
      willRenew,
      periodType,
    };
  } catch (error) {
    console.error('Error fetching subscription:', error);
    return null;
  }
}

export function getSubscriptionPlan(subscription: UserSubscription | null): {
  name: string;
  status: string;
  isActive: boolean;
  isPremium: boolean;
} {
  if (!subscription || !subscription.isPremium) {
    return {
      name: 'Free',
      status: 'active',
      isActive: true,
      isPremium: false,
    };
  }

  return {
    name: 'Premium',
    status: subscription.willRenew ? 'active' : 'will_cancel',
    isActive: true,
    isPremium: true,
  };
}

export function formatSubscriptionStatus(status: string): string {
  switch (status) {
    case 'active':
      return 'Active';
    case 'will_cancel':
      return 'Will Cancel';
    case 'canceled':
      return 'Canceled';
    case 'expired':
      return 'Expired';
    default:
      return status;
  }
}

export function formatPeriodEnd(expirationDate: string | null): string {
  if (!expirationDate) return '';
  
  const date = new Date(expirationDate);
  return date.toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });
}