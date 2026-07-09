import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Calendar as CalendarIcon, ExternalLink } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { getGoogleAuthUrl } from '@/lib/google-calendar';

export default function GoogleCalendarSync() {
  const [isSyncing, setIsSyncing] = useState(false);

  const handleSync = () => {
    const authUrl = getGoogleAuthUrl();
    // Redirect to Google auth
    window.location.href = authUrl;
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="rounded-xl bg-slate-800/30 border border-slate-700/50 p-5 mb-4"
    >
      <div className="flex flex-col gap-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-lg bg-gradient-to-br from-blue-500/20 to-indigo-500/20">
              <CalendarIcon className="w-5 h-5 text-blue-400" />
            </div>
            <div>
              <h3 className="text-sm font-medium text-white">Google Calendar Sync</h3>
              <p className="text-xs text-slate-400">Import events from Google Calendar</p>
            </div>
          </div>
          <Button
            onClick={handleSync}
            disabled={isSyncing}
            size="sm"
            className="bg-gradient-to-r from-blue-500 to-indigo-500 text-white hover:from-blue-600 hover:to-indigo-600"
          >
            <ExternalLink className="w-4 h-4 mr-2" />
            Sync Google Calendar
          </Button>
        </div>
      </div>
    </motion.div>
  );
}