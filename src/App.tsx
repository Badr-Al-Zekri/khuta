import React, { useState, useEffect, useMemo } from 'react';
import { Habit, HabitLog, GoalCategory, CompletionStatus } from './types/habit';
import {
  loadHabitsFromStorage,
  saveHabitsToStorage,
  loadLogsFromStorage,
  saveLogsToStorage,
  loadCategoriesFromStorage,
} from './utils/storage';
import { toISODateString, shiftDate, isToday, isYesterday } from './utils/dateUtils';
import {
  calculateHabitStats,
  calculateOverallStats,
  calculateDayProgress,
} from './utils/statsCalculator';
import { Header } from './components/Header';
import { DailyOverview } from './components/DailyOverview';
import { InteractiveTimeline } from './components/InteractiveTimeline';
import { HabitList } from './components/HabitList';
import { MonthlyHeatmap } from './components/MonthlyHeatmap';
import { HabitFormModal } from './components/HabitFormModal';
import { WeeklyReviewModal } from './components/WeeklyReviewModal';
import { DataManagementModal } from './components/DataManagementModal';
import { HabitHistoryModal } from './components/HabitHistoryModal';
import { ShieldCheck, Sparkles, AlertCircle, ArrowLeft, HeartHandshake, CheckCircle2 } from 'lucide-react';

