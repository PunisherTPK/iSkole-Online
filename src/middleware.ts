import { createServerClient } from "@supabase/ssr";
import { NextResponse, type NextRequest } from "next/server";

const protectedRoutes = [
  "/admin",
  "/teacher",
  "/student",
];

const authRoutes = [
  "/login",
  "/register",
  "/forgot-password",
  "/reset-password",
];

export async function middleware(request: NextRequest) {
  let response = NextResponse.next({
    request: {
      headers: request.headers,
    },
  });

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll();
        },

        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value }) => {
            request.cookies.set(name, value);
          });

          response = NextResponse.next({
            request: {
              headers: request.headers,
            },
          });

          cookiesToSet.forEach(({ name, value, options }) => {
            response.cookies.set(name, value, options);
          });
        },
      },
    },
  );

  const {
    data: { user },
  } = await supabase.auth.getUser();

  const pathname = request.nextUrl.pathname;

  const isProtectedRoute = protectedRoutes.some(
    (route) =>
      pathname === route || pathname.startsWith(`${route}/`),
  );

  const isAuthRoute = authRoutes.some(
    (route) =>
      pathname === route || pathname.startsWith(`${route}/`),
  );

  /*
   * Logged out users cannot access application routes.
   */
  if (isProtectedRoute && !user) {
    const loginUrl = new URL("/login", request.url);

    loginUrl.searchParams.set("redirect", pathname);

    return NextResponse.redirect(loginUrl);
  }

  /*
   * Logged-in users should not see login/register pages.
   */
  if (isAuthRoute && user) {
    const { data: profile } = await supabase
      .from("profiles")
      .select("role")
      .eq("id", user.id)
      .single();

    if (profile?.role === "admin") {
      return NextResponse.redirect(new URL("/admin", request.url));
    }

    if (profile?.role === "teacher") {
      return NextResponse.redirect(new URL("/teacher", request.url));
    }

    return NextResponse.redirect(new URL("/student", request.url));
  }

  /*
   * Logged-in users can only access their own application area.
   */
  if (isProtectedRoute && user) {
    const { data: profile } = await supabase
      .from("profiles")
      .select("role")
      .eq("id", user.id)
      .single();

    const role = profile?.role;

    if (pathname.startsWith("/admin") && role !== "admin") {
      return redirectToRole(role, request);
    }

    if (pathname.startsWith("/teacher") && role !== "teacher") {
      return redirectToRole(role, request);
    }

    if (pathname.startsWith("/student") && role !== "student") {
      return redirectToRole(role, request);
    }
  }

  return response;
}

function redirectToRole(
  role: string | null | undefined,
  request: NextRequest,
) {
  if (role === "admin") {
    return NextResponse.redirect(new URL("/admin", request.url));
  }

  if (role === "teacher") {
    return NextResponse.redirect(new URL("/teacher", request.url));
  }

  if (role === "student") {
    return NextResponse.redirect(new URL("/student", request.url));
  }

  return NextResponse.redirect(new URL("/", request.url));
}

export const config = {
  matcher: [
    "/admin/:path*",
    "/teacher/:path*",
    "/student/:path*",
    "/login",
    "/register",
    "/forgot-password",
    "/reset-password",
  ],
};