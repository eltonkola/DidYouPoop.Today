'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { 
  CheckCircle, 
  XCircle, 
  AlertCircle, 
  Loader2, 
  Database, 
  CreditCard, 
  Key,
  Globe,
  RefreshCw
} from 'lucide-react';
import { supabase, isSupabaseConfigured } from '@/lib/supabase';

interface ValidationResult {
  name: string;
  status: 'success' | 'error' | 'warning' | 'loading';
  message: string;
  details?: string;
}

export default function ValidateEnvPage() {
  const [results, setResults] = useState<ValidationResult[]>([]);
  const [isValidating, setIsValidating] = useState(false);

  const validateEnvironment = async () => {
    setIsValidating(true);
    const validationResults: ValidationResult[] = [];

    // 1. Check Supabase URL
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
    if (!supabaseUrl) {
      validationResults.push({
        name: 'Supabase URL',
        status: 'error',
        message: 'NEXT_PUBLIC_SUPABASE_URL is not set',
        details: 'Add your Supabase project URL to .env.local'
      });
    } else if (supabaseUrl.includes('your_supabase_project_url_here') || supabaseUrl.includes('placeholder')) {
      validationResults.push({
        name: 'Supabase URL',
        status: 'error',
        message: 'Supabase URL contains placeholder text',
        details: 'Replace with your actual Supabase project URL'
      });
    } else {
      try {
        new URL(supabaseUrl);
        validationResults.push({
          name: 'Supabase URL',
          status: 'success',
          message: 'Valid Supabase URL format',
          details: supabaseUrl
        });
      } catch {
        validationResults.push({
          name: 'Supabase URL',
          status: 'error',
          message: 'Invalid URL format',
          details: 'Check your Supabase project URL'
        });
      }
    }

    // 2. Check Supabase Anon Key
    const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
    if (!supabaseAnonKey) {
      validationResults.push({
        name: 'Supabase Anon Key',
        status: 'error',
        message: 'NEXT_PUBLIC_SUPABASE_ANON_KEY is not set',
        details: 'Add your Supabase anon key to .env.local'
      });
    } else if (supabaseAnonKey.includes('your_anon_key_here') || supabaseAnonKey.includes('placeholder')) {
      validationResults.push({
        name: 'Supabase Anon Key',
        status: 'error',
        message: 'Supabase anon key contains placeholder text',
        details: 'Replace with your actual Supabase anon key'
      });
    } else if (supabaseAnonKey.length < 100) {
      validationResults.push({
        name: 'Supabase Anon Key',
        status: 'warning',
        message: 'Supabase anon key seems too short',
        details: 'Verify this is the correct anon key from your Supabase dashboard'
      });
    } else {
      validationResults.push({
        name: 'Supabase Anon Key',
        status: 'success',
        message: 'Supabase anon key is properly formatted',
        details: `${supabaseAnonKey.substring(0, 20)}...`
      });
    }

    // 3. Test Supabase Connection
    if (isSupabaseConfigured() && supabase) {
      try {
        const { data, error } = await supabase.auth.getSession();
        if (error) {
          validationResults.push({
            name: 'Supabase Connection',
            status: 'error',
            message: 'Failed to connect to Supabase',
            details: error.message
          });
        } else {
          validationResults.push({
            name: 'Supabase Connection',
            status: 'success',
            message: 'Successfully connected to Supabase',
            details: 'Authentication service is working'
          });
        }
      } catch (error: any) {
        validationResults.push({
          name: 'Supabase Connection',
          status: 'error',
          message: 'Supabase connection failed',
          details: error.message || 'Unknown error'
        });
      }
    } else {
      validationResults.push({
        name: 'Supabase Connection',
        status: 'error',
        message: 'Cannot test connection - invalid configuration',
        details: 'Fix URL and anon key first'
      });
    }

    // 4. Test Edge Functions (if Supabase is configured)
    if (isSupabaseConfigured() && supabase) {
      try {
        // Test if edge functions are accessible
        const response = await fetch(`${supabaseUrl}/functions/v1/stripe-checkout`, {
          method: 'OPTIONS',
        });
        
        if (response.ok) {
          validationResults.push({
            name: 'Supabase Edge Functions',
            status: 'success',
            message: 'Edge functions are accessible',
            details: 'Stripe integration endpoints are available'
          });
        } else {
          validationResults.push({
            name: 'Supabase Edge Functions',
            status: 'warning',
            message: 'Edge functions may not be deployed',
            details: 'Deploy edge functions to your Supabase project'
          });
        }
      } catch (error) {
        validationResults.push({
          name: 'Supabase Edge Functions',
          status: 'warning',
          message: 'Could not test edge functions',
          details: 'This is normal for local development'
        });
      }
    }

    // 5. Check Stripe Keys (client-side safe check)
    const hasStripePublishable = typeof window !== 'undefined' && 
      process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY && 
      !process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY.includes('placeholder');
    
    if (hasStripePublishable) {
      validationResults.push({
        name: 'Stripe Publishable Key',
        status: 'success',
        message: 'Stripe publishable key is configured',
        details: 'Client-side Stripe integration ready'
      });
    } else {
      validationResults.push({
        name: 'Stripe Publishable Key',
        status: 'warning',
        message: 'Stripe publishable key not found',
        details: 'Add NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY to .env.local for Stripe integration'
      });
    }

    // 6. Check if we're in development mode
    validationResults.push({
      name: 'Environment Mode',
      status: 'success',
      message: `Running in ${process.env.NODE_ENV || 'development'} mode`,
      details: 'Local development environment detected'
    });

    setResults(validationResults);
    setIsValidating(false);
  };

  useEffect(() => {
    validateEnvironment();
  }, []);

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'success':
        return <CheckCircle className="w-5 h-5 text-green-600" />;
      case 'error':
        return <XCircle className="w-5 h-5 text-red-600" />;
      case 'warning':
        return <AlertCircle className="w-5 h-5 text-yellow-600" />;
      case 'loading':
        return <Loader2 className="w-5 h-5 text-blue-600 animate-spin" />;
      default:
        return <AlertCircle className="w-5 h-5 text-gray-600" />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'success':
        return 'bg-green-50 border-green-200 dark:bg-green-950/20 dark:border-green-800';
      case 'error':
        return 'bg-red-50 border-red-200 dark:bg-red-950/20 dark:border-red-800';
      case 'warning':
        return 'bg-yellow-50 border-yellow-200 dark:bg-yellow-950/20 dark:border-yellow-800';
      default:
        return 'bg-gray-50 border-gray-200 dark:bg-gray-950/20 dark:border-gray-800';
    }
  };

  const successCount = results.filter(r => r.status === 'success').length;
  const errorCount = results.filter(r => r.status === 'error').length;
  const warningCount = results.filter(r => r.status === 'warning').length;

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold flex items-center justify-center gap-2 mb-4">
            <Key className="w-10 h-10 text-blue-600" />
            Environment Validation
          </h1>
          <p className="text-xl text-muted-foreground">
            Check if your local environment variables are properly configured
          </p>
        </div>

        {/* Summary Card */}
        <Card className="mb-6">
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle className="flex items-center gap-2">
                <Globe className="w-5 h-5" />
                Validation Summary
              </CardTitle>
              <Button
                onClick={validateEnvironment}
                disabled={isValidating}
                variant="outline"
                size="sm"
              >
                {isValidating ? (
                  <Loader2 className="w-4 h-4 animate-spin mr-2" />
                ) : (
                  <RefreshCw className="w-4 h-4 mr-2" />
                )}
                Re-validate
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-3 gap-4 text-center">
              <div className="p-4 bg-green-50 dark:bg-green-950/20 rounded-lg">
                <div className="text-2xl font-bold text-green-700 dark:text-green-300">
                  {successCount}
                </div>
                <div className="text-sm text-green-600 dark:text-green-400">Passed</div>
              </div>
              <div className="p-4 bg-yellow-50 dark:bg-yellow-950/20 rounded-lg">
                <div className="text-2xl font-bold text-yellow-700 dark:text-yellow-300">
                  {warningCount}
                </div>
                <div className="text-sm text-yellow-600 dark:text-yellow-400">Warnings</div>
              </div>
              <div className="p-4 bg-red-50 dark:bg-red-950/20 rounded-lg">
                <div className="text-2xl font-bold text-red-700 dark:text-red-300">
                  {errorCount}
                </div>
                <div className="text-sm text-red-600 dark:text-red-400">Errors</div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Validation Results */}
        <div className="space-y-4">
          {results.map((result, index) => (
            <motion.div
              key={result.name}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.3, delay: index * 0.1 }}
            >
              <Card className={`border-2 ${getStatusColor(result.status)}`}>
                <CardContent className="p-4">
                  <div className="flex items-start justify-between">
                    <div className="flex items-start gap-3">
                      {getStatusIcon(result.status)}
                      <div>
                        <h3 className="font-semibold">{result.name}</h3>
                        <p className="text-sm text-muted-foreground mb-2">
                          {result.message}
                        </p>
                        {result.details && (
                          <p className="text-xs text-muted-foreground bg-muted p-2 rounded font-mono">
                            {result.details}
                          </p>
                        )}
                      </div>
                    </div>
                    <Badge 
                      variant={result.status === 'success' ? 'default' : 'secondary'}
                      className={
                        result.status === 'success' ? 'bg-green-600 hover:bg-green-700' :
                        result.status === 'error' ? 'bg-red-600 hover:bg-red-700 text-white' :
                        result.status === 'warning' ? 'bg-yellow-600 hover:bg-yellow-700 text-white' :
                        ''
                      }
                    >
                      {result.status.toUpperCase()}
                    </Badge>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </div>

        {/* Next Steps */}
        <Card className="mt-8">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Database className="w-5 h-5" />
              Next Steps
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {errorCount > 0 && (
              <div className="p-4 bg-red-50 dark:bg-red-950/20 border border-red-200 dark:border-red-800 rounded-lg">
                <h4 className="font-semibold text-red-700 dark:text-red-300 mb-2">
                  🚨 Critical Issues Found
                </h4>
                <p className="text-sm text-red-600 dark:text-red-400">
                  Fix the errors above before proceeding. Your app may not work correctly with these issues.
                </p>
              </div>
            )}

            {warningCount > 0 && errorCount === 0 && (
              <div className="p-4 bg-yellow-50 dark:bg-yellow-950/20 border border-yellow-200 dark:border-yellow-800 rounded-lg">
                <h4 className="font-semibold text-yellow-700 dark:text-yellow-300 mb-2">
                  ⚠️ Optional Improvements
                </h4>
                <p className="text-sm text-yellow-600 dark:text-yellow-400">
                  Your app will work, but consider addressing the warnings for full functionality.
                </p>
              </div>
            )}

            {errorCount === 0 && warningCount === 0 && (
              <div className="p-4 bg-green-50 dark:bg-green-950/20 border border-green-200 dark:border-green-800 rounded-lg">
                <h4 className="font-semibold text-green-700 dark:text-green-300 mb-2">
                  ✅ All Good!
                </h4>
                <p className="text-sm text-green-600 dark:text-green-400">
                  Your environment is properly configured. You're ready to test the app locally!
                </p>
              </div>
            )}

            <Separator />

            <div className="space-y-2">
              <h4 className="font-medium">Environment File Example (.env.local):</h4>
              <pre className="text-xs bg-muted p-3 rounded overflow-x-auto">
{`NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_anon_key_here
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key_here
STRIPE_SECRET_KEY=sk_test_your_stripe_secret_key
STRIPE_WEBHOOK_SECRET=whsec_your_webhook_secret
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_test_your_publishable_key`}
              </pre>
            </div>
          </CardContent>
        </Card>
      </motion.div>
    </div>
  );
}