"use client";

import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

interface Payment {
  id: string;
  amount: number;
  paymentDate: string;
}

interface DeletePaymentDialogProps {
  payment: Payment;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSuccess?: () => void;
}

export function DeletePaymentDialog({ payment, open, onOpenChange, onSuccess }: DeletePaymentDialogProps) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>حذف پرداخت</DialogTitle>
          <DialogDescription>
            آیا از حذف این پرداخت اطمینان دارید؟ این عملیات غیرقابل بازگشت است.
          </DialogDescription>
        </DialogHeader>
        <div className="py-4">
          <p className="text-sm text-muted-foreground">
            مبلغ پرداخت: {payment.amount.toLocaleString()} تومان
          </p>
          <p className="text-sm text-muted-foreground">
            تاریخ پرداخت: {new Date(payment.paymentDate).toLocaleDateString('fa-IR')}
          </p>
        </div>
        <DialogFooter>
          <Button variant="ghost" onClick={() => onOpenChange(false)}>
            انصراف
          </Button>
          <Button variant="destructive" onClick={onSuccess}>
            حذف پرداخت
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
} 