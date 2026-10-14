import { Habit, HabitLog, HabitStats, DayProgress, OverallStats, WeeklyInsight } from '../types/habit';
import {
  toISODateString,
  shiftDate,
  getPastNDays,
  isHabitScheduledForDate,
  getDayOfWeekIndex,
  ARABIC_DAYS_FULL,
} from './dateUtils';

// Helper to get log for a habit on a specific date
export function getHabitLog(
  habitId: string,
  dateStr: string,
  logs: HabitLog[]
): HabitLog | undefined {
  return logs.find((l) => l.habitId === habitId && l.date === dateStr);
}

// Check if a log counts as positive commitment (full or minimum baseline)
export function isLogCompleted(log?: HabitLog): boolean {
  if (!log) return false;
  return log.status === 'full' || log.status === 'minimum';
}

/**
 * Calculate streak and statistics for a specific habit.
 * Streak rules in Behavioral Science:
 * - Both 'full' and 'minimum' keep the momentum alive (never break the chain, keep the identity).
 * - 'skipped' (excused break) doesn't break the streak, but doesn't increment count.
 * - Missing today if today is still in progress does NOT break an existing streak from yesterday.
 */
export function calculateHabitStats(
  habit: Habit,
  logs: HabitLog[],
  referenceDate: string = toISODateString()
): HabitStats {
  const habitLogs = logs.filter((l) => l.habitId === habit.id);
  const logMap = new Map<string, HabitLog>();
  habitLogs.forEach((l) => logMap.set(l.date, l));

  let totalFull = 0;
  let totalMinimum = 0;
  let totalCompletions = 0;
  let lastCompletedDate: string | undefined = undefined;

  habitLogs.forEach((log) => {
    if (log.status === 'full') {
      totalFull++;
      totalCompletions++;
      if (!lastCompletedDate || log.date > lastCompletedDate) {
        lastCompletedDate = log.date;
      }
    } else if (log.status === 'minimum') {
      totalMinimum++;
      totalCompletions++;
      if (!lastCompletedDate || log.date > lastCompletedDate) {
        lastCompletedDate = log.date;
      }
    }
  });

  // Calculate current streak backward from today / yesterday
  let currentStreak = 0;
  const todayScheduled = isHabitScheduledForDate(habit, referenceDate);
  const todayLog = logMap.get(referenceDate);

  let checkDate = referenceDate;

  // If today is scheduled and completed, start counting from today
  if (todayScheduled && isLogCompleted(todayLog)) {
    checkDate = referenceDate;
  } else {
    // If today is not completed yet, check if yesterday had an active streak
    checkDate = shiftDate(referenceDate, -1);
  }

  // Walk backward day by day to count current streak
  let cursor = checkDate;
  const maxLookback = 365;
  let steps = 0;

  while (cursor >= habit.createdAt && steps < maxLookback) {
    steps++;
    const scheduled = isHabitScheduledForDate(habit, cursor);

    if (scheduled) {
      const log = logMap.get(cursor);
      if (isLogCompleted(log)) {
        currentStreak++;
      } else if (log?.status === 'skipped') {
        // Excused skip does not break streak
      } else {
        // Missed day breaks current streak
        break;
      }
    }

    cursor = shiftDate(cursor, -1);
  }

  // Calculate all-time best streak
  let bestStreak = currentStreak;
  let rollingStreak = 0;

  // Evaluate historical days from habit creation to referenceDate
  let histCursor = habit.createdAt;
  while (histCursor <= referenceDate) {
    if (isHabitScheduledForDate(habit, histCursor)) {
      const log = logMap.get(histCursor);
      if (isLogCompleted(log)) {
        rollingStreak++;
        if (rollingStreak > bestStreak) {
          bestStreak = rollingStreak;
        }
      } else if (log?.status === 'skipped') {
        // keep rolling
      } else {
        rollingStreak = 0;
      }
    }
    histCursor = shiftDate(histCursor, 1);
  }

  // Calculate 30-day consistency rate
  const past30Days = getPastNDays(30, referenceDate);
  let scheduledCount30 = 0;
  let completedCount30 = 0;

  past30Days.forEach((d) => {
    if (isHabitScheduledForDate(habit, d)) {
      scheduledCount30++;
      const log = logMap.get(d);
      if (isLogCompleted(log)) {
        completedCount30++;
      }
    }
  });

  const rate30Days =
    scheduledCount30 > 0 ? Math.round((completedCount30 / scheduledCount30) * 100) : 0;

  return {
    habitId: habit.id,
    currentStreak,
    bestStreak,
    totalCompletions,
    totalFull,
    totalMinimum,
    rate30Days,
    lastCompletedDate,
  };
}

/**
 * Calculate progress for a specific calendar day across all active habits.
 */
