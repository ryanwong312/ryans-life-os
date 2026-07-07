import React from 'react';
import { motion } from 'framer-motion';
import { format } from 'date-fns';
import { 
  Play, 
  Check, 
  Clock, 
  MapPin, 
  Heart, 
  Footprints,
  Zap,
  Mountain,
  Timer,
  Flag,
  RotateCcw,
  Dumbbell
} from 'lucide-react';

const workoutTypeConfig = {
  easy: { icon: Play, color: 'emerald', label: 'Easy Run' },
  tempo: { icon: Zap, color: 'orange', label: 'Tempo' },
  intervals: { icon: Timer, color: 'rose', label: 'Intervals' },
  hills: { icon: Mountain, color: 'amber', label: 'Hills' },
  long: { icon: MapPin, color: 'indigo', label: 'Long Run' },
  race: { icon: Flag, color: 'teal', label: 'Race' },
  recovery: { icon: RotateCcw, color: 'slate', label: 'Recovery' },
  cross_training: { icon: Dumbbell, color: 'purple', label: 'Cross Training' },
  rest: { icon: Clock, color: 'slate', label: 'Rest Day' },
};

const colorClasses = {
  emerald: 'from-emerald-500/20 to-emerald-600/10 border-emerald-500/30 text-emerald-400',
  orange: 'from-orange-500/20 to-orange-600/10 border-orange-500/30 text-orange-400',
  rose: 'from-rose-500/20 to-rose-600/10 border-rose-500/30 text-rose-400',
  amber: 'from-amber-500/20 to-amber-600/10 border-amber-500/30 text-amber-400',
  indigo: 'from-indigo-500/20 to-indigo-600/10 border-indigo-500/30 text-indigo-400',
  teal: 'from-teal-500/20 to-teal-600/10 border-teal-500/30 text-teal-400',
  slate: 'from-slate-500/20 to-slate-600/10 border-slate-500/30 text-slate-400',
  purple: 'from-purple-500/20 to-purple-600/10 border-purple-500/30 text-purple-400',
};

export default function WorkoutCard({ workout, onClick, compact = false }) {
  const config = workoutTypeConfig[workout.type] || workoutTypeConfig.easy;
  const IconComponent = config.icon;
  const colors = colorClasses[config.color];

  if (compact) {
    return (
      <motion.div
        whileHover={{ scale: 1.02 }}
        onClick={onClick}
        className={`cursor-pointer rounded-lg bg-gradient-to-br ${colors} border p-3`}
      >
        <div className="flex items-center gap-2">
          <IconComponent className="w-4 h-4" />
          <span className="text-sm font-medium text-white">{config.label}</span>
          {workout.planned_distance_km && (
            <span className="text-xs opacity-70">{workout.planned_distance_km} km</span>
          )}
          {workout.completed && (
            <Check className="w-4 h-4 text-emerald-400 ml-auto" />
          )}
        </div>
      </motion.div>
    );
  }

  return (
    <motion.div
      whileHover={{ scale: 1.01 }}
      onClick={onClick}
      className={`cursor-pointer rounded-xl bg-gradient-to-br ${colors} border p-5`}
    >
      <div className="flex items-start justify-between mb-3">
        <div className="flex items-center gap-3">
          <div className={`p-2 rounded-lg bg-gradient-to-br ${colors}`}>
            <IconComponent className="w-5 h-5" />
          </div>
          <div>
            <h3 className="font-semibold text-white">{config.label}</h3>
            <p className="text-sm opacity-70">{format(new Date(workout.date), 'EEEE, MMM d')}</p>
          </div>
        </div>
        {workout.completed && (
          <div className="p-2 rounded-full bg-emerald-500/20">
            <Check className="w-4 h-4 text-emerald-400" />
          </div>
        )}
      </div>

      {workout.description && (
        <p className="text-sm text-slate-300 mb-3">{workout.description}</p>
      )}

      <div className="flex flex-wrap gap-4 text-sm">
        {(workout.actual_distance_km || workout.planned_distance_km) && (
          <div className="flex items-center gap-1.5">
            <Footprints className="w-4 h-4 opacity-70" />
            <span className="text-white font-medium">
              {workout.actual_distance_km || workout.planned_distance_km} km
            </span>
          </div>
        )}
        {(workout.actual_duration || workout.planned_duration) && (
          <div className="flex items-center gap-1.5">
            <Clock className="w-4 h-4 opacity-70" />
            <span className="text-white font-medium">
              {workout.actual_duration || workout.planned_duration}
            </span>
          </div>
        )}
        {workout.pace_min_km && (
          <div className="flex items-center gap-1.5">
            <Timer className="w-4 h-4 opacity-70" />
            <span className="text-white font-medium">{workout.pace_min_km.toFixed(2)} min/km</span>
          </div>
        )}
        {workout.heart_rate_avg && (
          <div className="flex items-center gap-1.5">
            <Heart className="w-4 h-4 opacity-70" />
            <span className="text-white font-medium">{workout.heart_rate_avg} bpm</span>
          </div>
        )}
      </div>

      {workout.feeling && (
        <div className="mt-3 pt-3 border-t border-white/10">
          <span className={`text-xs px-2 py-1 rounded-full ${
            workout.feeling === 'great' ? 'bg-emerald-500/20 text-emerald-300' :
            workout.feeling === 'good' ? 'bg-teal-500/20 text-teal-300' :
            workout.feeling === 'okay' ? 'bg-amber-500/20 text-amber-300' :
            workout.feeling === 'tough' ? 'bg-orange-500/20 text-orange-300' :
            'bg-rose-500/20 text-rose-300'
          }`}>
            Felt {workout.feeling}
          </span>
        </div>
      )}
    </motion.div>
  );
}