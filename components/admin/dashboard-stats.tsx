"use client";

import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Users, Package, ShoppingBag, MessageSquare, TrendingUp, TrendingDown } from "lucide-react";
import { cn } from "@/lib/utils";
import { useEffect, useState } from "react";

interface DashboardStatsData {
  totalRepresentatives: number;
  activeRepresentatives: number;
  totalProducts: number;
  newProducts: number;
  totalOrders: number;
  pendingOrders: number;
  totalMessages: number;
  unreadMessages: number;
  representativeChange: number;
  productChange: number;
  orderChange: number;
  messageChange: number;
}

export function DashboardStats() {
  const [stats, setStats] = useState<DashboardStatsData | null>(null);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const response = await fetch('/api/admin/dashboard-stats');
        const data = await response.json();
        setStats(data);
      } catch (error) {
        console.error('Error fetching dashboard stats:', error);
      }
    };

    fetchStats();
  }, []);

  if (!stats) {
    return null;
  }

  const statsData = [
    {
      title: "کل نمایندگان",
      value: stats.totalRepresentatives,
      description: `${stats.activeRepresentatives} نماینده فعال`,
      change: `${stats.representativeChange}%`,
      changeType: stats.representativeChange >= 0 ? "positive" : "negative",
      icon: Users,
      color: "bg-indigo-500/10 text-indigo-600"
    },
    {
      title: "کل محصولات",
      value: stats.totalProducts,
      description: `${stats.newProducts} محصول جدید`,
      change: `${stats.productChange}%`,
      changeType: stats.productChange >= 0 ? "positive" : "negative",
      icon: Package,
      color: "bg-purple-500/10 text-purple-600"
    },
    {
      title: "کل سفارشات",
      value: stats.totalOrders,
      description: `${stats.pendingOrders} سفارش در انتظار`,
      change: `${stats.orderChange}%`,
      changeType: stats.orderChange >= 0 ? "positive" : "negative",
      icon: ShoppingBag,
      color: "bg-pink-500/10 text-pink-600"
    },
    {
      title: "کل پیام‌ها",
      value: stats.totalMessages,
      description: `${stats.unreadMessages} پیام خوانده نشده`,
      change: `${stats.messageChange}%`,
      changeType: stats.messageChange >= 0 ? "positive" : "negative",
      icon: MessageSquare,
      color: "bg-blue-500/10 text-blue-600"
    }
  ];

  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
      {statsData.map((stat, index) => (
        <Card key={index} className="stats-card overflow-hidden card-hover border-none">
          <CardHeader className={cn(
            "flex flex-row items-center justify-between space-y-0 pb-2",
            stat.color
          )}>
            <CardTitle className="text-sm font-medium">
              {stat.title}
            </CardTitle>
            <stat.icon className="h-5 w-5" />
          </CardHeader>
          <CardContent className="pt-4">
            <div className="text-2xl font-bold">{stat.value}</div>
            <p className="text-xs text-muted-foreground mt-1">
              {stat.description}
            </p>
            <div className={cn(
              "flex items-center mt-2 text-xs",
              stat.changeType === "positive" ? "text-success" : "text-destructive"
            )}>
              {stat.changeType === "positive" ? (
                <TrendingUp className="h-3 w-3 ml-1" />
              ) : (
                <TrendingDown className="h-3 w-3 ml-1" />
              )}
              {stat.change}
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}