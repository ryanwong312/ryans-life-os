const db = globalThis.__B44_DB__ || { auth:{ isAuthenticated: async()=>false, me: async()=>null }, entities:new Proxy({}, { get:()=>({ filter:async()=>[], get:async()=>null, create:async()=>({}), update:async()=>({}), delete:async()=>({}) }) }), integrations:{ Core:{ UploadFile:async()=>({ file_url:'' }) } } };

import { useQuery } from '@tanstack/react-query';

import { useEffect } from 'react';

const themes = {
  dark_forest: {
    primary: '#10b981',
    secondary: '#059669',
    accent: '#34d399',
    background: 'from-emerald-950 via-slate-900 to-slate-950',
  },
  ocean_waves: {
    primary: '#06b6d4',
    secondary: '#0891b2',
    accent: '#22d3ee',
    background: 'from-cyan-950 via-slate-900 to-slate-950',
  },
  sunset_glow: {
    primary: '#f97316',
    secondary: '#ea580c',
    accent: '#fb923c',
    background: 'from-orange-950 via-slate-900 to-slate-950',
  },
  midnight_purple: {
    primary: '#8b5cf6',
    secondary: '#7c3aed',
    accent: '#a78bfa',
    background: 'from-purple-950 via-slate-900 to-slate-950',
  },
  cherry_blossom: {
    primary: '#ec4899',
    secondary: '#db2777',
    accent: '#f9a8d4',
    background: 'from-pink-950 via-slate-900 to-slate-950',
  },
};

export default function ThemeApplier() {
  const { data: inventory = [] } = useQuery({
    queryKey: ['inventory'],
    queryFn: () => db.entities.UserInventory.list(),
  });

  const activeTheme = inventory.find(i => i.active);

  useEffect(() => {
    if (activeTheme) {
      const themeData = themes[activeTheme.item_id];
      if (themeData) {
        document.documentElement.style.setProperty('--theme-primary', themeData.primary);
        document.documentElement.style.setProperty('--theme-secondary', themeData.secondary);
        document.documentElement.style.setProperty('--theme-accent', themeData.accent);
        
        // Update background gradient
        const mainBg = document.querySelector('.min-h-screen');
        if (mainBg) {
          mainBg.className = mainBg.className.replace(/from-\S+ via-\S+ to-\S+/, themeData.background);
        }
      }
    }
  }, [activeTheme]);

  return null;
}