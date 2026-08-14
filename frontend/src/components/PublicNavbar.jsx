import { Link, NavLink } from "react-router-dom";
import Seal from "./Seal";
import { useAuth } from "../context/AuthContext";

const navLink = ({ isActive }) =>
  `text-sm tracking-wide transition-colors ${isActive ? "text-ink font-semibold" : "text-slate hover:text-ink"}`;

export default function PublicNavbar() {
  const { user } = useAuth();
  return (
    <header className="border-b border-line bg-paper/95 backdrop-blur sticky top-0 z-40">
      <div className="max-w-6xl mx-auto px-6 h-20 flex items-center justify-between">
        <Link to="/" className="flex items-center gap-3">
          <Seal size={36} />
          <div className="leading-tight">
            <div className="font-display text-lg text-ink">
              Muhammadan Law College
            </div>
            <div className="text-[11px] uppercase tracking-[0.2em] text-slate">
              Student Portal
            </div>
          </div>
        </Link>
        <nav className="hidden md:flex items-center gap-8">
          <NavLink to="/" end className={navLink}>
            Home
          </NavLink>
          <NavLink to="/about" className={navLink}>
            About
          </NavLink>
          <NavLink to="/contact" className={navLink}>
            Contact
          </NavLink>
        </nav>
        {user ? (
          <Link to="/dashboard" className="btn-primary text-sm">
            Go to Dashboard
          </Link>
        ) : (
          <Link to="/login" className="btn-primary text-sm">
            Portal Login
          </Link>
        )}
      </div>
    </header>
  );
}
