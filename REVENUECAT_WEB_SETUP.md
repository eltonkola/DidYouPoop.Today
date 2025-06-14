# RevenueCat Web App Setup Guide

## 🌐 **Choose "Web Billing" App Type**

Since you're building a web application (not a mobile app), you need to create a **Web Billing** app in RevenueCat:

### 1. **Create New App in RevenueCat Dashboard**
1. Go to your RevenueCat Dashboard
2. Click **"Create New App"**
3. Select **"Payment providers"** section
4. Choose **"Web Billing - Web subscriptions by RevenueCat"**

### 2. **App Configuration**
- **App Name**: `DidYouPoop Web`
- **Bundle ID/Package Name**: `com.didyoupoop.web` (or your domain)
- **Platform**: Web

## 🔑 **Get the Correct API Key**

After creating your Web Billing app:

1. Go to **API Keys** section
2. Look for your **Web app**
3. Copy the **Public API Key** that starts with `rcpk_`
4. **NOT** the mobile SDK key that starts with `rcb_k`

## 💳 **Payment Processing Setup**

Web Billing apps use RevenueCat's built-in payment processing:

### Option 1: RevenueCat Web Billing (Recommended)
- No need to connect external payment providers
- RevenueCat handles all payment processing
- Supports credit cards, Apple Pay, Google Pay
- Built-in tax handling and compliance

### Option 2: Connect Stripe (Alternative)
- If you prefer using your own Stripe account
- Go to **Integrations** → **Stripe**
- Connect your Stripe account

## 📦 **Product Configuration**

Create your products in RevenueCat:

### Monthly Premium
- **Product ID**: `premium_monthly`
- **Price**: $2.99/month
- **Type**: Subscription
- **Billing Period**: Monthly

### Yearly Premium (Optional)
- **Product ID**: `premium_yearly`
- **Price**: $29.99/year
- **Type**: Subscription
- **Billing Period**: Yearly

## 🎯 **Entitlements Setup**

1. Go to **Entitlements**
2. Create entitlement: `premium`
3. Attach your products to this entitlement

## 📋 **Offerings Configuration**

1. Go to **Offerings**
2. Create default offering: `default`
3. Add your products to the offering
4. Set monthly as default package

## 🔧 **Environment Variable**

Update your `.env.local`:

```env
NEXT_PUBLIC_REVENUECAT_API_KEY=rcpk_xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx
```

## ✅ **Verification Steps**

1. Deploy your app with the new API key
2. Visit `/debug` page
3. Run tests to verify:
   - ✅ RevenueCat Configuration: API key configured
   - ✅ RevenueCat Initialization: Successfully initialized
   - ✅ RevenueCat Connection: Connected successfully
   - ✅ RevenueCat Offerings: Found X offerings

## 🚀 **Testing Your Setup**

1. Go to `/premium` page
2. You should see your configured products
3. Test the purchase flow in sandbox mode
4. Verify purchases in RevenueCat dashboard

## 🎉 **Why Web Billing is Perfect for Your App**

- **No App Store Required**: Direct web payments
- **Higher Revenue**: No 30% app store fees
- **Global Reach**: Works worldwide
- **Tax Compliance**: Automatic tax handling
- **Analytics**: Built-in subscription analytics
- **Customer Portal**: Self-service customer management

## 🔍 **Key Differences from Mobile Apps**

| Feature | Mobile App Store | Web Billing |
|---------|------------------|-------------|
| API Key | `rcb_k...` | `rcpk_...` |
| Payment | App Store/Google Play | Credit Cards/Web |
| Fees | 30% to stores | RevenueCat fees only |
| Setup | Complex store setup | Simple web integration |

## 📞 **Need Help?**

If you're still seeing the `rcb_k` key, it means you created a mobile app instead of a web app. Simply:

1. Create a new **Web Billing** app in RevenueCat
2. Use the new `rcpk_` API key
3. Configure products in the new web app

Your web app will work perfectly with RevenueCat's Web Billing! 🎯