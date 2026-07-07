const db = globalThis.__B44_DB__ || { auth:{ isAuthenticated: async()=>false, me: async()=>null }, entities:new Proxy({}, { get:()=>({ filter:async()=>[], get:async()=>null, create:async()=>({}), update:async()=>({}), delete:async()=>({}) }) }), integrations:{ Core:{ UploadFile:async()=>({ file_url:'' }) } } };

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

import { Sparkles, Target, Calendar, TrendingUp, Loader2, Plus } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';

export default function PersonalizedGoalSetting({ habits = [], studySessions = [], workouts = [] }) {
  const [showAIDialog, setShowAIDialog] = useState(false);
  const [showManualDialog, setShowManualDialog] = useState(false);
  const [isGenerating, setIsGenerating] = useState(false);
  const [aiSuggestions, setAiSuggestions] = useState(null);
  const [selectedGoal, setSelectedGoal] = useState(null);
  
  const [goalForm, setGoalForm] = useState({
    title: '',
    why_it_matters: '',
    category: 'personal',
    target_date: '',
    milestones: [],
  });

  const generateAIGoals = async () => {
    setIsGenerating(true);
    try {
      const recentStudy = studySessions.slice(0, 7).reduce((sum, s) => sum + (s.duration_minutes || 0), 0);
      const recentWorkouts = workouts.slice(0, 7).filter(w => w.completed).length;
      const activeHabits = habits.filter(h => h.active).length;

      const prompt = `You are a goal-setting coach for Ryan, an IB student and runner. Based on current data:
- ${Math.round(recentStudy / 60)} hours of study this week
- ${recentWorkouts} workouts completed this week
- ${activeHabits} active habits being tracked

Suggest 3 personalized, specific, achievable goals for the next 1-3 months. For each goal, provide:
1. A clear, specific title
2. Why it matters (1 sentence)
3. Category (academic/athletic/personal/health)
4. 3 concrete milestones to achieve it
5. Suggested target date (1-3 months from now)

Format as JSON: [{"title": "...", "why_it_matters": "...", "category": "...", "milestones": ["...", "...", "..."], "target_date": "YYYY-MM-DD"}]`;

      const response = await db.integrations.Core.InvokeLLM({
        prompt,
        add_context_from_internet: false,
        response_json_schema: {
          type: 'object',
          properties: {
            goals: {
              type: 'array',
              items: {
                type: 'object',
                properties: {
                  title: { type: 'string' },
                  why_it_matters: { type: 'string' },
                  category: { type: 'string' },
                  milestones: { type: 'array', items: { type: 'string' } },
                  target_date: { type: 'string' }
                }
              }
            }
          }
        }
      });

      setAiSuggestions(response.goals || []);
    } catch (error) {
      setAiSuggestions([
        {
          title: 'Achieve 90% completion rate on all habits',
          why_it_matters: 'Building consistency now will compound into long-term success',
          category: 'personal',
          milestones: ['Complete all habits 3 days in a row', 'Maintain 80% rate for 2 weeks', 'Hit 90% for full month'],
          target_date: new Date(Date.now() + 60 * 24 * 60 * 60 * 1000).toISOString().split('T')[0]
        },
        {
          title: 'Complete IB Internal Assessments',
          why_it_matters: 'IAs are crucial for final IB score and university applications',
          category: 'academic',
          milestones: ['Finish research and outline', 'Complete first draft', 'Submit final version'],
          target_date: new Date(Date.now() + 90 * 24 * 60 * 60 * 1000).toISOString().split('T')[0]
        },
        {
          title: 'Run a sub-20 minute 5K',
          why_it_matters: 'Breaking 20 minutes demonstrates dedication and improved fitness',
          category: 'athletic',
          milestones: ['Run 5K under 22 min', 'Complete speed work weekly', 'Race at sub-20 pace'],
          target_date: new Date(Date.now() + 75 * 24 * 60 * 60 * 1000).toISOString().split('T')[0]
        }
      ]);
    }
    setIsGenerating(false);
  };

  const handleSelectAIGoal = (goal) => {
    setSelectedGoal(goal);
    setGoalForm({
      title: goal.title,
      why_it_matters: goal.why_it_matters,
      category: goal.category,
      target_date: goal.target_date,
      milestones: goal.milestones.map((m, i) => ({ title: m, completed: false, date: '' })),
    });
    setShowAIDialog(false);
    setShowManualDialog(true);
  };

  const handleSaveGoal = async () => {
    await db.entities.Goal.create({
      ...goalForm,
      status: 'active',
      progress: 0,
    });
    setShowManualDialog(false);
    setGoalForm({ title: '', why_it_matters: '', category: 'personal', target_date: '', milestones: [] });
  };

  return (
    <>
      <div className="flex gap-2">
        <Button
          onClick={() => {
            generateAIGoals();
            setShowAIDialog(true);
          }}
          className="bg-gradient-to-r from-purple-500 to-pink-500 gap-2"
        >
          <Sparkles className="w-4 h-4" />
          AI Goal Suggestions
        </Button>
        <Button
          onClick={() => setShowManualDialog(true)}
          variant="outline"
          className="border-slate-600 gap-2"
        >
          <Plus className="w-4 h-4" />
          Create Goal
        </Button>
      </div>

      {/* AI Suggestions Dialog */}
      <Dialog open={showAIDialog} onOpenChange={setShowAIDialog}>
        <DialogContent className="bg-slate-900 border-slate-700 text-white max-w-2xl max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Sparkles className="w-5 h-5 text-purple-400" />
              AI-Powered Goal Suggestions
            </DialogTitle>
          </DialogHeader>
          
          {isGenerating ? (
            <div className="flex flex-col items-center justify-center py-12">
              <Loader2 className="w-8 h-8 animate-spin text-purple-400 mb-4" />
              <p className="text-slate-400">Analyzing your progress and generating personalized goals...</p>
            </div>
          ) : (
            <div className="space-y-4 py-4">
              {aiSuggestions?.map((goal, i) => (
                <motion.div
                  key={i}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.1 }}
                  className="rounded-xl bg-slate-800/30 border border-slate-700/50 p-4 hover:border-purple-500/50 transition cursor-pointer"
                  onClick={() => handleSelectAIGoal(goal)}
                >
                  <div className="flex items-start justify-between mb-2">
                    <h3 className="font-semibold text-white">{goal.title}</h3>
                    <span className="text-xs px-2 py-1 rounded-full bg-purple-500/20 text-purple-400 capitalize">
                      {goal.category}
                    </span>
                  </div>
                  <p className="text-sm text-slate-400 mb-3">{goal.why_it_matters}</p>
                  <div className="space-y-1 mb-3">
                    {goal.milestones.map((milestone, j) => (
                      <div key={j} className="flex items-center gap-2 text-xs text-slate-500">
                        <Target className="w-3 h-3" />
                        {milestone}
                      </div>
                    ))}
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-xs text-slate-500">Target: {new Date(goal.target_date).toLocaleDateString()}</span>
                    <Button size="sm" variant="ghost" className="text-purple-400 hover:text-purple-300">
                      Use This Goal
                    </Button>
                  </div>
                </motion.div>
              ))}
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* Manual Goal Creation Dialog */}
      <Dialog open={showManualDialog} onOpenChange={setShowManualDialog}>
        <DialogContent className="bg-slate-900 border-slate-700 text-white max-w-lg">
          <DialogHeader>
            <DialogTitle>Create New Goal</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div>
              <Label className="text-slate-400">Goal Title</Label>
              <Input
                value={goalForm.title}
                onChange={(e) => setGoalForm({ ...goalForm, title: e.target.value })}
                placeholder="What do you want to achieve?"
                className="bg-slate-800 border-slate-700 text-white"
              />
            </div>
            <div>
              <Label className="text-slate-400">Why It Matters</Label>
              <Textarea
                value={goalForm.why_it_matters}
                onChange={(e) => setGoalForm({ ...goalForm, why_it_matters: e.target.value })}
                placeholder="Why is this goal important to you?"
                className="bg-slate-800 border-slate-700 text-white"
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label className="text-slate-400">Category</Label>
                <Select value={goalForm.category} onValueChange={(value) => setGoalForm({ ...goalForm, category: value })}>
                  <SelectTrigger className="bg-slate-800 border-slate-700 text-white">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="academic">Academic</SelectItem>
                    <SelectItem value="athletic">Athletic</SelectItem>
                    <SelectItem value="personal">Personal</SelectItem>
                    <SelectItem value="health">Health</SelectItem>
                    <SelectItem value="creative">Creative</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label className="text-slate-400">Target Date</Label>
                <Input
                  type="date"
                  value={goalForm.target_date}
                  onChange={(e) => setGoalForm({ ...goalForm, target_date: e.target.value })}
                  className="bg-slate-800 border-slate-700 text-white"
                />
              </div>
            </div>
            <Button onClick={handleSaveGoal} className="w-full bg-gradient-to-r from-teal-500 to-emerald-500">
              Create Goal
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}