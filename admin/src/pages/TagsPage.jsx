import { useEffect, useState } from "react";
import { api } from "../lib/api";
import { toastError, toastSuccess } from "../lib/toast";
import ConfirmDialog from "../components/ui/ConfirmDialog";
import { Plus, Edit2, Trash2, Tags } from "lucide-react";

export default function TagsPage() {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);

  const [modal, setModal] = useState({ open: false, id: null, name: "" });
  const [confirm, setConfirm] = useState({ open: false, id: null, name: "" });

  async function load() {
    setLoading(true);
    try {
      const res = await api.adminTags();
      const d = res?.data ?? res;
      const list = Array.isArray(d) ? d : d?.items || d?.tags || [];
      setItems(list);
    } catch (e) {
      toastError(e?.message || "فشل تحميل الـTags");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => { load(); }, []);

  function openCreate() { setModal({ open: true, id: null, name: "" }); }
  function openEdit(tag) { setModal({ open: true, id: tag.id, name: tag.name || "" }); }

  async function save() {
    const name = modal.name.trim();
    if (!name) return toastError("اسم الوسم مطلوب");

    try {
      if (modal.id) {
        await api.adminUpdateTag(modal.id, { name });
        toastSuccess("تم تحديث الوسم ✅");
      } else {
        await api.adminCreateTag({ name });
        toastSuccess("تم إضافة الوسم ✅");
      }
      setModal({ open: false, id: null, name: "" });
      load();
    } catch (e) {
      toastError(e?.message || "فشل الحفظ");
    }
  }

  async function remove() {
    try {
      await api.adminDeleteTag(confirm.id);
      toastSuccess("تم حذف الوسم ✅");
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
          <h1 className="page-title">إدارة الأوسمة (Tags)</h1>
          <p className="page-subtitle">إدارة التصنيفات والكلمات الدلالية التي يتم ربطها بالعروض والمقالات.</p>
        </div>

        <div className="page-actions">
          <button className="btn btn-primary" type="button" onClick={openCreate}>
            <Plus size={18} />
            <span>إضافة وسم جديد</span>
          </button>
        </div>
      </div>

      <div className="card table-wrap">
        {loading ? (
          <div className="table-loading">جارٍ التحميل...</div>
        ) : items.length === 0 ? (
          <div className="table-empty">لا توجد أوسمة بعد.</div>
        ) : (
          <table className="a-table">
            <thead>
              <tr>
                <th>الوسم</th>
                <th>المعرف (ID)</th>
                <th style={{ width: 140 }}>إجراءات</th>
              </tr>
            </thead>
            <tbody>
              {items.map((t) => (
                <tr key={t.id}>
                  <td>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                      <div style={{ background: 'rgba(232, 104, 48, 0.1)', color: 'var(--color-accent)', padding: '8px', borderRadius: '8px' }}>
                        <Tags size={16} />
                      </div>
                      <b style={{ fontSize: 15 }}>{t.name}</b>
                    </div>
                  </td>
                  <td><code className="muted small">{t.id}</code></td>
                  <td>
                    <div className="row-actions">
                      <button className="btn btn-sm btn-outline" type="button" onClick={() => openEdit(t)} title="تعديل">
                        <Edit2 size={16} />
                      </button>
                      <button
                        className="btn btn-sm btn-outline text-danger"
                        type="button"
                        onClick={() => setConfirm({ open: true, id: t.id, name: t.name })}
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

      {modal.open ? (
        <div className="modal" onClick={() => setModal({ open: false, id: null, name: "" })}>
          <div className="modal__panel" onClick={(e) => e.stopPropagation()}>
            <div className="modal__title">{modal.id ? "تعديل الوسم" : "إضافة وسم جديد"}</div>

            <div className="field">
              <span className="field-label">اسم الوسم (Tag Name)</span>
              <input
                className="input"
                value={modal.name}
                onChange={(e) => setModal((m) => ({ ...m, name: e.target.value }))}
                placeholder="مثال: رحلات عائلية، عروض الصيف..."
                autoFocus
              />
            </div>

            <div className="modal__actions">
              <button className="btn btn-outline" type="button" onClick={() => setModal({ open: false, id: null, name: "" })}>
                إلغاء
              </button>
              <button className="btn btn-primary" type="button" onClick={save}>
                حفظ الوسم
              </button>
            </div>
          </div>
        </div>
      ) : null}

      <ConfirmDialog
        open={confirm.open}
        title="حذف الوسم"
        message={`هل أنت متأكد من حذف الوسم "${confirm.name}"؟ قد يؤثر ذلك على عرض النتائج المرتبطة به.`}
        confirmText="حذف الوسم"
        danger
        onClose={() => setConfirm({ open: false, id: null, name: "" })}
        onConfirm={remove}
      />
    </div>
  );
}
