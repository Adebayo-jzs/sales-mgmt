// app/layout.tsx
import type { Metadata } from "next";
import "./globals.css";
import { Toaster } from "sonner";


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
          theme="dark"
          richColors
          toastOptions={{
            classNames: {
              toast: 'font-sans text-sm shadow-lg border border-white/10 rounded-lg',
              success: 'bg-emerald-600 text-white border-emerald-500',
              error: 'bg-red-600 text-white border-red-500',
              warning: 'bg-amber-500 text-white border-amber-400',
              info: 'bg-blue-600 text-white border-blue-500',
            },
          }}
        />
      </body>
    </html>
  );
}
