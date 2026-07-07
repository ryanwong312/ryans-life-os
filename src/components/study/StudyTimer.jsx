import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Play, Pause, RotateCcw, Clock, Coffee } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';

export default function StudyTimer({ onSessionComplete }) {
  const [mode, setMode] = useState('pomodoro'); // pomodoro | stopwatch | break
  const [isRunning, setIsRunning] = useState(false);
  const [time, setTime] = useState(25 * 60); // seconds
  const [workDuration, setWorkDuration] = useState(25);
  const [breakDuration, setBreakDuration] = useState(5);
  const [sessionStart, setSessionStart] = useState(null);

  useEffect(() => {
    let interval;
    if (isRunning) {
      interval = setInterval(() => {
        setTime(prev => {
          if (mode === 'pomodoro' || mode === 'break') {
            if (prev <= 1) {
              setIsRunning(false);
              if (mode === 'pomodoro') {
                // Auto switch to break
                setMode('break');
                setTime(breakDuration * 60);
                if (onSessionComplete) {
                  onSessionComplete({
                    duration: workDuration,
                    startTime: sessionStart
                  });
                }
              } else {
                // Break ended
                setMode('pomodoro');
                setTime(workDuration * 60);
              }
              return 0;
            }
            return prev - 1;
          } else {
            // stopwatch counts up
            return prev + 1;
          }
        });
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [isRunning, mode, workDuration, breakDuration, sessionStart, onSessionComplete]);

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
    if (!isRunning && !sessionStart) {
      setSessionStart(new Date());
    }
    setIsRunning(true);
  };

  const handlePause = () => {
    setIsRunning(false);
  };

  const handleReset = () => {
    setIsRunning(false);
    if (mode === 'pomodoro') {
      setTime(workDuration * 60);
    } else if (mode === 'break') {
      setTime(breakDuration * 60);
    } else {
      setTime(0);
    }
    setSessionStart(null);
  };

  const handleModeChange = (newMode) => {
    setIsRunning(false);
    setMode(newMode);
    if (newMode === 'pomodoro') {
      setTime(workDuration * 60);
    } else if (newMode === 'break') {
      setTime(breakDuration * 60);
    } else {
      setTime(0);
    }
    setSessionStart(null);
  };

  return (
    <div className="rounded-xl bg-slate-800/30 border border-slate-700/50 p-6">
      <h3 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
        <Clock className="w-5 h-5 text-teal-400" />
        Study Timer
      </h3>

      <Tabs value={mode} onValueChange={handleModeChange} className="w-full">
        <TabsList className="grid w-full grid-cols-3 bg-slate-700/50">
          <TabsTrigger value="pomodoro" className="data-[state=active]:bg-teal-500">
            Pomodoro
          </TabsTrigger>
          <TabsTrigger value="stopwatch" className="data-[state=active]:bg-teal-500">
            Stopwatch
          </TabsTrigger>
          <TabsTrigger value="break" className="data-[state=active]:bg-teal-500">
            Break
          </TabsTrigger>
        </TabsList>

        <TabsContent value="pomodoro" className="mt-4">
          <div className="text-center mb-4">
            <div className="text-5xl font-bold text-white mb-2">
              {formatTime(time)}
            </div>
            <p className="text-sm text-slate-400">Focus Time</p>
          </div>
          <div className="grid grid-cols-2 gap-3 mb-4">
            <div>
              <Label className="text-slate-400 text-xs">Work (min)</Label>
              <Input
                type="number"
                value={workDuration}
                onChange={(e) => {
                  setWorkDuration(parseInt(e.target.value) || 25);
                  if (!isRunning) setTime(parseInt(e.target.value) * 60 || 25 * 60);
                }}
                className="bg-slate-700 border-slate-600 text-white"
                disabled={isRunning}
              />
            </div>
            <div>
              <Label className="text-slate-400 text-xs">Break (min)</Label>
              <Input
                type="number"
                value={breakDuration}
                onChange={(e) => setBreakDuration(parseInt(e.target.value) || 5)}
                className="bg-slate-700 border-slate-600 text-white"
                disabled={isRunning}
              />
            </div>
          </div>
        </TabsContent>

        <TabsContent value="stopwatch" className="mt-4">
          <div className="text-center mb-4">
            <div className="text-5xl font-bold text-white mb-2">
              {formatTime(time)}
            </div>
            <p className="text-sm text-slate-400">Time Elapsed</p>
          </div>
        </TabsContent>

        <TabsContent value="break" className="mt-4">
          <div className="text-center mb-4">
            <div className="text-5xl font-bold text-white mb-2">
              {formatTime(time)}
            </div>
            <p className="text-sm text-slate-400">Break Time</p>
          </div>
          <div className="bg-slate-700/30 rounded-lg p-3 mb-4">
            <p className="text-xs text-slate-400 mb-2">Break suggestions:</p>
            <div className="space-y-1 text-xs text-slate-300">
              <div>👁️ 20-20-20 rule (look 20ft away, 20 sec)</div>
              <div>💧 Drink water</div>
              <div>🏃 Quick stretch</div>
            </div>
          </div>
        </TabsContent>
      </Tabs>

      <div className="flex gap-2">
        {!isRunning ? (
          <Button onClick={handleStart} className="flex-1 bg-gradient-to-r from-teal-500 to-emerald-500">
            <Play className="w-4 h-4 mr-2" />
            Start
          </Button>
        ) : (
          <Button onClick={handlePause} variant="outline" className="flex-1 border-slate-600">
            <Pause className="w-4 h-4 mr-2" />
            Pause
          </Button>
        )}
        <Button onClick={handleReset} variant="outline" className="border-slate-600">
          <RotateCcw className="w-4 h-4" />
        </Button>
      </div>
    </div>
  );
}