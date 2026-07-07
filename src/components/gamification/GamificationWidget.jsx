import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Trophy, Flame, Target, Zap, Star, TrendingUp } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Link } from 'react-router-dom';
import { createPageUrl } from '@/utils';
import { useGamification } from './useGamification';

export default function GamificationWidget() {
  const { gamificationUser } = useGamification();

  if (!gamificationUser) return null;

  const level = gamificationUser.level || 1;
  const xp = gamificationUser.experience_points || 0;
  const nextLevelXp = Math.pow(level, 2) * 100;
  const currentLevelXp = xp - (Math.pow(level - 1, 2) * 100);
  const xpForNextLevel = nextLevelXp - (Math.pow(level - 1, 2) * 100);
  const progressPercent = (currentLevelXp / xpForNextLevel) * 100;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="rounded-xl bg-gradient-to-br from-purple-500/10 to-pink-500/10 border border-purple-500/20 p-6"
    >
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold text-white flex items-center gap-2">
          <Trophy className="w-5 h-5 text-purple-400" />
          Progress
        </h3>
        <span className="text-amber-400 font-bold flex items-center gap-1">
          {gamificationUser.focus_coins || 0} <span className="text-xl">🟡</span>
        </span>
      </div>

      <div className="mb-4">
        <div className="flex justify-between text-sm mb-2">
          <span className="text-slate-400">Level {level}</span>
          <span className="text-slate-400">
            {currentLevelXp.toLocaleString()} / {xpForNextLevel.toLocaleString()} XP
          </span>
        </div>
        <div className="relative h-2 bg-slate-800 rounded-full overflow-hidden">
          <motion.div
            className="absolute top-0 left-0 h-full bg-gradient-to-r from-purple-500 to-pink-500"
            initial={{ width: 0 }}
            animate={{ width: `${progressPercent}%` }}
            transition={{ duration: 0.5, ease: 'easeOut' }}
          />
        </div>
      </div>

      <div className="grid grid-cols-2 gap-3 mb-4">
        <div className="text-center p-3 rounded-lg bg-slate-800/50">
          <Flame className="w-5 h-5 text-orange-400 mx-auto mb-1" />
          <div className="text-xl font-bold text-white">{gamificationUser.current_streak || 0}</div>
          <div className="text-xs text-slate-400">Day Streak</div>
        </div>
        
        <div className="text-center p-3 rounded-lg bg-slate-800/50">
          <Target className="w-5 h-5 text-teal-400 mx-auto mb-1" />
          <div className="text-xl font-bold text-white">
            0/3
          </div>
          <div className="text-xs text-slate-400">Challenges</div>
        </div>
        
        <div className="text-center p-3 rounded-lg bg-slate-800/50">
          <Star className="w-5 h-5 text-purple-400 mx-auto mb-1" />
          <div className="text-xl font-bold text-white">+0</div>
          <div className="text-xs text-slate-400">Today's XP</div>
        </div>
        
        <div className="text-center p-3 rounded-lg bg-slate-800/50">
          <Zap className="w-5 h-5 text-amber-400 mx-auto mb-1" />
          <div className="text-xl font-bold text-white">+0</div>
          <div className="text-xs text-slate-400">Today's FC</div>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-2">
        <Link to={createPageUrl('Achievements')}>
          <Button 
            variant="outline" 
            className="w-full border-purple-500/30 text-purple-300 hover:bg-purple-500/10"
            size="sm"
          >
            <Trophy className="w-4 h-4 mr-2" />
            Achievements
          </Button>
        </Link>
        <Link to={createPageUrl('Shop')}>
          <Button 
            variant="outline" 
            className="w-full border-amber-500/30 text-amber-300 hover:bg-amber-500/10"
            size="sm"
          >
            🛍️ Shop
          </Button>
        </Link>
      </div>
    </motion.div>
  );
}