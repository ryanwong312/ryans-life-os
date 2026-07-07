const db = globalThis.__B44_DB__ || { auth:{ isAuthenticated: async()=>false, me: async()=>null }, entities:new Proxy({}, { get:()=>({ filter:async()=>[], get:async()=>null, create:async()=>({}), update:async()=>({}), delete:async()=>({}) }) }), integrations:{ Core:{ UploadFile:async()=>({ file_url:'' }) } } };

import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Mic, Square, Play, Pause, Trash2, FileText } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';

export default function VoiceNotes({ voiceNotes = [], onAddNote, onDeleteNote, onUpdateNote }) {
  const [isRecording, setIsRecording] = useState(false);
  const [recordingTime, setRecordingTime] = useState(0);
  const [playingIndex, setPlayingIndex] = useState(null);
  const [editingTranscript, setEditingTranscript] = useState(null);
  
  const mediaRecorderRef = useRef(null);
  const audioChunksRef = useRef([]);
  const timerIntervalRef = useRef(null);
  const audioElementsRef = useRef([]);

  const formatTime = (seconds) => {
    const hrs = Math.floor(seconds / 3600);
    const mins = Math.floor((seconds % 3600) / 60);
    const secs = seconds % 60;
    return `${hrs.toString().padStart(2, '0')}:${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const handleStartRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ 
        audio: {
          channelCount: 1,
          sampleRate: 44100,
          echoCancellation: true,
          noiseSuppression: true,
          autoGainControl: true
        }
      });
      
      const options = {
        mimeType: 'audio/webm;codecs=opus',
        audioBitsPerSecond: 128000
      };
      
      const mediaRecorder = new MediaRecorder(stream, options);
      mediaRecorderRef.current = mediaRecorder;
      audioChunksRef.current = [];

      mediaRecorder.ondataavailable = (event) => {
        if (event.data.size > 0) {
          audioChunksRef.current.push(event.data);
        }
      };

      mediaRecorder.onstop = async () => {
        const audioBlob = new Blob(audioChunksRef.current, { type: 'audio/webm' });
        
        // Save the recording time before reset
        const finalDuration = formatTime(recordingTime);
        
        // Upload audio file
        const file = new File([audioBlob], `voice-note-${Date.now()}.webm`, { type: 'audio/webm' });
        const { file_url } = await db.integrations.Core.UploadFile({ file });

        onAddNote({
          timestamp: new Date().toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' }),
          duration: finalDuration,
          transcription: '',
          audioUrl: file_url
        });

        setRecordingTime(0);
        stream.getTracks().forEach(track => track.stop());
      };

      mediaRecorder.start();
      setIsRecording(true);

      timerIntervalRef.current = setInterval(() => {
        setRecordingTime(prev => prev + 1);
      }, 1000);
    } catch (error) {
      console.error('Error starting recording:', error);
      alert('Could not access microphone. Please grant permission.');
    }
  };

  const handleStopRecording = () => {
    if (mediaRecorderRef.current && mediaRecorderRef.current.state === 'recording') {
      mediaRecorderRef.current.stop();
      setIsRecording(false);
      if (timerIntervalRef.current) {
        clearInterval(timerIntervalRef.current);
      }
    }
  };

  const togglePlayback = (index) => {
    const audioElement = audioElementsRef.current[index];
    if (!audioElement) return;

    if (playingIndex === index) {
      audioElement.pause();
      setPlayingIndex(null);
    } else {
      // Pause any currently playing audio
      audioElementsRef.current.forEach(audio => audio?.pause());
      audioElement.play();
      setPlayingIndex(index);
    }
  };

  useEffect(() => {
    return () => {
      if (timerIntervalRef.current) {
        clearInterval(timerIntervalRef.current);
      }
      audioElementsRef.current.forEach(audio => audio?.pause());
    };
  }, []);

  return (
    <div className="space-y-6">
      {/* Recording Interface */}
      <div className="rounded-xl bg-gradient-to-br from-teal-500/10 to-emerald-500/10 border border-teal-500/30 p-6">
        <div className="text-center space-y-4">
          <div className={`mx-auto w-24 h-24 rounded-full flex items-center justify-center cursor-pointer ${
            isRecording 
              ? 'bg-rose-500 animate-pulse' 
              : 'bg-gradient-to-br from-teal-500 to-emerald-500'
          }`}
          onClick={isRecording ? handleStopRecording : handleStartRecording}
          >
            {isRecording ? (
              <Square className="w-10 h-10 text-white" />
            ) : (
              <Mic className="w-10 h-10 text-white" />
            )}
          </div>

          {isRecording ? (
            <>
              <div className="flex items-center justify-center gap-2">
                <div className="w-2 h-2 rounded-full bg-rose-500 animate-pulse" />
                <span className="text-rose-400 font-medium">Recording...</span>
              </div>
              <div className="text-3xl font-mono text-white">{formatTime(recordingTime)}</div>
              <Button
                onClick={handleStopRecording}
                variant="destructive"
                className="gap-2"
              >
                <Square className="w-4 h-4" />
                Stop Recording
              </Button>
            </>
          ) : (
            <>
              <h3 className="text-lg font-semibold text-white">Voice Recording</h3>
              <p className="text-sm text-slate-400">Tap to start recording your thoughts</p>
              <Button
                onClick={handleStartRecording}
                className="bg-gradient-to-r from-teal-500 to-emerald-500 gap-2"
              >
                <Mic className="w-4 h-4" />
                Start Recording
              </Button>
            </>
          )}
        </div>
      </div>

      {/* Voice Notes List */}
      {voiceNotes.length > 0 && (
        <div className="space-y-3">
          <h3 className="text-lg font-semibold text-white">Today's Voice Notes</h3>
          <AnimatePresence>
            {voiceNotes.map((note, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 20 }}
                className="rounded-xl bg-slate-800/30 border border-slate-700/50 p-4"
              >
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center gap-3">
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-10 w-10 rounded-full bg-teal-500/20"
                      onClick={() => togglePlayback(index)}
                    >
                      {playingIndex === index ? (
                        <Pause className="w-5 h-5 text-teal-400" />
                      ) : (
                        <Play className="w-5 h-5 text-teal-400" />
                      )}
                    </Button>
                    <div>
                      <p className="text-white font-medium">{note.timestamp}</p>
                      <p className="text-xs text-slate-500">{note.duration}</p>
                    </div>
                  </div>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="text-slate-400 hover:text-rose-400"
                    onClick={() => onDeleteNote(index)}
                  >
                    <Trash2 className="w-4 h-4" />
                  </Button>
                </div>

                {/* Hidden audio element */}
                {note.audioUrl && (
                  <audio
                    ref={el => audioElementsRef.current[index] = el}
                    src={note.audioUrl}
                    onEnded={() => setPlayingIndex(null)}
                    className="hidden"
                  />
                )}

                {/* Waveform Placeholder */}
                <div className="h-12 mb-3 flex items-center gap-1">
                  {Array.from({ length: 50 }).map((_, i) => (
                    <div
                      key={i}
                      className={`flex-1 rounded-full ${
                        playingIndex === index && i < 25 ? 'bg-teal-500' : 'bg-slate-700'
                      }`}
                      style={{ height: `${Math.random() * 100}%` }}
                    />
                  ))}
                </div>

                {/* Transcription */}
                {editingTranscript === index ? (
                  <div className="space-y-2">
                    <Input
                      value={note.transcription}
                      onChange={(e) => onUpdateNote(index, { ...note, transcription: e.target.value })}
                      placeholder="Edit transcription..."
                      className="bg-slate-900/50 border-slate-700 text-white"
                    />
                    <Button
                      size="sm"
                      onClick={() => setEditingTranscript(null)}
                      className="bg-teal-500"
                    >
                      Save
                    </Button>
                  </div>
                ) : (
                  <div className="flex items-start gap-2">
                    <FileText className="w-4 h-4 text-slate-400 mt-1 flex-shrink-0" />
                    <p className="text-sm text-slate-400 flex-1">
                      {note.transcription || 'No transcription yet'}
                    </p>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => setEditingTranscript(index)}
                      className="text-xs text-slate-500"
                    >
                      Edit
                    </Button>
                  </div>
                )}
              </motion.div>
            ))}
          </AnimatePresence>
        </div>
      )}

      {voiceNotes.length === 0 && !isRecording && (
        <div className="text-center py-12 text-slate-500">
          <Mic className="w-12 h-12 mx-auto mb-3 opacity-30" />
          <p>No voice notes for today. Start recording to capture your thoughts!</p>
        </div>
      )}
    </div>
  );
}