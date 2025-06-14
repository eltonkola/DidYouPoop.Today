# CORS Fix Instructions

## The Problem
The CORS error you're seeing indicates that the browser's preflight OPTIONS request is not receiving an HTTP 200 status code from your Supabase Edge Functions.

## The Solution
I've updated both edge functions (`stripe-checkout` and `stripe-webhook`) with the following critical fixes:

### 1. Proper OPTIONS Handling
- **Status Code**: Now returns `200` instead of `204` for OPTIONS requests
- **Headers**: Comprehensive CORS headers that work with all browsers
- **Early Return**: OPTIONS requests are handled immediately before any other logic

### 2. Consistent CORS Headers
All responses now include the same CORS headers:
```javascript
const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type, x-requested-with, accept, origin, referer, user-agent, x-supabase-auth, apikey',
  'Access-Control-Max-Age': '86400',
  'Access-Control-Allow-Credentials': 'false',
};
```

### 3. Error Response Headers
Even error responses now include CORS headers to prevent additional CORS issues.

## Deployment Steps

### 1. Redeploy Edge Functions
You **MUST** redeploy the edge functions for these changes to take effect:

```bash
# Install Supabase CLI (if not already installed)
npm install -g supabase

# Login to Supabase
supabase login

# Link your project (replace with your actual project ID)
supabase link --project-ref YOUR_PROJECT_ID

# Deploy the updated edge functions
supabase functions deploy stripe-checkout
supabase functions deploy stripe-webhook
```

### 2. Verify Deployment
After deployment, check your Supabase Dashboard:
1. Go to **Edge Functions**
2. Verify both functions show as "Active"
3. Check the deployment logs for any errors

### 3. Test CORS
You can test if CORS is now working:

```bash
# Test the checkout function
curl -X OPTIONS \
  -H "Origin: https://didyoupoop.netlify.app" \
  -H "Access-Control-Request-Method: POST" \
  -H "Access-Control-Request-Headers: authorization, content-type" \
  -v \
  https://YOUR_PROJECT_ID.supabase.co/functions/v1/stripe-checkout
```

You should see:
- **Status**: `200 OK`
- **Headers**: All the CORS headers listed above

### 4. Test Premium Upgrade
After redeploying, try the premium upgrade flow again:
1. Sign in to your app
2. Click "Upgrade to Premium"
3. The checkout should now work without CORS errors

## Why This Fixes the Issue

The original issue was that browsers send a "preflight" OPTIONS request before making the actual POST request. This preflight request must:

1. **Return HTTP 200** (not 204 or any error status)
2. **Include all required CORS headers**
3. **Handle the request immediately** without any authentication or validation

The updated edge functions now properly handle these requirements, which should resolve the CORS blocking issue you were experiencing.

## If You Still Have Issues

If CORS errors persist after redeployment:

1. **Clear browser cache** and try again
2. **Check edge function logs** in Supabase Dashboard
3. **Verify environment variables** are set in Supabase
4. **Test with a different browser** to rule out caching issues

The key change is that OPTIONS requests now return status `200` with proper headers, which is what browsers require for CORS preflight requests to succeed.