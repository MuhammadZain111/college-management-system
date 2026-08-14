import { NavLink } from "react-router-dom";
import Seal from "./Seal";
import { useAuth } from "../context/AuthContext";

const MENUS = {
  CEO: [
    { to: "/dashboard", label: "Overview" },
    { to: "/dashboard/notices", label: "Notice Board" },
  ],
  REGISTRAR: [
    { to: "/dashboard", label: "Overview" },
    { to: "/dashboard/accounts", label: "Accounts" },
    { to: "/dashboard/academics", label: "Classes & Subjects" },
    { to: "/dashboard/notices", label: "Notice Board" },
  ],
  ACCOUNTANT: [
    { to: "/dashboard", label: "Overview" },
    { to: "/dashboard/fees", label: "Fee Management" },
    { to: "/dashboard/notices", label: "Notice Board" },
  ],
  TEACHER: [
    { to: "/dashboard", label: "Overview" },
    { to: "/dashboard/attendance", label: "Attendance" },
    { to: "/dashboard/assignments", label: "Assignments" },
    { to: "/dashboard/results", label: "Results" },
    { to: "/dashboard/notices", label: "Notice Board" },
  ],
  STUDENT: [
    { to: "/dashboard", label: "Overview" },
    { to: "/dashboard/attendance", label: "My Attendance" },
    { to: "/dashboard/assignments", label: "My Assignments" },
    { to: "/dashboard/fees", label: "My Fees" },
    { to: "/dashboard/results", label: "My Results" },
    { to: "/dashboard/notices", label: "Notice Board" },
  ],
};

const ROLE_LABELS = {
  CEO: "Director",
  REGISTRAR: "Registrar",
  ACCOUNTANT: "Accountant",
  TEACHER: "Teacher",
  STUDENT: "Student",
};

export default function Sidebar() {
  const { user, logout } = useAuth();
  const items = MENUS[user.role] || [];

  return (
    <aside className="w-64 shrink-0 bg-ink text-paper min-h-screen flex flex-col">
      <div className="px-6 py-7 flex items-center gap-3 border-b border-white/10">
        <Seal size={32} />
        <div className="leading-tight">
          <div className="font-display text-sm">MLC Portal</div>
          <div className="text-[11px] text-brass-light uppercase tracking-widest">
            {ROLE_LABELS[user.role]}
          </div>
        </div>
      </div>

      <nav className="flex-1 px-4 py-6 space-y-1">
        {items.map((item) => (
          <NavLink
            key={item.to}
            to={item.to}
            end={item.to === "/dashboard"}
            className={({ isActive }) =>
              `block px-4 py-2.5 rounded-sm text-sm transition-colors ${
                isActive
                  ? "bg-brass text-ink-dark font-medium"
                  : "text-paper/80 hover:bg-white/10"
              }`
            }
          >
            {item.label}
          </NavLink>
        ))}
      </nav>

      <div className="px-6 py-5 border-t border-white/10">
        <p className="text-sm truncate">{user.name}</p>
        <p className="text-xs text-paper/50 truncate mb-3">{user.email}</p>
        <button
          onClick={logout}
          className="text-xs text-brass-light hover:text-brass transition-colors"
        >
          Sign out
        </button>
      </div>
    </aside>
  );
}
