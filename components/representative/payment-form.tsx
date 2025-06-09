"use client";

import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { CalendarIcon, Upload, Receipt } from "lucide-react";
import { format } from "date-fns";
import { fa } from "date-fns/locale";
import Image from "next/image";
import { formatDate } from "@/lib/date-utils";

interface Payment {
  id: string;
  amount: number;
  paymentDate: string;
  receiptImage: string;
  createdAt: string;
}

interface PaymentFormProps {
  orderId: string;
  totalAmount: number;
  onSuccess: () => void;
  onCancel: () => void;
}

export function PaymentForm({ orderId, totalAmount, onSuccess, onCancel }: PaymentFormProps) {
  const [amount, setAmount] = useState("");
  const [paymentDate, setPaymentDate] = useState<Date | undefined>(new Date());
  const [receiptImage, setReceiptImage] = useState<File | null>(null);
  const [loading, setLoading] = useState(false);
  const [payments, setPayments] = useState<Payment[]>([]);
  const { toast } = useToast();

  useEffect(() => {
    fetchPayments();
  }, [orderId]);

  const fetchPayments = async () => {
    try {
      const response = await fetch(`/api/orders/${orderId}/payments`);
      if (!response.ok) throw new Error('خطا در دریافت اطلاعات پرداخت‌ها');
      const data = await response.json();
      setPayments(data);
    } catch (error) {
      toast({
        variant: "destructive",
        title: "خطا",
        description: "دریافت اطلاعات پرداخت‌ها با مشکل مواجه شد",
      });
    }
  };

  const totalPaid = payments.reduce((sum, payment) => sum + payment.amount, 0);
  const remainingAmount = totalAmount - totalPaid;

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
      const response = await fetch(`/api/orders/${orderId}/payments`, {
        method: "POST",
        body: formData,
      });

      if (!response.ok) throw new Error("خطا در ثبت پرداخت");

      toast({
        title: "پرداخت با موفقیت ثبت شد",
        description: "پرداخت با موفقیت ثبت شد",
      });

      onSuccess();
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

  return (
    <Card>
      <CardHeader>
        <CardTitle>ثبت پرداخت</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-6">
          <div className="grid grid-cols-2 gap-4 p-4 bg-muted rounded-lg">
            <div>
              <p className="text-sm text-muted-foreground">مبلغ کل:</p>
              <p className="text-lg font-medium">{totalAmount.toLocaleString()} تومان</p>
            </div>
            <div>
              <p className="text-sm text-muted-foreground">مبلغ پرداخت شده:</p>
              <p className="text-lg font-medium">{totalPaid.toLocaleString()} تومان</p>
            </div>
            <div>
              <p className="text-sm text-muted-foreground">مبلغ باقیمانده:</p>
              <p className="text-lg font-medium text-primary">{remainingAmount.toLocaleString()} تومان</p>
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
              <Button type="button" variant="outline" onClick={onCancel}>
                انصراف
              </Button>
              <Button type="submit" disabled={loading}>
                {loading ? "در حال ثبت..." : "ثبت پرداخت"}
              </Button>
            </div>
          </form>

          {payments.length > 0 && (
            <div className="space-y-4">
              <h4 className="font-medium">تاریخچه پرداخت‌ها:</h4>
              <div className="space-y-2">
                {payments.map((payment) => (
                  <div key={payment.id} className="flex items-center justify-between p-3 border rounded-lg">
                    <div className="flex items-center gap-3">
                      <div className="relative w-12 h-12">
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
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
} 