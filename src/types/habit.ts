/**
 * Data types and interfaces for the Khuta habit tracking application.
 */

export type TimeOfDay = 'morning' | 'afternoon' | 'evening' | 'anytime';

export type FrequencyType = 'daily' | 'weekdays' | 'specific_days';

export type CompletionStatus = 'full' | 'minimum' | 'skipped' | 'none';

export interface GoalCategory {
  id: string;
  name: string;
  icon: string;
  color: string;
  description?: string;
}

export interface Habit {
  id: string;
  title: string;
  categoryId: string;
  targetDescription: string; // e.g. "قراءة 20 صفحة"
  minimumBaseline: string;   // e.g. "صفحة واحدة أو دقيقتين"
  timeOfDay: TimeOfDay;
  frequency: {
    type: FrequencyType;
    daysOfWeek?: number[]; // 0 = Sunday, 1 = Monday, ..., 6 = Saturday
  };
  cue?: string; // المحفز السلوكي: "بعد كوب القهوة" أو "بمجرد دخول البيت"
  isActive: boolean; // For pause/archive functionality
  createdAt: string; // ISO date string YYYY-MM-DD
  color?: string;
  icon?: string;
}

export interface HabitLog {
  id: string; // habitId_YYYY-MM-DD
  habitId: string;
  date: string; // YYYY-MM-DD
  status: CompletionStatus; // 'full' | 'minimum' | 'skipped'
  note?: string;
  completedAt?: string; // ISO timestamp
}

export interface DayProgress {
  date: string;
  formattedDate: string;
  dayName: string;
  totalHabits: number;
  completedFull: number;
  completedMinimum: number;
  skipped: number;
  missed: number;
  rate: number; // 0 to 100 percentage
}

export interface HabitStats {
  habitId: string;
  currentStreak: number;
  bestStreak: number;
  totalCompletions: number;
  totalFull: number;
  totalMinimum: number;
  rate30Days: number;
  lastCompletedDate?: string;
}

export interface OverallStats {
  totalActiveHabits: number;
  totalDaysLogged: number;
  currentWeekRate: number;
  previousWeekRate: number;
  weeklyDelta: number; // positive or negative percentage difference
  allTimeBestStreak: number;
  todayCompletedCount: number;
  todayTotalCount: number;
  todayRate: number;
}

export interface WeeklyInsight {
  mostConsistentHabit?: { habit: Habit; rate: number; streak: number };
  mostStruggledHabit?: { habit: Habit; rate: number; missedDaysCount: number };
  hardestDayOfWeek?: { dayName: string; completionRate: number };
  actionableRecommendation: string;
  summarySentence: string;
}
