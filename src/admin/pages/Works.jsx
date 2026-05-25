import { useEffect, useState, useCallback, useMemo, useRef } from "react";
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
  const [view, setView] = useState("list"); // "list" | "collage"

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

  // Persist a new ordering. `nextOrder` is the new array of works in display
  // order. Only items whose sort_order changed are written, and we reuse the
  // sort_order *slots* of the items in the input list — so reordering within
  // a filtered subset never disturbs items outside the filter.
  const persistOrder = useCallback(async (nextOrder, prevOrder) => {
    const slots = prevOrder.map((w) => w.sort_order ?? 0);
    const updates = [];
    const optimistic = new Map();
    nextOrder.forEach((w, i) => {
      const slot = slots[i];
      if (w.sort_order !== slot) {
        updates.push({ id: w.id, sort_order: slot });
        optimistic.set(w.id, slot);
      }
    });
    if (!updates.length) return;
    setRows((prev) =>
      prev.map((r) => (optimistic.has(r.id) ? { ...r, sort_order: optimistic.get(r.id) } : r))
    );
    const results = await Promise.all(
      updates.map((u) => supabase.from("works").update({ sort_order: u.sort_order }).eq("id", u.id))
    );
    const failed = results.find((r) => r.error);
    if (failed) {
      showToast(failed.error.message, true);
      load();
    } else {
      showToast("Order saved");
    }
  }, [load, showToast]);

  const set = (k, v) => setEditing((e) => ({ ...e, [k]: v }));

  return (
    <>
      <div className="admin-head">
        <h1>Works & <em>Photos</em></h1>
        <span className="sub">{rows.length} works</span>
      </div>

      {!editing && (
        <>
          <div className="btn-row" style={{ marginBottom: 18, justifyContent: "space-between" }}>
            <button className="btn" onClick={startNew}>+ New work</button>
            <div className="view-toggle" role="tablist">
              <button data-active={view === "list"} onClick={() => setView("list")}>List</button>
              <button data-active={view === "collage"} onClick={() => setView("collage")}>Smart collage</button>
            </div>
          </div>

          {view === "list" && (
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
          )}

          {view === "collage" && (
            <SmartCollage rows={rows} cats={cats} onReorder={persistOrder} onEdit={setEditing} />
          )}
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

// Drag-and-drop "smart collage" editor. Renders the same masonry layout the
// public site uses (CSS columns), with a category filter and HTML5 drag-and-
// drop reordering. Items are reordered visually on drop and the new sort_order
// values are pushed to Supabase.
function SmartCollage({ rows, cats, onReorder, onEdit }) {
  const [cat, setCat] = useState("all");
  const [dragId, setDragId] = useState(null);
  // Live preview order while dragging — array of work IDs in their current
  // (possibly shuffled) display order. null when not dragging.
  const [previewIds, setPreviewIds] = useState(null);
  const lastShuffle = useRef(0);

  const sorted = useMemo(
    () => [...rows].sort((a, b) => (a.sort_order ?? 0) - (b.sort_order ?? 0)),
    [rows]
  );

  const filtered = useMemo(
    () => (cat === "all" ? sorted : sorted.filter((w) => w.category_slug === cat || w.category_id === cat)),
    [sorted, cat]
  );

  const filterCats = useMemo(
    () => [{ id: "all", label: "All" }, ...cats.map((c) => ({ id: c.slug, label: c.label }))],
    [cats]
  );

  const counts = useMemo(() => {
    const c = { all: sorted.length };
    sorted.forEach((w) => { if (w.category_slug) c[w.category_slug] = (c[w.category_slug] ?? 0) + 1; });
    return c;
  }, [sorted]);

  // What we actually render: filtered list re-arranged to match previewIds
  // while a drag is in flight. Falls back to filtered when idle.
  const displayList = useMemo(() => {
    if (!previewIds) return filtered;
    const byId = new Map(filtered.map((w) => [w.id, w]));
    const out = [];
    previewIds.forEach((id) => { if (byId.has(id)) { out.push(byId.get(id)); byId.delete(id); } });
    byId.forEach((w) => out.push(w)); // any new items not in preview yet
    return out;
  }, [filtered, previewIds]);

  function onDragStart(e, id) {
    setDragId(id);
    setPreviewIds(filtered.map((w) => w.id));
    e.dataTransfer.effectAllowed = "move";
    try { e.dataTransfer.setData("text/plain", String(id)); } catch (_) {}
    // Hide the default ghost so it doesn't double-render over the live shift.
    if (e.dataTransfer.setDragImage) {
      const ghost = document.createElement("div");
      ghost.style.cssText = "position:fixed;top:-1000px;width:1px;height:1px;";
      document.body.appendChild(ghost);
      e.dataTransfer.setDragImage(ghost, 0, 0);
      setTimeout(() => ghost.remove(), 0);
    }
  }

  function shuffleTo(targetId) {
    if (!dragId || targetId === dragId) return;
    const now = performance.now();
    if (now - lastShuffle.current < 40) return;
    lastShuffle.current = now;
    setPreviewIds((prev) => {
      const ids = prev || filtered.map((w) => w.id);
      const src = ids.indexOf(dragId);
      const dst = ids.indexOf(targetId);
      if (src < 0 || dst < 0 || src === dst) return ids;
      const next = ids.slice();
      const [moved] = next.splice(src, 1);
      next.splice(dst, 0, moved);
      return next;
    });
  }

  function onDragOver(e, id) {
    e.preventDefault();
    e.dataTransfer.dropEffect = "move";
    shuffleTo(id);
  }

  function commitDrop(e) {
    if (e) e.preventDefault();
    const ids = previewIds;
    setDragId(null);
    setPreviewIds(null);
    if (!ids) return;
    const byId = new Map(filtered.map((w) => [w.id, w]));
    const next = ids.map((id) => byId.get(id)).filter(Boolean);
    // No-op if nothing actually moved.
    const same = next.length === filtered.length && next.every((w, i) => w.id === filtered[i].id);
    if (same) return;
    onReorder(next, filtered);
  }

  function onDragEnd() {
    // Fires after a successful drop too, but commitDrop has already cleared
    // state then — these become no-ops.
    setDragId(null);
    setPreviewIds(null);
  }

  return (
    <div className="card collage-card">
      <div className="collage-bar">
        <div className="chips">
          {filterCats.map((c) => (
            <button key={c.id} type="button" className="chip"
                    data-active={c.id === cat} onClick={() => setCat(c.id)}>
              {c.label}
              <span className="chip-count">({String(counts[c.id] ?? 0).padStart(2, "0")})</span>
            </button>
          ))}
        </div>
        <p className="help" style={{ margin: 0 }}>
          Drag a photo — the others shift live as you pass over them. Drop to save.
        </p>
      </div>

      {!filtered.length ? (
        <div className="empty" style={{ padding: 28 }}>No works in this filter yet.</div>
      ) : (
        <div
          className={`collage-grid${dragId ? " is-dragging-active" : ""}`}
          onDragOver={(e) => e.preventDefault()}
          onDrop={commitDrop}
        >
          {displayList.map((w, i) => {
            const isDragging = dragId === w.id;
            return (
              <figure
                key={w.id}
                className={`collage-tile${isDragging ? " is-dragging" : ""}`}
                draggable
                onDragStart={(e) => onDragStart(e, w.id)}
                onDragOver={(e) => onDragOver(e, w.id)}
                onDragEnter={() => shuffleTo(w.id)}
                onDragEnd={onDragEnd}
                onDrop={commitDrop}
              >
                <img
                  src={imageUrl(w, 600, Math.round(600 * (w.height || 1500) / (w.width || 1200)))}
                  alt={w.title}
                  draggable={false}
                  style={{ objectPosition: `${w.focal_x ?? 50}% ${w.focal_y ?? 50}%` }}
                />
                <figcaption>
                  <span className="collage-pos">№ {String(i + 1).padStart(2, "0")}</span>
                  <span className="collage-title">{w.title}</span>
                  <span className="collage-meta">
                    {(w.category_slug || "—")} · #{w.sort_order ?? 0}
                  </span>
                  <button type="button" className="btn ghost collage-edit"
                          onClick={() => onEdit(w)}>Edit</button>
                </figcaption>
              </figure>
            );
          })}
        </div>
      )}
    </div>
  );
}
