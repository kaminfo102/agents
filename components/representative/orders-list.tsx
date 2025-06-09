"use client";

import { useState, useEffect } from "react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { formatDate } from "@/lib/date-utils";
import { Edit, Trash2, Eye, CreditCard } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import Link from "next/link";

interface OrderItem {
  id: string;
  quantity: number;
  price: number;
  product: {
    id: string;
    title: string;
    image: string;
  };
}

interface Order {
  id: string;
  status: string;
  totalAmount: number;
  description?: string;
  createdAt: string;
  paymentStatus: string;
  items: OrderItem[];
}

const statusColors = {
  PENDING: "bg-yellow-100 text-yellow-800",
  PROCESSING: "bg-blue-100 text-blue-800",
  COMPLETED: "bg-green-100 text-green-800",
  CANCELLED: "bg-red-100 text-red-800",
};

const statusLabels = {
  PENDING: "در انتظار تایید",
  PROCESSING: "در حال پردازش",
  COMPLETED: "تکمیل شده",
  CANCELLED: "لغو شده",
};

const paymentStatusColors = {
  UNPAID: "bg-red-100 text-red-800",
  PARTIALLY_PAID: "bg-yellow-100 text-yellow-800",
  PAID: "bg-green-100 text-green-800",
};

const paymentStatusLabels = {
  UNPAID: "پرداخت نشده",
  PARTIALLY_PAID: "پرداخت جزئی",
  PAID: "پرداخت شده",
};

export function OrdersList() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
  const { toast } = useToast();

  useEffect(() => {
    fetchOrders();
  }, []);

  const fetchOrders = async () => {
    try {
      const response = await fetch('/api/orders');
      if (!response.ok) throw new Error('خطا در دریافت اطلاعات');
      const data = await response.json();
      setOrders(data);
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

  const handleDelete = async (orderId: string) => {
    if (!confirm("آیا از حذف این سفارش اطمینان دارید؟")) return;

    try {
      const response = await fetch(`/api/orders/${orderId}`, {
        method: 'DELETE',
      });

      if (!response.ok) throw new Error('خطا در حذف سفارش');

      toast({
        title: "سفارش با موفقیت حذف شد",
        description: "سفارش با موفقیت حذف شد",
      });

      fetchOrders();
    } catch (error) {
      toast({
        variant: "destructive",
        title: "خطا",
        description: "حذف سفارش با مشکل مواجه شد",
      });
    }
  };

  const canEditOrDelete = (status: string) => {
    return status === "PENDING";
  };

  if (loading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>سفارشات من</CardTitle>
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
        <CardTitle>سفارشات من</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {orders.map((order) => (
            <Card key={order.id} className="p-4">
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div className="space-y-1">
                    <p className="text-sm font-medium">شماره سفارش: {order.id.slice(0, 8)}</p>
                    <p className="text-sm text-muted-foreground">{formatDate(order.createdAt)}</p>
                  </div>
                  <div className="flex items-center gap-2">
                    <Badge className={statusColors[order.status as keyof typeof statusColors]}>
                      {statusLabels[order.status as keyof typeof statusLabels]}
                    </Badge>
                    <Badge className={paymentStatusColors[order.paymentStatus as keyof typeof paymentStatusColors]}>
                      {paymentStatusLabels[order.paymentStatus as keyof typeof paymentStatusLabels]}
                    </Badge>
                  </div>
                </div>

                <div className="space-y-2">
                  <p className="text-sm font-medium">محصولات:</p>
                  {order.items.map((item) => (
                    <div key={item.id} className="flex items-center justify-between text-sm">
                      <span>{item.product.title}</span>
                      <span className="text-muted-foreground">
                        {item.quantity} عدد - {item.price.toLocaleString()} تومان
                      </span>
                    </div>
                  ))}
                </div>

                <div className="flex items-center justify-between pt-2 border-t">
                  <p className="text-sm font-medium">
                    مبلغ کل: {order.totalAmount.toLocaleString()} تومان
                  </p>
                  <div className="flex items-center gap-2">
                    <Dialog>
                      <DialogTrigger asChild>
                        <Button 
                          variant="ghost" 
                          size="icon"
                          onClick={() => setSelectedOrder(order)}
                        >
                          <Eye className="h-4 w-4" />
                        </Button>
                      </DialogTrigger>
                      <DialogContent className="max-w-3xl">
                        <DialogHeader>
                          <DialogTitle>جزئیات سفارش</DialogTitle>
                        </DialogHeader>
                        <div className="space-y-6">
                          <div>
                            <h4 className="font-medium mb-2">توضیحات:</h4>
                            <p className="text-sm text-muted-foreground">
                              {order.description || "توضیحاتی ثبت نشده است"}
                            </p>
                          </div>
                          <div>
                            <h4 className="font-medium mb-2">محصولات:</h4>
                            <div className="space-y-2">
                              {order.items.map((item) => (
                                <div key={item.id} className="flex items-center justify-between text-sm">
                                  <span>{item.product.title}</span>
                                  <span className="text-muted-foreground">
                                    {item.quantity} عدد - {item.price.toLocaleString()} تومان
                                  </span>
                                </div>
                              ))}
                            </div>
                          </div>
                        </div>
                      </DialogContent>
                    </Dialog>
                    {canEditOrDelete(order.status) && (
                      <>
                        <Link href={`/representative/orders/${order.id}/edit`}>
                          <Button variant="ghost" size="icon">
                            <Edit className="h-4 w-4" />
                          </Button>
                        </Link>
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => handleDelete(order.id)}
                        >
                          <Trash2 className="h-4 w-4 text-red-600" />
                        </Button>
                      </>
                    )}
                    <Link href={`/representative/orders/${order.id}/payment`}>
                      <Button variant="ghost" size="icon">
                        <CreditCard className="h-4 w-4" />
                      </Button>
                    </Link>
                  </div>
                </div>
              </div>
            </Card>
          ))}
          {orders.length === 0 && (
            <div className="text-center py-4 text-muted-foreground">
              سفارشی یافت نشد
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
} 