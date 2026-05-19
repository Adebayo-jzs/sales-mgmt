// app/api/seed/route.ts
import { NextResponse } from "next/server";

export async function POST() {
  return NextResponse.json({ message: "Run: npm run db:seed from the terminal" });
}
