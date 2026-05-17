/* klova — public photography catalogue
   Pixel-perfect port of the Claude Design prototype, now driven by Supabase.
   Component structure & class names kept identical to the design. */

import { useState, useEffect, useMemo, useCallback } from "react";
import { Link } from "react-router-dom";
import { useSiteData, useThemeVars } from "../lib/useSiteData.js";
import { imageUrl } from "../lib/supabase.js";

const fmt2 = (n) => String(n).padStart(2, "0");

// ─── nav ────────────────────────────────────────────
function TopNav({ nav, onWork, onInquire }) {
  return (
    <nav className="nav">
      <div className="nav-left">
        {nav.links.map((l) => (
          <button key={l.label} className="nav-link"
                  data-active={l.section === "work"} onClick={onWork}>
            {l.label}
          </button>
        ))}
      </div>
      <button className="nav-brand" onClick={onWork}>{nav.brand}</button>
      <div className="nav-right">
        <span className="nav-meta">
          {nav.meta} <span className="nav-dot" /> {nav.metaLoc}
        </span>
        <button className="nav-link" onClick={onInquire}>{nav.inquireLabel}</button>
      </div>
    </nav>
  );
}

// ─── hero ───────────────────────────────────────────
function Hero({ hero, count, catCount, onStart }) {
  return (
    <section className="hero">
      <div className="hero-text">
        <div className="hero-eyebrow">
          <span className="rule" />
          <span>{hero.eyebrow}</span>
        </div>

        <div>
          <h1 className="hero-title">
            {hero.titleLead}<br />{hero.titleRest}<em>{hero.titleEm}</em>{hero.titleTail}
          </h1>
          <p className="hero-sub" style={{ marginTop: 28 }}>{hero.sub}</p>
        </div>

        <div>
          <button className="hero-cta" onClick={onStart}>
            <span>{hero.ctaLabel}</span>
            <span className="hero-cta-arrow" />
          </button>

          <div className="hero-meta">
            <div className="hero-meta-cell">
              <span className="hero-meta-k">{hero.metaWorksLabel}</span>
              <span className="hero-meta-v">{fmt2(count)}</span>
            </div>
            <div className="hero-meta-cell">
              <span className="hero-meta-k">{hero.metaCategoriesLabel}</span>
              <span className="hero-meta-v">{fmt2(catCount)}</span>
            </div>
            <div className="hero-meta-cell">
              <span className="hero-meta-k">{hero.metaSinceLabel}</span>
              <span className="hero-meta-v">{hero.metaSinceValue}</span>
            </div>
          </div>
        </div>
      </div>

      <div className="hero-image-wrap">
        <img className="hero-image" src={imageUrl(hero, 1400, 1800)} alt="featured"
             style={{ objectPosition: `${hero.focal_x ?? 50}% ${hero.focal_y ?? 50}%` }} />
        <div className="hero-image-meta">
          <span>{hero.featuredCaption}</span>
          <span className="hero-image-tag">{hero.featuredTag}</span>
        </div>
      </div>
    </section>
  );
}

// ─── ticker ─────────────────────────────────────────
function Ticker({ items }) {
  return (
    <div className="ticker">
      {items.map((t, i) => (
        <span className="ticker-item" key={i}>
          <span className="ticker-star" />
          <span>{t}</span>
        </span>
      ))}
    </div>
  );
}

// ─── filter + gallery ───────────────────────────────
function FilterBar({ categories, cat, setCat, layout, setLayout, total, counts }) {
  const cur = categories.find((c) => c.id === cat) || categories[0];
  return (
    <div className="filter">
      <div className="filter-label">
        <span className="filter-label-k">Now showing</span>
        <span className="filter-label-v">{cur.label}</span>
        <span className="filter-label-count">— {fmt2(total)} works</span>
      </div>
      <div className="chips">
        {categories.map((c) => (
          <button key={c.id} className="chip" data-active={c.id === cat}
                  onClick={() => setCat(c.id)}>
            {c.label}
            <span className="chip-count">({fmt2(counts[c.id] ?? 0)})</span>
          </button>
        ))}
      </div>
      <div className="layout-toggle" role="tablist">
        {["editorial", "uniform", "dense"].map((l) => (
          <button key={l} data-active={layout === l} onClick={() => setLayout(l)}>{l}</button>
        ))}
      </div>
    </div>
  );
}

