import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from 'recharts';
import { format, subDays, startOfWeek, endOfWeek, startOfMonth, endOfMonth } from 'date-fns';
import { Button } from '@/components/ui/button';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';

export default function HabitTrendsChart({ habits, habitLogs }) {
  const [period, setPeriod] = useState('7days'); // 7days, 30days, 90days
  const [selectedHabits, setSelectedHabits] = useState(
    habits.slice(0, 3).reduce((acc, h) => ({ ...acc, [h.id]: true }), {})
  );

  const periods = [
    { value: '7days', label: '7 Days' },
    { value: '30days', label: '30 Days' },
    { value: '90days', label: '90 Days' },
  ];

  const getDaysCount = () => {
    switch (period) {
      case '7days': return 7;
      case '30days': return 30;
      case '90days': return 90;
      default: return 7;
    }
  };

  const generateChartData = () => {
    const days = getDaysCount();
    const data = [];
    
    for (let i = days - 1; i >= 0; i--) {
      const date = format(subDays(new Date(), i), 'yyyy-MM-dd');
      const dayData = { date: format(subDays(new Date(), i), 'MMM d') };
      
      habits.forEach(habit => {
        if (selectedHabits[habit.id]) {
          const log = habitLogs.find(l => l.habit_id === habit.id && l.date === date);
          dayData[habit.name] = log?.completed ? 1 : 0;
        }
      });
      
      data.push(dayData);
    }
    
    return data;
  };

  const colors = ['#14b8a6', '#6366f1', '#ec4899', '#f59e0b', '#10b981', '#8b5cf6', '#f43f5e'];
  const selectedHabitsList = habits.filter(h => selectedHabits[h.id]);

  const toggleHabit = (habitId) => {
    setSelectedHabits(prev => ({
      ...prev,
      [habitId]: !prev[habitId]
    }));
  };

  return (
    <div className="space-y-6">
      {/* Period Selection */}
      <div className="flex gap-2">
        {periods.map(p => (
          <Button
            key={p.value}
            variant={period === p.value ? 'default' : 'outline'}
            size="sm"
            onClick={() => setPeriod(p.value)}
            className={period === p.value ? 'bg-teal-500' : 'border-slate-600 text-slate-400'}
          >
            {p.label}
          </Button>
        ))}
      </div>

      {/* Habit Selection */}
      <div className="rounded-xl bg-slate-800/30 border border-slate-700/50 p-4">
        <h3 className="text-sm font-semibold text-white mb-3">Select Habits to Display</h3>
        <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
          {habits.map((habit, index) => (
            <div key={habit.id} className="flex items-center gap-2">
              <Switch
                id={`habit-${habit.id}`}
                checked={selectedHabits[habit.id] || false}
                onCheckedChange={() => toggleHabit(habit.id)}
              />
              <Label
                htmlFor={`habit-${habit.id}`}
                className="text-slate-300 text-sm cursor-pointer flex items-center gap-2"
              >
                <div
                  className="w-3 h-3 rounded-full"
                  style={{ backgroundColor: colors[index % colors.length] }}
                />
                {habit.name}
              </Label>
            </div>
          ))}
        </div>
      </div>

      {/* Chart */}
      {selectedHabitsList.length > 0 ? (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="rounded-xl bg-slate-800/30 border border-slate-700/50 p-6"
        >
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={generateChartData()}>
              <CartesianGrid strokeDasharray="3 3" stroke="#475569" />
              <XAxis
                dataKey="date"
                stroke="#94a3b8"
                tick={{ fill: '#94a3b8', fontSize: 12 }}
              />
              <YAxis
                stroke="#94a3b8"
                tick={{ fill: '#94a3b8', fontSize: 12 }}
                domain={[0, 1]}
                ticks={[0, 1]}
                tickFormatter={(val) => val === 1 ? 'Done' : 'Missed'}
              />
              <Tooltip
                contentStyle={{
                  backgroundColor: '#1e293b',
                  border: '1px solid #475569',
                  borderRadius: '0.5rem',
                  color: '#fff'
                }}
                formatter={(value) => [value === 1 ? 'Completed' : 'Not Completed', '']}
              />
              <Legend wrapperStyle={{ color: '#94a3b8' }} />
              {selectedHabitsList.map((habit, index) => (
                <Line
                  key={habit.id}
                  type="monotone"
                  dataKey={habit.name}
                  stroke={colors[habits.findIndex(h => h.id === habit.id) % colors.length]}
                  strokeWidth={2}
                  dot={{ r: 4 }}
                  activeDot={{ r: 6 }}
                />
              ))}
            </LineChart>
          </ResponsiveContainer>
        </motion.div>
      ) : (
        <div className="text-center py-12 text-slate-500">
          <p>Select at least one habit to view trends</p>
        </div>
      )}

      {/* Stats Summary */}
      {selectedHabitsList.length > 0 && (
        <div className="grid md:grid-cols-3 gap-4">
          {selectedHabitsList.map((habit, index) => {
            const days = getDaysCount();
            const completedDays = habitLogs.filter(
              l => l.habit_id === habit.id && 
              l.completed && 
              new Date(l.date) >= subDays(new Date(), days)
            ).length;
            const completionRate = Math.round((completedDays / days) * 100);

            return (
              <motion.div
                key={habit.id}
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: index * 0.1 }}
                className="rounded-xl bg-slate-800/30 border border-slate-700/50 p-4"
              >
                <div className="flex items-center gap-2 mb-2">
                  <div
                    className="w-3 h-3 rounded-full"
                    style={{ backgroundColor: colors[habits.findIndex(h => h.id === habit.id) % colors.length] }}
                  />
                  <h4 className="font-medium text-white text-sm">{habit.name}</h4>
                </div>
                <p className="text-2xl font-bold text-white mb-1">{completionRate}%</p>
                <p className="text-xs text-slate-400">{completedDays}/{days} days completed</p>
              </motion.div>
            );
          })}
        </div>
      )}
    </div>
  );
}