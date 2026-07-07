import React from 'react';
import { motion } from 'framer-motion';
import { format, differenceInDays } from 'date-fns';
import { Flag, MapPin, Clock, Target, Trophy, Calendar } from 'lucide-react';

const priorityColors = {
  A: 'from-teal-500/30 to-teal-600/20 border-teal-500/40',
  B: 'from-indigo-500/30 to-indigo-600/20 border-indigo-500/40',
  C: 'from-slate-500/30 to-slate-600/20 border-slate-500/40',
};

export default function RaceCard({ race, onClick }) {
  const daysUntil = differenceInDays(new Date(race.date), new Date());
  const isPast = daysUntil < 0;
  const isToday = daysUntil === 0;

  return (
    <motion.div
      whileHover={{ scale: 1.02 }}
      onClick={onClick}
      className={`cursor-pointer rounded-xl bg-gradient-to-br ${priorityColors[race.priority] || priorityColors.C} border p-5`}
    >
      <div className="flex items-start justify-between mb-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className={`px-2 py-0.5 text-xs font-bold rounded ${
              race.priority === 'A' ? 'bg-teal-500 text-white' :
              race.priority === 'B' ? 'bg-indigo-500 text-white' :
              'bg-slate-500 text-white'
            }`}>
              {race.priority} Race
            </span>
            {race.completed && (
              <Trophy className="w-4 h-4 text-amber-400" />
            )}
          </div>
          <h3 className="text-xl font-bold text-white">{race.name}</h3>
        </div>
        {!isPast && !isToday && (
          <div className="text-right">
            <p className="text-2xl font-bold text-teal-400">{daysUntil}</p>
            <p className="text-xs text-slate-400">days to go</p>
          </div>
        )}
        {isToday && (
          <div className="px-3 py-1 rounded-full bg-emerald-500 text-white text-sm font-bold">
            TODAY!
          </div>
        )}
      </div>

      <div className="space-y-2 text-sm">
        <div className="flex items-center gap-2 text-slate-300">
          <Calendar className="w-4 h-4 text-slate-400" />
          <span>{format(new Date(race.date), 'EEEE, MMMM d, yyyy')}</span>
        </div>
        
        <div className="flex items-center gap-2 text-slate-300">
          <Flag className="w-4 h-4 text-slate-400" />
          <span>{race.distance_km} km</span>
        </div>
        
        {race.location && (
          <div className="flex items-center gap-2 text-slate-300">
            <MapPin className="w-4 h-4 text-slate-400" />
            <span>{race.location}</span>
          </div>
        )}
        
        {race.target_time && (
          <div className="flex items-center gap-2 text-slate-300">
            <Target className="w-4 h-4 text-slate-400" />
            <span>Target: {race.target_time}</span>
          </div>
        )}
        
        {race.result_time && (
          <div className="flex items-center gap-2 text-emerald-400 font-medium">
            <Clock className="w-4 h-4" />
            <span>Result: {race.result_time}</span>
            {race.result_place && <span className="text-amber-400">({race.result_place})</span>}
          </div>
        )}
      </div>
    </motion.div>
  );
}