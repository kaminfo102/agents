"use client";

import { useState, useEffect } from "react";
import { Loader2 } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import Image from "next/image";
import { formatJalaliDate } from "@/lib/date-utils";

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

interface Payment {
  id: string;
  amount: number;
  receiptImage: string;
  paymentDate: string;
  createdAt: string;
}

interface PaymentDetailsDialogProps {
  orderId: string;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function PaymentDetailsDialog({
  orderId,
  open,
  onOpenChange,
}: PaymentDetailsDialogProps) {
  const [loading, setLoading] = useState(true);
  const [payments, setPayments] = useState<Payment[]>([]);
  const { toast } = useToast();

  useEffect(() => {
    if (open) {
      fetchPayments();
    }
  }, [open, orderId]);

  const fetchPayments = async () => {
    try {
      setLoading(true);
      console.log('Fetching payments for order:', orderId);
      
      const response = await fetch(`/api/admin/orders/${orderId}/payments`);
      console.log('Response status:', response.status);
      
      if (!response.ok) {
        const errorData = await response.json().catch(() => null);
        console.error('Error response:', errorData);
        throw new Error(errorData?.message || `خطا در دریافت اطلاعات پرداخت (${response.status})`);
      }
      
      const data = await response.json();
      console.log('Received payments data:', data);
      setPayments(data);
    } catch (error) {
      console.error('Error fetching payments:', error);
      toast({
        variant: "destructive",
        title: "خطا",
        description: error instanceof Error ? error.message : "دریافت اطلاعات پرداخت با مشکل مواجه شد",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[800px]">
        <DialogHeader>
          <DialogTitle>جزئیات پرداخت</DialogTitle>
        </DialogHeader>

        {loading ? (
          <div className="flex items-center justify-center py-8">
            <Loader2 className="h-8 w-8 animate-spin" />
          </div>
        ) : payments.length === 0 ? (
          <div className="text-center py-8 text-muted-foreground">
            هیچ پرداختی ثبت نشده است
          </div>
        ) : (
          <div className="space-y-4">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>تاریخ پرداخت</TableHead>
                  <TableHead>مبلغ</TableHead>
                  <TableHead>تصویر فیش</TableHead>
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
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => window.open(payment.receiptImage, '_blank')}
                        >
                          مشاهده فیش
                        </Button>
                      ) : (
                        <span className="text-muted-foreground">بدون فیش</span>
                      )}
                    </TableCell>
                    <TableCell>{formatJalaliDate(payment.createdAt)}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>

            <div className="flex items-center justify-between">
              <span className="font-medium">جمع کل پرداختی:</span>
              <span className="font-bold text-lg">
                {payments.reduce((total, payment) => total + payment.amount, 0).toLocaleString()} تومان
              </span>
            </div>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
} 