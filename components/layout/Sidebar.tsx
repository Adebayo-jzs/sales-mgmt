// components/layout/Sidebar.tsx
"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import { HugeiconsIcon } from "@hugeicons/react";
import { AnalyticsUpIcon, DashboardSquare01Icon, Add01Icon, ClipboardIcon, Package01Icon, PlusSignCircleIcon, Clock01Icon, Settings01Icon } from "@hugeicons/core-free-icons";

const navItems = [
  {
    href: "/dashboard",
    label: "Dashboard",
    icon: <HugeiconsIcon icon={DashboardSquare01Icon} size={16} strokeWidth={1.5} />,
  },
  {
    href: "/dashboard/sales/new",
    label: "New Sale",
    icon: <HugeiconsIcon icon={Add01Icon} size={16} strokeWidth={1.5} />,
    accent: true,
  },
  {
    href: "/dashboard/history",
    label: "Sales History",
    icon: <HugeiconsIcon icon={ClipboardIcon} size={16} strokeWidth={1.5} />,
  },
  {
    href: "/dashboard/products",
    label: "Products",
    icon: <HugeiconsIcon icon={Package01Icon} size={16} strokeWidth={1.5} />,
  },
  {
    href: "/dashboard/products/new",
    label: "Add Product",
    icon: <HugeiconsIcon icon={PlusSignCircleIcon} size={16} strokeWidth={1.5} />,
  },
  {
    href: "/dashboard/expenditures",
    label: "Expenditures",
    icon: <HugeiconsIcon icon={Clock01Icon} size={16} strokeWidth={1.5} />,
  },
  {
    href: "/dashboard/settings",
    label: "Settings",
    icon: <HugeiconsIcon icon={Settings01Icon} size={16} strokeWidth={1.5} />,
  },
];

export default function Sidebar({
  adminName,
  onNavigate,
}: {
  adminName: string;
  onNavigate?: () => void;
}) {
  const pathname = usePathname();

  return (
    <aside className="w-60 h-full bg-surface-900 border-r border-white/5 flex flex-col shrink-0">
      {/* Logo */}
      <div className="px-5 py-5 border-b border-white/5">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-lg bg-brand-500/15 border border-brand-500/20 flex items-center justify-center">
            <HugeiconsIcon icon={AnalyticsUpIcon} size={16} strokeWidth={1.5} className="text-brand-400" />
          </div>
          <div>
            <div className="font-display text-lg leading-none text-white">SalesMS</div>
            <div className="text-[10px] text-surface-200/30 font-mono tracking-widest uppercase mt-0.5">Admin</div>
          </div>
        </div>
      </div>

      {/* Nav */}
      <nav className="flex-1 px-3 py-4 space-y-0.5 overflow-y-auto">
        <div className="text-[10px] font-medium text-surface-200/30 uppercase tracking-widest px-2 mb-2 font-mono">Menu</div>
        {navItems.map((item) => {
          const isActive = item.href === "/dashboard"
            ? pathname === "/dashboard"
            : pathname.startsWith(item.href);

          return (
            <Link
              key={item.href}
              href={item.href}
              onClick={onNavigate}
              className={cn(
                "flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm transition-all duration-150",
                isActive
                  ? "bg-brand-500/15 text-brand-300 border border-brand-500/20"
                  : item.accent
                  ? "text-brand-400 hover:bg-brand-500/10 hover:text-brand-300"
                  : "text-surface-200/50 hover:bg-white/5 hover:text-white"
              )}
            >
              <span className={cn(isActive ? "text-brand-400" : item.accent ? "text-brand-500" : "")}>
                {item.icon}
              </span>
              {item.label}
              {item.accent && !isActive && (
                <span className="ml-auto text-[10px] bg-brand-500/20 text-brand-400 px-1.5 py-0.5 rounded font-mono">New</span>
              )}
            </Link>
          );
        })}
      </nav>

      {/* User */}
      <div className="px-3 py-4 border-t border-white/5">
        <div className="flex items-center gap-3 px-3 py-2">
          <div className="w-7 h-7 rounded-full bg-brand-500/20 border border-brand-500/30 flex items-center justify-center text-brand-400 text-xs font-semibold">
            {adminName.charAt(0).toUpperCase()}
          </div>
          <div className="flex-1 min-w-0">
            <div className="text-sm text-white/80 font-medium truncate">{adminName}</div>
            <div className="text-[10px] text-surface-200/30 font-mono">Administrator</div>
          </div>
        </div>
      </div>
    </aside>
  );
}
