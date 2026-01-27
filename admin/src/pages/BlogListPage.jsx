import { useEffect, useState } from "react";
import { api } from "../lib/api";
import { toastError, toastSuccess } from "../lib/toast";
import ConfirmDialog from "../components/ui/ConfirmDialog";
import {
    FileText,
    Plus,
    Search,
    Edit2,
    Trash2,
    Eye,
    EyeOff,
    User,
    Calendar,
    ChevronRight,
    ChevronLeft
} from "lucide-react";

export default function BlogListPage() {
    const [items, setItems] = useState([]);
    const [total, setTotal] = useState(0);
    const [loading, setLoading] = useState(true);
    const [err, setErr] = useState("");

    const [page, setPage] = useState(1);
    const [limit] = useState(10);
    const [q, setQ] = useState("");
    const [status, setStatus] = useState(""); // "" | "true" | "false"

    const [confirmDelete, setConfirmDelete] = useState({ open: false, id: null, title: "" });

    async function load() {
        setLoading(true);
        setErr("");
        try {
            const sp = new URLSearchParams();
            sp.set("page", String(page));
            sp.set("limit", String(limit));
            if (q) sp.set("q", q);
            if (status) sp.set("published", status);

            const res = await api.adminBlogPosts(`?${sp.toString()}`);
            const d = res?.data ?? res;
            setItems(d.items || []);
            setTotal(d.total || 0);
        } catch (e) {
            setErr(e.message || "فشل تحميل المقالات");
        } finally {
            setLoading(false);
        }
    }

    useEffect(() => { load(); }, [page, q, status]);

    async function onTogglePublish(id) {
        try {
            await api.adminBlogPostTogglePublish(id);
            toastSuccess("تم تحديث حالة النشر ✅");
            load();
        } catch (e) {
            toastError(e.message || "فشل التحديث");
        }
    }

    async function remove() {
        try {
            await api.adminDeleteBlogPost(confirmDelete.id);
            toastSuccess("تم حذف المقال ✅");
            setConfirmDelete({ open: false, id: null, title: "" });
            load();
        } catch (e) {
            toastError(e.message || "فشل الحذف");
        }
    }

    const totalPages = Math.ceil(total / limit);

    return (
        <div className="page">
            <div className="page-header">
                <div>
                    <h1 className="page-title">مدونة الرحلات</h1>
                    <p className="page-subtitle">إدارة مقالات المدونة، الأخبار والتحديثات التي تظهر لزوار الموقع.</p>
                </div>
                <div className="page-actions">
                    <a className="btn btn-primary" href="/admin/blog/new">
                        <Plus size={18} />
                        <span>إضافة مقال جديد</span>
                    </a>
                </div>
            </div>

            <div className="toolbar" style={{ display: "block" }}>
                <div style={{ display: 'flex', gap: '12px', marginBottom: '16px' }}>
                    <div style={{ position: 'relative', flex: 1, maxWidth: 400 }}>
                        <Search size={16} className="muted" style={{ position: 'absolute', right: 12, top: '50%', transform: 'translateY(-50%)' }} />
                        <input
                            className="input"
                            placeholder="بحث في المقالات..."
                            value={q}
                            onChange={(e) => { setQ(e.target.value); setPage(1); }}
                            style={{ paddingRight: 36 }}
                        />
                    </div>
                </div>

                <span className="chip-label">الحالة</span>
                <div className="chip-group">
                    <button
                        type="button"
                        className={`chip ${status === '' ? 'chip--active' : ''}`}
                        onClick={() => { setStatus(''); setPage(1); }}
                    >
                        كل الحالات
                    </button>
                    <button
                        type="button"
                        className={`chip ${status === 'true' ? 'chip--active' : ''}`}
                        onClick={() => { setStatus('true'); setPage(1); }}
                    >
                        منشور ✅
                    </button>
                    <button
                        type="button"
                        className={`chip ${status === 'false' ? 'chip--active' : ''}`}
                        onClick={() => { setStatus('false'); setPage(1); }}
                    >
                        مسودة 📝
                    </button>
                </div>
            </div>

            <div className="card table-wrap">
                {loading ? (
                    <div className="table-loading">جارٍ التحميل...</div>
                ) : err ? (
                    <div className="table-error">{err}</div>
                ) : items.length === 0 ? (
                    <div className="table-empty">لا توجد مقالات.</div>
                ) : (
                    <table className="a-table">
                        <thead>
                            <tr>
                                <th>المقال</th>
                                <th>الكاتب</th>
                                <th>التاريخ</th>
                                <th>الحالة</th>
                                <th style={{ width: 180 }}>إجراءات</th>
                            </tr>
                        </thead>
                        <tbody>
                            {items.map((post) => (
                                <tr key={post.id}>
                                    <td>
                                        <div style={{ display: "flex", gap: 14, alignItems: "center" }}>
                                            <div style={{
                                                width: 54, height: 54, borderRadius: 12, overflow: 'hidden', flexShrink: 0,
                                                background: '#F1F5F9', display: 'flex', alignItems: 'center', justifyContent: 'center'
                                            }}>
                                                {post.coverImageUrl ? (
                                                    <img src={post.coverImageUrl} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                                                ) : (
                                                    <FileText size={20} className="muted" />
                                                )}
                                            </div>
                                            <div>
                                                <div style={{ fontWeight: 800 }}>{post.title}</div>
                                                <code className="muted small" style={{ fontSize: 11 }}>/{post.slug}</code>
                                            </div>
                                        </div>
                                    </td>
                                    <td>
                                        <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                                            <User size={14} className="muted" />
                                            <span>{post.authorName || "موظف مجهول"}</span>
                                        </div>
                                    </td>
                                    <td>
                                        <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                                            <Calendar size={14} className="muted" />
                                            <span>{post.publishedAt ? new Date(post.publishedAt).toLocaleDateString("ar-SA") : "—"}</span>
                                        </div>
                                    </td>
                                    <td>
                                        {post.isPublished ? (
                                            <span className="status status-on">منشور</span>
                                        ) : (
                                            <span className="status status-off">مسودة</span>
                                        )}
                                    </td>
                                    <td>
                                        <div className="row-actions">
                                            <a className="btn btn-sm btn-outline" href={`/admin/blog/${post.id}/edit`} title="تعديل">
                                                <Edit2 size={16} />
                                            </a>
                                            <button
                                                className={`btn btn-sm ${post.isPublished ? 'btn-outline' : 'btn-accent'}`}
                                                onClick={() => onTogglePublish(post.id)}
                                                title={post.isPublished ? "تحويل لمسودة" : "نشر الآن"}
                                            >
                                                {post.isPublished ? <EyeOff size={16} /> : <Eye size={16} />}
                                            </button>
                                            <button
                                                className="btn btn-sm btn-outline text-danger"
                                                onClick={() => setConfirmDelete({ open: true, id: post.id, title: post.title })}
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
                title="حذف المقال"
                message={`هل أنت متأكد من حذف مقال "${confirmDelete.title}"؟ لا يمكن التراجع عن هذا الإجراء.`}
                confirmText="حذف المقال"
                danger
                onClose={() => setConfirmDelete({ open: false, id: null, title: "" })}
                onConfirm={remove}
            />
        </div>
    );
}
