import React from 'react';
import { motion } from 'framer-motion';
import { Target, CheckCircle2, Circle } from 'lucide-react';

const challenges = [
  { id: 1, name: 'Triple Threat', desc: 'Complete 3 different habit categories', icon: '🎯', progress: 2, target: 3, xp: 75, fc: 15 },
  { id: 2, name: 'Morning Master', desc: 'Complete morning routine before 8 AM', icon: '🌅', progress: 0, target: 1, xp: 100, fc: 20 },
  { id: 3, name: 'Study Sprint', desc: 'Complete 2 focused study sessions', icon: '⚡', progress: 0, target: 2, xp: 125, fc: 25 },
];

export default function DailyChallenges() {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="rounded-xl bg-slate-800/30 border border-slate-700/50 p-6"
    >
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold text-white flex items-center gap-2">
          <Target className="w-5 h-5 text-teal-400" />
          Daily Challenges
        </h3>
      </div>

      <div className="space-y-3">
        {challenges.map((challenge) => {
          const isCompleted = challenge.progress >= challenge.target;
          const progressPercent = (challenge.progress / challenge.target) * 100;

          return (
            <div key={challenge.id} className="p-4 rounded-lg bg-slate-900/50 border border-slate-700">
              <div className="flex items-start justify-between mb-2">
                <div className="flex items-start gap-3">
                  <span className="text-2xl">{challenge.icon}</span>
                  <div>
                    <h4 className="font-semibold text-white">{challenge.name}</h4>
                    <p className="text-sm text-slate-400">{challenge.desc}</p>
                  </div>
                </div>
                {isCompleted ? (
                  <CheckCircle2 className="w-6 h-6 text-emerald-400" />
                ) : (
                  <Circle className="w-6 h-6 text-slate-600" />
                )}
              </div>

              <div className="flex items-center justify-between text-sm">
                <div className="flex-1 mr-4">
                  <div className="h-2 bg-slate-800 rounded-full overflow-hidden">
                    <div 
                      className="h-full bg-gradient-to-r from-teal-500 to-emerald-500 transition-all"
                      style={{ width: `${progressPercent}%` }}
                    />
                  </div>
                  <div className="text-xs text-slate-500 mt-1">
                    {challenge.progress}/{challenge.target}
                  </div>
                </div>
                <div className="text-right">
                  <div className="text-purple-300">+{challenge.xp} XP</div>
                  <div className="text-amber-300 text-xs">+{challenge.fc} FC</div>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </motion.div>
  );
}