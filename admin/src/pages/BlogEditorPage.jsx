import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { api } from "../lib/api";
import { toastError, toastSuccess } from "../lib/toast";

export default function BlogEditorPage() {
    const { id } = useParams();
    const navigate = useNavigate();
    const isNew = !id;

    const [form, setForm] = useState({
        title: "",
        slug: "",
        excerpt: "",
        content: "",
        coverImageUrl: "",
        authorName: "فريق الأسواف",
        metaTitle: "",
        metaDescription: "",
        isPublished: false,
    });

    const [loading, setLoading] = useState(!isNew);
    const [saving, setSaving] = useState(false);
    const [uploading, setUploading] = useState(false);

    useEffect(() => {
        if (isNew) return;

        async function load() {
            try {
                const res = await api.adminBlogPostById(id);
                const d = res?.data ?? res;
                setForm({
                    title: d.title || "",
                    slug: d.slug || "",
                    excerpt: d.excerpt || "",
                    content: d.content || "",
                    coverImageUrl: d.coverImageUrl || "",
                    authorName: d.authorName || "فريق الأسواف",
                    metaTitle: d.metaTitle || "",
                    metaDescription: d.metaDescription || "",
                    isPublished: d.isPublished || false,
                });
            } catch (e) {
                toastError("تعذر تحميل بيانات المقال");
                navigate("/admin/blog");
            } finally {
                setLoading(false);
            }
        }
        load();
    }, [id, isNew, navigate]);

    function update(field, value) {
        setForm((f) => ({ ...f, [field]: value }));
    }

    async function onSave() {
        if (!form.title.trim()) return toastError("العنوان مطلوب");
        if (!form.content.trim()) return toastError("المحتوى مطلوب");

        setSaving(true);
        try {
            if (isNew) {
                await api.adminCreateBlogPost(form);
                toastSuccess("تم إضافة المقال ✅");
            } else {
                await api.adminUpdateBlogPost(id, form);
                toastSuccess("تم تحديث المقال ✅");
            }
            navigate("/admin/blog");
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
            update("coverImageUrl", res.url);
            toastSuccess("تم رفع الصورة بنجاح ✅");
        } catch (e) {
            toastError(e.message || "فشل رفع الصورة");
        } finally {
            setUploading(false);
        }
    }

    if (loading) return <div className="page">جارٍ التحميل...</div>;

    return (
        <div className="page">
            <div className="page-head">
                <div>
                    <h1 className="page-title">{isNew ? "إضافة مقال جديد" : "تعديل المقال"}</h1>
                </div>
                <div className="page-actions">
                    <button className="btn btn-outline" onClick={() => navigate("/admin/blog")}>إلغاء</button>
                    <button className="btn btn-primary" onClick={onSave} disabled={saving}>
                        {saving ? "جاري الحفظ..." : "حفظ"}
                    </button>
                </div>
            </div>

            <div className="card" style={{ padding: 20 }}>
                <div className="form-grid">
                    <label className="field" style={{ gridColumn: "1 / -1" }}>
                        <span className="field-label">العنوان</span>
                        <input
                            className="input"
                            value={form.title}
                            onChange={(e) => update("title", e.target.value)}
                            placeholder="مثال: أهم نصائح العمرة في رمضان"
                        />
                    </label>

                    <label className="field">
                        <span className="field-label">الرابط (Slug) - اختياري</span>
                        <input
                            className="input"
                            value={form.slug}
                            onChange={(e) => update("slug", e.target.value)}
                            placeholder="umrah-tips-ramadan"
                        />
                    </label>

                    <div className="field">
                        <span className="field-label">صورة الغلاف</span>
                        <div style={{ display: 'flex', gap: '10px', alignItems: 'center' }}>
                            <div style={{
                                width: '80px',
                                height: '50px',
                                background: 'var(--bg-muted)',
                                borderRadius: '8px',
                                overflow: 'hidden',
                                border: '1px solid var(--border)',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center'
                            }}>
                                {form.coverImageUrl ? (
                                    <img src={form.coverImageUrl} alt="Preview" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                                ) : (
                                    <span style={{ fontSize: '1.2rem', opacity: 0.3 }}>🖼️</span>
                                )}
                            </div>
                            <input
                                className="input"
                                value={form.coverImageUrl}
                                onChange={(e) => update("coverImageUrl", e.target.value)}
                                placeholder="رابط الصورة https://..."
                                style={{ flex: 1, direction: 'ltr' }}
                            />
                            <label className="btn btn-outline" style={{ cursor: 'pointer', margin: 0, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                                {uploading ? "جاري الرفع..." : "رفع صورة"}
                                <input type="file" hidden onChange={handleFileUpload} accept="image/*" disabled={uploading} />
                            </label>
                        </div>
                    </div>

                    <label className="field" style={{ gridColumn: "1 / -1" }}>
                        <span className="field-label">ملخص المقال (Excerpt)</span>
                        <textarea
                            className="input"
                            rows={3}
                            value={form.excerpt}
                            onChange={(e) => update("excerpt", e.target.value)}
                            placeholder="اكتب نبذة مختصرة تظهر في صفحة المدونة..."
                        />
                    </label>

                    <label className="field" style={{ gridColumn: "1 / -1" }}>
                        <span className="field-label">المحتوى</span>
                        <textarea
                            className="input"
                            rows={12}
                            value={form.content}
                            onChange={(e) => update("content", e.target.value)}
                            placeholder="محتوى المقال (يدعم HTML أو نص عادي)..."
                        />
                    </label>

                    <label className="field">
                        <span className="field-label">اسم الكاتب</span>
                        <input
                            className="input"
                            value={form.authorName}
                            onChange={(e) => update("authorName", e.target.value)}
                        />
                    </label>

                    <label className="check-label" style={{ gridColumn: "1 / -1", marginTop: 10 }}>
                        <input
                            type="checkbox"
                            checked={form.isPublished}
                            onChange={(e) => update("isPublished", e.target.checked)}
                        />
                        <span style={{ marginRight: 8 }}>نشر المقال فوراً</span>
                    </label>

                    <div style={{ gridColumn: "1 / -1", marginTop: 20, borderTop: "1px solid #eee", paddingTop: 20 }}>
                        <h3>SEO (اختياري)</h3>
                        <div className="form-grid" style={{ marginTop: 10 }}>
                            <label className="field">
                                <span className="field-label">Meta Title</span>
                                <input
                                    className="input"
                                    value={form.metaTitle}
                                    onChange={(e) => update("metaTitle", e.target.value)}
                                />
                            </label>
                            <label className="field">
                                <span className="field-label">Meta Description</span>
                                <textarea
                                    className="input"
                                    rows={2}
                                    value={form.metaDescription}
                                    onChange={(e) => update("metaDescription", e.target.value)}
                                />
                            </label>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
