'use client';

import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { CheckCircle, XCircle, AlertCircle, Loader2, RefreshCw } from 'lucide-react';
import { supabase, isSupabaseConfigured } from '@/lib/supabase';
import { useAuthStore } from '@/lib/auth-store';

export default function DebugPage() {
  const { user } = useAuthStore();
  const [testing, setTesting] = useState(false);
  const [results, setResults] = useState<any[]>([]);

  const runTests = async () => {
    setTesting(true);
    const testResults = [];

    // Test 1: Supabase Configuration
    testResults.push({
      name: 'Supabase Configuration',
      status: isSupabaseConfigured() ? 'success' : 'error',
      message: isSupabaseConfigured() ? 'Properly configured' : 'Missing configuration',
    });

    if (isSupabaseConfigured() && supabase) {
      // Test 2: Database Connection
      try {
        const { data, error } = await supabase.auth.getSession();
        testResults.push({
          name: 'Database Connection',
          status: error ? 'error' : 'success',
          message: error ? error.message : 'Connected successfully',
        });
      } catch (error: any) {
        testResults.push({
          name: 'Database Connection',
          status: 'error',
          message: error.message,
        });
      }

      // Test 3: Profiles Table
      try {
        const { data, error } = await supabase
          .from('profiles')
          .select('count')
          .limit(1);
        
        testResults.push({
          name: 'Profiles Table',
          status: error ? 'error' : 'success',
          message: error ? error.message : 'Table exists and accessible',
        });
      } catch (error: any) {
        testResults.push({
          name: 'Profiles Table',
          status: 'error',
          message: error.message,
        });
      }
    }

    // Test 4: RevenueCat Configuration
    try {
      const { isRevenueCatConfigured, isRevenueCatReady, reinitializeRevenueCat } = await import('@/lib/revenuecat');
      
      const isConfigured = isRevenueCatConfigured();
      const isReady = isRevenueCatReady();
      
      testResults.push({
        name: 'RevenueCat Configuration',
        status: isConfigured ? 'success' : 'warning',
        message: isConfigured ? 'API key configured' : 'API key not configured',
      });

      testResults.push({
        name: 'RevenueCat Initialization',
        status: isReady ? 'success' : 'warning',
        message: isReady ? 'Successfully initialized' : 'Not initialized or failed',
      });

      // Test RevenueCat connection if configured
      if (isConfigured) {
        try {
          // Try to reinitialize and test
          await reinitializeRevenueCat(user?.id);
          
          const { getCustomerInfo } = await import('@/lib/revenuecat');
          const customerInfo = await getCustomerInfo();
          
          testResults.push({
            name: 'RevenueCat Connection',
            status: customerInfo ? 'success' : 'warning',
            message: customerInfo ? 'Connected successfully' : 'Connected but no customer info',
          });
        } catch (error: any) {
          testResults.push({
            name: 'RevenueCat Connection',
            status: 'error',
            message: error.message || 'Connection failed',
          });
        }

        // Test offerings
        try {
          const { getOfferings } = await import('@/lib/revenuecat');
          const offerings = await getOfferings();
          
          testResults.push({
            name: 'RevenueCat Offerings',
            status: offerings.length > 0 ? 'success' : 'warning',
            message: `Found ${offerings.length} offerings`,
          });
        } catch (error: any) {
          testResults.push({
            name: 'RevenueCat Offerings',
            status: 'error',
            message: error.message || 'Failed to fetch offerings',
          });
        }
      }
    } catch (error: any) {
      testResults.push({
        name: 'RevenueCat Module',
        status: 'error',
        message: 'Failed to load RevenueCat module',
      });
    }

    setResults(testResults);
    setTesting(false);
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'success':
        return <CheckCircle className="w-5 h-5 text-green-600" />;
      case 'error':
        return <XCircle className="w-5 h-5 text-red-600" />;
      case 'warning':
        return <AlertCircle className="w-5 h-5 text-yellow-600" />;
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

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <div className="text-center mb-8">
        <h1 className="text-4xl font-bold mb-4">Debug Information</h1>
        <p className="text-xl text-muted-foreground">
          Diagnose configuration and connectivity issues
        </p>
      </div>

      {/* Current Status */}
      <Card>
        <CardHeader>
          <CardTitle>Current Status</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <span className="font-medium">Authentication:</span>
              <Badge variant={user ? "default" : "secondary"} className="ml-2">
                {user ? 'Authenticated' : 'Anonymous'}
              </Badge>
            </div>
            <div>
              <span className="font-medium">Supabase:</span>
              <Badge variant={isSupabaseConfigured() ? "default" : "destructive"} className="ml-2">
                {isSupabaseConfigured() ? 'Configured' : 'Not Configured'}
              </Badge>
            </div>
          </div>
          
          {user && (
            <div className="p-4 bg-muted rounded-lg">
              <h4 className="font-medium mb-2">User Information</h4>
              <div className="text-sm space-y-1">
                <div>Email: {user.email}</div>
                <div>ID: {user.id}</div>
                <div>Subscription: {user.subscription_tier || 'Unknown'}</div>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Test Results */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle>System Tests</CardTitle>
            <Button
              onClick={runTests}
              disabled={testing}
              variant="outline"
            >
              {testing ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Testing...
                </>
              ) : (
                <>
                  <RefreshCw className="w-4 h-4 mr-2" />
                  Run Tests
                </>
              )}
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          {results.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              Click "Run Tests" to diagnose your setup
            </div>
          ) : (
            <div className="space-y-4">
              {results.map((result, index) => (
                <div
                  key={index}
                  className={`p-4 rounded-lg border-2 ${getStatusColor(result.status)}`}
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      {getStatusIcon(result.status)}
                      <div>
                        <h3 className="font-semibold">{result.name}</h3>
                        <p className="text-sm text-muted-foreground">
                          {result.message}
                        </p>
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
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Environment Variables */}
      <Card>
        <CardHeader>
          <CardTitle>Environment Variables</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-2 font-mono text-sm">
            <div className="flex justify-between">
              <span>NEXT_PUBLIC_SUPABASE_URL:</span>
              <Badge variant={process.env.NEXT_PUBLIC_SUPABASE_URL ? "default" : "destructive"}>
                {process.env.NEXT_PUBLIC_SUPABASE_URL ? 'Set' : 'Missing'}
              </Badge>
            </div>
            <div className="flex justify-between">
              <span>NEXT_PUBLIC_SUPABASE_ANON_KEY:</span>
              <Badge variant={process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ? "default" : "destructive"}>
                {process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ? 'Set' : 'Missing'}
              </Badge>
            </div>
            <div className="flex justify-between">
              <span>NEXT_PUBLIC_REVENUECAT_API_KEY:</span>
              <Badge variant={process.env.NEXT_PUBLIC_REVENUECAT_API_KEY ? "default" : "secondary"}>
                {process.env.NEXT_PUBLIC_REVENUECAT_API_KEY ? 'Set' : 'Missing'}
              </Badge>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}