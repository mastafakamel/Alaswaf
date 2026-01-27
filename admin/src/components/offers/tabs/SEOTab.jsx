import { useState } from "react";
import { api } from "../../../lib/api";
import { toastError, toastSuccess } from "../../../lib/toast";

export default function SEOTab({ offer, onChange }) {
    const [form, setForm] = useState({
        metaTitle: offer?.metaTitle || "",
        metaDescription: offer?.metaDescription || "",
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
            toastSuccess("تم حفظ إعدادات SEO بنجاح ✅");
        } catch (e) {
            toastError(e.message || "فشل الحفظ");
        } finally {
            setSaving(false);
        }
    }

    return (
        <div className="form-grid">
            <div style={{ gridColumn: "1 / -1" }}>
                <div className="field">
                    <span className="field-label">🔍 عنوان الصفحة (Meta Title)</span>
                    <input
                        className="input"
                        value={form.metaTitle}
                        onChange={e => update("metaTitle", e.target.value)}
                        placeholder="يظهر في محركات البحث وعنوان التبويب..."
                    />
                    <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: 4 }}>
                        <p className="muted small">الموصى به: 50-60 حرفاً لجذب الانتباه.</p>
                        <span className={`small ${form.metaTitle.length > 60 ? 'text-danger' : 'muted'}`}>{form.metaTitle.length} حرف</span>
                    </div>
                </div>
            </div>

            <div style={{ gridColumn: "1 / -1" }}>
                <div className="field">
                    <span className="field-label">📄 وصف الصفحة (Meta Description)</span>
                    <textarea
                        className="input"
                        rows={5}
                        value={form.metaDescription}
                        onChange={e => update("metaDescription", e.target.value)}
                        placeholder="وصف جذاب للمستخدم في نتائج البحث يشجع على النقر..."
                    />
                    <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: 4 }}>
                        <p className="muted small">الموصى به: 150-160 حرفاً لوصف شامل.</p>
                        <span className={`small ${form.metaDescription.length > 160 ? 'text-danger' : 'muted'}`}>{form.metaDescription.length} حرف</span>
                    </div>
                </div>
            </div>

            <div style={{ gridColumn: "1 / -1", marginTop: 30 }}>
                <button className="btn btn-glow" style={{ width: '100%', padding: '16px' }} type="button" disabled={saving} onClick={onSave}>
                    {saving ? "جاري الحفظ..." : "حفظ إعدادات الأرشفة (SEO) ✅"}
                </button>
            </div>
        </div>
    );
}
