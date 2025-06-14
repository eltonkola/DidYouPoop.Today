export interface StripeProduct {
  id: string;
  priceId: string;
  name: string;
  description: string;
  mode: 'payment' | 'subscription';
  price: number;
  currency: string;
  interval?: 'month' | 'year';
}

export const stripeProducts: StripeProduct[] = [
  {
    id: 'prod_SUhPgJzbsYYfUL',
    priceId: 'price_1RZi0v7869GA2BKcr5BMOhKB',
    name: 'DidYouPoop Pro',
    description: 'DidYouPoop pro',
    mode: 'subscription',
    price: 2.99,
    currency: 'usd',
    interval: 'month',
  },
];

export function getProductById(id: string): StripeProduct | undefined {
  return stripeProducts.find(product => product.id === id);
}

export function getProductByPriceId(priceId: string): StripeProduct | undefined {
  return stripeProducts.find(product => product.priceId === priceId);
}