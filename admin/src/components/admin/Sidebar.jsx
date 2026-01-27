import { NavLink } from "react-router-dom";
import {
  LayoutDashboard,
  MapPin,
  GitBranch,
  FileText,
  MessageSquare,
  Tags,
  ShoppingBag,
  Plus,
  Grid
} from "lucide-react";

export default function Sidebar() {
  const menuItems = [
    { name: "العروض", path: "/admin/offers", icon: ShoppingBag },
    { name: "التصنيفات", path: "/admin/categories", icon: Grid },
    { name: "المدونة", path: "/admin/blog", icon: FileText },
    { name: "الطلبات", path: "/admin/leads", icon: MessageSquare },
    { name: "الفروع", path: "/admin/branches", icon: GitBranch },
    { name: "المدن", path: "/admin/cities", icon: MapPin },
    { name: "الأوسمة", path: "/admin/tags", icon: Tags },

  ];

  return (
    <aside className="admin-sidebar">
      <div className="admin-brand">
        <img src="/images/icon.png" alt="الأسواف" className="admin-logo" style={{ width: 44, height: 44, objectFit: 'contain', background: 'transparent' }} />
        <div>
          <div className="admin-name">الأسواف</div>
          <div className="admin-sub">لوحة التحكم</div>
        </div>
      </div>

      <nav className="admin-nav">
        {menuItems.map((item) => (
          <NavLink
            key={item.path}
            to={item.path}
            className={({ isActive }) => `admin-link ${isActive ? 'active' : ''}`}
          >
            <item.icon size={20} />
            <span>{item.name}</span>
          </NavLink>
        ))}
      </nav>

      <div style={{ marginTop: 'auto', padding: '16px' }}>
        <a href="/admin/offers/new" className="btn btn-primary" style={{ width: '100%', fontSize: '13px' }}>
          <Plus size={16} />
          <span>إضافة عرض جديد</span>
        </a>
      </div>
    </aside>
  );
}
