import "./globals.css";
import type { Metadata } from "next";
import type { ReactNode } from "react";
import AppShell from "@/components/AppShell";

export const metadata: Metadata = {
  title: "VKM Auto Rides",
  description: "Rides, diesel usage and driver payouts for VKM Auto.",
};

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="en">
      <body className="text-slate-800">
        <AppShell>{children}</AppShell>
      </body>
    </html>
  );
}
