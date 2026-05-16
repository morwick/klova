import { createClient } from "@supabase/supabase-js";

const url = import.meta.env.VITE_SUPABASE_URL;
const anonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

if (!url || !anonKey) {
  // Surfaced loudly so a missing .env is obvious during setup.
  console.error(
    "[klova] Missing Supabase env vars. Copy .env.example to .env and fill VITE_SUPABASE_URL / VITE_SUPABASE_ANON_KEY."
  );
}

export const supabase = createClient(url || "http://localhost", anonKey || "public-anon-key");

// Public bucket that holds uploaded work / hero / about photos.
export const STORAGE_BUCKET = "works";

// Resolve a stored image: a Storage path becomes a public URL; otherwise we
// fall back to a deterministic picsum image keyed by `seed` (matches the
// original design so the catalogue still reads as a photo site before upload).
export function imageUrl({ image_path, seed }, w = 1200, h = 1500) {
  if (image_path) {
    const { data } = supabase.storage.from(STORAGE_BUCKET).getPublicUrl(image_path);
    if (data?.publicUrl) return data.publicUrl;
  }
  const s = seed || "klova";
  return `https://picsum.photos/seed/${encodeURIComponent(s)}/${w}/${h}`;
}
