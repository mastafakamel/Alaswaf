/**
 * Hijri to Gregorian Date Converter for Backend
 */

// Convert Hijri to Gregorian
function toGregorian(hijriYear, hijriMonth, hijriDay) {
    const l = hijriDay + Math.floor((11 * hijriYear + 3) / 30) +
        354 * hijriYear + 30 * hijriMonth -
        Math.floor((hijriMonth - 1) / 2);
    const jdn = l + 1948440 - 385;

    let a = jdn + 32044;
    let b = Math.floor((4 * a + 3) / 146097);
    let c = a - Math.floor(146097 * b / 4);
    let d = Math.floor((4 * c + 3) / 1461);
    let e = c - Math.floor(1461 * d / 4);
    let m = Math.floor((5 * e + 2) / 153);

    const day = e - Math.floor((153 * m + 2) / 5) + 1;
    const month = m + 3 - 12 * Math.floor(m / 10);
    const year = 100 * b + d - 4800 + Math.floor(m / 10);

    return new Date(year, month - 1, day);
}

// Convert Gregorian to Hijri
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

    return { day: Math.floor(hijriDay), month: Math.floor(hijriMonth), year: Math.floor(hijriYear) };
}

module.exports = {
    toGregorian,
    toHijri
};
