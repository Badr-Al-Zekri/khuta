import React from 'react';
import { OverallStats } from '../types/habit';
import { formatArabicDate, isToday } from '../utils/dateUtils';
import { ArrowUpRight, ArrowDownRight, Flame, CheckCircle2, TrendingUp, Calendar } from 'lucide-react';

interface DailyOverviewProps {
  selectedDate: string;
  stats: OverallStats;
  remainingCount: number;
}

export const DailyOverview: React.FC<DailyOverviewProps> = ({
  selectedDate,
  stats,
  remainingCount,
}) => {
  const isViewingToday = isToday(selectedDate);
  const formattedDate = formatArabicDate(selectedDate);

  // Behavioral supportive feedback sentence based on progress
  let supportiveMessage = '';
  if (stats.todayRate === 100 && stats.todayTotalCount > 0) {
    supportiveMessage = 'إنجاز كامل لجميع عادات اليوم! حافظت على الزخم وبنيت خطوة حقيقية للأمام.';
  } else if (stats.todayRate >= 50) {
    supportiveMessage = 'قطعت أكثر من نصف الطريق اليوم. حتى إنجاز الحد الأدنى لما تبقى يُبقي السلسلة حية.';
  } else if (remainingCount > 0) {
    supportiveMessage = 'لا تفكر في كمال الخطة؛ اختر عادة واحدة وابدأ بحدّها الأدنى (دقيقتين فقط).';
  } else if (stats.todayTotalCount === 0) {
    supportiveMessage = 'لا توجد عادات مجدولة لهذا اليوم. يوم راحة متوازن أو وقت ممتاز للتخطيط.';
  } else {
    supportiveMessage = 'كل خطوة صغيرة تصنع فارقاً تراكمياً مع مرور الأيام.';
  }

  return (
    <section className="bg-white border border-slate-200/90 rounded-2xl p-5 sm:p-6 shadow-xs">
      {/* Top row: Date & status summary */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-6 border-b border-slate-100">
        <div>
          <div className="flex items-center gap-2 text-xs font-medium text-slate-500 mb-1">
            <Calendar className="w-3.5 h-3.5" />
            <span>{isViewingToday ? 'تاريخ اليوم' : 'تاريخ السجل المختار'}</span>
            <span aria-hidden="true">·</span>
            <span>{isViewingToday ? 'سجل مباشر' : 'مراجعة وتعديل'}</span>
          </div>
          <h1 className="text-xl sm:text-2xl font-bold text-slate-900 tracking-tight">
            {formattedDate}
          </h1>
          <p className="text-sm text-slate-600 mt-1 max-w-xl">
            {supportiveMessage}
          </p>
        </div>

        {/* Circular Progress Gauge */}
        <div className="flex items-center gap-4 bg-slate-50 p-3 rounded-xl border border-slate-200/60 self-start md:self-auto">
          <div className="relative w-14 h-14 flex items-center justify-center">
            <svg className="w-14 h-14 -rotate-90" viewBox="0 0 36 36">
              {/* Background track */}
              <path
                className="text-slate-200"
                strokeWidth="3.5"
                stroke="currentColor"
                fill="none"
                d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
              />
              {/* Progress stroke */}
              <path
                className="text-emerald-600 transition-all duration-500 ease-out"
                strokeDasharray={`${stats.todayRate}, 100`}
                strokeWidth="3.5"
                strokeLinecap="round"
                stroke="currentColor"
                fill="none"
                d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
              />
            </svg>
            <div className="absolute inset-0 flex items-center justify-center">
              <span className="text-xs font-bold text-slate-900 tabular-nums">
                {stats.todayRate}%
              </span>
            </div>
          </div>

          <div className="flex flex-col">
            <span className="text-xs text-slate-500 font-medium">إنجاز اليوم</span>
            <span className="text-base font-bold text-slate-900 tabular-nums">
              {stats.todayCompletedCount} / {stats.todayTotalCount} عادة
            </span>
            <span className="text-xs text-slate-500">
              {remainingCount > 0 ? `متبقي ${remainingCount} عادات` : 'اكتملت جميع العادات'}
            </span>
          </div>
        </div>
      </div>

      {/* Metric Cards Grid: 4 Core indicators computed from real data */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 pt-5">
        {/* Metric 1: معدل الالتزام الأسبوعي */}
        <div className="p-3.5 rounded-xl bg-slate-50/80 border border-slate-100 flex flex-col justify-between">
          <div className="flex items-center justify-between text-xs text-slate-500 mb-2">
            <span>معدل الأسبوع</span>
            <TrendingUp className="w-4 h-4 text-slate-400" />
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-2xl font-bold text-slate-900 tabular-nums">
              {stats.currentWeekRate}%
            </span>
            {stats.weeklyDelta !== 0 && (
              <span
                className={`text-xs font-semibold flex items-center tabular-nums ${
                  stats.weeklyDelta > 0 ? 'text-emerald-700' : 'text-amber-700'
                }`}
                title="مقارنة بالأسبوع السابق"
              >
                {stats.weeklyDelta > 0 ? (
                  <ArrowUpRight className="w-3.5 h-3.5" />
                ) : (
                  <ArrowDownRight className="w-3.5 h-3.5" />
                )}
                {Math.abs(stats.weeklyDelta)}% عن السابق
              </span>
            )}
          </div>
          <div className="text-[11px] text-slate-500 mt-1">
            نسبة الالتزام خلال الأيام السبعة الماضية
          </div>
        </div>

        {/* Metric 2: العادات المتبقية اليوم */}
        <div className="p-3.5 rounded-xl bg-slate-50/80 border border-slate-100 flex flex-col justify-between">
          <div className="flex items-center justify-between text-xs text-slate-500 mb-2">
            <span>المتبقي لليوم</span>
            <CheckCircle2 className="w-4 h-4 text-slate-400" />
          </div>
          <div className="flex items-baseline gap-1">
            <span className="text-2xl font-bold text-slate-900 tabular-nums">
              {remainingCount}
            </span>
            <span className="text-xs text-slate-500">من {stats.todayTotalCount}</span>
          </div>
          <div className="text-[11px] text-slate-500 mt-1">
            {remainingCount === 0 ? 'لا توجد مهام معلقة' : 'يمكن إنجازها بالحد الأدنى'}
          </div>
        </div>

        {/* Metric 3: أفضل سلسلة متواصلة */}
        <div className="p-3.5 rounded-xl bg-slate-50/80 border border-slate-100 flex flex-col justify-between">
          <div className="flex items-center justify-between text-xs text-slate-500 mb-2">
            <span>أفضل سلسلة</span>
            <Flame className="w-4 h-4 text-amber-500" />
          </div>
          <div className="flex items-baseline gap-1">
            <span className="text-2xl font-bold text-slate-900 tabular-nums">
              {stats.allTimeBestStreak}
            </span>
            <span className="text-xs text-slate-500">أيام متواصلة</span>
          </div>
          <div className="text-[11px] text-slate-500 mt-1">
            أعلى رقم قياسي في الحفاظ على الزخم
          </div>
        </div>

        {/* Metric 4: إجمالي أيام الإنجاز */}
        <div className="p-3.5 rounded-xl bg-slate-50/80 border border-slate-100 flex flex-col justify-between">
          <div className="flex items-center justify-between text-xs text-slate-500 mb-2">
            <span>إجمالي أيام الإنجاز</span>
            <Calendar className="w-4 h-4 text-slate-400" />
          </div>
          <div className="flex items-baseline gap-1">
            <span className="text-2xl font-bold text-slate-900 tabular-nums">
              {stats.totalDaysLogged}
            </span>
            <span className="text-xs text-slate-500">يوماً مسجلاً</span>
          </div>
          <div className="text-[11px] text-slate-500 mt-1">
            رصيدك الإجمالي من الأيام غير الصفرية
          </div>
        </div>
      </div>
    </section>
  );
};
