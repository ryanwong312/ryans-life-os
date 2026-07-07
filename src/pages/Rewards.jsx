const db = globalThis.__B44_DB__ || { auth:{ isAuthenticated: async()=>false, me: async()=>null }, entities:new Proxy({}, { get:()=>({ filter:async()=>[], get:async()=>null, create:async()=>({}), update:async()=>({}), delete:async()=>({}) }) }), integrations:{ Core:{ UploadFile:async()=>({ file_url:'' }) } } };

import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Trophy, ShoppingBag, Lock, Star, Award, Target, Zap, Plus, Package, Check } from 'lucide-react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';

import { useGamification } from '@/components/gamification/useGamification';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';
import { Switch } from '@/components/ui/switch';
import { useAchievementProgress } from '@/components/gamification/AchievementProgressTracker';
import { useEffect } from 'react';

const defaultAchievements = [
  // Habit Hero
  { id: 'habit_streak_7', name: 'Week Warrior', desc: 'Complete habits for 7 consecutive days', icon: '🔥', rarity: 'common', xp: 100, fc: 25, category: 'habit_hero', requirement_type: 'habit_streak', requirement_value: 7 },
  { id: 'habit_streak_30', name: 'Month Master', desc: 'Complete habits for 30 consecutive days', icon: '👑', rarity: 'rare', xp: 500, fc: 100, category: 'habit_hero', requirement_type: 'habit_streak', requirement_value: 30 },
  { id: 'habit_completion_90', name: 'Consistency King', desc: 'Maintain 90%+ completion for 30 days', icon: '⭐', rarity: 'epic', xp: 750, fc: 150, category: 'habit_hero', requirement_type: 'habit_completion_rate', requirement_value: 90 },
  { id: 'habit_streak_100', name: 'Century Champion', desc: 'Complete habits for 100 consecutive days', icon: '💯', rarity: 'legendary', xp: 2000, fc: 400, category: 'habit_hero', requirement_type: 'habit_streak', requirement_value: 100 },
  
  // Study Sage
  { id: 'study_hours_10', name: 'Study Starter', desc: 'Log 10 hours of study time', icon: '📚', rarity: 'common', xp: 150, fc: 30, category: 'study_sage', requirement_type: 'study_hours', requirement_value: 10 },
  { id: 'study_hours_50', name: 'Exam Crusher', desc: 'Log 50 hours of study time', icon: '🎯', rarity: 'rare', xp: 600, fc: 120, category: 'study_sage', requirement_type: 'study_hours', requirement_value: 50 },
  { id: 'study_hours_100', name: 'IB Warrior', desc: 'Log 100 hours of study time', icon: '⚔️', rarity: 'legendary', xp: 1000, fc: 250, category: 'study_sage', requirement_type: 'study_hours', requirement_value: 100 },
  { id: 'study_sessions_50', name: 'Consistent Scholar', desc: 'Complete 50 study sessions', icon: '📖', rarity: 'rare', xp: 400, fc: 80, category: 'study_sage', requirement_type: 'study_sessions', requirement_value: 50 },
  { id: 'deep_focus', name: 'Deep Focus', desc: 'Complete a 180+ minute study session', icon: '🧠', rarity: 'epic', xp: 500, fc: 100, category: 'study_sage', requirement_type: 'study_session_duration', requirement_value: 180 },
  
  // Running Legend
  { id: 'first_5k', name: 'First 5K', desc: 'Run 5 kilometers in one session', icon: '🏃', rarity: 'common', xp: 100, fc: 20, category: 'running_legend', requirement_type: 'single_run_distance', requirement_value: 5 },
  { id: 'total_100k', name: 'Century Runner', desc: 'Run 100km total distance', icon: '🏃♂️', rarity: 'rare', xp: 800, fc: 160, category: 'running_legend', requirement_type: 'total_distance', requirement_value: 100 },
  { id: 'speed_demon', name: 'Speed Demon', desc: 'Achieve sub-5:00/km pace', icon: '⚡', rarity: 'epic', xp: 400, fc: 80, category: 'running_legend', requirement_type: 'running_pace', requirement_value: 5.0 },
  { id: 'weekly_runner', name: 'Weekly Warrior', desc: 'Run 4+ times in one week', icon: '👟', rarity: 'rare', xp: 500, fc: 100, category: 'running_legend', requirement_type: 'weekly_runs', requirement_value: 4 },
  { id: 'half_marathon', name: 'Half Marathon Hero', desc: 'Run 21+ km in one session', icon: '🎖️', rarity: 'epic', xp: 600, fc: 120, category: 'running_legend', requirement_type: 'single_run_distance', requirement_value: 21 },
  
  // Journal Journey
  { id: 'journal_entries_30', name: 'Reflection Master', desc: 'Write 30 journal entries', icon: '📖', rarity: 'rare', xp: 400, fc: 80, category: 'journal_journey', requirement_type: 'journal_entries', requirement_value: 30 },
  { id: 'gratitude_100', name: 'Gratitude Guru', desc: 'Log gratitude for 100 days', icon: '🙏', rarity: 'epic', xp: 600, fc: 120, category: 'journal_journey', requirement_type: 'gratitude_days', requirement_value: 100 },
  { id: 'journal_365', name: 'Year Complete', desc: 'Write 365 journal entries', icon: '🎉', rarity: 'legendary', xp: 2000, fc: 500, category: 'journal_journey', requirement_type: 'journal_entries', requirement_value: 365 },
  { id: 'voice_notes_50', name: 'Voice Recorder', desc: 'Record 50 voice notes', icon: '🎤', rarity: 'common', xp: 200, fc: 40, category: 'journal_journey', requirement_type: 'voice_notes', requirement_value: 50 },
  { id: 'photos_100', name: 'Photo Journalist', desc: 'Upload 100 photos', icon: '📷', rarity: 'rare', xp: 300, fc: 60, category: 'journal_journey', requirement_type: 'photos', requirement_value: 100 },
  
  // Sleep Master
  { id: 'sleep_streak_7', name: 'Sleep Champion', desc: 'Get 7+ hours of sleep for 7 consecutive nights', icon: '😴', rarity: 'common', xp: 150, fc: 30, category: 'sleep_master', requirement_type: 'sleep_hours_streak', requirement_value: 7 },
  { id: 'sleep_streak_30', name: 'Sleep Optimizer', desc: 'Get 7+ hours of sleep for 30 consecutive nights', icon: '✨', rarity: 'epic', xp: 700, fc: 140, category: 'sleep_master', requirement_type: 'sleep_hours_streak', requirement_value: 30 },
  { id: 'excellent_sleep_30', name: 'Quality Sleeper', desc: 'Log 30 nights of excellent sleep quality', icon: '🐦', rarity: 'rare', xp: 400, fc: 80, category: 'sleep_master', requirement_type: 'sleep_quality_nights', requirement_value: 30 },
  { id: 'excellent_sleep_100', name: 'Sleep Master', desc: 'Log 100 nights of excellent sleep quality', icon: '⏰', rarity: 'legendary', xp: 1200, fc: 240, category: 'sleep_master', requirement_type: 'sleep_quality_nights', requirement_value: 100 },
  
  // Advanced
  { id: 'total_500k', name: 'Distance Demon', desc: 'Run 500km total distance', icon: '👹', rarity: 'legendary', xp: 2500, fc: 500, category: 'running_legend', requirement_type: 'total_distance', requirement_value: 500 },
  { id: 'study_hours_200', name: 'Academic Excellence', desc: 'Log 200 hours of study', icon: '🎓', rarity: 'legendary', xp: 2000, fc: 400, category: 'study_sage', requirement_type: 'study_hours', requirement_value: 200 },
  { id: 'journal_100', name: 'Dedicated Journaler', desc: 'Write 100 journal entries', icon: '✍️', rarity: 'epic', xp: 800, fc: 160, category: 'journal_journey', requirement_type: 'journal_entries', requirement_value: 100 },
];

