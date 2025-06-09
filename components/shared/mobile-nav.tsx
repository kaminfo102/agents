"use client";

import { cn } from "@/lib/utils";
import { usePathname } from "next/navigation";
import Link from "next/link";
import { DivideIcon as LucideIcon } from "lucide-react";

interface NavItem {
  href: string;
  icon: LucideIcon;
  label: string;
}

interface MobileNavProps {
  items: NavItem[];
  role: "admin" | "representative";
}

export function MobileNav({ items, role }: MobileNavProps) {
  const pathname = usePathname();

  return (
    <div className="mobile-nav md:hidden">
      {items.map((item) => (
        <Link
          key={item.href}
          href={item.href}
          className={cn(
            "flex flex-col items-center justify-center gap-1 p-2 text-xs font-medium transition-colors",
            pathname === item.href
              ? "text-indigo-600"
              : "text-gray-500 hover:text-indigo-600"
          )}
        >
          <item.icon className={cn(
            "h-5 w-5 transition-transform duration-200",
            pathname === item.href ? "text-indigo-600" : "text-gray-500 group-hover:text-indigo-600"
          )} />
          <span>{item.label}</span>
        </Link>
      ))}
    </div>
  );
}