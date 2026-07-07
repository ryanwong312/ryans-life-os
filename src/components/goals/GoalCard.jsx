import React from 'react';
import { motion } from 'framer-motion';
import { format, differenceInDays } from 'date-fns';
import { Target, Calendar, CheckCircle2, Circle, Pause, XCircle } from 'lucide-react';
import { Progress } from '@/components/ui/progress';

const categoryColors = {
  academic: 'from-indigo-500/20 to-indigo-600/10 border-indigo-500/30',
  athletic: 'from-emerald-500/20 to-emerald-600/10 border-emerald-500/30',
  personal: 'from-teal-500/20 to-teal-600/10 border-teal-500/30',
  health: 'from-rose-500/20 to-rose-600/10 border-rose-500/30',
  creative: 'from-purple-500/20 to-purple-600/10 border-purple-500/30',
  social: 'from-amber-500/20 to-amber-600/10 border-amber-500/30',
  career: 'from-slate-500/20 to-slate-600/10 border-slate-500/30',
};

const statusConfig = {
  active: { icon: Target, color: 'text-teal-400', bg: 'bg-teal-500/20' },
  completed: { icon: CheckCircle2, color: 'text-emerald-400', bg: 'bg-emerald-500/20' },
  paused: { icon: Pause, color: 'text-amber-400', bg: 'bg-amber-500/20' },
  abandoned: { icon: XCircle, color: 'text-slate-400', bg: 'bg-slate-500/20' },
};

export default function GoalCard({ goal, onClick }) {
  const daysLeft = goal.target_date ? differenceInDays(new Date(goal.target_date), new Date()) : null;
  const StatusIcon = statusConfig[goal.status]?.icon || Target;
  const colors = categoryColors[goal.category] || categoryColors.personal;
  const statusStyles = statusConfig[goal.status] || statusConfig.active;

  const completedMilestones = goal.milestones?.filter(m => m.completed).length || 0;
  const totalMilestones = goal.milestones?.length || 0;

  return (
    <motion.div
      whileHover={{ scale: 1.02 }}
      onClick={onClick}
      className={`cursor-pointer rounded-xl bg-gradient-to-br ${colors} border p-5`}
    >
      <div className="flex items-start justify-between mb-3">
        <div className="flex items-start gap-3">
          <div className={`p-2 rounded-lg ${statusStyles.bg}`}>
            <StatusIcon className={`w-5 h-5 ${statusStyles.color}`} />
          </div>
          <div>
            <h3 className="font-semibold text-white">{goal.title}</h3>
            <p className="text-xs text-slate-400 capitalize">{goal.category}</p>
          </div>
        </div>
        {daysLeft !== null && daysLeft > 0 && (
          <div className="text-right">
            <p className="text-lg font-bold text-white">{daysLeft}</p>
            <p className="text-xs text-slate-400">days left</p>
          </div>
        )}
      </div>

      {goal.why_it_matters && (
        <p className="text-sm text-slate-300 mb-4 line-clamp-2">{goal.why_it_matters}</p>
      )}

      <div className="space-y-3">
        <div>
          <div className="flex items-center justify-between text-sm mb-1">
            <span className="text-slate-400">Progress</span>
            <span className="text-white font-medium">{goal.progress || 0}%</span>
          </div>
          <Progress value={goal.progress || 0} className="h-2" />
        </div>

        {totalMilestones > 0 && (
          <div className="flex items-center gap-2 text-sm text-slate-400">
            <div className="flex -space-x-1">
              {goal.milestones.slice(0, 5).map((m, i) => (
                <div
                  key={i}
                  className={`w-5 h-5 rounded-full border-2 border-slate-900 flex items-center justify-center ${
                    m.completed ? 'bg-emerald-500' : 'bg-slate-700'
                  }`}
                >
                  {m.completed && <CheckCircle2 className="w-3 h-3 text-white" />}
                </div>
              ))}
            </div>
            <span>{completedMilestones}/{totalMilestones} milestones</span>
          </div>
        )}

        {goal.target_date && (
          <div className="flex items-center gap-2 text-sm text-slate-400">
            <Calendar className="w-4 h-4" />
            <span>Due {format(new Date(goal.target_date), 'MMM d, yyyy')}</span>
          </div>
        )}
      </div>
    </motion.div>
  );
}