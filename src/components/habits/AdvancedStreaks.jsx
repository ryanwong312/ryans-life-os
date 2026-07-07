import React from 'react';
import { motion } from 'framer-motion';
import { Flame, Trophy, TrendingUp, Award, Zap } from 'lucide-react';
import { format, subDays, differenceInDays } from 'date-fns';

export default function AdvancedStreaks({ habit, logs = [] }) {
  const sortedLogs = [...logs]
    .filter(log => log.habit_id === habit.id && log.completed)
    .sort((a, b) => new Date(b.date) - new Date(a.date));

  // Calculate current streak
  let currentStreak = 0;
  const today = format(new Date(), 'yyyy-MM-dd');
  let checkDate = new Date();
  
  for (let i = 0; i < 365; i++) {
    const dateStr = format(checkDate, 'yyyy-MM-dd');
    const hasLog = sortedLogs.some(log => log.date === dateStr);
    
    if (hasLog) {
      currentStreak++;
      checkDate = subDays(checkDate, 1);
    } else if (dateStr === today) {
      checkDate = subDays(checkDate, 1);
    } else {
      break;
    }
  }

  // Calculate longest streak
  let longestStreak = 0;
  let tempStreak = 0;
  const allDates = sortedLogs.map(log => new Date(log.date)).sort((a, b) => a - b);
  
  for (let i = 0; i < allDates.length; i++) {
    if (i === 0) {
      tempStreak = 1;
    } else {
      const daysDiff = differenceInDays(allDates[i], allDates[i - 1]);
      if (daysDiff === 1) {
        tempStreak++;
      } else {
        longestStreak = Math.max(longestStreak, tempStreak);
        tempStreak = 1;
      }
    }
  }
  longestStreak = Math.max(longestStreak, tempStreak);

  // Calculate total completions and completion rate
  const totalCompletions = sortedLogs.length;
  const daysTracking = sortedLogs.length > 0 ? differenceInDays(new Date(), new Date(sortedLogs[sortedLogs.length - 1].date)) + 1 : 0;
  const completionRate = daysTracking > 0 ? Math.round((totalCompletions / daysTracking) * 100) : 0;

  // Streak milestones
  const milestones = [
    { days: 7, label: 'Week Warrior', icon: Flame, color: 'text-orange-400' },
    { days: 30, label: 'Month Master', icon: Trophy, color: 'text-yellow-400' },
    { days: 100, label: 'Century Club', icon: Award, color: 'text-purple-400' },
    { days: 365, label: 'Year Legend', icon: Zap, color: 'text-teal-400' },
  ];

  const nextMilestone = milestones.find(m => m.days > currentStreak) || milestones[milestones.length - 1];
  const achievedMilestones = milestones.filter(m => longestStreak >= m.days);

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          className="rounded-xl bg-gradient-to-br from-orange-500/20 to-rose-500/20 border border-orange-500/30 p-4"
        >
          <div className="flex items-center gap-2 mb-2">
            <Flame className="w-5 h-5 text-orange-400" />
            <span className="text-xs text-slate-400">Current Streak</span>
          </div>
          <p className="text-2xl font-bold text-white">{currentStreak} days</p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.1 }}
          className="rounded-xl bg-gradient-to-br from-yellow-500/20 to-amber-500/20 border border-yellow-500/30 p-4"
        >
          <div className="flex items-center gap-2 mb-2">
            <Trophy className="w-5 h-5 text-yellow-400" />
            <span className="text-xs text-slate-400">Longest Streak</span>
          </div>
          <p className="text-2xl font-bold text-white">{longestStreak} days</p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.2 }}
          className="rounded-xl bg-gradient-to-br from-emerald-500/20 to-teal-500/20 border border-emerald-500/30 p-4"
        >
          <div className="flex items-center gap-2 mb-2">
            <TrendingUp className="w-5 h-5 text-emerald-400" />
            <span className="text-xs text-slate-400">Success Rate</span>
          </div>
          <p className="text-2xl font-bold text-white">{completionRate}%</p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.3 }}
          className="rounded-xl bg-gradient-to-br from-purple-500/20 to-indigo-500/20 border border-purple-500/30 p-4"
        >
          <div className="flex items-center gap-2 mb-2">
            <Award className="w-5 h-5 text-purple-400" />
            <span className="text-xs text-slate-400">Total</span>
          </div>
          <p className="text-2xl font-bold text-white">{totalCompletions}</p>
        </motion.div>
      </div>

      {currentStreak < nextMilestone.days && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="rounded-xl bg-slate-800/30 border border-slate-700/50 p-4"
        >
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center gap-2">
              <nextMilestone.icon className={`w-5 h-5 ${nextMilestone.color}`} />
              <span className="text-white font-medium">{nextMilestone.label}</span>
            </div>
            <span className="text-sm text-slate-400">{currentStreak}/{nextMilestone.days} days</span>
          </div>
          <div className="h-2 rounded-full bg-slate-700/50">
            <motion.div
              initial={{ width: 0 }}
              animate={{ width: `${(currentStreak / nextMilestone.days) * 100}%` }}
              transition={{ duration: 0.5 }}
              className={`h-full rounded-full ${nextMilestone.color.replace('text-', 'bg-')}`}
            />
          </div>
        </motion.div>
      )}

      {achievedMilestones.length > 0 && (
        <div className="rounded-xl bg-slate-800/30 border border-slate-700/50 p-4">
          <h4 className="text-sm font-medium text-slate-400 mb-3">Achievements Unlocked</h4>
          <div className="flex flex-wrap gap-2">
            {achievedMilestones.map((milestone, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, scale: 0 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: i * 0.1 }}
                className={`flex items-center gap-2 px-3 py-1.5 rounded-lg bg-gradient-to-r ${milestone.color.replace('text-', 'from-')}/20 to-transparent border ${milestone.color.replace('text-', 'border-')}/30`}
              >
                <milestone.icon className={`w-4 h-4 ${milestone.color}`} />
                <span className="text-sm text-white">{milestone.label}</span>
              </motion.div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}