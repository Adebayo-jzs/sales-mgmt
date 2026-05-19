// app/dashboard/settings/page.tsx
"use client";
import { useEffect, useState } from "react";
import { Card, PageHeader, Button, Input, Spinner, StatCard } from "@/components/ui";
import { formatCurrency } from "@/lib/utils";
import toast from "react-hot-toast";
import type { BusinessStats } from "@/types";

export default function SettingsPage() {
  const [stats, setStats] = useState<BusinessStats | null>(null);
  const [capitalInput, setCapitalInput] = useState("");
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    fetch("/api/stats")
      .then((r) => r.json())
      .then((d) => {
        setStats(d.data);
        setCapitalInput(String(Number(d.data?.initialCapital ?? 0)));
      })
      .finally(() => setLoading(false));
  }, []);

  async function handleSave(e: React.FormEvent) {
    e.preventDefault();
    const val = parseFloat(capitalInput);
    if (isNaN(val) || val <= 0) {
      toast.error("Enter a valid capital amount");
      return;
    }
    setSaving(true);
    const res = await fetch("/api/stats", {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ initialCapital: val }),
    });
    const data = await res.json();
    if (res.ok) {
      setStats(data.data);
      toast.success("Capital updated!");
    } else {
      toast.error(data.error ?? "Failed to update");
    }
    setSaving(false);
  }

  if (loading) return <div className="flex items-center justify-center py-16"><Spinner /></div>;

  return (
    <div className="max-w-2xl space-y-6 animate-in">
      <PageHeader
        title="Business Settings"
        subtitle="Manage your capital and financial baseline"
      />

      {stats && (
        <div className="grid grid-cols-3 gap-4">
          <StatCard
            label="Initial Capital"
            value={formatCurrency(stats.initialCapital)}
            icon={
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            }
          />
          <StatCard
            label="Net Profit"
            value={formatCurrency(stats.totalNetProfit)}
            icon={
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
              </svg>
            }
          />
          <StatCard
            label="Present Value"
            value={formatCurrency(stats.presentValue)}
            sub="Capital + Profit"
            icon={
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
              </svg>
            }
          />
        </div>
      )}

      <Card className="p-6">
        <h3 className="text-sm font-semibold text-white mb-1">Update Initial Capital</h3>
        <p className="text-xs text-surface-200/30 mb-5">
          Changing the initial capital will recalculate the present business value.
          Formula: <span className="font-mono text-brand-400">Present Value = Initial Capital + Total Net Profit</span>
        </p>

        <form onSubmit={handleSave} className="space-y-4">
          <Input
            label="Initial Capital (₦)"
            type="number"
            min="0"
            step="0.01"
            value={capitalInput}
            onChange={(e) => setCapitalInput(e.target.value)}
            placeholder="e.g. 500000"
            hint="The amount of money originally invested in the business"
          />
          <Button type="submit" loading={saving}>
            Save Capital
          </Button>
        </form>
      </Card>

      <Card className="p-6 border-white/5">
        <h3 className="text-sm font-semibold text-white mb-1">Formula Reference</h3>
        <div className="space-y-2 mt-3">
          {[
            ["Present Business Value", "Initial Capital + Total Net Profit"],
            ["Item Profit", "(Selling Price − Cost Price) × Quantity"],
            ["Sale Total Profit", "Sum of all Item Profits"],
            ["Total Net Profit", "Sum of all Sale Profits (auto-updated)"],
          ].map(([label, formula]) => (
            <div key={label} className="flex items-start justify-between py-2 border-b border-white/5 last:border-0">
              <span className="text-sm text-surface-200/50">{label}</span>
              <span className="font-mono text-xs text-brand-400 ml-4 text-right">{formula}</span>
            </div>
          ))}
        </div>
      </Card>
    </div>
  );
}
