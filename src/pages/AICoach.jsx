const db = globalThis.__B44_DB__ || { auth:{ isAuthenticated: async()=>false, me: async()=>null }, entities:new Proxy({}, { get:()=>({ filter:async()=>[], get:async()=>null, create:async()=>({}), update:async()=>({}), delete:async()=>({}) }) }), integrations:{ Core:{ UploadFile:async()=>({ file_url:'' }) } } };

import React, { useState, useRef, useEffect } from 'react';
import { useQuery } from '@tanstack/react-query';

import { motion, AnimatePresence } from 'framer-motion';
import { format, subDays } from 'date-fns';
import { Send, Bot, User, Sparkles, Loader2, BookOpen, Activity, Target, Moon, Brain, Lightbulb, TrendingUp, History, Star, Trash2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import ReactMarkdown from 'react-markdown';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from '@/components/ui/sheet';

const suggestionPrompts = [
  { icon: Activity, text: "Analyze my running performance this week", category: "running" },
  { icon: BookOpen, text: "Create a study plan for my upcoming exams", category: "study" },
  { icon: Target, text: "Review my goal progress and suggest improvements", category: "goals" },
  { icon: Moon, text: "How does my sleep affect my productivity?", category: "sleep" },
  { icon: Brain, text: "What patterns do you see in my journal entries?", category: "journal" },
  { icon: TrendingUp, text: "Suggest habits I should focus on", category: "habits" },
];

export default function AICoach() {
  const queryClient = useQueryClient();
  const [messages, setMessages] = useState([{ role: 'assistant', content: "Hey Ryan! 👋 I'm your 2026 AI Coach. I have access to all your data - journals, habits, running logs, study sessions, and more. Ask me anything about your progress, or let me help you plan and improve!\n\nWhat would you like to explore today?" }]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [showHistory, setShowHistory] = useState(false);
  const scrollRef = useRef(null);
  const inputRef = useRef(null);

  const { data: conversationHistory = [] } = useQuery({
    queryKey: ['ai-conversations'],
    queryFn: () => db.entities.AIConversation.list('-created_date'),
  });

  const saveConversationMutation = useMutation({
    mutationFn: (data) => db.entities.AIConversation.create(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['ai-conversations'] });
    },
  });

  const toggleStarMutation = useMutation({
    mutationFn: ({ id, starred }) => db.entities.AIConversation.update(id, { starred }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['ai-conversations'] });
    },
  });

  const deleteConversationMutation = useMutation({
    mutationFn: (id) => db.entities.AIConversation.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['ai-conversations'] });
    },
  });

  const { data: recentDays = [] } = useQuery({ queryKey: ['ai-context-days'], queryFn: () => db.entities.Day.filter({ date: { $gte: format(subDays(new Date(), 7), 'yyyy-MM-dd') } }) });
  const { data: habits = [] } = useQuery({ queryKey: ['ai-context-habits'], queryFn: () => db.entities.Habit.filter({ active: true }) });
  const { data: recentHabitLogs = [] } = useQuery({ queryKey: ['ai-context-habit-logs'], queryFn: () => db.entities.HabitLog.filter({ date: { $gte: format(subDays(new Date(), 7), 'yyyy-MM-dd') } }) });
  const { data: recentWorkouts = [] } = useQuery({ queryKey: ['ai-context-workouts'], queryFn: () => db.entities.Workout.filter({ date: { $gte: format(subDays(new Date(), 14), 'yyyy-MM-dd') } }) });
  const { data: goals = [] } = useQuery({ queryKey: ['ai-context-goals'], queryFn: () => db.entities.Goal.filter({ status: 'active' }) });
  const { data: upcomingAssignments = [] } = useQuery({ queryKey: ['ai-context-assignments'], queryFn: () => db.entities.Assignment.filter({ status: { $ne: 'completed' } }, 'due_date', 10) });
  const { data: studySessions = [] } = useQuery({ queryKey: ['ai-context-study'], queryFn: () => db.entities.StudySession.filter({ date: { $gte: format(subDays(new Date(), 7), 'yyyy-MM-dd') } }) });

  useEffect(() => { if (scrollRef.current) scrollRef.current.scrollTop = scrollRef.current.scrollHeight; }, [messages]);

  const buildContext = () => {
    const today = format(new Date(), 'yyyy-MM-dd');
    const todayData = recentDays.find(d => d.date === today);
    const completedHabitsToday = recentHabitLogs.filter(l => l.date === today && l.completed).length;
    const weekHabitRate = recentHabitLogs.length > 0 ? Math.round((recentHabitLogs.filter(l => l.completed).length / recentHabitLogs.length) * 100) : 0;
    const weeklyKm = recentWorkouts.reduce((sum, w) => sum + (w.actual_distance_km || 0), 0);
    const completedWorkouts = recentWorkouts.filter(w => w.completed).length;
    const weeklyStudyMinutes = studySessions.reduce((sum, s) => sum + (s.duration_minutes || 0), 0);

    return `RYAN'S CURRENT DATA (${format(new Date(), 'MMMM d, yyyy')}):

TODAY'S STATUS:
- Mood: ${todayData?.mood || 'Not logged'}
- Sleep: ${todayData?.sleep_hours ? todayData.sleep_hours + ' hours (' + todayData.sleep_quality + ')' : 'Not logged'}
- Habits Completed: ${completedHabitsToday}/${habits.length}

WEEKLY SUMMARY:
- Habit Completion Rate: ${weekHabitRate}%
- Running: ${weeklyKm.toFixed(1)} km (${completedWorkouts} workouts)
- Study Time: ${Math.floor(weeklyStudyMinutes / 60)}h ${weeklyStudyMinutes % 60}m

ACTIVE GOALS (${goals.length}):
${goals.slice(0, 5).map(g => `- ${g.title} (${g.progress}% complete, ${g.category})`).join('\n')}

UPCOMING DEADLINES:
${upcomingAssignments.slice(0, 5).map(a => {
  const dueDate = a.due_date ? format(new Date(a.due_date), 'MMM d') : 'No date';
  return `- ${a.title} - Due: ${dueDate} (${a.type})`;
}).join('\n')}

HABITS BEING TRACKED:
${habits.map(h => `- ${h.name} (${h.type})`).join('\n')}

RECENT WORKOUTS:
${recentWorkouts.slice(0, 5).map(w => `- ${w.date}: ${w.type} - ${w.actual_distance_km || w.planned_distance_km || 0}km ${w.completed ? '✓' : '(planned)'}`).join('\n')}`;
  };

  const handleSend = async () => {
    if (!input.trim() || isLoading) return;
    const userMessage = input.trim();
    setInput('');
    setMessages(prev => [...prev, { role: 'user', content: userMessage }]);
    setIsLoading(true);

    try {
      const context = buildContext();
      const response = await db.integrations.Core.InvokeLLM({
        prompt: `You are Ryan's personal AI life coach for 2026. You have access to his comprehensive life data including journals, habits, running training, IB study progress, goals, and more.

Your personality:
- Supportive but direct - give actionable advice
- Data-driven - reference specific numbers and patterns
- Encouraging but honest about areas for improvement
- Understand IB Diploma Programme requirements
- Knowledgeable about running training and athletic performance

IMPORTANT: You are READ-ONLY. You can suggest changes but NEVER make them directly. Always say "Would you like me to..." or "I suggest..." instead of "I will..." or "I've created..."

${context}

USER'S QUESTION/REQUEST:
${userMessage}

Provide a helpful, personalized response based on Ryan's actual data. Be specific and actionable. Use markdown formatting for readability.`,
      });
      setMessages(prev => [...prev, { role: 'assistant', content: response }]);
      
      // Save to conversation history
      saveConversationMutation.mutate({
        user_message: userMessage,
        ai_response: response,
        context_used: { habits: habits.length, workouts: recentWorkouts.length, goals: goals.length },
        actions_taken: []
      });
    } catch (error) {
      console.error('AI Coach Error:', error);
      const errorMsg = error?.message || error?.toString() || 'Unknown error occurred';
      setMessages(prev => [...prev, { role: 'assistant', content: `Error: ${errorMsg}\n\nPlease check the browser console for more details.` }]);
    }
    setIsLoading(false);
  };

  const handleSuggestionClick = (prompt) => { setInput(prompt); inputRef.current?.focus(); };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950 flex flex-col">
      <div className="p-4 md:p-6 border-b border-slate-800/50">
        <div className="max-w-4xl mx-auto flex items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-teal-500 to-emerald-500 flex items-center justify-center"><Bot className="w-6 h-6 text-white" /></div>
            <div><h1 className="text-xl font-bold text-white">AI Coach</h1><p className="text-sm text-slate-400">Your intelligent life assistant</p></div>
          </div>
          <Sheet open={showHistory} onOpenChange={setShowHistory}>
            <SheetTrigger asChild>
              <Button variant="outline" className="border-slate-600 gap-2">
                <History className="w-4 h-4" />
                History
              </Button>
            </SheetTrigger>
            <SheetContent className="bg-slate-900 border-slate-700 w-full sm:max-w-lg overflow-y-auto">
              <SheetHeader>
                <SheetTitle className="text-white">Conversation History</SheetTitle>
                <SheetDescription className="text-slate-400">
                  Review past conversations with your AI Coach
                </SheetDescription>
              </SheetHeader>
              <div className="mt-6 space-y-3">
                {conversationHistory.map((conv) => (
                  <motion.div
                    key={conv.id}
                    className="rounded-lg bg-slate-800/30 border border-slate-700/50 p-4"
                  >
                    <div className="flex items-start justify-between mb-2">
                      <p className="text-xs text-slate-500">{conv.created_date ? format(new Date(conv.created_date), 'MMM d, h:mm a') : 'Unknown date'}</p>
                      <div className="flex items-center gap-1">
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-6 w-6"
                          onClick={() => toggleStarMutation.mutate({ id: conv.id, starred: !conv.starred })}
                        >
                          <Star className={`w-4 h-4 ${conv.starred ? 'fill-amber-400 text-amber-400' : 'text-slate-400'}`} />
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-6 w-6 text-slate-400 hover:text-rose-400"
                          onClick={() => deleteConversationMutation.mutate(conv.id)}
                        >
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </div>
                    </div>
                    <p className="text-sm text-white mb-2"><strong>You:</strong> {conv.user_message}</p>
                    <p className="text-sm text-slate-400 line-clamp-3"><strong>AI:</strong> {conv.ai_response?.substring(0, 150)}...</p>
                  </motion.div>
                ))}
                {conversationHistory.length === 0 && (
                  <p className="text-slate-500 text-center py-8">No conversation history yet</p>
                )}
              </div>
            </SheetContent>
          </Sheet>
        </div>
      </div>

      <div className="flex-1 overflow-hidden">
        <div ref={scrollRef} className="h-full overflow-y-auto p-4 md:p-6">
          <div className="max-w-4xl mx-auto space-y-6">
            <AnimatePresence>
              {messages.map((message, index) => (
                <motion.div key={index} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className={`flex gap-4 ${message.role === 'user' ? 'justify-end' : ''}`}>
                  {message.role === 'assistant' && <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-teal-500/20 to-emerald-500/20 border border-teal-500/30 flex items-center justify-center flex-shrink-0"><Sparkles className="w-5 h-5 text-teal-400" /></div>}
                  <div className={`max-w-[80%] rounded-2xl p-4 ${message.role === 'user' ? 'bg-gradient-to-r from-teal-500 to-emerald-500 text-white' : 'bg-slate-800/50 border border-slate-700/50 text-slate-200'}`}>
                    {message.role === 'assistant' ? (
                      <ReactMarkdown className="prose prose-invert prose-sm max-w-none" components={{
                        p: ({ children }) => <p className="mb-2 last:mb-0">{children}</p>,
                        ul: ({ children }) => <ul className="list-disc pl-4 mb-2">{children}</ul>,
                        ol: ({ children }) => <ol className="list-decimal pl-4 mb-2">{children}</ol>,
                        li: ({ children }) => <li className="mb-1">{children}</li>,
                        strong: ({ children }) => <strong className="text-teal-300">{children}</strong>,
                      }}>{message.content}</ReactMarkdown>
                    ) : <p>{message.content}</p>}
                  </div>
                  {message.role === 'user' && <div className="w-10 h-10 rounded-xl bg-slate-700 flex items-center justify-center flex-shrink-0"><User className="w-5 h-5 text-slate-300" /></div>}
                </motion.div>
              ))}
            </AnimatePresence>

            {isLoading && (
              <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="flex gap-4">
                <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-teal-500/20 to-emerald-500/20 border border-teal-500/30 flex items-center justify-center"><Loader2 className="w-5 h-5 text-teal-400 animate-spin" /></div>
                <div className="rounded-2xl bg-slate-800/50 border border-slate-700/50 p-4">
                  <div className="flex gap-1"><div className="w-2 h-2 rounded-full bg-teal-400 animate-bounce" style={{ animationDelay: '0ms' }} /><div className="w-2 h-2 rounded-full bg-teal-400 animate-bounce" style={{ animationDelay: '150ms' }} /><div className="w-2 h-2 rounded-full bg-teal-400 animate-bounce" style={{ animationDelay: '300ms' }} /></div>
                </div>
              </motion.div>
            )}

            {messages.length <= 1 && (
              <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }} className="mt-8">
                <p className="text-sm text-slate-500 mb-4 flex items-center gap-2"><Lightbulb className="w-4 h-4" />Try asking about...</p>
                <div className="grid md:grid-cols-2 gap-3">
                  {suggestionPrompts.map((prompt, index) => {
                    const Icon = prompt.icon;
                    return (
                      <motion.button key={index} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.4 + index * 0.1 }} onClick={() => handleSuggestionClick(prompt.text)}
                        className="flex items-center gap-3 p-4 rounded-xl bg-slate-800/30 border border-slate-700/50 text-left hover:border-teal-500/50 hover:bg-slate-800/50 transition-all group">
                        <div className="p-2 rounded-lg bg-slate-700/50 group-hover:bg-teal-500/20 transition"><Icon className="w-4 h-4 text-slate-400 group-hover:text-teal-400 transition" /></div>
                        <span className="text-sm text-slate-300">{prompt.text}</span>
                      </motion.button>
                    );
                  })}
                </div>
              </motion.div>
            )}
          </div>
        </div>
      </div>

      <div className="p-4 md:p-6 border-t border-slate-800/50 bg-slate-900/50 backdrop-blur-lg">
        <div className="max-w-4xl mx-auto">
          <form onSubmit={(e) => { e.preventDefault(); handleSend(); }} className="flex gap-3">
            <Input ref={inputRef} value={input} onChange={(e) => setInput(e.target.value)} placeholder="Ask me anything about your progress..." disabled={isLoading} className="flex-1 bg-slate-800/50 border-slate-700/50 text-white placeholder:text-slate-500 h-12 rounded-xl" />
            <Button type="submit" disabled={!input.trim() || isLoading} className="h-12 px-6 bg-gradient-to-r from-teal-500 to-emerald-500 rounded-xl"><Send className="w-5 h-5" /></Button>
          </form>
          <p className="text-xs text-slate-600 text-center mt-3">Your AI Coach has read-only access to your data for personalized insights</p>
        </div>
      </div>
    </div>
  );
}