import { clearToken } from "../../lib/auth";

export default function Topbar() {
  return (
    <header className="admin-topbar">
      <div className="admin-topbar-left">
        <div className="admin-title">لوحة التحكم</div>
      </div>

      <div className="admin-topbar-right">
        <button
          className="btn btn-outline"
          type="button"
          onClick={() => {
            clearToken();
            location.href = "/login";
          }}
        >
          تسجيل الخروج
        </button>
      </div>
    </header>
  );
}
