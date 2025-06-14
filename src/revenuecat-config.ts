// RevenueCat Product Configuration
// Configure your products in the RevenueCat dashboard and update these identifiers

export interface RevenueCatProduct {
  identifier: string;
  displayName: string;
  description: string;
}

export const revenueCatProducts: RevenueCatProduct[] = [
  {
    identifier: 'didyoupoop_premium_monthly',
    displayName: 'DidYouPoop Premium',
    description: 'Monthly subscription with advanced features and cloud sync',
  },
  {
    identifier: 'didyoupoop_premium_yearly',
    displayName: 'DidYouPoop Premium (Yearly)',
    description: 'Yearly subscription with advanced features and cloud sync - Save 20%!',
  },
];

// Entitlement identifiers (configured in RevenueCat dashboard)
export const PREMIUM_ENTITLEMENT = 'premium';

export function getProductByIdentifier(identifier: string): RevenueCatProduct | undefined {
  return revenueCatProducts.find(product => product.identifier === identifier);
}