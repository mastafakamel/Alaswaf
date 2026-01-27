import { useEffect, useState } from "react";
import { subscribeToasts } from "../../lib/toast";

export default function ToastHost() {
  const [items, setItems] = useState([]);

  useEffect(() => {
    return subscribeToasts((t) => {
      const id = crypto?.randomUUID?.() || String(Date.now() + Math.random());
      setItems((prev) => [...prev, { ...t, id }]);
      setTimeout(() => {
        setItems((prev) => prev.filter((x) => x.id !== id));
      }, 2600);
    });
  }, []);

  return (
    <div className="toast-host" aria-live="polite" aria-relevant="additions">
      {items.map((t) => (
        <div key={t.id} className={`toast toast-${t.type}`}>
          {t.message}
        </div>
      ))}
    </div>
  );
}
