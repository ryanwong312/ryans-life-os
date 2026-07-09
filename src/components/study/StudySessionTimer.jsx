import React, { useState, useEffect, useRef } from 'react';
import { motion } from 'framer-motion';
import { Play, Square, Clock } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Label } from '@/components/ui/label';

export default function StudySessionTimer({ subjects, onComplete }) {
  const [isRunning, setIsRunning] = useState(false);
  const [elapsed, setElapsed] = useState(0); // seconds
  const [selectedSubject, setSelectedSubject] = useState('');
  const intervalRef = useRef(null);

  useEffect(() => {
    if (isRunning) {
      intervalRef.current = setInterval(() => {
        setElapsed(prev => prev + 1);
      }, 1000);
    } else if (intervalRef.current) {
      clearInterval(intervalRef.current);
    }
    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
  }, [isRunning]);

  const formatTime = (seconds) => {
    const hrs = Math.floor(seconds / 3600);
    const mins = Math.floor((seconds % 3600) / 60);
    const secs = seconds % 60;
    if (hrs > 0) {
      return `${hrs.toString().padStart(2, '0')}:${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
    }
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const handleStart = () => {
    if (subjects.length === 0) return;
    if (!selectedSubject && subjects.length > 0) {
      setSelectedSubject(subjects[0].id);
    }
    setElapsed(0);
    setIsRunning(true);
  };

  const handleStop = () => {
    setIsRunning(false);
    const minutes = Math.max(1, Math.round(elapsed / 60));
    const startTime = new Date(Date.now() - elapsed * 1000);
    onComplete({
      duration_minutes: minutes,
      subject_id: selectedSubject || subjects[0]?.id,
      start_time: startTime.toTimeString().slice(0, 5),
    });
    setElapsed(0);
  };

  return (
    <div className="rounded-xl bg-slate-800/30 border border-slate-700/50 p-6">
      <h3 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
        <Clock className="w-5 h-5 text-indigo-400" />
        Study Session Timer
      </h3>

      <div className="text-center mb-6">
        <motion.div
          key={isRunning ? 'running' : 'idle'}
          initial={{ scale: 0.95 }}
          animate={{ scale: 1 }}
          className={`text-6xl font-bold font-mono mb-2 ${isRunning ? 'text-indigo-400' : 'text-white'}`}
        >
          {formatTime(elapsed)}
        </motion.div>
        <p className="text-sm text-slate-400">
          {isRunning ? 'Session in progress...' : 'Ready to start studying'}
        </p>
      </div>

      {!isRunning && (
        <div className="mb-4">
          <Label className="text-slate-400 mb-2 block">Subject</Label>
          <Select value={selectedSubject} onValueChange={setSelectedSubject}>
            <SelectTrigger className="bg-slate-700 border-slate-600 text-white">
              <SelectValue placeholder="Select subject" />
            </SelectTrigger>
            <SelectContent>
              {subjects.map(s => (
                <SelectItem key={s.id} value={s.id}>{s.name}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      )}

      {isRunning ? (
        <Button
          onClick={handleStop}
          className="w-full h-12 bg-gradient-to-r from-rose-500 to-red-600 text-lg"
        >
          <Square className="w-5 h-5 mr-2" />
          Stop & Log Session
        </Button>
      ) : (
        <Button
          onClick={handleStart}
          disabled={subjects.length === 0}
          className="w-full h-12 bg-gradient-to-r from-indigo-500 to-purple-500 text-lg"
        >
          <Play className="w-5 h-5 mr-2" />
          Start Session
        </Button>
      )}
      {subjects.length === 0 && (
        <p className="text-xs text-slate-500 text-center mt-2">Add a subject first to start timing</p>
      )}
    </div>
  );
}