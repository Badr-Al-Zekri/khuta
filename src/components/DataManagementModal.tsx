import React, { useRef, useState } from 'react';
import {
  exportDataAsJSON,
  clearAllData,
  reloadDemoData,
  saveHabitsToStorage,
  saveLogsToStorage,
  saveCategoriesToStorage,
} from '../utils/storage';
import { Habit, HabitLog, GoalCategory } from '../types/habit';
import { X, Download, Upload, RefreshCw, Trash2, ShieldCheck, Check, AlertCircle } from 'lucide-react';

interface DataManagementModalProps {
  isOpen: boolean;
  onClose: () => void;
  onDataReset: (newHabits: Habit[], newLogs: HabitLog[]) => void;
}

export const DataManagementModal: React.FC<DataManagementModalProps> = ({
  isOpen,
  onClose,
  onDataReset,
}) => {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [successMessage, setSuccessMessage] = useState('');
  const [confirmClear, setConfirmClear] = useState(false);

  if (!isOpen) return null;

  const handleExport = () => {
    exportDataAsJSON();
    setSuccessMessage('تم تصدير ملف النسخة الاحتياطية بنجاح.');
    setTimeout(() => setSuccessMessage(''), 3000);
  };

  const handleImportFile = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        const text = event.target?.result as string;
        const parsed = JSON.parse(text);

        if (Array.isArray(parsed.habits) && Array.isArray(parsed.logs)) {
          saveHabitsToStorage(parsed.habits);
          saveLogsToStorage(parsed.logs);
          if (Array.isArray(parsed.categories)) {
            saveCategoriesToStorage(parsed.categories);
          }
          onDataReset(parsed.habits, parsed.logs);
          setSuccessMessage('تم استرجاع النسخة الاحتياطية بنجاح!');
          setTimeout(() => setSuccessMessage(''), 3000);
        } else {
          alert('ملف غير صالح، يجب أن يحتوي على عادات وسجلات صحيحة.');
        }
      } catch (err) {
        alert('حدث خطأ أثناء قراءة الملف، تأكد من صحة تنسيق JSON.');
      }
    };
    reader.readAsText(file);
  };

  const handleReloadDemo = () => {
    const demo = reloadDemoData();
    onDataReset(demo.habits, demo.logs);
    setSuccessMessage('تم تحميل البيانات التجريبية بنجاح.');
    setTimeout(() => setSuccessMessage(''), 3000);
  };

  const handleClearAll = () => {
    if (!confirmClear) {
      setConfirmClear(true);
      return;
    }
    const empty = clearAllData();
    onDataReset(empty.habits, empty.logs);
    setConfirmClear(false);
    setSuccessMessage('تم مسح جميع السجلات والبدء بسجل فارغ جديد.');
    setTimeout(() => setSuccessMessage(''), 3000);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-xs">
      <div className="relative w-full max-w-lg bg-white rounded-2xl border border-slate-200 shadow-xl overflow-hidden animate-in fade-in zoom-in-95 duration-150">
        {/* Header */}
        <div className="flex items-center justify-between p-5 border-b border-slate-100 bg-slate-50/50">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-xl bg-slate-100 text-slate-800 flex items-center justify-center font-bold">
              <ShieldCheck className="w-4 h-4 text-emerald-600" />
            </div>
            <div>
              <h2 className="text-base font-bold text-slate-900">
                إدارة البيانات والخصوصية
              </h2>
              <p className="text-xs text-slate-500">
                تخزين محلي مباشر في متصفحك (Offline LocalStorage)
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

        {/* Body */}
        <div className="p-5 sm:p-6 space-y-4 max-h-[75vh] overflow-y-auto">
          {successMessage && (
            <div className="p-3 rounded-xl bg-emerald-50 border border-emerald-200 text-xs text-emerald-800 flex items-center gap-2">
              <Check className="w-4 h-4 text-emerald-600 shrink-0" />
              <span>{successMessage}</span>
            </div>
          )}

          {/* Privacy & Storage Guarantee Box */}
          <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200/80 text-xs text-slate-600 leading-relaxed">
            <strong className="text-slate-800 block mb-1">
              وضوح وشفافية التخزين:
            </strong>
            بياناتك محفوظة حالياً بشكل محلي وآمن داخل متصفحك دون إرسالها لأي خادم خارجي. للحفاظ على سجلاتك عند تغيير الجهاز أو مسح المتصفح، يمكنك تنزيل نسخة احتياطية في أي وقت واستعادتها بنقرة واحدة.
          </div>

          {/* Action 1: Export JSON */}
          <div className="p-4 rounded-xl border border-slate-200 hover:border-slate-300 transition-colors flex items-center justify-between gap-3">
            <div>
              <h4 className="text-sm font-bold text-slate-900">
                تصدير نسخة احتياطية (JSON)
              </h4>
              <p className="text-xs text-slate-500 mt-0.5">
                حمّل ملفاً يحتوي على جميع عاداتك، سجلاتك اليومية، وملاحظاتك
              </p>
            </div>
            <button
              onClick={handleExport}
              className="px-3.5 py-2 bg-slate-900 text-white rounded-xl text-xs font-semibold hover:bg-slate-800 transition-colors flex items-center gap-1.5 shrink-0"
            >
              <Download className="w-3.5 h-3.5" />
              <span>تصدير الآن</span>
            </button>
          </div>

          {/* Action 2: Import JSON */}
          <div className="p-4 rounded-xl border border-slate-200 hover:border-slate-300 transition-colors flex items-center justify-between gap-3">
            <div>
              <h4 className="text-sm font-bold text-slate-900">
                استيراد من نسخة احتياطية
              </h4>
              <p className="text-xs text-slate-500 mt-0.5">
                استرجع بياناتك المحفوظة سابقاً من ملف JSON
              </p>
            </div>
            <div>
              <input
                ref={fileInputRef}
                type="file"
                accept=".json"
                onChange={handleImportFile}
                className="hidden"
              />
              <button
                onClick={() => fileInputRef.current?.click()}
                className="px-3.5 py-2 bg-slate-100 text-slate-700 hover:bg-slate-200 border border-slate-200 rounded-xl text-xs font-semibold transition-colors flex items-center gap-1.5 shrink-0"
              >
                <Upload className="w-3.5 h-3.5" />
                <span>رفع ملف</span>
              </button>
            </div>
          </div>

          {/* Action 3: Reload Realistic Demo Data */}
          <div className="p-4 rounded-xl border border-slate-200 hover:border-slate-300 transition-colors flex items-center justify-between gap-3">
            <div>
              <h4 className="text-sm font-bold text-slate-900">
                تحميل بيانات تجريبية واقعية
              </h4>
              <p className="text-xs text-slate-500 mt-0.5">
                يملأ اللوحة بـ 5 عادات وسجل 21 يوماً لعرض الرسوم والمؤشرات
              </p>
            </div>
            <button
              onClick={handleReloadDemo}
              className="px-3.5 py-2 bg-slate-100 text-slate-700 hover:bg-slate-200 border border-slate-200 rounded-xl text-xs font-semibold transition-colors flex items-center gap-1.5 shrink-0"
            >
              <RefreshCw className="w-3.5 h-3.5" />
              <span>تحميل التجريبي</span>
            </button>
          </div>

          {/* Action 4: Clear all and start fresh */}
          <div className="p-4 rounded-xl border border-rose-100 bg-rose-50/30 flex items-center justify-between gap-3">
            <div>
              <h4 className="text-sm font-bold text-rose-900">
                مسح البيانات والبدء بسجل فارغ
              </h4>
              <p className="text-xs text-rose-700 mt-0.5">
                إزالة جميع العادات والسجلات للبدء ببياناتك الشخصية الحقيقية
              </p>
            </div>
            <button
              onClick={handleClearAll}
              className={`px-3.5 py-2 rounded-xl text-xs font-semibold transition-colors flex items-center gap-1.5 shrink-0 ${
                confirmClear
                  ? 'bg-rose-600 text-white hover:bg-rose-700'
                  : 'bg-rose-100 text-rose-800 hover:bg-rose-200'
              }`}
            >
              <Trash2 className="w-3.5 h-3.5" />
              <span>{confirmClear ? 'تأكيد المسح النهائي؟' : 'مسح السجل'}</span>
            </button>
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
