/* Canonical content shape + design defaults.
   These mirror the original Claude Design data exactly, so the site renders
   identically before any Supabase rows exist (graceful fallback / first run). */

export const DEFAULT_CATEGORIES = [
  { slug: "wedding",    label: "Wedding",    sort_order: 1 },
  { slug: "prewedding", label: "Prewedding", sort_order: 2 },
  { slug: "engagement", label: "Engagement", sort_order: 3 },
  { slug: "event",      label: "Event",      sort_order: 4 },
  { slug: "portrait",   label: "Portrait",   sort_order: 5 },
  { slug: "landscape",  label: "Landscape",  sort_order: 6 },
  { slug: "product",    label: "Product",    sort_order: 7 },
];

export const DEFAULT_WORKS = [
  { category_slug: "wedding",    title: "Vow of Linen",     location: "Ubud, Bali",  year: "2025", seed: "klova-w-01",   width: 1200, height: 1500 },
  { category_slug: "wedding",    title: "Aisle at Dawn",    location: "Yogyakarta",  year: "2025", seed: "klova-w-02",   width: 1600, height: 1100 },
  { category_slug: "wedding",    title: "First Light",      location: "Bandung",     year: "2024", seed: "klova-w-03",   width: 1200, height: 1600 },
  { category_slug: "wedding",    title: "Rituals",          location: "Solo",        year: "2024", seed: "klova-w-04",   width: 1500, height: 1500 },
  { category_slug: "prewedding", title: "Salt & Quiet",     location: "Nusa Penida", year: "2025", seed: "klova-p-01",   width: 1400, height: 1750 },
  { category_slug: "prewedding", title: "Linen Hours",      location: "Bromo",       year: "2025", seed: "klova-p-02",   width: 1600, height: 1067 },
  { category_slug: "prewedding", title: "Soft Field",       location: "Lembang",     year: "2024", seed: "klova-p-03",   width: 1300, height: 1600 },
  { category_slug: "engagement", title: "Hands, Held",      location: "Jakarta",     year: "2025", seed: "klova-eng-01", width: 1200, height: 1500 },
  { category_slug: "engagement", title: "Bookshop Letters", location: "Bandung",     year: "2024", seed: "klova-eng-02", width: 1600, height: 1067 },
  { category_slug: "engagement", title: "Window Light",     location: "Yogyakarta",  year: "2024", seed: "klova-eng-03", width: 1400, height: 1750 },
  { category_slug: "event",      title: "Symposium 09",     location: "Senayan",     year: "2025", seed: "klova-ev-01",  width: 1600, height: 1067 },
  { category_slug: "event",      title: "Stage in Black",   location: "Surabaya",    year: "2024", seed: "klova-ev-02",  width: 1400, height: 1750 },
  { category_slug: "event",      title: "Quiet Room",       location: "Bali",        year: "2024", seed: "klova-ev-03",  width: 1500, height: 1000 },
  { category_slug: "portrait",   title: "Naia, study i",    location: "Studio",      year: "2025", seed: "klova-po-01",  width: 1200, height: 1500 },
  { category_slug: "portrait",   title: "Looking East",     location: "Jakarta",     year: "2025", seed: "klova-po-02",  width: 1200, height: 1600 },
  { category_slug: "portrait",   title: "Suit, no. III",    location: "Studio",      year: "2024", seed: "klova-po-03",  width: 1300, height: 1700 },
  { category_slug: "portrait",   title: "Half Smile",       location: "Bandung",     year: "2024", seed: "klova-po-04",  width: 1400, height: 1750 },
  { category_slug: "landscape",  title: "Volcano, predawn", location: "Mt. Bromo",   year: "2025", seed: "klova-l-01",   width: 1800, height: 1000 },
  { category_slug: "landscape",  title: "Ridge Lines",      location: "Dieng",       year: "2024", seed: "klova-l-02",   width: 1800, height: 1100 },
  { category_slug: "landscape",  title: "Sea, in Movement", location: "Sumba",       year: "2024", seed: "klova-l-03",   width: 1800, height: 1200 },
  { category_slug: "product",    title: "Ceramic, matte",   location: "Studio",      year: "2025", seed: "klova-pr-01",  width: 1400, height: 1400 },
  { category_slug: "product",    title: "Steel & Linen",    location: "Studio",      year: "2025", seed: "klova-pr-02",  width: 1200, height: 1500 },
  { category_slug: "product",    title: "Bottle, no. 7",    location: "Studio",      year: "2024", seed: "klova-pr-03",  width: 1300, height: 1600 },
];

export const DEFAULT_SERVICES = [
  { num: "01", title: "Wedding & Prewedding", body: "Full-day documentary coverage. Editorial film looks, two photographers, archival delivery within four weeks.", sort_order: 1 },
  { num: "02", title: "Portrait & Editorial", body: "Studio and on-location portraits for individuals, founders, and publications. Considered lighting, restrained retouch.", sort_order: 2 },
  { num: "03", title: "Brand & Product", body: "Catalog, lookbook and campaign imagery. Set design, prop sourcing, and one-day to multi-day shoots.", sort_order: 3 },
];

