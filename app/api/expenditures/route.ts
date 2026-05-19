import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireAuth } from "@/lib/session";
import { z } from "zod";
import Decimal from "decimal.js";

const expenditureSchema = z.object({
  amount: z.number().positive("Amount must be positive"),
  description: z.string().min(1, "Description is required"),
});

export async function GET(req: NextRequest) {
  const auth = await requireAuth();
  if (!auth) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const searchParams = req.nextUrl.searchParams;
  const page = parseInt(searchParams.get("page") ?? "1");
  let pageSize = parseInt(searchParams.get("pageSize") ?? "20");
  if (pageSize < 1) pageSize = 1;
  if (pageSize > 100) pageSize = 100;

  const [expenditures, total] = await Promise.all([
    prisma.expenditure.findMany({
      skip: (page - 1) * pageSize,
      take: pageSize,
      orderBy: { createdAt: "desc" },
    }),
    prisma.expenditure.count(),
  ]);

  return NextResponse.json({
    data: expenditures,
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
  const parsed = expenditureSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.errors[0].message }, { status: 400 });
  }

  const { amount, description } = parsed.data;

  try {
    const expenditure = await prisma.$transaction(async (tx) => {
      const newExpenditure = await tx.expenditure.create({
        data: {
          amount: new Decimal(amount),
          description,
        },
      });

      // Update business stats
      const stats = await tx.businessStats.findFirst();
      if (stats) {
        const newTotalExpenditure = Number(stats.totalExpenditure || 0) + amount;
        const newProfit = Number(stats.totalNetProfit) - amount; // Net profit drops when we spend
        
        await tx.businessStats.update({
          where: { id: stats.id },
          data: {
            totalExpenditure: new Decimal(newTotalExpenditure),
            totalNetProfit: new Decimal(newProfit),
            presentValue: new Decimal(Number(stats.initialCapital) + newProfit), // Present value = Initial Capital + Net Profit
          },
        });
      }

      return newExpenditure;
    });

    return NextResponse.json({ data: expenditure }, { status: 201 });
  } catch (error) {
    console.error("Expenditure creation error:", error);
    return NextResponse.json({ error: "Failed to record expenditure" }, { status: 500 });
  }
}
