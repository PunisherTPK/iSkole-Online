import { createClient } from "@/lib/supabase/client";

export type UserRole = "admin" | "teacher" | "student";

export async function signIn(
  email: string,
  password: string,
): Promise<{ role: UserRole }> {
  const supabase = createClient();

  const { data: authData, error: authError } =
    await supabase.auth.signInWithPassword({
      email,
      password,
    });

  if (authError) {
    throw new Error(authError.message);
  }

  if (!authData.user) {
    throw new Error("Unable to sign in.");
  }

  const { data: profile, error: profileError } = await supabase
    .from("profiles")
    .select("role")
    .eq("id", authData.user.id)
    .single();

  if (profileError) {
    await supabase.auth.signOut();
    throw new Error("Unable to load your account profile.");
  }

  const role = profile.role as UserRole;

  if (!["admin", "teacher", "student"].includes(role)) {
    await supabase.auth.signOut();
    throw new Error("Your account has an invalid role.");
  }

  return { role };
}

export async function signOut() {
  const supabase = createClient();

  const { error } = await supabase.auth.signOut();

  if (error) {
    throw new Error(error.message);
  }
}