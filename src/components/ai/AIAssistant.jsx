const db = globalThis.__B44_DB__ || { auth:{ isAuthenticated: async()=>false, me: async()=>null }, entities:new Proxy({}, { get:()=>({ filter:async()=>[], get:async()=>null, create:async()=>({}), update:async()=>({}), delete:async()=>({}) }) }), integrations:{ Core:{ UploadFile:async()=>({ file_url:'' }) } } };

import React, { useState, useRef, useEffect } from 'react';

import { motion, AnimatePresence } from 'framer-motion';
import { MessageCircle, Send, X, Sparkles, Loader2, Bookmark, Trash2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { ScrollArea } from '@/components/ui/scroll-area';
import ReactMarkdown from 'react-markdown';

export default function AIAssistant({ context = 'general', contextData = {} }) {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const buildContextPrompt = () => {
    let contextInfo = `You are an AI assistant helping Ryan with his ${context} needs. `;
    
    if (context === 'study' && contextData) {
      contextInfo += `Context: Ryan is an IB Diploma Programme student. `;
      if (contextData.subjects?.length) {
        contextInfo += `Subjects: ${contextData.subjects.map(s => s.name).join(', ')}. `;
      }
      contextInfo += 'Provide IB-specific guidance, explain concepts clearly, and help with study strategies.';
    } else if (context === 'habits' && contextData) {
      contextInfo += `Ryan is tracking ${contextData.habitCount || 0} habits. Provide motivation and insights.`;
    } else if (context === 'running' && contextData) {
      contextInfo += `Ryan is a runner. Provide training advice and running insights.`;
    }
    
    return contextInfo;
  };

  const handleSend = async () => {
    if (!input.trim() || isLoading) return;

    const userMessage = { role: 'user', content: input };
    setMessages(prev => [...prev, userMessage]);
    const userInput = input;
    setInput('');
    setIsLoading(true);

    try {
      const contextPrompt = buildContextPrompt();
      
      const result = await db.integrations.Core.InvokeLLM({
        prompt: `${contextPrompt}\n\n${userInput}`,
      });

      const aiMessage = { role: 'assistant', content: result || 'No response received' };
      setMessages(prev => [...prev, aiMessage]);
    } catch (error) {
      console.error('AI Assistant full error:', error);
      const errorMsg = error?.response?.data?.detail || error?.message || JSON.stringify(error) || 'Unknown error';
      const errorMessage = { 
        role: 'assistant', 
        content: `Error: ${errorMsg}` 
      };
      setMessages(prev => [...prev, errorMessage]);
    } finally {
      setIsLoading(false);
    }
  };

  const suggestions = {
    study: [
      'Explain photosynthesis',
      'Help me understand calculus derivatives',
      'Create a study schedule for my exams',
      'Summarize my biology notes'
    ],
    habits: [
      'Why am I missing my habits?',
      'Suggest optimal times for my habits',
      'How can I build better routines?'
    ],
    running: [
      'Suggest a training plan for 5K',
      'How to improve my pace?',
      'Recovery tips for runners'
    ],
    general: [
      'Review my progress this week',
      'Set goals for next month',
      'How can I be more productive?'
    ]
  };

  return (
    <>
      <motion.button
        whileHover={{ scale: 1.1 }}
        whileTap={{ scale: 0.95 }}
        onClick={() => setIsOpen(true)}
        className="fixed bottom-6 right-6 z-50 w-14 h-14 rounded-full bg-gradient-to-r from-purple-500 to-pink-500 shadow-lg shadow-purple-500/25 flex items-center justify-center text-white"
      >
        <Sparkles className="w-6 h-6" />
      </motion.button>

      <AnimatePresence>
        {isOpen && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsOpen(false)}
              className="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm"
            />
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              className="fixed bottom-24 right-6 z-50 w-96 h-[600px] rounded-2xl bg-slate-900 border border-slate-700 shadow-2xl flex flex-col"
            >
              {/* Header */}
              <div className="flex items-center justify-between p-4 border-b border-slate-700">
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 rounded-full bg-gradient-to-r from-purple-500 to-pink-500 flex items-center justify-center">
                    <Sparkles className="w-4 h-4 text-white" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-white">AI Assistant</h3>
                    <p className="text-xs text-slate-400 capitalize">{context} Helper</p>
                  </div>
                </div>
                <Button variant="ghost" size="icon" onClick={() => setIsOpen(false)} className="text-slate-400">
                  <X className="w-5 h-5" />
                </Button>
              </div>

              {/* Messages */}
              <ScrollArea className="flex-1 p-4">
                {messages.length === 0 && (
                  <div className="text-center py-8">
                    <Sparkles className="w-12 h-12 mx-auto mb-4 text-purple-400 opacity-50" />
                    <p className="text-slate-400 mb-4">How can I help you today?</p>
                    <div className="space-y-2">
                      {(suggestions[context] || suggestions.general).map((suggestion, i) => (
                        <button
                          key={i}
                          onClick={() => setInput(suggestion)}
                          className="w-full text-left px-3 py-2 rounded-lg bg-slate-800/50 text-slate-300 text-sm hover:bg-slate-800 transition"
                        >
                          {suggestion}
                        </button>
                      ))}
                    </div>
                  </div>
                )}
                
                {messages.map((msg, i) => (
                  <div key={i} className={`mb-4 ${msg.role === 'user' ? 'text-right' : 'text-left'}`}>
                    <div className={`inline-block max-w-[80%] rounded-2xl px-4 py-2 ${
                      msg.role === 'user' 
                        ? 'bg-gradient-to-r from-purple-500 to-pink-500 text-white' 
                        : 'bg-slate-800 text-slate-200'
                    }`}>
                      {msg.role === 'assistant' ? (
                        <ReactMarkdown className="prose prose-sm prose-invert max-w-none">
                          {msg.content}
                        </ReactMarkdown>
                      ) : (
                        <p className="text-sm">{msg.content}</p>
                      )}
                    </div>
                  </div>
                ))}
                
                {isLoading && (
                  <div className="text-left mb-4">
                    <div className="inline-block bg-slate-800 rounded-2xl px-4 py-2">
                      <Loader2 className="w-4 h-4 animate-spin text-purple-400" />
                    </div>
                  </div>
                )}
                
                <div ref={messagesEndRef} />
              </ScrollArea>

              {/* Input */}
              <div className="p-4 border-t border-slate-700">
                <div className="flex gap-2">
                  <Input
                    value={input}
                    onChange={(e) => setInput(e.target.value)}
                    onKeyPress={(e) => e.key === 'Enter' && handleSend()}
                    placeholder="Ask me anything..."
                    className="bg-slate-800 border-slate-700 text-white"
                    disabled={isLoading}
                  />
                  <Button 
                    onClick={handleSend} 
                    disabled={isLoading || !input.trim()}
                    className="bg-gradient-to-r from-purple-500 to-pink-500"
                  >
                    <Send className="w-4 h-4" />
                  </Button>
                </div>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </>
  );
}