export function calculateDayProgress(
  dateStr: string,
  habits: Habit[],
  logs: HabitLog[]
): DayProgress {
  const activeScheduledHabits = habits.filter(
    (h) => h.isActive && isHabitScheduledForDate(h, dateStr)
  );

  let completedFull = 0;
  let completedMinimum = 0;
  let skipped = 0;
  let missed = 0;

  activeScheduledHabits.forEach((habit) => {
    const log = getHabitLog(habit.id, dateStr, logs);
    if (log?.status === 'full') {
      completedFull++;
    } else if (log?.status === 'minimum') {
      completedMinimum++;
    } else if (log?.status === 'skipped') {
      skipped++;
    } else {
      missed++;
    }
  });

  const totalHabits = activeScheduledHabits.length;
  const completedTotal = completedFull + completedMinimum;
  const rate = totalHabits > 0 ? Math.round((completedTotal / totalHabits) * 100) : 0;

  const dateObj = new Date(dateStr);
  const dayName = ARABIC_DAYS_FULL[dateObj.getDay()] || '';

  return {
    date: dateStr,
    formattedDate: dateStr,
    dayName,
    totalHabits,
    completedFull,
    completedMinimum,
    skipped,
    missed,
    rate,
  };
}

/**
 * Calculate overall summary stats (weekly rates, deltas, best overall streak, total days).
 */
export function calculateOverallStats(
  habits: Habit[],
  logs: HabitLog[],
  referenceDate: string = toISODateString()
): OverallStats {
  const activeHabits = habits.filter((h) => h.isActive);

  // Today's numbers
  const todayProgress = calculateDayProgress(referenceDate, habits, logs);

  // Current week (past 7 days ending at referenceDate)
  const past7Days = getPastNDays(7, referenceDate);
  let currWeekScheduled = 0;
  let currWeekCompleted = 0;

  past7Days.forEach((dateStr) => {
    activeHabits.forEach((habit) => {
      if (isHabitScheduledForDate(habit, dateStr)) {
        currWeekScheduled++;
        const log = getHabitLog(habit.id, dateStr, logs);
        if (isLogCompleted(log)) {
          currWeekCompleted++;
        }
      }
    });
  });

  const currentWeekRate =
    currWeekScheduled > 0 ? Math.round((currWeekCompleted / currWeekScheduled) * 100) : 0;

  // Previous week (days 8 to 14 before referenceDate)
  const prevWeekEndDate = shiftDate(referenceDate, -7);
  const prev7Days = getPastNDays(7, prevWeekEndDate);
  let prevWeekScheduled = 0;
  let prevWeekCompleted = 0;

  prev7Days.forEach((dateStr) => {
    activeHabits.forEach((habit) => {
      if (isHabitScheduledForDate(habit, dateStr)) {
        prevWeekScheduled++;
        const log = getHabitLog(habit.id, dateStr, logs);
        if (isLogCompleted(log)) {
          prevWeekCompleted++;
        }
      }
    });
  });

  const previousWeekRate =
    prevWeekScheduled > 0 ? Math.round((prevWeekCompleted / prevWeekScheduled) * 100) : 0;

  const weeklyDelta = currentWeekRate - previousWeekRate;

  // Unique days with at least one completion
  const completedDates = new Set<string>();
  logs.forEach((log) => {
    if (isLogCompleted(log)) {
      completedDates.add(log.date);
    }
  });

  // Best streak across any habit
  let allTimeBestStreak = 0;
  activeHabits.forEach((habit) => {
    const stats = calculateHabitStats(habit, logs, referenceDate);
    if (stats.bestStreak > allTimeBestStreak) {
      allTimeBestStreak = stats.bestStreak;
    }
  });

  return {
    totalActiveHabits: activeHabits.length,
    totalDaysLogged: completedDates.size,
    currentWeekRate,
    previousWeekRate,
    weeklyDelta,
    allTimeBestStreak,
    todayCompletedCount: todayProgress.completedFull + todayProgress.completedMinimum,
    todayTotalCount: todayProgress.totalHabits,
    todayRate: todayProgress.rate,
  };
}

/**
 * Generate a smart weekly review backed by actual performance logs.
 * Highlights:
 * 1. Most consistent habit.
 * 2. Habit with most drop-offs.
 * 3. Most vulnerable day of the week.
 * 4. Exactly one practical, realistic behavioral adjustment.
 */
