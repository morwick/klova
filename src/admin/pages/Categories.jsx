import { useEffect, useState, useCallback } from "react";
import { supabase } from "../../lib/supabase.js";
import { useToast, Text } from "../ui.jsx";

const slugify = (s) => s.toLowerCase().trim().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "");

export default function Categories() {
  const [toast, showToast] = useToast();
  const [rows, setRows] = useState([]);
  const [draft, setDraft] = useState({ label: "", slug: "" });

  const load = useCallback(async () => {
    const { data, error } = await supabase.from("categories").select("*").order("sort_order");
    if (error) showToast(error.message, true);
    else setRows(data || []);
  }, [showToast]);

  useEffect(() => { load(); }, [load]);

  async function add(e) {
    e.preventDefault();
    const slug = draft.slug || slugify(draft.label);
    if (!slug || !draft.label) return;
    const { error } = await supabase.from("categories")
      .insert({ slug, label: draft.label, sort_order: rows.length + 1 });
    if (error) showToast(error.message, true);
    else { setDraft({ label: "", slug: "" }); showToast("Category added"); load(); }
  }

  async function save(row) {
    const { error } = await supabase.from("categories")
      .update({ label: row.label, slug: row.slug, sort_order: row.sort_order })
      .eq("id", row.id);
    error ? showToast(error.message, true) : showToast("Saved");
  }

  async function del(id) {
    if (!confirm("Delete this category? Works keep their photos but lose this tag.")) return;
    const { error } = await supabase.from("categories").delete().eq("id", id);
    if (error) showToast(error.message, true);
    else { showToast("Deleted"); load(); }
  }

  const patch = (id, k, v) => setRows((r) => r.map((x) => (x.id === id ? { ...x, [k]: v } : x)));

  return (
    <>
      <div className="admin-head">
        <h1>Cate<em>gories</em></h1>
        <span className="sub">{rows.length} total</span>
      </div>

      <div className="card">
        <h3>Add category</h3>
        <form onSubmit={add} className="row">
          <Text label="Label" value={draft.label}
                onChange={(v) => setDraft({ label: v, slug: slugify(v) })} />
          <Text label="Slug" value={draft.slug} help="URL key, lowercase"
                onChange={(v) => setDraft((d) => ({ ...d, slug: slugify(v) }))} />
          <div style={{ alignSelf: "end" }}>
            <button className="btn">+ Add category</button>
          </div>
        </form>
      </div>

      <div className="card">
        <h3>All categories</h3>
        <table className="table">
          <thead>
            <tr><th>Order</th><th>Label</th><th>Slug</th><th></th></tr>
          </thead>
          <tbody>
            {rows.map((r) => (
              <tr key={r.id}>
                <td style={{ width: 90 }}>
                  <input type="number" value={r.sort_order ?? 0}
                         onChange={(e) => patch(r.id, "sort_order", Number(e.target.value))}
                         style={{ width: 70 }} />
                </td>
                <td><input value={r.label} onChange={(e) => patch(r.id, "label", e.target.value)} /></td>
                <td><input value={r.slug} onChange={(e) => patch(r.id, "slug", e.target.value)} /></td>
                <td>
                  <div className="btn-row">
                    <button className="btn ghost" onClick={() => save(r)}>Save</button>
                    <button className="btn danger" onClick={() => del(r.id)}>Delete</button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      {toast}
    </>
  );
}
