// app/dashboard/history/page.tsx
"use client";
import { useEffect, useState, useCallback } from "react";
import { Card, PageHeader, Button, Input, Select, Badge, EmptyState, Spinner } from "@/components/ui";
import { formatCurrency, formatDate, exportToCSV } from "@/lib/utils";
import Link from "next/link";
import type { Sale, Product } from "@/types";
import { HugeiconsIcon } from "@hugeicons/react";
import { Download01Icon, ClipboardIcon } from "@hugeicons/core-free-icons";

export default function HistoryPage() {
  const [sales, setSales] = useState<Sale[]>([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [loading, setLoading] = useState(true);
  const [products, setProducts] = useState<Product[]>([]);

  // Filters
  const [dateFrom, setDateFrom] = useState("");
  const [dateTo, setDateTo] = useState("");
  const [productId, setProductId] = useState("");
  const [minProfit, setMinProfit] = useState("");
  const [maxProfit, setMaxProfit] = useState("");
  const [month, setMonth] = useState("");
  const [year, setYear] = useState("");

  useEffect(() => {
    fetch("/api/products?all=true")
      .then((r) => r.json())
      .then((d) => setProducts(d.data ?? []));
  }, []);

  const fetchSales = useCallback(async () => {
    setLoading(true);
    const params = new URLSearchParams({ page: String(page), pageSize: "10" });
    if (dateFrom) params.set("dateFrom", dateFrom);
    if (dateTo) params.set("dateTo", dateTo);
    if (productId) params.set("productId", productId);
    if (minProfit) params.set("minProfit", minProfit);
    if (maxProfit) params.set("maxProfit", maxProfit);
    if (month) params.set("month", month);
    if (year) params.set("year", year);
    const res = await fetch(`/api/sales?${params}`);
    const data = await res.json();
    setSales(data.data ?? []);
    setTotal(data.total ?? 0);
    setTotalPages(data.totalPages ?? 1);
    setLoading(false);
  }, [page, dateFrom, dateTo, productId, minProfit, maxProfit, month, year]);

  useEffect(() => { fetchSales(); }, [fetchSales]);
  useEffect(() => { setPage(1); }, [dateFrom, dateTo, productId, minProfit, maxProfit, month, year]);

  function handleClearFilters() {
    setDateFrom(""); setDateTo(""); setProductId("");
    setMinProfit(""); setMaxProfit(""); setMonth(""); setYear("");
  }

  async function handleExport() {
    // Fetch all for export
    const params = new URLSearchParams({ page: "1", pageSize: "10000" });
    if (dateFrom) params.set("dateFrom", dateFrom);
    if (dateTo) params.set("dateTo", dateTo);
    const res = await fetch(`/api/sales?${params}`);
    const data = await res.json();
    const rows = (data.data as Sale[]).flatMap((sale) =>
      (sale.items ?? []).map((item) => ({
        "Sale ID": sale.id.slice(-8).toUpperCase(),
        "Date": formatDate(sale.createdAt),
        "Product": item.product?.name ?? "",
        "Category": item.product?.category ?? "",
        "Quantity": item.quantity,
        "Cost Price": Number(item.costPrice),
        "Selling Price": Number(item.sellingPrice),
        "Profit": Number(item.profit),
        "Sale Total": Number(sale.totalAmount),
        "Sale Profit": Number(sale.totalProfit),
      }))
    );
    exportToCSV(rows, "sales-history");
  }

  const years = Array.from({ length: 5 }, (_, i) => new Date().getFullYear() - i);

  return (
    <div className="space-y-5 animate-in">
      <PageHeader
        title="Sales History"
        subtitle={`${total} sale${total !== 1 ? "s" : ""} recorded`}
        action={
          <div className="flex gap-2">
            <Button variant="secondary" size="sm" onClick={handleExport}>
              <HugeiconsIcon icon={Download01Icon} size={16} strokeWidth={1.5} />
              Export CSV
            </Button>
            <Link href="/dashboard/sales/new">
              <Button>New Sale</Button>
            </Link>
          </div>
        }
      />

      {/* Filters */}
      <Card className="p-4">
        <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-3">
          <Input label="From Date" type="date" value={dateFrom} onChange={(e) => setDateFrom(e.target.value)} />
          <Input label="To Date" type="date" value={dateTo} onChange={(e) => setDateTo(e.target.value)} />
          <Select label="Product" value={productId} onChange={(e) => setProductId(e.target.value)}>
            <option value="">All Products</option>
            {products.map((p) => <option key={p.id} value={p.id}>{p.name}</option>)}
          </Select>
          <Select label="Year" value={year} onChange={(e) => { setYear(e.target.value); setMonth(""); }}>
            <option value="">Any Year</option>
            {years.map((y) => <option key={y} value={y}>{y}</option>)}
          </Select>
          <Input label="Min Profit (₦)" type="number" value={minProfit} onChange={(e) => setMinProfit(e.target.value)} placeholder="0" />
          <div className="flex flex-col justify-end">
            <Button variant="ghost" size="sm" onClick={handleClearFilters}>Clear</Button>
          </div>
        </div>
      </Card>

      <Card>
        {loading ? (
          <div className="flex items-center justify-center py-16"><Spinner /></div>
        ) : sales.length === 0 ? (
          <EmptyState
            icon={<HugeiconsIcon icon={ClipboardIcon} size={24} strokeWidth={1.5} />}
            title="No sales found"
            description="Try adjusting your filters or record a new sale"
            action={<Link href="/dashboard/sales/new"><Button size="sm">New Sale</Button></Link>}
          />
        ) : (
          <>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-white/5">
                    {["Sale ID", "Customer", "Date", "Items", "Total Amount", "Profit", ""].map((h) => (
                      <th key={h} className="text-left text-xs font-medium text-surface-200/30 uppercase tracking-wider px-5 py-3 font-mono">{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/5">
                  {sales.map((sale) => (
                    <tr key={sale.id} className="hover:bg-white/3 transition-colors">
                      <td className="px-5 py-3.5">
                        <span className="font-mono text-sm text-brand-400">#{sale.id.slice(-8).toUpperCase()}</span>
                      </td>
                      <td className="px-5 py-3.5 text-sm text-surface-200/70">{sale.customerName || "—"}</td>
                      <td className="px-5 py-3.5 text-sm text-surface-200/50 font-mono">{formatDate(sale.createdAt)}</td>
                      <td className="px-5 py-3.5">
                        <div className="text-sm text-surface-200/70">
                          {(sale.items ?? []).map((item) => item.product?.name).slice(0, 2).join(", ")}
                          {(sale.items ?? []).length > 2 && <span className="text-surface-200/30"> +{(sale.items ?? []).length - 2} more</span>}
                        </div>
                      </td>
                      <td className="px-5 py-3.5 text-sm text-white font-semibold">{formatCurrency(sale.totalAmount)}</td>
                      <td className="px-5 py-3.5">
                        <Badge variant={Number(sale.totalProfit) >= 0 ? "success" : "danger"}>
                          {Number(sale.totalProfit) >= 0 ? "+" : ""}{formatCurrency(sale.totalProfit)}
                        </Badge>
                      </td>
                      <td className="px-5 py-3.5">
                        <Link href={`/dashboard/sales/${sale.id}`}>
                          <Button variant="ghost" size="sm">View →</Button>
                        </Link>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Pagination */}
            <div className="flex items-center justify-between px-5 py-3 border-t border-white/5">
              <span className="text-xs text-surface-200/30 font-mono">
                Showing {(page - 1) * 10 + 1}–{Math.min(page * 10, total)} of {total}
              </span>
              <div className="flex gap-2">
                <Button variant="secondary" size="sm" disabled={page === 1} onClick={() => setPage(p => p - 1)}>Previous</Button>
                <Button variant="secondary" size="sm" disabled={page === totalPages} onClick={() => setPage(p => p + 1)}>Next</Button>
              </div>
            </div>
          </>
        )}
      </Card>
    </div>
  );
}
