import { useState } from "react";
import BasicTab from "./tabs/BasicTab";
import MediaTab from "./tabs/MediaTab";
import DetailsTab from "./tabs/DetailsTab";
import ContentTab from "./tabs/ContentTab";
import ItineraryTab from "./tabs/ItineraryTab";
import SEOTab from "./tabs/SEOTab";
import PreviewTab from "./tabs/PreviewTab";

const TABS = [
  { key: "basic", label: "البيانات الأساسية" },
  { key: "media", label: "الصور" },
  { key: "details", label: "التفاصيل" },
  { key: "content", label: "المحتوى" },
  { key: "itinerary", label: "البرنامج" },
  { key: "seo", label: "SEO" },
  { key: "preview", label: "معاينة" },
];

export default function OfferEditorTabs({ offer, isNew, onChange, onRefresh }) {
  const [active, setActive] = useState("basic");

  return (
    <div className="card">
      {/* Tabs header */}
      <div className="tabs">
        {TABS.map((t) => (
          <button
            key={t.key}
            className={`tab ${active === t.key ? "tab-active" : ""}`}
            onClick={() => setActive(t.key)}
          >
            {t.label}
          </button>
        ))}
      </div>

      {/* Tabs content */}
      <div className="tabs-body">
        {active === "basic" && (
          <BasicTab offer={offer} isNew={isNew} onChange={onChange} />
        )}
        {active === "media" && (
          <MediaTab offer={offer} onRefresh={onRefresh} />
        )}
        {active === "details" && (
          <DetailsTab offer={offer} onChange={onChange} />
        )}
        {active === "content" && (
          <ContentTab offer={offer} onChange={onChange} />
        )}
        {active === "itinerary" && (
          <ItineraryTab offer={offer} onChange={onChange} />
        )}
        {active === "seo" && (
          <SEOTab offer={offer} onChange={onChange} />
        )}
        {active === "preview" && (
          <PreviewTab offer={offer} />
        )}
      </div>
    </div>
  );
}
