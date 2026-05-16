import { useEffect, useState, useCallback } from "react";
import { supabase } from "../lib/supabase.js";
import { mergeSettings } from "../lib/defaults.js";

// Loads the single site_settings row, deep-merged with defaults, and exposes
// a setter + persist. Saving writes the full merged blob back to data.
export function useSettings() {
  const [settings, setSettings] = useState(null);
  const [saving, setSaving] = useState(false);

  const load = useCallback(async () => {
    const { data } = await supabase.from("site_settings").select("data").eq("id", 1).maybeSingle();
    setSettings(mergeSettings(data?.data));
  }, []);

  useEffect(() => { load(); }, [load]);

  // path is dot notation, e.g. "hero.titleEm" or "footer.cols"
  const setPath = useCallback((path, value) => {
    setSettings((prev) => {
      const next = structuredClone(prev);
      const keys = path.split(".");
      let cur = next;
      for (let i = 0; i < keys.length - 1; i++) cur = cur[keys[i]];
      cur[keys[keys.length - 1]] = value;
      return next;
    });
  }, []);

  const save = useCallback(async () => {
    setSaving(true);
    const { error } = await supabase.from("site_settings")
      .upsert({ id: 1, data: settings }, { onConflict: "id" });
    setSaving(false);
    return error;
  }, [settings]);

  return { settings, setPath, setSettings, save, saving };
}
