"use client";

import { cn } from "@/lib/utils";
import { BarChart3, MessageSquare, Package, Settings, ShoppingBag, Users, LogOut, CreditCard } from "lucide-react";
import { usePathname } from "next/navigation";
import Link from "next/link";
import { MobileNav } from "@/components/shared/mobile-nav";
import { Button } from "@/components/ui/button";
import { signOut } from "next-auth/react";

interface AdminSidebarProps {
  className?: string;
}

const navItems = [
  {
    href: "/admin/dashboard",
    icon: BarChart3,
    label: "داشبورد",
  },
  {
    href: "/admin/representatives",
    icon: Users,
    label: "نمایندگان",
  },
  {
    href: "/admin/products",
    icon: Package,
    label: "محصولات",
  },
  {
    href: "/admin/orders",
    icon: ShoppingBag,
    label: "سفارشات",
  },
  {
    href: "/admin/payments",
    icon: CreditCard,
    label: "پرداختی ها",
  },
  {
    href: "/admin/messages",
    icon: MessageSquare,
    label: "پیام‌ها",
  },
  {
    href: "/admin/settings",
    icon: Settings,
    label: "تنظیمات",
  },
];

export function AdminSidebar({ className }: AdminSidebarProps) {
  const pathname = usePathname();

  return (
    <>
      <aside
        className={cn(
          "sidebar w-64 flex-col py-6 flex-shrink-0 bg-gradient-to-br from-indigo-50 via-white to-purple-50 border-l border-indigo-100/50",
          className
        )}
      >
        <div className="px-6 mb-8">
          <div className="bg-gradient-to-r from-indigo-500 to-purple-500 p-4 rounded-xl shadow-lg shadow-indigo-500/20">
            <h1 className="text-2xl font-bold text-white">پنل مدیریت</h1>
            <p className="text-sm text-white/90 mt-1">سامانه مدیریت نمایندگان</p>
          </div>
        </div>

        <nav className="space-y-1.5 px-3 flex-1">
          {navItems.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                "flex items-center gap-3 rounded-xl px-4 py-3 text-sm font-medium transition-all duration-200 relative group",
                pathname === item.href
                  ? "bg-indigo-500/10 text-indigo-600 shadow-sm"
                  : "text-gray-600 hover:bg-indigo-50 hover:text-indigo-600"
              )}
            >
              <item.icon className={cn(
                "h-5 w-5 transition-transform duration-200",
                pathname === item.href ? "text-indigo-600" : "text-gray-500 group-hover:text-indigo-600"
              )} />
              <span>{item.label}</span>
              {pathname === item.href && (
                <span className="absolute inset-y-1 right-0 w-1 bg-indigo-500 rounded-full" />
              )}
            </Link>
          ))}
        </nav>

        <div className="px-3 mt-6">
          <Button
            variant="ghost"
            className="w-full justify-start text-rose-500 hover:text-rose-600 hover:bg-rose-50 rounded-xl py-3"
            onClick={() => signOut()}
          >
            <LogOut className="h-5 w-5 ml-2" />
            خروج از حساب
          </Button>
        </div>
      </aside>
      
      <MobileNav items={navItems} role="admin" />
    </>
  );
}