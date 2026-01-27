import { useState } from "react";
import { api } from "../../../lib/api";
import { toastError, toastSuccess } from "../../../lib/toast";

export default function ItineraryTab({ offer, onChange }) {
    // Itinerary might be on itinerary field
    const [items, setItems] = useState(
        (offer?.itinerary || []).map(it => ({
            dayNumber: it.dayNumber,
            title: it.title,
            description: it.description || "",
            imageUrl: it.imageUrl || "",
        }))
    );

    const [saving, setSaving] = useState(false);

    function addItem() {
        const nextDay = items.length + 1;
        setItems([...items, { dayNumber: nextDay, title: `اليوم ${nextDay}`, description: "", imageUrl: "" }]);
    }

    function removeItem(index) {
        setItems(items.filter((_, i) => i !== index));
    }

    function updateItem(index, field, value) {
        const list = [...items];
        list[index][field] = value;
        setItems(list);
    }

    async function onSave() {
        setSaving(true);
        try {
            // Send itinerary as array
            const res = await api.adminUpdateOffer(offer.id, { itinerary: items });
            onChange(res?.data || res);
            toastSuccess("تم حفظ البرنامج بنجاح ✅");
        } catch (e) {
            toastError(e.message || "فشل الحفظ");
        } finally {
            setSaving(false);
        }
    }

    return (
        <div className="itinerary-editor">
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 24 }}>
                <div>
                    <h3 className="field-label" style={{ marginBottom: 4 }}>📅 برنامج الرحلة (يوم بيوم)</h3>
                    <p className="muted small">أضف تفاصيل الأحداث والأنشطة لكل يوم من أيام الرحلة.</p>
                </div>
                <button className="btn btn-primary" type="button" onClick={addItem}>+ إضافة يوم جديد</button>
            </div>

            <div style={{ display: "flex", flexDirection: "column", gap: 24 }}>
                {items.length === 0 && (
                    <div className="table-empty" style={{ padding: '60px' }}>
                        لا يوجد برنامج مضاف بعد. ابدأ بإضافة اليوم الأول!
                    </div>
                )}

                {items.map((it, idx) => (
                    <div key={idx} className="card" style={{ padding: 24, border: '1px solid var(--border)', boxShadow: 'var(--shadow-sm)' }}>
                        <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 20, alignItems: 'center' }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                                <span className="status status-on" style={{ fontSize: 14, fontWeight: 800, padding: '6px 16px' }}>اليوم {it.dayNumber}</span>
                                <b style={{ fontSize: 16 }}>{it.title || "بدون عنوان"}</b>
                            </div>
                            <button className="btn btn-danger btn-sm" type="button" style={{ padding: '8px 16px' }} onClick={() => removeItem(idx)}>حذف اليوم</button>
                        </div>

                        <div className="form-grid">
                            <div className="field">
                                <span className="field-label">عنوان اليوم</span>
                                <input className="input" value={it.title} placeholder="مثال: الوصول والاستقبال..." onChange={e => updateItem(idx, "title", e.target.value)} />
                            </div>
                            <div className="field">
                                <span className="field-label">رابط صورة توضيحية (اختياري)</span>
                                <input className="input" value={it.imageUrl} placeholder="https://..." onChange={e => updateItem(idx, "imageUrl", e.target.value)} />
                            </div>
                            <div style={{ gridColumn: "1 / -1" }}>
                                <span className="field-label">وصف الأنشطة والأحداث</span>
                                <textarea className="input" rows={4} value={it.description} placeholder="اكتب بالتفصيل ماذا سيفعل المسافرون في هذا اليوم..." onChange={e => updateItem(idx, "description", e.target.value)} />
                            </div>
                        </div>
                    </div>
                ))}
            </div>

            <div style={{ marginTop: 40 }}>
                <button className="btn btn-glow" type="button" disabled={saving} onClick={onSave} style={{ width: "100%", padding: '18px' }}>
                    {saving ? "جاري حفظ البرنامج..." : "حفظ برنامج الرحلة بالكامل ✅"}
                </button>
            </div>
        </div>
    );
}
