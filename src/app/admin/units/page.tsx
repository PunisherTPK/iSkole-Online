import { redirect } from "next/navigation";

export default function UnitsAdminRedirect() {
  redirect("/admin/content-manager");
}
