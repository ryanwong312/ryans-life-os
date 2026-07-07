const db = globalThis.__B44_DB__ || { auth:{ isAuthenticated: async()=>false, me: async()=>null }, entities:new Proxy({}, { get:()=>({ filter:async()=>[], get:async()=>null, create:async()=>({}), update:async()=>({}), delete:async()=>({}) }) }), integrations:{ Core:{ UploadFile:async()=>({ file_url:'' }) } } };

import React from 'react';
import { motion } from 'framer-motion';
import { useQuery } from '@tanstack/react-query';

import { format, startOfWeek, endOfWeek } from 'date-fns';
import { TrendingUp, Activity, BookOpen, CheckCircle2 } from 'lucide-react';

export default function WeeklyStats() {
  const weekStart = format(startOfWeek(new Date()), 'yyyy-MM-dd');
  const weekEnd = format(endOfWeek(new Date()), 'yyyy-MM-dd');

  const { data: habits = [] } = useQuery({
    queryKey: ['habits'],
    queryFn: () => db.entities.Habit.filter({ active: true }),
  });

  const { data: habitLogs = [] } = useQuery({
    queryKey: ['habit-logs-week', weekStart],
    queryFn: () => db.entities.HabitLog.filter({ 
      date: { $gte: weekStart, $lte: weekEnd }
    }),
  });

  const { data: workouts = [] } = useQuery({
    queryKey: ['workouts-week-stats'],
    queryFn: () => db.entities.Workout.filter({ 
      date: { $gte: weekStart, $lte: weekEnd }
    }),
  });

  const { data: studySessions = [] } = useQuery({
    queryKey: ['study-sessions-week-stats'],
    queryFn: () => db.entities.StudySession.filter({ 
      date: { $gte: weekStart, $lte: weekEnd }
    }),
  });

  // Calculate habit completion rate
  const daysWithLogs = [...new Set(habitLogs.map(log => log.date))].length;
  const expectedCompletions = daysWithLogs * habits.length;
  const actualCompletions = habitLogs.filter(log => log.completed).length;
  const habitCompletionRate = expectedCompletions > 0 
    ? Math.round((actualCompletions / expectedCompletions) * 100) 
    : 0;

  // Calculate workout stats
  const completedWorkouts = workouts.filter(w => w.completed).length;
  const totalPlannedWorkouts = workouts.length;

  // Calculate study hours
  const totalStudyMinutes = studySessions.reduce((sum, s) => sum + (s.duration_minutes || 0), 0);
  const studyHours = Math.round(totalStudyMinutes / 60);

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.3 }}
      className="rounded-xl bg-slate-800/30 border border-slate-700/50 p-6"
    >
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold text-white flex items-center gap-2">
          <TrendingUp className="w-5 h-5 text-indigo-400" />
          Week at a Glance
        </h3>
      </div>
      
      <div className="space-y-4">
        <div>
          <div className="flex items-center justify-between text-sm mb-1">
            <span className="text-slate-400 flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4" />
              Habit Consistency
            </span>
            <span className="text-white font-medium">{habitCompletionRate}%</span>
          </div>
          <div className="h-2 rounded-full bg-slate-700/50">
            <motion.div 
              initial={{ width: 0 }}
              animate={{ width: `${habitCompletionRate}%` }}
              transition={{ duration: 0.5, delay: 0.3 }}
              className="h-full rounded-full bg-gradient-to-r from-emerald-500 to-teal-500"
            />
          </div>
        </div>
        
        <div>
          <div className="flex items-center justify-between text-sm mb-1">
            <span className="text-slate-400 flex items-center gap-2">
              <Activity className="w-4 h-4" />
              Workout Sessions
            </span>
            <span className="text-white font-medium">
              {completedWorkouts} {totalPlannedWorkouts > 0 && `/ ${totalPlannedWorkouts}`} sessions
            </span>
          </div>
          <div className="h-2 rounded-full bg-slate-700/50">
            <motion.div 
              initial={{ width: 0 }}
              animate={{ width: totalPlannedWorkouts > 0 ? `${(completedWorkouts / totalPlannedWorkouts) * 100}%` : `${Math.min(completedWorkouts * 25, 100)}%` }}
              transition={{ duration: 0.5, delay: 0.4 }}
              className="h-full rounded-full bg-gradient-to-r from-teal-500 to-cyan-500"
            />
          </div>
        </div>
        
        <div>
          <div className="flex items-center justify-between text-sm mb-1">
            <span className="text-slate-400 flex items-center gap-2">
              <BookOpen className="w-4 h-4" />
              Study Time
            </span>
            <span className="text-white font-medium">{studyHours}h total</span>
          </div>
          <div className="h-2 rounded-full bg-slate-700/50">
            <motion.div 
              initial={{ width: 0 }}
              animate={{ width: `${Math.min((studyHours / 20) * 100, 100)}%` }}
              transition={{ duration: 0.5, delay: 0.5 }}
              className="h-full rounded-full bg-gradient-to-r from-indigo-500 to-purple-500"
            />
          </div>
        </div>
      </div>
    </motion.div>
  );
}