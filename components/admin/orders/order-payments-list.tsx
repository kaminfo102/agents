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
import { formatJalaliDate } from "@/lib/date-utils";
import { useToast } from "@/hooks/use-toast";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";

interface Payment {
  id: string;
  amount: number;
  receiptImage: string;
  paymentDate: string;
  createdAt: string;
}

interface OrderPaymentsListProps {
  orderId: string;
}

export function OrderPaymentsList({ orderId }: OrderPaymentsListProps) {
  const [payments, setPayments] = useState<Payment[]>([]);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  useEffect(() => {
    fetchPayments();
  }, [orderId]);

  const fetchPayments = async () => {
    try {
      const response = await fetch(`/api/admin/orders/${orderId}/payments`);
      if (!response.ok) {
        throw new Error("خطا در دریافت اطلاعات پرداخت");
      }
      const data = await response.json();
      setPayments(data);
    } catch (error) {
      toast({
        variant: "destructive",
        title: "خطا",
        description: "دریافت اطلاعات پرداخت با مشکل مواجه شد",
      });
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>لیست پرداخت‌ها</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <Skeleton className="h-8 w-full" />
            <Skeleton className="h-8 w-full" />
            <Skeleton className="h-8 w-full" />
          </div>
        </CardContent>
      </Card>
    );
  }

  if (payments.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>لیست پرداخت‌ها</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-center text-muted-foreground">
            پرداختی برای این سفارش ثبت نشده است
          </p>
        </CardContent>
      </Card>
    );
  }

  const totalAmount = payments.reduce((sum, payment) => sum + payment.amount, 0);

  return (
    <Card>
      <CardHeader>
        <CardTitle>لیست پرداخت‌ها</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="rounded-md border">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>تاریخ پرداخت</TableHead>
                <TableHead>مبلغ</TableHead>
                <TableHead>تصویر رسید</TableHead>
                <TableHead>تاریخ ثبت</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {payments.map((payment) => (
                <TableRow key={payment.id}>
                  <TableCell>{formatJalaliDate(payment.paymentDate)}</TableCell>
                  <TableCell>{payment.amount.toLocaleString()} تومان</TableCell>
                  <TableCell>
                    {payment.receiptImage ? (
                      <a
                        href={payment.receiptImage}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-blue-600 hover:underline"
                      >
                        مشاهده رسید
                      </a>
                    ) : (
                      <span className="text-muted-foreground">بدون رسید</span>
                    )}
                  </TableCell>
                  <TableCell>{formatJalaliDate(payment.createdAt)}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
        <div className="mt-4 text-left">
          <p className="text-lg font-semibold">
            مجموع پرداخت‌ها: {totalAmount.toLocaleString()} تومان
          </p>
        </div>
      </CardContent>
    </Card>
  );
} 