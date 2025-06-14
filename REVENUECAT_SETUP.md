# RevenueCat Setup Guide for DidYouPoop.online

## 1. Create RevenueCat Account

1. Go to [RevenueCat](https://www.revenuecat.com/) and create an account
2. Create a new project called "DidYouPoop"

## 2. Configure Products

### In RevenueCat Dashboard:

1. Go to **Products** section
2. Create the following products:

#### Monthly Subscription
- **Product ID**: `didyoupoop_premium_monthly`
- **Display Name**: DidYouPoop Premium
- **Description**: Monthly subscription with advanced features and cloud sync
- **Type**: Subscription
- **Duration**: 1 month

#### Yearly Subscription (Optional)
- **Product ID**: `didyoupoop_premium_yearly`
- **Display Name**: DidYouPoop Premium (Yearly)
- **Description**: Yearly subscription with advanced features and cloud sync - Save 20%!
- **Type**: Subscription
- **Duration**: 1 year

## 3. Configure Entitlements

1. Go to **Entitlements** section
2. Create an entitlement called `premium`
3. Attach both products to this entitlement

## 4. Configure Offerings

1. Go to **Offerings** section
2. Create a default offering
3. Add both products to the offering
4. Set the monthly subscription as the default package

## 5. Get API Keys

1. Go to **API Keys** section
2. Copy the **Public API Key** for Web
3. Add it to your environment variables

## 6. Environment Variables

Add to your `.env.local`:

```
NEXT_PUBLIC_REVENUECAT_API_KEY=your_public_api_key_here
```

## 7. Configure App Store Connect (iOS) - Optional

If you plan to support iOS in the future:

1. In RevenueCat Dashboard, go to **App settings**
2. Add your iOS app
3. Configure the Bundle ID and App Store Connect integration

## 8. Configure Google Play Console (Android) - Optional

If you plan to support Android in the future:

1. In RevenueCat Dashboard, go to **App settings**
2. Add your Android app
3. Configure the Package Name and Google Play Console integration

## 9. Test Your Setup

1. Deploy your app with the RevenueCat API key
2. Test the premium upgrade flow
3. Verify that purchases are tracked in RevenueCat dashboard

## 10. Webhooks (Optional)

For advanced integrations, you can configure webhooks:

1. Go to **Integrations** > **Webhooks**
2. Add your webhook URL
3. Configure events you want to receive

## Important Notes

- **Web Support**: RevenueCat's web SDK is in beta. It works great for web apps but has some limitations compared to mobile SDKs.
- **Payment Processing**: RevenueCat handles the subscription logic, but actual payments are processed through Stripe (for web).
- **Testing**: Use RevenueCat's sandbox environment for testing before going live.
- **Analytics**: RevenueCat provides excellent analytics and cohort analysis for your subscription business.

## Pricing

RevenueCat is free for up to $10k in tracked revenue per month, which is perfect for getting started!