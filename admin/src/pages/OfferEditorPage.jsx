import { useParams } from "react-router-dom";
import { useEffect, useState } from "react";
import { api } from "../lib/api";
import { toastError } from "../lib/toast";

import OfferEditorTabs from "../components/offers/OfferEditorTabs";

export default function OfferEditorPage() {
  const { id } = useParams();
  const isNew = !id;

  const [offer, setOffer] = useState(null);
  const [loading, setLoading] = useState(!isNew);

  async function refresh() {
    if (!id) return;
    try {
      const res = await api.adminOfferById(id);
      const data = res?.data || res;
      setOffer(data);
    } catch (e) {
      toastError(e?.message || "فشل تحديث بيانات العرض");
    }
  }
  

  useEffect(() => {
    if (isNew) return;
  
    setLoading(true);
    refresh().finally(() => setLoading(false));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id, isNew]);
  

  if (loading) {
    return <div className="page">جارٍ تحميل العرض…</div>;
  }

  return (
    <div className="page">
      <h1 className="page-title">
        {isNew ? "إضافة عرض جديد" : "تعديل العرض"}
      </h1>

      <OfferEditorTabs
        offer={offer}
        isNew={isNew}
        onChange={setOffer}
        onRefresh={refresh}
      />
    </div>
  );
}
