import { createClient } from "@supabase/supabase-js";

// Hardcoded Supabase project credentials. The anon key is safe to expose in
// client code (it's public by design) — actual data access is gated by Row
// Level Security in Supabase. Env vars still override these if provided.
const SUPABASE_URL = "https://mbcnfbqeuglejcxpvypu.supabase.co";
const SUPABASE_ANON_KEY =
  "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im1iY25mYnFldWdsZWpjeHB2eXB1Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3Nzg4OTU0MDIsImV4cCI6MjA5NDQ3MTQwMn0.YQx0-6_dIne7yQJA4-EYlv_58MPc8QtCL8C8Ni702NY";

const url = import.meta.env.VITE_SUPABASE_URL || SUPABASE_URL;
const anonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || SUPABASE_ANON_KEY;

export const supabase = createClient(url, anonKey);

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
