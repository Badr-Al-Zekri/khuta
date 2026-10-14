import React from 'react';
import { Habit, HabitLog, WeeklyInsight } from '../types/habit';
import { generateWeeklyReview } from '../utils/statsCalculator';
import { X, Award, AlertTriangle, Lightbulb, Compass, CheckCircle, TrendingUp } from 'lucide-react';

interface WeeklyReviewModalProps {
  isOpen: boolean;
  onClose: () => void;
  habits: Habit[];
  logs: HabitLog[];
  todayDate: string;
}

export const WeeklyReviewModal: React.FC<WeeklyReviewModalProps> = ({
  isOpen,
  onClose,
  habits,
  logs,
  todayDate,
}) => {
  if (!isOpen) return null;

  const review: WeeklyInsight = generateWeeklyReview(habits, logs, todayDate);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-xs">
      <div className="relative w-full max-w-xl bg-white rounded-2xl border border-slate-200 shadow-xl overflow-hidden animate-in fade-in zoom-in-95 duration-150">
        {/* Header */}
        <div className="flex items-center justify-between p-5 border-b border-slate-100 bg-slate-50/50">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-emerald-100 text-emerald-800 flex items-center justify-center font-bold">
              <Compass className="w-4 h-4" />
            </div>
            <div>
              <h2 className="text-base font-bold text-slate-900">
                المراجعة الأسبوعية الذكية
              </h2>
              <p className="text-xs text-slate-500">
                قراءة موضوعية مبنية على أرقام وسجلات أدائك الفعلي
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="w-8 h-8 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-100 flex items-center justify-center transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-5 sm:p-6 space-y-5 max-h-[80vh] overflow-y-auto">
          {/* Summary Sentence */}
          <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200/80 text-sm text-slate-700">
            <span className="font-semibold text-slate-900">خلاصة الأسبوع: </span>
            {review.summarySentence}
          </div>

          {/* Cards Grid: Top Habit & Struggled Habit */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
            {/* Most Consistent Habit */}
            <div className="p-4 rounded-xl border border-emerald-100 bg-emerald-50/30 flex flex-col justify-between">
              <div>
                <div className="flex items-center gap-1.5 text-xs font-semibold text-emerald-800 mb-1.5">
                  <Award className="w-4 h-4 text-emerald-600" />
                  <span>العادة الأكثر انتظاماً</span>
                </div>
                {review.mostConsistentHabit ? (
                  <>
                    <h4 className="text-sm font-bold text-slate-900">
                      {review.mostConsistentHabit.habit.title}
                    </h4>
                    <p className="text-xs text-slate-600 mt-1">
                      نسبة الالتزام:{' '}
                      <strong className="text-emerald-700 tabular-nums">
                        {review.mostConsistentHabit.rate}%
                      </strong>{' '}
                      (سلسلة {review.mostConsistentHabit.streak} أيام)
                    </p>
                  </>
                ) : (
                  <p className="text-xs text-slate-500 mt-1">
                    لا تتوفر بيانات كافية بعد
                  </p>
                )}
              </div>
            </div>

            {/* Most Struggled Habit */}
            <div className="p-4 rounded-xl border border-amber-100 bg-amber-50/30 flex flex-col justify-between">
              <div>
                <div className="flex items-center gap-1.5 text-xs font-semibold text-amber-800 mb-1.5">
                  <AlertTriangle className="w-4 h-4 text-amber-600" />
                  <span>العادة التي تتكرر فيها العثرات</span>
                </div>
                {review.mostStruggledHabit ? (
                  <>
                    <h4 className="text-sm font-bold text-slate-900">
                      {review.mostStruggledHabit.habit.title}
                    </h4>
                    <p className="text-xs text-slate-600 mt-1">
                      تعثرت في{' '}
                      <strong className="text-amber-800 tabular-nums">
                        {review.mostStruggledHabit.missedDaysCount} أيام
                      </strong>{' '}
                      (نسبة التزام {review.mostStruggledHabit.rate}%)
                    </p>
                  </>
                ) : (
                  <p className="text-xs text-slate-500 mt-1">
                    أداءك متقارب ومستقر في جميع العادات!
                  </p>
                )}
              </div>
            </div>
          </div>

          {/* Hardest Day of Week if detected */}
          {review.hardestDayOfWeek && (
            <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200/80 text-xs text-slate-700 flex items-center justify-between">
              <span className="font-medium">
                اليوم الأكثر عرضة للتشتت أو الانقطاع:
              </span>
              <span className="font-bold text-slate-900">
                يوم {review.hardestDayOfWeek.dayName} (التزام {review.hardestDayOfWeek.completionRate}%)
              </span>
            </div>
          )}

          {/* The Single Actionable Practical Recommendation */}
          <div className="p-4 rounded-xl bg-indigo-50/60 border border-indigo-200 text-xs sm:text-sm text-indigo-950">
            <div className="flex items-center gap-2 font-bold text-indigo-900 mb-2">
              <Lightbulb className="w-4 h-4 text-indigo-600" />
              <span>التعديل العملي المقترح لهذا الأسبوع:</span>
            </div>
            <p className="leading-relaxed">
              {review.actionableRecommendation}
            </p>
            <div className="mt-3 pt-2.5 border-t border-indigo-100/80 text-[11px] text-indigo-700/90">
              💡 قاعدة علم السلوك: لا تقم بزيادة عبء الأهداف عند التعثر، بل قلّل الاحتكاك واجعل العادة سهلة جداً بحيث يستحيل تفويتها.
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="p-4 border-t border-slate-100 bg-slate-50 flex items-center justify-end">
          <button
            onClick={onClose}
            className="px-4 py-2 bg-slate-900 text-white rounded-xl text-xs font-semibold hover:bg-slate-800 transition-colors"
          >
            فهمت التعديل، سأطبقه اليوم
          </button>
        </div>
      </div>
    </div>
  );
};