const shopItems = [
  // Themes
  { id: 'dark_forest', name: 'Dark Forest Theme', category: 'themes', price: 500, icon: '🌲', desc: 'Beautiful forest-inspired dark theme', effect_type: 'theme' },
  { id: 'ocean_waves', name: 'Ocean Waves Theme', category: 'themes', price: 500, icon: '🌊', desc: 'Calming ocean-inspired theme', effect_type: 'theme' },
  { id: 'sunset_glow', name: 'Sunset Glow Theme', category: 'themes', price: 500, icon: '🌅', desc: 'Warm sunset colors theme', effect_type: 'theme' },
  { id: 'midnight_purple', name: 'Midnight Purple Theme', category: 'themes', price: 600, icon: '🌌', desc: 'Deep purple cosmic theme', effect_type: 'theme' },
  { id: 'cherry_blossom', name: 'Cherry Blossom Theme', category: 'themes', price: 600, icon: '🌸', desc: 'Soft pink spring theme', effect_type: 'theme' },
  
  // Whiteboard
  { id: 'neon_brushes', name: 'Neon Brush Pack', category: 'whiteboard', price: 300, icon: '💎', desc: 'Glowing neon brushes for whiteboard', effect_type: 'brush_pack' },
  { id: 'watercolor_brushes', name: 'Watercolor Brushes', category: 'whiteboard', price: 350, icon: '🎨', desc: 'Artistic watercolor effects', effect_type: 'brush_pack' },
  { id: 'sticker_pack_1', name: 'Sticker Pack: Emotions', category: 'whiteboard', price: 200, icon: '😊', desc: '50+ emotion stickers', effect_type: 'sticker_pack' },
  { id: 'shape_templates', name: 'Advanced Shape Templates', category: 'whiteboard', price: 400, icon: '📐', desc: 'Pre-made diagrams and flowcharts', effect_type: 'template' },
  
  // Journal
  { id: 'travel_template', name: 'Travel Journal Template', category: 'journal', price: 250, icon: '🧳', desc: 'Beautiful template for travel journaling', effect_type: 'template' },
  { id: 'gratitude_template', name: 'Gratitude Template', category: 'journal', price: 200, icon: '🙏', desc: 'Structured gratitude prompts', effect_type: 'template' },
  { id: 'dream_journal', name: 'Dream Journal Template', category: 'journal', price: 250, icon: '💭', desc: 'Track and analyze your dreams', effect_type: 'template' },
  { id: 'font_pack_elegant', name: 'Elegant Font Pack', category: 'journal', price: 300, icon: '✒️', desc: 'Premium serif fonts', effect_type: 'font_pack' },
  
  // Study
  { id: 'flashcard_generator', name: 'Flashcard Generator Pro', category: 'study', price: 400, icon: '📇', desc: 'Auto-generate flashcards from notes', effect_type: 'tool' },
  { id: 'exam_simulator', name: 'Exam Simulator', category: 'study', price: 500, icon: '📝', desc: 'Practice with timed mock exams', effect_type: 'tool' },
  { id: 'study_music', name: 'Focus Music Pack', category: 'study', price: 250, icon: '🎵', desc: 'Curated study playlists', effect_type: 'music' },
  
  // Utility
  { id: 'xp_booster_1day', name: 'XP Booster (24h)', category: 'utility', price: 200, icon: '🚀', desc: 'Earn 2x XP for 24 hours', effect_type: 'xp_booster', consumable: true, duration: 24 },
  { id: 'xp_booster_3day', name: 'XP Booster (3 days)', category: 'utility', price: 500, icon: '🚀', desc: 'Earn 2x XP for 3 days', effect_type: 'xp_booster', consumable: true, duration: 72 },
  { id: 'fc_multiplier', name: 'FC Multiplier (24h)', category: 'utility', price: 250, icon: '💰', desc: '1.5x FC earnings for 24 hours', effect_type: 'fc_multiplier', consumable: true, duration: 24 },
  { id: 'streak_freeze', name: 'Streak Freeze', category: 'utility', price: 150, icon: '❄️', desc: 'Save your streak if you miss a day', effect_type: 'streak_freeze', consumable: true },
  { id: 'undo_token', name: 'Undo Token', category: 'utility', price: 100, icon: '⏪', desc: 'Undo accidental deletion', effect_type: 'undo', consumable: true },
  
  // Customization
  { id: 'custom_backgrounds', name: 'Custom Backgrounds', category: 'customization', price: 400, icon: '🖼️', desc: 'Upload your own backgrounds', effect_type: 'background' },
  { id: 'icon_pack_animals', name: 'Icon Pack: Animals', category: 'customization', price: 200, icon: '🦁', desc: '30+ animal icons for habits', effect_type: 'icon_pack' },
  { id: 'icon_pack_sports', name: 'Icon Pack: Sports', category: 'customization', price: 200, icon: '⚽', desc: '30+ sports icons', effect_type: 'icon_pack' },
  { id: 'celebration_pack', name: 'Premium Celebrations', category: 'customization', price: 300, icon: '🎊', desc: 'Enhanced animations and sounds', effect_type: 'celebration' },
];

