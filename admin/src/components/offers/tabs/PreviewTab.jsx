export default function PreviewTab({ offer }) {
    const publicUrl = `http://localhost:3000/offers/${offer.slug}`;

    return (
        <div className="text-center py-12">
            <div className="mb-8">
                <img src="/images/logo.png" alt="الأسواف" style={{ margin: "0 auto 20px", width: 120, height: 'auto', objectFit: 'contain' }} />
                <h2 className="page-title">{offer.title}</h2>
                <p className="muted">{offer.summary || "لا يوجد ملخص مضاف بعد."}</p>
            </div>

            <div className="flex justify-center gap-4">
                <a
                    href={publicUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="btn btn-primary"
                >
                    رؤية العرض على الموقع
                </a>

                <div className={`status ${offer.isActive ? 'status-on' : 'status-off'}`} style={{ padding: "10px 20px", fontSize: 16 }}>
                    {offer.isActive ? "هذا العرض منشور حالياً (نشط)" : "هذا العرض مخفي حالياً (مسودة)"}
                </div>
            </div>

            <div className="mt-12 card" style={{ padding: 20, textAlign: "right", background: "var(--bg)", marginTop: 15 }}>
                <h4 className="field-label">إحصائيات سريعة:</h4>
                <ul className="muted" style={{ listStyle: "disc", paddingRight: 20, marginTop: 10 }}>
                    <li>عدد الصور: {offer.images?.length || 0}</li>
                    <li>عدد أيام البرنامج: {offer.itinerary?.length || 0}</li>
                    <li>المنطقة الحالية: {offer.departureCity?.name || "—"}</li>
                    <li>السعر: {offer.price} {offer.currency}</li>
                </ul>
            </div>
        </div>
    );
}
