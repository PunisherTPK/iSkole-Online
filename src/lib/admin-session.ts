export type AdminRole = "super_admin" | "teacher";

export function getAdminRole(): AdminRole {
  return process.env.ADMIN_ROLE === "teacher" ? "teacher" : "super_admin";
}

export function getAdminTeacherEmail() {
  return process.env.ADMIN_TEACHER_EMAIL ?? "";
}
