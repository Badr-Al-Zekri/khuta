import React from 'react';
import { Habit, HabitLog } from '../types/habit';
import { calculateDayProgress } from '../utils/statsCalculator';
import { getPastNDays, formatArabicDate, formatShortArabicDate, isToday, isSameDay } from '../utils/dateUtils';
import { Calendar, CheckCircle2, Sparkles, XCircle } from 'lucide-react';

interface MonthlyHeatmapProps {
  habits: Habit[];
  logs: HabitLog[];
  todayDate: string;
  selectedDate: string;
  onSelectDate: (date: string) => void;
}

export const MonthlyHeatmap: React.FC<MonthlyHeatmapProps> = ({
  habits,
  logs,
  todayDate,
  selectedDate,
  onSelectDate,
}) => {
  // Past 35 days (5 weeks) for an aligned calendar grid
  const pastDays = getPastNDays(35, todayDate);

  const daysData = pastDays.map((d) => {
    const progress = calculateDayProgress(d, habits, logs);
    return {
      date: d,
      progress,
      isCurrentDay: isToday(d),
      isSelected: isSameDay(d, selectedDate),
    };
  });

  // Calculate overall metrics for the 35 days
  let perfectDays = 0;
  let activeDays = 0;
  let zeroDays = 0;

  daysData.forEach((d) => {
    if (d.progress.totalHabits > 0) {
      if (d.progress.rate === 100) perfectDays++;
      if (d.progress.rate > 0) activeDays++;
      if (d.progress.rate === 0) zeroDays++;
    }
  });

  return (
    <section className="bg-white border border-slate-200/90 rounded-2xl p-5 sm:p-6 shadow-xs space-y-5">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <div className="flex items-center gap-2 text-xs font-medium text-slate-500 mb-0.5">
            <Calendar className="w-3.5 h-3.5" />
            <span>سجل الالتزام البصري</span>
            <span aria-hidden="true">·</span>
            <span>الأسابيع الخمسة الماضية (35 يوماً)</span>
          </div>
          <h2 className="text-base sm:text-lg font-bold text-slate-900">
            خريطة الاستمرارية وتفادي الأيام الصفرية
          </h2>
          <p className="text-xs text-slate-600 mt-0.5">
            الهدف ليس الكمال المطلق، بل الحفاظ على اللون الأخضر وتجنب الانقطاع ليومين متتاليين.
          </p>
        </div>

        {/* Quick Summary Unboxed Stats */}
        <div className="flex items-center gap-4 text-xs text-slate-600 bg-slate-50 p-2.5 rounded-xl border border-slate-100">
          <div className="flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 rounded-xs bg-emerald-600" />
            <span>أيام مكتملة تماماً: <strong className="text-slate-900 font-bold tabular-nums">{perfectDays}</strong></span>
          </div>
          <span aria-hidden="true" className="text-slate-300">·</span>
          <div className="flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 rounded-xs bg-teal-400" />
            <span>أيام الحد الأدنى: <strong className="text-slate-900 font-bold tabular-nums">{activeDays - perfectDays}</strong></span>
          </div>
        </div>
      </div>

      {/* Grid of days: 7 columns (days of week) */}
      <div className="overflow-x-auto pb-1">
        <div className="min-w-[500px]">
          {/* Calendar Heatmap Matrix */}
          <div className="grid grid-cols-7 gap-2">
            {daysData.map((d) => {
              const { progress, date, isCurrentDay, isSelected } = d;
              const hasHabits = progress.totalHabits > 0;
              const rate = progress.rate;

              // Color assignment based on real completion
              let cellBg = 'bg-slate-100 hover:bg-slate-200 border-slate-200/50';
              if (hasHabits) {
                if (rate === 100) {
                  cellBg = 'bg-emerald-600 text-white border-emerald-700';
                } else if (rate >= 60) {
                  cellBg = 'bg-emerald-500 text-white border-emerald-600';
                } else if (rate > 0) {
                  cellBg = 'bg-teal-400 text-slate-900 border-teal-500';
                } else {
                  cellBg = 'bg-rose-50 text-rose-800 border-rose-200';
                }
              }

              return (
                <button
                  key={date}
                  onClick={() => onSelectDate(date)}
                  className={`p-2.5 rounded-xl border transition-all text-right flex flex-col justify-between h-20 relative group ${cellBg} ${
                    isSelected ? 'ring-2 ring-slate-900 ring-offset-2' : ''
                  }`}
                >
                  <div className="flex items-center justify-between w-full">
                    <span className="text-[11px] font-bold tabular-nums">
                      {formatShortArabicDate(date)}
                    </span>
                    {isCurrentDay && (
                      <span className="text-[9px] px-1 rounded bg-black/20 font-bold">
                        اليوم
                      </span>
                    )}
                  </div>

                  <div className="w-full">
                    {hasHabits ? (
                      <div className="flex items-baseline justify-between text-[11px]">
                        <span className="tabular-nums font-semibold">
                          {progress.completedFull + progress.completedMinimum}/{progress.totalHabits}
                        </span>
                        <span className="tabular-nums font-bold">{rate}%</span>
                      </div>
                    ) : (
                      <span className="text-[10px] opacity-60">راحة</span>
                    )}
                  </div>

                  {/* Tooltip on hover */}
                  <div className="hidden group-hover:block absolute bottom-full mb-1 right-1/2 translate-x-1/2 z-30 bg-slate-900 text-white text-[11px] p-2 rounded-lg shadow-lg whitespace-nowrap pointer-events-none">
                    <div className="font-bold">{formatArabicDate(date)}</div>
                    <div>كامل: {progress.completedFull} · حد أدنى: {progress.completedMinimum} · متبقي: {progress.missed}</div>
                    <div className="text-emerald-400 font-semibold">معدل الإنجاز: {progress.rate}%</div>
                  </div>
                </button>
              );
            })}
          </div>
        </div>
      </div>

      {/* Heatmap Legend */}
      <div className="flex flex-wrap items-center justify-between text-xs text-slate-500 pt-3 border-t border-slate-100 gap-3">
        <div className="flex items-center gap-3">
          <span className="text-slate-400 text-[11px]">مستويات الإنجاز:</span>
          <div className="flex items-center gap-1">
            <span className="w-3 h-3 rounded-xs bg-emerald-600" />
            <span>100% مكتمل</span>
          </div>
          <div className="flex items-center gap-1">
            <span className="w-3 h-3 rounded-xs bg-emerald-500" />
            <span>60-99%</span>
          </div>
          <div className="flex items-center gap-1">
            <span className="w-3 h-3 rounded-xs bg-teal-400" />
            <span>حد أدنى (أكبر من 0%)</span>
          </div>
          <div className="flex items-center gap-1">
            <span className="w-3 h-3 rounded-xs bg-rose-50 border border-rose-200" />
            <span>انقطاع / تعثر</span>
          </div>
        </div>

        <span className="text-[11px] text-slate-400">
          انقر فوق أي مربع لتعديل أو تسجيل عادات ذلك اليوم
        </span>
      </div>
    </section>
  );
};
