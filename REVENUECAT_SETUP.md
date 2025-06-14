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
- **Price**: $2.99/month (or your preferred price)

#### Yearly Subscription (Optional)
- **Product ID**: `didyoupoop_premium_yearly`
- **Display Name**: DidYouPoop Premium (Yearly)
- **Description**: Yearly subscription with advanced features and cloud sync - Save 20%!
- **Type**: Subscription
- **Duration**: 1 year
- **Price**: $29.99/year (or your preferred price)

## 3. Configure Entitlements

1. Go to **Entitlements** section
2. Create an entitlement called `premium`
3. Attach both products to this entitlement

## 4. Configure Offerings

1. Go to **Offerings** section
2. Create a default offering called `default`
3. Add both products to the offering
4. Set the monthly subscription as the default package

## 5. Get API Keys

1. Go to **API Keys** section
2. Copy the **Public API Key** for Web
3. **IMPORTANT**: Make sure you're copying the Web SDK key, not the mobile SDK key

## 6. Environment Variables

Add to your `.env.local` file:

```env
NEXT_PUBLIC_REVENUECAT_API_KEY=rcpk_xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx
```

**Important Notes:**
- The API key should start with `rcpk_`
- Make sure there are no extra spaces or quotes
- This should be the Web SDK public key from RevenueCat dashboard

## 7. Verify Your Setup

1. Deploy your app with the RevenueCat API key
2. Go to `/debug` page on your deployed app
3. Click "Run Tests" to verify RevenueCat is working
4. You should see:
   - ✅ RevenueCat Configuration: API key configured
   - ✅ RevenueCat Initialization: Successfully initialized
   - ✅ RevenueCat Connection: Connected successfully

## 8. Test the Premium Flow

1. Go to `/premium` page
2. You should see your configured products and pricing
3. Test the purchase flow (use test mode first)

## 9. Configure Stripe (Required for Web Payments)

RevenueCat uses Stripe for web payments:

1. In RevenueCat Dashboard, go to **Integrations**
2. Connect your Stripe account
3. Configure your Stripe products to match your RevenueCat products

## 10. Test Mode vs Live Mode

### Test Mode (Recommended First)
1. In RevenueCat Dashboard, make sure you're in **Sandbox** mode
2. Use test Stripe cards for testing
3. Verify purchases appear in RevenueCat dashboard

### Live Mode
1. Switch to **Production** mode in RevenueCat
2. Use real payment methods
3. Monitor real transactions

## Common Issues & Solutions

### Issue: "RevenueCat not configured"
**Solution**: Check that your API key is correctly set in environment variables and starts with `rcpk_`

### Issue: "Cannot read properties of undefined (reading 'configure')"
**Solution**: 
1. Make sure you're using the Web SDK API key (not mobile)
2. Check that the RevenueCat package is properly installed
3. Try clearing your browser cache and rebuilding

### Issue: "No offerings found"
**Solution**:
1. Make sure you've created products in RevenueCat dashboard
2. Verify products are attached to an entitlement
3. Check that you have a default offering configured

### Issue: Purchase flow not working
**Solution**:
1. Ensure Stripe is connected to RevenueCat
2. Verify your Stripe products match RevenueCat products
3. Check that you're in the correct mode (sandbox vs production)

## Important Notes

- **Web Support**: RevenueCat's web SDK is in beta but works well for web apps
- **Payment Processing**: Actual payments are processed through Stripe for web
- **Testing**: Always test in sandbox mode before going live
- **Analytics**: RevenueCat provides excellent analytics for your subscription business
- **Pricing**: RevenueCat is free for up to $10k in tracked revenue per month

## Support

If you're still having issues:
1. Check the `/debug` page for specific error messages
2. Review RevenueCat's [Web SDK documentation](https://docs.revenuecat.com/docs/web)
3. Contact RevenueCat support with specific error messages