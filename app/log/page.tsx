'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import { useRouter } from 'next/navigation';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Slider } from '@/components/ui/slider';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { ArrowLeft, Clock, Wheat, Smile, Meh, Frown } from 'lucide-react';
import { usePoopStore } from '@/lib/store';
import { useAuthStore } from '@/lib/auth-store';
import { calculatePoopScore } from '@/lib/utils';
import { ConfettiCelebration } from '@/components/confetti-celebration';
import { SoundPlayer } from '@/components/sound-player';
import { toast } from 'sonner';
import { format } from 'date-fns';

const moodEmojis = [
  { value: 'happy', emoji: '😊', icon: Smile, color: 'text-green-600' },
  { value: 'neutral', emoji: '😐', icon: Meh, color: 'text-yellow-600' },
  { value: 'sad', emoji: '😞', icon: Frown, color: 'text-red-600' },
] as const;

type MoodType = 'happy' | 'neutral' | 'sad';

export default function LogPage() {
  const router = useRouter();
  const { addEntry } = usePoopStore();
  const { user } = useAuthStore();
  const [didPoop, setDidPoop] = useState<boolean | null>(null);
  const [duration, setDuration] = useState([5]);
  const [fiber, setFiber] = useState([15]);
  const [mood, setMood] = useState<MoodType>('neutral');
  const [notes, setNotes] = useState('');
  const [showCelebration, setShowCelebration] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async () => {
    if (didPoop === null) {
      toast.error('Please select whether you pooped today');
      return;
    }

    setIsSubmitting(true);

    const entry = {
      id: crypto.randomUUID(),
      date: format(new Date(), 'yyyy-MM-dd'),
      didPoop,
      duration: duration[0] * 60, // Convert to seconds
      fiber: fiber[0],
      mood,
      notes,
      score: calculatePoopScore({
        didPoop,
        duration: duration[0] * 60,
        fiber: fiber[0],
        mood,
      }),
      createdAt: new Date().toISOString(),
    };

    try {
      // Add entry with cloud sync if user is authenticated
      await addEntry(entry, user?.id);

      if (didPoop) {
        setShowCelebration(true);
        toast.success(`Congrats! You scored ${entry.score} points! 🎉`);
      } else {
        toast.info('No worries! Tomorrow is a new day for better gut health 💪');
      }

      setTimeout(() => {
        router.push('/score');
      }, didPoop ? 3000 : 1000);
    } catch (error) {
      console.error('Error saving entry:', error);
      toast.error('Failed to save entry. Please try again.');
      setIsSubmitting(false);
    }
  };

  return (
    <div className="max-w-2xl mx-auto">
      {showCelebration && <ConfettiCelebration />}
      <SoundPlayer 
        trigger={didPoop === true} 
        soundType="success" 
      />
      <SoundPlayer 
        trigger={didPoop === false} 
        soundType="sad" 
      />

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <div className="flex items-center gap-4 mb-6">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => router.back()}
            className="flex items-center gap-2"
          >
            <ArrowLeft className="w-4 h-4" />
            Back
          </Button>
          <h1 className="text-3xl font-bold">Log Your Poop 💩</h1>
          {user && (
            <Badge variant="secondary" className="ml-auto">
              Cloud Sync Enabled
            </Badge>
          )}
        </div>

        <Card className="bg-white/80 backdrop-blur-sm">
          <CardHeader>
            <CardTitle className="text-center text-2xl">
              How was your movement today?
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-8">
            {/* Did You Poop Question */}
            <div className="text-center space-y-4">
              <Label className="text-lg font-medium">Did you poop today?</Label>
              <div className="flex justify-center gap-4">
                <Button
                  size="lg"
                  variant={didPoop === true ? "default" : "outline"}
                  onClick={() => setDidPoop(true)}
                  className="px-8 py-4 text-lg"
                >
                  Yes! 🎉
                </Button>
                <Button
                  size="lg"
                  variant={didPoop === false ? "default" : "outline"}
                  onClick={() => setDidPoop(false)}
                  className="px-8 py-4 text-lg"
                >
                  No 😔
                </Button>
              </div>
            </div>

            {didPoop !== null && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                transition={{ duration: 0.3 }}
                className="space-y-6"
              >
                <Separator />

                {didPoop && (
                  <>
                    {/* Duration Slider */}
                    <div className="space-y-4">
                      <div className="flex items-center gap-2">
                        <Clock className="w-5 h-5 text-blue-600" />
                        <Label className="text-base font-medium">
                          How long did it take?
                        </Label>
                        <Badge variant="secondary">
                          {duration[0]} minutes
                        </Badge>
                      </div>
                      <Slider
                        value={duration}
                        onValueChange={setDuration}
                        max={20}
                        min={1}
                        step={1}
                        className="w-full"
                      />
                      <div className="flex justify-between text-sm text-muted-foreground">
                        <span>1 min</span>
                        <span>20 min</span>
                      </div>
                    </div>

                    {/* Fiber Intake Slider */}
                    <div className="space-y-4">
                      <div className="flex items-center gap-2">
                        <Wheat className="w-5 h-5 text-green-600" />
                        <Label className="text-base font-medium">
                          Fiber intake today
                        </Label>
                        <Badge variant="secondary">
                          {fiber[0]}g
                        </Badge>
                      </div>
                      <Slider
                        value={fiber}
                        onValueChange={setFiber}
                        max={50}
                        min={0}
                        step={1}
                        className="w-full"
                      />
                      <div className="flex justify-between text-sm text-muted-foreground">
                        <span>0g (Low)</span>
                        <span>25g (Good)</span>
                        <span>50g (Excellent)</span>
                      </div>
                    </div>
                  </>
                )}

                {/* Mood Selection */}
                <div className="space-y-4">
                  <Label className="text-base font-medium">How are you feeling?</Label>
                  <div className="flex justify-center gap-4">
                    {moodEmojis.map(({ value, emoji, icon: Icon, color }) => (
                      <Button
                        key={value}
                        variant={mood === value ? "default" : "outline"}
                        size="lg"
                        onClick={() => setMood(value)}
                        className="flex flex-col gap-2 h-20 w-20 p-2"
                      >
                        <span className="text-2xl">{emoji}</span>
                        <Icon className={`w-4 h-4 ${color}`} />
                      </Button>
                    ))}
                  </div>
                </div>

                {/* Notes */}
                <div className="space-y-2">
                  <Label htmlFor="notes" className="text-base font-medium">
                    Notes (optional)
                  </Label>
                  <Textarea
                    id="notes"
                    placeholder="Any thoughts about your experience today?"
                    value={notes}
                    onChange={(e) => setNotes(e.target.value)}
                    className="min-h-[100px]"
                  />
                </div>

                {/* Submit Button */}
                <Button
                  onClick={handleSubmit}
                  disabled={isSubmitting}
                  size="lg"
                  className="w-full text-lg py-6"
                >
                  {isSubmitting ? (
                    'Saving...'
                  ) : didPoop ? (
                    '🎯 Calculate My Poop Score!'
                  ) : (
                    '📝 Log My Day'
                  )}
                </Button>

                {user && (
                  <div className="text-center text-sm text-muted-foreground">
                    Your data will be automatically synced to the cloud ☁️
                  </div>
                )}
              </motion.div>
            )}
          </CardContent>
        </Card>
      </motion.div>
    </div>
  );
}