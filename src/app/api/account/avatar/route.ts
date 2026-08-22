import { NextResponse } from "next/server";
import { createServerClient } from "@supabase/ssr";
import { createClient as createAdminClient } from "@supabase/supabase-js";
import { cookies } from "next/headers";

export const runtime = "nodejs";

export async function POST(request: Request) {
  try {
    const form = await request.formData();
    const file = form.get("file");
    if (!(file instanceof File)) return NextResponse.json({ error: "No image file supplied." }, { status: 400 });
    if (!file.type.startsWith("image/")) return NextResponse.json({ error: "Please choose an image file." }, { status: 400 });
    if (file.size > 5 * 1024 * 1024) return NextResponse.json({ error: "Profile pictures must be 5 MB or smaller." }, { status: 400 });

    const cookieStore = await cookies();
    const supabase = createServerClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!, {
      cookies: { getAll() { return cookieStore.getAll(); }, setAll(cookiesToSet) { try { cookiesToSet.forEach(({ name, value, options }) => cookieStore.set(name, value, options)); } catch {} } },
    });
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return NextResponse.json({ error: "Authentication required." }, { status: 401 });

    const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
    if (!serviceKey) return NextResponse.json({ error: "Server storage configuration is missing. Add SUPABASE_SERVICE_ROLE_KEY to Vercel." }, { status: 500 });
    if (!supabaseUrl) return NextResponse.json({ error: "Server Supabase URL is missing." }, { status: 500 });

    const admin = createAdminClient(supabaseUrl, serviceKey, { auth: { autoRefreshToken: false, persistSession: false } });
    const extension = file.type === "image/png" ? "png" : file.type === "image/webp" ? "webp" : file.type === "image/gif" ? "gif" : "jpg";
    const path = `${user.id}/avatar-${crypto.randomUUID()}.${extension}`;
    const buffer = Buffer.from(await file.arrayBuffer());

    const { error: uploadError } = await admin.storage.from("profile-images").upload(path, buffer, { contentType: file.type, cacheControl: "31536000", upsert: false });
    if (uploadError) return NextResponse.json({ error: `Image upload failed: ${uploadError.message}` }, { status: 500 });

    const { data: updatedProfile, error: profileError } = await admin.from("profiles").update({ avatar_url: path }).eq("id", user.id).select("id,avatar_url").maybeSingle();
    if (profileError) {
      await admin.storage.from("profile-images").remove([path]);
      return NextResponse.json({ error: `Profile update failed: ${profileError.message}` }, { status: 500 });
    }
    if (!updatedProfile) {
      await admin.storage.from("profile-images").remove([path]);
      return NextResponse.json({ error: "The image uploaded, but no matching profile row was found for your account." }, { status: 500 });
    }

    return NextResponse.json({ path, avatarUrl: `/api/public/avatar/${user.id}`, profileAvatarPath: updatedProfile.avatar_url });
  } catch (error) {
    return NextResponse.json({ error: error instanceof Error ? error.message : "Unable to upload profile picture." }, { status: 500 });
  }
}

export async function GET() {
  return NextResponse.json({ ok: true, route: "avatar-upload" });
}
