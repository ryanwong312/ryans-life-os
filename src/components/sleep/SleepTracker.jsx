const db = globalThis.__B44_DB__ || { auth:{ isAuthenticated: async()=>false, me: async()=>null }, entities:new Proxy({}, { get:()=>({ filter:async()=>[], get:async()=>null, create:async()=>({}), update:async()=>({}), delete:async()=>({}) }) }), integrations:{ Core:{ UploadFile:async()=>({ file_url:'' }) } } };

import React from 'react';
import { useQuery } from '@tanstack/react-query';

import { format, subDays } from 'date-fns';
import { Moon, TrendingUp, TrendingDown } from 'lucide-react';
import { motion } from 'framer-motion';

export default function SleepTracker() {
  const { data: recentDays = [] } = useQuery({
    queryKey: ['recent-sleep'],
    queryFn: () => {
      const startDate = format(subDays(new Date(), 7), 'yyyy-MM-dd');
      return db.entities.Day.filter({ 
        date: { $gte: startDate },
        sleep_hours: { $exists: true }
      });
    },
  });

  const avgSleep = recentDays.length > 0 
    ? (recentDays.reduce((sum, d) => sum + (d.sleep_hours || 0), 0) / recentDays.length).toFixed(1)
    : 0;

  const excellentNights = recentDays.filter(d => d.sleep_quality === 'excellent').length;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="rounded-xl bg-slate-800/30 border border-slate-700/50 p-6"
    >
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold text-white flex items-center gap-2">
          <Moon className="w-5 h-5 text-purple-400" />
          Sleep Stats (7 days)
        </h3>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div className="text-center p-3 rounded-lg bg-slate-900/50">
          <div className="text-2xl font-bold text-white">{avgSleep}h</div>
          <div className="text-xs text-slate-400">Avg Sleep</div>
        </div>

        <div className="text-center p-3 rounded-lg bg-slate-900/50">
          <div className="text-2xl font-bold text-white">{excellentNights}</div>
          <div className="text-xs text-slate-400">Excellent Nights</div>
        </div>
      </div>

      <div className="mt-4 space-y-2">
        {recentDays.slice(0, 7).map((day) => (
          <div key={day.id} className="flex items-center justify-between text-sm">
            <span className="text-slate-400">{format(new Date(day.date), 'EEE, MMM d')}</span>
            <div className="flex items-center gap-2">
              <span className="text-white">{day.sleep_hours}h</span>
              <span className={`text-xs px-2 py-0.5 rounded-full ${
                day.sleep_quality === 'excellent' ? 'bg-emerald-500/20 text-emerald-400' :
                day.sleep_quality === 'good' ? 'bg-teal-500/20 text-teal-400' :
                day.sleep_quality === 'fair' ? 'bg-amber-500/20 text-amber-400' :
                'bg-rose-500/20 text-rose-400'
              }`}>
                {day.sleep_quality || 'N/A'}
              </span>
            </div>
          </div>
        ))}
      </div>
    </motion.div>
  );
}