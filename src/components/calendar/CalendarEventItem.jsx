import React from 'react';
import { motion } from 'framer-motion';
import { Clock, MapPin, Check, AlertCircle, HelpCircle, X } from 'lucide-react';
import { format } from 'date-fns';

const categoryColors = {
  academic: 'bg-indigo-500/20 border-indigo-500/40 text-indigo-300',
  fitness: 'bg-emerald-500/20 border-emerald-500/40 text-emerald-300',
  social: 'bg-purple-500/20 border-purple-500/40 text-purple-300',
  personal: 'bg-teal-500/20 border-teal-500/40 text-teal-300',
  work: 'bg-amber-500/20 border-amber-500/40 text-amber-300',
};

const statusIcons = {
  confirmed: { icon: Check, color: 'text-emerald-400' },
  tentative: { icon: HelpCircle, color: 'text-amber-400' },
  cancelled: { icon: X, color: 'text-rose-400' },
  pending: { icon: AlertCircle, color: 'text-slate-400' },
};

export default function CalendarEventItem({ event, onClick, compact = false }) {
  const StatusIcon = statusIcons[event.status]?.icon || Check;
  const statusColor = statusIcons[event.status]?.color || 'text-emerald-400';
  const colors = categoryColors[event.category] || categoryColors.personal;

  if (compact) {
    return (
      <motion.div
        whileHover={{ x: 2 }}
        onClick={onClick}
        className={`cursor-pointer rounded-lg px-3 py-2 border-l-4 ${colors}`}
      >
        <div className="flex items-center gap-2">
          {event.start_time && (
            <span className="text-xs opacity-70">{event.start_time}</span>
          )}
          <span className="text-sm font-medium truncate">{event.title}</span>
        </div>
      </motion.div>
    );
  }

  return (
    <motion.div
      whileHover={{ scale: 1.01 }}
      onClick={onClick}
      className={`cursor-pointer rounded-xl ${colors} border p-4`}
    >
      <div className="flex items-start justify-between gap-3">
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-1">
            <h3 className="font-semibold text-white truncate">{event.title}</h3>
            <StatusIcon className={`w-4 h-4 flex-shrink-0 ${statusColor}`} />
          </div>
          
          <div className="flex flex-wrap gap-3 text-sm opacity-80">
            {event.start_time && (
              <div className="flex items-center gap-1">
                <Clock className="w-3.5 h-3.5" />
                <span>
                  {event.start_time}
                  {event.end_time && ` - ${event.end_time}`}
                </span>
              </div>
            )}
            {event.all_day && (
              <span className="text-xs px-2 py-0.5 rounded-full bg-white/10">All Day</span>
            )}
            {event.location && (
              <div className="flex items-center gap-1">
                <MapPin className="w-3.5 h-3.5" />
                <span className="truncate">{event.location}</span>
              </div>
            )}
          </div>

          {event.description && (
            <p className="text-sm opacity-60 mt-2 line-clamp-2">{event.description}</p>
          )}

          {event.tags && event.tags.length > 0 && (
            <div className="flex flex-wrap gap-1 mt-2">
              {event.tags.map((tag, i) => (
                <span key={i} className="text-xs px-2 py-0.5 rounded-full bg-white/10">
                  {tag}
                </span>
              ))}
            </div>
          )}
        </div>
      </div>
    </motion.div>
  );
}