// Single-row site_settings.data shape.
export const DEFAULT_SETTINGS = {
  nav: {
    brand: "klova",
    meta: "EST. 2019",
    metaLoc: "JKT — BALI",
    links: [
      { label: "Work", section: "work" },
      { label: "Story", section: "story" },
      { label: "Journal", section: "journal" },
    ],
    inquireLabel: "Inquire",
  },
  hero: {
    eyebrow: "Catalogue / Vol. 07",
    titleLead: "Light,",
    titleRest: "held ",
    titleEm: "still",
    titleTail: ".",
    sub: "klova is a small photography studio working in the in-between — quiet weddings, considered portraits, and the rooms where things actually happen. We make pictures that age well.",
    ctaLabel: "Browse the Catalogue",
    metaWorksLabel: "Works",
    metaCategoriesLabel: "Categories",
    metaSinceLabel: "Since",
    metaSinceValue: "MMXIX",
    image_path: "",
    seed: "klova-hero",
    featuredCaption: "Featured / no. 124 — Naia, predawn",
    featuredTag: "35mm / film",
  },
  catalogue: {
    sectionNum: "— 01 / Catalogue",
    titleLead: "Selected ",
    titleEm: "works",
    titleTail: ".",
    aside: "Vol. 07 / 2025 — 2026",
  },
  ticker: {
    items: [
      "Available — Q3 2026", "Editorial",
      "Bali — Jakarta — Singapore", "Film & Digital",
      "Booking now", "Archive Vol. 07",
    ],
  },
  about: {
    sectionNum: "— 02 / Story",
    titleLead: "A studio for ",
    titleEm: "quiet",
    titleTail: " pictures.",
    aside: "Bali — Jakarta — Singapore",
    body: "klova was founded in 2019 by Naia Pradipta and Reza Ardian — a two-photographer studio working primarily in <em>black and white</em>. We work slowly, on film and digital, and we believe in pictures that survive the algorithm: prints, books, archives.",
    stats: [
      { k: "Weddings shot", v: "218" },
      { k: "Editorial credits", v: "47" },
      { k: "Rolls of film, 2025", v: "1,204" },
      { k: "Avg. delivery", v: "4 wks" },
    ],
    image_path: "",
    seed: "klova-about",
  },
  footer: {
    brand: "klova",
    tag: "Photography studio — Est. 2019",
    cols: [
      { h4: "Studio", items: [
        { type: "text", label: "Jl. Hanoman 22" },
        { type: "text", label: "Ubud, Bali 80571" },
        { type: "text", label: "+62 813 9000 0124" },
      ]},
      { h4: "Inquire", items: [
        { type: "link", label: "hello@klova.studio", href: "mailto:hello@klova.studio" },
        { type: "link", label: "bookings@klova.studio", href: "mailto:bookings@klova.studio" },
        { type: "link", label: "press@klova.studio", href: "mailto:press@klova.studio" },
      ]},
      { h4: "Elsewhere", items: [
        { type: "link", label: "Instagram", href: "#" },
        { type: "link", label: "Are.na", href: "#" },
        { type: "link", label: "Journal", href: "#" },
      ]},
    ],
    bottom: ["© MMXXVI klova studio", "Vol. 07 / 124 works", "Made in Bali"],
  },
  lightbox: {
    body: "Frame from the {cat} archive. Shot on a mix of 35mm film and digital medium-format, lightly toned and printed for our standard archival series.",
    format: "35mm",
    edition: "/ 12",
  },
  contact: {
    // WhatsApp number in international format, digits only (no +, spaces or -).
    whatsappNumber: "6285375219633",
    whatsappMessage: "Hi klova, I'd like to inquire about a photography session.",
    whatsappEnabled: true,
  },
  theme: {
    layout: "editorial", // editorial | uniform | dense
    gap: 12,
    tone: "pure",        // pure | warm | cool | ivory
    type: "editorial",   // editorial | modern | magazine
    showTicker: true,
    showCorner: true,
  },
};

export const TYPE_PRESETS = {
  editorial: { serif: '"Cormorant Garamond", "EB Garamond", serif', sans: '"Helvetica Neue", Helvetica, Arial, sans-serif' },
  modern:    { serif: '"DM Serif Display", "Times New Roman", serif', sans: '"DM Sans", system-ui, sans-serif' },
  magazine:  { serif: '"Playfair Display", "Times New Roman", serif', sans: '"Manrope", system-ui, sans-serif' },
};

export const TONE_PRESETS = {
  pure:  { ink: "#0a0a0a", paper: "#f6f5f1", filter: "grayscale(100%) contrast(1.02)" },
  warm:  { ink: "#1a1410", paper: "#f3eee5", filter: "grayscale(95%) sepia(0.12) contrast(1.04)" },
  cool:  { ink: "#0b0e12", paper: "#eef0f1", filter: "grayscale(98%) contrast(1.06) brightness(0.98)" },
  ivory: { ink: "#141414", paper: "#ede9df", filter: "grayscale(100%) contrast(1.05)" },
  color: { ink: "#0a0a0a", paper: "#f6f5f1", filter: "none" },
};

export const FONT_FAMILIES = {
  editorial: "Cormorant+Garamond:ital,wght@0,300;0,400;0,500;1,300;1,400",
  modern:    "DM+Serif+Display:ital@0;1|DM+Sans:wght@400;500;600",
  magazine:  "Playfair+Display:ital,wght@0,400;0,500;1,400|Manrope:wght@400;500;600",
};

// Deep-merge persisted settings over defaults so missing/added keys never break.
export function mergeSettings(saved) {
  return deepMerge(structuredClone(DEFAULT_SETTINGS), saved || {});
}
function deepMerge(base, over) {
  if (Array.isArray(over)) return over;
  if (over && typeof over === "object") {
    const out = { ...base };
    for (const k of Object.keys(over)) {
      out[k] = (base && typeof base[k] === "object" && !Array.isArray(base[k]))
        ? deepMerge(base[k] || {}, over[k])
        : over[k];
    }
    return out;
  }
  return over === undefined ? base : over;
}
