import { useSettings } from "../useSettings.js";
import { useToast, Text, Area, Select, Toggle, StringList, ImagePicker, FocalPointPicker } from "../ui.jsx";

export default function Content() {
  const { settings, setPath, setSettings, save, saving } = useSettings();
  const [toast, showToast] = useToast();
  if (!settings) return <div className="admin-center">Loading…</div>;

  const s = settings;
  async function persist() {
    const err = await save();
    showToast(err ? err.message : "Content saved", !!err);
  }
  // helpers that mutate nested arrays through setSettings
  const mut = (fn) => setSettings((prev) => { const n = structuredClone(prev); fn(n); return n; });

  return (
    <>
      <div className="admin-head">
        <h1>Site <em>Content</em></h1>
        <span className="sub">edits the live site</span>
      </div>

      {/* NAV */}
      <div className="card">
        <h3>Navigation</h3>
        <div className="row-3">
          <Text label="Brand" value={s.nav.brand} onChange={(v) => setPath("nav.brand", v)} />
          <Text label="Meta (left)" value={s.nav.meta} onChange={(v) => setPath("nav.meta", v)} />
          <Text label="Meta (location)" value={s.nav.metaLoc} onChange={(v) => setPath("nav.metaLoc", v)} />
        </div>
        <Text label="Inquire button label" value={s.nav.inquireLabel}
              onChange={(v) => setPath("nav.inquireLabel", v)} />
        <label className="help">Nav links</label>
        {s.nav.links.map((l, i) => (
          <div className="row" key={i}>
            <Text label={`Link ${i + 1} label`} value={l.label}
                  onChange={(v) => mut((n) => { n.nav.links[i].label = v; })} />
            <div className="btn-row" style={{ alignItems: "end" }}>
              <button className="btn danger"
                      onClick={() => mut((n) => { n.nav.links.splice(i, 1); })}>Remove</button>
            </div>
          </div>
        ))}
        <button className="btn ghost"
                onClick={() => mut((n) => { n.nav.links.push({ label: "Link", section: "work" }); })}>
          + Add link
        </button>
      </div>

      {/* HERO */}
      <div className="card">
        <h3>Hero</h3>
        <Text label="Eyebrow" value={s.hero.eyebrow} onChange={(v) => setPath("hero.eyebrow", v)} />
        <div className="row-3">
          <Text label="Title line 1" value={s.hero.titleLead} onChange={(v) => setPath("hero.titleLead", v)} />
          <Text label="Title line 2" value={s.hero.titleRest} onChange={(v) => setPath("hero.titleRest", v)} />
          <Text label="Title (italic word)" value={s.hero.titleEm} onChange={(v) => setPath("hero.titleEm", v)} />
        </div>
        <Text label="Title tail" value={s.hero.titleTail} onChange={(v) => setPath("hero.titleTail", v)} />
        <Area label="Sub-paragraph" value={s.hero.sub} onChange={(v) => setPath("hero.sub", v)} />
        <Text label="CTA label" value={s.hero.ctaLabel} onChange={(v) => setPath("hero.ctaLabel", v)} />
        <div className="row-3">
          <Text label="Meta — Works label" value={s.hero.metaWorksLabel} onChange={(v) => setPath("hero.metaWorksLabel", v)} />
          <Text label="Meta — Categories label" value={s.hero.metaCategoriesLabel} onChange={(v) => setPath("hero.metaCategoriesLabel", v)} />
          <Text label="Meta — Since label" value={s.hero.metaSinceLabel} onChange={(v) => setPath("hero.metaSinceLabel", v)} />
        </div>
        <Text label="Since value" value={s.hero.metaSinceValue} onChange={(v) => setPath("hero.metaSinceValue", v)} />
        <div className="row">
          <Text label="Featured caption" value={s.hero.featuredCaption} onChange={(v) => setPath("hero.featuredCaption", v)} />
          <Text label="Featured tag" value={s.hero.featuredTag} onChange={(v) => setPath("hero.featuredTag", v)} />
        </div>
        <ImagePicker label="Hero image" value={s.hero.image_path} seed={s.hero.seed}
                     onPath={(p) => setPath("hero.image_path", p)}
                     onSeed={(v) => setPath("hero.seed", v)} onToast={showToast} />
        <FocalPointPicker
          label="Hero photo position in frame"
          image_path={s.hero.image_path} seed={s.hero.seed}
          x={s.hero.focal_x ?? 50} y={s.hero.focal_y ?? 50}
          onChange={(fx, fy) => mut((n) => { n.hero.focal_x = fx; n.hero.focal_y = fy; })}
        />
      </div>

      {/* CATALOGUE HEADER */}
      <div className="card">
        <h3>Catalogue section header</h3>
        <div className="row">
          <Text label="Section number" value={s.catalogue.sectionNum} onChange={(v) => setPath("catalogue.sectionNum", v)} />
          <Text label="Aside" value={s.catalogue.aside} onChange={(v) => setPath("catalogue.aside", v)} />
        </div>
        <div className="row-3">
          <Text label="Title lead" value={s.catalogue.titleLead} onChange={(v) => setPath("catalogue.titleLead", v)} />
          <Text label="Title (italic)" value={s.catalogue.titleEm} onChange={(v) => setPath("catalogue.titleEm", v)} />
          <Text label="Title tail" value={s.catalogue.titleTail} onChange={(v) => setPath("catalogue.titleTail", v)} />
        </div>
      </div>

      {/* TICKER */}
      <div className="card">
        <h3>Ticker</h3>
        <StringList label="Items" items={s.ticker.items}
                    onChange={(v) => setPath("ticker.items", v)} />
      </div>

      {/* ABOUT */}
      <div className="card">
        <h3>Story / About</h3>
        <div className="row">
          <Text label="Section number" value={s.about.sectionNum} onChange={(v) => setPath("about.sectionNum", v)} />
          <Text label="Aside" value={s.about.aside} onChange={(v) => setPath("about.aside", v)} />
        </div>
        <div className="row-3">
          <Text label="Title lead" value={s.about.titleLead} onChange={(v) => setPath("about.titleLead", v)} />
          <Text label="Title (italic)" value={s.about.titleEm} onChange={(v) => setPath("about.titleEm", v)} />
          <Text label="Title tail" value={s.about.titleTail} onChange={(v) => setPath("about.titleTail", v)} />
        </div>
        <Area label="Body (HTML allowed: <em>…</em>. Use a blank line or <p>…</p> for new paragraphs.)" rows={6}
              value={s.about.body} onChange={(v) => setPath("about.body", v)} />
        <div className="row-3">
          <Select
            label="Text alignment"
            value={s.about.bodyAlign ?? "left"}
            onChange={(v) => setPath("about.bodyAlign", v)}
            options={[
              { value: "left",    label: "Align left" },
              { value: "right",   label: "Align right" },
              { value: "center",  label: "Center" },
              { value: "justify", label: "Justify" },
            ]}
          />
          <Text label="Line spacing (line-height)" type="number"
                value={s.about.bodyLineHeight ?? 1.4}
                onChange={(v) => setPath("about.bodyLineHeight", v === "" ? "" : Number(v))}
                help="Unitless multiplier — e.g. 1.2 tight, 1.4 normal, 1.8 airy" />
          <Text label="Paragraph spacing (em)" type="number"
                value={s.about.bodyParagraphSpacing ?? 1}
                onChange={(v) => setPath("about.bodyParagraphSpacing", v === "" ? "" : Number(v))}
                help="Gap between paragraphs in em — 0 for none, 1 for one line" />
        </div>
        <label className="help">Stats</label>
        {s.about.stats.map((st, i) => (
          <div className="row" key={i}>
            <Text label={`Stat ${i + 1} label`} value={st.k}
                  onChange={(v) => mut((n) => { n.about.stats[i].k = v; })} />
            <div style={{ display: "flex", gap: 10, alignItems: "end" }}>
              <Text label="Value" value={st.v}
                    onChange={(v) => mut((n) => { n.about.stats[i].v = v; })} />
              <button className="btn danger" style={{ marginBottom: 14 }}
                      onClick={() => mut((n) => { n.about.stats.splice(i, 1); })}>✕</button>
            </div>
          </div>
        ))}
        <button className="btn ghost"
                onClick={() => mut((n) => { n.about.stats.push({ k: "Label", v: "0" }); })}>
          + Add stat
        </button>
        <div style={{ marginTop: 14 }}>
          <ImagePicker label="Studio figure image" value={s.about.image_path} seed={s.about.seed}
                       onPath={(p) => setPath("about.image_path", p)}
                       onSeed={(v) => setPath("about.seed", v)} onToast={showToast} />
          <div style={{ marginTop: 14 }}>
            <FocalPointPicker
              label="Studio photo position in frame"
              image_path={s.about.image_path} seed={s.about.seed}
              x={s.about.focal_x ?? 50} y={s.about.focal_y ?? 50}
              onChange={(fx, fy) => mut((n) => { n.about.focal_x = fx; n.about.focal_y = fy; })}
            />
          </div>
        </div>
      </div>

      {/* FOOTER */}
      <div className="card">
        <h3>Footer</h3>
        <div className="row">
          <Text label="Brand" value={s.footer.brand} onChange={(v) => setPath("footer.brand", v)} />
          <Text label="Tagline" value={s.footer.tag} onChange={(v) => setPath("footer.tag", v)} />
        </div>
        {s.footer.cols.map((col, ci) => (
          <div key={ci} className="card" style={{ background: "var(--paper)" }}>
            <div className="btn-row" style={{ justifyContent: "space-between" }}>
              <Text label={`Column ${ci + 1} heading`} value={col.h4}
                    onChange={(v) => mut((n) => { n.footer.cols[ci].h4 = v; })} />
              <button className="btn danger" style={{ marginBottom: 14 }}
                      onClick={() => mut((n) => { n.footer.cols.splice(ci, 1); })}>Remove column</button>
            </div>
            {col.items.map((it, ii) => (
              <div className="row-3" key={ii}>
                <Text label="Label" value={it.label}
                      onChange={(v) => mut((n) => { n.footer.cols[ci].items[ii].label = v; })} />
                <Text label="Type (text/link)" value={it.type}
                      onChange={(v) => mut((n) => { n.footer.cols[ci].items[ii].type = v; })} />
                <div style={{ display: "flex", gap: 8, alignItems: "end" }}>
                  <Text label="Href (if link)" value={it.href || ""}
                        onChange={(v) => mut((n) => { n.footer.cols[ci].items[ii].href = v; })} />
                  <button className="btn danger" style={{ marginBottom: 14 }}
                          onClick={() => mut((n) => { n.footer.cols[ci].items.splice(ii, 1); })}>✕</button>
                </div>
              </div>
            ))}
            <button className="btn ghost"
                    onClick={() => mut((n) => { n.footer.cols[ci].items.push({ type: "link", label: "Label", href: "#" }); })}>
              + Add item
            </button>
          </div>
        ))}
        <button className="btn ghost"
                onClick={() => mut((n) => { n.footer.cols.push({ h4: "Column", items: [] }); })}>
          + Add column
        </button>
        <div style={{ marginTop: 14 }}>
          <StringList label="Footer bottom line" items={s.footer.bottom}
                      onChange={(v) => setPath("footer.bottom", v)} />
        </div>
      </div>

      {/* LIGHTBOX */}
      <div className="card">
        <h3>Lightbox detail</h3>
        <Area label="Body (use {cat} for the category)" rows={3}
              value={s.lightbox.body} onChange={(v) => setPath("lightbox.body", v)} />
        <div className="row">
          <Text label="Format" value={s.lightbox.format} onChange={(v) => setPath("lightbox.format", v)} />
          <Text label="Edition" value={s.lightbox.edition} onChange={(v) => setPath("lightbox.edition", v)} />
        </div>
      </div>

      {/* CONTACT / WHATSAPP */}
      <div className="card">
        <h3>WhatsApp button</h3>
        <Toggle label="Show floating WhatsApp button on the site"
                value={s.contact.whatsappEnabled}
                onChange={(v) => setPath("contact.whatsappEnabled", v)} />
        <div className="row">
          <Text label="WhatsApp number" value={s.contact.whatsappNumber}
                onChange={(v) => setPath("contact.whatsappNumber", v)}
                help="International format, digits only — e.g. 6281390000124 (no +, spaces or -)" />
        </div>
        <Area label="Pre-filled message" rows={2}
              value={s.contact.whatsappMessage}
              onChange={(v) => setPath("contact.whatsappMessage", v)}
              help="Text the visitor's chat opens with" />
      </div>

      <div className="btn-row" style={{ position: "sticky", bottom: 16 }}>
        <button className="btn" onClick={persist} disabled={saving}>
          {saving ? "Saving…" : "Save all content"}
        </button>
      </div>
      {toast}
    </>
  );
}
