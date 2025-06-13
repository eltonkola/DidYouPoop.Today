import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';
import { PoopEntry } from './store';

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function calculatePoopScore({
  didPoop,
  duration,
  fiber,
  mood,
}: {
  didPoop: boolean;
  duration: number; // in seconds
  fiber: number; // in grams
  mood: string;
}): number {
  if (!didPoop) return 0;

  // Time score: optimal time is 2-5 minutes, max penalty at 20+ minutes
  const timeScore = Math.max(1 - Math.max(0, duration - 120) / 1080, 0.1);
  
  // Fiber score: optimal at 25g+, scales up to 40g
  const fiberScore = Math.min(fiber / 40, 1);
  
  // Mood score
  const moodScore = mood === 'happy' ? 1 : mood === 'neutral' ? 0.6 : 0.3;

  const finalScore = (timeScore * 0.4 + fiberScore * 0.4 + moodScore * 0.2) * 100;
  return Math.round(Math.max(finalScore, 1));
}

export function getScoreBadge(score: number) {
  if (score >= 90) return { title: 'Poop Champion', color: '#10B981' };
  if (score >= 80) return { title: 'Gut Genius', color: '#3B82F6' };
  if (score >= 70) return { title: 'Fiber Fanatic', color: '#8B5CF6' };
  if (score >= 60) return { title: 'Decent Dooer', color: '#F59E0B' };
  if (score >= 50) return { title: 'Average Achiever', color: '#EF4444' };
  if (score >= 30) return { title: 'Struggling Squatter', color: '#6B7280' };
  return { title: 'Constipated Crusader', color: '#374151' };
}

export function getScoreMessage(score: number, didPoop: boolean): string {
  if (!didPoop) {
    return "No worries! Tomorrow is a new day. Try adding more fiber to your diet and stay hydrated! 💪";
  }

  if (score >= 90) return "Outstanding! You're a true Poop Champion! Your gut health is on point! 🏆";
  if (score >= 80) return "Excellent work! You're managing your gut health like a pro! Keep it up! 🌟";
  if (score >= 70) return "Great job! Your digestive system is working well. You're on the right track! 👍";
  if (score >= 60) return "Good effort! There's room for improvement, but you're doing well! 😊";
  if (score >= 50) return "Not bad! Consider increasing your fiber intake and staying more hydrated. 💧";
  if (score >= 30) return "There's room for improvement! Try eating more fruits, vegetables, and whole grains. 🥗";
  return "Let's work on this together! Focus on fiber, water, and regular exercise. You've got this! 💪";
}

export function getTodaysEntry(entries: PoopEntry[], date: string): PoopEntry | null {
  return entries.find(entry => entry.date === date) || null;
}

export function formatDuration(seconds: number): string {
  const minutes = Math.floor(seconds / 60);
  const remainingSeconds = seconds % 60;
  
  if (minutes === 0) {
    return `${remainingSeconds}s`;
  }
  
  if (remainingSeconds === 0) {
    return `${minutes}m`;
  }
  
  return `${minutes}m ${remainingSeconds}s`;
}

export function getMoodEmoji(mood: string): string {
  switch (mood) {
    case 'happy': return '😊';
    case 'neutral': return '😐';
    case 'sad': return '😞';
    default: return '😐';
  }
}

export function getFiberRecommendation(fiber: number): string {
  if (fiber >= 35) return "Excellent fiber intake! Your gut bacteria are thriving! 🌟";
  if (fiber >= 25) return "Great fiber intake! You're on the right track! 👍";
  if (fiber >= 15) return "Good start! Try to add a bit more fiber to your diet. 💪";
  if (fiber >= 10) return "You could use more fiber! Add some fruits and vegetables. 🥗";
  return "Low fiber intake! Focus on whole grains, fruits, and vegetables. 🌾";
}