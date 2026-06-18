// app/dashboard/settings/page.tsx
"use client";
import { useEffect, useState } from "react";
import { Card, PageHeader, Button, Input, Spinner, StatCard } from "@/components/ui";
import { formatCurrency } from "@/lib/utils";
import { toast } from "sonner";
import { HugeiconsIcon } from "@hugeicons/react";
import { DollarCircleIcon, AnalyticsUpIcon, ChartHistogramIcon } from "@hugeicons/core-free-icons";
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
              <HugeiconsIcon icon={DollarCircleIcon} size={16} strokeWidth={1.5} />
            }
          />
          <StatCard
            label="Net Profit"
            value={formatCurrency(stats.totalNetProfit)}
            icon={
              <HugeiconsIcon icon={AnalyticsUpIcon} size={16} strokeWidth={1.5} />
            }
          />
          <StatCard
            label="Present Value"
            value={formatCurrency(stats.presentValue)}
            sub="Capital + Profit"
            icon={
              <HugeiconsIcon icon={ChartHistogramIcon} size={16} strokeWidth={1.5} />
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
