import React from 'react';
import { Habit, HabitLog } from '../types/habit';
import { calculateDayProgress } from '../utils/statsCalculator';
import { getPastNDays, formatShortArabicDate, isToday, isSameDay } from '../utils/dateUtils';
import { Calendar, ChevronRight, ChevronLeft, RotateCcw } from 'lucide-react';

interface InteractiveTimelineProps {
  selectedDate: string;
  onSelectDate: (date: string) => void;
  habits: Habit[];
  logs: HabitLog[];
  todayDate: string;
}

export const InteractiveTimeline: React.FC<InteractiveTimelineProps> = ({
  selectedDate,
  onSelectDate,
  habits,
  logs,
  todayDate,
}) => {
  // 7-day window
  const past7Days = getPastNDays(7, todayDate);

  const daysData = past7Days.map((dateStr) => {
    const progress = calculateDayProgress(dateStr, habits, logs);
    return {
      dateStr,
      progress,
      isCurrentDay: isToday(dateStr),
      isSelected: isSameDay(dateStr, selectedDate),
    };
  });

  return (
    <section className="bg-white border border-slate-200/90 rounded-2xl p-5 sm:p-6 shadow-xs">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-5">
        <div>
          <div className="flex items-center gap-2 text-xs font-medium text-slate-500 mb-0.5">
            <Calendar className="w-3.5 h-3.5" />
            <span>الرسم البياني للأيام السبعة الأخيرة</span>
            <span aria-hidden="true">·</span>
            <span>تفاعل واختيار لمراجعة أو تصحيح أي يوم</span>
          </div>
          <h2 className="text-base font-bold text-slate-900">
            توزيع الإنجاز ومسار الأسبوع
          </h2>
        </div>

        {!isToday(selectedDate) && (
          <button
            onClick={() => onSelectDate(todayDate)}
            className="self-start sm:self-auto text-xs font-semibold px-3 py-1.5 rounded-lg bg-emerald-50 text-emerald-700 hover:bg-emerald-100 border border-emerald-200 transition-colors flex items-center gap-1.5"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span>العودة لتسجيل اليوم الحالي</span>
          </button>
        )}
      </div>

      {/* 7-Day Interactive Columns */}
      <div className="grid grid-cols-7 gap-2 sm:gap-3 items-end pt-2 pb-1">
        {daysData.map((day) => {
          const { progress, isCurrentDay, isSelected, dateStr } = day;
          const total = progress.totalHabits;
          const fullPct = total > 0 ? Math.round((progress.completedFull / total) * 100) : 0;
          const minPct = total > 0 ? Math.round((progress.completedMinimum / total) * 100) : 0;
          const missedPct = Math.max(0, 100 - fullPct - minPct);

          return (
            <button
              key={dateStr}
              onClick={() => onSelectDate(dateStr)}
              className={`flex flex-col items-center p-2 sm:p-2.5 rounded-xl transition-all text-center group cursor-pointer focus:outline-hidden ${
                isSelected
                  ? 'bg-slate-900 text-white ring-2 ring-slate-900 ring-offset-2'
                  : 'hover:bg-slate-100/80 bg-slate-50/60 border border-slate-100'
              }`}
            >
              {/* Day Name */}
              <span
                className={`text-[11px] sm:text-xs font-medium whitespace-nowrap mb-1 ${
                  isSelected ? 'text-slate-200' : 'text-slate-600'
                }`}
              >
                {progress.dayName}
              </span>

              {/* Day Number / Month */}
              <span
                className={`text-[10px] sm:text-[11px] whitespace-nowrap mb-3 font-semibold tabular-nums ${
                  isSelected ? 'text-emerald-400' : 'text-slate-500'
                }`}
              >
                {formatShortArabicDate(dateStr)}
              </span>

              {/* Vertical Stacked Bar Chart */}
              <div className="w-full max-w-[28px] sm:max-w-[36px] h-24 bg-slate-200/70 rounded-md overflow-hidden flex flex-col-reverse relative my-1">
                {/* Full completion portion */}
                <div
                  style={{ height: `${fullPct}%` }}
                  className="w-full bg-emerald-500 transition-all duration-300"
                  title={`إنجاز كامل: ${progress.completedFull}`}
                />
                {/* Minimum baseline portion */}
                <div
                  style={{ height: `${minPct}%` }}
                  className="w-full bg-teal-400 transition-all duration-300"
                  title={`حد أدنى: ${progress.completedMinimum}`}
                />
              </div>

              {/* Daily Rate */}
              <span
                className={`text-[11px] sm:text-xs font-bold mt-2 tabular-nums ${
                  isSelected ? 'text-white' : 'text-slate-800'
                }`}
              >
                {progress.rate}%
              </span>

              {/* Marker for today */}
              {isCurrentDay && (
                <span
                  className={`text-[9px] font-semibold mt-1 px-1.5 py-0.5 rounded ${
                    isSelected ? 'bg-slate-800 text-emerald-300' : 'bg-slate-200 text-slate-700'
                  }`}
                >
                  اليوم
                </span>
              )}
            </button>
          );
        })}
      </div>

      {/* Legend / Key */}
      <div className="flex flex-wrap items-center justify-between text-xs text-slate-500 mt-4 pt-3 border-t border-slate-100 gap-2">
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 rounded-sm bg-emerald-500" />
            <span>إنجاز كامل للهدف</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 rounded-sm bg-teal-400" />
            <span>الحد الأدنى الواقعي</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 rounded-sm bg-slate-200" />
            <span>لم يُنجز / راحة</span>
          </div>
        </div>

        <span className="text-[11px] text-slate-500">
          انقر على أي يوم لاستعراض عاداته أو تصحيح تسجيل سابق
        </span>
      </div>
    </section>
  );
};
