// app/api/sales/route.ts
import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireAuth } from "@/lib/session";
import { z } from "zod";
import Decimal from "decimal.js";

const saleItemSchema = z.object({
  productId: z.string().min(1),
  quantity: z.number().int().positive(),
  costPrice: z.number().positive(),
  sellingPrice: z.number().positive(),
});

const saleSchema = z.object({
  customerName: z.string().optional(),
  items: z.array(saleItemSchema).min(1, "At least one item required"),
});

export async function GET(req: NextRequest) {
  const auth = await requireAuth();
  if (!auth) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { searchParams } = new URL(req.url);
  const page = Math.max(1, parseInt(searchParams.get("page") ?? "1"));
  const pageSize = Math.min(100, Math.max(1, parseInt(searchParams.get("pageSize") ?? "10")));
  const dateFrom = searchParams.get("dateFrom");
  const dateTo = searchParams.get("dateTo");
  const productId = searchParams.get("productId");
  const month = searchParams.get("month"); // YYYY-MM
  const year = searchParams.get("year"); // YYYY
  const minProfit = searchParams.get("minProfit");
  const maxProfit = searchParams.get("maxProfit");

  const where: Record<string, unknown> = {};

  // Date filters — mutually exclusive: month > year > dateFrom/dateTo
  if (month) {
    const [y, m] = month.split("-").map(Number);
    const start = new Date(y, m - 1, 1);
    const end = new Date(y, m, 0, 23, 59, 59, 999);
    where.createdAt = { gte: start, lte: end };
  } else if (year) {
    const y = parseInt(year);
    where.createdAt = { gte: new Date(y, 0, 1), lte: new Date(y, 11, 31, 23, 59, 59, 999) };
  } else if (dateFrom || dateTo) {
    where.createdAt = {};
    if (dateFrom) (where.createdAt as Record<string, unknown>).gte = new Date(dateFrom);
    if (dateTo) {
      const end = new Date(dateTo);
      end.setHours(23, 59, 59, 999);
      (where.createdAt as Record<string, unknown>).lte = end;
    }
  }

  if (productId) {
    where.items = { some: { productId } };
  }

  if (minProfit || maxProfit) {
    where.totalProfit = {};
    if (minProfit) (where.totalProfit as Record<string, unknown>).gte = parseFloat(minProfit);
    if (maxProfit) (where.totalProfit as Record<string, unknown>).lte = parseFloat(maxProfit);
  }

  const [total, sales] = await Promise.all([
    prisma.sale.count({ where }),
    prisma.sale.findMany({
      where,
      skip: (page - 1) * pageSize,
      take: pageSize,
      orderBy: { createdAt: "desc" },
      include: {
        items: { include: { product: { select: { id: true, name: true, category: true } } } },
      },
    }),
  ]);

  return NextResponse.json({
    data: sales,
    total,
    page,
    pageSize,
    totalPages: Math.ceil(total / pageSize),
  });
}

export async function POST(req: NextRequest) {
  const auth = await requireAuth();
  if (!auth) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const body = await req.json();
  const parsed = saleSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.errors[0].message }, { status: 400 });
  }

  const { items, customerName } = parsed.data;

  let totalAmount = 0;
  let totalProfit = 0;
  const saleItems = items.map((item) => {
    const profit = (item.sellingPrice - item.costPrice) * item.quantity;
    const amount = item.sellingPrice * item.quantity;
    totalAmount += amount;
    totalProfit += profit;
    return {
      productId: item.productId,
      quantity: item.quantity,
      costPrice: new Decimal(item.costPrice),
      sellingPrice: new Decimal(item.sellingPrice),
      profit: new Decimal(profit),
    };
  });

  const sale = await prisma.$transaction(async (tx) => {
    const newSale = await tx.sale.create({
      data: {
        totalAmount: new Decimal(totalAmount),
        totalProfit: new Decimal(totalProfit),
        customerName: customerName || null,
        items: { create: saleItems },
      },
      include: {
        items: { include: { product: true } },
      },
    });

    // Update business stats
    const stats = await tx.businessStats.findFirst();
    if (stats) {
      const newNetProfit = Number(stats.totalNetProfit) + totalProfit;
      const newSalesProfit = Number(stats.totalSalesProfit || 0) + totalProfit;
      await tx.businessStats.update({
        where: { id: stats.id },
        data: {
          totalSalesProfit: new Decimal(newSalesProfit),
          totalNetProfit: new Decimal(newNetProfit),
          presentValue: new Decimal(Number(stats.initialCapital) + newNetProfit),
        },
      });
    }

    return newSale;
  });

  return NextResponse.json({ data: sale }, { status: 201 });
}
