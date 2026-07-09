import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { format, subDays, startOfWeek, eachDayOfInterval, parseISO } from 'date-fns';
import { BarChart, Bar, LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell, Legend } from 'recharts';
import { Clock, Calendar, TrendingUp, Tag, Award } from 'lucide-react';

const tagColors = ['#6366f1', '#10b981', '#f59e0b', '#ec4899', '#06b6d4', '#8b5cf6', '#ef4444', '#14b8a6'];

export default function StudyAnalytics({ studySessions, subjects }) {
  const [range, setRange] = useState(7); // days

  const rangeStart = subDays(new Date(), range);
  const sessionsInRange = studySessions.filter(s => {
    const d = typeof s.date === 'string' ? parseISO(s.date) : new Date(s.date);
    return d >= rangeStart;
  });

  const totalMinutes = sessionsInRange.reduce((sum, s) => sum + (s.duration_minutes || 0), 0);
  const totalHours = Math.floor(totalMinutes / 60);
  const totalMins = totalMinutes % 60;

  // Study time by subject
  const bySubject = subjects.map(sub => {
    const mins = sessionsInRange
      .filter(s => s.subject_id === sub.id)
      .reduce((sum, s) => sum + (s.duration_minutes || 0), 0);
    return { name: sub.name, minutes: mins, hours: Math.round(mins / 60 * 10) / 10 };
  }).filter(s => s.minutes > 0).sort((a, b) => b.minutes - a.minutes);

  // Study time by day
  const days = eachDayOfInterval({ start: rangeStart, end: new Date() });
  const byDay = days.map(day => {
    const dateStr = format(day, 'yyyy-MM-dd');
    const mins = sessionsInRange
      .filter(s => s.date === dateStr)
      .reduce((sum, s) => sum + (s.duration_minutes || 0), 0);
    return { date: format(day, 'MMM d'), minutes: mins };
  });

  // Study time by tag
  const tagMap = {};
  sessionsInRange.forEach(s => {
    (s.tags || []).forEach(tag => {
      tagMap[tag] = (tagMap[tag] || 0) + (s.duration_minutes || 0);
    });
  });
  const byTag = Object.entries(tagMap)
    .map(([tag, minutes]) => ({ tag, minutes }))
    .sort((a, b) => b.minutes - a.minutes)
    .slice(0, 8);

  // Average productivity
  const ratedSessions = sessionsInRange.filter(s => s.productivity_rating);
  const avgProductivity = ratedSessions.length > 0
    ? (ratedSessions.reduce((sum, s) => sum + s.productivity_rating, 0) / ratedSessions.length).toFixed(1)
    : '—';

  // Session count
  const sessionCount = sessionsInRange.length;

  // Best day
  const bestDay = byDay.reduce((best, day) => (day.minutes > (best?.minutes || 0) ? day : best), null);

  const getSubjectName = (id) => subjects.find(s => s.id === id)?.name || 'Unknown';

  return (
    <div className="space-y-6">
      {/* Range selector */}
      <div className="flex gap-2">
        {[7, 14, 30, 90].map(d => (
          <button
            key={d}
            onClick={() => setRange(d)}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition ${
              range === d
                ? 'bg-indigo-500 text-white'
                : 'bg-slate-800/50 text-slate-400 hover:text-white hover:bg-slate-700/50'
            }`}
          >
            {d} days
          </button>
        ))}
      </div>

      {/* Summary stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="rounded-xl bg-slate-800/30 border border-slate-700/50 p-5">
          <Clock className="w-5 h-5 text-indigo-400 mb-2" />
          <p className="text-2xl font-bold text-white">{totalHours}h {totalMins}m</p>
          <p className="text-xs text-slate-400">Total Study Time</p>
        </motion.div>
        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.05 }} className="rounded-xl bg-slate-800/30 border border-slate-700/50 p-5">
          <Calendar className="w-5 h-5 text-emerald-400 mb-2" />
          <p className="text-2xl font-bold text-white">{sessionCount}</p>
          <p className="text-xs text-slate-400">Sessions Logged</p>
        </motion.div>
        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }} className="rounded-xl bg-slate-800/30 border border-slate-700/50 p-5">
          <TrendingUp className="w-5 h-5 text-teal-400 mb-2" />
          <p className="text-2xl font-bold text-white">{avgProductivity}</p>
          <p className="text-xs text-slate-400">Avg Productivity (1-5)</p>
        </motion.div>
        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.15 }} className="rounded-xl bg-slate-800/30 border border-slate-700/50 p-5">
          <Award className="w-5 h-5 text-amber-400 mb-2" />
          <p className="text-2xl font-bold text-white">{bestDay ? bestDay.date : '—'}</p>
          <p className="text-xs text-slate-400">Most Productive Day</p>
        </motion.div>
      </div>

      {/* Daily study time chart */}
      <div className="rounded-xl bg-slate-800/30 border border-slate-700/50 p-6">
        <h3 className="text-lg font-semibold text-white mb-4">Daily Study Time</h3>
        <ResponsiveContainer width="100%" height={250}>
          <LineChart data={byDay}>
            <CartesianGrid strokeDasharray="3 3" stroke="#334155" />
            <XAxis dataKey="date" stroke="#94a3b8" fontSize={12} />
            <YAxis stroke="#94a3b8" fontSize={12} unit="m" />
            <Tooltip
              contentStyle={{ backgroundColor: '#1e293b', border: '1px solid #334155', borderRadius: '8px' }}
              labelStyle={{ color: '#e2e8f0' }}
            />
            <Line type="monotone" dataKey="minutes" stroke="#6366f1" strokeWidth={2} dot={{ fill: '#6366f1', r: 3 }} />
          </LineChart>
        </ResponsiveContainer>
      </div>

      <div className="grid md:grid-cols-2 gap-6">
        {/* By subject */}
        <div className="rounded-xl bg-slate-800/30 border border-slate-700/50 p-6">
          <h3 className="text-lg font-semibold text-white mb-4">Study Time by Subject</h3>
          {bySubject.length > 0 ? (
            <ResponsiveContainer width="100%" height={250}>
              <BarChart data={bySubject} layout="vertical">
                <CartesianGrid strokeDasharray="3 3" stroke="#334155" />
                <XAxis type="number" stroke="#94a3b8" fontSize={12} unit="m" />
                <YAxis type="category" dataKey="name" stroke="#94a3b8" fontSize={12} width={80} />
                <Tooltip
                  contentStyle={{ backgroundColor: '#1e293b', border: '1px solid #334155', borderRadius: '8px' }}
                  labelStyle={{ color: '#e2e8f0' }}
                />
                <Bar dataKey="minutes" fill="#6366f1" radius={[0, 4, 4, 0]} />
              </BarChart>
            </ResponsiveContainer>
          ) : (
            <p className="text-slate-500 text-center py-12">No data for this range</p>
          )}
        </div>

        {/* By tag */}
        <div className="rounded-xl bg-slate-800/30 border border-slate-700/50 p-6">
          <h3 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
            <Tag className="w-5 h-5 text-purple-400" /> Study Time by Tag
          </h3>
          {byTag.length > 0 ? (
            <ResponsiveContainer width="100%" height={250}>
              <PieChart>
                <Pie data={byTag} dataKey="minutes" nameKey="tag" cx="50%" cy="50%" outerRadius={80} label={({ tag }) => tag}>
                  {byTag.map((_, i) => (
                    <Cell key={i} fill={tagColors[i % tagColors.length]} />
                  ))}
                </Pie>
                <Tooltip
                  contentStyle={{ backgroundColor: '#1e293b', border: '1px solid #334155', borderRadius: '8px' }}
                  labelStyle={{ color: '#e2e8f0' }}
                />
                <Legend wrapperStyle={{ fontSize: '12px', color: '#94a3b8' }} />
              </PieChart>
            </ResponsiveContainer>
          ) : (
            <p className="text-slate-500 text-center py-12">No tagged sessions yet</p>
          )}
        </div>
      </div>

      {/* Recent sessions list */}
      <div className="rounded-xl bg-slate-800/30 border border-slate-700/50 p-6">
        <h3 className="text-lg font-semibold text-white mb-4">Recent Sessions</h3>
        <div className="space-y-2">
          {sessionsInRange.slice(0, 10).map(session => (
            <div key={session.id} className="flex items-center justify-between p-3 rounded-lg bg-slate-800/50">
              <div>
                <p className="text-sm font-medium text-white">
                  {session.name || session.topic || getSubjectName(session.subject_id)}
                </p>
                <p className="text-xs text-slate-400">
                  {getSubjectName(session.subject_id)} · {format(parseISO(session.date), 'MMM d')}
                  {session.start_time ? ` · ${session.start_time}` : ''}
                </p>
                {session.tags && session.tags.length > 0 && (
                  <div className="flex gap-1 mt-1">
                    {session.tags.map(tag => (
                      <span key={tag} className="px-1.5 py-0.5 text-xs rounded-full bg-purple-500/20 text-purple-300">#{tag}</span>
                    ))}
                  </div>
                )}
              </div>
              <div className="text-right">
                <p className="text-sm font-medium text-white">{session.duration_minutes}m</p>
                {session.productivity_rating && (
                  <p className="text-xs text-amber-400">{'⭐'.repeat(session.productivity_rating)}</p>
                )}
              </div>
            </div>
          ))}
          {sessionsInRange.length === 0 && (
            <p className="text-slate-500 text-center py-8">No sessions in this range</p>
          )}
        </div>
      </div>
    </div>
  );
}