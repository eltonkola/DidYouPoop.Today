'use client';

import { useAuthStore } from '@/lib/auth-store';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Crown, ShieldCheck, BarChart3, Globe, Sparkles } from 'lucide-react';
import { AdvancedAnalytics } from '@/components/analytics/advanced-analytics';
import { motion } from 'framer-motion';
import { usePoopStore } from '@/lib/store';

export default function ExtraFeaturesPage() {
  const { user } = useAuthStore();
  const isPremium = user?.subscription_tier === 'premium';

  if (!isPremium) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <Card className="w-full max-w-md">
          <CardHeader>
            <div className="flex items-center gap-2">
              <Crown className="w-6 h-6 text-yellow-600" />
              <CardTitle>Premium Features</CardTitle>
            </div>
          </CardHeader>
          <CardContent>
            <p className="text-center text-muted-foreground">
              These features are available to premium subscribers only.
              Please upgrade to premium to access them.
            </p>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="container mx-auto py-8">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <h1 className="text-3xl font-bold mb-8 flex items-center gap-2">
          <Crown className="w-6 h-6 text-yellow-600" />
          Premium Features
        </h1>

        <div className="grid gap-6 md:grid-cols-2">
          {/* Advanced Analytics */}
          <Card>
            <CardHeader>
              <div className="flex items-center gap-2">
                <BarChart3 className="w-5 h-5 text-blue-500" />
                <CardTitle>Advanced Analytics</CardTitle>
              </div>
            </CardHeader>
            <CardContent>
              <AdvancedAnalytics />
            </CardContent>
          </Card>

          {/* Global Statistics */}
          <Card>
            <CardHeader>
              <div className="flex items-center gap-2">
                <Globe className="w-5 h-5 text-purple-500" />
                <CardTitle>Global Statistics</CardTitle>
              </div>
            </CardHeader>
            <CardContent>
              <ul className="space-y-2">
                <li className="flex items-center gap-2">
                  <ShieldCheck className="w-4 h-4 text-green-500" />
                  <span>Compare with global averages</span>
                </li>
                <li className="flex items-center gap-2">
                  <ShieldCheck className="w-4 h-4 text-green-500" />
                  <span>Regional trends analysis</span>
                </li>
                <li className="flex items-center gap-2">
                  <ShieldCheck className="w-4 h-4 text-green-500" />
                  <span>Country-specific insights</span>
                </li>
              </ul>
            </CardContent>
          </Card>

          {/* Expert Insights */}
          <Card>
            <CardHeader>
              <div className="flex items-center gap-2">
                <Sparkles className="w-5 h-5 text-pink-500" />
                <CardTitle>Expert Insights</CardTitle>
              </div>
            </CardHeader>
            <CardContent>
              <ul className="space-y-2">
                <li className="flex items-center gap-2">
                  <ShieldCheck className="w-4 h-4 text-green-500" />
                  <span>Personalized health recommendations</span>
                </li>
                <li className="flex items-center gap-2">
                  <ShieldCheck className="w-4 h-4 text-green-500" />
                  <span>Dietary suggestions</span>
                </li>
                <li className="flex items-center gap-2">
                  <ShieldCheck className="w-4 h-4 text-green-500" />
                  <span>Lifestyle tips</span>
                </li>
              </ul>
            </CardContent>
          </Card>
        </div>
      </motion.div>
    </div>
  );
}
