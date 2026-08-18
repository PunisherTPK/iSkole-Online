import AppShell from "@/components/app/AppShell";

export default function AdminLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return <AppShell role="admin">{children}</AppShell>;
}