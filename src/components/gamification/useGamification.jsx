const db = globalThis.__B44_DB__ || { auth:{ isAuthenticated: async()=>false, me: async()=>null }, entities:new Proxy({}, { get:()=>({ filter:async()=>[], get:async()=>null, create:async()=>({}), update:async()=>({}), delete:async()=>({}) }) }), integrations:{ Core:{ UploadFile:async()=>({ file_url:'' }) } } };

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';

import { format } from 'date-fns';

export function useGamification() {
  const queryClient = useQueryClient();

  const { data: gamificationUser } = useQuery({
    queryKey: ['gamification-user'],
    queryFn: async () => {
      const users = await db.entities.GamificationUser.list();
      if (users.length > 0) return users[0];
      
      // Create new gamification user
      return db.entities.GamificationUser.create({
        level: 1,
        experience_points: 0,
        focus_coins: 0,
        current_streak: 0,
        longest_streak: 0,
        last_active_date: format(new Date(), 'yyyy-MM-dd')
      });
    },
  });

  const awardXP = useMutation({
    mutationFn: async ({ xp, fc, source, description }) => {
      if (!gamificationUser) return;

      const newXP = (gamificationUser.experience_points || 0) + xp;
      const newFC = (gamificationUser.focus_coins || 0) + fc;
      
      // Calculate level
      const newLevel = Math.floor(Math.sqrt(newXP / 100)) + 1;
      const leveledUp = newLevel > (gamificationUser.level || 1);

      // Update gamification user
      await db.entities.GamificationUser.update(gamificationUser.id, {
        experience_points: newXP,
        focus_coins: newFC,
        level: newLevel,
        total_xp_earned: (gamificationUser.total_xp_earned || 0) + xp,
        total_fc_earned: (gamificationUser.total_fc_earned || 0) + fc,
      });

      // Log transaction
      await db.entities.XPTransaction.create({
        amount: xp,
        transaction_type: 'earned',
        source,
        description,
        balance_after: newXP,
      });

      return { leveledUp, newLevel };
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['gamification-user'] });
      queryClient.invalidateQueries({ queryKey: ['xp-transactions'] });
    },
  });

  const updateStreak = useMutation({
    mutationFn: async () => {
      if (!gamificationUser) return;

      const today = format(new Date(), 'yyyy-MM-dd');
      const lastActive = gamificationUser.last_active_date;
      
      let newStreak = 1;
      if (lastActive) {
        const daysDiff = Math.floor((new Date(today) - new Date(lastActive)) / (1000 * 60 * 60 * 24));
        if (daysDiff === 0) {
          return; // Already counted today
        } else if (daysDiff === 1) {
          newStreak = (gamificationUser.current_streak || 0) + 1;
        }
      }

      const longestStreak = Math.max(newStreak, gamificationUser.longest_streak || 0);

      await db.entities.GamificationUser.update(gamificationUser.id, {
        current_streak: newStreak,
        longest_streak: longestStreak,
        last_active_date: today,
      });

      return { newStreak, longestStreak };
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['gamification-user'] });
    },
  });

  const purchaseItem = useMutation({
    mutationFn: async ({ itemId, price }) => {
      if (!gamificationUser || gamificationUser.focus_coins < price) {
        throw new Error('Insufficient funds');
      }

      const newFC = gamificationUser.focus_coins - price;
      const purchased = [...(gamificationUser.purchased_items || []), itemId];

      await db.entities.GamificationUser.update(gamificationUser.id, {
        focus_coins: newFC,
        purchased_items: purchased,
      });

      // Log FC transaction
      await db.entities.XPTransaction.create({
        amount: -price,
        transaction_type: 'spent',
        source: 'shop_purchase',
        description: `Purchased: ${itemId}`,
        balance_after: newFC,
      });

      return { success: true };
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['gamification-user'] });
    },
  });

  const unlockAchievement = useMutation({
    mutationFn: async ({ achievementId, xp, fc }) => {
      if (!gamificationUser) return;

      // Check if already unlocked
      if (gamificationUser.unlocked_achievements?.includes(achievementId)) {
        return { success: false, already_unlocked: true };
      }

      const unlocked = [...(gamificationUser.unlocked_achievements || []), achievementId];

      await db.entities.GamificationUser.update(gamificationUser.id, {
        unlocked_achievements: unlocked,
      });

      // Award XP and FC
      await awardXP.mutateAsync({ xp, fc, source: `Achievement: ${achievementId}` });

      return { success: true };
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['gamification-user'] });
      queryClient.invalidateQueries({ queryKey: ['achievements'] });
    },
  });

  return {
    gamificationUser,
    awardXP: awardXP.mutateAsync,
    updateStreak: updateStreak.mutateAsync,
    purchaseItem: purchaseItem.mutateAsync,
    unlockAchievement: unlockAchievement.mutateAsync,
  };
}