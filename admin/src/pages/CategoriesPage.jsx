import { useEffect, useState } from "react";
import { api } from "../lib/api";
import { toastError, toastSuccess } from "../lib/toast";
import { Plus, Edit2, Trash2, CheckCircle, XCircle } from "lucide-react";
import ConfirmDialog from "../components/ui/ConfirmDialog";

export default function CategoriesPage() {
    const [items, setItems] = useState([]);
    const [loading, setLoading] = useState(true);

    const [modal, setModal] = useState({ open: false, id: null, name: "", icon: "🕋", isActive: true });
    const [confirm, setConfirm] = useState({ open: false, id: null, name: "" });
    const [uploading, setUploading] = useState(false);
    const [saving, setSaving] = useState(false);

    async function load() {
        setLoading(true);
        try {
            const data = await api.adminCategories();
            setItems(data);
        } catch (e) {
            toastError("فشل تحميل التصنيفات");
        } finally {
            setLoading(false);
        }
    }

    useEffect(() => {
        load();
    }, []);

    function openCreate() { setModal({ open: true, id: null, name: "", icon: "🕋", isActive: true }); }
    function openEdit(c) { setModal({ open: true, id: c.id, name: c.name, icon: c.icon || "🕋", isActive: c.isActive }); }

    async function handleSave() {
        const name = modal.name.trim();
        if (!name) return toastError("اسم التصنيف مطلوب");

        setSaving(true);
        try {
            if (modal.id) {
                await api.adminUpdateCategory(modal.id, { name, icon: modal.icon, isActive: modal.isActive });
                toastSuccess("تم التحديث بنجاح ✅");
            } else {
                await api.adminCreateCategory({ name, icon: modal.icon, isActive: modal.isActive });
                toastSuccess("تمت الإضافة بنجاح ✅");
            }
            setModal({ open: false, id: null, name: "", icon: "🕋", isActive: true });
            load();
        } catch (e) {
            toastError(e.message || "فشل الحفظ");
        } finally {
            setSaving(false);
        }
    }

    async function handleFileUpload(e) {
        const file = e.target.files[0];
        if (!file) return;

        setUploading(true);
        try {
            const res = await api.adminUploadImage(file);
            setModal(m => ({ ...m, icon: res.url }));
            toastSuccess("تم رفع الصورة بنجاح ✅");
        } catch (e) {
            toastError(e.message || "فشل رفع الصورة");
        } finally {
            setUploading(false);
        }
    }

    async function deleteCategory() {
        try {
            await api.adminDeleteCategory(confirm.id);
            toastSuccess("تم الحذف ✅");
            setConfirm({ open: false, id: null, name: "" });
            load();
        } catch (e) {
            toastError(e.message || "فشل الحذف");
        }
    }

    async function toggleActive(id) {
        try {
            await api.adminCategoryToggleActive(id);
            load();
        } catch (e) {
            toastError("فشل تغيير الحالة");
        }
    }

    if (loading && items.length === 0) {
        return <div className="page">جارٍ التحميل…</div>;
    }

    return (
        <div className="page">
            <div className="page-header">
                <div>
                    <h1 className="page-title">إدارة التصنيفات</h1>
                    <p className="page-subtitle">نظّم عروضك وفئاتك المختلفة لتسهيل البحث على العملاء.</p>
                </div>

                <div className="page-actions">
                    <button className="btn btn-primary" type="button" onClick={openCreate}>
                        <Plus size={18} />
                        <span>إضافة تصنيف جديد</span>
                    </button>
                </div>
            </div>

            <div className="card table-wrap">
                {items.length === 0 ? (
                    <div className="table-empty">لا توجد تصنيفات بعد.</div>
                ) : (
                    <table className="a-table">
                        <thead>
                            <tr>
                                <th>الأيقونة</th>
                                <th>الاسم</th>
                                <th>الحالة</th>
                                <th style={{ width: 180 }}>إجراءات</th>
                            </tr>
                        </thead>
                        <tbody>
                            {items.map((c) => (
                                <tr key={c.id}>
                                    <td>
                                        <div style={{
                                            width: '44px',
                                            height: '44px',
                                            display: 'flex',
                                            alignItems: 'center',
                                            justifyContent: 'center',
                                            fontSize: '1.5rem',
                                            background: 'rgba(var(--color-primary-rgb), 0.05)',
                                            borderRadius: '10px'
                                        }}>
                                            {c.icon?.startsWith('http') ? (
                                                <img src={c.icon} alt={c.name} style={{ width: '100%', height: '100%', objectFit: 'contain', borderRadius: '8px' }} />
                                            ) : (
                                                c.icon
                                            )}
                                        </div>
                                    </td>
                                    <td>
                                        <div style={{ fontWeight: 800 }}>{c.name}</div>
                                    </td>
                                    <td>
                                        {c.isActive ? (
                                            <span className="status status-on">نشط</span>
                                        ) : (
                                            <span className="status status-off">معطل</span>
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

            {/* Category Modal */}
            {modal.open && (
                <div className="modal" onClick={() => setModal({ open: false, id: null, name: "", icon: "🕋", isActive: true })}>
                    <div className="modal__panel" onClick={(e) => e.stopPropagation()}>
                        <div className="modal__title">{modal.id ? "تعديل التصنيف" : "إضافة تصنيف جديد"}</div>

                        <div className="form-grid">
                            <label className="field" style={{ gridColumn: 'span 2' }}>
                                <span className="field-label">اسم التصنيف</span>
                                <input
                                    className="input"
                                    value={modal.name}
                                    onChange={(e) => setModal({ ...modal, name: e.target.value })}
                                    placeholder="مثال: عمرة، سياحة خارجية..."
                                    autoFocus
                                />
                            </label>

                            <div className="field" style={{ gridColumn: 'span 2' }}>
                                <span className="field-label">الأيقونة (Emoji أو صورة)</span>
                                <div style={{ display: 'flex', gap: '15px', alignItems: 'center' }}>
                                    <div style={{
                                        width: '60px',
                                        height: '60px',
                                        background: 'rgba(var(--color-primary-rgb), 0.05)',
                                        borderRadius: '12px',
                                        display: 'flex',
                                        alignItems: 'center',
                                        justifyContent: 'center',
                                        fontSize: '2rem',
                                        overflow: 'hidden',
                                        border: '1px solid var(--border)'
                                    }}>
                                        {modal.icon?.startsWith('http') ? (
                                            <img src={modal.icon} alt="preview" style={{ width: '100%', height: '100%', objectFit: 'contain' }} />
                                        ) : (
                                            modal.icon
                                        )}
                                    </div>
                                    <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: '10px' }}>
                                        <input
                                            className="input"
                                            value={modal.icon}
                                            onChange={(e) => setModal({ ...modal, icon: e.target.value })}
                                            placeholder="إيموجي 🕋 أو رابط صورة..."
                                        />
                                        <label className="btn btn-outline btn-sm" style={{ cursor: 'pointer', margin: 0, alignSelf: 'flex-start' }}>
                                            {uploading ? "جاري الرفع..." : "رفع صورة 📤"}
                                            <input type="file" hidden onChange={handleFileUpload} disabled={uploading} accept="image/*" />
                                        </label>
                                    </div>
                                </div>
                            </div>

                            <label className="field" style={{ flexDirection: "row", alignItems: "center", gap: 12, gridColumn: 'span 2', cursor: "pointer" }}>
                                <input
                                    type="checkbox"
                                    style={{ width: 20, height: 20, accentColor: "var(--color-primary)" }}
                                    checked={modal.isActive}
                                    onChange={(e) => setModal({ ...modal, isActive: e.target.checked })}
                                />
                                <span className="field-label">تفعيل هذا التصنيف في الموقع</span>
                            </label>
                        </div>

                        <div className="modal__actions">
                            <button className="btn btn-outline" type="button" onClick={() => setModal({ open: false, id: null, name: "", icon: "🕋", isActive: true })}>
                                إلغاء
                            </button>
                            <button className="btn btn-primary" type="button" onClick={handleSave} disabled={saving}>
                                {saving ? "جاري الحفظ..." : "حفظ البيانات"}
                            </button>
                        </div>
                    </div>
                </div>
            )}

            <ConfirmDialog
                open={confirm.open}
                title="حذف التصنيف"
                message={`هل أنت متأكد من حذف تصنيف "${confirm.name}"؟`}
                confirmText="حذف"
                danger
                onClose={() => setConfirm({ open: false, id: null, name: "" })}
                onConfirm={deleteCategory}
            />
        </div>
    );
}
