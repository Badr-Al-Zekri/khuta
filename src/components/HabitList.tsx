import React, { useState } from 'react';
import { Habit, HabitLog, HabitStats, GoalCategory, CompletionStatus, TimeOfDay } from '../types/habit';
import { HabitCard } from './HabitCard';
import { CheckCircle2, Circle, Clock, Filter, Plus, Sparkles } from 'lucide-react';

interface HabitListProps {
  habits: Habit[];
  logs: HabitLog[];
  categories: GoalCategory[];
  statsMap: Map<string, HabitStats>;
  selectedDate: string;
  isToday: boolean;
  onUpdateStatus: (habitId: string, status: CompletionStatus, note?: string) => void;
  onEditHabit: (habit: Habit) => void;
  onToggleActive: (habitId: string) => void;
  onDeleteHabit: (habitId: string) => void;
  onViewHistory: (habit: Habit) => void;
  onOpenNewHabit: () => void;
}

type FilterType = 'all' | 'remaining' | 'completed' | 'morning' | 'evening';

export const HabitList: React.FC<HabitListProps> = ({
  habits,
  logs,
  categories,
  statsMap,
  selectedDate,
  isToday,
  onUpdateStatus,
  onEditHabit,
  onToggleActive,
  onDeleteHabit,
  onViewHistory,
  onOpenNewHabit,
}) => {
  const [activeFilter, setActiveFilter] = useState<FilterType>('all');

  // Map category by id
  const categoryMap = new Map<string, GoalCategory>();
  categories.forEach((c) => categoryMap.set(c.id, c));

  // Determine completion state for each habit on selectedDate
  const getLogForHabit = (habitId: string) =>
    logs.find((l) => l.habitId === habitId && l.date === selectedDate);

  // Filter habits
  const filteredHabits = habits.filter((habit) => {
    const log = getLogForHabit(habit.id);
    const isCompleted = log?.status === 'full' || log?.status === 'minimum';

    if (activeFilter === 'remaining') {
      return habit.isActive && !isCompleted;
    }
    if (activeFilter === 'completed') {
      return isCompleted;
    }
    if (activeFilter === 'morning') {
      return habit.timeOfDay === 'morning';
    }
    if (activeFilter === 'evening') {
      return habit.timeOfDay === 'evening';
    }
    return true; // 'all'
  });

  return (
    <section className="space-y-4">
      {/* Filters and Header Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-white border border-slate-200/90 rounded-2xl p-3.5 sm:p-4 shadow-xs">
        <div className="flex items-center gap-2">
          <span className="text-sm font-bold text-slate-900">قائمة عادات اليوم</span>
          <span className="text-xs text-slate-500 tabular-nums">
            ({filteredHabits.length} من أصل {habits.length})
          </span>
        </div>

        {/* Filter Segmented Buttons */}
        <div className="flex items-center gap-1 p-1 bg-slate-100 rounded-xl overflow-x-auto">
          <button
            onClick={() => setActiveFilter('all')}
            className={`px-3 py-1.5 text-xs font-medium rounded-lg transition-all whitespace-nowrap shrink-0 ${
              activeFilter === 'all'
                ? 'bg-white text-slate-900 shadow-xs font-semibold'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            جميع العادات
          </button>

          <button
            onClick={() => setActiveFilter('remaining')}
            className={`px-3 py-1.5 text-xs font-medium rounded-lg transition-all whitespace-nowrap shrink-0 ${
              activeFilter === 'remaining'
                ? 'bg-white text-slate-900 shadow-xs font-semibold'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            المتبقية
          </button>

          <button
            onClick={() => setActiveFilter('completed')}
            className={`px-3 py-1.5 text-xs font-medium rounded-lg transition-all whitespace-nowrap shrink-0 ${
              activeFilter === 'completed'
                ? 'bg-white text-slate-900 shadow-xs font-semibold'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            المكتملة
          </button>

          <button
            onClick={() => setActiveFilter('morning')}
            className={`px-3 py-1.5 text-xs font-medium rounded-lg transition-all whitespace-nowrap shrink-0 ${
              activeFilter === 'morning'
                ? 'bg-white text-slate-900 shadow-xs font-semibold'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            الصباحية
          </button>

          <button
            onClick={() => setActiveFilter('evening')}
            className={`px-3 py-1.5 text-xs font-medium rounded-lg transition-all whitespace-nowrap shrink-0 ${
              activeFilter === 'evening'
                ? 'bg-white text-slate-900 shadow-xs font-semibold'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            المسائية
          </button>
        </div>
      </div>

      {/* Habit Cards Grid */}
      {filteredHabits.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {filteredHabits.map((habit) => {
            const log = getLogForHabit(habit.id);
            const stats = statsMap.get(habit.id) || {
              habitId: habit.id,
              currentStreak: 0,
              bestStreak: 0,
              totalCompletions: 0,
              totalFull: 0,
              totalMinimum: 0,
              rate30Days: 0,
            };
            const category = categoryMap.get(habit.categoryId);

            return (
              <HabitCard
                key={habit.id}
                habit={habit}
                log={log}
                stats={stats}
                category={category}
                selectedDate={selectedDate}
                isToday={isToday}
                onUpdateStatus={onUpdateStatus}
                onEditHabit={onEditHabit}
                onToggleActive={onToggleActive}
                onDeleteHabit={onDeleteHabit}
                onViewHistory={onViewHistory}
              />
            );
          })}
        </div>
      ) : (
        /* Meaningful Empty States */
        <div className="bg-white border border-slate-200/90 rounded-2xl p-8 sm:p-12 text-center">
          <div className="w-12 h-12 rounded-2xl bg-slate-100 flex items-center justify-center mx-auto mb-3 text-slate-400">
            {activeFilter === 'completed' ? (
              <Circle className="w-6 h-6" />
            ) : activeFilter === 'remaining' ? (
              <CheckCircle2 className="w-6 h-6 text-emerald-500" />
            ) : (
              <Sparkles className="w-6 h-6 text-amber-500" />
            )}
          </div>

          <h3 className="text-base font-bold text-slate-900 mb-1">
            {activeFilter === 'completed'
              ? 'لم تسجل أي إنجاز لهذه العادات بعد'
              : activeFilter === 'remaining'
              ? 'أحسنت! لا توجد أي عادات متبقية ضمن هذا التصنيف'
              : habits.length === 0
              ? 'ابدأ بخطوتك الأولى'
              : 'لا توجد عادات تطابق هذا الفلتر'}
          </h3>

          <p className="text-xs sm:text-sm text-slate-500 max-w-md mx-auto mb-5 leading-relaxed">
            {habits.length === 0
              ? 'القوة الحقيقية تبدأ من اختيار عادة واحدة بسيطة وتحديد حدها الأدنى غير القابل للتفويت. ابدأ الآن!'
              : activeFilter === 'remaining'
              ? 'كل المهام المجدولة اليوم تم تسجيلها بنجاح، إما بالهدف الكامل أو الحد الأدنى.'
              : 'جرب تغيير الفلتر لعرض بقية العادات أو إضافة عادة جديدة.'}
          </p>

          {habits.length === 0 && (
            <button
              onClick={onOpenNewHabit}
              className="inline-flex items-center gap-2 px-4 py-2 bg-slate-900 text-white rounded-xl text-xs font-semibold hover:bg-slate-800 transition-colors"
            >
              <Plus className="w-4 h-4" />
              <span>إضافة أول عادة لك الآن</span>
            </button>
          )}
        </div>
      )}
    </section>
  );
};
