// app/dashboard/products/new/page.tsx
"use client";
import { useState } from "react";
import { Card, PageHeader, Button, Input, Select } from "@/components/ui";
import { CATEGORIES } from "@/lib/utils";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import Link from "next/link";

export default function NewProductPage() {
  const router = useRouter();
  const [name, setName] = useState("");
  const [category, setCategory] = useState("");
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState<{ name?: string; category?: string }>({});

  function validate() {
    const e: typeof errors = {};
    if (!name.trim()) e.name = "Product name is required";
    if (!category) e.category = "Category is required";
    setErrors(e);
    return Object.keys(e).length === 0;
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!validate()) return;
    setLoading(true);
    try {
      const res = await fetch("/api/products", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name: name.trim(), category }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error);
      toast.success("Product created!");
      router.push("/dashboard/products");
    } catch (err: unknown) {
      toast.error(err instanceof Error ? err.message : "Failed to create product");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="max-w-xl animate-in">
      <PageHeader
        title="Add Product"
        subtitle="Create a new product in your inventory"
        action={
          <Link href="/dashboard/products">
            <Button variant="secondary" size="sm">← Back</Button>
          </Link>
        }
      />

      <Card className="p-6">
        <form onSubmit={handleSubmit} className="space-y-5">
          <Input
            label="Product Name"
            value={name}
            onChange={(e) => setName(e.target.value)}
            error={errors.name}
            placeholder="e.g. iPhone 14 Pro"
          />

          <Select
            label="Category"
            value={category}
            onChange={(e) => setCategory(e.target.value)}
            error={errors.category}
          >
            <option value="">Select a category</option>
            {CATEGORIES.map((c) => <option key={c} value={c}>{c}</option>)}
          </Select>

          <div className="flex gap-3 pt-2">
            <Button type="submit" loading={loading} className="flex-1">
              Create Product
            </Button>
            <Link href="/dashboard/products">
              <Button variant="secondary" type="button">Cancel</Button>
            </Link>
          </div>
        </form>
      </Card>
    </div>
  );
}
