import { useEffect, useState, useCallback } from "react";
import { supabase, imageUrl } from "../../lib/supabase.js";
import { useToast, Text, Select, Toggle, ImagePicker, FocalPointPicker } from "../ui.jsx";

const BLANK = {
  title: "", location: "", year: String(new Date().getFullYear()),
  category_id: "", seed: "", image_path: "",
  width: 1200, height: 1500, focal_x: 50, focal_y: 50,
  sort_order: 0, published: true,
};

const clampPct = (n) => Math.min(100, Math.max(0, Number.isFinite(+n) ? Math.round(+n) : 50));

export default function Works() {
  const [toast, showToast] = useToast();
  const [rows, setRows] = useState([]);
  const [cats, setCats] = useState([]);
  const [editing, setEditing] = useState(null); // work object or null
  const [saving, setSaving] = useState(false);

  const load = useCallback(async () => {
    const [w, c] = await Promise.all([
      supabase.from("works").select("*").order("sort_order"),
      supabase.from("categories").select("*").order("sort_order"),
    ]);
    if (w.error) showToast(w.error.message, true);
    setRows(w.data || []);
    setCats(c.data || []);
  }, [showToast]);

  useEffect(() => { load(); }, [load]);

  function startNew() {
    setEditing({ ...BLANK, category_id: cats[0]?.id || "", sort_order: rows.length + 1 });
  }

  async function save() {
    if (!editing.title) return showToast("Title is required", true);
    setSaving(true);
    const cat = cats.find((c) => c.id === editing.category_id);
    const payload = {
      title: editing.title,
      location: editing.location,
      year: editing.year,
      category_id: editing.category_id || null,
      category_slug: cat?.slug || null,
      seed: editing.seed || null,
      image_path: editing.image_path || null,
      width: Number(editing.width) || 1200,
      height: Number(editing.height) || 1500,
      focal_x: clampPct(editing.focal_x),
      focal_y: clampPct(editing.focal_y),
      sort_order: Number(editing.sort_order) || 0,
      published: !!editing.published,
    };
    const res = editing.id
      ? await supabase.from("works").update(payload).eq("id", editing.id)
      : await supabase.from("works").insert(payload);
    setSaving(false);
    if (res.error) return showToast(res.error.message, true);
    showToast(editing.id ? "Work saved" : "Work created");
    setEditing(null);
    load();
  }

  async function del(id) {
    if (!confirm("Delete this work permanently?")) return;
    const { error } = await supabase.from("works").delete().eq("id", id);
    if (error) showToast(error.message, true);
    else { showToast("Deleted"); load(); }
  }

  async function togglePub(row) {
    const { error } = await supabase.from("works")
      .update({ published: !row.published }).eq("id", row.id);
    if (error) showToast(error.message, true);
    else load();
  }

  const set = (k, v) => setEditing((e) => ({ ...e, [k]: v }));

  return (
    <>
      <div className="admin-head">
        <h1>Works & <em>Photos</em></h1>
        <span className="sub">{rows.length} works</span>
      </div>

      {!editing && (
        <>
          <div className="btn-row" style={{ marginBottom: 18 }}>
            <button className="btn" onClick={startNew}>+ New work</button>
          </div>
          <div className="card">
            <table className="table">
              <thead>
                <tr><th></th><th>Title</th><th>Category</th><th>Year</th><th>Order</th><th>Status</th><th></th></tr>
              </thead>
              <tbody>
                {rows.map((r) => (
                  <tr key={r.id}>
                    <td style={{ width: 70 }}>
                      <img className="thumb" alt="" src={imageUrl(r, 120, 150)}
                           style={{ objectPosition: `${r.focal_x ?? 50}% ${r.focal_y ?? 50}%` }} />
                    </td>
                    <td>{r.title}<div className="help">{r.location}</div></td>
                    <td>{cats.find((c) => c.id === r.category_id)?.label || r.category_slug || "—"}</td>
                    <td>{r.year}</td>
                    <td>{r.sort_order}</td>
                    <td>
                      <button className={`pill ${r.published ? "on" : "off"}`}
                              onClick={() => togglePub(r)}>
                        {r.published ? "Published" : "Hidden"}
                      </button>
                    </td>
                    <td>
                      <div className="btn-row">
                        <button className="btn ghost" onClick={() => setEditing(r)}>Edit</button>
                        <button className="btn danger" onClick={() => del(r.id)}>Delete</button>
                      </div>
                    </td>
                  </tr>
                ))}
                {!rows.length && (
                  <tr><td colSpan={7} className="help" style={{ padding: 20 }}>No works yet — add one.</td></tr>
                )}
              </tbody>
            </table>
          </div>
        </>
      )}

      {editing && (
        <div className="card">
          <h3>{editing.id ? "Edit work" : "New work"}</h3>
          <ImagePicker
            label="Photo"
            value={editing.image_path}
            seed={editing.seed}
            onPath={(p) => set("image_path", p)}
            onSeed={(s) => set("seed", s)}
            onToast={showToast}
          />
          <div className="row">
            <Text label="Title" value={editing.title} onChange={(v) => set("title", v)} />
            <Text label="Location" value={editing.location} onChange={(v) => set("location", v)} />
          </div>
          <div className="row-3">
            <Select label="Category" value={editing.category_id}
                    onChange={(v) => set("category_id", v)}
                    options={cats.map((c) => ({ value: c.id, label: c.label }))} />
            <Text label="Year" value={editing.year} onChange={(v) => set("year", v)} />
            <Text label="Sort order" type="number" value={editing.sort_order}
                  onChange={(v) => set("sort_order", v)} />
          </div>
          <div className="row">
            <Text label="Width (px)" type="number" value={editing.width}
                  onChange={(v) => set("width", v)} help="Used for editorial masonry aspect" />
            <Text label="Height (px)" type="number" value={editing.height}
                  onChange={(v) => set("height", v)} />
          </div>
          <FocalPointPicker
            label="Photo position in frame"
            image_path={editing.image_path}
            seed={editing.seed}
            x={editing.focal_x ?? 50}
            y={editing.focal_y ?? 50}
            onChange={(fx, fy) => setEditing((e) => ({ ...e, focal_x: fx, focal_y: fy }))}
          />
          <Toggle label="Published (visible on the public site)"
                  value={editing.published} onChange={(v) => set("published", v)} />
          <div className="btn-row" style={{ marginTop: 14 }}>
            <button className="btn" onClick={save} disabled={saving}>
              {saving ? "Saving…" : "Save work"}
            </button>
            <button className="btn ghost" onClick={() => setEditing(null)}>Cancel</button>
          </div>
        </div>
      )}
      {toast}
    </>
  );
}
