# Deployment Troubleshooting Guide

## CORS Issues with Supabase Edge Functions

### Problem
Getting CORS errors when trying to access Supabase Edge Functions from your deployed Netlify site:
```
Access to fetch at 'https://your-project.supabase.co/functions/v1/stripe-checkout' from origin 'https://your-site.netlify.app' has been blocked by CORS policy
```

### Solution Steps

#### 1. Redeploy Edge Functions
The edge functions need to be redeployed with the updated CORS headers:

```bash
# Install Supabase CLI if not already installed
npm install -g supabase

# Login to Supabase
supabase login

# Link your project (replace with your project ID)
supabase link --project-ref YOUR_PROJECT_ID

# Deploy the updated edge functions
supabase functions deploy stripe-checkout
supabase functions deploy stripe-webhook
```

#### 2. Verify Edge Function Deployment
Check that your functions are deployed correctly:

1. Go to your Supabase Dashboard
2. Navigate to **Edge Functions**
3. Verify both `stripe-checkout` and `stripe-webhook` are listed and active
4. Check the logs for any deployment errors

#### 3. Test CORS Headers
You can test if CORS is working by making an OPTIONS request:

```bash
curl -X OPTIONS \
  -H "Origin: https://your-site.netlify.app" \
  -H "Access-Control-Request-Method: POST" \
  -H "Access-Control-Request-Headers: authorization, content-type" \
  -v \
  https://your-project.supabase.co/functions/v1/stripe-checkout
```

You should see these headers in the response:
- `Access-Control-Allow-Origin: *`
- `Access-Control-Allow-Methods: GET, POST, PUT, DELETE, OPTIONS`
- `Access-Control-Allow-Headers: authorization, x-client-info, apikey, content-type, x-requested-with, accept, origin, referer, user-agent`

#### 4. Check Environment Variables
Ensure your edge functions have the required environment variables:

1. Go to Supabase Dashboard > **Settings** > **Edge Functions**
2. Add these secrets:
   ```
   STRIPE_SECRET_KEY=sk_live_your_secret_key
   STRIPE_WEBHOOK_SECRET=whsec_your_webhook_secret
   ```

#### 5. Verify Stripe Webhook Configuration
Make sure your Stripe webhook is pointing to the correct URL:

1. Go to Stripe Dashboard > **Developers** > **Webhooks**
2. Verify the endpoint URL is: `https://YOUR_PROJECT_ID.supabase.co/functions/v1/stripe-webhook`
3. Check that these events are selected:
   - `checkout.session.completed`
   - `customer.subscription.created`
   - `customer.subscription.updated`
   - `customer.subscription.deleted`
   - `invoice.payment_succeeded`
   - `invoice.payment_failed`

## Authentication Issues

### Problem
Users can't sign in or authentication times out.

### Solution Steps

#### 1. Check Supabase Configuration
Verify your environment variables in Netlify:

1. Go to Netlify Dashboard > **Site settings** > **Environment variables**
2. Ensure these are set correctly:
   ```
   NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
   NEXT_PUBLIC_SUPABASE_ANON_KEY=your_anon_key_here
   SUPABASE_SERVICE_ROLE_KEY=your_service_role_key_here
   ```

#### 2. Check Supabase Auth Settings
1. Go to Supabase Dashboard > **Authentication** > **Settings**
2. Add your Netlify domain to **Site URL**: `https://your-site.netlify.app`
3. Add your domain to **Redirect URLs**: `https://your-site.netlify.app/**`

#### 3. Verify Database Migrations
Ensure all database tables are created:

1. Go to Supabase Dashboard > **SQL Editor**
2. Run this query to check if tables exist:
   ```sql
   SELECT table_name FROM information_schema.tables 
   WHERE table_schema = 'public' 
   AND table_name IN ('profiles', 'poop_entries', 'achievements', 'stripe_customers');
   ```

If any tables are missing, run the migration scripts from the `SUPABASE_SETUP.md` file.

## Premium Upgrade Issues

