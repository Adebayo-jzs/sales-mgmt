// app/layout.tsx
import type { Metadata } from "next";
import "./globals.css";
import { Toaster } from "react-hot-toast";

export const metadata: Metadata = {
  title: "SalesMS — Sales Management System",
  description: "Professional sales management and business capital tracking",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className="dark">
      <body>
        {children}
        <Toaster
          position="top-right"
          toastOptions={{
            style: {
              background: "#1a1a1a",
              color: "#fff",
              border: "1px solid #2a2a2a",
              borderRadius: "8px",
              fontFamily: "var(--font-sans)",
              fontSize: "14px",
            },
            success: { iconTheme: { primary: "#f97316", secondary: "#1a1a1a" } },
            error: { iconTheme: { primary: "#ef4444", secondary: "#1a1a1a" } },
          }}
        />
      </body>
    </html>
  );
}
