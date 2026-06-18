// app/dashboard/products/page.tsx
"use client";
import { useEffect, useState, useCallback } from "react";
import { Card, PageHeader, Button, Badge, Input, Select, EmptyState, Spinner } from "@/components/ui";
import { CATEGORIES, formatDate } from "@/lib/utils";
import { toast } from "sonner";
import Link from "next/link";
import type { Product } from "@/types";
import { HugeiconsIcon } from "@hugeicons/react";
import { Add01Icon, Package01Icon } from "@hugeicons/core-free-icons";

export default function ProductsPage() {
  const [products, setProducts] = useState<Product[]>([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [search, setSearch] = useState("");
  const [category, setCategory] = useState("");
  const [loading, setLoading] = useState(true);
  const [deletingId, setDeletingId] = useState<string | null>(null);

  const fetchProducts = useCallback(async () => {
    setLoading(true);
    const params = new URLSearchParams({ page: String(page), pageSize: "12" });
    if (search) params.set("search", search);
    if (category) params.set("category", category);
    const res = await fetch(`/api/products?${params}`);
    const data = await res.json();
    setProducts(data.data ?? []);
    setTotal(data.total ?? 0);
    setTotalPages(data.totalPages ?? 1);
    setLoading(false);
  }, [page, search, category]);

  useEffect(() => {
    const timer = setTimeout(fetchProducts, 300);
    return () => clearTimeout(timer);
  }, [fetchProducts]);

  useEffect(() => { setPage(1); }, [search, category]);

  async function handleDelete(id: string, name: string) {
    if (!confirm(`Delete "${name}"? This cannot be undone.`)) return;
    setDeletingId(id);
    const res = await fetch(`/api/products/${id}`, { method: "DELETE" });
    if (res.ok) {
      toast.success("Product deleted");
      fetchProducts();
    } else {
      toast.error("Failed to delete product");
    }
    setDeletingId(null);
  }

  return (
    <div className="space-y-5 animate-in">
      <PageHeader
        title="Products"
        subtitle={`${total} product${total !== 1 ? "s" : ""} in inventory`}
        action={
          <Link href="/dashboard/products/new">
            <Button>
              <HugeiconsIcon icon={Add01Icon} size={16} strokeWidth={2} />
              Add Product
            </Button>
          </Link>
        }
      />

      {/* Filters */}
      <div className="flex gap-3">
        <div className="flex-1">
          <Input
            placeholder="Search products..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
        <div className="w-48">
          <Select value={category} onChange={(e) => setCategory(e.target.value)}>
            <option value="">All Categories</option>
            {CATEGORIES.map((c) => <option key={c} value={c}>{c}</option>)}
          </Select>
        </div>
      </div>

      <Card>
        {loading ? (
          <div className="flex items-center justify-center py-16">
            <Spinner />
          </div>
        ) : products.length === 0 ? (
          <EmptyState
            icon={<HugeiconsIcon icon={Package01Icon} size={24} strokeWidth={1.5} />}
            title="No products found"
            description={search || category ? "Try adjusting your filters" : "Add your first product to get started"}
            action={<Link href="/dashboard/products/new"><Button size="sm">Add Product</Button></Link>}
          />
        ) : (
          <>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-white/5">
                    <th className="text-left text-xs font-medium text-surface-200/30 uppercase tracking-wider px-5 py-3 font-mono">Product</th>
                    <th className="text-left text-xs font-medium text-surface-200/30 uppercase tracking-wider px-5 py-3 font-mono">Category</th>
                    <th className="text-left text-xs font-medium text-surface-200/30 uppercase tracking-wider px-5 py-3 font-mono">Sales</th>
                    <th className="text-left text-xs font-medium text-surface-200/30 uppercase tracking-wider px-5 py-3 font-mono">Added</th>
                    <th className="px-5 py-3" />
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/5">
                  {products.map((product) => (
                    <tr key={product.id} className="hover:bg-white/3 transition-colors">
                      <td className="px-5 py-3.5">
                        <Link href={`/dashboard/products/${product.id}`} className="text-sm text-white hover:text-brand-300 transition-colors font-medium">
                          {product.name}
                        </Link>
                      </td>
                      <td className="px-5 py-3.5">
                        <Badge variant="brand">{product.category}</Badge>
                      </td>
                      <td className="px-5 py-3.5">
                        <span className="text-sm text-surface-200/50 font-mono">{product._count?.saleItems ?? 0} sales</span>
                      </td>
                      <td className="px-5 py-3.5">
                        <span className="text-sm text-surface-200/30 font-mono">{formatDate(product.createdAt)}</span>
                      </td>
                      <td className="px-5 py-3.5">
                        <div className="flex items-center gap-2 justify-end">
                          <Link href={`/dashboard/products/${product.id}/edit`}>
                            <Button variant="ghost" size="sm">Edit</Button>
                          </Link>
                          <Button
                            variant="danger"
                            size="sm"
                            loading={deletingId === product.id}
                            onClick={() => handleDelete(product.id, product.name)}
                          >
                            Delete
                          </Button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Pagination */}
            {totalPages > 1 && (
              <div className="flex items-center justify-between px-5 py-3 border-t border-white/5">
                <span className="text-xs text-surface-200/30 font-mono">Page {page} of {totalPages}</span>
                <div className="flex gap-2">
                  <Button variant="secondary" size="sm" disabled={page === 1} onClick={() => setPage(p => p - 1)}>Previous</Button>
                  <Button variant="secondary" size="sm" disabled={page === totalPages} onClick={() => setPage(p => p + 1)}>Next</Button>
                </div>
              </div>
            )}
          </>
        )}
      </Card>
    </div>
  );
}
