import { useEffect, useState, useCallback } from "react";
import { supabase } from "../../lib/supabase.js";
import { useToast, Text, Area } from "../ui.jsx";

export default function Services() {
  const [toast, showToast] = useToast();
  const [rows, setRows] = useState([]);

  const load = useCallback(async () => {
    const { data, error } = await supabase.from("services").select("*").order("sort_order");
    if (error) showToast(error.message, true);
    else setRows(data || []);
  }, [showToast]);

  useEffect(() => { load(); }, [load]);

  const patch = (id, k, v) => setRows((r) => r.map((x) => (x.id === id ? { ...x, [k]: v } : x)));

  async function addRow() {
    const { error } = await supabase.from("services")
      .insert({ num: String(rows.length + 1).padStart(2, "0"), title: "New service", body: "", sort_order: rows.length + 1 });
    error ? showToast(error.message, true) : load();
  }
  async function save(row) {
    const { error } = await supabase.from("services")
      .update({ num: row.num, title: row.title, body: row.body, sort_order: row.sort_order })
      .eq("id", row.id);
    showToast(error ? error.message : "Saved", !!error);
  }
  async function del(id) {
    if (!confirm("Delete this service?")) return;
    const { error } = await supabase.from("services").delete().eq("id", id);
    if (error) showToast(error.message, true); else load();
  }

  return (
    <>
      <div className="admin-head">
        <h1>Ser<em>vices</em></h1>
        <span className="sub">{rows.length} blocks</span>
      </div>
      <div className="btn-row" style={{ marginBottom: 18 }}>
        <button className="btn" onClick={addRow}>+ Add service</button>
      </div>
      {rows.map((r) => (
        <div className="card" key={r.id}>
          <div className="row-3">
            <Text label="Number" value={r.num} onChange={(v) => patch(r.id, "num", v)} />
            <Text label="Title" value={r.title} onChange={(v) => patch(r.id, "title", v)}
                  help="First & becomes italic on the site" />
            <Text label="Sort order" type="number" value={r.sort_order}
                  onChange={(v) => patch(r.id, "sort_order", Number(v))} />
          </div>
          <Area label="Body" value={r.body} onChange={(v) => patch(r.id, "body", v)} />
          <div className="btn-row">
            <button className="btn ghost" onClick={() => save(r)}>Save</button>
            <button className="btn danger" onClick={() => del(r.id)}>Delete</button>
          </div>
        </div>
      ))}
      {toast}
    </>
  );
}
