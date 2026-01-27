import { useState, useEffect } from "react";
import { api } from "../../../lib/api";
import { toastError, toastSuccess } from "../../../lib/toast";

export default function DetailsTab({ offer, onChange }) {
    const [form, setForm] = useState({
        durationDays: offer?.durationDays || "",
        durationNights: offer?.durationNights || "",
        offerType: offer?.offerType || "GROUP",
        runText: offer?.runText || "",
        pickupInfo: offer?.pickupInfo || "",
        cancellationPolicy: offer?.cancellationPolicy || "",
        startDate: offer?.startDate ? new Date(offer.startDate).toISOString().split('T')[0] : "",
        endDate: offer?.endDate ? new Date(offer.endDate).toISOString().split('T')[0] : "",
        featured: offer?.featured || false,

        highlights: (offer?.highlights || []).map(h => h.text),
        includes: (offer?.includes || []).map(i => i.text),
        excludes: (offer?.excludes || []).map(e => e.text),
        whatToBring: (offer?.whatToBring || []).map(w => w.text),
        priceTiers: (offer?.priceTiers || []).map(p => ({
            label: p.label,
            price: p.price,
            currency: p.currency || "SAR"
        })),
        tagIds: (offer?.tags || []).map(t => t.id || t.tag?.id),
    });

    const [allTags, setAllTags] = useState([]);
    const [saving, setSaving] = useState(false);

    useEffect(() => {
        async function loadTags() {
            try {
                const res = await api.adminTags();
                const d = res?.data ?? res;
                setAllTags(Array.isArray(d) ? d : d?.items || d?.tags || []);
            } catch (e) {
                console.error("Failed to load tags", e);
            }
        }
        loadTags();
    }, []);

    function toggleTag(tagId) {
        setForm(f => {
            const tagIds = f.tagIds.includes(tagId)
                ? f.tagIds.filter(id => id !== tagId)
                : [...f.tagIds, tagId];
            return { ...f, tagIds };
        });
    }

    function update(field, value) {
        setForm(f => ({ ...f, [field]: value }));
    }

    function addListItem(field) {
        setForm(f => ({ ...f, [field]: [...f[field], ""] }));
    }

    function removeListItem(field, index) {
        setForm(f => ({
            ...f,
            [field]: f[field].filter((_, i) => i !== index)
        }));
    }

    function updateListItem(field, index, value) {
        const list = [...form[field]];
        list[index] = value;
        setForm(f => ({ ...f, [field]: list }));
    }

    async function onSave() {
        setSaving(true);
        try {
            const res = await api.adminUpdateOffer(offer.id, form);
            onChange(res?.data || res);
            toastSuccess("تم حفظ التفاصيل بنجاح ✅");
        } catch (e) {
            toastError(e.message || "فشل الحفظ");
        } finally {
            setSaving(false);
        }
    }

    return (
        <div className="form-grid">
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '20px', gridColumn: '1 / -1', background: '#F8FAFC', padding: '24px', borderRadius: '16px', border: '1px solid var(--border)' }}>
                <div className="field">
                    <span className="field-label">نوع الرحلة</span>
                    <select className="input" value={form.offerType} onChange={e => update("offerType", e.target.value)}>
                        <option value="GROUP">مجموعة 👥</option>
                        <option value="PRIVATE">خاصة 👤</option>
                    </select>
                </div>

                <div className="field">
                    <span className="field-label">نص المواعيد (مثال: كل أحد)</span>
                    <input className="input" value={form.runText} placeholder="يومياً / كل أحد..." onChange={e => update("runText", e.target.value)} />
                </div>

                <div className="field">
                    <label style={{ display: "flex", alignItems: "center", gap: 10, cursor: "pointer", height: '100%', paddingTop: '20px' }}>
                        <input
                            type="checkbox"
                            checked={form.featured || false}
                            onChange={e => update("featured", e.target.checked)}
                            style={{ width: 22, height: 22, cursor: "pointer", accentColor: 'var(--color-primary)' }}
                        />
                        <span className="field-label" style={{ margin: 0 }}>عرض مميز ⭐</span>
                    </label>
                </div>
            </div>

            <div style={{ gridColumn: "1 / -1" }}>
                <span className="field-label">معلومات التوصيل (Pickup Info)</span>
                <textarea
                    className="input"
                    rows={3}
                    value={form.pickupInfo}
                    onChange={e => update("pickupInfo", e.target.value)}
                    placeholder="مثال: التوصيل من الفندق الساعة 8 صباحاً..."
                />
            </div>

            <div style={{ gridColumn: "1 / -1" }}>
                <span className="field-label">سياسة الإلغاء (Cancellation Policy)</span>
                <textarea
                    className="input"
                    rows={3}
                    value={form.cancellationPolicy}
                    onChange={e => update("cancellationPolicy", e.target.value)}
                    placeholder="مثال: يمكن الإلغاء حتى 7 أيام قبل الرحلة مع استرداد كامل للمبلغ..."
                />
            </div>

            <div style={{ gridColumn: "1 / -1" }} className="divider"></div>

            {/* Lists Section */}
            {[
                { key: 'highlights', label: 'مميزات الرحلة (Highlights)', icon: '✨', placeholder: 'مثال: زيارة غار حراء' },
                { key: 'includes', label: 'يشتمل على (Includes)', icon: '✅', placeholder: 'مثال: الإقامة في فندق 5 نجوم' },
                { key: 'excludes', label: 'لا يشتمل على (Excludes)', icon: '❌', placeholder: 'مثال: وجبات الغداء والعشاء' },
                { key: 'whatToBring', label: 'ماذا تحضر معك (What to bring)', icon: '🧳', placeholder: 'مثال: مظلة شمسية' }
            ].map(list => (
                <div key={list.key} style={{ gridColumn: "1 / -1", background: '#ffffff', padding: '20px', borderRadius: '12px', border: '1px solid var(--border)' }}>
                    <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 15, alignItems: 'center' }}>
                        <b className="field-label" style={{ margin: 0 }}>{list.icon} {list.label}</b>
                        <button className="btn btn-primary btn-sm" type="button" onClick={() => addListItem(list.key)}>+ إضافة عنصر</button>
                    </div>
                    <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
                        {form[list.key].map((item, idx) => (
                            <div key={idx} style={{ display: "flex", gap: 10 }}>
                                <input className="input" value={item} onChange={e => updateListItem(list.key, idx, e.target.value)} placeholder={list.placeholder} />
                                <button className="btn btn-danger btn-sm" type="button" style={{ padding: '0 15px' }} onClick={() => removeListItem(list.key, idx)}>حذف</button>
                            </div>
                        ))}
                        {form[list.key].length === 0 && <div className="muted small text-center" style={{ padding: '10px' }}>لا توجد عناصر مضافة</div>}
                    </div>
                </div>
            ))}

            {/* Price Tiers */}
            <div style={{ gridColumn: "1 / -1", background: '#ffffff', padding: '20px', borderRadius: '12px', border: '1px solid var(--border)' }}>
                <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 15, alignItems: 'center' }}>
                    <b className="field-label" style={{ margin: 0 }}>💰 فئات الأسعار (Price Tiers)</b>
                    <button className="btn btn-primary btn-sm" type="button" onClick={() => setForm(f => ({ ...f, priceTiers: [...f.priceTiers, { label: "", price: 0, currency: "SAR" }] }))}>+ إضافة فئة</button>
                </div>
                <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
                    {form.priceTiers.map((p, idx) => (
                        <div key={idx} style={{ display: "grid", gridTemplateColumns: "1fr 140px 100px auto", gap: 10 }}>
                            <input className="input" value={p.label} onChange={e => {
                                const list = [...form.priceTiers];
                                list[idx].label = e.target.value;
                                setForm(f => ({ ...f, priceTiers: list }));
                            }} placeholder="مثال: حجز غرفة ثنائية" />
                            <input className="input" type="number" value={p.price} onChange={e => {
                                const list = [...form.priceTiers];
                                list[idx].price = parseInt(e.target.value) || 0;
                                setForm(f => ({ ...f, priceTiers: list }));
                            }} placeholder="السعر" />
                            <select className="input" value={p.currency} onChange={e => {
                                const list = [...form.priceTiers];
                                list[idx].currency = e.target.value;
                                setForm(f => ({ ...f, priceTiers: list }));
                            }}>
                                <option value="SAR">SAR</option>
                                <option value="USD">USD</option>
                            </select>
                            <button className="btn btn-danger btn-sm" type="button" style={{ padding: '0 15px' }} onClick={() => {
                                setForm(f => ({ ...f, priceTiers: f.priceTiers.filter((_, i) => i !== idx) }));
                            }}>حذف</button>
                        </div>
                    ))}
                    {form.priceTiers.length === 0 && <div className="muted small text-center" style={{ padding: '10px' }}>لا توجد فئات أسعار مضافة</div>}
                </div>
            </div>

            {/* Tags Section */}
            <div style={{ gridColumn: "1 / -1", background: '#ffffff', padding: '20px', borderRadius: '12px', border: '1px solid var(--border)' }}>
                <b className="field-label" style={{ display: 'block', marginBottom: 15 }}>🏷️ الوسوم (Tags)</b>
                <div style={{ display: "flex", flexWrap: "wrap", gap: 10 }}>
                    {allTags.map(tag => (
                        <button
                            key={tag.id}
                            type="button"
                            className={`chip ${form.tagIds.includes(tag.id) ? 'chip--active' : ''}`}
                            onClick={() => toggleTag(tag.id)}
                            style={{ cursor: 'pointer' }}
                        >
                            {tag.name}
                        </button>
                    ))}
                    {allTags.length === 0 && <div className="muted small">لا توجد وسوم متاحة.</div>}
                </div>
            </div>

            <div style={{ gridColumn: "1 / -1", marginTop: 20 }}>
                <button className="btn btn-glow" style={{ width: '100%', padding: '16px' }} type="button" disabled={saving} onClick={onSave}>
                    {saving ? "جاري الحفظ..." : "حفظ تفاصيل العرض"}
                </button>
            </div>
        </div>
    );
}
