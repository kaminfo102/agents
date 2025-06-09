"use client";

import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { CalendarIcon, Upload, Receipt, ArrowRight, Loader2 } from "lucide-react";
import { format } from "date-fns";
import { fa } from "date-fns/locale";
import Image from "next/image";
import { formatDate } from "@/lib/date-utils";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Skeleton } from "@/components/ui/skeleton";
import { Progress } from "@/components/ui/progress";

interface Payment {
  id: string;
  amount: number;
  paymentDate: string;
  receiptImage: string;
  createdAt: string;
}

interface Order {
  id: string;
  status: string;
  totalAmount: number;
  description?: string;
  createdAt: string;
  paymentStatus: string;
  items: {
    id: string;
    quantity: number;
    price: number;
    product: {
      id: string;
      title: string;
      image: string;
    };
  }[];
}

export default function PaymentPage({ params }: { params: { orderId: string } }) {
  const [amount, setAmount] = useState("");
  const [paymentDate, setPaymentDate] = useState<Date | undefined>(new Date());
  const [receiptImage, setReceiptImage] = useState<File | null>(null);
  const [loading, setLoading] = useState(false);
  const [payments, setPayments] = useState<Payment[]>([]);
  const [order, setOrder] = useState<Order | null>(null);
  const [loadingPayments, setLoadingPayments] = useState(true);
  const { toast } = useToast();
  const router = useRouter();

  useEffect(() => {
    fetchOrder();
    fetchPayments();
  }, [params.orderId]);

  const fetchOrder = async () => {
    try {
      const response = await fetch(`/api/orders/${params.orderId}`);
      if (!response.ok) throw new Error('خطا در دریافت اطلاعات سفارش');
      const data = await response.json();
      setOrder(data);
    } catch (error) {
      toast({
        variant: "destructive",
        title: "خطا",
        description: "دریافت اطلاعات سفارش با مشکل مواجه شد",
      });
    }
  };

  const fetchPayments = async () => {
    try {
      setLoadingPayments(true);
      const response = await fetch(`/api/orders/${params.orderId}/payments`);
      if (!response.ok) throw new Error('خطا در دریافت اطلاعات پرداخت‌ها');
      const data = await response.json();
      setPayments(data);
    } catch (error) {
      toast({
        variant: "destructive",
        title: "خطا",
        description: "دریافت اطلاعات پرداخت‌ها با مشکل مواجه شد",
      });
    } finally {
      setLoadingPayments(false);
    }
  };

  const totalPaid = payments.reduce((sum, payment) => sum + payment.amount, 0);
  const remainingAmount = order ? order.totalAmount - totalPaid : 0;

  const paymentProgress = order ? (totalPaid / order.totalAmount) * 100 : 0;
  const paymentStatusColor = paymentProgress === 100 ? "bg-green-500" : 
                           paymentProgress > 0 ? "bg-yellow-500" : "bg-red-500";

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!paymentDate || !receiptImage) {
      toast({
        variant: "destructive",
        title: "خطا",
        description: "لطفا تمام فیلدها را پر کنید",
      });
      return;
    }

    const paymentAmount = parseFloat(amount);
    if (paymentAmount > remainingAmount) {
      toast({
        variant: "destructive",
        title: "خطا",
        description: "مبلغ پرداختی نمی‌تواند بیشتر از مبلغ باقیمانده باشد",
      });
      return;
    }

    const formData = new FormData();
    formData.append("amount", amount);
    formData.append("paymentDate", paymentDate.toISOString());
    formData.append("receiptImage", receiptImage);

    try {
      setLoading(true);
      const response = await fetch(`/api/orders/${params.orderId}/payments`, {
        method: "POST",
        body: formData,
      });

      if (!response.ok) throw new Error("خطا در ثبت پرداخت");

      toast({
        title: "پرداخت با موفقیت ثبت شد",
        description: "پرداخت با موفقیت ثبت شد",
      });

      // Reset form
      setAmount("");
      setPaymentDate(new Date());
      setReceiptImage(null);
      
      // Refresh payments
      await fetchPayments();
    } catch (error) {
      toast({
        variant: "destructive",
        title: "خطا",
        description: "ثبت پرداخت با مشکل مواجه شد",
      });
    } finally {
      setLoading(false);
    }
  };

  if (!order) {
    return (
      <div className="container mx-auto py-6">
        <div className="text-center py-4">در حال بارگذاری...</div>
      </div>
    );
  }

  return (
    <div className="container mx-auto py-6">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold">ثبت پرداخت</h1>
        <Link href="/representative/orders">
          <Button variant="outline">
            <ArrowRight className="ml-2 h-4 w-4" />
            بازگشت به لیست سفارش‌ها
          </Button>
        </Link>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>اطلاعات سفارش</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-6">
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-muted-foreground">وضعیت پرداخت</span>
                  <span className="text-sm font-medium">
                    {paymentProgress === 100 ? "پرداخت کامل" :
                     paymentProgress > 0 ? "پرداخت جزئی" : "پرداخت نشده"}
                  </span>
                </div>
                <Progress value={paymentProgress} className={paymentStatusColor} />
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
              {order.description && (
                <div>
                  <h4 className="font-medium mb-2">توضیحات:</h4>
                  <p className="text-sm text-muted-foreground">{order.description}</p>
                </div>
              )}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>ثبت پرداخت جدید</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-6">
              <div className="grid grid-cols-2 gap-4 p-4 bg-muted rounded-lg">
                <div>
                  <p className="text-sm text-muted-foreground">مبلغ کل:</p>
                  <p className="text-lg font-medium">{order.totalAmount.toLocaleString()} تومان</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">مبلغ پرداخت شده:</p>
                  <p className="text-lg font-medium">{totalPaid.toLocaleString()} تومان</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">مبلغ باقیمانده:</p>
                  <p className="text-lg font-medium text-primary">{remainingAmount.toLocaleString()} تومان</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">درصد پیشرفت:</p>
                  <p className="text-lg font-medium">{Math.round(paymentProgress)}%</p>
                </div>
              </div>

              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="amount">مبلغ پرداختی (تومان)</Label>
                  <Input
                    id="amount"
                    type="number"
                    value={amount}
                    onChange={(e) => setAmount(e.target.value)}
                    placeholder="مبلغ را وارد کنید"
                    min="0"
                    max={remainingAmount}
                    required
                  />
                </div>

                <div className="space-y-2">
                  <Label>تاریخ پرداخت</Label>
                  <Popover>
                    <PopoverTrigger asChild>
                      <Button
                        variant="outline"
                        className="w-full justify-start text-left font-normal"
                      >
                        <CalendarIcon className="ml-2 h-4 w-4" />
                        {paymentDate ? (
                          format(paymentDate, "PPP", { locale: fa })
                        ) : (
                          <span>انتخاب تاریخ</span>
                        )}
                      </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-auto p-0" align="start">
                      <Calendar
                        mode="single"
                        selected={paymentDate}
                        onSelect={setPaymentDate}
                        initialFocus
                      />
                    </PopoverContent>
                  </Popover>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="receipt">فیش پرداخت</Label>
                  <div className="flex items-center gap-2">
                    <Input
                      id="receipt"
                      type="file"
                      accept="image/*"
                      onChange={(e) => setReceiptImage(e.target.files?.[0] || null)}
                      required
                    />
                    <Button
                      type="button"
                      variant="outline"
                      size="icon"
                      onClick={() => document.getElementById("receipt")?.click()}
                    >
                      <Upload className="h-4 w-4" />
                    </Button>
                  </div>
                </div>

                <div className="flex justify-end gap-2">
                  <Link href="/representative/orders">
                    <Button type="button" variant="outline">
                      انصراف
                    </Button>
                  </Link>
                  <Button type="submit" disabled={loading}>
                    {loading ? (
                      <>
                        <Loader2 className="ml-2 h-4 w-4 animate-spin" />
                        در حال ثبت...
                      </>
                    ) : (
                      "ثبت پرداخت"
                    )}
                  </Button>
                </div>
              </form>
            </div>
          </CardContent>
        </Card>

        <Card className="md:col-span-2">
          <CardHeader>
            <CardTitle>تاریخچه پرداخت‌ها</CardTitle>
          </CardHeader>
          <CardContent>
            {loadingPayments ? (
              <div className="space-y-4">
                {[1, 2, 3].map((i) => (
                  <div key={i} className="flex items-center justify-between p-4 border rounded-lg">
                    <div className="flex items-center gap-4">
                      <Skeleton className="w-16 h-16 rounded" />
                      <div className="space-y-2">
                        <Skeleton className="h-4 w-32" />
                        <Skeleton className="h-3 w-24" />
                      </div>
                    </div>
                    <Skeleton className="h-8 w-8 rounded-full" />
                  </div>
                ))}
              </div>
            ) : payments.length > 0 ? (
              <div className="space-y-4">
                {payments.map((payment) => (
                  <div key={payment.id} className="flex items-center justify-between p-4 border rounded-lg">
                    <div className="flex items-center gap-4">
                      <div className="relative w-16 h-16">
                        <Image
                          src={payment.receiptImage}
                          alt="فیش پرداخت"
                          fill
                          className="object-cover rounded"
                        />
                      </div>
                      <div>
                        <p className="font-medium">
                          {payment.amount.toLocaleString()} تومان
                        </p>
                        <p className="text-sm text-muted-foreground">
                          {formatDate(payment.paymentDate)}
                        </p>
                      </div>
                    </div>
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => window.open(payment.receiptImage, '_blank')}
                    >
                      <Receipt className="h-4 w-4" />
                    </Button>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-8 text-muted-foreground">
                هیچ پرداختی ثبت نشده است
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
} 