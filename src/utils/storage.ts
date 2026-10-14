import { Habit, HabitLog, GoalCategory } from '../types/habit';
import { toISODateString, shiftDate } from './dateUtils';

const STORAGE_KEY_HABITS = 'khuta_habits_v2';
const STORAGE_KEY_LOGS = 'khuta_logs_v2';
const STORAGE_KEY_CATEGORIES = 'khuta_categories_v2';

export const DEFAULT_CATEGORIES: GoalCategory[] = [
  {
    id: 'health',
    name: 'الصحة والنشاط البدني',
    icon: 'Activity',
    color: '#059669', // emerald
    description: 'اللياقة، النوم، والتغذية السليمة',
  },
  {
    id: 'mind',
    name: 'القراءة وتطوير الفكر',
    icon: 'BookOpen',
    color: '#2563eb', // blue
    description: 'اكتساب المعرفة والتأمل',
  },
  {
    id: 'career',
    name: 'الإنتاجية والعمل',
    icon: 'Briefcase',
    color: '#7c3aed', // purple
    description: 'التركيز العميق والمهام المهنية',
  },
  {
    id: 'spirit',
    name: 'السكينة والروحانية',
    icon: 'Heart',
    color: '#d97706', // amber
    description: 'الصلوات، الأذكار، والامتنان',
  },
  {
    id: 'discipline',
    name: 'الانضباط الرقمي والنفسي',
    icon: 'ShieldCheck',
    color: '#0891b2', // cyan
    description: 'تقليل المشتتات والتحكم بالوقت',
  },
];

/**
 * Generate realistic demonstration data spanning 21 days for realistic charts, streaks, and insights.
 */
export function generateDemoData(): { habits: Habit[]; logs: HabitLog[] } {
  const today = toISODateString();
  const startDate = shiftDate(today, -20); // 21 days total

  const habits: Habit[] = [
    {
      id: 'h1_reading',
      title: 'قراءة معرفية مركزة',
      categoryId: 'mind',
      targetDescription: 'قراءة 20 صفحة من كتاب نافع',
      minimumBaseline: 'صفحتان أو 3 دقائق قراءة',
      timeOfDay: 'evening',
      frequency: { type: 'daily' },
      cue: 'قبل النوم مع كوب شاي خفيف',
      isActive: true,
      createdAt: startDate,
      color: '#2563eb',
      icon: 'BookOpen',
    },
    {
      id: 'h2_workout',
      title: 'حركة ونشاط بدني',
      categoryId: 'health',
      targetDescription: '30 دقيقة تمرين أو مشي نشط',
      minimumBaseline: '10 ضغطات أو دقيقتان إطالة',
      timeOfDay: 'morning',
      frequency: { type: 'daily' },
      cue: 'فور تبديل ملابس النوم في الصباح',
      isActive: true,
      createdAt: startDate,
      color: '#059669',
      icon: 'Activity',
    },
    {
      id: 'h3_deep_work',
      title: 'جلسة تركيز بلا مشتتات',
      categoryId: 'career',
      targetDescription: '45 دقيقة عمل متواصل دون هاتف',
      minimumBaseline: '15 دقيقة تركيز على مهمة واحدة',
      timeOfDay: 'morning',
      frequency: { type: 'weekdays' },
      cue: 'أول ساعة من بدء العمل',
      isActive: true,
      createdAt: startDate,
      color: '#7c3aed',
      icon: 'Briefcase',
    },
    {
      id: 'h4_gratitude',
      title: 'تدوين وتأمل يومي',
      categoryId: 'spirit',
      targetDescription: 'تدوين 3 نعم وأبرز درس من اليوم',
      minimumBaseline: 'كتابة جملة واحدة فقط عن اليوم',
      timeOfDay: 'evening',
      frequency: { type: 'daily' },
      cue: 'بعد صلاة العشاء',
      isActive: true,
      createdAt: startDate,
      color: '#d97706',
      icon: 'Heart',
    },
    {
      id: 'h5_screen_curfew',
      title: 'إيقاف الشاشات قبل النوم',
      categoryId: 'discipline',
      targetDescription: 'ترك الهاتف خارج الغرفة قبل النوم بـ 30 دقيقة',
      minimumBaseline: 'تفعيل وضع عدم الإزعاج وترك الهاتف بعيداً',
      timeOfDay: 'evening',
      frequency: { type: 'daily' },
      cue: 'عند إطفاء أضواء الصالة',
      isActive: true,
      createdAt: startDate,
      color: '#0891b2',
      icon: 'ShieldCheck',
    },
  ];

  const logs: HabitLog[] = [];

  // Realistic generation pattern:
  // Most days completed full, some days minimum baseline, very few isolated misses
  for (let i = 20; i >= 0; i--) {
    const dateStr = shiftDate(today, -i);
    const dayOfWeek = new Date(dateStr).getDay(); // 0 = Sun, 4 = Thu, 5 = Fri

    // Habit 1: Reading (Very consistent, sometimes minimum)
    if (i !== 4) {
      // missed 4 days ago only
      const isMin = i === 1 || i === 8 || i === 15;
      logs.push({
        id: `h1_reading_${dateStr}`,
        habitId: 'h1_reading',
        date: dateStr,
        status: isMin ? 'minimum' : 'full',
        note: isMin ? 'كنت متعباً واكتفيت بصفحتين لحفظ الاستمرارية' : 'أنهيت 22 صفحة بتركيز ممتاز',
      });
    }

    // Habit 2: Workout (Consistent weekdays, weekends varied)
    if (i !== 7 && i !== 14) {
      const isMin = dayOfWeek === 4 || i === 3;
      logs.push({
        id: `h2_workout_${dateStr}`,
        habitId: 'h2_workout',
        date: dateStr,
        status: isMin ? 'minimum' : 'full',
        note: isMin ? 'إطالات خفيفة فقط لحفظ الزخم' : '30 دقيقة تمرين نشط',
      });
    }

    // Habit 3: Deep Work (Weekdays only: 0 to 4)
    if (dayOfWeek >= 0 && dayOfWeek <= 4) {
      if (i !== 11) {
        const isMin = dayOfWeek === 4; // Thursdays often lighter
        logs.push({
          id: `h3_deep_work_${dateStr}`,
          habitId: 'h3_deep_work',
          date: dateStr,
          status: isMin ? 'minimum' : 'full',
          note: isMin ? '15 دقيقة مراجعة سريعة' : 'جلسة بومودورو مركزة 45 دقيقة',
        });
      }
    }

    // Habit 4: Gratitude (High completion)
    if (i !== 2 && i !== 9) {
      logs.push({
        id: `h4_gratitude_${dateStr}`,
        habitId: 'h4_gratitude',
        date: dateStr,
        status: 'full',
        note: 'الحمد لله على الصحة وراحة البال',
      });
    }

    // Habit 5: Screen Curfew
    if (i !== 1 && i !== 8 && i !== 16) {
      const isMin = i === 5 || i === 12;
      logs.push({
        id: `h5_screen_curfew_${dateStr}`,
        habitId: 'h5_screen_curfew',
        date: dateStr,
        status: isMin ? 'minimum' : 'full',
      });
    }
  }

  return { habits, logs };
}

