/**
 * Date manipulation and formatting utilities for Arabic locale and habit calculations.
 */

// Format a date object to ISO YYYY-MM-DD in local time
export function toISODateString(date: Date = new Date()): string {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

// Parse YYYY-MM-DD into a local Date object safely
export function parseISODate(dateStr: string): Date {
  const [year, month, day] = dateStr.split('-').map(Number);
  return new Date(year, month - 1, day, 12, 0, 0); // Noon to prevent DST shift anomalies
}

// Arabic day names (Starting Sunday)
export const ARABIC_DAYS_FULL = [
  'الأحد',
  'الإثنين',
  'الثلاثاء',
  'الأربعاء',
  'الخميس',
  'الجمعة',
  'السبت'
];

export const ARABIC_DAYS_SHORT = [
  'أحد',
  'إثن',
  'ثلا',
  'أرب',
  'خمي',
  'جمع',
  'سبت'
];

export const ARABIC_MONTHS = [
  'يناير',
  'فبراير',
  'مارس',
  'أبريل',
  'مايو',
  'يونيو',
  'يوليو',
  'أغسطس',
  'سبتمبر',
  'أكتوبر',
  'نوفمبر',
  'ديسمبر'
];

// Format friendly date: "الأربعاء، 14 أكتوبر 2026"
export function formatArabicDate(dateStr: string): string {
  const date = parseISODate(dateStr);
  const dayName = ARABIC_DAYS_FULL[date.getDay()];
  const dayNum = date.getDate();
  const monthName = ARABIC_MONTHS[date.getMonth()];
  const year = date.getFullYear();
  return `${dayName}، ${dayNum} ${monthName} ${year}`;
}

// Format short date: "14 أكتوبر"
export function formatShortArabicDate(dateStr: string): string {
  const date = parseISODate(dateStr);
  const dayNum = date.getDate();
  const monthName = ARABIC_MONTHS[date.getMonth()];
  return `${dayNum} ${monthName}`;
}

// Get the Arabic day name for a date
export function getArabicDayName(dateStr: string): string {
  const date = parseISODate(dateStr);
  return ARABIC_DAYS_FULL[date.getDay()];
}

// Add/subtract days from a date string
export function shiftDate(dateStr: string, daysOffset: number): string {
  const date = parseISODate(dateStr);
  date.setDate(date.getDate() + daysOffset);
  return toISODateString(date);
}

// Get array of past N days ending at baseDate (inclusive)
export function getPastNDays(n: number, baseDate: string = toISODateString()): string[] {
  const days: string[] = [];
  for (let i = n - 1; i >= 0; i--) {
    days.push(shiftDate(baseDate, -i));
  }
  return days;
}

// Check if two dates are the same day
export function isSameDay(dateStr1: string, dateStr2: string): boolean {
  return dateStr1 === dateStr2;
}

// Check if dateStr is today
export function isToday(dateStr: string): boolean {
  return dateStr === toISODateString();
}

// Check if dateStr is yesterday
export function isYesterday(dateStr: string): boolean {
  return dateStr === shiftDate(toISODateString(), -1);
}

// Friendly relative day description: "اليوم", "أمس", "غداً", or "الأربعاء 14 أكتوبر"
export function getRelativeDayLabel(dateStr: string): string {
  if (isToday(dateStr)) return 'اليوم';
  if (isYesterday(dateStr)) return 'أمس';
  const date = parseISODate(dateStr);
  return `${ARABIC_DAYS_SHORT[date.getDay()]} ${date.getDate()} ${ARABIC_MONTHS[date.getMonth()]}`;
}

// Get weekday index (0 = Sunday ... 6 = Saturday)
export function getDayOfWeekIndex(dateStr: string): number {
  return parseISODate(dateStr).getDay();
}

// Check whether a habit is scheduled for a given date based on frequency
export function isHabitScheduledForDate(
  habit: { frequency: { type: string; daysOfWeek?: number[] }; createdAt: string },
  dateStr: string
): boolean {
  // Habit cannot be scheduled before it was created
  if (dateStr < habit.createdAt) {
    return false;
  }

  const { type, daysOfWeek } = habit.frequency;
  if (type === 'daily') {
    return true;
  }

  const dayIndex = getDayOfWeekIndex(dateStr); // 0 = Sun, 5 = Fri, 6 = Sat
  if (type === 'weekdays') {
    // In Arab world, weekdays typically Sunday to Thursday (0, 1, 2, 3, 4)
    return dayIndex >= 0 && dayIndex <= 4;
  }

  if (type === 'specific_days' && Array.isArray(daysOfWeek)) {
    return daysOfWeek.includes(dayIndex);
  }

  return true;
}
