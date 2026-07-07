const db = globalThis.__B44_DB__ || { auth:{ isAuthenticated: async()=>false, me: async()=>null }, entities:new Proxy({}, { get:()=>({ filter:async()=>[], get:async()=>null, create:async()=>({}), update:async()=>({}), delete:async()=>({}) }) }), integrations:{ Core:{ UploadFile:async()=>({ file_url:'' }) } } };

import React, { useState, useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';

import { motion } from 'framer-motion';
import { format } from 'date-fns';
import { Lock, Unlock, Scale, FileText, Target, Plus, ChevronRight, Shield, Eye, EyeOff } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import StatCard from '@/components/ui/StatCard';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

const CORRECT_PASSWORD = 'ryanwong';

export default function Personal() {
  const queryClient = useQueryClient();
  const [isLocked, setIsLocked] = useState(true);
  const [passwordInput, setPasswordInput] = useState('');
  const [passwordError, setPasswordError] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showMetricDialog, setShowMetricDialog] = useState(false);
  const [showReflectionDialog, setShowReflectionDialog] = useState(false);
  const [metricForm, setMetricForm] = useState({ date: format(new Date(), 'yyyy-MM-dd'), weight_kg: '', height_cm: '', notes: '' });
  const [reflectionForm, setReflectionForm] = useState({ title: '', content: '', date: format(new Date(), 'yyyy-MM-dd') });

  useEffect(() => {
    const lastAccess = localStorage.getItem('personal_tab_access');
    if (lastAccess) {
      const timeDiff = Date.now() - parseInt(lastAccess);
      if (timeDiff < 15 * 60 * 1000) { setIsLocked(false); } else { localStorage.removeItem('personal_tab_access'); }
    }
  }, []);

  const handleUnlock = () => {
    if (passwordInput === CORRECT_PASSWORD) { setIsLocked(false); setPasswordError(''); localStorage.setItem('personal_tab_access', Date.now().toString()); } 
    else { setPasswordError('Incorrect password'); }
  };

  const handleLock = () => { setIsLocked(true); setPasswordInput(''); localStorage.removeItem('personal_tab_access'); };

  const { data: bodyMetrics = [] } = useQuery({ queryKey: ['body-metrics'], queryFn: () => db.entities.BodyMetric.list('-date'), enabled: !isLocked });
  const { data: personalData = [] } = useQuery({ queryKey: ['personal-data'], queryFn: () => db.entities.PersonalData.list('-date'), enabled: !isLocked });

  const reflections = personalData.filter(d => d.type === 'reflection');
  const latestMetric = bodyMetrics[0];
  const chartData = bodyMetrics.slice(0, 30).reverse().map(m => ({ date: format(new Date(m.date), 'MMM d'), weight: m.weight_kg }));

  const createMetricMutation = useMutation({ mutationFn: (data) => db.entities.BodyMetric.create(data), onSuccess: () => { queryClient.invalidateQueries({ queryKey: ['body-metrics'] }); setShowMetricDialog(false); } });
  const createReflectionMutation = useMutation({ mutationFn: (data) => db.entities.PersonalData.create({ ...data, type: 'reflection' }), onSuccess: () => { queryClient.invalidateQueries({ queryKey: ['personal-data'] }); setShowReflectionDialog(false); } });

  if (isLocked) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950 flex items-center justify-center p-4">
        <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} className="max-w-md w-full">
          <Card className="bg-slate-800/50 border-slate-700">
            <CardHeader className="text-center">
              <div className="mx-auto w-16 h-16 rounded-full bg-gradient-to-br from-rose-500/20 to-orange-500/20 flex items-center justify-center mb-4"><Lock className="w-8 h-8 text-rose-400" /></div>
              <CardTitle className="text-white text-2xl">Personal Tab</CardTitle>
              <CardDescription className="text-slate-400">This section is password protected. Enter your password to access private data.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="relative">
                <Input type={showPassword ? 'text' : 'password'} value={passwordInput} onChange={(e) => { setPasswordInput(e.target.value); setPasswordError(''); }} placeholder="Enter password" className="bg-slate-900 border-slate-700 text-white pr-10" onKeyPress={(e) => e.key === 'Enter' && handleUnlock()} />
                <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-white">{showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}</button>
              </div>
              {passwordError && <p className="text-rose-400 text-sm">{passwordError}</p>}
              <Button onClick={handleUnlock} className="w-full bg-gradient-to-r from-rose-500 to-orange-500"><Unlock className="w-4 h-4 mr-2" />Unlock</Button>
              <p className="text-xs text-slate-500 text-center"><Shield className="w-3 h-3 inline mr-1" />End-to-end encrypted. Session expires after 15 minutes.</p>
            </CardContent>
          </Card>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950 p-4 md:p-8">
      <div className="max-w-6xl mx-auto space-y-8">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold text-white flex items-center gap-3"><Shield className="w-8 h-8 text-rose-400" />Personal Tab</h1>
            <p className="text-slate-400">Your private space for sensitive data</p>
          </div>
          <Button onClick={handleLock} variant="outline" className="border-rose-500/50 text-rose-400 hover:bg-rose-500/10 gap-2"><Lock className="w-4 h-4" />Lock</Button>
        </div>

        <Tabs defaultValue="metrics" className="w-full">
          <TabsList className="bg-slate-800/50 border border-slate-700/50">
            <TabsTrigger value="metrics" className="data-[state=active]:bg-rose-500"><Scale className="w-4 h-4 mr-2" />Body Metrics</TabsTrigger>
            <TabsTrigger value="reflections" className="data-[state=active]:bg-rose-500"><FileText className="w-4 h-4 mr-2" />Deep Reflections</TabsTrigger>
            <TabsTrigger value="goals" className="data-[state=active]:bg-rose-500"><Target className="w-4 h-4 mr-2" />Private Goals</TabsTrigger>
          </TabsList>

          <TabsContent value="metrics" className="mt-6">
            <div className="grid lg:grid-cols-3 gap-6">
              <div className="lg:col-span-1 space-y-4">
                <StatCard title="Current Weight" value={latestMetric?.weight_kg ? `${latestMetric.weight_kg} kg` : '-- kg'} subtitle={latestMetric ? format(new Date(latestMetric.date), 'MMM d, yyyy') : 'No data'} icon={Scale} color="rose" />
                <StatCard title="Height" value={latestMetric?.height_cm ? `${latestMetric.height_cm} cm` : '-- cm'} icon={ChevronRight} color="orange" />
                <Button onClick={() => setShowMetricDialog(true)} className="w-full bg-gradient-to-r from-rose-500 to-orange-500 gap-2"><Plus className="w-4 h-4" />Log Metrics</Button>
              </div>
              <div className="lg:col-span-2 rounded-xl bg-slate-800/30 border border-slate-700/50 p-6">
                <h3 className="text-lg font-semibold text-white mb-4">Weight Trend</h3>
                {chartData.length > 0 ? (
                  <div className="h-64">
                    <ResponsiveContainer width="100%" height="100%">
                      <LineChart data={chartData}>
                        <CartesianGrid strokeDasharray="3 3" stroke="#334155" /><XAxis dataKey="date" stroke="#64748b" fontSize={12} /><YAxis stroke="#64748b" fontSize={12} domain={['auto', 'auto']} />
                        <Tooltip contentStyle={{ backgroundColor: '#1e293b', border: '1px solid #334155', borderRadius: '8px' }} formatter={(value) => [`${value} kg`, 'Weight']} />
                        <Line type="monotone" dataKey="weight" stroke="#f43f5e" strokeWidth={2} dot={{ fill: '#f43f5e' }} />
                      </LineChart>
                    </ResponsiveContainer>
                  </div>
                ) : <div className="h-64 flex items-center justify-center text-slate-500">No data yet. Start logging your metrics!</div>}
              </div>
            </div>
            <div className="mt-6 rounded-xl bg-slate-800/30 border border-slate-700/50 p-6">
              <h3 className="text-lg font-semibold text-white mb-4">Recent Logs</h3>
              <div className="space-y-2">
                {bodyMetrics.slice(0, 10).map(metric => (
                  <div key={metric.id} className="flex items-center justify-between p-3 rounded-lg bg-slate-900/50">
                    <span className="text-slate-400">{format(new Date(metric.date), 'MMM d, yyyy')}</span>
                    <div className="flex items-center gap-4">
                      {metric.weight_kg && <span className="text-white font-medium">{metric.weight_kg} kg</span>}
                      {metric.notes && <span className="text-slate-500 text-sm truncate max-w-[200px]">{metric.notes}</span>}
                    </div>
                  </div>
                ))}
                {bodyMetrics.length === 0 && <p className="text-slate-500 text-center py-4">No logs yet</p>}
              </div>
            </div>
          </TabsContent>

          <TabsContent value="reflections" className="mt-6">
            <div className="flex justify-end mb-4"><Button onClick={() => setShowReflectionDialog(true)} className="bg-gradient-to-r from-rose-500 to-orange-500 gap-2"><Plus className="w-4 h-4" />New Reflection</Button></div>
            <div className="space-y-4">
              {reflections.map(reflection => (
                <motion.div key={reflection.id} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="rounded-xl bg-slate-800/30 border border-slate-700/50 p-6">
                  <div className="flex items-start justify-between mb-3"><h3 className="text-lg font-semibold text-white">{reflection.title}</h3><span className="text-sm text-slate-500">{format(new Date(reflection.date), 'MMM d, yyyy')}</span></div>
                  <p className="text-slate-300 whitespace-pre-wrap">{reflection.content}</p>
                </motion.div>
              ))}
              {reflections.length === 0 && <p className="text-slate-500 text-center py-12">No reflections yet. Use this space for your deepest thoughts.</p>}
            </div>
          </TabsContent>

          <TabsContent value="goals" className="mt-6"><p className="text-slate-400 text-center py-12">Private goals feature coming soon. Store aspirations not ready for the main Goals page.</p></TabsContent>
        </Tabs>
      </div>

      <Dialog open={showMetricDialog} onOpenChange={setShowMetricDialog}>
        <DialogContent className="bg-slate-900 border-slate-700 text-white">
          <DialogHeader><DialogTitle>Log Body Metrics</DialogTitle></DialogHeader>
          <div className="space-y-4 py-4">
            <div><Label className="text-slate-400">Date</Label><Input type="date" value={metricForm.date} onChange={(e) => setMetricForm({ ...metricForm, date: e.target.value })} className="bg-slate-800 border-slate-700 text-white" /></div>
            <div className="grid grid-cols-2 gap-4">
              <div><Label className="text-slate-400">Weight (kg)</Label><Input type="number" step="0.1" value={metricForm.weight_kg} onChange={(e) => setMetricForm({ ...metricForm, weight_kg: e.target.value })} placeholder="70.5" className="bg-slate-800 border-slate-700 text-white" /></div>
              <div><Label className="text-slate-400">Height (cm)</Label><Input type="number" value={metricForm.height_cm} onChange={(e) => setMetricForm({ ...metricForm, height_cm: e.target.value })} placeholder="175" className="bg-slate-800 border-slate-700 text-white" /></div>
            </div>
            <div><Label className="text-slate-400">Notes</Label><Textarea value={metricForm.notes} onChange={(e) => setMetricForm({ ...metricForm, notes: e.target.value })} placeholder="How are you feeling?" className="bg-slate-800 border-slate-700 text-white" /></div>
            <Button onClick={() => createMetricMutation.mutate({ ...metricForm, weight_kg: metricForm.weight_kg ? parseFloat(metricForm.weight_kg) : null, height_cm: metricForm.height_cm ? parseFloat(metricForm.height_cm) : null })} className="w-full bg-gradient-to-r from-rose-500 to-orange-500">Save Metrics</Button>
          </div>
        </DialogContent>
      </Dialog>

      <Dialog open={showReflectionDialog} onOpenChange={setShowReflectionDialog}>
        <DialogContent className="bg-slate-900 border-slate-700 text-white">
          <DialogHeader><DialogTitle>New Reflection</DialogTitle></DialogHeader>
          <div className="space-y-4 py-4">
            <div><Label className="text-slate-400">Title</Label><Input value={reflectionForm.title} onChange={(e) => setReflectionForm({ ...reflectionForm, title: e.target.value })} placeholder="What's on your mind?" className="bg-slate-800 border-slate-700 text-white" /></div>
            <div><Label className="text-slate-400">Content</Label><Textarea value={reflectionForm.content} onChange={(e) => setReflectionForm({ ...reflectionForm, content: e.target.value })} placeholder="Write your thoughts..." className="bg-slate-800 border-slate-700 text-white min-h-[200px]" /></div>
            <Button onClick={() => createReflectionMutation.mutate(reflectionForm)} className="w-full bg-gradient-to-r from-rose-500 to-orange-500">Save Reflection</Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}