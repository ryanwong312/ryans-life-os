import React from 'react';
import { motion } from 'framer-motion';
import { BookOpen, TrendingUp, FileText, Clock } from 'lucide-react';
import { Progress } from '@/components/ui/progress';

const groupColors = {
  1: 'from-blue-500/20 to-blue-600/10 border-blue-500/30',
  2: 'from-emerald-500/20 to-emerald-600/10 border-emerald-500/30',
  3: 'from-amber-500/20 to-amber-600/10 border-amber-500/30',
  4: 'from-rose-500/20 to-rose-600/10 border-rose-500/30',
  5: 'from-purple-500/20 to-purple-600/10 border-purple-500/30',
  6: 'from-indigo-500/20 to-indigo-600/10 border-indigo-500/30',
  7: 'from-teal-500/20 to-teal-600/10 border-teal-500/30',
};

const groupNames = {
  1: 'Language & Literature',
  2: 'Language Acquisition',
  3: 'Individuals & Societies',
  4: 'Sciences',
  5: 'Mathematics',
  6: 'The Arts',
  7: 'Core (TOK/EE/CAS)',
};

export default function SubjectCard({ subject, studyHours, notesCount, onClick }) {
  return (
    <motion.div
      whileHover={{ scale: 1.02 }}
      onClick={onClick}
      className={`cursor-pointer rounded-xl bg-gradient-to-br ${groupColors[subject.group] || groupColors[1]} border p-5`}
    >
      <div className="flex items-start justify-between mb-4">
        <div>
          <p className="text-xs text-slate-400 mb-1">Group {subject.group} • {subject.level}</p>
          <h3 className="text-lg font-bold text-white">{subject.name}</h3>
          {subject.teacher && (
            <p className="text-sm text-slate-400">{subject.teacher}</p>
          )}
        </div>
        {subject.predicted_grade && (
          <div className="text-right">
            <p className="text-2xl font-bold text-white">{subject.predicted_grade}</p>
            <p className="text-xs text-slate-400">predicted</p>
          </div>
        )}
      </div>

      {subject.ia_progress !== undefined && (
        <div className="mb-4">
          <div className="flex items-center justify-between text-sm mb-1">
            <span className="text-slate-400">IA Progress</span>
            <span className="text-white font-medium">{subject.ia_progress}%</span>
          </div>
          <Progress value={subject.ia_progress} className="h-2" />
        </div>
      )}

      <div className="flex gap-4 text-sm">
        <div className="flex items-center gap-1.5 text-slate-300">
          <Clock className="w-4 h-4 text-slate-400" />
          <span>{studyHours || 0}h studied</span>
        </div>
        <div className="flex items-center gap-1.5 text-slate-300">
          <FileText className="w-4 h-4 text-slate-400" />
          <span>{notesCount || 0} notes</span>
        </div>
      </div>
    </motion.div>
  );
}