"use client";

import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";

interface OrderSummary {
  total: number;
  pending: number;
  processing: number;
  completed: number;
  cancelled: number;
}

export function OrderStatusSummary() {
  const [summary, setSummary] = useState<OrderSummary>({
    total: 0,
    pending: 0,
    processing: 0,
    completed: 0,
    cancelled: 0,
  });
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  useEffect(() => {
    fetchOrderSummary();
  }, []);

  const fetchOrderSummary = async () => {
    try {
      const response = await fetch('/api/orders/summary');
      if (!response.ok) throw new Error('خطا در دریافت اطلاعات');
      const data = await response.json();
      setSummary(data);
    } catch (error) {
      toast({
        variant: "destructive",
        title: "خطا",
        description: "دریافت اطلاعات سفارشات با مشکل مواجه شد",
      });
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>وضعیت سفارشات</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center py-4">در حال بارگذاری...</div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>وضعیت سفارشات</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-muted-foreground">کل سفارشات:</span>
              <span className="font-medium">{summary.total}</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-muted-foreground">در انتظار تایید:</span>
              <span className="font-medium text-yellow-600">{summary.pending}</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-muted-foreground">در حال پردازش:</span>
              <span className="font-medium text-blue-600">{summary.processing}</span>
            </div>
          </div>
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-muted-foreground">تکمیل شده:</span>
              <span className="font-medium text-green-600">{summary.completed}</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-muted-foreground">لغو شده:</span>
              <span className="font-medium text-red-600">{summary.cancelled}</span>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}