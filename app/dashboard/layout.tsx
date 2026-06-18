// app/dashboard/layout.tsx
import { redirect } from "next/navigation";
import { requireAuth } from "@/lib/session";
import DashboardShell from "@/components/layout/DashboardShell";

export default async function DashboardLayout({ children }: { children: React.ReactNode }) {
  const session = await requireAuth();
  if (!session) redirect("/login");

  return (
    <DashboardShell adminName={session.adminName ?? "Admin"}>{children}</DashboardShell>
  );
}
