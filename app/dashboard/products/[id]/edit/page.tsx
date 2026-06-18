// app/dashboard/products/[id]/edit/page.tsx
"use client";
import { useEffect, useState } from "react";
import { Card, PageHeader, Button, Input, Select, Spinner } from "@/components/ui";
import { CATEGORIES } from "@/lib/utils";
import { useParams, useRouter } from "next/navigation";
import { toast } from "sonner";
import Link from "next/link";

export default function EditProductPage() {
  const { id } = useParams<{ id: string }>();
  const router = useRouter();
  const [name, setName] = useState("");
  const [category, setCategory] = useState("");
  const [loading, setLoading] = useState(false);
  const [fetching, setFetching] = useState(true);

  useEffect(() => {
    fetch(`/api/products/${id}`)
      .then((r) => r.json())
      .then((data) => {
        if (data.data) {
          setName(data.data.name);
          setCategory(data.data.category);
        }
      })
      .finally(() => setFetching(false));
  }, [id]);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!name.trim() || !category) {
      toast.error("All fields are required");
      return;
    }
    setLoading(true);
    const res = await fetch(`/api/products/${id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name: name.trim(), category }),
    });
    const data = await res.json();
    if (res.ok) {
      toast.success("Product updated!");
      router.push(`/dashboard/products/${id}`);
    } else {
      toast.error(data.error ?? "Failed to update");
    }
    setLoading(false);
  }

  if (fetching) return <div className="flex items-center justify-center py-16"><Spinner /></div>;

  return (
    <div className="max-w-xl animate-in">
      <PageHeader
        title="Edit Product"
        action={<Link href={`/dashboard/products/${id}`}><Button variant="secondary" size="sm">← Back</Button></Link>}
      />
      <Card className="p-6">
        <form onSubmit={handleSubmit} className="space-y-5">
          <Input label="Product Name" value={name} onChange={(e) => setName(e.target.value)} placeholder="Product name" />
          <Select label="Category" value={category} onChange={(e) => setCategory(e.target.value)}>
            <option value="">Select a category</option>
            {CATEGORIES.map((c) => <option key={c} value={c}>{c}</option>)}
          </Select>
          <div className="flex gap-3 pt-2">
            <Button type="submit" loading={loading} className="flex-1">Save Changes</Button>
            <Link href={`/dashboard/products/${id}`}><Button variant="secondary" type="button">Cancel</Button></Link>
          </div>
        </form>
      </Card>
    </div>
  );
}
