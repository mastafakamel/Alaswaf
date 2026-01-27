import { useMemo, useState } from "react";
import { api } from "../../../lib/api";
import { toastError, toastSuccess } from "../../../lib/toast";
import ConfirmDialog from "../../ui/ConfirmDialog";
import { ChevronUp, ChevronDown, Trash2, Camera, Link, Type } from "lucide-react";

export default function MediaTab({ offer, onRefresh }) {
  const images = useMemo(() => offer?.images || offer?.OfferImage || [], [offer]);
  const [url, setUrl] = useState("");
  const [alt, setAlt] = useState("");
  const [busy, setBusy] = useState(false);
  const [uploading, setUploading] = useState(false);

  const [confirm, setConfirm] = useState({
    open: false,
    title: "",
    message: "",
    confirmText: "تأكيد",
    danger: false,
    action: null,
  });

  function askConfirm(opts) {
    setConfirm({
      open: true,
      title: opts.title,
      message: opts.message,
      confirmText: opts.confirmText || "تأكيد",
      danger: Boolean(opts.danger),
      action: opts.action,
    });
  }
  function closeConfirm() {
    setConfirm((c) => ({ ...c, open: false, action: null }));
  }

  async function addImage() {
    if (!offer?.id) return toastError("لا يمكن إضافة صور قبل إنشاء العرض.");
    if (!url.trim()) return toastError("أدخل رابط الصورة أولاً.");

    setBusy(true);
    try {
      await api.adminAddOfferImage(offer.id, { url: url.trim(), alt: alt.trim() || undefined });
      toastSuccess("تمت إضافة الصورة ✅");
      setUrl("");
      setAlt("");
      await onRefresh?.();
    } catch (e) {
      toastError(e?.message || "فشل إضافة الصورة");
    } finally {
      setBusy(false);
    }
  }

  async function handleFileUpload(e) {
    const file = e.target.files[0];
    if (!file) return;

    setUploading(true);
    try {
      const res = await api.adminUploadImage(file);
      await api.adminAddOfferImage(offer.id, { url: res.url, alt: file.name });
      toastSuccess("تم رفع وإضافة الصورة بنجاح ✅");
      await onRefresh?.();
    } catch (e) {
      toastError(e.message || "فشل رفع الصورة");
    } finally {
      setUploading(false);
    }
  }

  async function removeImage(imageId) {
    setBusy(true);
    try {
      await api.adminRemoveOfferImage(offer.id, imageId);
      toastSuccess("تم حذف الصورة ✅");
      await onRefresh?.();
    } catch (e) {
      toastError(e?.message || "فشل حذف الصورة");
    } finally {
      setBusy(false);
    }
  }

  async function move(imageId, dir) {
    // dir = -1 up | +1 down
    const idx = images.findIndex((x) => x.id === imageId);
    if (idx < 0) return;

    const nextIdx = idx + dir;
    if (nextIdx < 0 || nextIdx >= images.length) return;

    const newOrder = images.map((x) => x.id);
    const tmp = newOrder[idx];
    newOrder[idx] = newOrder[nextIdx];
    newOrder[nextIdx] = tmp;

    setBusy(true);
    try {
      await api.adminReorderOfferImages(offer.id, newOrder);
      toastSuccess("تم تحديث ترتيب الصور ✅");
      await onRefresh?.();
    } catch (e) {
      toastError(e?.message || "فشل إعادة الترتيب");
    } finally {
      setBusy(false);
    }
  }

  if (!offer?.id) {
    return (
      <div className="muted" style={{ padding: 16 }}>
        أنشئ العرض أولاً من تبويب “البيانات الأساسية”، ثم ارجع هنا لإضافة الصور.
      </div>
    );
  }

  return (
    <div className="media-tab">
      {/* Add Image */}
      <div className="media-add card" style={{ padding: 24, border: '1px solid var(--border)', marginBottom: 32 }}>
        <b className="field-label" style={{ marginBottom: 16, display: 'flex', alignItems: 'center', gap: 8, fontSize: 16 }}>
          <Camera size={20} className="text-primary" />
          معرض صور العرض
        </b>
        <div style={{ display: 'grid', gridTemplateColumns: 'minmax(200px, 1fr) 1fr auto auto', gap: '16px', alignItems: 'end' }}>
          <div className="field">
            <span className="field-label" style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
              <Link size={14} /> رابط الصورة
            </span>
            <input
              className="input"
              value={url}
              onChange={(e) => setUrl(e.target.value)}
              placeholder="https://..."
              style={{ direction: 'ltr' }}
            />
          </div>
          <div className="field">
            <span className="field-label" style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
              <Type size={14} /> وصف الصورة (اختياري)
            </span>
            <input
              className="input"
              value={alt}
              onChange={(e) => setAlt(e.target.value)}
              placeholder="مثال: واجهة الفندق..."
            />
          </div>
          <label className="btn btn-outline" style={{ height: 46, padding: '0 20px', position: 'relative', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', margin: 0 }} disabled={uploading}>
            {uploading ? "جاري الرفع..." : "رفع صورة 📤"}
            <input type="file" hidden onChange={handleFileUpload} accept="image/*" disabled={uploading} style={{ position: 'absolute', inset: 0, opacity: 0, cursor: 'pointer', width: '100%', height: '100%' }} />
          </label>
          <button className="btn btn-primary" style={{ height: 46, padding: '0 32px' }} type="button" disabled={busy || uploading} onClick={addImage}>
            {busy ? "جارٍ إضافة..." : "إضافة للرابط"}
          </button>
        </div>
        <div className="muted small" style={{ marginTop: 16, display: 'flex', alignItems: 'center', gap: 6 }}>
          <span style={{ color: '#EAB308' }}>💡</span>
          <span>يمكنك رفع صورة مباشرة من جهازك أو إضافة رابط مباشر لصورة خارجية.</span>
        </div>
      </div>

      {/* Gallery */}
      <div className="media-grid">
        {images.length === 0 ? (
          <div className="table-empty" style={{ gridColumn: '1 / -1' }}>لا توجد صور لهذا العرض.</div>
        ) : (
          images.map((img, i) => (
            <div className="media-card card fade-in" key={img.id} style={{ animationDelay: `${i * 50}ms` }}>
              <div className="media-card__img">
                <img src={img.url} alt={img.alt || "صورة"} loading="lazy" />
              </div>

              <div className="media-card__meta">
                <div className="num">صورة #{i + 1}</div>
                <div className="muted small" style={{ opacity: 0.5, fontSize: 10 }}>{img.id.slice(-8)}</div>
              </div>

              <div className="media-card__actions">
                <button
                  className="btn btn-sm btn-outline"
                  type="button"
                  style={{ padding: '6px' }}
                  disabled={busy || i === 0}
                  onClick={() => move(img.id, -1)}
                  title="تحريك للأمام"
                >
                  <ChevronUp size={16} />
                </button>

                <button
                  className="btn btn-sm btn-outline"
                  type="button"
                  style={{ padding: '6px' }}
                  disabled={busy || i === images.length - 1}
                  onClick={() => move(img.id, +1)}
                  title="تحريك للخلف"
                >
                  <ChevronDown size={16} />
                </button>

                <button
                  className="btn btn-sm btn-outline text-danger"
                  type="button"
                  style={{ padding: '6px' }}
                  disabled={busy}
                  onClick={() =>
                    askConfirm({
                      title: "حذف الصورة",
                      message: "هل تريد حذف هذه الصورة من العرض؟",
                      confirmText: "حذف",
                      danger: true,
                      action: () => removeImage(img.id),
                    })
                  }
                  title="حذف"
                >
                  <Trash2 size={16} />
                </button>
              </div>
            </div>
          ))
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
    </div>
  );
}
