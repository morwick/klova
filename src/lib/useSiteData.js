import { useEffect, useState, useCallback } from "react";
import { supabase } from "./supabase.js";
import {
  DEFAULT_CATEGORIES, DEFAULT_WORKS, DEFAULT_SERVICES,
  mergeSettings, TYPE_PRESETS, TONE_PRESETS, FONT_FAMILIES,
} from "./defaults.js";

// Pulls all public content. On any error or empty table, falls back to the
// design defaults so the site is never blank (e.g. before Supabase is wired).
export function useSiteData() {
  const [state, setState] = useState({
    loading: true,
    usingFallback: false,
    categories: DEFAULT_CATEGORIES,
    works: [],
    services: DEFAULT_SERVICES,
    settings: mergeSettings(null),
  });

  const load = useCallback(async () => {
    try {
      const [cats, works, svcs, settings] = await Promise.all([
        supabase.from("categories").select("*").order("sort_order"),
        supabase.from("works").select("*, categories(slug,label)").eq("published", true).order("sort_order"),
        supabase.from("services").select("*").order("sort_order"),
        supabase.from("site_settings").select("data").eq("id", 1).maybeSingle(),
      ]);

      if (cats.error || works.error || svcs.error) throw cats.error || works.error || svcs.error;

      const categories = cats.data?.length ? cats.data : DEFAULT_CATEGORIES;
      const services = svcs.data?.length ? svcs.data : DEFAULT_SERVICES;
      const mergedSettings = mergeSettings(settings.data?.data);

      let normalizedWorks;
      if (works.data?.length) {
        normalizedWorks = works.data.map((w) => ({
          ...w,
          cat: w.categories?.slug || w.category_slug,
          catLabel: w.categories?.label,
        }));
      } else {
        // Seed the catalogue with the design works so it reads as a photo site.
        normalizedWorks = DEFAULT_WORKS.map((w, i) => ({
          id: `seed-${i}`,
          ...w,
          cat: w.category_slug,
          catLabel: categories.find((c) => c.slug === w.category_slug)?.label,
          image_path: "",
        }));
      }

      setState({
        loading: false,
        usingFallback: !works.data?.length,
        categories,
        works: normalizedWorks,
        services,
        settings: mergedSettings,
      });
    } catch (e) {
      console.warn("[klova] Falling back to design defaults:", e?.message || e);
      setState({
        loading: false,
        usingFallback: true,
        categories: DEFAULT_CATEGORIES,
        works: DEFAULT_WORKS.map((w, i) => ({
          id: `seed-${i}`, ...w, cat: w.category_slug,
          catLabel: DEFAULT_CATEGORIES.find((c) => c.slug === w.category_slug)?.label,
          image_path: "",
        })),
        services: DEFAULT_SERVICES,
        settings: mergeSettings(null),
      });
    }
  }, []);

  useEffect(() => { load(); }, [load]);
  return { ...state, reload: load };
}

// Applies theme tweaks to CSS vars + swaps the Google Fonts link.
// Mirrors the original design's two effects exactly.
export function useThemeVars(theme) {
  useEffect(() => {
    const tp = TYPE_PRESETS[theme.type] || TYPE_PRESETS.editorial;
    const tn = TONE_PRESETS[theme.tone] || TONE_PRESETS.pure;
    const r = document.documentElement.style;
    r.setProperty("--serif", tp.serif);
    r.setProperty("--sans", tp.sans);
    r.setProperty("--ink", tn.ink);
    r.setProperty("--paper", tn.paper);
    r.setProperty("--img-filter", tn.filter);
    r.setProperty("--gap", `${theme.gap}px`);
  }, [theme.type, theme.tone, theme.gap]);

  useEffect(() => {
    const link = document.getElementById("dyn-fonts");
    if (!link) return;
    const fam = FONT_FAMILIES[theme.type] || FONT_FAMILIES.editorial;
    link.href = `https://fonts.googleapis.com/css2?family=${fam}&family=JetBrains+Mono:wght@400;500&display=swap`;
  }, [theme.type]);
}
