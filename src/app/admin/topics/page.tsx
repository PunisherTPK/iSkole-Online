import { redirect } from "next/navigation";

export default function TopicsAdminRedirect() {
  redirect("/admin/content-manager");
}
