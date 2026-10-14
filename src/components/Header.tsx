import React from 'react';
import { Plus, BarChart2, Calendar, Database } from 'lucide-react';

interface HeaderProps {
  onOpenNewHabit: () => void;
  onOpenWeeklyReview: () => void;
  onOpenDataModal: () => void;
  activeView: 'today' | 'timeline' | 'insights';
  setActiveView: (view: 'today' | 'timeline' | 'insights') => void;
}

export const Header: React.FC<HeaderProps> = ({
  onOpenNewHabit,
  onOpenWeeklyReview,
  onOpenDataModal,
  activeView,
  setActiveView,
}) => {
  return (
    <header className="sticky top-0 z-30 bg-white/95 backdrop-blur-md border-b border-slate-200">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between gap-8">
        {/* Zone 1: Brand wordmark (single text element, no badges) */}
        <div className="flex items-center gap-3 shrink-0">
          <div className="w-9 h-9 rounded-xl bg-slate-900 text-white flex items-center justify-center font-bold text-lg shadow-sm">
            خُ
          </div>
          <div className="flex flex-col">
            <span className="text-lg font-bold tracking-tight text-slate-900 whitespace-nowrap">
              خُطى
            </span>
          </div>
        </div>

        {/* Zone 2: Navigation Links (concise, single-line text links with subtle hover/active states) */}
        <nav className="flex items-center gap-1 sm:gap-6 text-sm font-medium text-slate-600 overflow-x-auto">
          <button
            onClick={() => setActiveView('today')}
            className={`px-3 py-2 rounded-lg transition-colors whitespace-nowrap shrink-0 flex items-center gap-1.5 ${
              activeView === 'today'
                ? 'text-slate-900 font-semibold bg-slate-100'
                : 'hover:text-slate-900'
            }`}
          >
            <span>لوحة اليوم</span>
          </button>

          <button
            onClick={() => setActiveView('timeline')}
            className={`px-3 py-2 rounded-lg transition-colors whitespace-nowrap shrink-0 flex items-center gap-1.5 ${
              activeView === 'timeline'
                ? 'text-slate-900 font-semibold bg-slate-100'
                : 'hover:text-slate-900'
            }`}
          >
            <Calendar className="w-4 h-4" />
            <span>سجل الالتزام (30 يوماً)</span>
          </button>

          <button
            onClick={onOpenWeeklyReview}
            className="px-3 py-2 rounded-lg transition-colors whitespace-nowrap shrink-0 flex items-center gap-1.5 hover:text-slate-900 text-slate-600"
          >
            <BarChart2 className="w-4 h-4 text-emerald-600" />
            <span>المراجعة الأسبوعية</span>
          </button>

          <button
            onClick={onOpenDataModal}
            className="px-3 py-2 rounded-lg transition-colors whitespace-nowrap shrink-0 flex items-center gap-1.5 hover:text-slate-900 text-slate-600 hidden md:flex"
            title="إدارة وتصدير البيانات"
          >
            <Database className="w-4 h-4 text-slate-500" />
            <span>البيانات والنسخ</span>
          </button>
        </nav>

        {/* Zone 3: Exactly 1 Primary Action */}
        <div className="flex items-center gap-2 shrink-0">
          <button
            onClick={onOpenNewHabit}
            className="h-10 px-4 text-sm font-medium text-white bg-slate-900 rounded-xl hover:bg-slate-800 active:scale-[0.98] transition-all flex items-center gap-2 shadow-sm whitespace-nowrap shrink-0"
          >
            <Plus className="w-4 h-4" />
            <span className="hidden sm:inline">إضافة عادة جديدة</span>
            <span className="sm:hidden">إضافة</span>
          </button>
        </div>
      </div>
    </header>
  );
};
