import { useState, useCallback, useRef } from "react";
import { supabase, STORAGE_BUCKET, imageUrl, storageUrl, deleteStorageFile } from "../lib/supabase.js";

const MAX_VIDEO_BYTES = 100 * 1024 * 1024; // 100 MB soft cap

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
// Picking a new file while one is already stored deletes the old file from
// storage, so "replace" actually frees the previous asset instead of
// orphaning it. Same for the explicit Remove button.
export function ImagePicker({ label, value, seed, onPath, onSeed, onToast }) {
  const inputRef = useRef();
  const [busy, setBusy] = useState(false);

  async function pick(e) {
    const file = e.target.files?.[0];
    if (!file) return;
    setBusy(true);
    const oldPath = value;
    try {
      const path = await uploadImage(file);
      onPath(path);
      if (oldPath && oldPath !== path) await deleteStorageFile(oldPath);
      onToast?.(oldPath ? "Image replaced" : "Image uploaded");
    } catch (err) {
      onToast?.("Upload failed: " + (err.message || err), true);
    } finally {
      setBusy(false);
      if (inputRef.current) inputRef.current.value = "";
    }
  }

  async function remove() {
    const oldPath = value;
    onPath("");
    if (oldPath) {
      await deleteStorageFile(oldPath);
      onToast?.("Image removed");
    }
  }

  return (
    <div className="field">
      <label>{label}</label>
      <div className="btn-row" style={{ alignItems: "flex-start" }}>
        <img className="thumb" alt="" src={imageUrl({ image_path: value, seed }, 200, 250)} />
        <div style={{ flex: 1 }}>
          <input ref={inputRef} type="file" accept="image/*" onChange={pick} disabled={busy} />
          <p className="help">
            {busy ? "Uploading…" : value
              ? `Stored: ${value} — picking a new file will replace this one.`
              : "No upload — using picsum seed below"}
          </p>
          {value && (
            <button type="button" className="btn ghost" onClick={remove}>
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

// ─── video upload ───────────────────────────────────
// Optional video for a Work. When set, the public site renders the work as
// an autoplaying/muted/looping <video> instead of a static photo. The
// existing image_path (or seed fallback) is still used as poster/thumbnail.
// onSize(width, height) fires once the video's intrinsic dimensions are read
// from metadata, so the caller can sync work.width / work.height to it.
function readVideoDimensions(file) {
  return new Promise((resolve, reject) => {
    const url = URL.createObjectURL(file);
    const v = document.createElement("video");
    v.preload = "metadata";
    v.muted = true;
    v.onloadedmetadata = () => {
      const w = v.videoWidth, h = v.videoHeight;
      URL.revokeObjectURL(url);
      if (!w || !h) reject(new Error("Couldn't read video dimensions"));
      else resolve({ width: w, height: h });
    };
    v.onerror = () => { URL.revokeObjectURL(url); reject(new Error("Couldn't read video metadata")); };
    v.src = url;
  });
}

export function VideoPicker({ label, value, onPath, onSize, onToast }) {
  const inputRef = useRef();
  const [busy, setBusy] = useState(false);

  async function pick(e) {
    const file = e.target.files?.[0];
    if (!file) return;
    if (file.size > MAX_VIDEO_BYTES) {
      onToast?.(`Video is too large (${(file.size / 1024 / 1024).toFixed(1)} MB) — keep it under 100 MB`, true);
      e.target.value = "";
      return;
    }
    setBusy(true);
    const oldPath = value;
    let dims = null;
    try {
      try { dims = await readVideoDimensions(file); } catch (_) { /* non-fatal */ }
      const path = await uploadImage(file, "videos");
      onPath(path);
      if (dims) onSize?.(dims.width, dims.height);
      if (oldPath && oldPath !== path) await deleteStorageFile(oldPath);
      const verb = oldPath ? "replaced" : "uploaded";
      onToast?.(dims
        ? `Video ${verb} — ${dims.width}×${dims.height} detected`
        : `Video ${verb}`);
    } catch (err) {
      onToast?.("Upload failed: " + (err.message || err), true);
    } finally {
      setBusy(false);
      if (inputRef.current) inputRef.current.value = "";
    }
  }

  async function remove() {
    const oldPath = value;
    onPath("");
    if (oldPath) {
      await deleteStorageFile(oldPath);
      onToast?.("Video removed");
    }
  }

  const src = storageUrl(value);

  return (
    <div className="field">
      <label>{label}</label>
      <div className="btn-row" style={{ alignItems: "flex-start" }}>
        {src ? (
          <video className="thumb" src={src} muted autoPlay loop playsInline
                 style={{ objectFit: "cover", background: "#000" }} />
        ) : (
          <div className="thumb" style={{
            display: "grid", placeItems: "center", fontSize: 10,
            color: "var(--mute)", background: "var(--paper)",
          }}>No video</div>
        )}
        <div style={{ flex: 1 }}>
          <input ref={inputRef} type="file" accept="video/*" onChange={pick} disabled={busy} />
          <p className="help">
            {busy ? "Uploading…" : value
              ? `Stored: ${value} — picking a new file will replace this one.`
              : "Optional — leave empty to keep this work as a photo. MP4/WebM recommended, < 100 MB."}
          </p>
          {value && (
            <button type="button" className="btn ghost" onClick={remove}>
              Remove video
            </button>
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
