'use client';

import { useEffect } from 'react';

interface SoundPlayerProps {
  trigger: boolean;
  soundType: 'success' | 'sad' | 'achievement';
}

export function SoundPlayer({ trigger, soundType }: SoundPlayerProps) {
  useEffect(() => {
    if (!trigger) return;

    // Create audio context for sound effects
    const playSound = (frequency: number, duration: number, type: 'sine' | 'square' | 'sawtooth' = 'sine') => {
      if (typeof window === 'undefined') return;
      
      try {
        const AudioContextClass = window.AudioContext || (window as any).webkitAudioContext;
        const audioContext = new AudioContextClass();
        const oscillator = audioContext.createOscillator();
        const gainNode = audioContext.createGain();
        
        oscillator.connect(gainNode);
        gainNode.connect(audioContext.destination);
        
        oscillator.type = type;
        oscillator.frequency.setValueAtTime(frequency, audioContext.currentTime);
        
        gainNode.gain.setValueAtTime(0, audioContext.currentTime);
        gainNode.gain.linearRampToValueAtTime(0.1, audioContext.currentTime + 0.01);
        gainNode.gain.exponentialRampToValueAtTime(0.001, audioContext.currentTime + duration);
        
        oscillator.start(audioContext.currentTime);
        oscillator.stop(audioContext.currentTime + duration);
      } catch (error) {
        // Silently fail if audio context is not supported
        console.log('Audio not supported');
      }
    };

    const playSuccessSound = () => {
      // Happy celebratory sound sequence
      setTimeout(() => playSound(523, 0.2), 0);    // C5
      setTimeout(() => playSound(659, 0.2), 100);  // E5
      setTimeout(() => playSound(784, 0.3), 200);  // G5
      setTimeout(() => playSound(1047, 0.4), 300); // C6
    };

    const playSadSound = () => {
      // Sad trombone effect
      setTimeout(() => playSound(392, 0.3, 'sawtooth'), 0);   // G4
      setTimeout(() => playSound(349, 0.3, 'sawtooth'), 200); // F4
      setTimeout(() => playSound(311, 0.3, 'sawtooth'), 400); // Eb4
      setTimeout(() => playSound(277, 0.5, 'sawtooth'), 600); // Db4
    };

    const playAchievementSound = () => {
      // Achievement unlock sound
      setTimeout(() => playSound(659, 0.15), 0);   // E5
      setTimeout(() => playSound(784, 0.15), 75);  // G5
      setTimeout(() => playSound(1047, 0.15), 150); // C6
      setTimeout(() => playSound(1319, 0.3), 225); // E6
    };

    switch (soundType) {
      case 'success':
        playSuccessSound();
        break;
      case 'sad':
        playSadSound();
        break;
      case 'achievement':
        playAchievementSound();
        break;
    }
  }, [trigger, soundType]);

  return null;
}