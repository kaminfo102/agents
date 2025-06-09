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

interface OrderItem {
  id: string;
  quantity: number;
  price: number;
  product: {
    title: string;
  };
}

interface DeleteOrderItemDialogProps {
  item: OrderItem;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSuccess?: () => void;
}

export function DeleteOrderItemDialog({ item, open, onOpenChange, onSuccess }: DeleteOrderItemDialogProps) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>حذف محصول از سفارش</DialogTitle>
          <DialogDescription>
            آیا از حذف این محصول از سفارش اطمینان دارید؟ این عملیات غیرقابل بازگشت است.
          </DialogDescription>
        </DialogHeader>
        <div className="py-4">
          <p className="text-sm text-muted-foreground">
            محصول: {item.product.title}
          </p>
          <p className="text-sm text-muted-foreground">
            تعداد: {item.quantity}
          </p>
          <p className="text-sm text-muted-foreground">
            قیمت واحد: {item.price.toLocaleString()} تومان
          </p>
          <p className="text-sm text-muted-foreground">
            قیمت کل: {(item.price * item.quantity).toLocaleString()} تومان
          </p>
        </div>
        <DialogFooter>
          <Button variant="ghost" onClick={() => onOpenChange(false)}>
            انصراف
          </Button>
          <Button variant="destructive" onClick={onSuccess}>
            حذف محصول
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
} 