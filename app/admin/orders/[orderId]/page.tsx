"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ArrowLeft, Package, Trash2, Loader2 } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import Image from "next/image";
import { formatJalaliDate } from "@/lib/date-utils";
import { AddOrderItemDialog } from "@/components/admin/orders/add-order-item-dialog";
import { DeleteOrderItemDialog } from "@/components/admin/orders/delete-order-item-dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

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
  orderNumber: string;
  status: string;
  paymentStatus: string;
  totalAmount: number;
  description?: string;
  createdAt: string;
  user: {
    firstName: string;
    lastName: string;
    phoneNumber: string;
  };
  items: OrderItem[];
}

export default function OrderDetailsPage({ params }: { params: { orderId: string } }) {
  const [order, setOrder] = useState<Order | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [showAddItem, setShowAddItem] = useState(false);
  const [deletingItem, setDeletingItem] = useState<OrderItem | null>(null);
  const router = useRouter();
  const { toast } = useToast();

  useEffect(() => {
    fetchOrder();
  }, [params.orderId]);

  const fetchOrder = async () => {
    try {
      const response = await fetch(`/api/admin/orders/${params.orderId}`);
      if (!response.ok) throw new Error('خطا در دریافت اطلاعات');
      const data = await response.json();
      setOrder(data);
    } catch (error) {
      toast({
        variant: "destructive",
        title: "خطا",
        description: "دریافت اطلاعات سفارش با مشکل مواجه شد",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleStatusChange = async (status: string) => {
    if (!order) return;
    try {
      setSaving(true);
      const response = await fetch(`/api/admin/orders/${order.id}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ status }),
      });

      if (!response.ok) throw new Error('خطا در بروزرسانی وضعیت');
      
      await fetchOrder();
      toast({
        title: "وضعیت بروزرسانی شد",
        description: "وضعیت سفارش با موفقیت بروزرسانی شد",
      });
    } catch (error) {
      toast({
        variant: "destructive",
        title: "خطا",
        description: "بروزرسانی وضعیت با مشکل مواجه شد",
      });
    } finally {
      setSaving(false);
    }
  };

  const handlePaymentStatusChange = async (status: string) => {
    if (!order) return;
    try {
      setSaving(true);
      const response = await fetch(`/api/admin/orders/${order.id}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ paymentStatus: status }),
      });

      if (!response.ok) throw new Error('خطا در بروزرسانی وضعیت پرداخت');
      
      await fetchOrder();
      toast({
        title: "وضعیت پرداخت بروزرسانی شد",
        description: "وضعیت پرداخت با موفقیت بروزرسانی شد",
      });
    } catch (error) {
      toast({
        variant: "destructive",
        title: "خطا",
        description: "بروزرسانی وضعیت پرداخت با مشکل مواجه شد",
      });
    } finally {
      setSaving(false);
    }
  };

  const handleDeleteItem = async (itemId: string) => {
    try {
      const response = await fetch(`/api/admin/orders/${params.orderId}/items?itemId=${itemId}`, {
        method: 'DELETE',
      });

      if (!response.ok) throw new Error('خطا در حذف محصول');
      
      await fetchOrder();
      toast({
        title: "محصول حذف شد",
        description: "محصول با موفقیت از سفارش حذف شد",
      });
    } catch (error) {
      toast({
        variant: "destructive",
        title: "خطا",
        description: "حذف محصول با مشکل مواجه شد",
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
    return (
      <div className="container mx-auto p-4 space-y-4">
        <div className="flex items-center justify-between">
          <Button variant="ghost" onClick={() => router.back()}>
            <ArrowLeft className="h-4 w-4 ml-2" />
            بازگشت
          </Button>
        </div>
        <Card>
          <CardContent className="p-6">
            <div className="animate-pulse space-y-4">
              <div className="h-4 bg-gray-200 rounded w-1/4"></div>
              <div className="space-y-2">
                <div className="h-4 bg-gray-200 rounded"></div>
                <div className="h-4 bg-gray-200 rounded w-5/6"></div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (!order) {
    return (
      <div className="container mx-auto p-4">
        <div className="text-center">
          <h2 className="text-2xl font-bold mb-4">سفارش یافت نشد</h2>
          <Button onClick={() => router.back()}>بازگشت</Button>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-4 space-y-4">
      <div className="flex items-center justify-between">
        <Button variant="ghost" onClick={() => router.back()}>
          <ArrowLeft className="h-4 w-4 ml-2" />
          بازگشت
        </Button>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>جزئیات سفارش #{order.orderNumber}</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <h3 className="font-medium mb-2">اطلاعات مشتری</h3>
              <div className="space-y-2 text-sm">
                <p>نام: {order.user.firstName} {order.user.lastName}</p>
                <p>شماره تماس: {order.user.phoneNumber}</p>
              </div>
            </div>
            <div>
              <h3 className="font-medium mb-2">اطلاعات سفارش</h3>
              <div className="space-y-2 text-sm">
                <p>تاریخ ثبت: {formatJalaliDate(order.createdAt)}</p>
                <p>مبلغ کل: {order.totalAmount.toLocaleString()} تومان</p>
                <div className="space-y-4">
                  <div className="flex items-center gap-2">
                    <span className="text-muted-foreground">وضعیت سفارش:</span>
                    <Select
                      defaultValue={order.status}
                      onValueChange={handleStatusChange}
                      disabled={saving}
                    >
                      <SelectTrigger className="w-[180px]">
                        <SelectValue>
                          <Badge variant={getStatusBadgeVariant(order.status)}>
                            {getStatusText(order.status)}
                          </Badge>
                        </SelectValue>
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="CONFIRMED">تایید سفارش</SelectItem>
                        <SelectItem value="PROCESSING">در حال پردازش</SelectItem>
                        <SelectItem value="SHIPPED">ارسال سفارش</SelectItem>
                        <SelectItem value="COMPLETED">تکمیل سفارش</SelectItem>
                        <SelectItem value="CANCELLED">لغو سفارش</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-muted-foreground">وضعیت پرداخت:</span>
                    <Select
                      defaultValue={order.paymentStatus}
                      onValueChange={handlePaymentStatusChange}
                      disabled={saving}
                    >
                      <SelectTrigger className="w-[180px]">
                        <SelectValue>
                          <Badge variant={getPaymentStatusBadgeVariant(order.paymentStatus)}>
                            {getPaymentStatusText(order.paymentStatus)}
                          </Badge>
                        </SelectValue>
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="UNPAID">پرداخت نشده</SelectItem>
                        <SelectItem value="PARTIALLY_PAID">پرداخت جزئی</SelectItem>
                        <SelectItem value="PAID">پرداخت شده</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {order.description && (
            <div>
              <h3 className="font-medium mb-2">توضیحات</h3>
              <p className="text-sm text-muted-foreground">{order.description}</p>
            </div>
          )}

          <div className="space-y-4">
            <div className="flex justify-between items-center">
              <h3 className="font-medium">محصولات سفارش</h3>
              <Button onClick={() => setShowAddItem(true)}>
                <Package className="h-4 w-4 ml-2" />
                افزودن محصول
              </Button>
            </div>
            {order.items.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground">
                هیچ محصولی در سفارش وجود ندارد
              </div>
            ) : (
              <div className="space-y-4">
                {order.items.map((item) => (
                  <Card key={item.id}>
                    <CardContent className="p-4">
                      <div className="flex items-center gap-4">
                        <div className="relative w-16 h-16">
                          <Image
                            src={item.product.image}
                            alt={item.product.title}
                            fill
                            className="object-cover rounded-md"
                          />
                        </div>
                        <div className="flex-1">
                          <h4 className="font-medium">{item.product.title}</h4>
                          <div className="grid grid-cols-2 gap-4 mt-2 text-sm">
                            <div>
                              <p className="text-muted-foreground">تعداد</p>
                              <p>{item.quantity}</p>
                            </div>
                            <div>
                              <p className="text-muted-foreground">قیمت واحد</p>
                              <p>{item.price.toLocaleString()} تومان</p>
                            </div>
                            <div>
                              <p className="text-muted-foreground">قیمت کل</p>
                              <p>{(item.price * item.quantity).toLocaleString()} تومان</p>
                            </div>
                          </div>
                        </div>
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => setDeletingItem(item)}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      <AddOrderItemDialog
        orderId={order.id}
        open={showAddItem}
        onOpenChange={setShowAddItem}
        onSuccess={fetchOrder}
      />

      {deletingItem && (
        <DeleteOrderItemDialog
          item={deletingItem}
          open={!!deletingItem}
          onOpenChange={(open) => !open && setDeletingItem(null)}
          onSuccess={() => {
            handleDeleteItem(deletingItem.id);
            setDeletingItem(null);
          }}
        />
      )}
    </div>
  );
} 