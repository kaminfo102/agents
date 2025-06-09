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
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Eye, MoreHorizontal, CreditCard, Trash2 } from "lucide-react";
import { formatJalaliDate } from "@/lib/date-utils";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useToast } from "@/hooks/use-toast";
import { Card, CardContent } from "@/components/ui/card";
import { ChevronDown, ChevronUp } from "lucide-react";
import Link from "next/link";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";

interface Order {
  id: string;
  orderNumber: string;
  user: {
    firstName: string;
    lastName: string;
    phoneNumber: string;
  };
  status: string;
  paymentStatus: string;
  totalAmount: number;
  description?: string;
  createdAt: string;
  items: Array<{
    id: string;
    quantity: number;
    price: number;
    product: {
      id: string;
      title: string;
      image: string;
    };
  }>;
  payments: Array<{
    id: string;
    amount: number;
  }>;
}

export function AdminOrderList() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [expandedItems, setExpandedItems] = useState<Set<string>>(new Set());
  const [deletingOrder, setDeletingOrder] = useState<Order | null>(null);
  const { toast } = useToast();
  
  useEffect(() => {
    fetchOrders();
  }, []);
  
  const fetchOrders = async () => {
    try {
      const response = await fetch('/api/admin/orders');
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

  const toggleExpand = (id: string) => {
    setExpandedItems(prev => {
      const newSet = new Set(prev);
      if (newSet.has(id)) {
        newSet.delete(id);
      } else {
        newSet.add(id);
      }
      return newSet;
    });
  };

  const handleDeleteOrder = async (orderId: string) => {
    try {
      const response = await fetch(`/api/admin/orders/${orderId}`, {
        method: 'DELETE',
      });

      if (!response.ok) throw new Error('خطا در حذف سفارش');
      
      setOrders(orders => orders.filter(order => order.id !== orderId));
      toast({
        title: "سفارش حذف شد",
        description: "سفارش با موفقیت حذف شد",
      });
    } catch (error) {
      toast({
        variant: "destructive",
        title: "خطا",
        description: "حذف سفارش با مشکل مواجه شد",
      });
    }
  };

  const getStatusBadgeVariant = (status: string) => {
    switch (status) {
      case "CONFIRMED":
        return "default";
      case "PROCESSING":
        return "secondary";
      case "SHIPPED":
        return "secondary";
      case "COMPLETED":
        return "default";
      case "CANCELLED":
        return "destructive";
      default:
        return "secondary";
    }
  };

  const getPaymentStatusBadgeVariant = (status: string) => {
    switch (status) {
      case "PAID":
        return "default";
      case "PARTIALLY_PAID":
        return "secondary";
      case "UNPAID":
        return "destructive";
      default:
        return "secondary";
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case "CONFIRMED":
        return "تایید سفارش";
      case "PROCESSING":
        return "در حال پردازش";
      case "SHIPPED":
        return "ارسال سفارش";
      case "COMPLETED":
        return "تکمیل سفارش";
      case "CANCELLED":
        return "لغو سفارش";
      default:
        return status;
    }
  };

  const getPaymentStatusText = (status: string) => {
    switch (status) {
      case "PAID":
        return "پرداخت شده";
      case "PARTIALLY_PAID":
        return "پرداخت جزئی";
      case "UNPAID":
        return "پرداخت نشده";
      default:
        return status;
    }
  };

  if (loading) {
    return <div className="text-center py-8">در حال بارگذاری...</div>;
  }

  return (
    <div className="space-y-4">
      {/* Mobile View */}
      <div className="block md:hidden space-y-4">
        {orders.length === 0 ? (
          <div className="text-center py-8 text-muted-foreground">
            هیچ سفارشی یافت نشد.
          </div>
        ) : (
          orders.map((order) => (
            <Card key={order.id} className="overflow-hidden">
              <CardContent className="p-4">
                {/* Summary View */}
                <div className="space-y-2">
                  <div className="flex justify-between items-center">
                    <span className="font-medium">
                      سفارش #{order.orderNumber}
                    </span>
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => toggleExpand(order.id)}
                      className="h-8 w-8"
                    >
                      {expandedItems.has(order.id) ? (
                        <ChevronUp className="h-4 w-4" />
                      ) : (
                        <ChevronDown className="h-4 w-4" />
                      )}
                    </Button>
                  </div>
                  <div className="flex justify-between items-center text-sm text-muted-foreground">
                    <span>{formatJalaliDate(order.createdAt)}</span>
                    <span className="font-medium text-foreground">
                      {order.totalAmount.toLocaleString()} تومان
                    </span>
                  </div>
                  <div className="flex gap-2">
                    <Badge variant={getStatusBadgeVariant(order.status)}>
                      {getStatusText(order.status)}
                    </Badge>
                    <Badge variant={getPaymentStatusBadgeVariant(order.paymentStatus)}>
                      {getPaymentStatusText(order.paymentStatus)}
                    </Badge>
                  </div>
                </div>

                {/* Expanded Details */}
                {expandedItems.has(order.id) && (
                  <div className="mt-4 pt-4 border-t space-y-3">
                    <div className="flex justify-between items-center">
                      <span className="text-sm text-muted-foreground">نام مشتری:</span>
                      <span className="font-medium">
                        {order.user.firstName} {order.user.lastName}
                      </span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-sm text-muted-foreground">شماره تماس:</span>
                      <span className="font-medium">{order.user.phoneNumber}</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-sm text-muted-foreground">تعداد محصولات:</span>
                      <span className="font-medium">{order.items.length}</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-sm text-muted-foreground">تعداد پرداخت‌ها:</span>
                      <span className="font-medium">{order.payments?.length || 0}</span>
                    </div>
                    <div className="flex items-center justify-end gap-2 pt-2 border-t">
                      <Button variant="ghost" size="sm" asChild>
                        <Link href={`/admin/orders/${order.id}`}>
                          <Eye className="h-4 w-4 ml-2" />
                          مشاهده جزئیات
                        </Link>
                      </Button>
                      <Button variant="ghost" size="sm" asChild>
                        <Link href={`/admin/orders/${order.id}/payment`}>
                          <CreditCard className="h-4 w-4 ml-2" />
                          مدیریت پرداخت
                        </Link>
                      </Button>
                      {(!order.payments || order.payments.length === 0) && (
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => setDeletingOrder(order)}
                        >
                          <Trash2 className="h-4 w-4 ml-2" />
                          حذف سفارش
                        </Button>
                      )}
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          ))
        )}
      </div>

      {/* Desktop View */}
      <div className="hidden md:block">
        <div className="rounded-md border overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>شماره سفارش</TableHead>
                <TableHead>نام مشتری</TableHead>
                <TableHead>وضعیت</TableHead>
                <TableHead>وضعیت پرداخت</TableHead>
                <TableHead>مبلغ کل</TableHead>
                <TableHead>تاریخ ثبت</TableHead>
                <TableHead className="text-left">عملیات</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {orders.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={7} className="text-center py-8 text-muted-foreground">
                    هیچ سفارشی یافت نشد.
                  </TableCell>
                </TableRow>
              ) : (
                orders.map((order) => (
                  <TableRow key={order.id}>
                    <TableCell>{order.orderNumber}</TableCell>
                    <TableCell>
                      {order.user.firstName} {order.user.lastName}
                    </TableCell>
                    <TableCell>
                      <Badge variant={getStatusBadgeVariant(order.status)}>
                        {getStatusText(order.status)}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <Badge variant={getPaymentStatusBadgeVariant(order.paymentStatus)}>
                        {getPaymentStatusText(order.paymentStatus)}
                      </Badge>
                    </TableCell>
                    <TableCell>{order.totalAmount.toLocaleString()} تومان</TableCell>
                    <TableCell>{formatJalaliDate(order.createdAt)}</TableCell>
                    <TableCell>
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" size="icon">
                            <MoreHorizontal className="h-4 w-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuItem asChild>
                            <Link href={`/admin/orders/${order.id}`}>
                              <Eye className="h-4 w-4 ml-2" />
                              مشاهده جزئیات
                            </Link>
                          </DropdownMenuItem>
                          <DropdownMenuItem asChild>
                            <Link href={`/admin/orders/${order.id}/payment`}>
                              <CreditCard className="h-4 w-4 ml-2" />
                              مدیریت پرداخت
                            </Link>
                          </DropdownMenuItem>
                          {(!order.payments || order.payments.length === 0) && (
                            <DropdownMenuItem
                              onClick={() => setDeletingOrder(order)}
                              className="text-destructive"
                            >
                              <Trash2 className="h-4 w-4 ml-2" />
                              حذف سفارش
                            </DropdownMenuItem>
                          )}
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </div>
      </div>

      {/* Delete Order Dialog */}
      <AlertDialog open={!!deletingOrder} onOpenChange={(open) => !open && setDeletingOrder(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>حذف سفارش</AlertDialogTitle>
            <AlertDialogDescription>
              آیا از حذف این سفارش اطمینان دارید؟ این عملیات غیرقابل بازگشت است.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>انصراف</AlertDialogCancel>
            <AlertDialogAction
              onClick={() => {
                if (deletingOrder) {
                  handleDeleteOrder(deletingOrder.id);
                  setDeletingOrder(null);
                }
              }}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              حذف سفارش
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
} 