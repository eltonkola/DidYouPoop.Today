'use client';

import { useAuthStore } from '@/lib/auth-store';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Crown, ShieldCheck, BarChart3, Globe, Sparkles } from 'lucide-react';
import { AdvancedAnalytics } from '@/components/analytics/advanced-analytics';
import { GlobalStatistics } from '@/components/analytics/global-statistics';
import { motion } from 'framer-motion';
import { usePoopStore } from '@/lib/store';
import { AIHealthSummary } from '@/components/ai-health-summary';

export default function ExtraFeaturesPage() {
  const { user } = useAuthStore();
  const isPremium = true; // Always show AI analysis in extra page

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



          {/* Expert Insights */}
          <Card>
            <CardHeader>
              <div className="flex items-center gap-2">
                <Sparkles className="w-5 h-5 text-yellow-500" />
                <CardTitle>Expert Insights</CardTitle>
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <AIHealthSummary isPremium={isPremium} />
              </div>
            </CardContent>
          </Card>

          {/* Global Statistics */}
          <Card>
            <CardHeader>
              <div className="flex items-center gap-2">
                <Globe className="w-5 h-5 text-blue-500" />
                <CardTitle>Global Statistics</CardTitle>
              </div>
            </CardHeader>
            <CardContent>
              <GlobalStatistics isPremium={true} />
            </CardContent>
          </Card>
        </div>
      </motion.div>
    </div>
  );
}
