export type AdminRole = "admin" | "teacher";

export function getAdminRole(): AdminRole {
  return process.env.ADMIN_ROLE === "teacher" ? "teacher" : "admin";
}

export function getAdminTeacherEmail() {
  return process.env.ADMIN_TEACHER_EMAIL ?? "";
}