export default function App() {
  const todayDate = useMemo(() => toISODateString(), []);
  const [selectedDate, setSelectedDate] = useState<string>(todayDate);
  const [habits, setHabits] = useState<Habit[]>([]);
  const [logs, setLogs] = useState<HabitLog[]>([]);
  const [categories, setCategories] = useState<GoalCategory[]>([]);
  const [activeView, setActiveView] = useState<'today' | 'timeline' | 'insights'>('today');

  // Modal states
  const [isFormModalOpen, setIsFormModalOpen] = useState(false);
  const [editingHabit, setEditingHabit] = useState<Habit | null>(null);
  const [isWeeklyReviewOpen, setIsWeeklyReviewOpen] = useState(false);
  const [isDataModalOpen, setIsDataModalOpen] = useState(false);
  const [historyModalHabit, setHistoryModalHabit] = useState<Habit | null>(null);

  // Initialize data on mount
  useEffect(() => {
    const loadedHabits = loadHabitsFromStorage();
    const loadedLogs = loadLogsFromStorage();
    const loadedCategories = loadCategoriesFromStorage();
    setHabits(loadedHabits);
    setLogs(loadedLogs);
    setCategories(loadedCategories);
  }, []);

  // Compute stats map for all habits
  const statsMap = useMemo(() => {
    const map = new Map();
    habits.forEach((h) => {
      map.set(h.id, calculateHabitStats(h, logs, todayDate));
    });
    return map;
  }, [habits, logs, todayDate]);

  // Overall statistics computed dynamically from real records
  const overallStats = useMemo(() => {
    return calculateOverallStats(habits, logs, todayDate);
  }, [habits, logs, todayDate]);

  // Daily progress for the currently selected date
  const selectedDayProgress = useMemo(() => {
    return calculateDayProgress(selectedDate, habits, logs);
  }, [selectedDate, habits, logs]);

  const remainingForSelectedDate = selectedDayProgress.missed;

  // Check if yesterday had any active habit that was missed, to show supportive recovery guidance
  const yesterdayDate = shiftDate(todayDate, -1);
  const yesterdayProgress = useMemo(() => {
    return calculateDayProgress(yesterdayDate, habits, logs);
  }, [yesterdayDate, habits, logs]);

  const hadYesterdayMisses = yesterdayProgress.totalHabits > 0 && yesterdayProgress.missed > 0;

  // Handlers for logging
  const handleUpdateStatus = (
    habitId: string,
    status: CompletionStatus,
    note?: string,
    targetDate: string = selectedDate
  ) => {
    setLogs((prevLogs) => {
      const existingIndex = prevLogs.findIndex(
        (l) => l.habitId === habitId && l.date === targetDate
      );

      let newLogs: HabitLog[];

      if (status === 'none') {
        // If status is removed and there's no note, remove log
        if (!note) {
          newLogs = prevLogs.filter((_, idx) => idx !== existingIndex);
        } else {
          // Keep note with none status
          if (existingIndex >= 0) {
            newLogs = [...prevLogs];
            newLogs[existingIndex] = {
              ...newLogs[existingIndex],
              status: 'none',
              note,
            };
          } else {
            newLogs = [
              ...prevLogs,
              {
                id: `${habitId}_${targetDate}`,
                habitId,
                date: targetDate,
                status: 'none',
                note,
              },
            ];
          }
        }
      } else {
        if (existingIndex >= 0) {
          newLogs = [...prevLogs];
          newLogs[existingIndex] = {
            ...newLogs[existingIndex],
            status,
            note: note !== undefined ? note : newLogs[existingIndex].note,
            completedAt: new Date().toISOString(),
          };
        } else {
          newLogs = [
            ...prevLogs,
            {
              id: `${habitId}_${targetDate}`,
              habitId,
              date: targetDate,
              status,
              note,
              completedAt: new Date().toISOString(),
            },
          ];
        }
      }

      saveLogsToStorage(newLogs);
      return newLogs;
    });
  };

  // Habit CRUD handlers
  const handleSaveHabit = (habitData: Partial<Habit>) => {
    setHabits((prev) => {
      let updated: Habit[];
      const exists = prev.some((h) => h.id === habitData.id);
      if (exists) {
        updated = prev.map((h) =>
          h.id === habitData.id ? ({ ...h, ...habitData } as Habit) : h
        );
      } else {
        updated = [...prev, habitData as Habit];
      }
      saveHabitsToStorage(updated);
      return updated;
    });
    setEditingHabit(null);
  };

  const handleToggleActive = (habitId: string) => {
    setHabits((prev) => {
      const updated = prev.map((h) =>
        h.id === habitId ? { ...h, isActive: !h.isActive } : h
      );
      saveHabitsToStorage(updated);
      return updated;
    });
  };

  const handleDeleteHabit = (habitId: string) => {
    if (window.confirm('هل أنت متأكد من حذف هذه العادة؟')) {
      setHabits((prev) => {
        const updated = prev.filter((h) => h.id !== habitId);
        saveHabitsToStorage(updated);
        return updated;
      });
      // Also optionally clean up logs or keep them
      setLogs((prev) => {
        const updated = prev.filter((l) => l.habitId !== habitId);
        saveLogsToStorage(updated);
        return updated;
      });
    }
  };

  const handleDataReset = (newHabits: Habit[], newLogs: HabitLog[]) => {
    setHabits(newHabits);
    setLogs(newLogs);
  };

  return (
    <div className="min-h-screen bg-slate-50 text-slate-800 flex flex-col font-sans">
      {/* Strict 3-zone Header */}
      <Header
        onOpenNewHabit={() => {
          setEditingHabit(null);
          setIsFormModalOpen(true);
        }}
        onOpenWeeklyReview={() => setIsWeeklyReviewOpen(true)}
        onOpenDataModal={() => setIsDataModalOpen(true)}
        activeView={activeView}
        setActiveView={setActiveView}
      />

      {/* Main Container */}
      <main className="flex-1 max-w-6xl w-full mx-auto px-4 sm:px-6 py-6 sm:py-8 space-y-6">
        {/* Behavioral Recovery Banner: "Never Miss Twice" prompt if yesterday had a miss */}
        {isToday(selectedDate) && hadYesterdayMisses && (
          <div className="bg-amber-50/70 border border-amber-200/90 rounded-2xl p-4 flex items-start gap-3.5 shadow-xs">
            <div className="w-8 h-8 rounded-xl bg-amber-100 text-amber-800 flex items-center justify-center shrink-0 mt-0.5">
              <HeartHandshake className="w-4 h-4 text-amber-700" />
            </div>
            <div className="text-xs sm:text-sm text-amber-900 leading-relaxed flex-1">
              <span className="font-bold block text-amber-950 mb-0.5">
                قاعدة علم السلوك: «لا تفوّت يومين متتاليين»
              </span>
              تعثر يوم أمس أمر إنساني طبيعي لا يلغي هويتك أو انضباطك. السر في بناء العادات الدائمة هو العودة السريعة اليوم، ولو بالاكتفاء بالحد الأدنى لكل عادة.
            </div>
          </div>
        )}

        {/* View 1: Today's Dashboard */}
        {activeView === 'today' && (
          <div className="space-y-6 animate-in fade-in duration-200">
            {/* Top Metric Strip & Progress Gauge */}
            <DailyOverview
              selectedDate={selectedDate}
              stats={overallStats}
              remainingCount={remainingForSelectedDate}
            />

            {/* 7-Day Interactive Timeline (Split between Full and Minimum) */}
            <InteractiveTimeline
              selectedDate={selectedDate}
              onSelectDate={setSelectedDate}
              habits={habits}
              logs={logs}
              todayDate={todayDate}
            />

            {/* Habit List for Selected Date */}
            <HabitList
              habits={habits}
              logs={logs}
              categories={categories}
              statsMap={statsMap}
              selectedDate={selectedDate}
              isToday={isToday(selectedDate)}
              onUpdateStatus={handleUpdateStatus}
              onEditHabit={(h) => {
                setEditingHabit(h);
                setIsFormModalOpen(true);
              }}
              onToggleActive={handleToggleActive}
              onDeleteHabit={handleDeleteHabit}
              onViewHistory={(h) => setHistoryModalHabit(h)}
              onOpenNewHabit={() => {
                setEditingHabit(null);
                setIsFormModalOpen(true);
              }}
            />
          </div>
        )}

        {/* View 2: 30-Day Heatmap & Visual Calendar */}
        {activeView === 'timeline' && (
          <div className="space-y-6 animate-in fade-in duration-200">
            <MonthlyHeatmap
              habits={habits}
              logs={logs}
              todayDate={todayDate}
              selectedDate={selectedDate}
              onSelectDate={(d) => {
                setSelectedDate(d);
                setActiveView('today'); // jump back to view/log that day
              }}
            />

            {/* Supporting Behavioral Card */}
            <div className="bg-white border border-slate-200/90 rounded-2xl p-5 shadow-xs">
              <h3 className="text-sm font-bold text-slate-900 mb-2 flex items-center gap-2">
                <Sparkles className="w-4 h-4 text-emerald-600" />
                <span>كيف تقرأ هذا التقويم البصري؟</span>
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-xs text-slate-600 leading-relaxed">
                <div className="p-3 bg-slate-50 rounded-xl border border-slate-100">
                  <strong className="text-slate-900 block mb-1">اللون الأخضر الداكن:</strong>
                  أيام الإنجاز الكامل لجميع الأهداف المجدولة، وهي الوقود الأكبر لتعزيز الثقة بالنفس.
                </div>
                <div className="p-3 bg-slate-50 rounded-xl border border-slate-100">
                  <strong className="text-teal-800 block mb-1">اللون الأزرق الفيروزي (الحد الأدنى):</strong>
                  الأيام التي قمت فيها بالحد الأدنى؛ هذه الأيام هي التي تحميك فعلياً من الاستسلام وتمنع انقطاع السلسلة.
                </div>
                <div className="p-3 bg-slate-50 rounded-xl border border-slate-100">
                  <strong className="text-rose-800 block mb-1">المربعات الوردية (الانقطاع):</strong>
                  فرص للتعلم السلوكي لمعرفة الأيام المزدحمة وتعديل المحفزات، وليست دليلاً على الفشل أبداً.
                </div>
              </div>
            </div>
          </div>
        )}
      </main>

      {/* Footer: Quiet, unboxed metadata adhering to constitution */}
      <footer className="mt-auto border-t border-slate-200 bg-white py-6">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 flex flex-col sm:flex-row items-center justify-between text-xs text-slate-500 gap-3">
          <div className="flex items-center gap-2">
            <span className="font-semibold text-slate-700">خُطى</span>
            <span aria-hidden="true">·</span>
            <span>نظام الاستمرارية وتتبع العادات المرنة</span>
            <span aria-hidden="true">·</span>
            <span className="text-emerald-700 font-medium">البيانات محفوظة محلياً في متصفحك</span>
          </div>

          <div className="flex items-center gap-4">
            <button
              onClick={() => setIsDataModalOpen(true)}
              className="text-slate-600 hover:text-slate-900 transition-colors"
            >
              النسخ الاحتياطي والبيانات
            </button>
            <span aria-hidden="true">·</span>
            <button
              onClick={() => setIsWeeklyReviewOpen(true)}
              className="text-slate-600 hover:text-slate-900 transition-colors"
            >
              المراجعة الأسبوعية
            </button>
          </div>
        </div>
      </footer>

      {/* Modals */}
      <HabitFormModal
        isOpen={isFormModalOpen}
        onClose={() => {
          setIsFormModalOpen(false);
          setEditingHabit(null);
        }}
        onSave={handleSaveHabit}
        initialHabit={editingHabit}
        categories={categories}
      />

      <WeeklyReviewModal
        isOpen={isWeeklyReviewOpen}
        onClose={() => setIsWeeklyReviewOpen(false)}
        habits={habits}
        logs={logs}
        todayDate={todayDate}
      />

      <DataManagementModal
        isOpen={isDataModalOpen}
        onClose={() => setIsDataModalOpen(false)}
        onDataReset={handleDataReset}
      />

      <HabitHistoryModal
        isOpen={Boolean(historyModalHabit)}
        onClose={() => setHistoryModalHabit(null)}
        habit={historyModalHabit}
        logs={logs}
        stats={
          historyModalHabit
            ? statsMap.get(historyModalHabit.id) || {
                habitId: historyModalHabit.id,
                currentStreak: 0,
                bestStreak: 0,
                totalCompletions: 0,
                totalFull: 0,
                totalMinimum: 0,
                rate30Days: 0,
              }
            : {
                habitId: '',
                currentStreak: 0,
                bestStreak: 0,
                totalCompletions: 0,
                totalFull: 0,
                totalMinimum: 0,
                rate30Days: 0,
              }
        }
        category={categories.find((c) => c.id === historyModalHabit?.categoryId)}
        todayDate={todayDate}
        onUpdateStatus={handleUpdateStatus}
      />
    </div>
  );
}
