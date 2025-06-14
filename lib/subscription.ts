import { supabase } from './supabase';
import { getProductByPriceId } from '@/src/stripe-config';

export interface UserSubscription {
  customer_id: string;
  subscription_id: string | null;
  subscription_status: string;
  price_id: string | null;
  current_period_start: number | null;
  current_period_end: number | null;
  cancel_at_period_end: boolean;
  payment_method_brand: string | null;
  payment_method_last4: string | null;
}

export async function getUserSubscription(): Promise<UserSubscription | null> {
  if (!supabase) return null;

  try {
    const { data, error } = await supabase
      .from('stripe_user_subscriptions')
      .select('*')
      .maybeSingle();

    if (error) {
      console.error('Error fetching subscription:', error);
      return null;
    }

    return data;
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
  if (!subscription || !subscription.price_id) {
    return {
      name: 'Free',
      status: 'active',
      isActive: true,
      isPremium: false,
    };
  }

  const product = getProductByPriceId(subscription.price_id);
  const isActive = ['active', 'trialing'].includes(subscription.subscription_status);

  return {
    name: product?.name || 'Premium',
    status: subscription.subscription_status,
    isActive,
    isPremium: isActive,
  };
}

export function formatSubscriptionStatus(status: string): string {
  switch (status) {
    case 'active':
      return 'Active';
    case 'trialing':
      return 'Trial';
    case 'past_due':
      return 'Past Due';
    case 'canceled':
      return 'Canceled';
    case 'incomplete':
      return 'Incomplete';
    case 'incomplete_expired':
      return 'Expired';
    case 'unpaid':
      return 'Unpaid';
    case 'paused':
      return 'Paused';
    case 'not_started':
      return 'Not Started';
    default:
      return status;
  }
}

export function formatPeriodEnd(timestamp: number | null): string {
  if (!timestamp) return '';
  
  const date = new Date(timestamp * 1000);
  return date.toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });
}