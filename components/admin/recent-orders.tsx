"use client";

import { formatJalaliDate } from "@/lib/date-utils";
import { Check, Clock, X } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { useEffect, useState } from "react";

interface Order {
  id: string;
  representativeName: string;
  date: Date;
  status: string;
  amount: number;
}

// Status badge component
function OrderStatusBadge({ status }: { status: string }) {
  switch (status) {
    case "PENDING":
      return (
        <Badge variant="outline" className="bg-warning/10 text-warning border-warning">
          <Clock className="mr-1 h-3 w-3" />
          در انتظار
        </Badge>
      );
    case "APPROVED":
      return (
        <Badge variant="outline" className="bg-success/10 text-success border-success">
          <Check className="mr-1 h-3 w-3" />
          تایید شده
        </Badge>
      );
    case "CANCELLED":
      return (
        <Badge variant="outline" className="bg-destructive/10 text-destructive border-destructive">
          <X className="mr-1 h-3 w-3" />
          لغو شده
        </Badge>
      );
    case "DELIVERED":
      return (
        <Badge variant="outline" className="bg-primary/10 text-primary border-primary">
          <Check className="mr-1 h-3 w-3" />
          تحویل شده
        </Badge>
      );
    default:
      return <Badge>{status}</Badge>;
  }
}

export function RecentOrders() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchOrders = async () => {
      try {
        setLoading(true);
        setError(null);
        const response = await fetch('/api/admin/recent-orders');
        if (!response.ok) {
          throw new Error('خطا در دریافت اطلاعات سفارشات');
        }
        const data = await response.json();
        setOrders(data);
      } catch (error) {
        console.error('Error fetching recent orders:', error);
        setError('خطا در دریافت اطلاعات سفارشات');
      } finally {
        setLoading(false);
      }
    };

    fetchOrders();
  }, []);

  if (loading) {
    return (
      <div className="space-y-4">
        {[...Array(3)].map((_, i) => (
          <div
            key={i}
            className="flex items-center justify-between p-4 rounded-lg border bg-card animate-pulse"
          >
            <div className="space-y-2">
              <div className="h-4 bg-muted rounded w-32" />
              <div className="h-3 bg-muted rounded w-24" />
            </div>
            <div className="flex items-center gap-3">
              <div className="h-4 bg-muted rounded w-24" />
              <div className="h-8 bg-muted rounded w-16" />
            </div>
          </div>
        ))}
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-center py-4 text-destructive">
        {error}
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {orders.length === 0 ? (
        <p className="text-muted-foreground text-center py-4">هیچ سفارشی یافت نشد.</p>
      ) : (
        <div className="space-y-4">
          {orders.map((order) => (
            <div
              key={order.id}
              className="flex items-center justify-between p-4 rounded-lg border bg-card transition-all hover:shadow-md"
            >
              <div className="space-y-1">
                <p className="font-medium">{order.representativeName}</p>
                <div className="flex items-center gap-2">
                  <OrderStatusBadge status={order.status} />
                  <p className="text-xs text-muted-foreground">
                    {formatJalaliDate(order.date)}
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <p className="font-medium text-left">
                  {new Intl.NumberFormat("fa-IR").format(order.amount)} ریال
                </p>
                <Button variant="ghost" size="sm">
                  مشاهده
                </Button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}