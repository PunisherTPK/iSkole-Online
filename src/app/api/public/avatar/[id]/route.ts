import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const { id } = await params;
    if (!id) return new NextResponse("Not found", { status: 404 });

    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!,
      { auth: { autoRefreshToken: false, persistSession: false } },
    );

    const { data: profile, error: profileError } = await supabase
      .from("profiles")
      .select("avatar_url, role, is_active")
      .eq("id", id)
      .eq("role", "teacher")
      .eq("is_active", true)
      .maybeSingle();

    if (profileError || !profile?.avatar_url) {
      return new NextResponse("Not found", { status: 404 });
    }

    const avatarUrl = profile.avatar_url.split("?")[0];
    const marker = "/storage/v1/object/";
    const markerIndex = avatarUrl.indexOf(marker);
    if (markerIndex === -1) return new NextResponse("Not found", { status: 404 });

    const storagePart = avatarUrl.slice(markerIndex + marker.length);
    const publicMarker = "public/profile-images/";
    const signedMarker = "sign/profile-images/";
    let path = "";

    if (storagePart.startsWith(publicMarker)) {
      path = storagePart.slice(publicMarker.length);
    } else if (storagePart.startsWith(signedMarker)) {
      path = storagePart.slice(signedMarker.length).split("?")[0];
    } else {
      const bucketMarker = "profile-images/";
      const bucketIndex = storagePart.indexOf(bucketMarker);
      if (bucketIndex === -1) return new NextResponse("Not found", { status: 404 });
      path = storagePart.slice(bucketIndex + bucketMarker.length);
    }

    if (!path) return new NextResponse("Not found", { status: 404 });

    const { data: file, error: downloadError } = await supabase.storage
      .from("profile-images")
      .download(path);

    if (downloadError || !file) {
      return new NextResponse("Not found", { status: 404 });
    }

    return new NextResponse(file, {
      status: 200,
      headers: {
        "Content-Type": file.type || "image/jpeg",
        "Cache-Control": "public, max-age=3600, s-maxage=3600",
      },
    });
  } catch {
    return new NextResponse("Unable to load image", { status: 500 });
  }
}
