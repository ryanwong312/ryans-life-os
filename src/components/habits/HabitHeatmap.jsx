import React from 'react';
import { motion } from 'framer-motion';
import { format, startOfMonth, endOfMonth, eachDayOfInterval, isSameDay, subMonths } from 'date-fns';

export default function HabitHeatmap({ habitLogs, habits, month = new Date() }) {
  const monthStart = startOfMonth(month);
  const monthEnd = endOfMonth(month);
  const days = eachDayOfInterval({ start: monthStart, end: monthEnd });
  
  const weekDays = ['S', 'M', 'T', 'W', 'T', 'F', 'S'];
  const startDayOfWeek = monthStart.getDay();

  const getCompletionRate = (date) => {
    const dateStr = format(date, 'yyyy-MM-dd');
    const dayLogs = habitLogs.filter(log => log.date === dateStr);
    if (dayLogs.length === 0) return 0;
    const completed = dayLogs.filter(log => log.completed).length;
    return completed / habits.length;
  };

  const getColor = (rate) => {
    if (rate === 0) return 'bg-slate-800/50';
    if (rate < 0.25) return 'bg-emerald-900/50';
    if (rate < 0.5) return 'bg-emerald-700/50';
    if (rate < 0.75) return 'bg-emerald-600/60';
    if (rate < 1) return 'bg-emerald-500/70';
    return 'bg-emerald-400';
  };

  return (
    <div className="p-4 rounded-xl bg-slate-800/30 border border-slate-700/50">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold text-white">
          {format(month, 'MMMM yyyy')}
        </h3>
        <div className="flex items-center gap-1 text-xs text-slate-400">
          <span>Less</span>
          <div className="flex gap-0.5">
            <div className="w-3 h-3 rounded-sm bg-slate-800/50" />
            <div className="w-3 h-3 rounded-sm bg-emerald-900/50" />
            <div className="w-3 h-3 rounded-sm bg-emerald-700/50" />
            <div className="w-3 h-3 rounded-sm bg-emerald-500/70" />
            <div className="w-3 h-3 rounded-sm bg-emerald-400" />
          </div>
          <span>More</span>
        </div>
      </div>

      <div className="grid grid-cols-7 gap-1 mb-2">
        {weekDays.map((day, i) => (
          <div key={i} className="text-center text-xs text-slate-500 font-medium py-1">
            {day}
          </div>
        ))}
      </div>

      <div className="grid grid-cols-7 gap-1">
        {Array(startDayOfWeek).fill(null).map((_, i) => (
          <div key={`empty-${i}`} className="aspect-square" />
        ))}
        {days.map((day, i) => {
          const rate = getCompletionRate(day);
          const isToday = isSameDay(day, new Date());
          const isFuture = day > new Date();
          
          return (
            <motion.div
              key={i}
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ delay: i * 0.01 }}
              className={`aspect-square rounded-md ${
                isFuture ? 'bg-slate-800/20' : getColor(rate)
              } ${isToday ? 'ring-2 ring-teal-400' : ''} flex items-center justify-center`}
              title={`${format(day, 'MMM d')}: ${Math.round(rate * 100)}%`}
            >
              <span className={`text-xs ${rate > 0.5 ? 'text-white' : 'text-slate-500'}`}>
                {format(day, 'd')}
              </span>
            </motion.div>
          );
        })}
      </div>
    </div>
  );
}