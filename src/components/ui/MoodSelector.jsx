import React from 'react';
import { motion } from 'framer-motion';

const moods = [
  { value: 'amazing', emoji: '🤩', label: 'Amazing', color: 'bg-emerald-500' },
  { value: 'good', emoji: '😊', label: 'Good', color: 'bg-teal-500' },
  { value: 'okay', emoji: '😐', label: 'Okay', color: 'bg-amber-500' },
  { value: 'low', emoji: '😔', label: 'Low', color: 'bg-orange-500' },
  { value: 'rough', emoji: '😫', label: 'Rough', color: 'bg-rose-500' },
];

export default function MoodSelector({ value, onChange, size = 'md' }) {
  const sizeClasses = {
    sm: 'text-xl p-2',
    md: 'text-2xl p-3',
    lg: 'text-3xl p-4',
  };

  return (
    <div className="flex items-center gap-2">
      {moods.map((mood) => (
        <motion.button
          key={mood.value}
          whileHover={{ scale: 1.1 }}
          whileTap={{ scale: 0.95 }}
          onClick={() => onChange(mood.value)}
          className={`${sizeClasses[size]} rounded-xl transition-all duration-200 ${
            value === mood.value
              ? `${mood.color} shadow-lg shadow-${mood.color}/30 ring-2 ring-white/20`
              : 'bg-slate-800/50 hover:bg-slate-700/50'
          }`}
          title={mood.label}
        >
          {mood.emoji}
        </motion.button>
      ))}
    </div>
  );
}

export function getMoodEmoji(value) {
  return moods.find(m => m.value === value)?.emoji || '😐';
}

export function getMoodLabel(value) {
  return moods.find(m => m.value === value)?.label || 'Okay';
}