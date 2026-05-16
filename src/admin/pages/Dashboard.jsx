import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { supabase } from "../../lib/supabase.js";

export default function Dashboard() {
  const [stats, setStats] = useState(null);

  useEffect(() => {
    (async () => {
      const [w, wp, c, s] = await Promise.all([
        supabase.from("works").select("id", { count: "exact", head: true }),
        supabase.from("works").select("id", { count: "exact", head: true }).eq("published", true),
        supabase.from("categories").select("id", { count: "exact", head: true }),
        supabase.from("services").select("id", { count: "exact", head: true }),
      ]);
      setStats({
        works: w.count ?? 0,
        published: wp.count ?? 0,
        categories: c.count ?? 0,
        services: s.count ?? 0,
      });
    })();
  }, []);

  return (
    <>
      <div className="admin-head">
        <h1>Dash<em>board</em></h1>
        <span className="sub">klova studio</span>
      </div>

      <div className="dash-grid">
        <div className="dash-stat"><div className="k">Total works</div><div className="v">{stats ? String(stats.works).padStart(2, "0") : "—"}</div></div>
        <div className="dash-stat"><div className="k">Published</div><div className="v">{stats ? String(stats.published).padStart(2, "0") : "—"}</div></div>
        <div className="dash-stat"><div className="k">Categories</div><div className="v">{stats ? String(stats.categories).padStart(2, "0") : "—"}</div></div>
      </div>

      <div className="card">
        <h3>Quick actions</h3>
        <div className="btn-row">
          <Link className="btn" to="/admin/works">Manage works & photos</Link>
          <Link className="btn ghost" to="/admin/content">Edit site content</Link>
          <Link className="btn ghost" to="/admin/theme">Theme settings</Link>
          <Link className="btn ghost" to="/" target="_blank">View live site ↗</Link>
        </div>
        <p className="help" style={{ marginTop: 14 }}>
          Photos upload to Supabase Storage. Until a photo is uploaded, a work
          shows a deterministic placeholder from its picsum seed.
        </p>
      </div>
    </>
  );
}
