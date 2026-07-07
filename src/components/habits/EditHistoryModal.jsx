import React from 'react';
import { motion } from 'framer-motion';
import { X, Clock, TrendingUp, TrendingDown } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { format } from 'date-fns';

export default function EditHistoryModal({ date, edits, onClose }) {
  return (
    <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/60 backdrop-blur-sm">
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className="bg-slate-900 rounded-2xl border border-slate-700 w-full max-w-2xl max-h-[80vh] overflow-hidden"
      >
        <div className="flex items-center justify-between p-6 border-b border-slate-700">
          <h2 className="text-xl font-bold text-white">
            Edit History - {format(new Date(date), 'MMMM d, yyyy')}
          </h2>
          <Button variant="ghost" size="icon" onClick={onClose}>
            <X className="w-5 h-5" />
          </Button>
        </div>

        <div className="p-6 overflow-y-auto max-h-[60vh]">
          {edits && edits.length > 0 ? (
            <div className="space-y-4">
              {edits.map((edit, index) => (
                <div key={index} className="p-4 rounded-lg bg-slate-800/50 border border-slate-700">
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center gap-2">
                      <Clock className="w-4 h-4 text-slate-400" />
                      <span className="text-sm text-slate-400">{edit.timestamp}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className={`px-2 py-1 rounded text-xs ${edit.old_value ? 'bg-rose-500/20 text-rose-400' : 'bg-slate-700 text-slate-400'}`}>
                        {edit.old_value ? '✓' : '✗'}
                      </span>
                      {edit.old_value !== edit.new_value ? <TrendingUp className="w-4 h-4 text-teal-400" /> : <TrendingDown className="w-4 h-4 text-rose-400" />}
                      <span className={`px-2 py-1 rounded text-xs ${edit.new_value ? 'bg-emerald-500/20 text-emerald-400' : 'bg-slate-700 text-slate-400'}`}>
                        {edit.new_value ? '✓' : '✗'}
                      </span>
                    </div>
                  </div>
                  <div className="text-white font-medium mb-1">{edit.habit_name}</div>
                  {edit.reason && (
                    <div className="text-sm text-slate-400 italic">"{edit.reason}"</div>
                  )}
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-12">
              <p className="text-slate-500 mb-2">No edits recorded for this date</p>
              <p className="text-slate-600 text-sm">Original values are preserved</p>
            </div>
          )}
        </div>
      </motion.div>
    </div>
  );
}