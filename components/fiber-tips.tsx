'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Lightbulb, RefreshCw } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

const fiberTips = [
  {
    tip: "Start your day with oatmeal topped with berries",
    fiber: "8-10g fiber boost",
    emoji: "🥣"
  },
  {
    tip: "Snack on an apple with the skin on",
    fiber: "4g fiber",
    emoji: "🍎"
  },
  {
    tip: "Choose whole grain bread over white bread",
    fiber: "2-3g more fiber per slice",
    emoji: "🍞"
  },
  {
    tip: "Add beans or lentils to your salad",
    fiber: "6-8g fiber per 1/2 cup",
    emoji: "🫘"
  },
  {
    tip: "Snack on a handful of almonds",
    fiber: "3.5g fiber per ounce",
    emoji: "🥜"
  },
  {
    tip: "Replace white rice with brown rice",
    fiber: "3.5g fiber per cup",
    emoji: "🍚"
  },
  {
    tip: "Add chia seeds to your smoothie",
    fiber: "10g fiber per ounce",
    emoji: "🥤"
  },
  {
    tip: "Choose a pear for dessert",
    fiber: "6g fiber with skin",
    emoji: "🍐"
  },
  {
    tip: "Eat the skin on your sweet potato",
    fiber: "6g fiber per medium potato",
    emoji: "🍠"
  },
  {
    tip: "Sprinkle ground flaxseed on your cereal",
    fiber: "2g fiber per tablespoon",
    emoji: "🌾"
  },
  {
    tip: "Choose raspberries for a sweet treat",
    fiber: "8g fiber per cup",
    emoji: "🫐"
  },
  {
    tip: "Add avocado to your sandwich",
    fiber: "10g fiber per whole avocado",
    emoji: "🥑"
  }
];

export function FiberTips() {
  const [currentTip, setCurrentTip] = useState(0);

  const nextTip = () => {
    setCurrentTip((prev) => (prev + 1) % fiberTips.length);
  };

  useEffect(() => {
    const interval = setInterval(nextTip, 10000); // Auto-rotate every 10 seconds
    return () => clearInterval(interval);
  }, []);

  const tip = fiberTips[currentTip];

  return (
    <Card className="bg-gradient-to-br from-green-50 to-emerald-50 dark:from-green-950/50 dark:to-emerald-950/50 border-green-200 dark:border-green-800">
      <CardHeader>
        <CardTitle className="flex items-center justify-between text-lg">
          <div className="flex items-center gap-2">
            <Lightbulb className="w-5 h-5 text-green-600" />
            Fiber Tip
          </div>
          <Button
            variant="ghost"
            size="sm"
            onClick={nextTip}
            className="text-green-600 hover:text-green-700 hover:bg-green-100 dark:hover:bg-green-900/20"
          >
            <RefreshCw className="w-4 h-4" />
          </Button>
        </CardTitle>
      </CardHeader>
      <CardContent>
        <AnimatePresence mode="wait">
          <motion.div
            key={currentTip}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.3 }}
            className="space-y-3"
          >
            <div className="text-3xl text-center mb-3">
              {tip.emoji}
            </div>
            <div className="text-center">
              <p className="font-medium text-green-900 dark:text-green-100 mb-2">
                {tip.tip}
              </p>
              <p className="text-sm text-green-700 dark:text-green-300 bg-green-100 dark:bg-green-900/30 px-3 py-1 rounded-full inline-block">
                💪 {tip.fiber}
              </p>
            </div>
          </motion.div>
        </AnimatePresence>
        
        <div className="flex justify-center mt-4">
          <div className="flex gap-1">
            {fiberTips.map((_, index) => (
              <button
                key={index}
                onClick={() => setCurrentTip(index)}
                className={`w-2 h-2 rounded-full transition-colors ${
                  index === currentTip 
                    ? 'bg-green-600' 
                    : 'bg-green-200 dark:bg-green-800'
                }`}
              />
            ))}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}