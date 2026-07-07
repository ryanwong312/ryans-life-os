import React from 'react';
import { motion } from 'framer-motion';
import { 
  Check, 
  Flame, 
  Circle,
  Dumbbell,
  BookOpen,
  PenTool,
  Clock,
  CheckSquare,
  Smartphone,
  Ban,
  Moon,
  Heart,
  Zap,
  Coffee,
  Droplets,
  Sun,
  Brain,
  Music,
  Headphones
} from 'lucide-react';

const iconMap = {
  Dumbbell,
  BookOpen,
  PenTool,
  Clock,
  CheckSquare,
  Smartphone,
  Ban,
  Moon,
  Heart,
  Zap,
  Coffee,
  Droplets,
  Sun,
  Brain,
  Music,
  Headphones,
  Circle
};

export default function HabitCard({ habit, isCompleted, onToggle, streak = 0, className = '' }) {
  const IconComponent = iconMap[habit.icon] || Circle;
  
  // Use hex color directly if provided, otherwise fallback to color name
  const habitColor = habit.color && habit.color.startsWith('#') ? habit.color : null;
  
  const colorClasses = {
    teal: 'from-teal-500 to-teal-600',
    indigo: 'from-indigo-500 to-indigo-600',
    purple: 'from-purple-500 to-purple-600',
    orange: 'from-orange-500 to-orange-600',
    pink: 'from-pink-500 to-pink-600',
    emerald: 'from-emerald-500 to-emerald-600',
    amber: 'from-amber-500 to-amber-600',
    rose: 'from-rose-500 to-rose-600',
  };

  const bgColor = habitColor ? '' : (colorClasses[habit.color] || colorClasses.teal);

  return (
    <motion.div
      whileHover={{ scale: 1.02 }}
      whileTap={{ scale: 0.98 }}
      onClick={onToggle}
      className={`relative cursor-pointer rounded-xl border transition-all duration-300 ${
        isCompleted
          ? 'bg-gradient-to-br from-slate-800 to-slate-900 border-emerald-500/30'
          : 'bg-slate-800/50 border-slate-700/50 hover:border-slate-600'
      } p-4 ${className}`}
    >
      <div className="flex items-center gap-4">
        <div 
          className={`p-3 rounded-xl ${habitColor ? '' : `bg-gradient-to-br ${bgColor}`} ${isCompleted ? 'opacity-100' : 'opacity-40'}`}
          style={habitColor ? { backgroundColor: habitColor } : undefined}
        >
          <IconComponent className="w-5 h-5 text-white" />
        </div>
        
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2">
            <h3 className={`font-medium truncate ${isCompleted ? 'text-white' : 'text-slate-300'}`}>
              {habit.name}
            </h3>
            {habit.type === 'limit' && (
              <span className="px-2 py-0.5 text-xs rounded-full bg-rose-500/20 text-rose-400">
                Limit
              </span>
            )}
          </div>
          {habit.description && (
            <p className="text-sm text-slate-500 truncate mt-0.5">{habit.description}</p>
          )}
        </div>

        {streak > 0 && (
          <div 
            className="flex items-center gap-1"
            style={habitColor ? { color: habitColor } : undefined}
          >
            <Flame className={`w-4 h-4 ${!habitColor ? 'text-orange-400' : ''}`} />
            <span className="text-sm font-bold">{streak}</span>
          </div>
        )}

        <div className={`w-10 h-10 rounded-full flex items-center justify-center transition-all ${
          isCompleted
            ? 'bg-emerald-500 text-white'
            : 'bg-slate-700/50 text-slate-500'
        }`}>
          {isCompleted ? <Check className="w-5 h-5" /> : <div className="w-3 h-3 rounded-full border-2 border-current" />}
        </div>
      </div>
    </motion.div>
  );
}