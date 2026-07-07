const db = globalThis.__B44_DB__ || { auth:{ isAuthenticated: async()=>false, me: async()=>null }, entities:new Proxy({}, { get:()=>({ filter:async()=>[], get:async()=>null, create:async()=>({}), update:async()=>({}), delete:async()=>({}) }) }), integrations:{ Core:{ UploadFile:async()=>({ file_url:'' }) } } };

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Quote, Heart, RefreshCw, Sparkles } from 'lucide-react';

import { Button } from '@/components/ui/button';

const defaultQuotes = [
  { text: "The only way to do great work is to love what you do.", author: "Steve Jobs", category: "motivational" },
  { text: "Success is not final, failure is not fatal: it is the courage to continue that counts.", author: "Winston Churchill", category: "wisdom" },
  { text: "The mind is everything. What you think you become.", author: "Buddha", category: "philosophical" },
  { text: "Don't count the days, make the days count.", author: "Muhammad Ali", category: "athletic" },
  { text: "Education is the most powerful weapon which you can use to change the world.", author: "Nelson Mandela", category: "academic" },
  { text: "Take care of your body. It's the only place you have to live.", author: "Jim Rohn", category: "wellness" },
  { text: "The pain you feel today will be the strength you feel tomorrow.", author: "Unknown", category: "athletic" },
  { text: "What we learn with pleasure we never forget.", author: "Alfred Mercier", category: "academic" },
  { text: "Your limitation—it's only your imagination.", author: "Unknown", category: "motivational" },
  { text: "Push yourself, because no one else is going to do it for you.", author: "Unknown", category: "motivational" },
  { text: "Great things never come from comfort zones.", author: "Unknown", category: "wisdom" },
  { text: "Dream it. Wish it. Do it.", author: "Unknown", category: "motivational" },
  { text: "The secret of getting ahead is getting started.", author: "Mark Twain", category: "wisdom" },
  { text: "It does not matter how slowly you go as long as you do not stop.", author: "Confucius", category: "philosophical" },
  { text: "Believe you can and you're halfway there.", author: "Theodore Roosevelt", category: "motivational" }
];

export default function QuoteDisplay({ context = 'general', className = '', compact = false }) {
  const [quote, setQuote] = useState(null);
  const [isFavorite, setIsFavorite] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const getTimeContext = () => {
    const hour = new Date().getHours();
    if (hour < 12) return 'morning';
    if (hour < 17) return 'afternoon';
    return 'evening';
  };

  const getRandomQuote = async () => {
    setIsLoading(true);
    try {
      const quotes = await db.entities.Quote.list();
      let filteredQuotes = quotes.length > 0 ? quotes : defaultQuotes;
      
      // Filter by context if available
      if (context !== 'general' && filteredQuotes.some(q => q.context?.includes(context))) {
        filteredQuotes = filteredQuotes.filter(q => q.context?.includes(context));
      }
      
      const randomIndex = Math.floor(Math.random() * filteredQuotes.length);
      const selected = filteredQuotes[randomIndex];
      setQuote(selected);
      setIsFavorite(selected.favorite || false);
    } catch (error) {
      const randomIndex = Math.floor(Math.random() * defaultQuotes.length);
      setQuote(defaultQuotes[randomIndex]);
    }
    setIsLoading(false);
  };

  useEffect(() => {
    getRandomQuote();
  }, [context]);

  const toggleFavorite = async () => {
    if (quote?.id) {
      await db.entities.Quote.update(quote.id, { favorite: !isFavorite });
      setIsFavorite(!isFavorite);
    }
  };

  if (!quote) return null;

  if (compact) {
    return (
      <div className={`flex items-center gap-3 text-slate-400 ${className}`}>
        <Sparkles className="w-4 h-4 text-teal-500" />
        <p className="text-sm italic">"{quote.text}"</p>
      </div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className={`relative overflow-hidden rounded-2xl bg-gradient-to-br from-slate-800/50 to-slate-900/50 border border-slate-700/50 p-6 ${className}`}
    >
      <div className="absolute top-0 right-0 w-32 h-32 bg-teal-500/10 rounded-full blur-3xl" />
      <div className="absolute bottom-0 left-0 w-24 h-24 bg-indigo-500/10 rounded-full blur-2xl" />
      
      <div className="relative">
        <Quote className="w-8 h-8 text-teal-500/30 mb-4" />
        
        <AnimatePresence mode="wait">
          <motion.div
            key={quote.text}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.3 }}
          >
            <p className="text-lg md:text-xl text-white font-light leading-relaxed mb-4">
              "{quote.text}"
            </p>
            <p className="text-teal-400 text-sm font-medium">
              — {quote.author || 'Unknown'}
            </p>
          </motion.div>
        </AnimatePresence>

        <div className="flex items-center gap-2 mt-6">
          <Button
            variant="ghost"
            size="icon"
            className="h-8 w-8 text-slate-400 hover:text-teal-400 hover:bg-slate-700/50"
            onClick={getRandomQuote}
            disabled={isLoading}
          >
            <RefreshCw className={`w-4 h-4 ${isLoading ? 'animate-spin' : ''}`} />
          </Button>
          <Button
            variant="ghost"
            size="icon"
            className={`h-8 w-8 ${isFavorite ? 'text-pink-500' : 'text-slate-400'} hover:text-pink-400 hover:bg-slate-700/50`}
            onClick={toggleFavorite}
          >
            <Heart className={`w-4 h-4 ${isFavorite ? 'fill-current' : ''}`} />
          </Button>
        </div>
      </div>
    </motion.div>
  );
}