import { useEffect, useState } from "react";
import { api } from "../lib/api";
import { toastError, toastSuccess } from "../lib/toast";
import ConfirmDialog from "../components/ui/ConfirmDialog";
import {
  GitBranch,
  MapPin,
  Plus,
  Edit2,
  Trash2,
  ChevronUp,
  ChevronDown,
  PhoneCall,
  ExternalLink
} from "lucide-react";

function emptyBranch() {
  return { id: null, cityId: "", label: "", whatsappE164: "", mapUrl: "" };
}

export default function BranchesPage() {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [cities, setCities] = useState([]);

  const [modal, setModal] = useState({ open: false, data: emptyBranch() });
  const [phoneDraft, setPhoneDraft] = useState({ branchId: null, id: null, label: "", phoneE164: "" });
  const [confirm, setConfirm] = useState({ open: false, id: null, name: "" });

  async function load() {
    setLoading(true);
    try {
      const citiesRes = await api.adminCities();
      const cd = citiesRes?.data ?? citiesRes;
      const citiesList = Array.isArray(cd) ? cd : cd?.items || cd?.cities || [];
      setCities(citiesList);

      const res = await api.adminBranches();
      const d = res?.data ?? res;
      const list = Array.isArray(d) ? d : d?.items || d?.branches || [];
      setItems(list);
    } catch (e) {
      toastError(e?.message || "فشل تحميل البيانات");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => { load(); }, []);

  function openCreate() { setModal({ open: true, data: emptyBranch() }); }
  function openEdit(b) { setModal({ open: true, data: { id: b.id, cityId: b.cityId || "", label: b.label || "", whatsappE164: b.whatsappE164 || "", mapUrl: b.mapUrl || "" } }); }

  async function saveBranch() {
    const payload = { cityId: modal.data.cityId, label: modal.data.label.trim(), whatsappE164: modal.data.whatsappE164.trim(), mapUrl: modal.data.mapUrl.trim() };
    if (!payload.label) return toastError("اسم الفرع مطلوب");
    if (!payload.whatsappE164) return toastError("رقم الواتساب مطلوب");

    try {
      if (modal.data.id) { await api.adminUpdateBranch(modal.data.id, payload); toastSuccess("تم تحديث الفرع ✅"); }
      else { await api.adminCreateBranch(payload); toastSuccess("تم إضافة الفرع ✅"); }
      setModal({ open: false, data: emptyBranch() });
      load();
    } catch (e) { toastError(e.message || "فشل حفظ الفرع"); }
  }

  async function deleteBranch() {
    try { await api.adminDeleteBranch(confirm.id); toastSuccess("تم حذف الفرع ✅"); setConfirm({ open: false, id: null, name: "" }); load(); }
    catch (e) { toastError(e?.message || "فشل حذف الفرع"); }
  }

  function startAddPhone(branchId) { setPhoneDraft({ branchId, id: null, label: "", phoneE164: "" }); }
  function startEditPhone(branchId, p) { setPhoneDraft({ branchId, id: p.id, label: p.label || "", phoneE164: p.phoneE164 || p.e164 || p.phone || "" }); }

  async function savePhone() {
    const { branchId, id, label, phoneE164 } = phoneDraft;
    if (!branchId || !phoneE164.trim()) return toastError("رقم الهاتف مطلوب");
    const num = phoneE164.trim();
    const payload = { label: label.trim() || undefined, phoneE164: num, e164: num, phone: num, number: num };

    try {
      if (id) { await api.adminUpdateBranchPhone(branchId, id, payload); toastSuccess("تم تحديث الرقم ✅"); }
      else { await api.adminAddBranchPhone(branchId, payload); toastSuccess("تم إضافة الرقم ✅"); }
      setPhoneDraft({ branchId: null, id: null, label: "", phoneE164: "" });
      load();
    } catch (e) { toastError(e?.message || "فشل حفظ الرقم"); }
  }

  async function deletePhone(branchId, phoneId) {
    try { await api.adminDeleteBranchPhone(branchId, phoneId); toastSuccess("تم حذف الرقم ✅"); load(); }
    catch (e) { toastError(e?.message || "فشل حذف الرقم"); }
  }

  async function reorderPhones(branchId, ids) {
    try { await api.adminReorderBranchPhones(branchId, ids); toastSuccess("تم حفظ الترتيب ✅"); load(); }
    catch (e) { toastError(e?.message || "فشل حفظ الترتيب"); }
  }

  function movePhone(branch, phoneId, dir) {
    const phones = branch.phones || branch.BranchPhone || [];
    const idx = phones.findIndex((x) => x.id === phoneId);
    const next = idx + dir;
    if (idx < 0 || next < 0 || next >= phones.length) return;
    const ids = phones.map((x) => x.id);
    [ids[idx], ids[next]] = [ids[next], ids[idx]];
    reorderPhones(branch.id, ids);
  }

  return (
    <div className="page">
      <div className="page-header">
        <div>
          <h1 className="page-title">إدارة الفروع</h1>
          <p className="page-subtitle">نظرة عامة على جميع فروع الأسواف وكيفية التواصل معها.</p>
        </div>

        <div className="page-actions">
          <button className="btn btn-primary" type="button" onClick={openCreate}>
            <Plus size={18} />
            <span>إضافة فرع جديد</span>
          </button>
        </div>
      </div>

      <div style={{ paddingBottom: 40 }}>
        {loading ? (
          <div className="table-loading">جارٍ التحميل...</div>
        ) : items.length === 0 ? (
          <div className="table-empty">لا توجد فروع بعد.</div>
        ) : (
          <div className="form-grid" style={{ gridTemplateColumns: "repeat(auto-fit, minmax(360px, 1fr))" }}>
            {items.map((b) => {
              const phones = b.phones || b.BranchPhone || [];
              return (
                <div className="card fade-in" key={b.id} style={{ display: "flex", flexDirection: "column" }}>
                  <div style={{ padding: 24, borderBottom: "1px solid var(--border)", background: "#F8FAFC" }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 12 }}>
                      <div style={{ display: 'flex', gap: 12, alignItems: 'center' }}>
                        <div style={{ background: 'var(--color-primary)', color: 'white', padding: '10px', borderRadius: '12px' }}>
                          <GitBranch size={20} />
                        </div>
                        <div>
                          <div style={{ fontWeight: 800, fontSize: 18 }}>{b.label}</div>
                          <div className="muted small" style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
                            <MapPin size={12} /> {b.city?.name || b.city || "—"}
                          </div>
                        </div>
                      </div>

                      <div className="row-actions" style={{ padding: 0 }}>
                        <button className="btn btn-sm btn-outline" onClick={() => openEdit(b)} title="تعديل">
                          <Edit2 size={14} />
                        </button>
                        <button className="btn btn-sm btn-outline text-danger" onClick={() => setConfirm({ open: true, id: b.id, name: b.label })} title="حذف">
                          <Trash2 size={14} />
                        </button>
                      </div>
                    </div>
                    <div style={{ display: 'flex', gap: 12, marginTop: 12 }}>
                      <div className="status status-on" style={{ fontSize: 11, direction: 'ltr' }}>
                        WhatsApp: {b.whatsappE164}
                      </div>
                      {b.mapUrl && (
                        <a href={b.mapUrl} target="_blank" rel="noreferrer" className="status" style={{ fontSize: 11, background: '#EFF6FF', color: '#2563EB', borderColor: '#DBEAFE', display: 'flex', alignItems: 'center', gap: 4 }}>
                          <ExternalLink size={10} />
                          <span>رابط الخريطة</span>
                        </a>
                      )}
                    </div>
                  </div>

                  <div style={{ padding: 24, flex: 1 }}>
                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 20 }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                        <PhoneCall size={16} className="muted" />
                        <b style={{ fontSize: 15 }}>أرقام التواصل</b>
                      </div>
                      <button className="btn btn-sm btn-outline" type="button" onClick={() => startAddPhone(b.id)}>
                        <Plus size={14} />
                        <span>إضافة رقم</span>
                      </button>
                    </div>

                    {phones.length === 0 ? (
                      <div className="muted small" style={{ textAlign: "center", padding: "20px 0", border: '1px dashed var(--border)', borderRadius: '12px' }}>لا توجد أرقام مسجلة.</div>
                    ) : (
                      <div className="phones-list">
                        {phones.map((p, idx) => (
                          <div className="phone-row" key={p.id} style={{ padding: '12px 14px', marginBottom: 8 }}>
                            <div className="phone-meta">
                              <div style={{ fontWeight: 700, fontSize: 14 }}>{p.label || "رقم تواصل"}</div>
                              <div className="muted small" style={{ direction: "ltr" }}>
                                {p.phoneE164 || p.e164 || p.phone}
                              </div>
                            </div>

                            <div className="row-actions">
                              <div style={{ display: 'flex' }}>
                                <button className="btn btn-sm btn-outline" style={{ marginLeft: 4 }} disabled={idx === 0} onClick={() => movePhone(b, p.id, -1)}>
                                  <ChevronUp size={14} />
                                </button>
                                <button className="btn btn-sm btn-outline" style={{ marginLeft: 4 }} disabled={idx === phones.length - 1} onClick={() => movePhone(b, p.id, +1)}>
                                  <ChevronDown size={14} />
                                </button>
                              </div>
                              <button className="btn btn-sm btn-outline" onClick={() => startEditPhone(b.id, p)}>
                                <Edit2 size={14} />
                              </button>
                              <button className="btn btn-sm btn-outline text-danger" onClick={() => deletePhone(b.id, p.id)}>
                                <Trash2 size={14} />
                              </button>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}

                    {phoneDraft.branchId === b.id ? (
                      <div className="card" style={{ padding: 16, marginTop: 16, background: '#FFF' }}>
                        <div className="field">
                          <span className="field-label">اسم الرقم</span>
                          <input
                            className="input"
                            style={{ padding: '8px 12px', fontSize: 14 }}
                            value={phoneDraft.label}
                            onChange={(e) => setPhoneDraft((x) => ({ ...x, label: e.target.value }))}
                            placeholder="مثال: مبيعات، طوارئ..."
                          />
                        </div>
                        <div className="field" style={{ marginTop: 12 }}>
                          <span className="field-label">رقم الهاتف</span>
                          <input
                            className="input"
                            style={{ padding: '8px 12px', fontSize: 14, direction: 'ltr' }}
                            value={phoneDraft.phoneE164}
                            onChange={(e) => setPhoneDraft((x) => ({ ...x, phoneE164: e.target.value }))}
                            placeholder="+966..."
                          />
                        </div>
                        <div style={{ display: 'flex', gap: 10, marginTop: 16 }}>
                          <button className="btn btn-primary btn-sm" style={{ flex: 1 }} type="button" onClick={savePhone}>
                            {phoneDraft.id ? "تحديث الرقم" : "إضافة الرقم"}
                          </button>
                          <button className="btn btn-outline btn-sm" type="button" onClick={() => setPhoneDraft({ branchId: null, id: null, label: "", phoneE164: "" })}>
                            إلغاء
                          </button>
                        </div>
                      </div>
                    ) : null}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {modal.open ? (
        <div className="modal" onClick={() => setModal({ open: false, data: emptyBranch() })}>
          <div className="modal__panel" onClick={(e) => e.stopPropagation()}>
            <div className="modal__title">{modal.data.id ? "تعديل الفرع" : "إضافة فرع جديد"}</div>

            <div style={{ display: 'grid', gap: 20 }}>
              <label className="field">
                <span className="field-label">اسم الفرع</span>
                <input
                  className="input"
                  value={modal.data.label}
                  onChange={(e) => setModal((m) => ({ ...m, data: { ...m.data, label: e.target.value } }))}
                  placeholder="مثال: فرع الرياض - العليا"
                  autoFocus
                />
              </label>

              <label className="field">
                <span className="field-label">المدينة</span>
                <select
                  className="input"
                  value={modal.data.cityId}
                  onChange={(e) => setModal((m) => ({ ...m, data: { ...m.data, cityId: e.target.value } }))}
                >
                  <option value="">اختر المدينة...</option>
                  {cities.map((c) => (
                    <option key={c.id} value={c.id}>{c.name}</option>
                  ))}
                </select>
              </label>

              <label className="field">
                <span className="field-label">رقم الواتساب الرئيسي</span>
                <input
                  className="input"
                  value={modal.data.whatsappE164}
                  onChange={(e) => setModal((m) => ({ ...m, data: { ...m.data, whatsappE164: e.target.value } }))}
                  placeholder="+966..."
                  style={{ direction: "ltr" }}
                />
              </label>

              <label className="field">
                <span className="field-label">رابط الخريطة (Google Maps URL)</span>
                <input
                  className="input"
                  value={modal.data.mapUrl}
                  onChange={(e) => setModal((m) => ({ ...m, data: { ...m.data, mapUrl: e.target.value } }))}
                  placeholder="https://goo.gl/maps/..."
                  style={{ direction: "ltr" }}
                />
              </label>
            </div>

            <div className="modal__actions">
              <button className="btn btn-outline" type="button" onClick={() => setModal({ open: false, data: emptyBranch() })}>
                إلغاء
              </button>
              <button className="btn btn-primary" type="button" onClick={saveBranch}>
                حفظ بيانات الفرع
              </button>
            </div>
          </div>
        </div>
      ) : null}

      <ConfirmDialog
        open={confirm.open}
        title="حذف الفرع"
        message={`هل أنت متأكد من حذف فرع "${confirm.name}"؟ سيتم حذف جميع الأرقام التابعة له أيضاً.`}
        confirmText="حذف الفرع"
        danger
        onClose={() => setConfirm({ open: false, id: null, name: "" })}
        onConfirm={deleteBranch}
      />
    </div>
  );
}
