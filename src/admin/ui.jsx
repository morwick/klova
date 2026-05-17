import { useState, useCallback, useRef } from "react";
import { supabase, STORAGE_BUCKET, imageUrl } from "../lib/supabase.js";

// ─── toast ──────────────────────────────────────────
export function useToast() {
  const [toast, setToast] = useState(null);
  const show = useCallback((msg, err = false) => {
    setToast({ msg, err });
    window.clearTimeout(show._t);
    show._t = window.setTimeout(() => setToast(null), 3200);
  }, []);
  const node = toast ? (
    <div className={`toast ${toast.err ? "err" : ""}`}>{toast.msg}</div>
  ) : null;
  return [node, show];
}

// ─── fields ─────────────────────────────────────────
export function Text({ label, value, onChange, help, type = "text" }) {
  return (
    <div className="field">
      <label>{label}</label>
      <input type={type} value={value ?? ""} onChange={(e) => onChange(e.target.value)} />
      {help && <p className="help">{help}</p>}
    </div>
  );
}

export function Area({ label, value, onChange, help, rows = 4 }) {
  return (
    <div className="field">
      <label>{label}</label>
      <textarea rows={rows} value={value ?? ""} onChange={(e) => onChange(e.target.value)} />
      {help && <p className="help">{help}</p>}
    </div>
  );
}

export function Select({ label, value, onChange, options }) {
  return (
    <div className="field">
      <label>{label}</label>
      <select value={value} onChange={(e) => onChange(e.target.value)}>
        {options.map((o) => {
          const val = typeof o === "string" ? o : o.value;
          const lab = typeof o === "string" ? o : o.label;
          return <option key={val} value={val}>{lab}</option>;
        })}
      </select>
    </div>
  );
}

export function Toggle({ label, value, onChange }) {
  return (
    <div className="field" style={{ flexDirection: "row", alignItems: "center", gap: 12 }}>
      <input type="checkbox" checked={!!value} onChange={(e) => onChange(e.target.checked)}
             style={{ width: "auto" }} />
      <label style={{ margin: 0 }}>{label}</label>
    </div>
  );
}

// Editable list of plain strings.
export function StringList({ label, items, onChange }) {
  const list = items || [];
  return (
    <div className="field">
      <label>{label}</label>
      {list.map((v, i) => (
        <div key={i} className="btn-row" style={{ marginBottom: 6 }}>
          <input value={v} onChange={(e) => {
            const n = [...list]; n[i] = e.target.value; onChange(n);
          }} />
          <button type="button" className="btn ghost"
                  onClick={() => onChange(list.filter((_, j) => j !== i))}>✕</button>
        </div>
      ))}
      <button type="button" className="btn ghost"
              onClick={() => onChange([...list, ""])}>+ Add</button>
    </div>
  );
}

// ─── image upload ───────────────────────────────────
export function uploadImage(file, prefix = "content") {
  const safe = file.name.replace(/[^a-zA-Z0-9.\-_]/g, "_");
  const path = `${prefix}/${Date.now()}-${safe}`;
  return supabase.storage
    .from(STORAGE_BUCKET)
    .upload(path, file, { cacheControl: "3600", upsert: false })
    .then(({ error }) => {
      if (error) throw error;
      return path;
    });
}

// Image picker: shows current image, lets you upload a new file or clear it.
// Falls back to a picsum seed (kept editable) when no file is uploaded.
export function ImagePicker({ label, value, seed, onPath, onSeed, onToast }) {
  const inputRef = useRef();
  const [busy, setBusy] = useState(false);

  async function pick(e) {
    const file = e.target.files?.[0];
    if (!file) return;
    setBusy(true);
    try {
      const path = await uploadImage(file);
      onPath(path);
      onToast?.("Image uploaded");
    } catch (err) {
      onToast?.("Upload failed: " + (err.message || err), true);
    } finally {
      setBusy(false);
      if (inputRef.current) inputRef.current.value = "";
    }
  }

  return (
    <div className="field">
      <label>{label}</label>
      <div className="btn-row" style={{ alignItems: "flex-start" }}>
        <img className="thumb" alt="" src={imageUrl({ image_path: value, seed }, 200, 250)} />
        <div style={{ flex: 1 }}>
          <input ref={inputRef} type="file" accept="image/*" onChange={pick} disabled={busy} />
          <p className="help">{busy ? "Uploading…" : value ? `Stored: ${value}` : "No upload — using picsum seed below"}</p>
          {value && (
            <button type="button" className="btn ghost" onClick={() => onPath("")}>
              Remove uploaded image
            </button>
          )}
          {!value && onSeed && (
            <input style={{ marginTop: 6 }} value={seed ?? ""}
                   onChange={(e) => onSeed(e.target.value)} placeholder="picsum seed" />
          )}
        </div>
      </div>
    </div>
  );
}

// ─── focal point ────────────────────────────────────
// Click or drag on the photo to choose which part stays visible when the
// image is cropped to fill a frame (uniform / dense gallery layouts use
// object-fit: cover). Stores x/y as 0–100 percentages.
export function FocalPointPicker({ label, image_path, seed, x = 50, y = 50, onChange }) {
  const stageRef = useRef();
  const [drag, setDrag] = useState(false);
  const src = imageUrl({ image_path, seed }, 800, 1000);

  const apply = useCallback((e) => {
    const box = stageRef.current?.getBoundingClientRect();
    if (!box) return;
    const p = e.touches ? e.touches[0] : e;
    const nx = Math.min(100, Math.max(0, Math.round(((p.clientX - box.left) / box.width) * 100)));
    const ny = Math.min(100, Math.max(0, Math.round(((p.clientY - box.top) / box.height) * 100)));
    onChange(nx, ny);
  }, [onChange]);

  return (
    <div className="field">
      <label>{label}</label>
      <div className="focal">
        <div
          ref={stageRef}
          className="focal-stage"
          onMouseDown={(e) => { setDrag(true); apply(e); }}
          onMouseMove={(e) => { if (drag) apply(e); }}
          onMouseUp={() => setDrag(false)}
          onMouseLeave={() => setDrag(false)}
          onTouchStart={apply}
          onTouchMove={apply}
        >
          <img className="focal-img" src={src} alt="" draggable={false} />
          <span className="focal-dot" style={{ left: `${x}%`, top: `${y}%` }} />
        </div>
        <div className="focal-previews">
          {[["4 / 5", "Uniform"], ["1 / 1", "Dense"]].map(([ar, name]) => (
            <div key={name} className="focal-prev">
              <div className="focal-prev-frame" style={{ aspectRatio: ar }}>
                <img src={src} alt="" style={{ objectPosition: `${x}% ${y}%` }} />
              </div>
              <span className="focal-prev-cap">{name}</span>
            </div>
          ))}
        </div>
      </div>
      <p className="help">
        Focal point {x}% / {y}% — click or drag on the photo to choose what stays in frame.
      </p>
    </div>
  );
}
