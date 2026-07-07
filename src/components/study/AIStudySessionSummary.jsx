const db = globalThis.__B44_DB__ || { auth:{ isAuthenticated: async()=>false, me: async()=>null }, entities:new Proxy({}, { get:()=>({ filter:async()=>[], get:async()=>null, create:async()=>({}), update:async()=>({}), delete:async()=>({}) }) }), integrations:{ Core:{ UploadFile:async()=>({ file_url:'' }) } } };

import React, { useState } from 'react';
import { motion } from 'framer-motion';

import { Sparkles, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';

export default function AIStudySessionSummary({ studySessions, subjects }) {
  const [summary, setSummary] = useState(null);
  const [isGenerating, setIsGenerating] = useState(false);

  const generateSummary = async () => {
    if (studySessions.length === 0) {
      setSummary("Start logging study sessions to get AI-powered insights!");
      return;
    }

    setIsGenerating(true);
    try {
      const totalMinutes = studySessions.reduce((sum, s) => sum + (s.duration_minutes || 0), 0);
      const subjectBreakdown = studySessions.reduce((acc, s) => {
        const subjectName = subjects.find(sub => sub.id === s.subject_id)?.name || 'Unknown';
        acc[subjectName] = (acc[subjectName] || 0) + s.duration_minutes;
        return acc;
      }, {});

      const topSubjects = Object.entries(subjectBreakdown)
        .sort((a, b) => b[1] - a[1])
        .slice(0, 3)
        .map(([name, mins]) => `${name} (${Math.round(mins / 60)}h)`);

      const prompt = `You are an AI study coach for an IB student named Ryan. Analyze this week's study data:

- Total study time: ${Math.round(totalMinutes / 60)} hours
- Number of sessions: ${studySessions.length}
- Top subjects: ${topSubjects.join(', ')}

Provide 2-3 sentences with:
1. A specific insight or pattern
2. One actionable study tip

Be encouraging and specific.`;

      const response = await db.integrations.Core.InvokeLLM({
        prompt,
        add_context_from_internet: false
      });

      setSummary(response);
    } catch (error) {
      setSummary("Great work on your study sessions! Keep maintaining consistent study habits.");
    }
    setIsGenerating(false);
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="rounded-xl bg-gradient-to-br from-indigo-500/10 to-purple-500/10 border border-indigo-500/20 p-6"
    >
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold text-white flex items-center gap-2">
          <Sparkles className="w-5 h-5 text-indigo-400" />
          AI Study Insights
        </h3>
        <Button
          variant="ghost"
          size="sm"
          onClick={generateSummary}
          disabled={isGenerating}
          className="text-indigo-400 hover:text-indigo-300"
        >
          {isGenerating ? <Loader2 className="w-4 h-4 animate-spin" /> : 'Generate'}
        </Button>
      </div>
      
      {isGenerating ? (
        <div className="flex items-center gap-3 text-slate-400">
          <Loader2 className="w-5 h-5 animate-spin" />
          <span>Analyzing your study patterns...</span>
        </div>
      ) : summary ? (
        <p className="text-slate-300 leading-relaxed">{summary}</p>
      ) : (
        <p className="text-slate-400 text-sm">Click Generate to get personalized study insights</p>
      )}
    </motion.div>
  );
}