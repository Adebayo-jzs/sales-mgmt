// app/api/auth/login/route.ts
import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getSession } from "@/lib/session";
import bcrypt from "bcryptjs";
import { z } from "zod";

const loginSchema = z.object({
  email: z.string().email("Invalid email"),
  password: z.string().min(1, "Password required"),
});

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const parsed = loginSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json({ error: parsed.error.errors[0].message }, { status: 400 });
    }

    const { email, password } = parsed.data;
    const admin = await prisma.admin.findUnique({ where: { email } });
    // const admin = await  prisma.admin([{"email":"admin@salesms.com","id":"143","name":"Adedeji"}]).findUnique({where: { email }});
    if (!admin) {
      return NextResponse.json({ error: "Invalid credentials" }, { status: 401 });
    }

    // const valid = await bcrypt.compare(password, "admin123");
    const valid = await bcrypt.compare(password, admin.password);
    if (!valid) {
      return NextResponse.json({ error: "Invalid credentials" }, { status: 401 });
    }

    const session = await getSession();
    session.adminId = admin.id;
    session.adminEmail = admin.email;
    session.adminName = admin.name;
    session.isLoggedIn = true;
    await session.save();

    return NextResponse.json({ message: "Logged in", admin: { id: admin.id, email: admin.email, name: admin.name } });
  } catch (err) {
    console.error(err);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
