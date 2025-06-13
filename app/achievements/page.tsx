'use client';

import { motion } from 'framer-motion';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Trophy, Award, Target, Calendar, Clock, Wheat, Zap, Star } from 'lucide-react';
import { usePoopStore } from '@/lib/store';
import { checkAchievements, allAchievements } from '@/lib/achievements';

export default function AchievementsPage() {
  const { entries, achievements } = usePoopStore();
  
  // Get achievement progress
  const achievementProgress = checkAchievements(entries);
  
  const unlockedAchievements = allAchievements.filter(achievement => 
    achievements.some(a => a.id === achievement.id)
  );
  
  const lockedAchievements = allAchievements.filter(achievement => 
    !achievements.some(a => a.id === achievement.id)
  );

  const getIconComponent = (iconName: string) => {
    const icons = {
      Trophy, Award, Target, Calendar, Clock, Wheat, Zap, Star
    };
    return icons[iconName as keyof typeof icons] || Trophy;
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold flex items-center justify-center gap-2 mb-4">
            <Trophy className="w-10 h-10 text-yellow-600" />
            Achievements
          </h1>
          <p className="text-xl text-muted-foreground">
            Track your poop milestones and unlock badges!
          </p>
          <div className="mt-4">
            <Badge variant="secondary" className="px-4 py-2 text-lg">
              {unlockedAchievements.length} / {allAchievements.length} Unlocked
            </Badge>
          </div>
        </div>

        {/* Unlocked Achievements */}
        {unlockedAchievements.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.1 }}
          >
            <h2 className="text-2xl font-bold mb-4 flex items-center gap-2">
              <Star className="w-6 h-6 text-yellow-600" />
              Unlocked Achievements
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mb-8">
              {unlockedAchievements.map((achievement, index) => {
                const IconComponent = getIconComponent(achievement.icon);
                return (
                  <motion.div
                    key={achievement.id}
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ duration: 0.3, delay: index * 0.1 }}
                  >
                    <Card className="bg-gradient-to-br from-yellow-50 to-amber-50 dark:from-yellow-950/50 dark:to-amber-950/50 border-2 border-yellow-200 dark:border-yellow-800 shadow-lg">
                      <CardHeader className="pb-3">
                        <div className="flex items-center gap-3">
                          <div className="p-2 bg-yellow-100 dark:bg-yellow-900/50 rounded-lg">
                            <IconComponent className="w-6 h-6 text-yellow-600 dark:text-yellow-400" />
                          </div>
                          <div>
                            <CardTitle className="text-lg text-yellow-900 dark:text-yellow-100">
                              {achievement.title}
                            </CardTitle>
                            <Badge variant="secondary" className="mt-1">
                              Completed
                            </Badge>
                          </div>
                        </div>
                      </CardHeader>
                      <CardContent>
                        <p className="text-sm text-yellow-700 dark:text-yellow-300 mb-3">
                          {achievement.description}
                        </p>
                        <div className="text-xs text-yellow-600 dark:text-yellow-400">
                          🎯 {achievement.requirement}
                        </div>
                      </CardContent>
                    </Card>
                  </motion.div>
                );
              })}
            </div>
          </motion.div>
        )}

        {/* Locked Achievements */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.2 }}
        >
          <h2 className="text-2xl font-bold mb-4 flex items-center gap-2">
            <Target className="w-6 h-6 text-gray-600" />
            Achievement Goals
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {lockedAchievements.map((achievement, index) => {
              const IconComponent = getIconComponent(achievement.icon);
              const progress = achievementProgress[achievement.id] || 0;
              const progressPercentage = Math.min((progress / achievement.target) * 100, 100);
              
              return (
                <motion.div
                  key={achievement.id}
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ duration: 0.3, delay: index * 0.1 }}
                >
                  <Card className="bg-gradient-to-br from-gray-50 to-slate-50 dark:from-gray-950/50 dark:to-slate-950/50 border-2 border-gray-200 dark:border-gray-800">
                    <CardHeader className="pb-3">
                      <div className="flex items-center gap-3">
                        <div className="p-2 bg-gray-100 dark:bg-gray-900/50 rounded-lg">
                          <IconComponent className="w-6 h-6 text-gray-600 dark:text-gray-400" />
                        </div>
                        <div>
                          <CardTitle className="text-lg text-gray-700 dark:text-gray-300">
                            {achievement.title}
                          </CardTitle>
                          <Badge variant="outline" className="mt-1">
                            {progress} / {achievement.target}
                          </Badge>
                        </div>
                      </div>
                    </CardHeader>
                    <CardContent>
                      <p className="text-sm text-gray-600 dark:text-gray-400 mb-3">
                        {achievement.description}
                      </p>
                      <div className="space-y-2">
                        <div className="flex justify-between text-xs">
                          <span className="text-gray-500">Progress</span>
                          <span className="text-gray-500">{Math.round(progressPercentage)}%</span>
                        </div>
                        <Progress value={progressPercentage} className="h-2" />
                        <div className="text-xs text-gray-500">
                          🎯 {achievement.requirement}
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </motion.div>
              );
            })}
          </div>
        </motion.div>
      </motion.div>
    </div>
  );
}