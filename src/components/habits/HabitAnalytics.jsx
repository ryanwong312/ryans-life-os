import React from 'react';
import { motion } from 'framer-motion';
import { format, subDays } from 'date-fns';
import { TrendingUp, Zap, Target, AlertCircle } from 'lucide-react';

export default function HabitAnalytics({ habits, habitLogs, dayEntries = [] }) {
  // Calculate correlations and insights
  const getLast30DaysData = () => {
    const data = [];
    for (let i = 29; i >= 0; i--) {
      const date = format(subDays(new Date(), i), 'yyyy-MM-dd');
      const dayLogs = habitLogs.filter(log => log.date === date);
      const dayEntry = dayEntries.find(entry => entry.date === date);
      
      data.push({
        date,
        completed: dayLogs.filter(l => l.completed).length,
        total: habits.length,
        mood: dayEntry?.mood,
        sleepHours: dayEntry?.sleep_hours,
        energyLevel: dayEntry?.energy_level
      });
    }
    return data;
  };

  const data = getLast30DaysData();
  
  // Calculate completion rate
  const avgCompletionRate = data.length > 0
    ? Math.round((data.reduce((sum, d) => sum + (d.total > 0 ? d.completed / d.total : 0), 0) / data.length) * 100)
    : 0;

  // Find patterns
  const findMoodCorrelation = () => {
    const moodMapping = { amazing: 5, good: 4, okay: 3, low: 2, rough: 1 };
    const withMood = data.filter(d => d.mood && d.total > 0);
    
    if (withMood.length < 5) return null;
    
    const avgCompletionByMood = {};
    withMood.forEach(d => {
      if (!avgCompletionByMood[d.mood]) avgCompletionByMood[d.mood] = [];
      avgCompletionByMood[d.mood].push(d.completed / d.total);
    });
    
    const bestMood = Object.entries(avgCompletionByMood)
      .map(([mood, rates]) => ({
        mood,
        avg: rates.reduce((a, b) => a + b, 0) / rates.length
      }))
      .sort((a, b) => b.avg - a.avg)[0];
    
    return bestMood;
  };

  const findSleepCorrelation = () => {
    const withSleep = data.filter(d => d.sleepHours && d.total > 0);
    
    if (withSleep.length < 5) return null;
    
    const goodSleep = withSleep.filter(d => d.sleepHours >= 7);
    const poorSleep = withSleep.filter(d => d.sleepHours < 7);
    
    if (goodSleep.length === 0 || poorSleep.length === 0) return null;
    
    const goodSleepRate = goodSleep.reduce((sum, d) => sum + d.completed / d.total, 0) / goodSleep.length;
    const poorSleepRate = poorSleep.reduce((sum, d) => sum + d.completed / d.total, 0) / poorSleep.length;
    
    const improvement = Math.round((goodSleepRate - poorSleepRate) * 100);
    
    return improvement > 10 ? improvement : null;
  };

  const findWeakestDay = () => {
    const dayStats = {};
    data.forEach(d => {
      const dayName = format(new Date(d.date), 'EEEE');
      if (!dayStats[dayName]) dayStats[dayName] = [];
      if (d.total > 0) dayStats[dayName].push(d.completed / d.total);
    });
    
    const dayAverages = Object.entries(dayStats)
      .map(([day, rates]) => ({
        day,
        avg: rates.reduce((a, b) => a + b, 0) / rates.length
      }))
      .sort((a, b) => a.avg - b.avg);
    
    return dayAverages[0];
  };

  const getStreak = () => {
    let currentStreak = 0;
    for (let i = 0; i < data.length; i++) {
      const d = data[data.length - 1 - i];
      if (d.total > 0 && d.completed === d.total) {
        currentStreak++;
      } else if (i > 0) {
        break;
      }
    }
    return currentStreak;
  };

  const moodCorr = findMoodCorrelation();
  const sleepCorr = findSleepCorrelation();
  const weakDay = findWeakestDay();
  const currentStreak = getStreak();

  const insights = [];
  
  if (sleepCorr) {
    insights.push({
      icon: Zap,
      color: 'from-emerald-500 to-teal-500',
      title: 'Sleep Impact',
      message: `You're ${sleepCorr}% more likely to complete all habits when you sleep 7+ hours.`
    });
  }
  
  if (moodCorr) {
    insights.push({
      icon: TrendingUp,
      color: 'from-indigo-500 to-purple-500',
      title: 'Mood Booster',
      message: `Your habit completion peaks when you're feeling ${moodCorr.mood}.`
    });
  }
  
  if (weakDay) {
    insights.push({
      icon: AlertCircle,
      color: 'from-amber-500 to-orange-500',
      title: 'Weak Spot',
      message: `${weakDay.day}s are your toughest day. Plan easier habits or extra motivation.`
    });
  }
  
  if (currentStreak > 3) {
    insights.push({
      icon: Target,
      color: 'from-rose-500 to-pink-500',
      title: 'Streak Power',
      message: `${currentStreak} days of perfect completion! Don't break the chain.`
    });
  }

  return (
    <div className="space-y-4">
      {/* Overview Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          className="rounded-xl bg-gradient-to-br from-emerald-500/20 to-teal-500/10 border border-emerald-500/20 p-4"
        >
          <p className="text-xs text-emerald-400 mb-1">30-Day Average</p>
          <p className="text-2xl font-bold text-white">{avgCompletionRate}%</p>
        </motion.div>
        
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.1 }}
          className="rounded-xl bg-gradient-to-br from-teal-500/20 to-cyan-500/10 border border-teal-500/20 p-4"
        >
          <p className="text-xs text-teal-400 mb-1">Current Streak</p>
          <p className="text-2xl font-bold text-white">{currentStreak} days</p>
        </motion.div>
        
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.2 }}
          className="rounded-xl bg-gradient-to-br from-indigo-500/20 to-purple-500/10 border border-indigo-500/20 p-4"
        >
          <p className="text-xs text-indigo-400 mb-1">Active Habits</p>
          <p className="text-2xl font-bold text-white">{habits.length}</p>
        </motion.div>
        
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.3 }}
          className="rounded-xl bg-gradient-to-br from-purple-500/20 to-pink-500/10 border border-purple-500/20 p-4"
        >
          <p className="text-xs text-purple-400 mb-1">Total Completions</p>
          <p className="text-2xl font-bold text-white">{(habitLogs || []).filter(l => l.completed).length}</p>
        </motion.div>
      </div>

      {/* AI Insights */}
      {insights.length > 0 && (
        <div>
          <h3 className="text-lg font-semibold text-white mb-3 flex items-center gap-2">
            <Zap className="w-5 h-5 text-purple-400" />
            Smart Insights
          </h3>
          <div className="grid md:grid-cols-2 gap-4">
            {insights.map((insight, i) => {
              const Icon = insight.icon;
              return (
                <motion.div
                  key={i}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: i * 0.1 }}
                  className={`rounded-xl bg-gradient-to-br ${insight.color}/20 border border-${insight.color.split(' ')[1]}/30 p-4`}
                >
                  <div className="flex items-start gap-3">
                    <div className={`p-2 rounded-lg bg-gradient-to-br ${insight.color}/30`}>
                      <Icon className="w-4 h-4 text-white" />
                    </div>
                    <div className="flex-1">
                      <h4 className="font-semibold text-white text-sm mb-1">{insight.title}</h4>
                      <p className="text-xs text-slate-300">{insight.message}</p>
                    </div>
                  </div>
                </motion.div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}