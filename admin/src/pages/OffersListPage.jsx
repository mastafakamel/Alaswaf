import { useEffect, useMemo, useState } from "react";
import { api } from "../lib/api";
import { toastError, toastSuccess } from "../lib/toast";
import ConfirmDialog from "../components/ui/ConfirmDialog";
import {
  Plus,
  Search,
  Filter,
  RotateCcw,
  Package,
  CheckCircle,
  Star,
  Copy,
  Edit2,
  Eye,
  Trash2,
  ChevronLeft,
  ChevronRight
} from "lucide-react";

function qs(params) {
  const sp = new URLSearchParams();
  Object.entries(params).forEach(([k, v]) => {
    if (v === undefined || v === null || v === "") return;
    sp.set(k, String(v));
  });
  const s = sp.toString();
  return s ? `?${s}` : "";
}

function pickItems(res) {
  const d = res?.data ?? res;
  if (Array.isArray(d)) return { items: d, total: d.length };
  const items = (Array.isArray(d?.items) && d.items) || (Array.isArray(d?.offers) && d.offers) || (Array.isArray(res?.items) && res.items) || [];
  const total = d?.total ?? d?.count ?? d?.totalCount ?? d?.meta?.total ?? d?.meta?.count ?? d?.pagination?.total ?? d?.pagination?.count ?? res?.total ?? res?.count ?? res?.meta?.total ?? res?.pagination?.total ?? items.length;
  return { items, total: Number(total) || items.length };
}

function CityBadge({ children }) {
  return <span className="status" style={{ backgroundColor: "rgba(45, 140, 206, 0.05)", color: "var(--color-primary)", border: "1px solid rgba(45, 140, 206, 0.1)" }}>{children}</span>;
}

