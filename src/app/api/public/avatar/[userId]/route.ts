import { NextResponse } from "next/server";
import { createClient as createAdminClient } from "@supabase/supabase-js";
import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";

export const runtime = "nodejs";

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ userId: string }> },
) {
  try {
    const { userId } = await params;
    const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
    if (!serviceKey) return new NextResponse("Server storage configuration is missing.", { status: 500 });

    const admin = createAdminClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      serviceKey,
      { auth: { autoRefreshToken: false, persistSession: false } },
    );

    const { data: profile, error } = await admin
      .from("profiles")
      .select("id, role, is_active, avatar_url")
      .eq("id", userId)
      .maybeSingle();

    if (error || !profile?.avatar_url) return new NextResponse(null, { status: 404 });

    const cookieStore = await cookies();
    const viewer = createServerClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
      {
        cookies: {
          getAll: () => cookieStore.getAll(),
          setAll: () => {},
        },
      },
    );
    const { data: { user } } = await viewer.auth.getUser();

    const isPublicTeacher = profile.role === "teacher" && profile.is_active !== false;
    const isOwner = user?.id === userId;
    let isAdmin = false;

    if (user) {
      const { data: viewerProfile } = await admin
        .from("profiles")
        .select("role, is_active")
        .eq("id", user.id)
        .maybeSingle();
      isAdmin = viewerProfile?.role === "admin" && viewerProfile.is_active !== false;
    }

    if (!isPublicTeacher && !isOwner && !isAdmin) {
      return new NextResponse(null, { status: 403 });
    }

    let path = profile.avatar_url as string;

    if (path.startsWith("http://") || path.startsWith("https://")) {
      const marker = "/storage/v1/object/";
      const markerIndex = path.indexOf(marker);
      if (markerIndex >= 0) {
        const storagePath = path.slice(markerIndex + marker.length);
        const parts = storagePath.split("/");
        if (parts[0] === "public" && parts.length > 2) {
          const bucket = parts[1];
          path = parts.slice(2).join("/");
          const { data, error: downloadError } = await admin.storage.from(bucket).download(path);
          if (downloadError || !data) return new NextResponse(null, { status: 404 });
          return new NextResponse(data, {
            status: 200,
            headers: {
              "Content-Type": data.type || "image/jpeg",
              "Cache-Control": "public, max-age=3600, stale-while-revalidate=86400",
            },
          });
        }
      }
    }

    const { data, error: downloadError } = await admin.storage.from("profile-images").download(path);
    if (downloadError || !data) return new NextResponse(null, { status: 404 });

    return new NextResponse(data, {
      status: 200,
      headers: {
        "Content-Type": data.type || "image/jpeg",
        "Cache-Control": "public, max-age=3600, stale-while-revalidate=86400",
      },
    });
  } catch {
    return new NextResponse(null, { status: 500 });
  }
}
