"use client";

import { cn } from "@/lib/utils";
import { BarChart3, MessageSquare, Package, Settings, ShoppingBag, FileText } from "lucide-react";
import { usePathname } from "next/navigation";
import Link from "next/link";
import { MobileNav } from "@/components/shared/mobile-nav";

interface RepresentativeSidebarProps {
  className?: string;
}

const navItems = [
  {
    href: "/representative/dashboard",
    icon: BarChart3,
    label: "داشبورد",
  },
  {
    href: "/representative/orders",
    icon: ShoppingBag,
    label: "سفارشات",
  },
  {
    href: "/representative/products",
    icon: Package,
    label: "محصولات",
  },
  {
    href: "/representative/requests",
    icon: FileText,
    label: "درخواست‌ها",
  },
  {
    href: "/representative/messages",
    icon: MessageSquare,
    label: "پیام‌ها",
  },
  {
    href: "/representative/profile",
    icon: Settings,
    label: "پروفایل",
  },
];

export function RepresentativeSidebar({ className }: RepresentativeSidebarProps) {
  const pathname = usePathname();

  return (
    <>
      <aside
        className={cn(
          "w-64 bg-card border-l border-border flex-col py-6 flex-shrink-0",
          className
        )}
      >
        <div className="px-4 mb-8">
          <h1 className="text-2xl font-bold text-primary">پنل نماینده</h1>
          <p className="text-muted-foreground text-sm">سامانه مدیریت نمایندگان</p>
        </div>

        <nav className="space-y-1 px-2">
          {navItems.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                "flex items-center gap-3 rounded-md px-3 py-2 text-sm font-medium transition-colors",
                pathname === item.href
                  ? "bg-primary text-primary-foreground hover:bg-primary/90"
                  : "text-muted-foreground hover:bg-accent hover:text-accent-foreground"
              )}
            >
              <item.icon className="h-5 w-5" />
              <span>{item.label}</span>
            </Link>
          ))}
        </nav>
      </aside>
      
      <MobileNav items={navItems} role="representative" />
    </>
  );
}