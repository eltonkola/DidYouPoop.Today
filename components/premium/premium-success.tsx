'use client';

import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { useRouter } from 'next/navigation';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Crown, Sparkles, CheckCircle, ArrowRight, Home } from 'lucide-react';
import { ConfettiCelebration } from '@/components/confetti-celebration';
import { SoundPlayer } from '@/components/sound-player';

export default function PremiumSuccessPage() {
  const router = useRouter();
  const [showCelebration, setShowCelebration] = useState(false);

  useEffect(() => {
    setShowCelebration(true);
  }, []);

  return (
    <div className="max-w-2xl mx-auto">
      {showCelebration && <ConfettiCelebration />}
      <SoundPlayer trigger={showCelebration} soundType="achievement" />

      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.5 }}
      >
        <Card className="bg-gradient-to-br from-yellow-50 to-amber-50 dark:from-yellow-950/20 dark:to-amber-950/20 border-2 border-yellow-200 dark:border-yellow-800">
          <CardHeader className="text-center pb-6">
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ delay: 0.2, type: "spring", stiffness: 200 }}
              className="flex items-center justify-center gap-2 text-6xl mb-4"
            >
              <Crown className="w-16 h-16 text-yellow-600" />
              <Sparkles className="w-12 h-12 text-yellow-500" />
            </motion.div>
            
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4 }}
            >
              <div className="flex items-center justify-center gap-2 mb-2">
                <CheckCircle className="w-8 h-8 text-green-600" />
                <CardTitle className="text-3xl font-bold text-green-700 dark:text-green-300">
                  Welcome to Premium!
                </CardTitle>
              </div>
              
              <Badge className="bg-yellow-500 hover:bg-yellow-600 text-white text-lg px-4 py-2">
                <Crown className="w-4 h-4 mr-2" />
                Premium Member
              </Badge>
            </motion.div>
          </CardHeader>
          
          <CardContent className="space-y-6 text-center">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.6 }}
            >
              <h2 className="text-xl font-semibold mb-3">
                🎉 Congratulations! Your upgrade was successful!
              </h2>
              <p className="text-muted-foreground mb-6">
                You now have access to all premium features including advanced analytics, 
                cross-device sync, and premium insights for your gut health journey.
              </p>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.8 }}
              className="bg-white/50 dark:bg-gray-800/50 p-4 rounded-lg"
            >
              <h3 className="font-medium mb-2">What's next?</h3>
              <ul className="text-sm text-muted-foreground space-y-1">
                <li>✨ Your data will now sync across all devices</li>
                <li>📊 Check out the new analytics in your history</li>
                <li>🎯 Get personalized insights and recommendations</li>
                <li>🏆 Unlock exclusive premium achievements</li>
              </ul>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 1.0 }}
              className="flex flex-col sm:flex-row gap-4 pt-4"
            >
              <Button
                onClick={() => router.push('/')}
                size="lg"
                className="flex-1 bg-yellow-600 hover:bg-yellow-700 text-white"
              >
                <Home className="w-4 h-4 mr-2" />
                Go to Dashboard
              </Button>
              
              <Button
                onClick={() => router.push('/history')}
                size="lg"
                variant="outline"
                className="flex-1"
              >
                <ArrowRight className="w-4 h-4 mr-2" />
                Explore Analytics
              </Button>
            </motion.div>

            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 1.2 }}
              className="text-xs text-muted-foreground pt-4 border-t"
            >
              <p>
                Thank you for supporting DidYouPoop.online! 
                If you have any questions, feel free to reach out to our support team.
              </p>
            </motion.div>
          </CardContent>
        </Card>
      </motion.div>
    </div>
  );
}