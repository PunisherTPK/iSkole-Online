import { NextResponse } from "next/server";
import sharp from "sharp";
import { createClient } from "@/lib/supabase/server";

export const runtime = "nodejs";

const MAX_UPLOAD_BYTES = 15 * 1024 * 1024;

export async function POST(request: Request) {
  try {
    const form = await request.formData();
    const file = form.get("file");
    const bucket = form.get("bucket");
    if (!(file instanceof File) || !file.type.startsWith("image/")) {
      return NextResponse.json({ error: "Choose an image file to upload." }, { status: 400 });
    }
    if (file.size > MAX_UPLOAD_BYTES) {
      return NextResponse.json({ error: "Images must be 15 MB or smaller." }, { status: 413 });
    }
    if (bucket !== "question-images" && bucket !== "answer-images") {
      return NextResponse.json({ error: "Unsupported image destination." }, { status: 400 });
    }

    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return NextResponse.json({ error: "Sign in to upload images." }, { status: 401 });
    const { data: profile, error: profileError } = await supabase
      .from("profiles").select("role,is_active").eq("id", user.id).maybeSingle();
    if (profileError) return NextResponse.json({ error: profileError.message }, { status: 500 });
    if (!profile?.is_active || (profile.role !== "teacher" && profile.role !== "admin")) {
      return NextResponse.json({ error: "Teacher access is required to upload images." }, { status: 403 });
    }

    const source = Buffer.from(await file.arrayBuffer());
    const compressed = await sharp(source, { limitInputPixels: 40_000_000 })
      .rotate()
      .resize({ width: 2200, height: 2200, fit: "inside", withoutEnlargement: true })
      .webp({ quality: 82, effort: 4 })
      .toBuffer();
    const path = `${user.id}/${crypto.randomUUID()}.webp`;
    const { error: uploadError } = await supabase.storage.from(bucket).upload(path, compressed, {
      contentType: "image/webp", cacheControl: "31536000", upsert: false,
    });
    if (uploadError) return NextResponse.json({ error: uploadError.message }, { status: 500 });

    return NextResponse.json({
      path,
      url: supabase.storage.from(bucket).getPublicUrl(path).data.publicUrl,
      originalBytes: source.byteLength,
      compressedBytes: compressed.byteLength,
    });
  } catch (error) {
    return NextResponse.json({ error: error instanceof Error ? error.message : "Unable to process this image." }, { status: 500 });
  }
}
