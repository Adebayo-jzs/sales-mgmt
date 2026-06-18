"use client";

import { useEffect, useMemo, useState } from "react";
import Sidebar from "@/components/layout/Sidebar";
import TopBar from "@/components/layout/TopBar";

export default function DashboardShell({
  adminName,
  children,
}: {
  adminName: string;
  children: React.ReactNode;
}) {
  const [mobileNavOpen, setMobileNavOpen] = useState(false);

  useEffect(() => {
    function onKeyDown(e: KeyboardEvent) {
      if (e.key === "Escape") setMobileNavOpen(false);
    }
    if (mobileNavOpen) window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [mobileNavOpen]);

  useEffect(() => {
    document.body.style.overflow = mobileNavOpen ? "hidden" : "";
    return () => {
      document.body.style.overflow = "";
    };
  }, [mobileNavOpen]);

  const mobileNav = useMemo(() => {
    if (!mobileNavOpen) return null;
    return (
      <div className="fixed inset-0 z-50 lg:hidden">
        <button
          type="button"
          aria-label="Close navigation"
          className="absolute inset-0 bg-black/60 backdrop-blur-sm"
          onClick={() => setMobileNavOpen(false)}
        />
        <div className="absolute left-0 top-0 h-full w-[18rem] max-w-[85vw] animate-in">
          <Sidebar adminName={adminName} onNavigate={() => setMobileNavOpen(false)} />
        </div>
      </div>
    );
  }, [adminName, mobileNavOpen]);

  return (
    <div className="flex h-screen bg-surface-950 overflow-hidden">
      <div className="hidden lg:flex h-full">
        <Sidebar adminName={adminName} />
      </div>

      <div className="flex-1 flex flex-col min-w-0">
        <TopBar adminName={adminName} onOpenNav={() => setMobileNavOpen(true)} />
        <main className="flex-1 overflow-y-auto p-4 sm:p-6">{children}</main>
      </div>

      {mobileNav}
    </div>
  );
}
