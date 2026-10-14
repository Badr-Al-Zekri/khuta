import React, { useState } from 'react';
import { Habit, HabitLog, HabitStats, GoalCategory, CompletionStatus } from '../types/habit';
import {
  Check,
  CheckCheck,
  Flame,
  MoreVertical,
  Clock,
  Sparkles,
  MessageSquare,
  Edit2,
  Pause,
  Play,
  Trash2,
  History,
  X,
  AlertCircle,
} from 'lucide-react';
import confetti from 'canvas-confetti';

interface HabitCardProps {
  habit: Habit;
  log?: HabitLog;
  stats: HabitStats;
  category?: GoalCategory;
  selectedDate: string;
  isToday: boolean;
  onUpdateStatus: (habitId: string, status: CompletionStatus, note?: string) => void;
  onEditHabit: (habit: Habit) => void;
  onToggleActive: (habitId: string) => void;
  onDeleteHabit: (habitId: string) => void;
  onViewHistory: (habit: Habit) => void;
}

export const HabitCard: React.FC<HabitCardProps> = ({
  habit,
  log,
  stats,
  category,
  selectedDate,
  isToday,
  onUpdateStatus,
  onEditHabit,
  onToggleActive,
  onDeleteHabit,
  onViewHistory,
}) => {
  const [showMenu, setShowMenu] = useState(false);
  const [showNoteInput, setShowNoteInput] = useState(false);
  const [noteText, setNoteText] = useState(log?.note || '');

  const currentStatus: CompletionStatus = log?.status || 'none';
  const isCompleted = currentStatus === 'full' || currentStatus === 'minimum';

  const triggerConfetti = () => {
    try {
      confetti({
        particleCount: 30,
        spread: 60,
        origin: { y: 0.8 },
        colors: ['#059669', '#10b981', '#34d399', '#3b82f6'],
        disableForReducedMotion: true,
      });
    } catch (e) {
      // safe fallback
    }
  };

  const handleFullClick = () => {
    if (currentStatus === 'full') {
      onUpdateStatus(habit.id, 'none', log?.note);
    } else {
      triggerConfetti();
      onUpdateStatus(habit.id, 'full', log?.note);
    }
  };

  const handleMinimumClick = () => {
    if (currentStatus === 'minimum') {
      onUpdateStatus(habit.id, 'none', log?.note);
    } else {
      onUpdateStatus(habit.id, 'minimum', log?.note);
    }
  };

  const handleSaveNote = () => {
    onUpdateStatus(habit.id, currentStatus, noteText.trim() ? noteText.trim() : undefined);
    setShowNoteInput(false);
  };

  // Time of day label in Arabic
  const timeOfDayLabels: Record<string, string> = {
    morning: 'صباحاً',
    afternoon: 'ظهراً',
    evening: 'مساءً',
    anytime: 'أي وقت',
  };

  return (
    <div
      className={`relative bg-white rounded-2xl border transition-all duration-200 overflow-hidden ${
        isCompleted
          ? currentStatus === 'full'
            ? 'border-emerald-200 bg-emerald-50/20'
            : 'border-teal-200 bg-teal-50/20'
          : 'border-slate-200/90 hover:border-slate-300'
      } ${!habit.isActive ? 'opacity-60 bg-slate-50' : ''}`}
    >
      <div className="p-4 sm:p-5">
        {/* Top bar: Category, Time, and Actions */}
        <div className="flex items-center justify-between text-xs text-slate-500 mb-2.5">
          <div className="flex items-center gap-2">
            <span
              className="font-medium"
              style={{ color: category?.color || '#475569' }}
            >
              {category?.name || 'عام'}
            </span>
            <span aria-hidden="true">·</span>
            <span className="flex items-center gap-1 text-slate-500">
              <Clock className="w-3.5 h-3.5" />
              <span>{timeOfDayLabels[habit.timeOfDay] || 'أي وقت'}</span>
            </span>
            {!habit.isActive && (
              <>
                <span aria-hidden="true">·</span>
                <span className="text-amber-700 font-medium">متوقفة مؤقتاً</span>
              </>
            )}
          </div>

          {/* Quick Menu Button */}
          <div className="relative">
            <button
              onClick={() => setShowMenu(!showMenu)}
              className="w-8 h-8 rounded-lg flex items-center justify-center text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-colors"
              aria-label="خيارات العادة"
            >
              <MoreVertical className="w-4 h-4" />
            </button>

            {showMenu && (
              <div
                className="absolute left-0 mt-1 w-44 bg-white border border-slate-200 rounded-xl shadow-lg z-20 py-1 text-xs"
                onClick={() => setShowMenu(false)}
              >
                <button
                  onClick={() => onViewHistory(habit)}
                  className="w-full text-right px-3 py-2 hover:bg-slate-50 flex items-center gap-2 text-slate-700"
                >
                  <History className="w-3.5 h-3.5 text-slate-500" />
                  <span>سجل الإنجاز والملاحظات</span>
                </button>
                <button
                  onClick={() => onEditHabit(habit)}
                  className="w-full text-right px-3 py-2 hover:bg-slate-50 flex items-center gap-2 text-slate-700"
                >
                  <Edit2 className="w-3.5 h-3.5 text-slate-500" />
                  <span>تعديل العادة والحد الأدنى</span>
                </button>
                <button
                  onClick={() => onToggleActive(habit.id)}
                  className="w-full text-right px-3 py-2 hover:bg-slate-50 flex items-center gap-2 text-slate-700"
                >
                  {habit.isActive ? (
                    <>
                      <Pause className="w-3.5 h-3.5 text-amber-600" />
                      <span>إيقاف مؤقت للعادة</span>
                    </>
                  ) : (
                    <>
                      <Play className="w-3.5 h-3.5 text-emerald-600" />
                      <span>استئناف العادة</span>
                    </>
                  )}
                </button>
                <div className="border-t border-slate-100 my-1" />
                <button
                  onClick={() => onDeleteHabit(habit.id)}
                  className="w-full text-right px-3 py-2 hover:bg-red-50 text-red-600 flex items-center gap-2"
                >
                  <Trash2 className="w-3.5 h-3.5 text-red-500" />
                  <span>حذف العادة</span>
                </button>
              </div>
            )}
          </div>
        </div>

        {/* Habit Title */}
        <div className="mb-2">
          <h3 className="text-base sm:text-lg font-bold text-slate-900 tracking-tight">
            {habit.title}
          </h3>
          {habit.cue && (
            <p className="text-xs text-slate-500 mt-0.5 flex items-center gap-1.5">
              <span className="font-medium text-slate-600">المحفز المرتبط:</span>
              <span>{habit.cue}</span>
            </p>
          )}
        </div>

        {/* Target vs Minimum Baseline Split */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 my-3 p-2.5 rounded-xl bg-slate-50/70 border border-slate-100 text-xs">
          <div>
            <span className="text-[11px] font-semibold text-slate-500 block mb-0.5">
              الهدف الكامل المأمول:
            </span>
            <span className="text-slate-800 font-medium">{habit.targetDescription}</span>
          </div>

          <div className="border-t sm:border-t-0 sm:border-r sm:border-slate-200/80 pt-1.5 sm:pt-0 sm:pr-2.5">
            <span className="text-[11px] font-semibold text-teal-700 block mb-0.5 flex items-center gap-1">
              <Sparkles className="w-3 h-3 text-teal-600" />
              الحد الأدنى الواقعي (في الأيام المزدحمة):
            </span>
            <span className="text-slate-800 font-medium">{habit.minimumBaseline}</span>
          </div>
        </div>

        {/* Streaks & Metadata Bar */}
        <div className="flex flex-wrap items-center justify-between text-xs text-slate-500 py-1 border-t border-slate-100 gap-2">
          <div className="flex items-center gap-3">
            <div
              className={`flex items-center gap-1 font-semibold ${
                stats.currentStreak > 0 ? 'text-amber-600' : 'text-slate-400'
              }`}
              title="سلسلة الالتزام المتواصلة الحالية"
            >
              <Flame className="w-4 h-4" />
              <span className="tabular-nums">{stats.currentStreak} أيام متواصلة</span>
            </div>

            <span aria-hidden="true" className="text-slate-300">·</span>

            <span className="text-slate-500 tabular-nums">
              أفضل سلسلة: <strong className="text-slate-700 font-bold">{stats.bestStreak}</strong> يوماً
            </span>

            <span aria-hidden="true" className="text-slate-300">·</span>

            <span className="text-slate-500 tabular-nums">
              معدل 30 يوماً: <strong className="text-slate-700 font-bold">{stats.rate30Days}%</strong>
            </span>
          </div>

          {/* Quick Note Toggle */}
          <button
            onClick={() => setShowNoteInput(!showNoteInput)}
            className={`flex items-center gap-1 text-xs px-2 py-1 rounded-md transition-colors ${
              log?.note
                ? 'text-indigo-600 bg-indigo-50 font-medium'
                : 'text-slate-400 hover:text-slate-700 hover:bg-slate-100'
            }`}
            title="إضافة ملاحظة سريعة لهذا اليوم"
          >
            <MessageSquare className="w-3.5 h-3.5" />
            <span>{log?.note ? 'ملاحظة مسجلة' : 'ملاحظة'}</span>
          </button>
        </div>

        {/* Existing Note Display if present and not editing */}
        {log?.note && !showNoteInput && (
          <div className="mt-2.5 p-2 rounded-lg bg-indigo-50/60 border border-indigo-100/70 text-xs text-indigo-900 flex items-start justify-between">
            <span className="leading-relaxed">«{log.note}»</span>
            <button
              onClick={() => setShowNoteInput(true)}
              className="text-[11px] text-indigo-600 hover:underline mr-2 shrink-0"
            >
              تعديل
            </button>
          </div>
        )}

        {/* Inline Note Input */}
        {showNoteInput && (
          <div className="mt-2.5 p-2.5 rounded-xl bg-slate-50 border border-slate-200 text-xs">
            <label className="block text-[11px] font-semibold text-slate-600 mb-1">
              ملاحظة سريعة ليوم {selectedDate}:
            </label>
            <input
              type="text"
              value={noteText}
              onChange={(e) => setNoteText(e.target.value)}
              placeholder="مثال: شعرت بنشاط عالي، أو: كان اليوم مزدحماً فاكتفيت بالحد الأدنى"
              className="w-full px-2.5 py-1.5 bg-white border border-slate-200 rounded-lg text-slate-800 text-xs focus:ring-1 focus:ring-slate-900 focus:outline-hidden"
            />
            <div className="flex items-center justify-end gap-2 mt-2">
              <button
                onClick={() => setShowNoteInput(false)}
                className="px-2.5 py-1 text-slate-500 hover:text-slate-800 text-xs"
              >
                إلغاء
              </button>
              <button
                onClick={handleSaveNote}
                className="px-3 py-1 bg-slate-900 text-white rounded-lg text-xs font-medium hover:bg-slate-800"
              >
                حفظ الملاحظة
              </button>
            </div>
          </div>
        )}

        {/* Interactive Completion Actions (2 Primary Choices: Full or Minimum) */}
        <div className="grid grid-cols-2 gap-2 mt-3 pt-3 border-t border-slate-100">
          {/* Button 1: Complete Full Target */}
          <button
            onClick={handleFullClick}
            disabled={!habit.isActive}
            className={`min-h-[44px] px-3 py-2 rounded-xl text-xs sm:text-sm font-semibold transition-all flex items-center justify-center gap-1.5 active:scale-[0.98] ${
              currentStatus === 'full'
                ? 'bg-emerald-600 text-white shadow-sm ring-2 ring-emerald-500 ring-offset-1'
                : 'bg-emerald-50 text-emerald-800 hover:bg-emerald-100 border border-emerald-200'
            }`}
          >
            {currentStatus === 'full' ? (
              <>
                <CheckCheck className="w-4 h-4 text-white" />
                <span>أُنجز كاملاً ✓</span>
              </>
            ) : (
              <>
                <Check className="w-4 h-4 text-emerald-600" />
                <span>إنجاز الهدف كاملاً</span>
              </>
            )}
          </button>

          {/* Button 2: Complete Minimum Baseline */}
          <button
            onClick={handleMinimumClick}
            disabled={!habit.isActive}
            className={`min-h-[44px] px-3 py-2 rounded-xl text-xs sm:text-sm font-semibold transition-all flex items-center justify-center gap-1.5 active:scale-[0.98] ${
              currentStatus === 'minimum'
                ? 'bg-teal-600 text-white shadow-sm ring-2 ring-teal-500 ring-offset-1'
                : 'bg-teal-50 text-teal-800 hover:bg-teal-100 border border-teal-200'
            }`}
          >
            {currentStatus === 'minimum' ? (
              <>
                <Sparkles className="w-4 h-4 text-white" />
                <span>الحد الأدنى منجز ✓</span>
              </>
            ) : (
              <>
                <Sparkles className="w-4 h-4 text-teal-600" />
                <span>أنجزت الحد الأدنى</span>
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
};
