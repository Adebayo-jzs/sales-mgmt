// app/api/products/[id]/route.ts
import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireAuth } from "@/lib/session";
import { z } from "zod";

const productSchema = z.object({
  name: z.string().min(1).max(100).optional(),
  category: z.string().min(1).optional(),
});

export async function GET(_req: NextRequest, { params }: { params: { id: string } }) {
  const auth = await requireAuth();
  if (!auth) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const product = await prisma.product.findUnique({
    where: { id: params.id },
    include: {
      _count: { select: { saleItems: true } },
      saleItems: {
        include: { sale: { select: { createdAt: true } } },
        orderBy: { sale: { createdAt: "desc" } },
        take: 50,
      },
    },
  });

  if (!product) return NextResponse.json({ error: "Not found" }, { status: 404 });

  // Aggregate stats — manual calculation for correct revenue (sellingPrice × quantity)
  const allItems = await prisma.saleItem.findMany({
    where: { productId: params.id },
    select: { quantity: true, sellingPrice: true, profit: true, sale: { select: { createdAt: true } } },
  });

  const totalUnits = allItems.reduce((s, i) => s + i.quantity, 0);
  const totalRevenue = allItems.reduce((s, i) => s + Number(i.sellingPrice) * i.quantity, 0);
  const totalProfit = allItems.reduce((s, i) => s + Number(i.profit), 0);

  // Monthly breakdown (last 6 months)
  const sixMonthsAgo = new Date();
  sixMonthsAgo.setMonth(sixMonthsAgo.getMonth() - 6);

  const monthlyMap: Record<string, { revenue: number; profit: number; units: number }> = {};
  allItems
    .filter((item) => item.sale.createdAt >= sixMonthsAgo)
    .forEach((item) => {
      const key = item.sale.createdAt.toISOString().slice(0, 7);
      if (!monthlyMap[key]) monthlyMap[key] = { revenue: 0, profit: 0, units: 0 };
      monthlyMap[key].revenue += Number(item.sellingPrice) * item.quantity;
      monthlyMap[key].profit += Number(item.profit);
      monthlyMap[key].units += item.quantity;
    });

  return NextResponse.json({
    data: product,
    stats: {
      totalUnits,
      totalRevenue,
      totalProfit,
    },
    monthly: Object.entries(monthlyMap)
      .sort(([a], [b]) => a.localeCompare(b))
      .map(([month, vals]) => ({ month, ...vals })),
  });
}

export async function PUT(req: NextRequest, { params }: { params: { id: string } }) {
  const auth = await requireAuth();
  if (!auth) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const body = await req.json();
  const parsed = productSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.errors[0].message }, { status: 400 });
  }

  const product = await prisma.product.update({ where: { id: params.id }, data: parsed.data });
  return NextResponse.json({ data: product });
}

export async function DELETE(_req: NextRequest, { params }: { params: { id: string } }) {
  const auth = await requireAuth();
  if (!auth) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  try {
    await prisma.product.delete({ where: { id: params.id } });
    return NextResponse.json({ message: "Deleted" });
  } catch (err: unknown) {
    // Foreign key constraint — product has associated sales
    if (
      err &&
      typeof err === "object" &&
      "code" in err &&
      (err as { code: string }).code === "P2003"
    ) {
      return NextResponse.json(
        { error: "Cannot delete product with existing sales records. Remove associated sales first." },
        { status: 409 }
      );
    }
    return NextResponse.json({ error: "Failed to delete product" }, { status: 500 });
  }
}
