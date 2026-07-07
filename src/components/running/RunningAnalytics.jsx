import React from 'react';
import { motion } from 'framer-motion';
import { TrendingUp, Activity, Clock, Heart, Zap, Calendar, Target } from 'lucide-react';
import { LineChart, Line, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell, AreaChart, Area } from 'recharts';
import { format, subWeeks, startOfWeek, endOfWeek } from 'date-fns';

export default function RunningAnalytics({ workouts = [] }) {
  const completedWorkouts = workouts.filter(w => w.completed && w.actual_distance_km);
  
  const totalDistance = completedWorkouts.reduce((sum, w) => sum + (w.actual_distance_km || 0), 0);
  const totalRuns = completedWorkouts.length;
  const avgPace = completedWorkouts.reduce((sum, w) => sum + (w.pace_min_km || 0), 0) / (totalRuns || 1);
  const avgHeartRate = completedWorkouts.reduce((sum, w) => sum + (w.heart_rate_avg || 0), 0) / (totalRuns || 1);

  // Weekly distance trend (last 8 weeks)
  const weeklyDistanceData = [];
  for (let i = 7; i >= 0; i--) {
    const weekStart = startOfWeek(subWeeks(new Date(), i), { weekStartsOn: 1 });
    const weekEnd = endOfWeek(weekStart, { weekStartsOn: 1 });
    const weekWorkouts = completedWorkouts.filter(w => {
      const workoutDate = new Date(w.date);
      return workoutDate >= weekStart && workoutDate <= weekEnd;
    });
    const weekDistance = weekWorkouts.reduce((sum, w) => sum + (w.actual_distance_km || 0), 0);
    weeklyDistanceData.push({
      week: format(weekStart, 'MMM d'),
      distance: parseFloat(weekDistance.toFixed(1)),
      runs: weekWorkouts.length
    });
  }

  // Pace progression over time (last 20 runs)
  const paceProgressionData = completedWorkouts
    .filter(w => w.pace_min_km)
    .slice(-20)
    .map((w, i) => ({
      run: i + 1,
      pace: parseFloat(w.pace_min_km.toFixed(2)),
      date: format(new Date(w.date), 'MMM d')
    }));

  // Workout type breakdown
  const workoutTypeBreakdown = {};
  completedWorkouts.forEach(w => {
    workoutTypeBreakdown[w.type] = (workoutTypeBreakdown[w.type] || 0) + 1;
  });

  const workoutTypePieData = Object.entries(workoutTypeBreakdown).map(([type, count]) => ({
    name: type.replace('_', ' ').replace(/\b\w/g, l => l.toUpperCase()),
    value: count,
    percentage: ((count / totalRuns) * 100).toFixed(1)
  }));

  const COLORS = ['#14b8a6', '#6366f1', '#a855f7', '#f97316', '#ec4899', '#10b981', '#f59e0b', '#f43f5e'];

  // Distance by workout type
  const distanceByTypeData = Object.entries(workoutTypeBreakdown).map(([type, count]) => {
    const typeWorkouts = completedWorkouts.filter(w => w.type === type);
    const totalDist = typeWorkouts.reduce((sum, w) => sum + (w.actual_distance_km || 0), 0);
    return {
      type: type.replace('_', ' ').replace(/\b\w/g, l => l.toUpperCase()),
      distance: parseFloat(totalDist.toFixed(1)),
      avgDistance: parseFloat((totalDist / count).toFixed(1))
    };
  }).sort((a, b) => b.distance - a.distance);

  // Heart rate zones (if available)
  const hrZones = {
    'Zone 1': 0,
    'Zone 2': 0,
    'Zone 3': 0,
    'Zone 4': 0,
    'Zone 5': 0
  };

  completedWorkouts.forEach(w => {
    if (w.heart_rate_avg) {
      if (w.heart_rate_avg < 120) hrZones['Zone 1']++;
      else if (w.heart_rate_avg < 140) hrZones['Zone 2']++;
      else if (w.heart_rate_avg < 160) hrZones['Zone 3']++;
      else if (w.heart_rate_avg < 175) hrZones['Zone 4']++;
      else hrZones['Zone 5']++;
    }
  });

  const hrZoneData = Object.entries(hrZones)
    .filter(([_, count]) => count > 0)
    .map(([zone, count]) => ({ zone, count }));

  return (
    <div className="space-y-6">
      <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatBox icon={Activity} label="Total Distance" value={`${totalDistance.toFixed(1)} km`} color="teal" />
        <StatBox icon={TrendingUp} label="Total Runs" value={totalRuns} color="indigo" />
        <StatBox icon={Clock} label="Avg Pace" value={avgPace > 0 ? `${avgPace.toFixed(2)} min/km` : 'N/A'} color="purple" />
        <StatBox icon={Heart} label="Avg HR" value={avgHeartRate > 0 ? `${Math.round(avgHeartRate)} bpm` : 'N/A'} color="rose" />
      </div>

      {/* Weekly Distance Trend */}
      {weeklyDistanceData.some(d => d.distance > 0) && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="rounded-xl bg-slate-800/30 border border-slate-700/50 p-6"
        >
          <h3 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
            <Calendar className="w-5 h-5 text-teal-400" />
            Weekly Distance Trend (Last 8 Weeks)
          </h3>
          <ResponsiveContainer width="100%" height={300}>
            <AreaChart data={weeklyDistanceData}>
              <defs>
                <linearGradient id="colorDistance" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#14b8a6" stopOpacity={0.3}/>
                  <stop offset="95%" stopColor="#14b8a6" stopOpacity={0}/>
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="#334155" />
              <XAxis dataKey="week" stroke="#94a3b8" style={{ fontSize: '12px' }} />
              <YAxis stroke="#94a3b8" style={{ fontSize: '12px' }} />
              <Tooltip 
                contentStyle={{ backgroundColor: '#1e293b', border: '1px solid #334155', borderRadius: '8px', color: '#fff' }}
                labelStyle={{ color: '#cbd5e1' }}
              />
              <Area type="monotone" dataKey="distance" stroke="#14b8a6" strokeWidth={2} fillOpacity={1} fill="url(#colorDistance)" />
            </AreaChart>
          </ResponsiveContainer>
        </motion.div>
      )}

      <div className="grid md:grid-cols-2 gap-6">
        {/* Pace Progression */}
        {paceProgressionData.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="rounded-xl bg-slate-800/30 border border-slate-700/50 p-6"
          >
            <h3 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
              <Clock className="w-5 h-5 text-indigo-400" />
              Pace Progression (Last 20 Runs)
            </h3>
            <ResponsiveContainer width="100%" height={250}>
              <LineChart data={paceProgressionData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#334155" />
                <XAxis dataKey="run" stroke="#94a3b8" style={{ fontSize: '12px' }} />
                <YAxis stroke="#94a3b8" reversed style={{ fontSize: '12px' }} />
                <Tooltip 
                  contentStyle={{ backgroundColor: '#1e293b', border: '1px solid #334155', borderRadius: '8px', color: '#fff' }}
                  formatter={(value) => [`${value} min/km`, 'Pace']}
                />
                <Line type="monotone" dataKey="pace" stroke="#6366f1" strokeWidth={2} dot={{ fill: '#6366f1' }} />
              </LineChart>
            </ResponsiveContainer>
          </motion.div>
        )}

        {/* Workout Type Distribution */}
        {workoutTypePieData.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="rounded-xl bg-slate-800/30 border border-slate-700/50 p-6"
          >
            <h3 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
              <Target className="w-5 h-5 text-purple-400" />
              Workout Type Distribution
            </h3>
            <ResponsiveContainer width="100%" height={250}>
              <PieChart>
                <Pie
                  data={workoutTypePieData}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={({ name, percentage }) => `${name}: ${percentage}%`}
                  outerRadius={80}
                  fill="#8884d8"
                  dataKey="value"
                  style={{ fontSize: '11px' }}
                >
                  {workoutTypePieData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip 
                  contentStyle={{ backgroundColor: '#1e293b', border: '1px solid #334155', borderRadius: '8px', color: '#fff' }}
                />
              </PieChart>
            </ResponsiveContainer>
          </motion.div>
        )}
      </div>

      {/* Distance by Workout Type */}
      {distanceByTypeData.length > 0 && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="rounded-xl bg-slate-800/30 border border-slate-700/50 p-6"
        >
          <h3 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
            <Activity className="w-5 h-5 text-emerald-400" />
            Distance by Workout Type
          </h3>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={distanceByTypeData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#334155" />
              <XAxis dataKey="type" stroke="#94a3b8" angle={-45} textAnchor="end" height={80} style={{ fontSize: '11px' }} />
              <YAxis stroke="#94a3b8" style={{ fontSize: '12px' }} />
              <Tooltip 
                contentStyle={{ backgroundColor: '#1e293b', border: '1px solid #334155', borderRadius: '8px', color: '#fff' }}
              />
              <Bar dataKey="distance" fill="#10b981" radius={[8, 8, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </motion.div>
      )}

      {/* Heart Rate Zones */}
      {hrZoneData.length > 0 && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="rounded-xl bg-slate-800/30 border border-slate-700/50 p-6"
        >
          <h3 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
            <Heart className="w-5 h-5 text-rose-400" />
            Heart Rate Zone Distribution
          </h3>
          <ResponsiveContainer width="100%" height={250}>
            <BarChart data={hrZoneData} layout="vertical">
              <CartesianGrid strokeDasharray="3 3" stroke="#334155" />
              <XAxis type="number" stroke="#94a3b8" style={{ fontSize: '12px' }} />
              <YAxis dataKey="zone" type="category" stroke="#94a3b8" width={80} style={{ fontSize: '12px' }} />
              <Tooltip 
                contentStyle={{ backgroundColor: '#1e293b', border: '1px solid #334155', borderRadius: '8px', color: '#fff' }}
              />
              <Bar dataKey="count" fill="#f43f5e" radius={[0, 8, 8, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </motion.div>
      )}

      {completedWorkouts.length === 0 && (
        <div className="text-center py-12 text-slate-400">
          <Activity className="w-12 h-12 mx-auto mb-4 opacity-50" />
          <p>No workout data yet. Start logging your runs to see analytics!</p>
        </div>
      )}
    </div>
  );
}

function StatBox({ icon: Icon, label, value, color }) {
  const colorClasses = {
    teal: 'from-teal-500/20 to-teal-600/10 border-teal-500/30',
    indigo: 'from-indigo-500/20 to-indigo-600/10 border-indigo-500/30',
    purple: 'from-purple-500/20 to-purple-600/10 border-purple-500/30',
    rose: 'from-rose-500/20 to-rose-600/10 border-rose-500/30',
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className={`rounded-xl bg-gradient-to-br ${colorClasses[color]} border p-5`}
    >
      <div className="flex items-center justify-between mb-2">
        <Icon className="w-5 h-5 text-slate-400" />
      </div>
      <p className="text-2xl font-bold text-white mb-1">{value}</p>
      <p className="text-sm text-slate-400">{label}</p>
    </motion.div>
  );
}