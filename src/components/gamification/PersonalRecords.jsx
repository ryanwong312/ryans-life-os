const db = globalThis.__B44_DB__ || { auth:{ isAuthenticated: async()=>false, me: async()=>null }, entities:new Proxy({}, { get:()=>({ filter:async()=>[], get:async()=>null, create:async()=>({}), update:async()=>({}), delete:async()=>({}) }) }), integrations:{ Core:{ UploadFile:async()=>({ file_url:'' }) } } };

import React from 'react';
import { useQuery } from '@tanstack/react-query';

import { motion } from 'framer-motion';
import { Trophy, TrendingUp, Award, Zap } from 'lucide-react';

export default function PersonalRecords() {
  const { data: workouts = [] } = useQuery({
    queryKey: ['all-workouts'],
    queryFn: () => db.entities.Workout.list('-date', 500),
  });

  const { data: studySessions = [] } = useQuery({
    queryKey: ['all-study-sessions'],
    queryFn: () => db.entities.StudySession.list('-date', 500),
  });

  const { data: habitLogs = [] } = useQuery({
    queryKey: ['all-habit-logs'],
    queryFn: () => db.entities.HabitLog.list('-date', 500),
  });

  const records = {
    running: {
      longestRun: Math.max(...workouts.map(w => w.actual_distance_km || 0), 0),
      fastestPace: Math.min(...workouts.filter(w => w.pace_min_km).map(w => w.pace_min_km), Infinity),
      totalDistance: workouts.reduce((sum, w) => sum + (w.actual_distance_km || 0), 0),
    },
    study: {
      longestSession: Math.max(...studySessions.map(s => s.duration_minutes || 0), 0),
      totalHours: Math.floor(studySessions.reduce((sum, s) => sum + (s.duration_minutes || 0), 0) / 60),
    },
    habits: {
      currentStreak: 0, // Calculate from logs
      longestStreak: 0,
      totalCompleted: habitLogs.filter(l => l.completed).length,
    },
  };

  return (
    <div className="rounded-xl bg-slate-800/30 border border-slate-700/50 p-6">
      <h3 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
        <Trophy className="w-5 h-5 text-amber-400" />
        Personal Records
      </h3>

      <div className="space-y-4">
        <div className="grid grid-cols-2 gap-4">
          <div className="p-3 rounded-lg bg-slate-900/50">
            <div className="flex items-center gap-2 mb-1">
              <Zap className="w-4 h-4 text-teal-400" />
              <span className="text-xs text-slate-400">Longest Run</span>
            </div>
            <div className="text-xl font-bold text-white">{records.running.longestRun.toFixed(1)} km</div>
          </div>

          <div className="p-3 rounded-lg bg-slate-900/50">
            <div className="flex items-center gap-2 mb-1">
              <TrendingUp className="w-4 h-4 text-indigo-400" />
              <span className="text-xs text-slate-400">Total Study</span>
            </div>
            <div className="text-xl font-bold text-white">{records.study.totalHours}h</div>
          </div>

          <div className="p-3 rounded-lg bg-slate-900/50">
            <div className="flex items-center gap-2 mb-1">
              <Award className="w-4 h-4 text-purple-400" />
              <span className="text-xs text-slate-400">Best Pace</span>
            </div>
            <div className="text-xl font-bold text-white">
              {records.running.fastestPace !== Infinity ? `${records.running.fastestPace.toFixed(2)}/km` : '--'}
            </div>
          </div>

          <div className="p-3 rounded-lg bg-slate-900/50">
            <div className="flex items-center gap-2 mb-1">
              <Trophy className="w-4 h-4 text-emerald-400" />
              <span className="text-xs text-slate-400">Habits Done</span>
            </div>
            <div className="text-xl font-bold text-white">{records.habits.totalCompleted}</div>
          </div>
        </div>
      </div>
    </div>
  );
}