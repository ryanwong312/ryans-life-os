const db = globalThis.__B44_DB__ || { auth:{ isAuthenticated: async()=>false, me: async()=>null }, entities:new Proxy({}, { get:()=>({ filter:async()=>[], get:async()=>null, create:async()=>({}), update:async()=>({}), delete:async()=>({}) }) }), integrations:{ Core:{ UploadFile:async()=>({ file_url:'' }) } } };

import { useEffect } from 'react';
import { useQueryClient } from '@tanstack/react-query';

import { useGamification } from './useGamification';

export function useAchievementProgress() {
  const queryClient = useQueryClient();
  const { awardXP, unlockAchievement } = useGamification();

  const checkAndUpdateAchievements = async (activityType, activityData) => {
    try {
      const [achievements, progressRecords, habits, workouts, studySessions, days, habitLogs] = await Promise.all([
        db.entities.Achievement.list(),
        db.entities.UserAchievementProgress.list(),
        db.entities.Habit.list(),
        db.entities.Workout.list('-date', 500),
        db.entities.StudySession.list('-date', 500),
        db.entities.Day.list('-date', 365),
        db.entities.HabitLog.list('-date', 365),
      ]);

      const progressMap = progressRecords.reduce((acc, p) => {
        acc[p.achievement_key] = p;
        return acc;
      }, {});

      const updates = [];

      for (const achievement of achievements) {
        const progress = progressMap[achievement.achievement_key];
        const currentProgress = progress?.current_progress || 0;
        let newProgress = currentProgress;

        // Calculate progress based on achievement type
        switch (achievement.requirement_type) {
          case 'habit_streak':
            newProgress = calculateHabitStreak(habitLogs, habits);
            break;
          case 'habit_completion_rate':
            newProgress = calculateHabitCompletionRate(habitLogs, habits, achievement.requirement_value);
            break;
          case 'total_distance':
            newProgress = workouts.reduce((sum, w) => sum + (w.actual_distance_km || 0), 0);
            break;
          case 'study_hours':
            newProgress = studySessions.reduce((sum, s) => sum + (s.duration_minutes || 0), 0) / 60;
            break;
          case 'study_sessions':
            newProgress = studySessions.length;
            break;
          case 'journal_entries':
            newProgress = days.filter(d => d.journal_content).length;
            break;
          case 'gratitude_days':
            newProgress = days.filter(d => d.gratitude_1 && d.gratitude_2 && d.gratitude_3).length;
            break;
          case 'sleep_quality_nights':
            newProgress = days.filter(d => d.sleep_quality === 'excellent').length;
            break;
          case 'sleep_hours_streak':
            newProgress = calculateSleepStreak(days, 7);
            break;
          case 'single_run_distance':
            newProgress = Math.max(...workouts.map(w => w.actual_distance_km || 0), 0);
            break;
          case 'running_pace':
            const validPaces = workouts.filter(w => w.pace_min_km).map(w => w.pace_min_km);
            newProgress = validPaces.length > 0 ? Math.min(...validPaces) : 0;
            break;
          case 'weekly_runs':
            newProgress = calculateWeeklyRuns(workouts);
            break;
          case 'study_session_duration':
            newProgress = Math.max(...studySessions.map(s => s.duration_minutes || 0), 0);
            break;
          case 'voice_notes':
            newProgress = days.reduce((sum, d) => sum + (d.voice_notes?.length || 0), 0);
            break;
          case 'photos':
            newProgress = days.reduce((sum, d) => sum + (d.photos?.length || 0), 0);
            break;
          default:
            continue;
        }

        if (newProgress > currentProgress) {
          const completed = newProgress >= (achievement.requirement_value || 1);
          const justCompleted = !progress?.completed && completed;

          if (progress) {
            await db.entities.UserAchievementProgress.update(progress.id, {
              current_progress: newProgress,
              completed,
              completed_at: justCompleted ? new Date().toISOString() : progress.completed_at,
              last_updated: new Date().toISOString(),
            });
          } else {
            await db.entities.UserAchievementProgress.create({
              achievement_key: achievement.achievement_key,
              current_progress: newProgress,
              target_value: achievement.requirement_value,
              completed,
              completed_at: justCompleted ? new Date().toISOString() : null,
              last_updated: new Date().toISOString(),
            });
          }

          if (justCompleted) {
            await unlockAchievement({
              achievementId: achievement.achievement_key,
              xp: achievement.xp_reward,
              fc: achievement.fc_reward,
            });
          }

          updates.push({
            achievement,
            newProgress,
            justCompleted,
          });
        }
      }

      if (updates.length > 0) {
        queryClient.invalidateQueries({ queryKey: ['achievements'] });
        queryClient.invalidateQueries({ queryKey: ['user-achievement-progress'] });
      }

      return updates;
    } catch (error) {
      console.error('Achievement progress check failed:', error);
      return [];
    }
  };

  return { checkAndUpdateAchievements };
}

function calculateHabitStreak(habitLogs, habits) {
  if (habitLogs.length === 0) return 0;
  
  const sortedLogs = [...habitLogs].sort((a, b) => new Date(b.date) - new Date(a.date));
  const today = new Date().toISOString().split('T')[0];
  
  let streak = 0;
  let currentDate = new Date(today);
  
  for (let i = 0; i < 365; i++) {
    const dateStr = currentDate.toISOString().split('T')[0];
    const dayLogs = sortedLogs.filter(l => l.date === dateStr && l.completed);
    
    if (dayLogs.length > 0) {
      streak++;
      currentDate.setDate(currentDate.getDate() - 1);
    } else if (i > 0) {
      break;
    } else {
      currentDate.setDate(currentDate.getDate() - 1);
    }
  }
  
  return streak;
}

function calculateHabitCompletionRate(habitLogs, habits, days) {
  const startDate = new Date();
  startDate.setDate(startDate.getDate() - days);
  const startDateStr = startDate.toISOString().split('T')[0];
  
  const recentLogs = habitLogs.filter(l => l.date >= startDateStr);
  const completedCount = recentLogs.filter(l => l.completed).length;
  const totalPossible = habits.length * days;
  
  return totalPossible > 0 ? Math.round((completedCount / totalPossible) * 100) : 0;
}

function calculateSleepStreak(days, minHours) {
  const sortedDays = [...days].sort((a, b) => new Date(b.date) - new Date(a.date));
  let streak = 0;
  
  for (const day of sortedDays) {
    if ((day.sleep_hours || 0) >= minHours) {
      streak++;
    } else if (streak > 0) {
      break;
    }
  }
  
  return streak;
}

function calculateWeeklyRuns(workouts) {
  const oneWeekAgo = new Date();
  oneWeekAgo.setDate(oneWeekAgo.getDate() - 7);
  const weekStartStr = oneWeekAgo.toISOString().split('T')[0];
  
  return workouts.filter(w => w.date >= weekStartStr && w.completed).length;
}

export default function AchievementProgressTracker() {
  return null;
}