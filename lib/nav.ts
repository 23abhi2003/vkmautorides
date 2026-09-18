import type { LucideIcon } from "lucide-react";
import { LayoutDashboard, Route, Fuel, Wallet, Users } from "lucide-react";

export interface NavItem {
  label: string;
  href: string;
  icon: LucideIcon;
}

export const NAV_ITEMS: NavItem[] = [
  { label: "Dashboard", href: "/", icon: LayoutDashboard },
  { label: "Rides", href: "/rides", icon: Route },
  { label: "Diesel", href: "/diesel", icon: Fuel },
  { label: "Driver Pay", href: "/payments", icon: Wallet },
  { label: "Drivers", href: "/drivers", icon: Users },
];
