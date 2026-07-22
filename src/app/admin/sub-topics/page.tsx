import { redirect } from "next/navigation";

export default function SubTopicsAdminRedirect() {
  redirect("/admin/content-manager");
}
