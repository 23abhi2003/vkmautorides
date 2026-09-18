"use client";

import { useEffect, useState, type ReactNode } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { Menu, X, LogOut } from "lucide-react";
import { NAV_ITEMS } from "@/lib/nav";
import { useAuth } from "@/lib/Auth";
import Providers from "@/app/providers";

function ShellInner({ children }: { children: ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();
  const { user, loading, logout } = useAuth();
  const [drawerOpen, setDrawerOpen] = useState(false);

  useEffect(() => {
    if (!loading && !user && pathname !== "/login") {
      router.replace("/login");
    }
  }, [loading, user, pathname, router]);

  if (pathname === "/login") return <>{children}</>;
  if (loading) return <div className="min-h-screen flex items-center justify-center text-slate-400 text-sm">Loading...</div>;
  if (!user) return null;

  return (
    <div className="min-h-screen flex">
      {/* Desktop sidebar */}
      <aside className="hidden md:flex md:flex-col w-56 border-r bg-white shrink-0">
        <div className="px-4 py-4 font-semibold text-slate-800 border-b">🛺 VKM Auto Rides</div>
        <nav className="flex-1 p-2 space-y-1">
          {NAV_ITEMS.map((item) => {
            const Icon = item.icon;
            const active = pathname === item.href;
            return (
              <Link
                key={item.href}
                href={item.href}
                className={`flex items-center gap-2 px-3 py-2 rounded-md text-sm ${
                  active ? "bg-slate-800 text-white" : "text-slate-600 hover:bg-slate-100"
                }`}
              >
                <Icon size={16} />
                {item.label}
              </Link>
            );
          })}
        </nav>
        <button
          onClick={logout}
          className="flex items-center gap-2 px-3 py-3 m-2 rounded-md text-sm text-slate-500 hover:bg-slate-100"
        >
          <LogOut size={16} /> Log out
        </button>
      </aside>

      {/* Mobile top bar */}
      <div className="md:hidden fixed top-0 inset-x-0 z-20 bg-white border-b flex items-center justify-between px-4 py-3">
        <span className="font-semibold text-slate-800">🛺 VKM Auto Rides</span>
        <button onClick={() => setDrawerOpen(true)} aria-label="Open menu">
          <Menu size={22} />
        </button>
      </div>

      {drawerOpen && (
        <div className="md:hidden fixed inset-0 z-30 bg-black/40" onClick={() => setDrawerOpen(false)}>
          <div className="bg-white w-64 h-full p-2" onClick={(e) => e.stopPropagation()}>
            <div className="flex items-center justify-between px-3 py-3">
              <span className="font-semibold text-slate-800">Menu</span>
              <button onClick={() => setDrawerOpen(false)} aria-label="Close menu">
                <X size={20} />
              </button>
            </div>
            <nav className="space-y-1">
              {NAV_ITEMS.map((item) => {
                const Icon = item.icon;
                const active = pathname === item.href;
                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    onClick={() => setDrawerOpen(false)}
                    className={`flex items-center gap-2 px-3 py-2 rounded-md text-sm ${
                      active ? "bg-slate-800 text-white" : "text-slate-600 hover:bg-slate-100"
                    }`}
                  >
                    <Icon size={16} />
                    {item.label}
                  </Link>
                );
              })}
            </nav>
            <button
              onClick={logout}
              className="flex items-center gap-2 px-3 py-3 mt-2 rounded-md text-sm text-slate-500 hover:bg-slate-100 w-full"
            >
              <LogOut size={16} /> Log out
            </button>
          </div>
        </div>
      )}

      <main className="flex-1 px-4 py-6 md:pt-6 pt-20 max-w-5xl w-full mx-auto">{children}</main>
    </div>
  );
}

export default function AppShell({ children }: { children: ReactNode }) {
  return (
    <Providers>
      <ShellInner>{children}</ShellInner>
    </Providers>
  );
}
