import { Routes, Route, NavLink, Link } from "react-router-dom";
import { useAuth } from "./auth.js";
import Login from "./Login.jsx";
import Dashboard from "./pages/Dashboard.jsx";
import Works from "./pages/Works.jsx";
import Categories from "./pages/Categories.jsx";
import Services from "./pages/Services.jsx";
import Content from "./pages/Content.jsx";
import Theme from "./pages/Theme.jsx";
import { useSiteData, useThemeVars } from "../lib/useSiteData.js";
import "../styles/admin.css";

function Sidebar({ onSignOut }) {
  const link = ({ isActive }) => (isActive ? "active" : "");
  return (
    <aside className="admin-side">
      <div className="admin-brand">
        klova
        <small>Studio Admin</small>
      </div>
      <nav className="admin-nav">
        <NavLink end to="/admin" className={link}>Dashboard</NavLink>
        <NavLink to="/admin/works" className={link}>Works & Photos</NavLink>
        <NavLink to="/admin/categories" className={link}>Categories</NavLink>
        <NavLink to="/admin/services" className={link}>Services</NavLink>
        <NavLink to="/admin/content" className={link}>Site Content</NavLink>
        <NavLink to="/admin/theme" className={link}>Theme</NavLink>
      </nav>
      <div className="admin-side-foot">
        <Link to="/" target="_blank">↗ View site</Link>
        <a href="#" onClick={(e) => { e.preventDefault(); onSignOut(); }}>Sign out</a>
      </div>
    </aside>
  );
}

export default function AdminApp() {
  const { session, loading, signIn, signOut } = useAuth();
  // Mirror the public site's theme inside the admin so photo previews
  // (thumbs, focal-point picker, smart-collage tiles) use the same colour /
  // grayscale treatment the visitor sees.
  const { settings } = useSiteData();
  useThemeVars(settings.theme);

  if (loading) return <div className="admin-center">Loading…</div>;
  if (!session) return <Login onSignIn={signIn} />;

  return (
    <div className="admin">
      <div className="admin-shell">
        <Sidebar onSignOut={signOut} />
        <main className="admin-main">
          <Routes>
            <Route index element={<Dashboard />} />
            <Route path="works" element={<Works />} />
            <Route path="categories" element={<Categories />} />
            <Route path="services" element={<Services />} />
            <Route path="content" element={<Content />} />
            <Route path="theme" element={<Theme />} />
          </Routes>
        </main>
      </div>
    </div>
  );
}
