import { useEffect, useMemo, useState } from "react";
import { api } from "../lib/api";
import { toastError, toastSuccess } from "../lib/toast";
import ConfirmDialog from "../components/ui/ConfirmDialog";
import {
    Users,
    Clock,
    CheckCircle,
    Trash2,
    ChevronLeft,
    ChevronRight,
    Phone,
    Mail,
    ExternalLink
} from "lucide-react";

const LEAD_STATUS = {
    PENDING: { label: "قيد الانتظار", class: "status-off" },
    CONTACTED: { label: "تم التواصل", class: "status-accent" },
    CONVERTED: { label: "تم التحويل", class: "status-on" },
    CLOSED: { label: "مغلق", class: "status-off" },
};

function qs(params) {
    const sp = new URLSearchParams();
    Object.entries(params).forEach(([k, v]) => {
        if (v === undefined || v === null || v === "") return;
        sp.set(k, String(v));
    });
    const s = sp.toString();
    return s ? `?${s}` : "";
}

export default function LeadsPage() {
    const [items, setItems] = useState([]);
    const [total, setTotal] = useState(0);
    const [loading, setLoading] = useState(true);
    const [err, setErr] = useState("");

    const [page, setPage] = useState(1);
    const [limit] = useState(20);
    const [status, setStatus] = useState("");

    const [confirmDelete, setConfirmDelete] = useState({ open: false, id: null });

    const totalPages = useMemo(() => Math.max(1, Math.ceil(total / limit)), [total, limit]);

    async function load() {
        setLoading(true);
        setErr("");
        try {
            const query = qs({ page, limit, status });
            const res = await api.adminLeads(query);
            const d = res?.data ?? res;
            setItems(d.items || []);
            setTotal(d.total || 0);
        } catch (e) {
            setErr(e.message || "فشل تحميل الطلبات");
        } finally {
            setLoading(false);
        }
    }

    useEffect(() => { load(); }, [page, status]);

    async function updateStatus(id, newStatus, notes) {
        try {
            await api.adminUpdateLead(id, { status: newStatus, notes });
            toastSuccess("تم تحديث الحالة ✅");
            load();
        } catch (e) {
            toastError(e.message || "فشل التحديث");
        }
    }

    async function removeLead() {
        try {
            await api.adminDeleteLead(confirmDelete.id);
            toastSuccess("تم حذف الطلب ✅");
            setConfirmDelete({ open: false, id: null });
            load();
        } catch (e) {
            toastError(e.message || "فشل الحذف");
        }
    }

    const pendingCount = items.filter(i => i.status === 'PENDING').length;

    return (
        <div className="page">
            <div className="page-header">
                <div>
                    <h1 className="page-title">طلبات العملاء</h1>
                    <p className="page-subtitle">متابعة طلبات التواصل والاستفسارات الواردة من الموقع.</p>
                </div>
            </div>

            {/* Stats */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '20px', marginBottom: '32px' }}>
                <div className="card" style={{ padding: '24px', display: 'flex', alignItems: 'center', gap: '20px' }}>
                    <div style={{ background: 'rgba(45, 140, 206, 0.1)', color: 'var(--color-primary)', padding: '16px', borderRadius: '16px' }}>
                        <Users size={28} />
                    </div>
                    <div>
                        <div className="muted small" style={{ fontWeight: 700, textTransform: 'uppercase', marginBottom: '4px' }}>إجمالي الطلبات</div>
                        <div style={{ fontSize: '28px', fontWeight: 800 }}>{total}</div>
                    </div>
                </div>

                <div className="card" style={{ padding: '24px', display: 'flex', alignItems: 'center', gap: '20px' }}>
                    <div style={{ background: 'rgba(232, 104, 48, 0.1)', color: 'var(--color-accent)', padding: '16px', borderRadius: '16px' }}>
                        <Clock size={28} />
                    </div>
                    <div>
                        <div className="muted small" style={{ fontWeight: 700, textTransform: 'uppercase', marginBottom: '4px' }}>بإنتظار التواصل</div>
                        <div style={{ fontSize: '28px', fontWeight: 800 }}>{loading ? "..." : pendingCount}</div>
                    </div>
                </div>
            </div>

            <div className="toolbar" style={{ display: 'block' }}>
                <span className="chip-label">تصفية حسب الحالة</span>
                <div className="chip-group">
                    <button
                        type="button"
                        className={`chip ${status === '' ? 'chip--active' : ''}`}
                        onClick={() => { setStatus(''); setPage(1); }}
                    >
                        الكل
                    </button>
                    {Object.entries(LEAD_STATUS).map(([key, val]) => (
                        <button
                            key={key}
                            type="button"
                            className={`chip ${status === key ? 'chip--active' : ''}`}
                            onClick={() => { setStatus(key); setPage(1); }}
                        >
                            {val.label}
                        </button>
                    ))}
                </div>
            </div>

            <div className="card table-wrap">
                {loading ? (
                    <div className="table-loading">جارٍ التحميل...</div>
                ) : items.length === 0 ? (
                    <div className="table-empty">لا توجد طلبات.</div>
                ) : (
                    <table className="a-table">
                        <thead>
                            <tr>
                                <th>العميل</th>
                                <th>العرض</th>
                                <th>التاريخ</th>
                                <th>الحالة</th>
                                <th>ملاحظات</th>
                                <th style={{ width: 80 }}>إجراءات</th>
                            </tr>
                        </thead>
                        <tbody>
                            {items.map((lead) => (
                                <tr key={lead.id}>
                                    <td>
                                        <div style={{ fontWeight: 800 }}>{lead.name}</div>
                                        <div style={{ display: 'flex', gap: '8px', marginTop: '4px' }}>
                                            <a href={`tel:${lead.phone}`} className="muted small" style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                                                <Phone size={12} /> {lead.phone}
                                            </a>
                                            {lead.email && (
                                                <a href={`mailto:${lead.email}`} className="muted small" style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                                                    <Mail size={12} />
                                                </a>
                                            )}
                                        </div>
                                    </td>
                                    <td>
                                        {lead.offer ? (
                                            <a href={`/admin/offers/${lead.offer.id}/edit`} className="btn btn-sm btn-outline" style={{ fontSize: '12px' }}>
                                                {lead.offer.title}
                                                <ExternalLink size={12} />
                                            </a>
                                        ) : (
                                            <span className="status status-off">تواصل عام</span>
                                        )}
                                    </td>
                                    <td>{new Date(lead.createdAt).toLocaleDateString("ar-SA")}</td>
                                    <td>
                                        <select
                                            className={`status ${LEAD_STATUS[lead.status]?.class || 'status-off'}`}
                                            value={lead.status}
                                            onChange={(e) => updateStatus(lead.id, e.target.value, lead.notes)}
                                            style={{ border: "none", cursor: "pointer", outline: "none" }}
                                        >
                                            {Object.entries(LEAD_STATUS).map(([key, val]) => (
                                                <option key={key} value={key}>{val.label}</option>
                                            ))}
                                        </select>
                                    </td>
                                    <td>
                                        <input
                                            className="input"
                                            style={{ padding: '6px 12px', fontSize: '13px' }}
                                            defaultValue={lead.notes || ""}
                                            placeholder="ملاحظات..."
                                            onBlur={(e) => {
                                                if (e.target.value !== (lead.notes || "")) {
                                                    updateStatus(lead.id, lead.status, e.target.value);
                                                }
                                            }}
                                        />
                                    </td>
                                    <td>
                                        <button
                                            className="btn btn-sm btn-outline text-danger"
                                            title="حذف"
                                            onClick={() => setConfirmDelete({ open: true, id: lead.id })}
                                        >
                                            <Trash2 size={16} />
                                        </button>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                )}
            </div>

            {totalPages > 1 && (
                <div className="a-pager" style={{ marginTop: 24, justifyContent: 'center' }}>
                    <button className="btn btn-outline btn-sm" disabled={page <= 1} onClick={() => setPage(p => p - 1)}>
                        <ChevronRight size={18} />
                    </button>
                    {Array.from({ length: totalPages }, (_, i) => i + 1).map(p => (
                        <button
                            key={p}
                            className={`a-pager__dot ${p === page ? 'a-pager__dot--active' : ''}`}
                            onClick={() => setPage(p)}
                        >
                            {p}
                        </button>
                    ))}
                    <button className="btn btn-outline btn-sm" disabled={page >= totalPages} onClick={() => setPage(p => p + 1)}>
                        <ChevronLeft size={18} />
                    </button>
                </div>
            )}

            <ConfirmDialog
                open={confirmDelete.open}
                title="حذف الطلب"
                message="هل أنت متأكد من حذف هذا الطلب؟ هذا الإجراء لا يمكن التراجع عنه."
                confirmText="حذف"
                danger
                onClose={() => setConfirmDelete({ open: false, id: null })}
                onConfirm={removeLead}
            />
        </div>
    );
}
