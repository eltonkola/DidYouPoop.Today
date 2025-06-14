import { revenueCat, SubscriptionStatus } from './revenuecat';

export interface UserSubscription {
  isPremium: boolean;
  isActive: boolean;
  productId: string | null;
  expirationDate: Date | null;
  willRenew: boolean;
}

export async function getUserSubscription(): Promise<UserSubscription | null> {
  try {
    if (!revenueCat.isInitialized()) {
      await revenueCat.initialize();
    }
    
    const status = await revenueCat.getSubscriptionStatus();
    
    return {
      isPremium: status.isPremium,
      isActive: status.isActive,
      productId: status.productId,
      expirationDate: status.expirationDate,
      willRenew: status.willRenew,
    };
  } catch (error) {
    console.error('Error fetching subscription from RevenueCat:', error);
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
    status: subscription.isActive ? 'active' : 'expired',
    isActive: subscription.isActive,
    isPremium: subscription.isPremium,
  };
}

export function formatSubscriptionStatus(status: string): string {
  switch (status) {
    case 'active':
      return 'Active';
    case 'expired':
      return 'Expired';
    case 'cancelled':
      return 'Cancelled';
    default:
      return status;
  }
}

export function formatPeriodEnd(date: Date | null): string {
  if (!date) return '';
  
  return date.toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });
}