export function generateWeeklyReview(
  habits: Habit[],
  logs: HabitLog[],
  referenceDate: string = toISODateString()
): WeeklyInsight {
  const activeHabits = habits.filter((h) => h.isActive);
  const past14Days = getPastNDays(14, referenceDate);

  if (activeHabits.length === 0) {
    return {
      actionableRecommendation: 'ابدأ بإضافة عادة واحدة صغيرة بحد أدنى لا يتجاوز دقيقتين لبناء الزخم الأول.',
      summarySentence: 'لم تُسجّل أي عادات نشطة بعد.',
    };
  }

  // Calculate consistency per habit over past 14 days
  const habitPerformance = activeHabits.map((habit) => {
    let scheduled = 0;
    let completed = 0;
    let missed = 0;

    past14Days.forEach((d) => {
      if (isHabitScheduledForDate(habit, d)) {
        scheduled++;
        const log = getHabitLog(habit.id, d, logs);
        if (isLogCompleted(log)) {
          completed++;
        } else if (log?.status !== 'skipped') {
          missed++;
        }
      }
    });

    const rate = scheduled > 0 ? Math.round((completed / scheduled) * 100) : 0;
    const stats = calculateHabitStats(habit, logs, referenceDate);

    return {
      habit,
      rate,
      scheduled,
      completed,
      missed,
      streak: stats.currentStreak,
    };
  });

  // Sort to find most consistent and most struggled
  habitPerformance.sort((a, b) => b.rate - a.rate);
  const mostConsistent = habitPerformance[0];
  const mostStruggled = habitPerformance[habitPerformance.length - 1];

  // Calculate day-of-week vulnerability across past 14 days
  const dayStats: { [dayIndex: number]: { totalScheduled: number; totalCompleted: number } } = {
    0: { totalScheduled: 0, totalCompleted: 0 },
    1: { totalScheduled: 0, totalCompleted: 0 },
    2: { totalScheduled: 0, totalCompleted: 0 },
    3: { totalScheduled: 0, totalCompleted: 0 },
    4: { totalScheduled: 0, totalCompleted: 0 },
    5: { totalScheduled: 0, totalCompleted: 0 },
    6: { totalScheduled: 0, totalCompleted: 0 },
  };

  past14Days.forEach((dateStr) => {
    const dayIdx = getDayOfWeekIndex(dateStr);
    activeHabits.forEach((habit) => {
      if (isHabitScheduledForDate(habit, dateStr)) {
        dayStats[dayIdx].totalScheduled++;
        const log = getHabitLog(habit.id, dateStr, logs);
        if (isLogCompleted(log)) {
          dayStats[dayIdx].totalCompleted++;
        }
      }
    });
  });

  let lowestRate = 101;
  let hardestDayIdx = -1;

  Object.entries(dayStats).forEach(([idxStr, data]) => {
    const idx = Number(idxStr);
    if (data.totalScheduled >= 2) {
      const rate = Math.round((data.totalCompleted / data.totalScheduled) * 100);
      if (rate < lowestRate) {
        lowestRate = rate;
        hardestDayIdx = idx;
      }
    }
  });

  let hardestDayOfWeek: { dayName: string; completionRate: number } | undefined = undefined;
  if (hardestDayIdx !== -1 && lowestRate < 80) {
    hardestDayOfWeek = {
      dayName: ARABIC_DAYS_FULL[hardestDayIdx],
      completionRate: lowestRate,
    };
  }

  // Synthesize single actionable recommendation
  let recommendation = '';
  if (mostStruggled && mostStruggled.rate < 60) {
    recommendation = `عادة «${mostStruggled.habit.title}» شهدت انقطاعات متكررة (${mostStruggled.missed} أيام). التعديل المقترح: اعتمد فقط على الحد الأدنى «${mostStruggled.habit.minimumBaseline}» خلال الأيام القادمة، واجعل وقت تنفيذها مرتبطاً بمحفز فوري دون تأجيل.`;
  } else if (hardestDayOfWeek) {
    recommendation = `يوم ${hardestDayOfWeek.dayName} هو الأكثر تعرضاً لتراجع الإنجاز (نسبة التزام ${hardestDayOfWeek.completionRate}%). التعديل المقترح: حدّد يوم ${hardestDayOfWeek.dayName} كـ "يوم الحد الأدنى المرن" لجميع عاداتك لتفادي الضغط أو التسويف.`;
  } else if (mostConsistent && mostConsistent.rate >= 80) {
    recommendation = `عادة «${mostConsistent.habit.title}» في أعلى مستويات الالتزام بنسبة ${mostConsistent.rate}%. التعديل المقترح: استخدمها كـ "مرساة سلوكية" واربط العادة التي تجد فيها صعوبة مباشرةً بعد إتمام هذه العادة الناجحة.`;
  } else {
    recommendation =
      'حافظ على قاعدة "عدم تفويت يومين متتاليين". عندما تشعر بانخفاض الطاقة، سجّل الحد الأدنى فوراً لحماية هويتك الإيجابية.';
  }

  const summary = mostConsistent
    ? `أفضل التزام تحقق في «${mostConsistent.habit.title}» بمعدل ${mostConsistent.rate}% وسلسلة ${mostConsistent.streak} أيام.`
    : 'بيانات الأسبوع قيد التكوين والتسجيل.';

  return {
    mostConsistentHabit: mostConsistent
      ? { habit: mostConsistent.habit, rate: mostConsistent.rate, streak: mostConsistent.streak }
      : undefined,
    mostStruggledHabit:
      mostStruggled && mostStruggled.rate < 80
        ? {
            habit: mostStruggled.habit,
            rate: mostStruggled.rate,
            missedDaysCount: mostStruggled.missed,
          }
        : undefined,
    hardestDayOfWeek,
    actionableRecommendation: recommendation,
    summarySentence: summary,
  };
}