### Problem
Premium upgrade button doesn't work or shows errors.

### Solution Steps

#### 1. Check Stripe Configuration
Verify your Stripe environment variables:

```
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_live_your_publishable_key
STRIPE_SECRET_KEY=sk_live_your_secret_key
STRIPE_WEBHOOK_SECRET=whsec_your_webhook_secret
```

#### 2. Verify Product Configuration
Check that your Stripe product and price IDs are correct in `src/stripe-config.ts`:

```typescript
export const stripeProducts: StripeProduct[] = [
  {
    id: 'prod_YOUR_PRODUCT_ID',
    priceId: 'price_YOUR_PRICE_ID',
    name: 'DidYouPoop Pro',
    description: 'DidYouPoop pro',
    mode: 'subscription',
    price: 2.99,
    currency: 'usd',
    interval: 'month',
  },
];
```

#### 3. Test Edge Function Directly
Test the checkout function directly:

```bash
curl -X POST \
  -H "Authorization: Bearer YOUR_USER_JWT_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "price_id": "price_YOUR_PRICE_ID",
    "mode": "subscription",
    "success_url": "https://your-site.netlify.app/premium/success",
    "cancel_url": "https://your-site.netlify.app/premium"
  }' \
  https://your-project.supabase.co/functions/v1/stripe-checkout
```

## Data Sync Issues

### Problem
User data doesn't sync between devices or gets lost.

### Solution Steps

#### 1. Check RLS Policies
Verify Row Level Security policies are set up correctly:

```sql
-- Check if policies exist
SELECT schemaname, tablename, policyname, permissive, roles, cmd, qual 
FROM pg_policies 
WHERE tablename IN ('profiles', 'poop_entries', 'achievements');
```

#### 2. Test Database Access
Test if authenticated users can access their data:

```sql
-- Test as authenticated user (replace with actual user ID)
SET request.jwt.claims = '{"sub": "user-id-here"}';
SELECT * FROM profiles WHERE id = 'user-id-here';
```

#### 3. Check Cloud Sync Logic
Look for errors in the browser console related to cloud sync. Common issues:
- Network timeouts
- Authentication token expiry
- Database permission errors

## Performance Issues

### Problem
App loads slowly or times out.

### Solution Steps

#### 1. Optimize Build Settings
In your `netlify.toml`, ensure you have:

```toml
[build]
  command = "npm run build"
  publish = ".next"

[build.environment]
  NODE_VERSION = "18"
  NPM_VERSION = "9"
```

#### 2. Check Bundle Size
Large JavaScript bundles can cause slow loading:

```bash
npm run build
# Check the output for large bundle warnings
```

#### 3. Enable Netlify Optimizations
1. Go to Netlify Dashboard > **Site settings** > **Build & deploy** > **Post processing**
2. Enable:
   - Bundle analyzer
   - Pretty URLs
   - Asset optimization

## Debug Tools

### Use the Debug Page
Visit `/debug` on your deployed site to run system diagnostics:
- Tests Supabase connection
- Verifies database tables
- Checks edge function availability
- Shows environment variable status

### Check Browser Console
Look for errors in the browser developer tools:
1. Open Developer Tools (F12)
2. Go to **Console** tab
3. Look for red error messages
4. Check **Network** tab for failed requests

### Monitor Supabase Logs
1. Go to Supabase Dashboard > **Logs**
2. Check **API** logs for database errors
3. Check **Edge Functions** logs for function errors
4. Look for authentication errors in **Auth** logs

### Check Netlify Function Logs
1. Go to Netlify Dashboard > **Functions**
2. Click on any function to see logs
3. Look for deployment or runtime errors

## Getting Help

If you're still experiencing issues:

1. Check the [Supabase Discord](https://discord.supabase.com) for community help
2. Review [Netlify Support Docs](https://docs.netlify.com)
3. Check [Stripe API Documentation](https://stripe.com/docs/api)
4. Look at the browser console and Supabase logs for specific error messages

Remember to never share your secret keys or tokens when asking for help!