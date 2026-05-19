// app/dashboard/layout.tsx
import { redirect } from "next/navigation";
import { requireAuth } from "@/lib/session";
import Sidebar from "@/components/layout/Sidebar";
import TopBar from "@/components/layout/TopBar";

export default async function DashboardLayout({ children }: { children: React.ReactNode }) {
  const session = await requireAuth();
  if (!session) redirect("/login");

  return (
    <div className="flex h-screen bg-surface-950 overflow-hidden">
      <Sidebar adminName={session.adminName ?? "Admin"} />
      <div className="flex-1 flex flex-col min-w-0">
        <TopBar adminName={session.adminName ?? "Admin"} />
        <main className="flex-1 overflow-y-auto p-6">
          {children}
        </main>
      </div>
    </div>
  );
}
