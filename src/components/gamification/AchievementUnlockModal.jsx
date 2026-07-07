import React, { useEffect } from 'react';
import { motion } from 'framer-motion';
import { Award, X, Star, Zap } from 'lucide-react';
import { Button } from '@/components/ui/button';
import confetti from 'canvas-confetti';

const rarityColors = {
  common: { border: '#6b7280', bg: 'from-slate-500/20 to-slate-600/20', text: 'text-slate-300' },
  rare: { border: '#3b82f6', bg: 'from-blue-500/20 to-indigo-600/20', text: 'text-blue-400' },
  epic: { border: '#8b5cf6', bg: 'from-purple-500/20 to-pink-600/20', text: 'text-purple-400' },
  legendary: { border: '#f59e0b', bg: 'from-amber-500/20 to-orange-600/20', text: 'text-amber-400' },
};

export default function AchievementUnlockModal({ achievement, onClose }) {
  useEffect(() => {
    confetti({
      particleCount: 150,
      spread: 80,
      origin: { y: 0.6 },
      colors: [rarityColors[achievement.rarity].border]
    });
  }, [achievement]);

  const colors = rarityColors[achievement.rarity] || rarityColors.common;

  return (
    <div className="fixed inset-0 z-[10000] flex items-center justify-center bg-black/60 backdrop-blur-sm">
      <motion.div
        initial={{ opacity: 0, scale: 0.5, rotate: -10 }}
        animate={{ opacity: 1, scale: 1, rotate: 0 }}
        transition={{ type: 'spring', duration: 0.5 }}
        className="relative max-w-md w-full mx-4"
      >
        <div className="rounded-2xl p-1" style={{ background: `linear-gradient(135deg, ${colors.border}, ${colors.border}80)` }}>
          <div className="bg-slate-900 rounded-xl p-8 text-center">
            <motion.div
              initial={{ scale: 0, rotate: -180 }}
              animate={{ scale: 1, rotate: 0 }}
              transition={{ delay: 0.2, type: 'spring' }}
              className="mb-4"
            >
              <Award className="w-16 h-16 mx-auto text-amber-400" />
            </motion.div>

            <motion.h2
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
              className="text-2xl font-bold text-white mb-2"
            >
              Achievement Unlocked!
            </motion.h2>

            <motion.div
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.4 }}
              className={`rounded-xl bg-gradient-to-br ${colors.bg} border p-6 mb-4`}
              style={{ borderColor: colors.border }}
            >
              <div className="text-5xl mb-3">{achievement.icon}</div>
              <h3 className="text-xl font-bold text-white mb-2">{achievement.name}</h3>
              <p className="text-sm text-slate-400">{achievement.desc}</p>
              <div className={`mt-3 px-3 py-1 rounded-full text-xs font-bold uppercase inline-block ${colors.text}`}>
                {achievement.rarity}
              </div>
            </motion.div>

            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.5 }}
              className="flex items-center justify-center gap-4 mb-6"
            >
              <div className="flex items-center gap-2">
                <Star className="w-5 h-5 text-purple-400" />
                <span className="text-xl font-bold text-white">+{achievement.xp}</span>
                <span className="text-sm text-purple-300">XP</span>
              </div>
              <div className="flex items-center gap-2">
                <Zap className="w-5 h-5 text-amber-400" />
                <span className="text-xl font-bold text-white">+{achievement.fc}</span>
                <span className="text-sm text-amber-300">FC</span>
              </div>
            </motion.div>

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