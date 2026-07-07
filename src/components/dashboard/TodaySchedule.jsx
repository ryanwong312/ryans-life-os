const db = globalThis.__B44_DB__ || { auth:{ isAuthenticated: async()=>false, me: async()=>null }, entities:new Proxy({}, { get:()=>({ filter:async()=>[], get:async()=>null, create:async()=>({}), update:async()=>({}), delete:async()=>({}) }) }), integrations:{ Core:{ UploadFile:async()=>({ file_url:'' }) } } };

import React from 'react';
import { useQuery } from '@tanstack/react-query';

import { motion } from 'framer-motion';
import { format, parseISO, isBefore, isAfter } from 'date-fns';
import { Clock, Calendar, MapPin, Plus, ChevronRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Link } from 'react-router-dom';
import { createPageUrl } from '@/utils';

const categoryColors = {
  academic: 'border-indigo-500/50 bg-indigo-500/10 text-indigo-400',
  fitness: 'border-teal-500/50 bg-teal-500/10 text-teal-400',
  social: 'border-pink-500/50 bg-pink-500/10 text-pink-400',
  personal: 'border-purple-500/50 bg-purple-500/10 text-purple-400',
  work: 'border-amber-500/50 bg-amber-500/10 text-amber-400',
};

export default function TodaySchedule() {
  const todayStr = format(new Date(), 'yyyy-MM-dd');

  const { data: events = [] } = useQuery({
    queryKey: ['today-events', todayStr],
    queryFn: () => db.entities.CalendarEvent.filter({ 
      date: todayStr,
      status: { $ne: 'cancelled' }
    }, 'start_time'),
  });

  const getEventStatus = (event) => {
    if (!event.start_time || !event.end_time) return 'upcoming';
    
    const now = new Date();
    const [startHour, startMin] = event.start_time.split(':').map(Number);
    const [endHour, endMin] = event.end_time.split(':').map(Number);
    
    const startTime = new Date();
    startTime.setHours(startHour, startMin, 0);
    const endTime = new Date();
    endTime.setHours(endHour, endMin, 0);

    if (isBefore(now, startTime)) return 'upcoming';
    if (isAfter(now, endTime)) return 'completed';
    return 'in-progress';
  };

  const statusIcons = {
    upcoming: '🔵',
    'in-progress': '🟢',
    completed: '⚫',
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.3 }}
      className="rounded-xl bg-slate-800/30 border border-slate-700/50 p-6"
    >
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold text-white flex items-center gap-2">
          <Calendar className="w-5 h-5 text-teal-400" />
          Today's Schedule
        </h3>
        <Link to={createPageUrl('Calendar')}>
          <Button variant="ghost" size="sm" className="text-slate-400 hover:text-white">
            <Plus className="w-4 h-4 mr-1" />
            Add Event
          </Button>
        </Link>
      </div>

      {events.length > 0 ? (
        <div className="space-y-2 max-h-80 overflow-y-auto">
          {events.slice(0, 6).map((event) => {
            const status = getEventStatus(event);
            return (
              <Link key={event.id} to={createPageUrl('Calendar')}>
                <motion.div
                  whileHover={{ scale: 1.02 }}
                  className={`p-3 rounded-lg border ${categoryColors[event.category] || categoryColors.personal} cursor-pointer transition-all`}
                >
                  <div className="flex items-start justify-between">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1">
                        <span className="text-xs">{statusIcons[status]}</span>
                        <p className="font-medium text-white truncate">{event.title}</p>
                      </div>
                      <div className="flex items-center gap-3 text-xs text-slate-400">
                        {event.start_time && (
                          <span className="flex items-center gap-1">
                            <Clock className="w-3 h-3" />
                            {event.start_time}
                          </span>
                        )}
                        {event.location && (
                          <span className="flex items-center gap-1 truncate">
                            <MapPin className="w-3 h-3" />
                            {event.location}
                          </span>
                        )}
                      </div>
                    </div>
                    <ChevronRight className="w-4 h-4 text-slate-500 flex-shrink-0 ml-2" />
                  </div>
                </motion.div>
              </Link>
            );
          })}
          {events.length > 6 && (
            <p className="text-xs text-slate-500 text-center pt-2">
              +{events.length - 6} more events
            </p>
          )}
        </div>
      ) : (
        <div className="text-center py-8 text-slate-500">
          <Calendar className="w-12 h-12 mx-auto mb-3 opacity-30" />
          <p className="text-sm">No events scheduled for today</p>
          <Link to={createPageUrl('Calendar')}>
            <Button variant="ghost" size="sm" className="mt-2 text-teal-400">
              Add your first event
            </Button>
          </Link>
        </div>
      )}
    </motion.div>
  );
}