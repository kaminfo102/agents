"use client";

import { cn } from "@/lib/utils";
import { Menu, Moon, Sun } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useTheme } from "next-themes";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import { useEffect, useState } from "react";

interface MobileHeaderProps {
  label: string;
  className?: string;
}

export function MobileHeader({ label, className }: MobileHeaderProps) {
  const { theme, setTheme } = useTheme();
  const [mounted, setMounted] = useState(false);

  // Avoid hydration mismatch
  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) {
    return null;
  }

  return (
    <header
      className={cn(
        "fixed top-0 left-0 right-0 z-40 h-14 border-b border-border bg-background/80 backdrop-blur-sm md:hidden flex items-center justify-between px-4",
        className
      )}
    >
      <Sheet>
        <SheetTrigger asChild>
          <Button variant="ghost" size="icon" className="md:hidden">
            <Menu className="h-5 w-5" />
          </Button>
        </SheetTrigger>
        <SheetContent side="right" className="flex flex-col">
          <SheetHeader className="text-right">
            <SheetTitle>{label}</SheetTitle>
          </SheetHeader>
          <div className="flex-1">
            {/* Menu items will be provided by the parent layout */}
          </div>
        </SheetContent>
      </Sheet>

      <h1 className="text-lg font-semibold text-foreground">{label}</h1>
      
      <Button
        variant="ghost"
        size="icon"
        onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
      >
        {theme === "dark" ? (
          <Sun className="h-5 w-5" />
        ) : (
          <Moon className="h-5 w-5" />
        )}
      </Button>
    </header>
  );
}