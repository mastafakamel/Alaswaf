import { useState, useEffect, useRef } from 'react';
import { toHijri, toGregorian } from '../../utils/dateConverter';
import { X } from 'lucide-react';
import './HijriDatePicker.css';

const hijriMonthNames = [
    'محرم', 'صفر', 'ربيع الأول', 'ربيع الآخر',
    'جمادى الأولى', 'جمادى الآخرة', 'رجب', 'شعبان',
    'رمضان', 'شوال', 'ذو القعدة', 'ذو الحجة'
];

const weekDays = ['الأحد', 'الاثنين', 'الثلاثاء', 'الأربعاء', 'الخميس', 'الجمعة', 'السبت'];

export default function HijriDatePicker({ value, onChange, label, required = false }) {
    const [isOpen, setIsOpen] = useState(false);
    const [currentHijriMonth, setCurrentHijriMonth] = useState({ month: 1, year: 1447 });
    const [selectedHijri, setSelectedHijri] = useState(null);
    const pickerRef = useRef(null);

    useEffect(() => {
        if (value && value.year && value.month && value.day) {
            // Value is already a Hijri date object
            setSelectedHijri(value);
            setCurrentHijriMonth({ month: value.month, year: value.year });
        } else {
            // Initialize with today's Hijri date
            const today = new Date();
            const todayHijri = toHijri(today);
            setCurrentHijriMonth({ month: todayHijri.month, year: todayHijri.year });
        }
    }, [value]);

    // Close picker when clicking outside
    useEffect(() => {
        function handleClickOutside(event) {
            if (pickerRef.current && !pickerRef.current.contains(event.target)) {
                setIsOpen(false);
            }
        }
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    const getDaysInMonth = (month, year) => {
        // Hijri months alternate between 30 and 29 days (with some exceptions)
        return (month % 2 === 1 || month === 12) ? 30 : 29;
    };

    const getFirstDayOfMonth = (month, year) => {
        const gregorian = toGregorian(year, month, 1);
        return gregorian.getDay(); // 0 = Sunday
    };

    const handleDayClick = (day) => {
        const hijriComponents = {
            year: currentHijriMonth.year,
            month: currentHijriMonth.month,
            day: day
        };
        onChange(hijriComponents);
        setIsOpen(false);
    };

    const nextMonth = () => {
        let newMonth = currentHijriMonth.month + 1;
        let newYear = currentHijriMonth.year;
        if (newMonth > 12) {
            newMonth = 1;
            newYear++;
        }
        setCurrentHijriMonth({ month: newMonth, year: newYear });
    };

    const prevMonth = () => {
        let newMonth = currentHijriMonth.month - 1;
        let newYear = currentHijriMonth.year;
        if (newMonth < 1) {
            newMonth = 12;
            newYear--;
        }
        setCurrentHijriMonth({ month: newMonth, year: newYear });
    };

    const renderCalendar = () => {
        const daysInMonth = getDaysInMonth(currentHijriMonth.month, currentHijriMonth.year);
        const firstDay = getFirstDayOfMonth(currentHijriMonth.month, currentHijriMonth.year);
        const days = [];

        // Empty cells before first day
        for (let i = 0; i < firstDay; i++) {
            days.push(<div key={`empty-${i}`} className="hijri-day hijri-day--empty"></div>);
        }

        // Days of month
        for (let day = 1; day <= daysInMonth; day++) {
            const isSelected = selectedHijri &&
                selectedHijri.day === day &&
                selectedHijri.month === currentHijriMonth.month &&
                selectedHijri.year === currentHijriMonth.year;

            days.push(
                <div
                    key={day}
                    className={`hijri-day ${isSelected ? 'hijri-day--selected' : ''}`}
                    onClick={() => handleDayClick(day)}
                >
                    {day}
                </div>
            );
        }

        return days;
    };

    const formatDisplayValue = () => {
        if (!value || !value.year) return '';
        return `${value.day} ${hijriMonthNames[value.month - 1]} ${value.year} هـ`;
    };

    return (
        <div className="hijri-date-picker" ref={pickerRef}>
            <div className="field">
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <span className="field-label">
                        📅 {label} {required && <span style={{ color: 'var(--color-error)' }}>*</span>}
                    </span>
                    {value && value.year && (
                        <button
                            type="button"
                            className="hijri-clear-trigger"
                            onClick={(e) => {
                                e.stopPropagation();
                                onChange('');
                            }}
                        >
                            <X size={12} strokeWidth={3} />
                            مسح
                        </button>
                    )}
                </div>
                <div
                    className="hijri-date-input"
                    onClick={() => setIsOpen(!isOpen)}
                >
                    <svg width="18" height="18" fill="currentColor" viewBox="0 0 24 24">
                        <path d="M19 3h-1V1h-2v2H8V1H6v2H5c-1.11 0-1.99.9-1.99 2L3 19c0 1.1.89 2 2 2h14c1.1 0 2-.9 2-2V5c0-1.1-.9-2-2-2zm0 16H5V8h14v11zM7 10h5v5H7z" />
                    </svg>
                    <span>{formatDisplayValue() || 'اختر التاريخ'}</span>
                </div>

                {value && value.year && (
                    <small style={{
                        color: 'var(--color-primary)',
                        marginTop: '6px',
                        display: 'block',
                        fontSize: '0.85rem',
                        fontWeight: '500'
                    }}>
                        📆 الموافق ميلادي: {toGregorian(value.year, value.month, value.day).toLocaleDateString('ar-SA')}
                    </small>
                )}
            </div>

            {isOpen && (
                <div className="hijri-calendar">
                    <div className="hijri-calendar__header">
                        <button type="button" onClick={prevMonth} className="hijri-nav-btn">‹</button>
                        <div className="hijri-calendar__title">
                            {hijriMonthNames[currentHijriMonth.month - 1]} {currentHijriMonth.year}
                        </div>
                        <button type="button" onClick={nextMonth} className="hijri-nav-btn">›</button>
                    </div>

                    <div className="hijri-calendar__weekdays">
                        {['أحد', 'إثن', 'ثلا', 'أرب', 'خمي', 'جمع', 'سبت'].map((day, idx) => (
                            <div key={idx} className="hijri-weekday">{day}</div>
                        ))}
                    </div>

                    <div className="hijri-calendar__days">
                        {renderCalendar()}
                    </div>

                    {value && (
                        <div className="hijri-calendar__footer">
                            <button
                                type="button"
                                onClick={() => {
                                    onChange('');
                                    setIsOpen(false);
                                }}
                                className="hijri-clear-btn"
                            >
                                مسح
                            </button>
                        </div>
                    )}
                </div>
            )}
        </div>
    );
}
