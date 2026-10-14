import React, { useState } from 'react';
import { Habit, HabitLog, HabitStats, GoalCategory, CompletionStatus } from '../types/habit';
import { formatArabicDate, formatShortArabicDate, getPastNDays } from '../utils/dateUtils';
import { X, Flame, Sparkles, CheckCheck, Clock, MessageSquare, History, Check } from 'lucide-react';

interface HabitHistoryModalProps {
  isOpen: boolean;
  onClose: () => void;
  habit: Habit | null;
  logs: HabitLog[];
  stats: HabitStats;
  category?: GoalCategory;
  todayDate: string;
  onUpdateStatus: (habitId: string, status: CompletionStatus, note?: string, date?: string) => void;
}

export const HabitHistoryModal: React.FC<HabitHistoryModalProps> = ({
  isOpen,
  onClose,
  habit,
  logs,
  stats,
  category,
  todayDate,
  onUpdateStatus,
}) => {
  if (!isOpen || !habit) return null;

  // Past 21 days for detailed inspection
  const pastDays = getPastNDays(21, todayDate);

  const habitLogsMap = new Map<string, HabitLog>();
  logs.filter((l) => l.habitId === habit.id).forEach((l) => habitLogsMap.set(l.date, l));

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-xs">
      <div className="relative w-full max-w-xl bg-white rounded-2xl border border-slate-200 shadow-xl overflow-hidden animate-in fade-in zoom-in-95 duration-150">
        {/* Header */}
        <div className="flex items-center justify-between p-5 border-b border-slate-100 bg-slate-50/50">
          <div>
            <div className="flex items-center gap-2 text-xs text-slate-500 mb-0.5">
              <span style={{ color: category?.color || '#059669' }} className="font-semibold">
                {category?.name || 'عام'}
              </span>
              <span aria-hidden="true">·</span>
              <span>سجل الإنجاز والمسار الزمني</span>
            </div>
            <h2 className="text-lg font-bold text-slate-900">{habit.title}</h2>
          </div>

          <button
            onClick={onClose}
            className="w-8 h-8 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-100 flex items-center justify-center transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Body */}
        <div className="p-5 sm:p-6 space-y-4 max-h-[75vh] overflow-y-auto">
          {/* Target & Minimum Reminder */}
          <div className="grid grid-cols-2 gap-3 p-3 bg-slate-50 rounded-xl border border-slate-100 text-xs">
            <div>
              <span className="text-slate-400 block mb-0.5">الهدف الكامل:</span>
              <span className="font-medium text-slate-800">{habit.targetDescription}</span>
            </div>
            <div>
              <span className="text-teal-700 block mb-0.5">الحد الأدنى الواقعي:</span>
              <span className="font-medium text-slate-800">{habit.minimumBaseline}</span>
            </div>
          </div>

          {/* Stats Bar */}
          <div className="grid grid-cols-4 gap-2 text-center">
            <div className="p-2.5 rounded-xl bg-slate-50 border border-slate-100">
              <span className="text-[10px] text-slate-500 block">السلسلة الحالية</span>
              <span className="text-base font-bold text-slate-900 tabular-nums">
                {stats.currentStreak} يوم
              </span>
            </div>
            <div className="p-2.5 rounded-xl bg-slate-50 border border-slate-100">
              <span className="text-[10px] text-slate-500 block">أفضل سلسلة</span>
              <span className="text-base font-bold text-slate-900 tabular-nums">
                {stats.bestStreak} يوم
              </span>
            </div>
            <div className="p-2.5 rounded-xl bg-slate-50 border border-slate-100">
              <span className="text-[10px] text-slate-500 block">إنجاز كامل</span>
              <span className="text-base font-bold text-emerald-700 tabular-nums">
                {stats.totalFull}
              </span>
            </div>
            <div className="p-2.5 rounded-xl bg-slate-50 border border-slate-100">
              <span className="text-[10px] text-slate-500 block">حد أدنى</span>
              <span className="text-base font-bold text-teal-700 tabular-nums">
                {stats.totalMinimum}
              </span>
            </div>
          </div>

          {/* 21-Day History Log List */}
          <div>
            <h4 className="text-xs font-bold text-slate-900 mb-2.5 flex items-center justify-between">
              <span>سجل الأيام الـ 21 الماضية وتعديل الحالات:</span>
              <span className="text-[11px] font-normal text-slate-500">
                يمكنك التبديل بين الحالات لتصحيح أي يوم
              </span>
            </h4>

            <div className="space-y-1.5 divide-y divide-slate-100">
              {pastDays.map((dateStr) => {
                const log = habitLogsMap.get(dateStr);
                const status = log?.status || 'none';

                return (
                  <div
                    key={dateStr}
                    className="pt-2 pb-1.5 flex flex-col sm:flex-row sm:items-center justify-between gap-2 text-xs"
                  >
                    <div className="flex items-center gap-2">
                      <span className="font-semibold text-slate-800 tabular-nums min-w-[120px]">
                        {formatArabicDate(dateStr)}
                      </span>

                      {log?.note && (
                        <span className="text-[11px] text-indigo-700 bg-indigo-50 px-2 py-0.5 rounded-md truncate max-w-[200px]" title={log.note}>
                          «{log.note}»
                        </span>
                      )}
                    </div>

                    {/* Status Toggle Buttons */}
                    <div className="flex items-center gap-1.5 shrink-0">
                      <button
                        onClick={() =>
                          onUpdateStatus(
                            habit.id,
                            status === 'full' ? 'none' : 'full',
                            log?.note,
                            dateStr
                          )
                        }
                        className={`px-2.5 py-1 rounded-lg text-xs font-semibold transition-all ${
                          status === 'full'
                            ? 'bg-emerald-600 text-white shadow-xs'
                            : 'bg-slate-100 text-slate-600 hover:bg-emerald-50 hover:text-emerald-700'
                        }`}
                      >
                        كامل
                      </button>

                      <button
                        onClick={() =>
                          onUpdateStatus(
                            habit.id,
                            status === 'minimum' ? 'none' : 'minimum',
                            log?.note,
                            dateStr
                          )
                        }
                        className={`px-2.5 py-1 rounded-lg text-xs font-semibold transition-all ${
                          status === 'minimum'
                            ? 'bg-teal-600 text-white shadow-xs'
                            : 'bg-slate-100 text-slate-600 hover:bg-teal-50 hover:text-teal-700'
                        }`}
                      >
                        حد أدنى
                      </button>

                      <button
                        onClick={() =>
                          onUpdateStatus(habit.id, 'none', undefined, dateStr)
                        }
                        className={`px-2 py-1 rounded-lg text-xs transition-all ${
                          status === 'none'
                            ? 'text-slate-400 font-medium'
                            : 'text-slate-400 hover:text-rose-600 hover:bg-rose-50'
                        }`}
                        title="إلغاء التسجيل لهذا اليوم"
                      >
                        {status === 'none' ? 'لم يُسجل' : 'إلغاء'}
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="p-4 border-t border-slate-100 bg-slate-50 flex items-center justify-end">
          <button
            onClick={onClose}
            className="px-4 py-2 bg-slate-900 text-white rounded-xl text-xs font-semibold hover:bg-slate-800 transition-colors"
          >
            إغلاق
          </button>
        </div>
      </div>
    </div>
  );
};
