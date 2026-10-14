import React, { useState, useEffect } from 'react';
import { Habit, GoalCategory, TimeOfDay, FrequencyType } from '../types/habit';
import { toISODateString, ARABIC_DAYS_FULL } from '../utils/dateUtils';
import { X, Sparkles, HelpCircle, Check, Info } from 'lucide-react';

interface HabitFormModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (habitData: Partial<Habit>) => void;
  initialHabit?: Habit | null;
  categories: GoalCategory[];
}

export const HabitFormModal: React.FC<HabitFormModalProps> = ({
  isOpen,
  onClose,
  onSave,
  initialHabit,
  categories,
}) => {
  const [title, setTitle] = useState('');
  const [categoryId, setCategoryId] = useState(categories[0]?.id || 'health');
  const [targetDescription, setTargetDescription] = useState('');
  const [minimumBaseline, setMinimumBaseline] = useState('');
  const [timeOfDay, setTimeOfDay] = useState<TimeOfDay>('morning');
  const [frequencyType, setFrequencyType] = useState<FrequencyType>('daily');
  const [selectedDays, setSelectedDays] = useState<number[]>([0, 1, 2, 3, 4]); // Sun to Thu default for specific days
  const [cue, setCue] = useState('');
  const [error, setError] = useState('');

  useEffect(() => {
    if (initialHabit) {
      setTitle(initialHabit.title);
      setCategoryId(initialHabit.categoryId);
      setTargetDescription(initialHabit.targetDescription);
      setMinimumBaseline(initialHabit.minimumBaseline);
      setTimeOfDay(initialHabit.timeOfDay);
      setFrequencyType(initialHabit.frequency.type);
      setSelectedDays(initialHabit.frequency.daysOfWeek || [0, 1, 2, 3, 4]);
      setCue(initialHabit.cue || '');
    } else {
      // Defaults for new habit
      setTitle('');
      setCategoryId(categories[0]?.id || 'health');
      setTargetDescription('');
      setMinimumBaseline('');
      setTimeOfDay('morning');
      setFrequencyType('daily');
      setSelectedDays([0, 1, 2, 3, 4]);
      setCue('');
    }
    setError('');
  }, [initialHabit, isOpen, categories]);

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) {
      setError('يرجى كتابة اسم العادة');
      return;
    }
    if (!targetDescription.trim()) {
      setError('يرجى توضيح الهدف الكامل المأمول');
      return;
    }
    if (!minimumBaseline.trim()) {
      setError('الحد الأدنى الواقعي إلزامي لمنع الانقطاع عند هبوط الحماس');
      return;
    }

    onSave({
      id: initialHabit ? initialHabit.id : `habit_${Date.now()}`,
      title: title.trim(),
      categoryId,
      targetDescription: targetDescription.trim(),
      minimumBaseline: minimumBaseline.trim(),
      timeOfDay,
      frequency: {
        type: frequencyType,
        daysOfWeek: frequencyType === 'specific_days' ? selectedDays : undefined,
      },
      cue: cue.trim() || undefined,
      isActive: initialHabit ? initialHabit.isActive : true,
      createdAt: initialHabit ? initialHabit.createdAt : toISODateString(),
    });

    onClose();
  };

  const toggleDay = (dayIndex: number) => {
    if (selectedDays.includes(dayIndex)) {
      if (selectedDays.length > 1) {
        setSelectedDays(selectedDays.filter((d) => d !== dayIndex));
      }
    } else {
      setSelectedDays([...selectedDays, dayIndex].sort());
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-xs">
      <div className="relative w-full max-w-lg bg-white rounded-2xl border border-slate-200 shadow-xl overflow-hidden animate-in fade-in zoom-in-95 duration-150">
        {/* Header */}
        <div className="flex items-center justify-between p-5 border-b border-slate-100 bg-slate-50/50">
          <h2 className="text-base font-bold text-slate-900">
            {initialHabit ? 'تعديل بيانات العادة' : 'بناء عادة جديدة مستدامة'}
          </h2>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-100 flex items-center justify-center transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="p-5 sm:p-6 space-y-4 max-h-[80vh] overflow-y-auto">
          {error && (
            <div className="p-3 bg-rose-50 border border-rose-200 rounded-xl text-xs text-rose-700">
              {error}
            </div>
          )}

          {/* Habit Title */}
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1.5">
              اسم العادة <span className="text-rose-500">*</span>
            </label>
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="مثال: قراءة في كتاب، تمرين رياضي، شرب الماء"
              className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-slate-900 text-sm focus:bg-white focus:ring-1 focus:ring-slate-900 focus:outline-hidden"
              autoFocus
            />
          </div>

          {/* Goal Domain / Category */}
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1.5">
              المجال أو الهدف الأكبر
            </label>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
              {categories.map((cat) => (
                <button
                  type="button"
                  key={cat.id}
                  onClick={() => setCategoryId(cat.id)}
                  className={`p-2 rounded-xl text-xs font-medium border text-right transition-all flex items-center gap-2 ${
                    categoryId === cat.id
                      ? 'bg-slate-900 text-white border-slate-900'
                      : 'bg-slate-50 text-slate-700 border-slate-200 hover:border-slate-300'
                  }`}
                >
                  <span
                    className="w-2.5 h-2.5 rounded-full shrink-0"
                    style={{ backgroundColor: cat.color }}
                  />
                  <span className="truncate">{cat.name}</span>
                </button>
              ))}
            </div>
          </div>

          {/* Target Description */}
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1.5">
              الهدف الكامل المأمول (في الأيام العادية والطاقة المرتفعة) <span className="text-rose-500">*</span>
            </label>
            <input
              type="text"
              value={targetDescription}
              onChange={(e) => setTargetDescription(e.target.value)}
              placeholder="مثال: قراءة 20 صفحة، 30 دقيقة تمرين نشط"
              className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-slate-900 text-sm focus:bg-white focus:ring-1 focus:ring-slate-900 focus:outline-hidden"
            />
          </div>

          {/* Minimum Baseline (Crucial Behavioral Science Component) */}
          <div className="p-3.5 bg-teal-50/50 border border-teal-200/80 rounded-xl space-y-2">
            <div className="flex items-center gap-1.5 text-xs font-bold text-teal-900">
              <Sparkles className="w-4 h-4 text-teal-600" />
              <span>الحد الأدنى الواقعي (Micro-habit)</span>
              <span className="text-rose-500">*</span>
            </div>
            <p className="text-[11px] text-teal-800 leading-relaxed">
              هو الفعل البسيط جداً (أقل من دقيقتين) الذي تلتزم به حتى في أشد الأيام انشغالاً أو إرهاقاً لمنع انقطاع السلسلة والحفاظ على هويتك الجديدة.
            </p>
            <input
              type="text"
              value={minimumBaseline}
              onChange={(e) => setMinimumBaseline(e.target.value)}
              placeholder="مثال: قراءة صفحة واحدة فقط، 5 ضغطات، دقيقتان تنفس"
              className="w-full px-3 py-2 bg-white border border-teal-300 rounded-xl text-slate-900 text-sm focus:ring-1 focus:ring-teal-600 focus:outline-hidden"
            />
          </div>

          {/* Time of Day */}
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1.5">
              الوقت المفضل للتنفيذ
            </label>
            <div className="grid grid-cols-4 gap-2">
              {[
                { key: 'morning', label: 'الصباح' },
                { key: 'afternoon', label: 'الظهر' },
                { key: 'evening', label: 'المساء' },
                { key: 'anytime', label: 'أي وقت' },
              ].map((item) => (
                <button
                  type="button"
                  key={item.key}
                  onClick={() => setTimeOfDay(item.key as TimeOfDay)}
                  className={`py-2 px-1 text-center rounded-xl text-xs font-medium border transition-all ${
                    timeOfDay === item.key
                      ? 'bg-slate-900 text-white border-slate-900'
                      : 'bg-slate-50 text-slate-700 border-slate-200 hover:border-slate-300'
                  }`}
                >
                  {item.label}
                </button>
              ))}
            </div>
          </div>

          {/* Behavioral Cue / Trigger */}
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              المحفز السلوكي (Habit Cue)
            </label>
            <p className="text-[11px] text-slate-500 mb-1.5">
              اربط العادة بسلوك يومي راسخ موجود أصلاً (مثال: "بعد صب القهوة"، "بمجرد العودة من الدوام")
            </p>
            <input
              type="text"
              value={cue}
              onChange={(e) => setCue(e.target.value)}
              placeholder="مثال: مباشرة بعد إعداد فنجان القهوة الصباحي"
              className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-slate-900 text-sm focus:bg-white focus:ring-1 focus:ring-slate-900 focus:outline-hidden"
            />
          </div>

          {/* Frequency Type */}
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1.5">
              التكرار الأسبوعي
            </label>
            <div className="grid grid-cols-3 gap-2 mb-2">
              {[
                { key: 'daily', label: 'يومياً (7 أيام)' },
                { key: 'weekdays', label: 'أيام العمل فقط' },
                { key: 'specific_days', label: 'أيام محددة' },
              ].map((freq) => (
                <button
                  type="button"
                  key={freq.key}
                  onClick={() => setFrequencyType(freq.key as FrequencyType)}
                  className={`py-2 px-1 text-center rounded-xl text-xs font-medium border transition-all ${
                    frequencyType === freq.key
                      ? 'bg-slate-900 text-white border-slate-900'
                      : 'bg-slate-50 text-slate-700 border-slate-200 hover:border-slate-300'
                  }`}
                >
                  {freq.label}
                </button>
              ))}
            </div>

            {frequencyType === 'specific_days' && (
              <div className="flex items-center justify-between gap-1 p-2 bg-slate-50 rounded-xl border border-slate-200">
                {ARABIC_DAYS_FULL.map((dayName, idx) => {
                  const isSelected = selectedDays.includes(idx);
                  return (
                    <button
                      type="button"
                      key={idx}
                      onClick={() => toggleDay(idx)}
                      className={`w-9 h-9 rounded-lg text-xs font-bold transition-all ${
                        isSelected
                          ? 'bg-slate-900 text-white'
                          : 'bg-white text-slate-600 border border-slate-200'
                      }`}
                    >
                      {dayName[0]}
                    </button>
                  );
                })}
              </div>
            )}
          </div>

          {/* Footer Submit */}
          <div className="pt-3 border-t border-slate-100 flex items-center justify-end gap-3">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-xs font-semibold text-slate-600 hover:text-slate-900"
            >
              إلغاء
            </button>
            <button
              type="submit"
              className="px-5 py-2.5 bg-slate-900 text-white rounded-xl text-xs font-semibold hover:bg-slate-800 transition-colors shadow-xs"
            >
              {initialHabit ? 'حفظ التعديلات' : 'اعتماد وبدء العادة'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
