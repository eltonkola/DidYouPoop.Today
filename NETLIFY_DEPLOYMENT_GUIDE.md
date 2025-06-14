# Netlify Deployment Guide for DidYouPoop.Today

## 1. Build Settings

Configure these in your Netlify dashboard under **Site settings > Build & deploy**:

### Build Command
```
npm run build
```

### Publish Directory
```
.next
```

### Node Version
```
18
```

## 2. Environment Variables

Add these in **Site settings > Environment variables**:

### Required Supabase Variables
```
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_anon_key_here
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key_here
```

### Required Stripe Variables (for premium features)
```
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_live_your_publishable_key
STRIPE_SECRET_KEY=sk_live_your_secret_key
STRIPE_WEBHOOK_SECRET=whsec_your_webhook_secret
```

### Build Environment
```
NODE_ENV=production
```

## 3. Domain Configuration

### Custom Domain (Optional)
1. Go to **Site settings > Domain management**
2. Add your custom domain (e.g., `didyoupoop.today`)
3. Configure DNS records as instructed by Netlify

### HTTPS
- Netlify automatically provides SSL certificates
- Force HTTPS redirect is enabled by default

## 4. Supabase Edge Functions

Since this is a static deployment, your Supabase edge functions need to be deployed separately:

### Deploy Edge Functions to Supabase
1. Install Supabase CLI locally
2. Run: `supabase functions deploy stripe-checkout`
3. Run: `supabase functions deploy stripe-webhook`

### Configure Stripe Webhooks
1. In Stripe Dashboard, go to **Developers > Webhooks**
2. Add endpoint: `https://your-project.supabase.co/functions/v1/stripe-webhook`
3. Select events:
   - `checkout.session.completed`
   - `customer.subscription.created`
   - `customer.subscription.updated`
   - `customer.subscription.deleted`
   - `invoice.payment_succeeded`
   - `invoice.payment_failed`

## 5. Performance Optimizations

### Build Optimizations
The app is configured with:
- Static export compatibility
- Image optimization disabled for static hosting
- SWC minification disabled to prevent build issues
- Webpack caching disabled to prevent EIO errors

### Caching Strategy
- Static assets cached for 1 year
- HTML files not cached (for dynamic updates)
- Service worker for offline functionality (if needed)

## 6. Monitoring & Analytics

### Netlify Analytics
Enable in **Site settings > Analytics** for:
- Page views
- Unique visitors
- Top pages
- Traffic sources

### Error Monitoring
Consider adding:
- Sentry for error tracking
- LogRocket for user session recording
- Google Analytics for detailed analytics

## 7. Security Considerations

### Environment Variables
- Never commit secrets to git
- Use different keys for staging/production
- Rotate keys regularly

### Content Security Policy
Configured in `netlify.toml` to allow:
- Stripe.js for payments
- Supabase for data
- Self-hosted assets

### CORS Configuration
Ensure Supabase project allows your domain:
1. Go to Supabase Dashboard > Settings > API
2. Add your Netlify domain to allowed origins

## 8. Deployment Checklist

Before going live:

- [ ] All environment variables configured
- [ ] Supabase edge functions deployed
- [ ] Stripe webhooks configured
- [ ] Custom domain configured (if applicable)
- [ ] SSL certificate active
- [ ] Test authentication flow
- [ ] Test premium upgrade flow
- [ ] Test data sync across devices
- [ ] Verify all pages load correctly
- [ ] Check mobile responsiveness
- [ ] Test offline functionality

## 9. Troubleshooting

### Common Issues

**Build Fails:**
- Check Node version (should be 18+)
- Verify all environment variables are set
- Check for TypeScript errors

**Authentication Not Working:**
- Verify Supabase URL and keys
- Check CORS settings in Supabase
- Ensure domain is added to Supabase allowed origins

**Stripe Integration Issues:**
- Verify edge functions are deployed
- Check webhook endpoint URL
- Confirm webhook secret matches

**Performance Issues:**
- Enable Netlify's asset optimization
- Consider using Netlify's image CDN
- Implement lazy loading for heavy components

## 10. Post-Deployment

### SEO Optimization
- Submit sitemap to Google Search Console
- Configure meta tags for social sharing
- Set up Google Analytics

### User Feedback
- Monitor error rates
- Set up user feedback collection
- Track conversion rates for premium upgrades

### Maintenance
- Regular dependency updates
- Monitor Supabase usage
- Review Stripe transaction logs
- Backup user data regularly