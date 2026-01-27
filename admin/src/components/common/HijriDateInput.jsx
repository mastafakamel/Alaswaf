import { useState, useEffect } from 'react';
import { toHijri, toGregorian, getHijriComponents } from '../utils/dateConverter';

/**
 * Hijri Date Input Component
 * Allows input of Hijri dates and converts to Gregorian for storage
 */
export default function HijriDateInput({ value, onChange, label, required = false }) {
    const [hijriDate, setHijriDate] = useState({ year: '', month: '', day: '' });

    // Initialize hijri date from gregorian value
    useEffect(() => {
        if (value) {
            const parts = getHijriComponents(value);
            setHijriDate(parts);
        } else {
            setHijriDate({ year: '', month: '', day: '' });
        }
    }, [value]);

    const handleChange = (field, val) => {
        const updated = { ...hijriDate, [field]: val };
        setHijriDate(updated);

        // Convert to Gregorian and notify parent
        if (updated.year && updated.month && updated.day) {
            try {
                const gregorian = toGregorian(
                    parseInt(updated.year),
                    parseInt(updated.month),
                    parseInt(updated.day)
                );
                const formatted = gregorian.toISOString().split('T')[0];
                onChange(formatted);
            } catch (e) {
                console.error('Invalid Hijri date:', e);
            }
        } else if (!updated.year && !updated.month && !updated.day) {
            // All cleared, notify parent
            onChange('');
        }
    };

    const hijriMonths = [
        '1 - محرم', '2 - صفر', '3 - ربيع الأول', '4 - ربيع الآخر',
        '5 - جمادى الأولى', '6 - جمادى الآخرة', '7 - رجب', '8 - شعبان',
        '9 - رمضان', '10 - شوال', '11 - ذو القعدة', '12 - ذو الحجة'
    ];

    return (
        <div className="field">
            <span className="field-label">
                📅 {label} {required && <span style={{ color: 'var(--color-error)' }}>*</span>}
            </span>
            <div style={{ display: 'grid', gridTemplateColumns: '100px 1fr 110px', gap: '8px', alignItems: 'center' }}>
                {/* Day */}
                <div>
                    <input
                        type="number"
                        className="input"
                        placeholder="اليوم"
                        value={hijriDate.day}
                        onChange={(e) => handleChange('day', e.target.value)}
                        min="1"
                        max="30"
                        style={{ textAlign: 'center', fontSize: '0.95rem' }}
                    />
                </div>

                {/* Month Dropdown */}
                <div>
                    <select
                        className="input"
                        value={hijriDate.month}
                        onChange={(e) => handleChange('month', e.target.value)}
                        style={{ fontSize: '0.9rem' }}
                    >
                        <option value="">اختر الشهر</option>
                        {hijriMonths.map((month, idx) => (
                            <option key={idx} value={idx + 1}>
                                {month}
                            </option>
                        ))}
                    </select>
                </div>

                {/* Year */}
                <div>
                    <input
                        type="number"
                        className="input"
                        placeholder="السنة هـ"
                        value={hijriDate.year}
                        onChange={(e) => handleChange('year', e.target.value)}
                        min="1400"
                        max="1500"
                        style={{ textAlign: 'center', fontSize: '0.95rem' }}
                    />
                </div>
            </div>

            {/* Show Gregorian equivalent */}
            {value && (
                <small style={{
                    color: 'var(--color-primary)',
                    marginTop: '6px',
                    display: 'block',
                    fontSize: '0.85rem',
                    fontWeight: '500'
                }}>
                    📆 الموافق ميلادي: {new Date(value).toLocaleDateString('ar-SA')}
                </small>
            )}
        </div>
    );
}