function Tile({ work, index, layout, showCorner, onOpen }) {
  const isEditorial = layout === "editorial";
  return (
    <figure className="tile" onClick={() => onOpen(work)} role="button" tabIndex={0}
            onKeyDown={(e) => { if (e.key === "Enter") onOpen(work); }}>
      <img
        className="tile-img"
        loading="lazy"
        src={imageUrl(work, isEditorial ? work.width : 900, isEditorial ? work.height : 1125)}
        alt={work.title}
        style={{
          objectPosition: `${work.focal_x ?? 50}% ${work.focal_y ?? 50}%`,
          ...(isEditorial ? { width: "100%", height: "auto" } : {}),
        }}
      />
      {showCorner && <span className="tile-corner">№ {fmt2(index + 1)}</span>}
      <span className="tile-overlay" />
      <figcaption className="tile-meta">
        <div>
          <div className="tile-cat">{work.catLabel || work.cat} — {work.location}</div>
          <div className="tile-title">{work.title}</div>
        </div>
        <div className="tile-idx">{work.year}</div>
      </figcaption>
    </figure>
  );
}

function Gallery({ items, layout, showCorner, onOpen }) {
  if (!items.length) {
    return <div className="empty">No works in this category yet — check back soon.</div>;
  }
  return (
    <div className="gallery-wrap">
      <div className={`gallery ${layout}`}>
        {items.map((w, i) => (
          <Tile key={w.id} work={w} index={i} layout={layout}
                showCorner={showCorner} onOpen={onOpen} />
        ))}
      </div>
    </div>
  );
}

// ─── about ──────────────────────────────────────────
function About({ about }) {
  return (
    <>
      <header className="section-head">
        <span className="section-num">{about.sectionNum}</span>
        <h2 className="section-title">
          {about.titleLead}<em>{about.titleEm}</em>{about.titleTail}
        </h2>
        <span className="section-aside">{about.aside}</span>
      </header>
      <div className="about">
        <div>
          <p className="about-body" dangerouslySetInnerHTML={{ __html: about.body }} />
          <div className="about-stats">
            {about.stats.map((s, i) => (
              <div key={i}>
                <div className="about-stat-k">{s.k}</div>
                <div className="about-stat-v">{s.v}</div>
              </div>
            ))}
          </div>
        </div>
        <figure className="about-figure">
          <img src={imageUrl(about, 1200, 1500)} alt="studio"
               style={{ objectPosition: `${about.focal_x ?? 50}% ${about.focal_y ?? 50}%` }} />
        </figure>
      </div>
    </>
  );
}

function Services({ services }) {
  return (
    <section className="services">
      {services.map((s) => (
        <div className="svc" key={s.num}>
          <div className="svc-num">— {s.num}</div>
          <div className="svc-title"
               dangerouslySetInnerHTML={{ __html: (s.title || "").replace("&", "<em>&</em>") }} />
          <div className="svc-body">{s.body}</div>
        </div>
      ))}
    </section>
  );
}

// ─── footer ─────────────────────────────────────────
function Foot({ footer }) {
  return (
    <footer className="foot">
      <div>
        <div className="foot-brand">{footer.brand}<span style={{ fontStyle: "normal" }}>.</span></div>
        <div className="foot-tag">{footer.tag}</div>
      </div>
      {footer.cols.map((col, i) => (
        <div className="foot-col" key={i}>
          <h4>{col.h4}</h4>
          {col.items.map((it, j) =>
            it.type === "link"
              ? <a key={j} href={it.href}>{it.label}</a>
              : <p key={j}>{it.label}</p>
          )}
        </div>
      ))}
      <div className="foot-bottom">
        {footer.bottom.map((b, i) => <span key={i}>{b}</span>)}
      </div>
    </footer>
  );
}

