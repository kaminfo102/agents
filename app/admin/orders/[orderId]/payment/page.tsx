"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ArrowLeft, Plus, Trash2, Package } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import Image from "next/image";
import { formatJalaliDate } from "@/lib/date-utils";
import { AddPaymentDialog } from "@/components/admin/orders/add-payment-dialog";
import { DeletePaymentDialog } from "@/components/admin/orders/delete-payment-dialog";
import { AddOrderItemDialog } from "@/components/admin/orders/add-order-item-dialog";
import { DeleteOrderItemDialog } from "@/components/admin/orders/delete-order-item-dialog";

interface Payment {
  id: string;
  amount: number;
  receiptImage: string;
  paymentDate: string;
  createdAt: string;
}

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
  totalAmount: number;
  paymentStatus: string;
  user: {
    firstName: string;
    lastName: string;
    phoneNumber: string;
  };
  payments: Payment[];
  items: OrderItem[];
}

export default function OrderPaymentsPage({ params }: { params: { orderId: string } }) {
  const [order, setOrder] = useState<Order | null>(null);
  const [loading, setLoading] = useState(true);
  const [showAddPayment, setShowAddPayment] = useState(false);
  const [showAddItem, setShowAddItem] = useState(false);
  const [deletingPayment, setDeletingPayment] = useState<Payment | null>(null);
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

  const handleDeletePayment = async (paymentId: string) => {
    try {
      const response = await fetch(`/api/admin/payments/${paymentId}`, {
        method: 'DELETE',
      });

      if (!response.ok) throw new Error('خطا در حذف پرداخت');
      
      await fetchOrder();
      toast({
        title: "پرداخت حذف شد",
        description: "پرداخت با موفقیت حذف شد",
      });
    } catch (error) {
      toast({
        variant: "destructive",
        title: "خطا",
        description: "حذف پرداخت با مشکل مواجه شد",
      });
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

  const totalPaid = order.payments.reduce((sum, payment) => sum + payment.amount, 0);
  const remainingAmount = order.totalAmount - totalPaid;

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
          <CardTitle>مدیریت سفارش #{order.orderNumber}</CardTitle>
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
              <h3 className="font-medium mb-2">اطلاعات پرداخت</h3>
              <div className="space-y-2 text-sm">
                <p>مبلغ کل: {order.totalAmount.toLocaleString()} تومان</p>
                <p>مبلغ پرداخت شده: {totalPaid.toLocaleString()} تومان</p>
                <p>مبلغ باقیمانده: {remainingAmount.toLocaleString()} تومان</p>
                <Badge variant={order.paymentStatus === "PAID" ? "success" : order.paymentStatus === "PARTIALLY_PAID" ? "warning" : "destructive"}>
                  {order.paymentStatus === "PAID" ? "پرداخت شده" : order.paymentStatus === "PARTIALLY_PAID" ? "پرداخت جزئی" : "پرداخت نشده"}
                </Badge>
              </div>
            </div>
          </div>

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

          <div className="space-y-4">
            <div className="flex justify-end">
              <Button onClick={() => setShowAddPayment(true)}>
                <Plus className="h-4 w-4 ml-2" />
                ثبت پرداخت جدید
              </Button>
            </div>

            <h3 className="font-medium">تاریخچه پرداخت‌ها</h3>
            {order.payments.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground">
                هیچ پرداختی ثبت نشده است
              </div>
            ) : (
              <div className="space-y-4">
                {order.payments.map((payment) => (
                  <Card key={payment.id}>
                    <CardContent className="p-4">
                      <div className="flex flex-col md:flex-row items-start md:items-center gap-4">
                        <div className="relative w-16 h-16">
                          <Image
                            src={payment.receiptImage}
                            alt="رسید پرداخت"
                            fill
                            className="object-cover rounded-md cursor-pointer"
                            onClick={() => window.open(payment.receiptImage, '_blank')}
                          />
                        </div>
                        <div className="flex-1">
                          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                            <div>
                              <p className="text-sm text-muted-foreground">مبلغ پرداخت</p>
                              <p className="font-medium">{payment.amount.toLocaleString()} تومان</p>
                            </div>
                            <div>
                              <p className="text-sm text-muted-foreground">تاریخ پرداخت</p>
                              <p className="font-medium">{formatJalaliDate(payment.paymentDate)}</p>
                            </div>
                            <div>
                              <p className="text-sm text-muted-foreground">تاریخ ثبت</p>
                              <p className="font-medium">{formatJalaliDate(payment.createdAt)}</p>
                            </div>
                          </div>
                        </div>
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => setDeletingPayment(payment)}
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

      <AddPaymentDialog
        orderId={order.id}
        open={showAddPayment}
        onOpenChange={setShowAddPayment}
        onSuccess={fetchOrder}
      />

      <AddOrderItemDialog
        orderId={order.id}
        open={showAddItem}
        onOpenChange={setShowAddItem}
        onSuccess={fetchOrder}
      />

      {deletingPayment && (
        <DeletePaymentDialog
          payment={deletingPayment}
          open={!!deletingPayment}
          onOpenChange={(open) => !open && setDeletingPayment(null)}
          onSuccess={() => {
            handleDeletePayment(deletingPayment.id);
            setDeletingPayment(null);
          }}
        />
      )}

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