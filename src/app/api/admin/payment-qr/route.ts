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
    if (!file.type.startsWith("image/")) return NextResponse.json({ error: "Please select an image file." }, { status: 400 });
    if (file.size > 5 * 1024 * 1024) return NextResponse.json({ error: "QR image must be 5 MB or smaller." }, { status: 400 });

    const cookieStore = await cookies();
    const supabase = createServerClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!, {
      cookies: { getAll() { return cookieStore.getAll(); }, setAll(cookiesToSet) { try { cookiesToSet.forEach(({ name, value, options }) => cookieStore.set(name, value, options)); } catch {} } },
    });
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return NextResponse.json({ error: "Authentication required." }, { status: 401 });

    const { data: profile, error: profileError } = await supabase.from("profiles").select("role,is_active").eq("id", user.id).maybeSingle();
    if (profileError || profile?.role !== "admin" || profile?.is_active === false) return NextResponse.json({ error: "Administrator access required." }, { status: 403 });

    const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
    if (!serviceKey) return NextResponse.json({ error: "Server storage configuration is missing." }, { status: 500 });
    const admin = createAdminClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, serviceKey, { auth: { autoRefreshToken: false, persistSession: false } });
    const ext = file.name.split(".").pop()?.toLowerCase() || "png";
    const path = `${crypto.randomUUID()}.${ext}`;
    const buffer = Buffer.from(await file.arrayBuffer());
    const { error: uploadError } = await admin.storage.from("payment-qr").upload(path, buffer, { upsert: true, contentType: file.type });
    if (uploadError) return NextResponse.json({ error: uploadError.message }, { status: 500 });
    const { data } = admin.storage.from("payment-qr").getPublicUrl(path);
    return NextResponse.json({ url: data.publicUrl });
  } catch (error) {
    return NextResponse.json({ error: error instanceof Error ? error.message : "Upload failed." }, { status: 500 });
  }
}
