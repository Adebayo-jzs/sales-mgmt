// app/api/dashboard/route.ts
import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireAuth } from "@/lib/session";

export async function GET() {
  const auth = await requireAuth();
  if (!auth) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const [stats, totalSales, totalProducts, recentSales, revenueAgg] = await Promise.all([
    prisma.businessStats.findFirst(),
    prisma.sale.count(),
    prisma.product.count(),
    prisma.sale.findMany({
      take: 5,
      orderBy: { createdAt: "desc" },
      include: { items: { include: { product: { select: { name: true } } } } },
    }),
    prisma.sale.aggregate({ _sum: { totalAmount: true } }),
  ]);

  const totalRevenue = Number(revenueAgg._sum.totalAmount || 0);

  // Monthly revenue/profit - last 12 months
  const twelveMonthsAgo = new Date();
  twelveMonthsAgo.setMonth(twelveMonthsAgo.getMonth() - 11);
  twelveMonthsAgo.setDate(1);

  const monthlySales = await prisma.sale.findMany({
    where: { createdAt: { gte: twelveMonthsAgo } },
    select: { totalAmount: true, totalProfit: true, createdAt: true },
  });

  const monthlyMap: Record<string, { revenue: number; profit: number }> = {};
  monthlySales.forEach((s) => {
    const key = s.createdAt.toISOString().slice(0, 7);
    if (!monthlyMap[key]) monthlyMap[key] = { revenue: 0, profit: 0 };
    monthlyMap[key].revenue += Number(s.totalAmount);
    monthlyMap[key].profit += Number(s.totalProfit);
  });

  // Fill missing months
  const monthlyRevenue = [];
  for (let i = 11; i >= 0; i--) {
    const d = new Date();
    d.setMonth(d.getMonth() - i);
    const key = d.toISOString().slice(0, 7);
    const label = d.toLocaleString("default", { month: "short", year: "2-digit" });
    monthlyRevenue.push({ month: label, ...(monthlyMap[key] ?? { revenue: 0, profit: 0 }) });
  }

  // Top products by revenue — manual aggregation for correct revenue (sellingPrice × quantity)
  const allSaleItems = await prisma.saleItem.findMany({
    select: { productId: true, quantity: true, sellingPrice: true, profit: true },
  });

  const productStatsMap: Record<string, { totalRevenue: number; totalProfit: number; totalUnits: number }> = {};
  allSaleItems.forEach((item) => {
    if (!productStatsMap[item.productId]) {
      productStatsMap[item.productId] = { totalRevenue: 0, totalProfit: 0, totalUnits: 0 };
    }
    productStatsMap[item.productId].totalRevenue += Number(item.sellingPrice) * item.quantity;
    productStatsMap[item.productId].totalProfit += Number(item.profit);
    productStatsMap[item.productId].totalUnits += item.quantity;
  });

  const topProductEntries = Object.entries(productStatsMap)
    .sort(([, a], [, b]) => b.totalRevenue - a.totalRevenue)
    .slice(0, 5);

  const productIds = topProductEntries.map(([id]) => id);
  const products = await prisma.product.findMany({ where: { id: { in: productIds } } });
  const productMap = Object.fromEntries(products.map((p) => [p.id, p]));

  const topProducts = topProductEntries.map(([id, stats]) => ({
    name: productMap[id]?.name ?? "Unknown",
    ...stats,
  }));

  return NextResponse.json({
    stats,
    totalRevenue,
    totalSales,
    totalProducts,
    recentSales,
    monthlyRevenue,
    topProducts,
  });
}
