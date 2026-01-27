/**
 * Date formatting utilities for both Gregorian and Hijri calendars
 */

// Hijri converter using Kuwaiti algorithm
function toHijri(date) {
  const gregorianDate = new Date(date);

  const year = gregorianDate.getFullYear();
  const month = gregorianDate.getMonth() + 1;
  const day = gregorianDate.getDate();

  let a = Math.floor((14 - month) / 12);
  let y = year + 4800 - a;
  let m = month + 12 * a - 3;

  let jdn = day + Math.floor((153 * m + 2) / 5) + 365 * y +
    Math.floor(y / 4) - Math.floor(y / 100) +
    Math.floor(y / 400) - 32045;

  const l = jdn - 1948440 + 10632;
  const n = Math.floor((l - 1) / 10631);
  let l2 = l - 10631 * n + 354;
  const j = Math.floor((10985 - l2) / 5316) * Math.floor((50 * l2) / 17719) +
    Math.floor(l2 / 5670) * Math.floor((43 * l2) / 15238);
  l2 = l2 - Math.floor((30 - j) / 15) * Math.floor((17719 * j) / 50) -
    Math.floor(j / 16) * Math.floor((15238 * j) / 43) + 29;

  const hijriMonth = Math.floor((24 * l2) / 709);
  const hijriDay = l2 - Math.floor((709 * hijriMonth) / 24);
  const hijriYear = 30 * n + j - 30;

  return { day: hijriDay, month: hijriMonth, year: hijriYear };
}

const hijriMonthNames = [
  'محرم', 'صفر', 'ربيع الأول', 'ربيع الآخر',
  'جمادى الأولى', 'جمادى الآخرة', 'رجب', 'شعبان',
  'رمضان', 'شوال', 'ذو القعدة', 'ذو الحجة'
];

export function formatGregorian(date) {
  if (!date) return '';
  return new Date(date).toLocaleDateString('ar-SA');
}

export function formatHijri(date) {
  if (!date) return '';
  const hijri = toHijri(date);
  return `${hijri.day} ${hijriMonthNames[hijri.month - 1]} ${hijri.year}`;
}

export function formatHijriNumeric(date) {
  if (!date) return '';
  const hijri = toHijri(date);
  return `${hijri.day}/${hijri.month}/${hijri.year}`;
}

export function formatBothDates(date) {
  if (!date) return 'غير متوفر';
  const hijri = formatHijri(date);
  const gregorian = formatGregorian(date);
  return `${hijri} هـ (${gregorian} م)`;
}

export function formatDateForCard(date) {
  if (!date) return 'غير متوفر';
  return `${formatHijriNumeric(date)} هـ`;
}

/**
 * Format Hijri date from components object
 * @param {object} hijri - { year, month, day }
 * @returns {string}
 */
export function formatHijriFromComponents(hijri) {
  if (!hijri || !hijri.year) return '';
  const hijriMonthNames = [
    'محرم', 'صفر', 'ربيع الأول', 'ربيع الآخر',
    'جمادى الأولى', 'جمادى الآخرة', 'رجب', 'شعبان',
    'رمضان', 'شوال', 'ذو القعدة', 'ذو الحجة'
  ];
  return `${hijri.day} ${hijriMonthNames[hijri.month - 1]} ${hijri.year}`;
}
