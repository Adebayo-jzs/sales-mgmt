// app/dashboard/products/[id]/page.tsx
"use client";
import { useEffect, useState } from "react";
import { Card, PageHeader, Button, Badge, Spinner, StatCard } from "@/components/ui";
import { formatCurrency, formatDate } from "@/lib/utils";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import {
  AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
} from "recharts";
import { HugeiconsIcon } from "@hugeicons/react";
import { ShoppingBag01Icon, AnalyticsUpIcon, DollarCircleIcon } from "@hugeicons/core-free-icons";

interface ProductDetail {
  id: string;
  name: string;
  category: string;
  createdAt: string;
  saleItems: {
    id: string;
    quantity: number;
    costPrice: string;
    sellingPrice: string;
    profit: string;
    sale: { createdAt: string };
  }[];
}

interface ProductStats {
  totalUnits: number;
  totalRevenue: number;
  totalProfit: number;
}

interface Monthly {
  month: string;
  revenue: number;
  profit: number;
  units: number;
}

export default function ProductDetailPage() {
  const { id } = useParams<{ id: string }>();
  const [product, setProduct] = useState<ProductDetail | null>(null);
  const [stats, setStats] = useState<ProductStats | null>(null);
  const [monthly, setMonthly] = useState<Monthly[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch(`/api/products/${id}`)
      .then((r) => r.json())
      .then((data) => {
        setProduct(data.data);
        setStats(data.stats);
        setMonthly(data.monthly ?? []);
      })
      .finally(() => setLoading(false));
  }, [id]);

  if (loading) return <div className="flex items-center justify-center py-16"><Spinner /></div>;
  if (!product || !stats) return <div className="text-center py-16 text-surface-200/40">Product not found</div>;

  const monthlyLabelled = monthly.map((m) => ({
    ...m,
    label: new Date(m.month + "-01").toLocaleString("default", { month: "short", year: "2-digit" }),
  }));

  return (
    <div className="space-y-6 animate-in">
      <PageHeader
        title={product.name}
        subtitle={`Added ${formatDate(product.createdAt)}`}
        action={
          <div className="flex gap-2">
            <Link href={`/dashboard/products/${id}/edit`}>
              <Button variant="secondary" size="sm">Edit</Button>
            </Link>
            <Link href="/dashboard/products">
              <Button variant="ghost" size="sm">← Back</Button>
            </Link>
          </div>
        }
      />

      <div className="flex items-center gap-2">
        <Badge variant="brand">{product.category}</Badge>
        <span className="text-xs text-surface-200/30 font-mono">{product.id}</span>
      </div>

      <div className="grid grid-cols-3 gap-4">
        <StatCard
          label="Units Sold"
          value={stats.totalUnits.toLocaleString()}
          icon={<HugeiconsIcon icon={ShoppingBag01Icon} size={16} strokeWidth={1.5} />}
        />
        <StatCard
          label="Total Revenue"
          value={formatCurrency(stats.totalRevenue)}
          icon={<HugeiconsIcon icon={AnalyticsUpIcon} size={16} strokeWidth={1.5} />}
        />
        <StatCard
          label="Total Profit"
          value={formatCurrency(stats.totalProfit)}
          icon={<HugeiconsIcon icon={DollarCircleIcon} size={16} strokeWidth={1.5} />}
        />
      </div>

      {monthlyLabelled.length > 0 && (
        <Card className="p-5">
          <h3 className="text-sm font-semibold text-white mb-4">Monthly Performance (Last 6 months)</h3>
          <ResponsiveContainer width="100%" height={200}>
            <AreaChart data={monthlyLabelled}>
              <defs>
                <linearGradient id="rev" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#f97316" stopOpacity={0.2} />
                  <stop offset="95%" stopColor="#f97316" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="#ffffff08" />
              <XAxis dataKey="label" tick={{ fill: "#ffffff30", fontSize: 10 }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fill: "#ffffff30", fontSize: 10 }} axisLine={false} tickLine={false} tickFormatter={(v) => `₦${(v / 1000).toFixed(0)}k`} />
              <Tooltip contentStyle={{ background: "#1a1a1a", border: "1px solid #ffffff10", borderRadius: "12px", fontSize: 12 }} />
              <Area type="monotone" dataKey="revenue" name="Revenue" stroke="#f97316" strokeWidth={2} fill="url(#rev)" />
            </AreaChart>
          </ResponsiveContainer>
        </Card>
      )}

      <Card>
        <div className="px-5 py-4 border-b border-white/5">
          <h3 className="text-sm font-semibold text-white">Sales History</h3>
        </div>
        {product.saleItems.length === 0 ? (
          <div className="py-12 text-center text-surface-200/30 text-sm">No sales recorded yet</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-white/5">
                  {["Date", "Qty", "Cost Price", "Selling Price", "Profit"].map((h) => (
                    <th key={h} className="text-left text-xs font-medium text-surface-200/30 uppercase tracking-wider px-5 py-3 font-mono">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5">
                {product.saleItems.map((item) => (
                  <tr key={item.id} className="hover:bg-white/3 transition-colors">
                    <td className="px-5 py-3 text-sm text-surface-200/50 font-mono">{formatDate(item.sale.createdAt)}</td>
                    <td className="px-5 py-3 text-sm text-white font-mono">{item.quantity}</td>
                    <td className="px-5 py-3 text-sm text-surface-200/70">{formatCurrency(item.costPrice)}</td>
                    <td className="px-5 py-3 text-sm text-white">{formatCurrency(item.sellingPrice)}</td>
                    <td className="px-5 py-3">
                      <Badge variant="success">+{formatCurrency(item.profit)}</Badge>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </Card>
    </div>
  );
}
