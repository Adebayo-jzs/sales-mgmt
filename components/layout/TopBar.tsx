// components/layout/TopBar.tsx
"use client";
import { useRouter } from "next/navigation";
import toast from "react-hot-toast";

export default function TopBar({ adminName }: { adminName: string }) {
  const router = useRouter();

  async function handleLogout() {
    await fetch("/api/auth/logout", { method: "POST" });
    toast.success("Logged out");
    router.push("/login");
    router.refresh();
  }

  return (
    <header className="h-14 bg-surface-900/80 backdrop-blur border-b border-white/5 flex items-center justify-between px-6 shrink-0">
      <div className="text-sm text-surface-200/40 font-mono">
        {new Date().toLocaleDateString("en-NG", { weekday: "long", year: "numeric", month: "long", day: "numeric" })}
      </div>
      <div className="flex items-center gap-3">
        <span className="text-sm text-surface-200/50 hidden sm:block">{adminName}</span>
        <button
          onClick={handleLogout}
          className="flex items-center gap-2 text-sm text-surface-200/40 hover:text-white transition-colors px-3 py-1.5 rounded-lg hover:bg-white/5"
        >
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
          </svg>
          Logout
        </button>
      </div>
    </header>
  );
}
