"use client";
import { useEffect, useState, useCallback } from "react";
import { Card, PageHeader, Button, Input, Spinner, EmptyState } from "@/components/ui";
import { formatCurrency, formatDateLong } from "@/lib/utils";
import { toast } from "sonner";
import type { Expenditure } from "@/types";

export default function ExpendituresPage() {
  const [expenditures, setExpenditures] = useState<Expenditure[]>([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [loading, setLoading] = useState(true);

  // Form state
  const [showForm, setShowForm] = useState(false);
  const [amount, setAmount] = useState("");
  const [description, setDescription] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const fetchExpenditures = useCallback(async () => {
    setLoading(true);
    const params = new URLSearchParams({ page: String(page), pageSize: "10" });
    const res = await fetch(`/api/expenditures?${params}`);
    const data = await res.json();
    setExpenditures(data.data ?? []);
    setTotal(data.total ?? 0);
    setTotalPages(data.totalPages ?? 1);
    setLoading(false);
  }, [page]);

  useEffect(() => {
    fetchExpenditures();
  }, [fetchExpenditures]);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!amount || !description) return toast.error("Please fill in all fields");

    setSubmitting(true);
    try {
      const res = await fetch("/api/expenditures", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ amount: Number(amount), description }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error);

      toast.success("Expenditure recorded successfully");
      setShowForm(false);
      setAmount("");
      setDescription("");
      setPage(1);
      fetchExpenditures();
    } catch (err: unknown) {
      toast.error(err instanceof Error ? err.message : "Failed to record expenditure");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className="space-y-5 animate-in">
      <PageHeader
        title="Expenditures"
        subtitle={`${total} recorded expenditure${total !== 1 ? "s" : ""}`}
        action={
          <Button onClick={() => setShowForm(!showForm)}>
            {showForm ? "Cancel" : "Add Expenditure"}
          </Button>
        }
      />

      {showForm && (
        <Card className="p-5 border-brand-500/20 bg-brand-500/5">
          <form onSubmit={handleSubmit} className="flex flex-col sm:flex-row gap-4 items-end">
            <div className="flex-1">
              <Input
                label="Amount"
                type="number"
                step="0.01"
                min="0"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                placeholder="0.00"
                required
              />
            </div>
            <div className="flex-[2]">
              <Input
                label="Description"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="e.g. Office Supplies"
                required
              />
            </div>
            <Button type="submit" disabled={submitting}>
              {submitting ? "Saving..." : "Save Expenditure"}
            </Button>
          </form>
        </Card>
      )}

      <Card>
        {loading ? (
          <div className="flex items-center justify-center py-16"><Spinner /></div>
        ) : expenditures.length === 0 ? (
          <EmptyState
            title="No expenditures yet"
            description="Record your business expenses to keep track of your net profit."
            action={<Button onClick={() => setShowForm(true)}>Add Expenditure</Button>}
          />
        ) : (
          <>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-white/5">
                    <th className="text-left text-xs font-medium text-surface-200/30 uppercase tracking-wider px-5 py-3 font-mono">Date</th>
                    <th className="text-left text-xs font-medium text-surface-200/30 uppercase tracking-wider px-5 py-3 font-mono">Description</th>
                    <th className="text-right text-xs font-medium text-surface-200/30 uppercase tracking-wider px-5 py-3 font-mono">Amount</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/5">
                  {expenditures.map((exp) => (
                    <tr key={exp.id} className="hover:bg-white/3 transition-colors">
                      <td className="px-5 py-3.5 text-sm text-surface-200/50 font-mono">{formatDateLong(exp.createdAt)}</td>
                      <td className="px-5 py-3.5 text-sm text-white">{exp.description}</td>
                      <td className="px-5 py-3.5 text-sm font-semibold text-red-400 text-right">-{formatCurrency(exp.amount)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            {totalPages > 1 && (
              <div className="flex items-center justify-between px-5 py-4 border-t border-white/5">
                <Button variant="secondary" size="sm" onClick={() => setPage(p => Math.max(1, p - 1))} disabled={page === 1}>Previous</Button>
                <span className="text-xs text-surface-200/50 font-mono">Page {page} of {totalPages}</span>
                <Button variant="secondary" size="sm" onClick={() => setPage(p => Math.min(totalPages, p + 1))} disabled={page === totalPages}>Next</Button>
              </div>
            )}
          </>
        )}
      </Card>
    </div>
  );
}
