import { useState } from "react";
import { api } from "../../../lib/api";
import { toastError, toastSuccess } from "../../../lib/toast";

export default function ContentTab({ offer, onChange }) {
    const [form, setForm] = useState({
        summary: offer?.summary || "",
        description: offer?.description || "",
        runText: offer?.runText || "",
        pickupInfo: offer?.pickupInfo || "",
        cancellationPolicy: offer?.cancellationPolicy || "",
    });

    const [saving, setSaving] = useState(false);

    function update(field, value) {
        setForm(f => ({ ...f, [field]: value }));
    }

    async function onSave() {
        setSaving(true);
        try {
            const res = await api.adminUpdateOffer(offer.id, form);
            onChange(res?.data || res);
            toastSuccess("تم حفظ المحتوى بنجاح ✅");
        } catch (e) {
            toastError(e.message || "فشل الحفظ");
        } finally {
            setSaving(false);
        }
    }

    return (
        <div className="form-grid">
            <div style={{ gridColumn: "1 / -1" }}>
                <label className="field">
                    <span className="field-label">📝 ملخص العرض (يظهر في البطاقات)</span>
                    <textarea
                        className="input"
                        rows={2}
                        value={form.summary}
                        onChange={e => update("summary", e.target.value)}
                        placeholder="وصف قصير جداً يظهر في البطاقات الخارجية (سيو/مشاركة)..."
                    />
                </label>
            </div>

            <div style={{ gridColumn: "1 / -1" }}>
                <label className="field">
                    <span className="field-label">📖 وصف العرض الكامل (المحتوى)</span>
                    <textarea
                        className="input"
                        rows={12}
                        value={form.description}
                        onChange={e => update("description", e.target.value)}
                        placeholder="اكتب تفاصيل الرحلة كاملة هنا..."
                        style={{ lineHeight: '1.6' }}
                    />
                </label>
            </div>

            <div className="field">
                <span className="field-label">🚐 معلومات التوصيل (Pickup)</span>
                <textarea
                    className="input"
                    rows={4}
                    value={form.pickupInfo}
                    onChange={e => update("pickupInfo", e.target.value)}
                    placeholder="تفاصيل التجمع والتحرك..."
                />
            </div>

            <div className="field">
                <span className="field-label">⚠️ سياسة الإلغاء</span>
                <textarea
                    className="input"
                    rows={4}
                    value={form.cancellationPolicy}
                    onChange={e => update("cancellationPolicy", e.target.value)}
                    placeholder="شروط إلغاء الحجز واسترداد المبالغ..."
                />
            </div>

            <div style={{ gridColumn: "1 / -1", marginTop: 20 }}>
                <button className="btn btn-glow" style={{ width: '100%', padding: '16px' }} type="button" disabled={saving} onClick={onSave}>
                    {saving ? "جاري الحفظ..." : "حفظ المحتوى"}
                </button>
            </div>
        </div>
    );
}
