// app/page.tsx
import { redirect } from "next/navigation";
import { requireAuth } from "@/lib/session";

export default async function Home() {
  const session = await requireAuth();
  if (session) {
    redirect("/dashboard");
  } else {
    redirect("/login");
  }
}
