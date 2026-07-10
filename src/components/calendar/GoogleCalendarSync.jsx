import React, { useState } from 'react';
import { Calendar as CalendarIcon, ExternalLink } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { getGoogleAuthUrl } from '@/lib/google-calendar';

export default function GoogleCalendarSync() {
  const [isSyncing, setIsSyncing] = useState(false);

  const handleSync = () => {
    const authUrl = getGoogleAuthUrl();
    window.location.href = authUrl;
  };

  return (
    <Button
      onClick={handleSync}
      disabled={isSyncing}
      variant="outline"
      size="sm"
      className="border-slate-600 text-slate-300 hover:bg-slate-800 hover:text-white gap-2"
    >
      <CalendarIcon className="w-4 h-4" />
      Sync Google Calendar
    </Button>
  );
}