export default function OffersListPage() {
  // ... existing states ...
  const [items, setItems] = useState([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(true);
  const [err, setErr] = useState("");
  const [cities, setCities] = useState([]);
  const [categories, setCategories] = useState([]);

  // ... existing filters ...
  const [sort, setSort] = useState("newest");
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(10);
  const [city, setCity] = useState("");
  const [category, setCategory] = useState(""); // This is now categoryId
  const [status, setStatus] = useState("");
  const [featured, setFeatured] = useState("");
  const [tags, setTags] = useState("");

  const [confirm, setConfirm] = useState({
    open: false,
    title: "",
    message: "",
    confirmText: "تأكيد",
    danger: false,
    action: null,
  });

  const totalPages = useMemo(() => Math.max(1, Math.ceil(total / limit)), [total, limit]);

  async function load() {
    setLoading(true);
    setErr("");
    try {
      const query = qs({
        sort, page, limit, pageSize: limit, perPage: limit,
        departureCityId: city, categoryId: category, isActive: status,
        featured: featured === "" ? "" : featured === "yes" ? "true" : "false",
        tags,
      });

      const [res, citiesRes, categoriesRes] = await Promise.all([
        api.adminOffers(query),
        cities.length === 0 ? api.adminCities() : Promise.resolve({ data: cities }),
        categories.length === 0 ? api.adminCategories() : Promise.resolve({ data: categories }),
      ]);

      if (cities.length === 0) {
        const cd = citiesRes?.data ?? citiesRes;
        setCities(Array.isArray(cd) ? cd : cd?.items || cd?.cities || []);
      }

      if (categories.length === 0) {
        const cad = categoriesRes?.data ?? categoriesRes;
        setCategories(Array.isArray(cad) ? cad : cad?.items || cad?.categories || []);
      }

      const parsed = pickItems(res);
      setItems(parsed.items);
      setTotal(parsed.total);
    } catch (e) {
      setErr(e?.message || "فشل تحميل العروض");
      toastError(e?.message || "فشل تحميل العروض");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => { setPage(1); load(); }, [city, category, status, featured, tags]);
  useEffect(() => { load(); }, [page, limit, sort]);

  async function onToggleActive(id) {
    try { await api.adminOfferToggleActive(id); toastSuccess("تم التحديث ✅"); load(); } catch (e) { toastError(e?.message || "فشل التحديث"); }
  }

  async function onDuplicate(id) {
    try { await api.adminOfferDuplicate(id); toastSuccess("تم نسخ العرض ✅"); load(); } catch (e) { toastError(e?.message || "فشل النسخ"); }
  }

  async function onFeature(id, featuredValue) {
    try { await api.adminOfferFeature(id, featuredValue); toastSuccess(featuredValue ? "تم تمييز العرض ⭐" : "تم إلغاء التمييز"); load(); } catch (e) { toastError(e?.message || "فشل التمييز"); }
  }

  async function onDelete(id) {
    try {
      await api.adminDeleteOffer(id);
      toastSuccess("تم حذف العرض بنجاح 🗑️");
      load();
    } catch (e) {
      toastError(e?.message || "فشل حذف العرض");
    }
  }

  function askConfirm(opts) {
    setConfirm({
      open: true, title: opts.title, message: opts.message,
      confirmText: opts.confirmText || "تأكيد", danger: Boolean(opts.danger), action: opts.action,
    });
  }

  function closeConfirm() { setConfirm((c) => ({ ...c, open: false, action: null })); }

  const activeCount = items.filter(i => i.isActive).length; // this is just for the current page, but better than nothing or we can show total

  return (
    <div className="page">
      <div className="page-header">
        <div>
          <h1 className="page-title">إدارة العروض</h1>
          <p className="page-subtitle">نظرة عامة على جميع العروض المتاحة والتحكم بحالتها.</p>
        </div>
        <div className="page-actions">
          <a className="btn btn-primary" href="/admin/offers/new">
            <Plus size={18} />
            <span>إضافة عرض جديد</span>
          </a>
        </div>
      </div>

      {/* Modern Stat Cards */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '16px', marginBottom: '24px' }}>
        <div className="card" style={{ padding: '20px', display: 'flex', alignItems: 'center', gap: '16px' }}>
          <div style={{ background: 'rgba(45, 140, 206, 0.1)', color: 'var(--color-primary)', padding: '12px', borderRadius: '12px' }}>
            <Package size={24} />
          </div>
          <div>
            <div className="muted small" style={{ fontWeight: 700, fontSize: '10px', textTransform: 'uppercase', marginBottom: '2px' }}>إجمالي العروض</div>
            <div style={{ fontSize: '24px', fontWeight: 800 }}>{total}</div>
          </div>
        </div>

        <div className="card" style={{ padding: '20px', display: 'flex', alignItems: 'center', gap: '16px' }}>
          <div style={{ background: 'rgba(5, 150, 105, 0.1)', color: '#059669', padding: '12px', borderRadius: '12px' }}>
            <CheckCircle size={24} />
          </div>
          <div>
            <div className="muted small" style={{ fontWeight: 700, fontSize: '10px', textTransform: 'uppercase', marginBottom: '2px' }}>نشطة حالياً</div>
            <div style={{ fontSize: '24px', fontWeight: 800 }}>{loading ? "..." : items.filter(i => i.isActive).length} <span style={{ fontSize: '12px', color: 'var(--text-muted)', fontWeight: 500 }}>بالصفحة</span></div>
          </div>
        </div>

        <div className="card" style={{ padding: '20px', display: 'flex', alignItems: 'center', gap: '16px' }}>
          <div style={{ background: 'rgba(232, 104, 48, 0.1)', color: 'var(--color-accent)', padding: '12px', borderRadius: '12px' }}>
            <Star size={24} />
          </div>
          <div>
            <div className="muted small" style={{ fontWeight: 700, fontSize: '10px', textTransform: 'uppercase', marginBottom: '2px' }}>العروض المميزة</div>
            <div style={{ fontSize: '24px', fontWeight: 800 }}>{loading ? "..." : items.filter(i => i.featured).length}</div>
          </div>
        </div>
      </div>

      {/* Toolbar */}
      <div className="toolbar" style={{ display: 'block' }}>
        <div style={{ marginBottom: '20px' }}>
          <span className="chip-label">التصنيف</span>
          <div className="chip-group">
            <button
              type="button"
              className={`chip ${category === "" ? 'chip--active' : ''}`}
              onClick={() => setCategory("")}
            >
              الكل
            </button>
            {categories.map(cat => (
              <button
                key={cat.id}
                type="button"
                className={`chip ${category === cat.id ? 'chip--active' : ''}`}
                onClick={() => setCategory(cat.id)}
                style={{ display: 'flex', alignItems: 'center', gap: '6px' }}
              >
                {cat.icon?.startsWith('http') ? (
                  <img src={cat.icon} alt="" style={{ width: '16px', height: '16px', objectFit: 'contain' }} />
                ) : (
                  <span>{cat.icon || '🕋'}</span>
                )}
                {cat.name}
              </button>
            ))}
          </div>
        </div>

        <div style={{ marginBottom: '20px' }}>
          <span className="chip-label">المدن</span>
          <div className="chip-group">
            <button
              type="button"
              className={`chip ${city === "" ? 'chip--active' : ''}`}
              onClick={() => setCity("")}
            >
              كل المدن
            </button>
            {cities.map(c => (
              <button
                key={c.id}
                type="button"
                className={`chip ${city === c.id ? 'chip--active' : ''}`}
                onClick={() => setCity(c.id)}
              >
                {c.name}
              </button>
            ))}
          </div>
        </div>

        <div className="toolbar-row" style={{ marginTop: '12px', borderTop: '1px solid var(--border)', paddingTop: '12px', gap: '10px' }}>
          <select className="input" style={{ width: 'auto', padding: '8px 12px' }} value={status} onChange={(e) => setStatus(e.target.value)}>
            <option value="">الحالة</option>
            <option value="true">نشط ✅</option>
            <option value="false">غير نشط ❌</option>
          </select>

          <select className="input" style={{ width: 'auto', padding: '8px 12px' }} value={featured} onChange={(e) => setFeatured(e.target.value)}>
            <option value="">التميز</option>
            <option value="yes">مميز ⭐</option>
            <option value="no">عادي</option>
          </select>

          <input
            className="input"
            style={{ flex: 1, padding: '8px 12px' }}
            value={tags}
            onChange={(e) => setTags(e.target.value)}
            placeholder="البحث بالوسوم..."
          />

          <button
            className="btn btn-outline"
            style={{ padding: '8px 16px' }}
            type="button"
            onClick={() => {
              setCity("");
              setCategory("");
              setStatus("");
              setFeatured("");
              setTags("");
              setPage(1);
            }}
          >
            <RotateCcw size={14} />
            <span>مسح</span>
          </button>
        </div>

        <div className="toolbar-row toolbar-row--meta">

          <span className="muted">
            الإجمالي: <b>{total}</b>
          </span>

          <div className="a-pager">
            <button
              className="btn btn-outline btn-sm"
              type="button"
              disabled={page <= 1 || loading}
              onClick={() => setPage((p) => Math.max(1, p - 1))}
            >
              <ChevronRight size={18} />
            </button>

            {Array.from({ length: totalPages }, (_, i) => i + 1).map((p) => (
              <button
                key={p}
                className={`a-pager__dot ${p === page ? 'a-pager__dot--active' : ''}`}
                onClick={() => setPage(p)}
              >
                {p}
              </button>
            ))}

            <button
              className="btn btn-outline btn-sm"
              type="button"
              disabled={page >= totalPages || loading}
              onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
            >
              <ChevronLeft size={18} />
            </button>
          </div>

          <select className="input page-input" value={limit} onChange={(e) => setLimit(Number(e.target.value))}>
            <option value={10}>10 / صفحة</option>
            <option value={20}>20 / صفحة</option>
            <option value={50}>50 / صفحة</option>
          </select>
        </div>
      </div>

      {/* Table */}
      <div className="card table-wrap">
        {loading ? (
          <div className="table-loading">جارٍ تحميل العروض...</div>
        ) : err ? (
          <div className="table-error">تعذر تحميل العروض: {err}</div>
        ) : items.length === 0 ? (
          <div className="table-empty">لا توجد عروض مطابقة للبحث.</div>
        ) : (
          <table className="a-table">
            <thead>
              <tr>
                <th style={{ padding: '12px 16px' }}>العرض</th>
                <th style={{ padding: '12px 16px' }}>المدينة</th>
                <th style={{ padding: '12px 16px' }}>الفئة</th>
                <th style={{ padding: '12px 16px' }}>السعر</th>
                <th style={{ padding: '12px 16px' }}>الحالة</th>
                <th style={{ width: 340, padding: '12px 16px' }}>إجراءات</th>
              </tr>
            </thead>

            <tbody>
              {items.map((o) => (
                <tr key={o.id}>
                  <td>
                    <div className="offer-title">{o.title}</div>
                    <div className="muted small">/{o.slug}</div>
                    {o.featured ? <div className="star">⭐ مميز</div> : null}
                  </td>

                  <td>{o.departureCity ? <CityBadge>{o.departureCity.name}</CityBadge> : <span className="muted">—</span>}</td>
                  <td>
                    {o.category ? (
                      <CityBadge>
                        <span style={{ display: 'inline-flex', alignItems: 'center', gap: '6px' }}>
                          {o.category.icon?.startsWith('http') ? (
                            <img src={o.category.icon} alt="" style={{ width: '16px', height: '16px', objectFit: 'contain' }} />
                          ) : (
                            <span>{o.category.icon || '🕋'}</span>
                          )}
                          {o.category.name}
                        </span>
                      </CityBadge>
                    ) : (
                      <span className="muted">—</span>
                    )}
                  </td>
                  <td>
                    <b>{o.price}</b> <span className="muted">{o.currency || "SAR"}</span>
                  </td>

                  <td>
                    {o.isActive ? (
                      <span className="status status-on">نشط</span>
                    ) : (
                      <span className="status status-off">غير نشط</span>
                    )}
                  </td>

                  <td>
                    <div className="row-actions">
                      <a className="btn btn-sm btn-outline" href={`/admin/offers/${o.id}/edit`} title="تعديل">
                        <Edit2 size={16} />
                        <span>تعديل</span>
                      </a>

                      <button
                        className={`btn btn-sm ${o.isActive ? 'btn-danger' : 'btn-outline'}`}
                        type="button"
                        title={o.isActive ? "إيقاف" : "تفعيل"}
                        onClick={() =>
                          askConfirm({
                            title: "تأكيد تغيير الحالة",
                            message: o.isActive
                              ? "هل تريد إيقاف هذا العرض؟ سيختفي من الموقع."
                              : "هل تريد تفعيل هذا العرض؟ سيظهر في الموقع.",
                            confirmText: o.isActive ? "إيقاف" : "تفعيل",
                            danger: o.isActive,
                            action: () => onToggleActive(o.id),
                          })
                        }
                      >
                        {o.isActive ? <Eye size={16} /> : <Eye size={16} style={{ opacity: 0.5 }} />}
                      </button>

                      <button
                        className="btn btn-sm btn-outline"
                        type="button"
                        title="نسخ العرض"
                        onClick={() =>
                          askConfirm({
                            title: "نسخ العرض",
                            message: "سيتم إنشاء نسخة جديدة من هذا العرض بنفس البيانات. هل تريد المتابعة؟",
                            confirmText: "نسخ",
                            action: () => onDuplicate(o.id),
                          })
                        }
                      >
                        <Copy size={16} />
                      </button>

                      <button
                        className={`btn btn-sm ${o.featured ? 'btn-accent' : 'btn-outline'}`}
                        type="button"
                        title={o.featured ? "إلغاء التمييز" : "تمييز"}
                        onClick={() =>
                          askConfirm({
                            title: o.featured ? "إلغاء تمييز العرض" : "تمييز العرض",
                            message: o.featured
                              ? "هل تريد إزالة هذا العرض من العروض المميزة؟"
                              : "هل تريد تمييز هذا العرض ليظهر ضمن العروض المميزة في الصفحة الرئيسية؟",
                            confirmText: o.featured ? "إلغاء التمييز" : "تمييز",
                            action: () => onFeature(o.id, !o.featured),
                          })
                        }
                      >
                        <Star size={16} fill={o.featured ? 'currentColor' : 'none'} />
                      </button>

                      <button
                        className="btn btn-sm btn-outline btn-danger-hover"
                        type="button"
                        title="حذف العرض"
                        style={{ color: '#ef4444' }}
                        onClick={() =>
                          askConfirm({
                            title: "حذف العرض",
                            message: "هل أنت متأكد من رغبتك في حذف هذا العرض نهائياً؟ لا يمكن التراجع عن هذه الخطوة.",
                            confirmText: "حذف",
                            danger: true,
                            action: () => onDelete(o.id),
                          })
                        }
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

      <ConfirmDialog
        open={confirm.open}
        title={confirm.title}
        message={confirm.message}
        confirmText={confirm.confirmText}
        danger={confirm.danger}
        onClose={closeConfirm}
        onConfirm={async () => {
          try {
            await confirm.action?.();
          } finally {
            closeConfirm();
          }
        }}
      />
    </div >
  );
}