// ─── lightbox ───────────────────────────────────────
function Lightbox({ work, items, onClose, onPrev, onNext, index, lb }) {
  useEffect(() => {
    function onKey(e) {
      if (e.key === "Escape") onClose();
      if (e.key === "ArrowLeft") onPrev();
      if (e.key === "ArrowRight") onNext();
    }
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [onClose, onPrev, onNext]);

  if (!work) return null;
  const ratioH = Math.round(1600 * (work.height || 1500) / (work.width || 1200));
  return (
    <div className="lb" onClick={onClose}>
      <div className="lb-main" onClick={(e) => e.stopPropagation()}>
        <img className="lb-img" src={imageUrl(work, 1600, ratioH)} alt={work.title} />
        <span className="lb-counter">{fmt2(index + 1)} / {fmt2(items.length)}</span>
        <div className="lb-nav">
          <button className="lb-btn" onClick={onPrev} aria-label="prev">←</button>
          <button className="lb-btn" onClick={onNext} aria-label="next">→</button>
          <button className="lb-btn" onClick={onClose} aria-label="close">✕</button>
        </div>
      </div>
      <aside className="lb-side" onClick={(e) => e.stopPropagation()}>
        <div className="lb-cat">{work.catLabel || work.cat}</div>
        <div className="lb-title">
          {work.title.split(",")[0]}
          {work.title.includes(",") && <em>,{work.title.split(",").slice(1).join(",")}</em>}
        </div>
        <p className="lb-body">{(lb.body || "").replace("{cat}", work.catLabel || work.cat)}</p>
        <div className="lb-grid">
          <div><div className="lb-k">Location</div><div className="lb-v">{work.location}</div></div>
          <div><div className="lb-k">Year</div><div className="lb-v">{work.year}</div></div>
          <div><div className="lb-k">Format</div><div className="lb-v">{lb.format}</div></div>
          <div><div className="lb-k">Edition</div><div className="lb-v">{lb.edition}</div></div>
        </div>
      </aside>
    </div>
  );
}

// ─── whatsapp ───────────────────────────────────────
// Floating button → opens a WhatsApp chat room directly (wa.me deep link).
function WhatsAppButton({ contact }) {
  const num = (contact.whatsappNumber || "").replace(/[^0-9]/g, "");
  if (!contact.whatsappEnabled || !num) return null;
  const href = `https://wa.me/${num}?text=${encodeURIComponent(contact.whatsappMessage || "")}`;
  return (
    <a
      href={href}
      target="_blank"
      rel="noopener noreferrer"
      aria-label="Chat on WhatsApp"
      title="Chat on WhatsApp"
      style={{
        position: "fixed", right: 24, bottom: 56, zIndex: 90,
        width: 56, height: 56, borderRadius: "50%",
        background: "#25D366", color: "#fff",
        display: "flex", alignItems: "center", justifyContent: "center",
        boxShadow: "0 8px 28px rgba(0,0,0,0.28)",
        transition: "transform 200ms ease",
      }}
      onMouseEnter={(e) => { e.currentTarget.style.transform = "translateY(-2px)"; }}
      onMouseLeave={(e) => { e.currentTarget.style.transform = "translateY(0)"; }}
    >
      <svg width="28" height="28" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
        <path d="M12.04 2C6.58 2 2.13 6.45 2.13 11.91c0 1.75.46 3.45 1.32 4.95L2 22l5.25-1.38a9.9 9.9 0 0 0 4.79 1.22h.01c5.46 0 9.91-4.45 9.91-9.91 0-2.65-1.03-5.14-2.9-7.01A9.82 9.82 0 0 0 12.04 2Zm0 18.02h-.01a8.23 8.23 0 0 1-4.19-1.15l-.3-.18-3.12.82.83-3.04-.2-.31a8.21 8.21 0 0 1-1.26-4.39c0-4.54 3.7-8.23 8.25-8.23 2.2 0 4.27.86 5.83 2.42a8.18 8.18 0 0 1 2.41 5.82c0 4.54-3.7 8.24-8.24 8.24Zm4.52-6.16c-.25-.12-1.47-.72-1.69-.81-.23-.08-.39-.12-.56.13-.16.25-.64.81-.78.97-.14.17-.29.19-.54.06-.25-.12-1.05-.39-1.99-1.23-.74-.66-1.23-1.47-1.38-1.72-.14-.25-.02-.38.11-.51.11-.11.25-.29.37-.43.13-.14.17-.25.25-.41.08-.17.04-.31-.02-.43-.06-.12-.56-1.34-.76-1.84-.2-.48-.4-.42-.56-.43-.14 0-.31-.01-.47-.01-.17 0-.43.06-.66.31-.23.25-.86.85-.86 2.07 0 1.22.89 2.4 1.01 2.56.12.17 1.75 2.67 4.23 3.74.59.26 1.05.41 1.41.52.59.19 1.13.16 1.56.1.48-.07 1.47-.6 1.68-1.18.21-.58.21-1.07.14-1.18-.06-.11-.22-.17-.47-.29Z" />
      </svg>
    </a>
  );
}

// ─── root ───────────────────────────────────────────
export default function PublicSite() {
  const { loading, categories, works, services, settings } = useSiteData();
  const [cat, setCat] = useState("all");
  const [open, setOpen] = useState(null);

  useThemeVars(settings.theme);

  // "All Works" + DB categories, shaped for the filter bar.
  const filterCats = useMemo(
    () => [{ id: "all", label: "All Works" }, ...categories.map((c) => ({ id: c.slug, label: c.label }))],
    [categories]
  );

  const items = useMemo(
    () => (cat === "all" ? works : works.filter((w) => w.cat === cat)),
    [cat, works]
  );

  const counts = useMemo(() => {
    const c = { all: works.length };
    works.forEach((w) => { c[w.cat] = (c[w.cat] ?? 0) + 1; });
    return c;
  }, [works]);

  const openIdx = useMemo(
    () => (open ? items.findIndex((w) => w.id === open) : -1),
    [open, items]
  );
  const openWork = openIdx >= 0 ? items[openIdx] : null;

  const onPrev = useCallback(() => {
    if (openIdx < 0) return;
    setOpen(items[(openIdx - 1 + items.length) % items.length].id);
  }, [openIdx, items]);
  const onNext = useCallback(() => {
    if (openIdx < 0) return;
    setOpen(items[(openIdx + 1) % items.length].id);
  }, [openIdx, items]);

  useEffect(() => {
    document.body.style.overflow = openWork ? "hidden" : "";
    return () => { document.body.style.overflow = ""; };
  }, [openWork]);

  const scrollTo = (id) => {
    const el = document.getElementById(id);
    if (!el) return;
    const y = el.getBoundingClientRect().top + window.scrollY - 80;
    window.scrollTo({ top: y, behavior: "smooth" });
  };

  if (loading) return <div className="empty">Loading…</div>;

  return (
    <div className="app">
      <TopNav nav={settings.nav} onWork={() => scrollTo("work")} onInquire={() => scrollTo("foot")} />
      <Hero hero={settings.hero} count={works.length} catCount={categories.length}
            onStart={() => scrollTo("work")} />
      {settings.theme.showTicker && <Ticker items={settings.ticker.items} />}

      <div id="work">
        <header className="section-head">
          <span className="section-num">{settings.catalogue.sectionNum}</span>
          <h2 className="section-title">
            {settings.catalogue.titleLead}<em>{settings.catalogue.titleEm}</em>{settings.catalogue.titleTail}
          </h2>
          <span className="section-aside">{settings.catalogue.aside}</span>
        </header>
        <CatalogueBody
          filterCats={filterCats} cat={cat} setCat={setCat}
          theme={settings.theme} total={items.length} counts={counts}
          items={items} showCorner={settings.theme.showCorner}
          onOpen={(w) => setOpen(w.id)}
        />
      </div>

      <About about={settings.about} />
      <Services services={services} />
      <div id="foot"><Foot footer={settings.footer} /></div>

      {openWork && (
        <Lightbox work={openWork} items={items} index={openIdx} lb={settings.lightbox}
                  onClose={() => setOpen(null)} onPrev={onPrev} onNext={onNext} />
      )}

      <WhatsAppButton contact={settings.contact} />

      <Link to="/admin" className="lb-counter"
            style={{ position: "fixed", right: 16, bottom: 14, left: "auto",
                     color: "var(--mute)", textDecoration: "none", zIndex: 40,
                     fontFamily: "var(--mono)", fontSize: 10, letterSpacing: "0.14em" }}>
        ADMIN
      </Link>
    </div>
  );
}

// Catalogue filter + gallery, with a visitor-side layout preview that
// initialises from the admin-set theme.
function CatalogueBody({ filterCats, cat, setCat, theme, total, counts, items, showCorner, onOpen }) {
  const [layout, setLayout] = useState(theme.layout);
  useEffect(() => { setLayout(theme.layout); }, [theme.layout]);
  return (
    <>
      <FilterBar categories={filterCats} cat={cat} setCat={setCat}
                 layout={layout} setLayout={setLayout} total={total} counts={counts} />
      <Gallery items={items} layout={layout} showCorner={showCorner} onOpen={onOpen} />
    </>
  );
}
