// app/dashboard/sales/new/page.tsx
"use client";

import { useEffect, useState } from "react";
import { Card, PageHeader, Button, Input, Select } from "@/components/ui";
import { formatCurrency } from "@/lib/utils";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import Link from "next/link";
import type { Product, SaleFormItem } from "@/types";
import { HugeiconsIcon } from "@hugeicons/react";
import { Add01Icon, Cancel01Icon } from "@hugeicons/core-free-icons";

interface SaleRow extends SaleFormItem {
  rowId: string;
  productName: string;
  itemProfit: number;
  itemTotal: number;
}

export default function NewSalePage() {
  const router = useRouter();
  const [products, setProducts] = useState<Product[]>([]);
  const [rows, setRows] = useState<SaleRow[]>([createRow()]);
  const [customerName, setCustomerName] = useState("");
  const [loading, setLoading] = useState(false);

  function createRow(): SaleRow {
    return {
      rowId: Math.random().toString(36).slice(2),
      productId: "",
      productName: "",
      quantity: 1,
      costPrice: 0,
      sellingPrice: 0,
      itemProfit: 0,
      itemTotal: 0,
    };
  }

  useEffect(() => {
    fetch("/api/products?all=true")
      .then((r) => r.json())
      .then((d) => setProducts(d.data ?? []));
  }, []);

  function updateRow(rowId: string, field: keyof SaleRow, rawValue: string) {
    setRows((prev) =>
      prev.map((row) => {
        if (row.rowId !== rowId) return row;

        const value =
          field === "quantity" || field === "costPrice" || field === "sellingPrice"
            ? Number(rawValue)
            : rawValue;

        const updated: SaleRow = { ...row, [field]: value } as SaleRow;

        if (field === "productId") {
          const product = products.find((p) => p.id === rawValue);
          updated.productName = product?.name ?? "";
        }

        const qty = Number(updated.quantity) || 0;
        const cost = Number(updated.costPrice) || 0;
        const sell = Number(updated.sellingPrice) || 0;

        updated.itemProfit = (sell - cost) * qty;
        updated.itemTotal = sell * qty;

        return updated;
      })
    );
  }

  function addRow() {
    setRows((prev) => [...prev, createRow()]);
  }

  function removeRow(rowId: string) {
    setRows((prev) => (prev.length === 1 ? prev : prev.filter((r) => r.rowId !== rowId)));
  }

  const totalAmount = rows.reduce((s, r) => s + r.itemTotal, 0);
  const totalProfit = rows.reduce((s, r) => s + r.itemProfit, 0);

  async function handleSubmit() {
    const invalid = rows.find((r) => !r.productId || r.quantity < 1 || r.costPrice <= 0 || r.sellingPrice <= 0);
    if (invalid) {
      toast.error("Please fill in all item fields correctly");
      return;
    }

    setLoading(true);
    try {
      const res = await fetch("/api/sales", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          customerName: customerName.trim() || undefined,
          items: rows.map((r) => ({
            productId: r.productId,
            quantity: Number(r.quantity),
            costPrice: Number(r.costPrice),
            sellingPrice: Number(r.sellingPrice),
          })),
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error);
      toast.success("Sale recorded successfully!");
      router.push(`/dashboard/sales/${data.data.id}`);
    } catch (err: unknown) {
      toast.error(err instanceof Error ? err.message : "Failed to record sale");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="space-y-5 animate-in w-full max-w-5xl mx-auto">
      <PageHeader
        title="New Sale"
        subtitle="Record a new sales transaction"
        action={
          <Link href="/dashboard/history">
            <Button variant="secondary" size="sm">← History</Button>
          </Link>
        }
      />

      <Card className="p-5">
        <div className="mb-6">
          <Input
            label="Customer Name (Optional)"
            placeholder="Enter customer name"
            value={customerName}
            onChange={(e) => setCustomerName(e.target.value)}
          />
        </div>

        <div className="flex items-center justify-between mb-4">
          <h3 className="text-sm font-semibold text-white">Sale Items</h3>
          <Button variant="secondary" size="sm" onClick={addRow}>
            <HugeiconsIcon icon={Add01Icon} size={14} strokeWidth={2} />
            Add Item
          </Button>
        </div>

        <div className="space-y-3">
          {rows.map((row, idx) => (
            <div key={row.rowId} className="bg-surface-850 border border-white/5 rounded-xl p-4">
              <div className="flex items-start gap-3">
                <div className="w-7 h-7 rounded-lg bg-brand-500/10 border border-brand-500/15 flex items-center justify-center text-brand-400 text-xs font-mono shrink-0 mt-0.5">
                  {idx + 1}
                </div>

                <div className="flex-1 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-6 gap-3">
                  <div className="sm:col-span-2 lg:col-span-3">
                    <Select
                      label="Product"
                      value={row.productId}
                      onChange={(e) => updateRow(row.rowId, "productId", e.target.value)}
                    >
                      <option value="">Select product...</option>
                      {products.map((p) => (
                        <option key={p.id} value={p.id}>
                          {p.name}
                        </option>
                      ))}
                    </Select>
                  </div>

                  <div>
                    <Input
                      label="Quantity"
                      type="number"
                      min="1"
                      value={row.quantity || ""}
                      onChange={(e) => updateRow(row.rowId, "quantity", e.target.value)}
                    />
                  </div>

                  <div>
                    <Input
                      label="Cost Price (₦)"
                      type="number"
                      min="0"
                      step="0.01"
                      value={row.costPrice || ""}
                      onChange={(e) => updateRow(row.rowId, "costPrice", e.target.value)}
                      placeholder="0.00"
                    />
                  </div>

                  <div>
                    <Input
                      label="Selling Price (₦)"
                      type="number"
                      min="0"
                      step="0.01"
                      value={row.sellingPrice || ""}
                      onChange={(e) => updateRow(row.rowId, "sellingPrice", e.target.value)}
                      placeholder="0.00"
                    />
                  </div>

                  <div className="sm:col-span-1 lg:col-span-3">
                    <label className="block text-[10px] font-medium text-surface-200/40 uppercase tracking-wider mb-1 font-mono">
                      Item Total
                    </label>
                    <div className="w-full bg-surface-900/50 border border-white/5 rounded-xl px-3 py-2.5 text-sm text-white/70 font-mono">
                      {formatCurrency(row.itemTotal)}
                    </div>
                  </div>

                  <div className="sm:col-span-1 lg:col-span-3">
                    <label className="block text-[10px] font-medium text-surface-200/40 uppercase tracking-wider mb-1 font-mono">
                      Item Profit
                    </label>
                    <div
                      className={`w-full bg-surface-900/50 border rounded-xl px-3 py-2.5 text-sm font-mono ${
                        row.itemProfit >= 0
                          ? "border-emerald-500/20 text-emerald-400"
                          : "border-red-500/20 text-red-400"
                      }`}
                    >
                      {row.itemProfit >= 0 ? "+" : ""}
                      {formatCurrency(row.itemProfit)}
                    </div>
                  </div>
                </div>

                <button
                  type="button"
                  onClick={() => removeRow(row.rowId)}
                  disabled={rows.length === 1}
                  className="text-surface-200/30 hover:text-red-400 transition-colors disabled:opacity-20 mt-0.5 p-1"
                  aria-label="Remove item"
                >
                  <HugeiconsIcon icon={Cancel01Icon} size={16} strokeWidth={2} />
                </button>
              </div>
            </div>
          ))}
        </div>
      </Card>

      <Card className="p-5">
        <h3 className="text-sm font-semibold text-white mb-4">Sale Summary</h3>
        <div className="grid grid-cols-2 md:grid-cols-3 gap-4 mb-5">
          <div className="bg-surface-850 rounded-xl p-4 border border-white/5">
            <div className="text-xs text-surface-200/40 font-mono uppercase tracking-wider mb-1">Items</div>
            <div className="text-xl font-semibold text-white">{rows.length}</div>
          </div>
          <div className="bg-surface-850 rounded-xl p-4 border border-white/5">
            <div className="text-xs text-surface-200/40 font-mono uppercase tracking-wider mb-1">Total Amount</div>
            <div className="text-xl font-semibold text-white">{formatCurrency(totalAmount)}</div>
          </div>
          <div
            className={`rounded-xl p-4 border ${
              totalProfit >= 0 ? "bg-emerald-500/5 border-emerald-500/15" : "bg-red-500/5 border-red-500/15"
            }`}
          >
            <div className="text-xs text-surface-200/40 font-mono uppercase tracking-wider mb-1">Total Profit</div>
            <div className={`text-xl font-semibold ${totalProfit >= 0 ? "text-emerald-400" : "text-red-400"}`}>
              {totalProfit >= 0 ? "+" : ""}
              {formatCurrency(totalProfit)}
            </div>
          </div>
        </div>

        <div className="flex flex-col sm:flex-row gap-3">
          <Button onClick={handleSubmit} loading={loading} size="lg" className="flex-1">
            Record Sale
          </Button>
          <Link href="/dashboard" className="sm:w-auto">
            <Button variant="secondary" size="lg" className="w-full">
              Cancel
            </Button>
          </Link>
        </div>
      </Card>
    </div>
  );
}
