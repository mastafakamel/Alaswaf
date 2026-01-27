import { useEffect, useState } from "react";
import { api } from "../../../lib/api";
import { toastError, toastSuccess } from "../../../lib/toast";
import HijriDatePicker from "../../common/HijriDatePicker";
import { Trash2 } from "lucide-react";

export default function BasicTab({ offer, isNew, onChange }) {
  const [form, setForm] = useState({
    title: offer?.title || "",
    description: offer?.description || "",
    price: offer?.price || "",
    currency: offer?.currency || "SAR",
    categoryId: offer?.categoryId || "",
    departureCityId: offer?.departureCityId || "",
    durationDays: offer?.durationDays || "",
    durationNights: offer?.durationNights || "",
    offerType: offer?.offerType || "GROUP",
    startDateHijriYear: offer?.startDateHijriYear || null,
    startDateHijriMonth: offer?.startDateHijriMonth || null,
    startDateHijriDay: offer?.startDateHijriDay || null,
    endDateHijriYear: offer?.endDateHijriYear || null,
    endDateHijriMonth: offer?.endDateHijriMonth || null,
    endDateHijriDay: offer?.endDateHijriDay || null,
  });

  const [cities, setCities] = useState([]);
  const [categories, setCategories] = useState([]);

  const [saving, setSaving] = useState(false);

  function update(field, value) {
    setForm((f) => ({ ...f, [field]: value }));
  }

  useEffect(() => {
    async function loadCities() {
      try {
        const res = await api.adminCities();
        const d = res?.data ?? res;
        const list = Array.isArray(d) ? d : d?.items || d?.cities || [];
        setCities(list);

        // If it's a new offer and no city set, pick first active
        if (isNew && !form.departureCityId && list.length > 0) {
          update("departureCityId", list.find(c => c.isActive)?.id || list[0].id);
        }
      } catch (e) {
        toastError("تعذر تحميل قائمة المدن");
      }
    }
    async function loadCategories() {
      try {
        const res = await api.adminCategories();
        const d = res?.data ?? res;
        setCategories(d);

        // If it's a new offer and no category set, pick first active
        if (isNew && !form.categoryId && d.length > 0) {
          update("categoryId", d.find(c => c.isActive)?.id || d[0].id);
        }
      } catch (e) {
        toastError("تعذر تحميل قائمة التصنيفات");
      }
    }
    loadCities();
    loadCategories();
  }, [isNew, form.departureCityId, form.categoryId]);

  async function onSave() {
    if (!form.title.trim()) {
      toastError("عنوان العرض مطلوب");
      return;
    }

    setSaving(true);
    try {
      let res;
      if (isNew) {
        res = await api.adminCreateOffer(form);
      } else {
        res = await api.adminUpdateOffer(offer.id, form);
      }

      const data = res?.data || res;
      onChange(data);
      toastSuccess("تم حفظ البيانات الأساسية ✅");

      if (isNew && data?.id) {
        location.href = `/admin/offers/${data.id}/edit`;
      }

    } catch (e) {
      toastError(e.message || "فشل الحفظ");
    } finally {
      setSaving(false);
    }
  }

  async function onDelete() {
    if (!window.confirm("هل أنت متأكد من رغبتك في حذف هذا العرض نهائياً؟")) return;

    try {
      await api.adminDeleteOffer(offer.id);
      toastSuccess("تم حذف العرض بنجاح 🗑️");
      location.href = "/admin/offers";
    } catch (e) {
      toastError(e.message || "فشل الحذف");
    }
  }

  return (
    <div className="form-grid">
      <label className="field" style={{ gridColumn: "1 / -1" }}>
        <span className="field-label">عنوان العرض</span>
        <input
          className="input"
          value={form.title}
          placeholder="مثال: رحلة العمرة المميزة لعام 2024"
          onChange={(e) => update("title", e.target.value)}
        />
      </label>

      <label className="field" style={{ gridColumn: "1 / -1" }}>
        <span className="field-label">الوصف</span>
        <textarea
          className="input"
          rows={4}
          value={form.description}
          placeholder="اكتب وصفاً تفصيلياً للعرض هنا..."
          onChange={(e) => update("description", e.target.value)}
        />
      </label>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px', gridColumn: 'span 1' }}>
        <label className="field">
          <span className="field-label">السعر</span>
          <input
            type="number"
            className="input"
            value={form.price}
            placeholder="0.00"
            onChange={(e) => update("price", e.target.value)}
          />
        </label>

        <label className="field">
          <span className="field-label">العملة</span>
          <select
            className="input"
            value={form.currency}
            onChange={(e) => update("currency", e.target.value)}
          >
            <option value="SAR">ريال سعودي (SAR)</option>
            <option value="USD">دولار أمريكي (USD)</option>
            <option value="EGP">جنيه مصري (EGP)</option>
          </select>
        </label>
      </div>

      <label className="field">
        <span className="field-label">الفئة</span>
        <select
          className="input"
          value={form.categoryId}
          onChange={(e) => update("categoryId", e.target.value)}
        >
          <option value="" disabled>اختر التصنيف...</option>
          {categories.map((c) => (
            <option key={c.id} value={c.id}>{c.icon} {c.name}</option>
          ))}
        </select>
      </label>

      <label className="field">
        <span className="field-label">مدينة الانطلاق</span>
        <select
          className="input"
          value={form.departureCityId}
          onChange={(e) => update("departureCityId", e.target.value)}
        >
          <option value="" disabled>اختر المدينة...</option>
          {cities.map((c) => (
            <option key={c.id} value={c.id}>{c.name}</option>
          ))}
        </select>
      </label>

      <label className="field">
        <span className="field-label">نوع الرحلة</span>
        <select
          className="input"
          value={form.offerType}
          onChange={(e) => update("offerType", e.target.value)}
        >
          <option value="GROUP">جماعية 👥</option>
          <option value="PRIVATE">خاصة 👤</option>
        </select>
      </label>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px', gridColumn: 'span 2', background: '#F8FAFC', padding: '24px', borderRadius: '16px', border: '1px solid var(--border)' }}>
        <div className="field">
          <HijriDatePicker
            label="📅 تاريخ البداية (هجري)"
            value={form.startDateHijriYear ? { year: form.startDateHijriYear, month: form.startDateHijriMonth, day: form.startDateHijriDay } : null}
            onChange={(hijriObj) => {
              if (typeof hijriObj === 'object' && hijriObj?.year) {
                update("startDateHijriYear", hijriObj.year);
                update("startDateHijriMonth", hijriObj.month);
                update("startDateHijriDay", hijriObj.day);
              } else {
                update("startDateHijriYear", null);
                update("startDateHijriMonth", null);
                update("startDateHijriDay", null);
              }
            }}
            required
          />
        </div>

        <div className="field">
          <HijriDatePicker
            label="📅 تاريخ النهاية (هجري)"
            value={form.endDateHijriYear ? { year: form.endDateHijriYear, month: form.endDateHijriMonth, day: form.endDateHijriDay } : null}
            onChange={(hijriObj) => {
              if (typeof hijriObj === 'object' && hijriObj?.year) {
                update("endDateHijriYear", hijriObj.year);
                update("endDateHijriMonth", hijriObj.month);
                update("endDateHijriDay", hijriObj.day);
              } else {
                update("endDateHijriYear", null);
                update("endDateHijriMonth", null);
                update("endDateHijriDay", null);
              }
            }}
            required
          />
        </div>

        <label className="field">
          <span className="field-label">المدة (أيام)</span>
          <input
            type="number"
            className="input"
            value={form.durationDays}
            onChange={(e) => update("durationDays", e.target.value)}
            placeholder="مثال: 5"
          />
        </label>

        <label className="field">
          <span className="field-label">المدة (ليالي)</span>
          <input
            type="number"
            className="input"
            value={form.durationNights}
            onChange={(e) => update("durationNights", e.target.value)}
            placeholder="مثال: 4"
          />
        </label>
      </div>

      <div style={{
        gridColumn: "1 / -1",
        marginTop: '20px',
        display: 'flex',
        gap: '12px'
      }}>
        <button
          className="btn btn-glow"
          style={{ flex: 1, padding: '16px' }}
          type="button"
          disabled={saving}
          onClick={onSave}
        >
          {saving ? "جاري الحفظ..." : "حفظ البيانات الأساسية"}
        </button>

        {!isNew && (
          <button
            className="btn btn-outline"
            style={{
              padding: '16px 24px',
              borderColor: '#ef4444',
              color: '#ef4444',
              display: 'flex',
              alignItems: 'center',
              gap: '8px'
            }}
            type="button"
            onClick={onDelete}
          >
            <Trash2 size={20} />
            <span>حذف</span>
          </button>
        )}
      </div>
    </div>
  );
}
