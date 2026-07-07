const db = globalThis.__B44_DB__ || { auth:{ isAuthenticated: async()=>false, me: async()=>null }, entities:new Proxy({}, { get:()=>({ filter:async()=>[], get:async()=>null, create:async()=>({}), update:async()=>({}), delete:async()=>({}) }) }), integrations:{ Core:{ UploadFile:async()=>({ file_url:'' }) } } };

import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { useQuery } from '@tanstack/react-query';

import { format, startOfWeek, endOfWeek } from 'date-fns';
import { Sparkles, TrendingUp, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';

export default function AIDashboardCoach() {
  const [summary, setSummary] = useState(null);
  const [isGenerating, setIsGenerating] = useState(false);

  const weekStart = format(startOfWeek(new Date()), 'yyyy-MM-dd');
  const weekEnd = format(endOfWeek(new Date()), 'yyyy-MM-dd');
  const today = format(new Date(), 'yyyy-MM-dd');

  const { data: todayEvents = [] } = useQuery({
    queryKey: ['events-today'],
    queryFn: () => db.entities.CalendarEvent.filter({ date: today }),
  });

  const { data: weekWorkouts = [] } = useQuery({
    queryKey: ['workouts-week-coach'],
    queryFn: () => db.entities.Workout.filter({ 
      date: { $gte: weekStart, $lte: weekEnd }
    }),
  });

  const { data: weekStudy = [] } = useQuery({
    queryKey: ['study-week-coach'],
    queryFn: () => db.entities.StudySession.filter({ 
      date: { $gte: weekStart, $lte: weekEnd }
    }),
  });

  const { data: assignments = [] } = useQuery({
    queryKey: ['assignments-upcoming'],
    queryFn: () => db.entities.Assignment.filter({ 
      due_date: { $gte: today },
      status: { $nin: ['completed', 'submitted'] }
    }),
  });

  const generateSummary = async () => {
    setIsGenerating(true);
    try {
      const totalStudyHours = Math.round(weekStudy.reduce((sum, s) => sum + (s.duration_minutes || 0), 0) / 60);
      const completedWorkouts = weekWorkouts.filter(w => w.completed).length;
      const upcomingTasks = assignments.filter(a => new Date(a.due_date) <= new Date(Date.now() + 7 * 24 * 60 * 60 * 1000)).length;

      const prompt = `You are an AI coach for Ryan's life operating system. Provide a brief, motivational summary of this week based on:

- ${todayEvents.length} events scheduled today
- ${completedWorkouts} workouts completed this week out of ${weekWorkouts.length} planned
- ${totalStudyHours} hours of study time logged
- ${upcomingTasks} assignments due this week

Keep it under 3 sentences. Be encouraging, specific, and actionable. Focus on what's going well and gentle nudges for improvement.`;

      const response = await db.integrations.Core.InvokeLLM({
        prompt,
        add_context_from_internet: false
      });

      setSummary(response);
    } catch (error) {
      setSummary("Keep up the momentum! You're making great progress across your goals.");
    }
    setIsGenerating(false);
  };

  React.useEffect(() => {
    if (!summary && !isGenerating) {
      generateSummary();
    }
  }, [todayEvents, weekWorkouts, weekStudy, assignments]);

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.4 }}
      className="rounded-xl bg-gradient-to-br from-purple-500/10 to-pink-500/10 border border-purple-500/20 p-6"
    >
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold text-white flex items-center gap-2">
          <Sparkles className="w-5 h-5 text-purple-400" />
          AI Coach
        </h3>
        <Button
          variant="ghost"
          size="sm"
          onClick={generateSummary}
          disabled={isGenerating}
          className="text-purple-400 hover:text-purple-300"
        >
          {isGenerating ? <Loader2 className="w-4 h-4 animate-spin" /> : <TrendingUp className="w-4 h-4" />}
        </Button>
      </div>
      
      {isGenerating ? (
        <div className="flex items-center gap-3 text-slate-400">
          <Loader2 className="w-5 h-5 animate-spin" />
          <span>Analyzing your week...</span>
        </div>
      ) : (
        <p className="text-slate-300 leading-relaxed">
          {summary || "Generating your personalized insights..."}
        </p>
      )}
    </motion.div>
  );
}