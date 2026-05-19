// app/dashboard/sales/[id]/page.tsx
"use client";
import { useEffect, useState } from "react";
import { Card, PageHeader, Button, Badge, Spinner } from "@/components/ui";
import { formatCurrency, formatDateLong } from "@/lib/utils";
import { useParams } from "next/navigation";
import Link from "next/link";
import type { Sale } from "@/types";

export default function SaleDetailPage() {
  const { id } = useParams<{ id: string }>();
  const [sale, setSale] = useState<Sale | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch(`/api/sales/${id}`)
      .then((r) => r.json())
      .then((d) => setSale(d.data))
      .finally(() => setLoading(false));
  }, [id]);

  if (loading) return <div className="flex items-center justify-center py-16"><Spinner /></div>;
  if (!sale) return <div className="text-center py-16 text-surface-200/40">Sale not found</div>;

  return (
    <div className="max-w-3xl space-y-5 animate-in">
      <PageHeader
        title={`Sale #${sale.id.slice(-8).toUpperCase()}`}
        subtitle={`${formatDateLong(sale.createdAt)}${sale.customerName ? ` · Customer: ${sale.customerName}` : ""}`}
        action={<Link href="/dashboard/history"><Button variant="secondary" size="sm">← History</Button></Link>}
      />

      {/* Summary cards */}
      <div className="grid grid-cols-2 gap-4">
        <Card className="p-4">
          <div className="text-xs text-surface-200/40 font-mono uppercase tracking-wider mb-1">Total Amount</div>
          <div className="text-2xl font-semibold text-white">{formatCurrency(sale.totalAmount)}</div>
        </Card>
        <Card className="p-4 border-emerald-500/20">
          <div className="text-xs text-surface-200/40 font-mono uppercase tracking-wider mb-1">Total Profit</div>
          <div className={`text-2xl font-semibold ${Number(sale.totalProfit) >= 0 ? 'text-emerald-400' : 'text-red-400'}`}>
            {Number(sale.totalProfit) > 0 ? "+" : ""}{formatCurrency(sale.totalProfit)}
          </div>
        </Card>
      </div>

      {/* Items */}
      <Card>
        <div className="px-5 py-4 border-b border-white/5">
          <h3 className="text-sm font-semibold text-white">Items ({(sale.items ?? []).length})</h3>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-white/5">
                {["Product", "Qty", "Cost Price", "Selling Price", "Subtotal", "Profit"].map((h) => (
                  <th key={h} className="text-left text-xs font-medium text-surface-200/30 uppercase tracking-wider px-5 py-3 font-mono">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5">
              {(sale.items ?? []).map((item) => (
                <tr key={item.id} className="hover:bg-white/3 transition-colors">
                  <td className="px-5 py-3.5">
                    <div className="text-sm text-white font-medium">{item.product?.name ?? "—"}</div>
                    <div className="text-xs text-surface-200/30">{item.product?.category}</div>
                  </td>
                  <td className="px-5 py-3.5 text-sm text-surface-200/70 font-mono">{item.quantity}</td>
                  <td className="px-5 py-3.5 text-sm text-surface-200/70">{formatCurrency(item.costPrice)}</td>
                  <td className="px-5 py-3.5 text-sm text-white">{formatCurrency(item.sellingPrice)}</td>
                  <td className="px-5 py-3.5 text-sm text-white">{formatCurrency(Number(item.sellingPrice) * item.quantity)}</td>
                  <td className="px-5 py-3.5">
                    <Badge variant={Number(item.profit) >= 0 ? "success" : "danger"}>
                      {Number(item.profit) >= 0 ? "+" : ""}{formatCurrency(item.profit)}
                    </Badge>
                  </td>
                </tr>
              ))}
            </tbody>
            <tfoot>
              <tr className="border-t border-white/10 bg-white/3">
                <td colSpan={4} className="px-5 py-3 text-sm text-right text-surface-200/50 font-medium">Totals</td>
                <td className="px-5 py-3 text-sm text-white font-semibold">{formatCurrency(sale.totalAmount)}</td>
                <td className="px-5 py-3">
                  <Badge variant={Number(sale.totalProfit) >= 0 ? "success" : "danger"}>
                    {Number(sale.totalProfit) > 0 ? "+" : ""}{formatCurrency(sale.totalProfit)}
                  </Badge>
                </td>
              </tr>
            </tfoot>
          </table>
        </div>
      </Card>
    </div>
  );
}
