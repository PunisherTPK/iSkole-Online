import AppShell from "@/components/app/AppShell";

export default function StudentLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return <AppShell role="student">{children}</AppShell>;
}