'use client';

import { motion } from 'framer-motion';
import { PremiumUpgrade } from '@/components/premium/premium-upgrade';

export default function PremiumPage() {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
    >
      <PremiumUpgrade />
    </motion.div>
  );
}