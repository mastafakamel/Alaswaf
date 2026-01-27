import { useEffect, useState } from "react";
import { api } from "../lib/api";
import { toastError, toastSuccess } from "../lib/toast";
import ConfirmDialog from "../components/ui/ConfirmDialog";
import { Plus, Edit2, Trash2, MapPin } from "lucide-react";

export default function CitiesPage() {
    const [items, setItems] = useState([]);
    const [loading, setLoading] = useState(true);

    const [modal, setModal] = useState({ open: false, id: null, name: "", isActive: true });
    const [confirm, setConfirm] = useState({ open: false, id: null, name: "" });

    async function load() {
        setLoading(true);
        try {
            const res = await api.adminCities();
            const d = res?.data ?? res;
            const list = Array.isArray(d) ? d : d?.items || d?.cities || [];
            setItems(list);
        } catch (e) {
            toastError(e?.message || "فشل تحميل المدن");
        } finally {
            setLoading(false);
        }
    }

    useEffect(() => { load(); }, []);

    function openCreate() { setModal({ open: true, id: null, name: "", isActive: true }); }
    function openEdit(city) { setModal({ open: true, id: city.id, name: city.name || "", isActive: city.isActive ?? true }); }

    async function save() {
        const name = modal.name.trim();
        if (!name) return toastError("اسم المدينة مطلوب");

        try {
            if (modal.id) {
                await api.adminUpdateCity(modal.id, { name, isActive: modal.isActive });
                toastSuccess("تم تحديث المدينة ✅");
            } else {
                await api.adminCreateCity({ name, isActive: modal.isActive });
                toastSuccess("تم إضافة المدينة ✅");
            }
            setModal({ open: false, id: null, name: "", isActive: true });
            load();
        } catch (e) {
            toastError(e?.message || "فشل الحفظ");
        }
    }

    async function remove() {
        try {
            await api.adminDeleteCity(confirm.id);
            toastSuccess("تم حذف المدينة ✅");
            setConfirm({ open: false, id: null, name: "" });
            load();
        } catch (e) {
            toastError(e?.message || "فشل الحذف");
        }
    }

    return (
        <div className="page">
            <div className="page-header">
                <div>
                    <h1 className="page-title">إدارة المدن</h1>
                    <p className="page-subtitle">إضافة وتعديل المدن المتاحة في النظام لربطها بالعروض والفروع.</p>
                </div>

                <div className="page-actions">
                    <button className="btn btn-primary" type="button" onClick={openCreate}>
                        <Plus size={18} />
                        <span>إضافة مدينة</span>
                    </button>
                </div>
            </div>

            <div className="card table-wrap">
                {loading ? (
                    <div className="table-loading">جارٍ التحميل...</div>
                ) : items.length === 0 ? (
                    <div className="table-empty">لا توجد مدن بعد.</div>
                ) : (
                    <table className="a-table">
                        <thead>
                            <tr>
                                <th>المدينة</th>
                                <th>Slug</th>
                                <th>الحالة</th>
                                <th style={{ width: 180 }}>إجراءات</th>
                            </tr>
                        </thead>
                        <tbody>
                            {items.map((c) => (
                                <tr key={c.id}>
                                    <td>
                                        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                                            <div style={{ background: 'rgba(45, 140, 206, 0.1)', color: 'var(--color-primary)', padding: '8px', borderRadius: '8px' }}>
                                                <MapPin size={16} />
                                            </div>
                                            <div>
                                                <div style={{ fontWeight: 800 }}>{c.name}</div>
                                            </div>
                                        </div>
                                    </td>
                                    <td><code>{c.slug}</code></td>
                                    <td>
                                        {c.isActive ? (
                                            <span className="status status-on">نشطة</span>
                                        ) : (
                                            <span className="status status-off">معطلة</span>
                                        )}
                                    </td>
                                    <td>
                                        <div className="row-actions">
                                            <button className="btn btn-sm btn-outline" type="button" onClick={() => openEdit(c)} title="تعديل">
                                                <Edit2 size={16} />
                                            </button>
                                            <button
                                                className="btn btn-sm btn-outline text-danger"
                                                type="button"
                                                onClick={() => setConfirm({ open: true, id: c.id, name: c.name })}
                                                title="حذف"
                                            >
                                                <Trash2 size={16} />
                                            </button>
                                        </div>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                )}
            </div>

            {/* City Modal */}
            {modal.open ? (
                <div className="modal" onClick={() => setModal({ open: false, id: null, name: "", isActive: true })}>
                    <div className="modal__panel" onClick={(e) => e.stopPropagation()}>
                        <div className="modal__title">{modal.id ? "تعديل المدينة" : "إضافة مدينة جديدة"}</div>

                        <div className="field">
                            <span className="field-label">اسم المدينة</span>
                            <input
                                className="input"
                                value={modal.name}
                                onChange={(e) => setModal((m) => ({ ...m, name: e.target.value }))}
                                placeholder="مثال: الرياض"
                                autoFocus
                            />
                        </div>

                        <label className="field" style={{ flexDirection: "row", alignItems: "center", gap: 12, marginTop: 20, cursor: "pointer" }}>
                            <input
                                type="checkbox"
                                style={{ width: 20, height: 20, accentColor: "var(--color-primary)" }}
                                checked={modal.isActive}
                                onChange={(e) => setModal((m) => ({ ...m, isActive: e.target.checked }))}
                            />
                            <span className="field-label">إتاحة هذه المدينة في الموقع كفلتر</span>
                        </label>

                        <div className="modal__actions">
                            <button className="btn btn-outline" type="button" onClick={() => setModal({ open: false, id: null, name: "", isActive: true })}>
                                إلغاء
                            </button>
                            <button className="btn btn-primary" type="button" onClick={save}>
                                حفظ البيانات
                            </button>
                        </div>
                    </div>
                </div>
            ) : null}

            <ConfirmDialog
                open={confirm.open}
                title="حذف المدينة"
                message={`هل أنت متأكد من حذف مدينة "${confirm.name}"؟`}
                confirmText="حذف"
                danger
                onClose={() => setConfirm({ open: false, id: null, name: "" })}
                onConfirm={remove}
            />
        </div>
    );
}
