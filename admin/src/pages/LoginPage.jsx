import { useState } from "react";
import { api } from "../lib/api";
import { setToken } from "../lib/auth";
import { toastError, toastSuccess } from "../lib/toast";

export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [formErr, setFormErr] = useState("");

  async function onSubmit(e) {
    e.preventDefault();
    setFormErr("");

    if (!email.trim() || !password.trim()) {
      setFormErr("من فضلك أدخل البريد وكلمة المرور.");
      return;
    }

    setLoading(true);
    try {
      const res = await api.adminLogin({ email, password });
      const token = res?.token || res?.data?.token;

      if (!token) throw new Error("Login response missing token");

      setToken(token);
      toastSuccess("تم تسجيل الدخول بنجاح ✅");
      location.href = "/admin/offers";
    } catch (err) {
      const msg = err?.message || "فشل تسجيل الدخول";
      setFormErr(msg);
      toastError(msg);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="auth-page" style={{
      background: "linear-gradient(135deg, #f9fafb 0%, #f3f4f6 100%)",
      position: "relative",
      overflow: "hidden"
    }}>
      {/* Decorative background element */}
      <div style={{
        position: "absolute",
        top: "-10%",
        right: "-5%",
        width: "400px",
        height: "400px",
        background: "radial-gradient(circle, rgba(45, 140, 206, 0.05) 0%, transparent 70%)",
        pointerEvents: "none"
      }} />

      <div className="auth-card" style={{ zIndex: 1 }}>
        <div className="auth-brand" style={{ marginBottom: 32, justifyContent: "center", textAlign: "center", flexDirection: "column" }}>
          <div className="auth-logo" style={{ width: 64, height: 64, fontSize: 24, marginBottom: 16 }}>AL</div>
          <div>
            <div className="auth-title" style={{ fontSize: 24, color: "var(--color-primary)" }}>لوحة تحكم الأسواف</div>
            <div className="auth-sub" style={{ marginTop: 4, letterSpacing: 1 }}>ALASWAF ADMINISTRATION</div>
          </div>
        </div>

        <form className="auth-form" onSubmit={onSubmit} style={{ gap: 20 }}>
          <div className="field">
            <span className="field-label">البريد الإلكتروني</span>
            <input
              className="input"
              type="email"
              autoComplete="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="admin@alaswaf.com"
              style={{ border: "2px solid var(--border)" }}
            />
          </div>

          <div className="field">
            <span className="field-label">كلمة المرور</span>
            <input
              className="input"
              type="password"
              autoComplete="current-password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
              style={{ border: "2px solid var(--border)" }}
            />
          </div>

          {formErr ? (
            <div className="form-error" style={{
              fontSize: 13,
              textAlign: "center",
              border: "1px solid rgba(220, 38, 38, 0.2)",
              background: "rgba(220, 38, 38, 0.05)"
            }}>
              {formErr}
            </div>
          ) : null}

          <button className="btn btn-primary" type="submit" disabled={loading} style={{
            height: 48,
            fontSize: 16,
            marginTop: 8
          }}>
            {loading ? "جاري الدخول..." : "تسجيل الدخول"}
          </button>

          <div className="auth-note" style={{ textAlign: "center", marginTop: 12 }}>
            <p>هذه المنطقة مخصصة للمسؤولين فقط</p>
            <a href="/" style={{ color: "var(--color-primary)", fontWeight: "700", display: "inline-block", marginTop: 8 }}>
              ← العودة للموقع العام
            </a>
          </div>
        </form>
      </div>
    </div>
  );
}
