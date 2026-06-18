// app/dashboard/page.tsx
"use client";
import { useEffect, useState } from "react";
import { StatCard, Card, PageHeader, Skeleton, Badge } from "@/components/ui";
import { formatCurrency, formatDate } from "@/lib/utils";
import {
  AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  BarChart, Bar, Legend,
} from "recharts";
import type { DashboardData } from "@/types";
import Link from "next/link";
import { HugeiconsIcon } from "@hugeicons/react";
import { Add01Icon, DollarCircleIcon, AnalyticsUpIcon, ChartHistogramIcon, ShoppingBag01Icon } from "@hugeicons/core-free-icons";

const CustomTooltip = ({ active, payload, label }: { active?: boolean; payload?: { value: number; name: string; color: string }[]; label?: string }) => {
  if (active && payload && payload.length) {
    return (
      <div className="bg-surface-900 border border-white/10 rounded-xl p-3 text-xs">
        <p className="text-surface-200/50 mb-1 font-mono">{label}</p>
        {payload.map((p) => (
          <p key={p.name} style={{ color: p.color }} className="font-semibold">
            {p.name}: {formatCurrency(p.value)}
          </p>
        ))}
      </div>
    );
  }
  return null;
};

export default function DashboardPage() {
  const [data, setData] = useState<DashboardData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/dashboard")
      .then((r) => r.json())
      .then(setData)
      .finally(() => setLoading(false));
  }, []);

  if (loading) {
    return (
      <div className="space-y-6">
        <PageHeader title="Dashboard" subtitle="Overview of your business performance" />
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          {Array.from({ length: 4 }).map((_, i) => <Skeleton key={i} className="h-28" />)}
        </div>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          <Skeleton className="h-64" />
          <Skeleton className="h-64" />
        </div>
      </div>
    );
  }

  if (!data) return null;

  const { stats, totalRevenue, totalSales, totalProducts, recentSales, monthlyRevenue, topProducts } = data;

  return (
    <div className="space-y-6 animate-in">
      <div className="flex items-start justify-between">
        <div>
          <h1 className="font-display text-2xl text-white">Dashboard</h1>
          <p className="text-sm text-surface-200/40 mt-0.5">Overview of your business performance</p>
        </div>
        <Link
          href="/dashboard/sales/new"
          className="flex items-center gap-2 bg-brand-500 hover:bg-brand-400 text-white text-sm font-medium px-4 py-2.5 rounded-xl transition-all"
        >
          <HugeiconsIcon icon={Add01Icon} size={16} strokeWidth={2} />
          New Sale
        </Link>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
        <StatCard
          label="Initial Capital"
          value={formatCurrency(stats.initialCapital)}
          sub="Starting investment"
          icon={<HugeiconsIcon icon={DollarCircleIcon} size={16} strokeWidth={1.5} />}
        />
        <StatCard
          label="Present Value"
          value={formatCurrency(stats.presentValue)}
          sub="Capital + Profit"
          icon={<HugeiconsIcon icon={AnalyticsUpIcon} size={16} strokeWidth={1.5} />}
          trend={{ value: `${(((Number(stats.presentValue) - Number(stats.initialCapital)) / Number(stats.initialCapital)) * 100).toFixed(1)}%`, positive: Number(stats.totalNetProfit) >= 0 }}
        />
        <StatCard
          label="Total Profit"
          value={formatCurrency(stats.totalSalesProfit || 0)}
          sub="From sales only"
          icon={<HugeiconsIcon icon={DollarCircleIcon} size={16} strokeWidth={1.5} />}
        />
        <StatCard
          label="Net Profit"
          value={formatCurrency(stats.totalNetProfit)}
          sub="Profit - Expenses"
          icon={<HugeiconsIcon icon={ChartHistogramIcon} size={16} strokeWidth={1.5} />}
        />
        <StatCard
          label="Total Expenses"
          value={formatCurrency(stats.totalExpenditure || 0)}
          sub="Recorded expenditures"
          icon={<HugeiconsIcon icon={DollarCircleIcon} size={16} strokeWidth={1.5} />}
        />
        <StatCard
          label="Total Revenue"
          value={formatCurrency(totalRevenue)}
          sub={`${totalSales} sales · ${totalProducts} products`}
          icon={<HugeiconsIcon icon={ShoppingBag01Icon} size={16} strokeWidth={1.5} />}
        />
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <Card className="p-5">
          <h3 className="text-sm font-semibold text-white mb-1">Revenue & Profit</h3>
          <p className="text-xs text-surface-200/30 mb-4 font-mono">Last 12 months</p>
          <ResponsiveContainer width="100%" height={220}>
            <AreaChart data={monthlyRevenue}>
              <defs>
                <linearGradient id="revenue" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#f97316" stopOpacity={0.15} />
                  <stop offset="95%" stopColor="#f97316" stopOpacity={0} />
                </linearGradient>
                <linearGradient id="profit" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#34d399" stopOpacity={0.15} />
                  <stop offset="95%" stopColor="#34d399" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="#ffffff08" />
              <XAxis dataKey="month" tick={{ fill: "#ffffff30", fontSize: 10 }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fill: "#ffffff30", fontSize: 10 }} axisLine={false} tickLine={false} tickFormatter={(v) => `₦${(v / 1000).toFixed(0)}k`} />
              <Tooltip content={<CustomTooltip />} />
              <Area type="monotone" dataKey="revenue" name="Revenue" stroke="#f97316" strokeWidth={2} fill="url(#revenue)" />
              <Area type="monotone" dataKey="profit" name="Profit" stroke="#34d399" strokeWidth={2} fill="url(#profit)" />
            </AreaChart>
          </ResponsiveContainer>
        </Card>

        <Card className="p-5">
          <h3 className="text-sm font-semibold text-white mb-1">Top Products</h3>
          <p className="text-xs text-surface-200/30 mb-4 font-mono">By revenue</p>
          <ResponsiveContainer width="100%" height={220}>
            <BarChart data={topProducts} layout="vertical">
              <CartesianGrid strokeDasharray="3 3" stroke="#ffffff08" horizontal={false} />
              <XAxis type="number" tick={{ fill: "#ffffff30", fontSize: 10 }} axisLine={false} tickLine={false} tickFormatter={(v) => `₦${(v / 1000).toFixed(0)}k`} />
              <YAxis dataKey="name" type="category" tick={{ fill: "#ffffff50", fontSize: 10 }} axisLine={false} tickLine={false} width={100} />
              <Tooltip content={<CustomTooltip />} />
              <Bar dataKey="totalRevenue" name="Revenue" fill="#f97316" radius={[0, 4, 4, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </Card>
      </div>

      {/* Recent Sales */}
      <Card>
        <div className="flex items-center justify-between px-5 py-4 border-b border-white/5">
          <h3 className="text-sm font-semibold text-white">Recent Sales</h3>
          <Link href="/dashboard/history" className="text-xs text-brand-400 hover:text-brand-300 font-mono">
            View all →
          </Link>
        </div>
        <div className="divide-y divide-white/5">
          {recentSales.length === 0 ? (
            <div className="py-12 text-center text-surface-200/30 text-sm">No sales yet</div>
          ) : (
            recentSales.map((sale) => (
              <Link key={sale.id} href={`/dashboard/sales/${sale.id}`} className="flex items-center justify-between px-5 py-3.5 hover:bg-white/3 transition-colors">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-lg bg-brand-500/10 border border-brand-500/15 flex items-center justify-center">
                    <HugeiconsIcon icon={ShoppingBag01Icon} size={14} strokeWidth={2} className="text-brand-400" />
                  </div>
                  <div>
                    <div className="text-sm text-white font-mono">#{sale.id.slice(-8).toUpperCase()} {sale.customerName ? ` · ${sale.customerName}` : ""}</div>
                    <div className="text-xs text-surface-200/30">{formatDate(sale.createdAt)} · {(sale.items ?? []).length} item(s)</div>
                  </div>
                </div>
                <div className="text-right">
                  <div className="text-sm font-semibold text-white">{formatCurrency(sale.totalAmount)}</div>
                  <Badge variant={Number(sale.totalProfit) >= 0 ? "success" : "danger"}>
                    {Number(sale.totalProfit) > 0 ? "+" : ""}{formatCurrency(sale.totalProfit)}
                  </Badge>
                </div>
              </Link>
            ))
          )}
        </div>
      </Card>
    </div>
  );
}