// Local Storage Wrappers
export function loadHabitsFromStorage(): Habit[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY_HABITS);
    if (raw) {
      const parsed = JSON.parse(raw);
      if (Array.isArray(parsed) && parsed.length > 0) {
        return parsed;
      }
    }
  } catch (e) {
    console.error('Error loading habits from localStorage', e);
  }
  // If first time or empty, return demo data
  const demo = generateDemoData();
  saveHabitsToStorage(demo.habits);
  saveLogsToStorage(demo.logs);
  return demo.habits;
}

export function saveHabitsToStorage(habits: Habit[]): void {
  try {
    localStorage.setItem(STORAGE_KEY_HABITS, JSON.stringify(habits));
  } catch (e) {
    console.error('Error saving habits to localStorage', e);
  }
}

export function loadLogsFromStorage(): HabitLog[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY_LOGS);
    if (raw) {
      return JSON.parse(raw);
    }
  } catch (e) {
    console.error('Error loading logs from localStorage', e);
  }
  return [];
}

export function saveLogsToStorage(logs: HabitLog[]): void {
  try {
    localStorage.setItem(STORAGE_KEY_LOGS, JSON.stringify(logs));
  } catch (e) {
    console.error('Error saving logs to localStorage', e);
  }
}

export function loadCategoriesFromStorage(): GoalCategory[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY_CATEGORIES);
    if (raw) {
      return JSON.parse(raw);
    }
  } catch (e) {
    console.error('Error loading categories from localStorage', e);
  }
  return DEFAULT_CATEGORIES;
}

export function saveCategoriesToStorage(categories: GoalCategory[]): void {
  try {
    localStorage.setItem(STORAGE_KEY_CATEGORIES, JSON.stringify(categories));
  } catch (e) {
    console.error('Error saving categories to localStorage', e);
  }
}

// Export all user data as a JSON file download
export function exportDataAsJSON(): void {
  const data = {
    appName: 'Khuta - خُطى',
    exportedAt: new Date().toISOString(),
    version: '2.0',
    habits: loadHabitsFromStorage(),
    logs: loadLogsFromStorage(),
    categories: loadCategoriesFromStorage(),
  };

  const jsonStr = JSON.stringify(data, null, 2);
  const blob = new Blob([jsonStr], { type: 'application/json' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = `khuta_habits_backup_${toISODateString()}.json`;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}

// Clear all data to start completely fresh
export function clearAllData(): { habits: Habit[]; logs: HabitLog[] } {
  localStorage.removeItem(STORAGE_KEY_HABITS);
  localStorage.removeItem(STORAGE_KEY_LOGS);
  saveHabitsToStorage([]);
  saveLogsToStorage([]);
  return { habits: [], logs: [] };
}

// Reload fresh demonstration data
export function reloadDemoData(): { habits: Habit[]; logs: HabitLog[] } {
  const demo = generateDemoData();
  saveHabitsToStorage(demo.habits);
  saveLogsToStorage(demo.logs);
  return demo;
}
