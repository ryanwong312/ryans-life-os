import React, { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Star, Zap } from 'lucide-react';

let notificationQueue = [];
let showNotificationCallback = null;

export function triggerPointNotification(xp, fc, source) {
  notificationQueue.push({ xp, fc, source, id: Date.now() });
  if (showNotificationCallback) {
    showNotificationCallback();
  }
}

export default function PointNotification() {
  const [notifications, setNotifications] = useState([]);

  useEffect(() => {
    showNotificationCallback = () => {
      if (notificationQueue.length > 0) {
        const next = notificationQueue.shift();
        setNotifications(prev => [...prev, next]);
        
        setTimeout(() => {
          setNotifications(prev => prev.filter(n => n.id !== next.id));
        }, 3000);
      }
    };

    const interval = setInterval(() => {
      if (notificationQueue.length > 0 && notifications.length < 3) {
        showNotificationCallback();
      }
    }, 100);

    return () => clearInterval(interval);
  }, [notifications]);

  return (
    <div className="fixed top-20 right-6 z-[9999] space-y-2 pointer-events-none">
      <AnimatePresence>
        {notifications.map((notification) => (
          <motion.div
            key={notification.id}
            initial={{ opacity: 0, x: 100, scale: 0.8 }}
            animate={{ opacity: 1, x: 0, scale: 1 }}
            exit={{ opacity: 0, x: 100, scale: 0.8 }}
            className="bg-gradient-to-r from-purple-900/95 to-pink-900/95 backdrop-blur-lg rounded-xl border border-purple-500/30 p-4 shadow-2xl pointer-events-auto"
          >
            <div className="flex items-center gap-3">
              <div className="flex items-center gap-2">
                <Star className="w-5 h-5 text-purple-300" />
                <span className="text-xl font-bold text-white">+{notification.xp}</span>
                <span className="text-sm text-purple-300">XP</span>
              </div>
              <div className="flex items-center gap-2">
                <Zap className="w-5 h-5 text-amber-300" />
                <span className="text-xl font-bold text-white">+{notification.fc}</span>
                <span className="text-sm text-amber-300">FC</span>
              </div>
            </div>
            <div className="text-xs text-slate-300 mt-2">{notification.source}</div>
          </motion.div>
        ))}
      </AnimatePresence>
    </div>
  );
}