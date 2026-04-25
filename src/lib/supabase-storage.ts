import { createClient } from "@supabase/supabase-js";
import crypto from "crypto";

const imageTypes: Record<string, string> = {
  "image/jpeg": "jpg",
  "image/png": "png",
  "image/webp": "webp",
  "image/gif": "gif",
};

const maxImageSize = 5 * 1024 * 1024;

let _supabase: ReturnType<typeof createClient> | null = null;

function getSupabase() {
  if (_supabase) return _supabase;

  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY;

  if (!url || !key) {
    throw new Error(
      "Missing NEXT_PUBLIC_SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY environment variable."
    );
  }

  _supabase = createClient(url, key);
  return _supabase;
}

export async function uploadImageToSupabase(
  file: File | null,
  folder: "pets" | "team"
): Promise<string | null> {
  if (!file || file.size === 0) return null;

  if (!imageTypes[file.type]) {
    throw new Error("Upload a JPG, PNG, GIF, or WebP image.");
  }
  if (file.size > maxImageSize) {
    throw new Error("Images must be 5MB or smaller.");
  }

  const extension = imageTypes[file.type];
  const bucket = folder === "pets" ? "pet-images" : "team-images";
  const filename = `${Date.now()}-${crypto.randomBytes(8).toString("hex")}.${extension}`;

  const buffer = Buffer.from(await file.arrayBuffer());
  const supabase = getSupabase();

  const { error } = await supabase.storage
    .from(bucket)
    .upload(filename, buffer, {
      contentType: file.type,
      cacheControl: "3600",
      upsert: false,
    });

  if (error) {
    console.error("Supabase storage upload error:", error);
    throw new Error("Failed to upload image.");
  }

  const { data } = supabase.storage.from(bucket).getPublicUrl(filename);
  return data.publicUrl;
}
