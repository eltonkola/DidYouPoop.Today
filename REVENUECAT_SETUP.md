# RevenueCat Setup Guide for DidYouPoop.online

## 1. Create RevenueCat Account

1. Go to [RevenueCat](https://www.revenuecat.com/) and create an account
2. Create a new project for your app
3. Note down your **Public API Key** from the dashboard

## 2. Configure Products in RevenueCat

### Create Entitlements
1. Go to **Entitlements** in your RevenueCat dashboard
2. Create an entitlement called `premium`
3. This will be used to check if users have premium access

### Create Products
1. Go to **Products** in your RevenueCat dashboard
2. Create products for your subscription tiers:
   - **Monthly Premium**: `didyoupoop_premium_monthly`
   - **Annual Premium**: `didyoupoop_premium_annual` (optional)

### Create Offerings
1. Go to **Offerings** in your RevenueCat dashboard
2. Create an offering called `default`
3. Add your products to this offering
4. Attach the `premium` entitlement to these products

## 3. Configure App Store Connect (iOS) / Google Play Console (Android)

### For Web (Stripe Integration)
RevenueCat can handle web payments through Stripe:

1. In RevenueCat dashboard, go to **Integrations**
2. Connect your Stripe account
3. Configure your products in Stripe
4. RevenueCat will automatically sync the products

## 4. Environment Variables

Add to your `.env.local`:

```env
NEXT_PUBLIC_REVENUECAT_API_KEY=rcpk_your_public_api_key_here
```

## 5. Test Your Setup

### Test Mode
1. RevenueCat automatically provides sandbox/test mode
2. Use test payment methods to verify the flow
3. Check that entitlements are properly granted

### Production
1. Switch to production mode in RevenueCat dashboard
2. Update your API key to the production key
3. Test with real payment methods

## 6. Webhook Configuration (Optional)

For real-time updates, you can set up webhooks:

1. Go to **Integrations** > **Webhooks** in RevenueCat
2. Add your webhook URL: `https://your-domain.com/api/revenuecat-webhook`
3. Select events you want to receive

## 7. Benefits of RevenueCat

### Compared to Direct Stripe Integration:
- ✅ **Simplified Setup**: No need for complex webhook handling
- ✅ **Cross-Platform**: Works on web, iOS, Android with same code
- ✅ **Built-in Analytics**: Revenue analytics and cohort analysis
- ✅ **A/B Testing**: Built-in paywall and pricing experiments
- ✅ **Customer Support**: Built-in customer lookup and refund tools
- ✅ **Reliable**: Handles edge cases and payment failures automatically
- ✅ **Real-time**: Instant entitlement updates across devices

### Features:
- **Subscription Management**: Automatic handling of renewals, cancellations, upgrades
- **Receipt Validation**: Automatic validation of App Store/Play Store receipts
- **Customer Insights**: Detailed customer lifecycle and revenue analytics
- **Integrations**: Works with 30+ analytics and attribution platforms
- **Restore Purchases**: Built-in purchase restoration
- **Family Sharing**: Automatic support for App Store family sharing

## 8. Migration from Stripe

If you have existing Stripe customers:

1. **Customer Import**: RevenueCat can import existing Stripe customers
2. **Gradual Migration**: You can run both systems in parallel
3. **Data Sync**: RevenueCat maintains sync with Stripe for web payments

## 9. Pricing

RevenueCat is free for:
- Up to $10k monthly tracked revenue
- Unlimited apps and users
- All core features

Perfect for getting started and scaling up!

## 10. Testing Checklist

- [ ] RevenueCat account created and configured
- [ ] Products and entitlements set up
- [ ] API key added to environment variables
- [ ] Test purchase flow works
- [ ] Premium features unlock correctly
- [ ] Subscription status updates properly
- [ ] Restore purchases works
- [ ] Analytics data appears in RevenueCat dashboard

## 11. Support

- [RevenueCat Documentation](https://docs.revenuecat.com/)
- [RevenueCat Community](https://community.revenuecat.com/)
- [RevenueCat Support](https://support.revenuecat.com/)

RevenueCat provides much better developer experience and reliability compared to custom Stripe integration, especially for subscription-based apps!