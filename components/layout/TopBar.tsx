// components/layout/TopBar.tsx
"use client";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { HugeiconsIcon } from "@hugeicons/react";
import { Menu01Icon, Logout01Icon } from "@hugeicons/core-free-icons";

export default function TopBar({
  adminName,
  onOpenNav,
}: {
  adminName: string;
  onOpenNav?: () => void;
}) {
  const router = useRouter();

  async function handleLogout() {
    await fetch("/api/auth/logout", { method: "POST" });
    toast.success("Logged out");
    router.push("/login");
    router.refresh();
  }

  return (
    <header className="h-14 bg-surface-900/80 backdrop-blur border-b border-white/5 flex items-center justify-between px-4 sm:px-6 shrink-0">
      <div className="flex items-center gap-3">
        {onOpenNav && (
          <button
            type="button"
            onClick={onOpenNav}
            className="lg:hidden inline-flex items-center justify-center w-9 h-9 rounded-xl border border-white/8 bg-white/5 hover:bg-white/8 text-surface-200/60 hover:text-white transition-colors"
            aria-label="Open navigation"
          >
            <HugeiconsIcon icon={Menu01Icon} size={16} strokeWidth={1.5} />
          </button>
        )}
        <div className="text-sm text-surface-200/40 font-mono">
          {new Date().toLocaleDateString("en-NG", {
            weekday: "long",
            year: "numeric",
            month: "long",
            day: "numeric",
          })}
        </div>
      </div>
      <div className="flex items-center gap-3">
        <span className="text-sm text-surface-200/50 hidden sm:block">{adminName}</span>
        <button
          onClick={handleLogout}
          className="flex items-center gap-2 text-sm text-surface-200/40 hover:text-white transition-colors px-3 py-1.5 rounded-lg hover:bg-white/5"
        >
          <HugeiconsIcon icon={Logout01Icon} size={16} strokeWidth={1.5} />
          Logout
        </button>
      </div>
    </header>
  );
}