const rarityColors = {
  common: 'from-slate-500 to-slate-600',
  rare: 'from-blue-500 to-indigo-600',
  epic: 'from-purple-500 to-pink-600',
  legendary: 'from-amber-500 to-orange-600',
  limited: 'from-rose-500 to-pink-600',
};

export default function Rewards() {
  const { gamificationUser, purchaseItem } = useGamification();
  const { checkAndUpdateAchievements } = useAchievementProgress();
  const queryClient = useQueryClient();
  const [filter, setFilter] = useState('all');
  const [shopFilter, setShopFilter] = useState('all');
  const [showCustomDialog, setShowCustomDialog] = useState(false);
  const [customAchievement, setCustomAchievement] = useState({
    name: '',
    description: '',
    icon: '🏆',
    rarity: 'common',
    xp_reward: 100,
    fc_reward: 20,
    category: 'custom',
    requirement_value: 1,
  });

  const { data: dbAchievements = [] } = useQuery({
    queryKey: ['achievements'],
    queryFn: () => db.entities.Achievement.list(),
  });

  const { data: progressRecords = [] } = useQuery({
    queryKey: ['user-achievement-progress'],
    queryFn: () => db.entities.UserAchievementProgress.list(),
  });

  const { data: inventory = [] } = useQuery({
    queryKey: ['inventory'],
    queryFn: () => db.entities.UserInventory.list(),
  });

  const toggleItemMutation = useMutation({
    mutationFn: ({ id, active }) => db.entities.UserInventory.update(id, { active }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['inventory'] });
      toast.success('Theme updated!');
    },
  });

  const createAchievementMutation = useMutation({
    mutationFn: (data) => db.entities.Achievement.create({
      ...data,
      achievement_key: `custom_${Date.now()}`,
      custom: true,
      requirement_type: 'manual',
    }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['achievements'] });
      setShowCustomDialog(false);
      setCustomAchievement({
        name: '',
        description: '',
        icon: '🏆',
        rarity: 'common',
        xp_reward: 100,
        fc_reward: 20,
        category: 'custom',
        requirement_value: 1,
      });
      toast.success('Custom achievement created!');
    },
  });

  const updateAchievementMutation = useMutation({
    mutationFn: ({ id, data }) => db.entities.Achievement.update(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['achievements'] });
      toast.success('Achievement updated!');
      setShowCustomDialog(false);
    },
  });

  const deleteAchievementMutation = useMutation({
    mutationFn: (id) => db.entities.Achievement.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['achievements'] });
      toast.success('Achievement deleted!');
    },
  });

  useEffect(() => {
    const updateAchievements = async () => {
      await checkAndUpdateAchievements('all', {});
      queryClient.invalidateQueries({ queryKey: ['achievements'] });
      queryClient.invalidateQueries({ queryKey: ['user-achievement-progress'] });
    };
    updateAchievements();
    
    const interval = setInterval(updateAchievements, 30000);
    return () => clearInterval(interval);
  }, []);

  const unlockedIds = gamificationUser?.unlocked_achievements || [];
  const progressMap = progressRecords.reduce((acc, p) => {
    acc[p.achievement_key] = p;
    return acc;
  }, {});

  const allAchievements = [
    ...defaultAchievements.map(a => {
      const progress = progressMap[a.id];
      return {
        ...a,
        unlocked: unlockedIds.includes(a.id),
        progress: progress ? Math.round((progress.current_progress / a.requirement_value) * 100) : 0,
        current_progress: progress?.current_progress || 0,
      };
    }),
    ...dbAchievements.map(a => {
      const progress = progressMap[a.achievement_key];
      return {
        ...a,
        id: a.achievement_key,
        unlocked: unlockedIds.includes(a.achievement_key),
        progress: progress ? Math.round((progress.current_progress / (a.requirement_value || 1)) * 100) : 0,
        current_progress: progress?.current_progress || 0,
      };
    })
  ];

  const filteredAchievements = filter === 'all' 
    ? allAchievements 
    : filter === 'unlocked'
    ? allAchievements.filter(a => a.unlocked)
    : allAchievements.filter(a => !a.unlocked);

  const userCoins = gamificationUser?.focus_coins || 0;
  const purchasedItemIds = inventory.map(i => i.item_id);

  const filteredShopItems = shopFilter === 'all' 
    ? shopItems 
    : shopItems.filter(item => item.category === shopFilter);

  const ownedItems = shopItems.filter(item => purchasedItemIds.includes(item.id));

  const handlePurchase = async (item) => {
    if (purchasedItemIds.includes(item.id)) {
      toast.error('Already purchased!');
      return;
    }
    
    if (userCoins >= item.price) {
      try {
        await purchaseItem({ itemId: item.id, price: item.price });
        
        await db.entities.UserInventory.create({
          item_id: item.id,
          quantity: item.consumable ? 1 : 1,
          active: false,
        });
        
        queryClient.invalidateQueries({ queryKey: ['inventory'] });
        toast.success(`Purchased ${item.name}! ✨`);
      } catch (error) {
        toast.error('Purchase failed');
      }
    } else {
      toast.error(`Need ${item.price - userCoins} more FC!`);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950 p-4 md:p-8">
      <div className="max-w-7xl mx-auto">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-3xl font-bold text-white flex items-center gap-3 mb-2">
              <Trophy className="w-8 h-8 text-amber-400" />
              Achievements & Shop
            </h1>
            <p className="text-slate-400">Unlock achievements and spend your rewards</p>
          </div>
          <div className="text-right">
            <div className="text-sm text-slate-400 mb-1">Balance</div>
            <div className="text-2xl font-bold text-amber-400 flex items-center gap-2">
              {userCoins} 🟡
            </div>
          </div>
        </div>

        <Tabs defaultValue="achievements" className="w-full">
          <TabsList className="bg-slate-800/50 border border-slate-700/50 mb-6">
            <TabsTrigger value="achievements" className="data-[state=active]:bg-purple-500">
              <Trophy className="w-4 h-4 mr-2" />
              Achievements
            </TabsTrigger>
            <TabsTrigger value="shop" className="data-[state=active]:bg-amber-500">
              <ShoppingBag className="w-4 h-4 mr-2" />
              Shop
            </TabsTrigger>
            <TabsTrigger value="inventory" className="data-[state=active]:bg-teal-500">
              <Package className="w-4 h-4 mr-2" />
              Inventory ({ownedItems.length})
            </TabsTrigger>
          </TabsList>

          {/* ACHIEVEMENTS TAB */}
          <TabsContent value="achievements">
            <div className="flex items-center justify-between mb-6">
              <Tabs value={filter} onValueChange={setFilter} className="w-full">
                <TabsList className="bg-slate-800/50 border border-slate-700/50">
                  <TabsTrigger value="all" className="data-[state=active]:bg-purple-500">All ({allAchievements.length})</TabsTrigger>
                  <TabsTrigger value="unlocked" className="data-[state=active]:bg-purple-500">Unlocked ({allAchievements.filter(a => a.unlocked).length})</TabsTrigger>
                  <TabsTrigger value="locked" className="data-[state=active]:bg-purple-500">In Progress ({allAchievements.filter(a => !a.unlocked).length})</TabsTrigger>
                </TabsList>
              </Tabs>
              <Button
                onClick={() => setShowCustomDialog(true)}
                className="bg-gradient-to-r from-purple-500 to-pink-500 gap-2 ml-4"
              >
                <Plus className="w-4 h-4" />
                Create
              </Button>
            </div>

            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
              {filteredAchievements.map((achievement, index) => (
                <motion.div
                  key={achievement.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.05 }}
                  className={`rounded-xl bg-gradient-to-br ${rarityColors[achievement.rarity]} p-0.5 ${
                    !achievement.unlocked && 'opacity-70'
                  }`}
                >
                  <div className="bg-slate-900 rounded-xl p-6 h-full relative">
                    {achievement.custom && (
                      <div className="absolute top-2 right-2 flex gap-1">
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            setCustomAchievement({
                              ...achievement,
                              name: achievement.name,
                              description: achievement.description || achievement.desc,
                            });
                            setShowCustomDialog(true);
                          }}
                          className="p-1 rounded hover:bg-slate-800 text-slate-400 hover:text-slate-200"
                          title="Edit"
                        >
                          ✏️
                        </button>
                        <button
                          onClick={async (e) => {
                            e.stopPropagation();
                            if (confirm('Delete this achievement?')) {
                              await deleteAchievementMutation.mutateAsync(achievement.id);
                            }
                          }}
                          className="p-1 rounded hover:bg-slate-800 text-slate-400 hover:text-rose-400"
                          title="Delete"
                        >
                          🗑️
                        </button>
                      </div>
                    )}
                    <div className="flex items-start justify-between mb-4">
                      <div className="text-4xl">{achievement.icon}</div>
                      {achievement.unlocked ? (
                        <Award className="w-6 h-6 text-amber-400" />
                      ) : (
                        <Lock className="w-6 h-6 text-slate-600" />
                      )}
                    </div>
                    
                    <h3 className="text-lg font-bold text-white mb-2">{achievement.name}</h3>
                    <p className="text-sm text-slate-400 mb-4">{achievement.desc || achievement.description}</p>
                    
                    {!achievement.unlocked && (
                      <div className="mb-4">
                        <div className="flex justify-between text-xs text-slate-400 mb-1">
                          <span>Progress</span>
                          <span>{achievement.current_progress || 0} / {achievement.requirement_value || 1}</span>
                          <span>{achievement.progress}%</span>
                        </div>
                        <div className="h-2 bg-slate-800 rounded-full overflow-hidden">
                          <div 
                            className="h-full bg-gradient-to-r from-purple-500 to-pink-500 transition-all duration-500"
                            style={{ width: `${Math.min(achievement.progress, 100)}%` }}
                          />
                        </div>
                      </div>
                    )}
                    
                    <div className="flex items-center gap-3 text-sm">
                      <span className="text-purple-300">+{achievement.xp || achievement.xp_reward} XP</span>
                      <span className="text-amber-300">+{achievement.fc || achievement.fc_reward} FC</span>
                      <span className={`ml-auto px-2 py-0.5 rounded-full text-xs capitalize ${
                        achievement.rarity === 'common' ? 'bg-slate-700 text-slate-300' :
                        achievement.rarity === 'rare' ? 'bg-blue-900/50 text-blue-300' :
                        achievement.rarity === 'epic' ? 'bg-purple-900/50 text-purple-300' :
                        'bg-amber-900/50 text-amber-300'
                      }`}>
                        {achievement.rarity}
                      </span>
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>
          </TabsContent>

          {/* SHOP TAB */}
          <TabsContent value="shop">
            <Tabs value={shopFilter} onValueChange={setShopFilter} className="w-full">
              <TabsList className="bg-slate-800/50 border border-slate-700/50 mb-6">
                <TabsTrigger value="all" className="data-[state=active]:bg-teal-500">All</TabsTrigger>
                <TabsTrigger value="themes" className="data-[state=active]:bg-teal-500">Themes</TabsTrigger>
                <TabsTrigger value="utility" className="data-[state=active]:bg-teal-500">Utility</TabsTrigger>
              </TabsList>

              <TabsContent value={shopFilter}>
                <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {filteredShopItems.map((item, index) => {
                    const isPurchased = purchasedItemIds.includes(item.id);
                    return (
                      <motion.div
                        key={item.id}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: index * 0.05 }}
                        className={`rounded-xl border p-6 transition-all ${
                          isPurchased ? 'border-emerald-500/30 bg-emerald-500/5' : 'bg-slate-800/30 border-slate-700/50 hover:border-amber-500/30'
                        }`}
                      >
                        <div className="text-5xl mb-4 text-center">{item.icon}</div>
                        
                        <h3 className="text-lg font-bold text-white mb-2 text-center">{item.name}</h3>
                        <p className="text-sm text-slate-400 mb-4 text-center min-h-[40px]">{item.desc}</p>
                        
                        {item.consumable && (
                          <div className="text-xs text-amber-400 text-center mb-2">
                            ⏱️ Consumable • {item.duration}h duration
                          </div>
                        )}
                        
                        <div className="flex items-center justify-between">
                          <div className="text-xl font-bold text-amber-400 flex items-center gap-1">
                            {item.price} 🟡
                          </div>
                          {isPurchased ? (
                            <div className="flex items-center gap-2 text-emerald-400 text-sm">
                              <Check className="w-4 h-4" />
                              Owned
                            </div>
                          ) : (
                            <Button
                              onClick={() => handlePurchase(item)}
                              disabled={userCoins < item.price}
                              className="bg-gradient-to-r from-amber-500 to-orange-500 disabled:opacity-50"
                              size="sm"
                            >
                              {userCoins >= item.price ? 'Buy' : `Need ${item.price - userCoins}`}
                            </Button>
                          )}
                        </div>
                      </motion.div>
                    );
                  })}
                </div>
              </TabsContent>
            </Tabs>
          </TabsContent>

          {/* INVENTORY TAB */}
          <TabsContent value="inventory">
            <div className="space-y-6">
              <div>
                <h3 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
                  🎨 Themes
                </h3>
                <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {inventory.filter(inv => {
                    const item = shopItems.find(s => s.id === inv.item_id);
                    return item?.effect_type === 'theme';
                  }).map((inv) => {
                    const item = shopItems.find(s => s.id === inv.item_id);
                    if (!item) return null;
                    
                    return (
                      <div key={inv.id} className={`rounded-xl border p-6 transition-all ${
                        inv.active ? 'bg-gradient-to-br from-amber-500/20 to-orange-500/20 border-amber-500/50' : 'bg-slate-800/30 border-slate-700/50'
                      }`}>
                        <div className="flex items-center justify-between mb-4">
                          <div className="text-4xl">{item.icon}</div>
                          <Switch
                            checked={inv.active}
                            onCheckedChange={async (checked) => {
                              inventory.forEach(async (otherInv) => {
                                const otherItem = shopItems.find(s => s.id === otherInv.item_id);
                                if (otherItem?.effect_type === 'theme' && otherInv.active && otherInv.id !== inv.id) {
                                  await db.entities.UserInventory.update(otherInv.id, { active: false });
                                }
                              });
                              
                              toggleItemMutation.mutate({ id: inv.id, active: checked });
                            }}
                          />
                        </div>
                        <h4 className="font-bold text-white mb-1">{item.name}</h4>
                        <p className="text-sm text-slate-400">{item.desc}</p>
                        {inv.active && (
                          <div className="mt-3 px-2 py-1 rounded-full bg-emerald-500/20 text-emerald-400 text-xs text-center">
                            ✓ Active
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              </div>

              <div>
                <h3 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
                  ⚡ Consumables & Items
                </h3>
                <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {inventory.filter(inv => {
                    const item = shopItems.find(s => s.id === inv.item_id);
                    return item && item.effect_type !== 'theme';
                  }).map((inv) => {
                    const item = shopItems.find(s => s.id === inv.item_id);
                    if (!item) return null;
                    
                    return (
                      <div key={inv.id} className="rounded-xl bg-slate-800/30 border border-slate-700/50 p-6">
                        <div className="text-4xl mb-4 text-center">{item.icon}</div>
                        <h4 className="font-bold text-white mb-1 text-center">{item.name}</h4>
                        <p className="text-sm text-slate-400 text-center">{item.desc}</p>
                        {item.consumable && (
                          <div className="mt-4 text-center">
                            <div className="text-sm text-slate-500 mb-2">Qty: {inv.quantity || 1}</div>
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              </div>

              {ownedItems.length === 0 && (
                <div className="text-center py-12">
                  <Package className="w-16 h-16 mx-auto text-slate-600 mb-4" />
                  <p className="text-slate-500">Your inventory is empty</p>
                </div>
              )}
            </div>
          </TabsContent>
        </Tabs>
      </div>

      {/* Custom Achievement Dialog */}
      <Dialog open={showCustomDialog} onOpenChange={(open) => {
        setShowCustomDialog(open);
        if (!open) {
          setCustomAchievement({
            name: '',
            description: '',
            icon: '🏆',
            rarity: 'common',
            xp_reward: 100,
            fc_reward: 20,
            category: 'custom',
            requirement_value: 1,
          });
        }
      }}>
        <DialogContent className="bg-slate-900 border-slate-700 text-white max-w-lg">
          <DialogHeader>
            <DialogTitle>{customAchievement.id ? 'Edit' : 'Create'} Custom Achievement</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div>
              <Label className="text-slate-400">Achievement Name</Label>
              <Input
                value={customAchievement.name}
                onChange={(e) => setCustomAchievement({ ...customAchievement, name: e.target.value })}
                placeholder="e.g., Meditation Master"
                className="bg-slate-800 border-slate-700 text-white"
              />
            </div>

            <div>
              <Label className="text-slate-400">Description</Label>
              <Textarea
                value={customAchievement.description}
                onChange={(e) => setCustomAchievement({ ...customAchievement, description: e.target.value })}
                placeholder="e.g., Meditate for 30 days straight"
                className="bg-slate-800 border-slate-700 text-white"
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label className="text-slate-400">Icon (emoji)</Label>
                <Input
                  value={customAchievement.icon}
                  onChange={(e) => setCustomAchievement({ ...customAchievement, icon: e.target.value })}
                  placeholder="🏆"
                  maxLength={2}
                  className="bg-slate-800 border-slate-700 text-white text-2xl text-center"
                />
              </div>

              <div>
                <Label className="text-slate-400">Rarity</Label>
                <Select
                  value={customAchievement.rarity}
                  onValueChange={(value) => setCustomAchievement({ ...customAchievement, rarity: value })}
                >
                  <SelectTrigger className="bg-slate-800 border-slate-700 text-white">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="common">Common</SelectItem>
                    <SelectItem value="rare">Rare</SelectItem>
                    <SelectItem value="epic">Epic</SelectItem>
                    <SelectItem value="legendary">Legendary</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label className="text-slate-400">XP Reward</Label>
                <Input
                  type="number"
                  value={customAchievement.xp_reward}
                  onChange={(e) => setCustomAchievement({ ...customAchievement, xp_reward: parseInt(e.target.value) })}
                  min={10}
                  max={5000}
                  className="bg-slate-800 border-slate-700 text-white"
                />
              </div>

              <div>
                <Label className="text-slate-400">FC Reward</Label>
                <Input
                  type="number"
                  value={customAchievement.fc_reward}
                  onChange={(e) => setCustomAchievement({ ...customAchievement, fc_reward: parseInt(e.target.value) })}
                  min={5}
                  max={1000}
                  className="bg-slate-800 border-slate-700 text-white"
                />
              </div>
            </div>

            <div>
              <Label className="text-slate-400">Target Value</Label>
              <Input
                type="number"
                value={customAchievement.requirement_value}
                onChange={(e) => setCustomAchievement({ ...customAchievement, requirement_value: parseInt(e.target.value) })}
                min={1}
                className="bg-slate-800 border-slate-700 text-white"
              />
            </div>

            <div className="flex gap-2">
              <Button
                onClick={() => setShowCustomDialog(false)}
                variant="outline"
                className="flex-1"
              >
                Cancel
              </Button>
              <Button
                onClick={() => {
                  if (customAchievement.id) {
                    updateAchievementMutation.mutate({
                      id: customAchievement.id,
                      data: {
                        name: customAchievement.name,
                        description: customAchievement.description,
                        icon: customAchievement.icon,
                        rarity: customAchievement.rarity,
                        xp_reward: customAchievement.xp_reward,
                        fc_reward: customAchievement.fc_reward,
                        requirement_value: customAchievement.requirement_value,
                      }
                    });
                  } else {
                    createAchievementMutation.mutate(customAchievement);
                  }
                }}
                className="flex-1 bg-gradient-to-r from-purple-500 to-pink-500"
                disabled={!customAchievement.name || !customAchievement.description}
              >
                {customAchievement.id ? 'Update' : 'Create'} Achievement
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}