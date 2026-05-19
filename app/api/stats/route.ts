// app/api/stats/route.ts
import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireAuth } from "@/lib/session";
import { z } from "zod";
import Decimal from "decimal.js";

const statsSchema = z.object({
  initialCapital: z.number().positive("Initial capital must be positive"),
});

export async function GET() {
  const auth = await requireAuth();
  if (!auth) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const stats = await prisma.businessStats.findFirst();
  if (!stats) {
    return NextResponse.json({ error: "Stats not found" }, { status: 404 });
  }
  return NextResponse.json({ data: stats });
}

export async function PUT(req: NextRequest) {
  const auth = await requireAuth();
  if (!auth) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const body = await req.json();
  const parsed = statsSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.errors[0].message }, { status: 400 });
  }

  const existing = await prisma.businessStats.findFirst();
  const { initialCapital } = parsed.data;

  if (existing) {
    const updated = await prisma.businessStats.update({
      where: { id: existing.id },
      data: {
        initialCapital: new Decimal(initialCapital),
        presentValue: new Decimal(initialCapital + Number(existing.totalNetProfit)),
      },
    });
    return NextResponse.json({ data: updated });
  } else {
    const created = await prisma.businessStats.create({
      data: {
        initialCapital: new Decimal(initialCapital),
        totalNetProfit: new Decimal(0),
        presentValue: new Decimal(initialCapital),
      },
    });
    return NextResponse.json({ data: created });
  }
}
