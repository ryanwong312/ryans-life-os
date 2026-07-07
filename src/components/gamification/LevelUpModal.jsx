import React, { useEffect } from 'react';
import { motion } from 'framer-motion';
import { Trophy, Sparkles, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import confetti from 'canvas-confetti';

export default function LevelUpModal({ level, onClose }) {
  useEffect(() => {
    // Trigger confetti
    confetti({
      particleCount: 100,
      spread: 70,
      origin: { y: 0.6 }
    });
    
    // More confetti after delay
    setTimeout(() => {
      confetti({
        particleCount: 50,
        angle: 60,
        spread: 55,
        origin: { x: 0 }
      });
    }, 250);
    
    setTimeout(() => {
      confetti({
        particleCount: 50,
        angle: 120,
        spread: 55,
        origin: { x: 1 }
      });
    }, 400);
  }, []);

  const levelRewards = {
    5: 'Dark Mode Unlocked',
    10: 'Advanced Analytics',
    15: 'AI Study Assistant',
    20: 'Running Analytics Pro',
    25: 'Whiteboard Pro Tools',
    30: 'Journal Insights AI',
  };

  const reward = levelRewards[level];

  return (
    <div className="fixed inset-0 z-[10000] flex items-center justify-center bg-black/60 backdrop-blur-sm">
      <motion.div
        initial={{ opacity: 0, scale: 0.5, y: 100 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        className="relative max-w-md w-full mx-4"
      >
        <div className="rounded-2xl bg-gradient-to-br from-purple-900 via-pink-900 to-purple-900 p-1">
          <div className="bg-slate-900 rounded-xl p-8 text-center">
            <motion.div
              initial={{ scale: 0, rotate: -180 }}
              animate={{ scale: 1, rotate: 0 }}
              transition={{ delay: 0.2, type: 'spring' }}
              className="mb-6"
            >
              <Trophy className="w-20 h-20 mx-auto text-amber-400" />
            </motion.div>

            <motion.h2
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
              className="text-4xl font-bold text-white mb-2"
            >
              Level {level}!
            </motion.h2>

            <motion.p
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.4 }}
              className="text-lg text-purple-300 mb-6"
            >
              You've leveled up!
            </motion.p>

            {reward && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.5 }}
                className="mb-6 p-4 rounded-xl bg-gradient-to-r from-amber-500/20 to-orange-500/20 border border-amber-500/30"
              >
                <div className="flex items-center justify-center gap-2 text-amber-300">
                  <Sparkles className="w-5 h-5" />
                  <span className="font-semibold">New Feature Unlocked:</span>
                </div>
                <div className="text-white font-bold mt-1">{reward}</div>
              </motion.div>
            )}

            <Button
              onClick={onClose}
              className="bg-gradient-to-r from-purple-500 to-pink-500 text-white px-8"
            >
              Awesome! 🎉
            </Button>
          </div>
        </div>
      </motion.div>
    </div>
  );
}