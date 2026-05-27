import { useSettings } from "../useSettings.js";
import { useToast, Select, Toggle } from "../ui.jsx";

export default function Theme() {
  const { settings, setPath, save, saving } = useSettings();
  const [toast, showToast] = useToast();
  if (!settings) return <div className="admin-center">Loading…</div>;

  const t = settings.theme;
  async function persist() {
    const err = await save();
    showToast(err ? err.message : "Theme saved — refresh the site to see it", !!err);
  }

  return (
    <>
      <div className="admin-head">
        <h1><em>Theme</em></h1>
        <span className="sub">global look of the site</span>
      </div>

      <div className="card">
        <h3>Layout</h3>
        <div className="row">
          <div className="field">
            <label>Grid gap: {t.gap}px</label>
            <input type="range" min={0} max={32} step={2} value={t.gap}
                   onChange={(e) => setPath("theme.gap", Number(e.target.value))} />
          </div>
        </div>
      </div>

      <div className="card">
        <h3>Typography & tone</h3>
        <div className="row">
          <Select label="Type pairing" value={t.type}
                  onChange={(v) => setPath("theme.type", v)}
                  options={[
                    { value: "editorial", label: "Editorial — Cormorant + Helvetica" },
                    { value: "modern", label: "Modern — DM Serif + DM Sans" },
                    { value: "magazine", label: "Magazine — Playfair + Manrope" },
                  ]} />
          <Select label="Tone / mood" value={t.tone}
                  onChange={(v) => setPath("theme.tone", v)}
                  options={[
                    { value: "pure", label: "Pure (true b&w)" },
                    { value: "warm", label: "Warm (sepia tint)" },
                    { value: "cool", label: "Cool" },
                    { value: "ivory", label: "Ivory" },
                    { value: "color", label: "Color (full color photos)" },
                  ]} />
        </div>
      </div>

      <div className="card">
        <h3>Flourishes</h3>
        <Toggle label="Show marquee ticker" value={t.showTicker}
                onChange={(v) => setPath("theme.showTicker", v)} />
        <Toggle label="Show tile corner numbers (№)" value={t.showCorner}
                onChange={(v) => setPath("theme.showCorner", v)} />
      </div>

      <div className="btn-row">
        <button className="btn" onClick={persist} disabled={saving}>
          {saving ? "Saving…" : "Save theme"}
        </button>
      </div>
      <p className="help" style={{ marginTop: 10 }}>
        These are the site-wide defaults. Visitors can still preview grid modes
        from the catalogue filter bar, but the saved default is what loads first.
      </p>
      {toast}
    </>
  );
}
