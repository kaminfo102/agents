"use client";

import { useState } from "react";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import * as z from "zod";
import { Loader2 } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";

const formSchema = z.object({
  amount: z.string().min(1, "مبلغ پرداخت الزامی است"),
  paymentDate: z.string().min(1, "تاریخ پرداخت الزامی است"),
  receiptImage: z.string().min(1, "تصویر رسید پرداخت الزامی است"),
});

interface AddPaymentDialogProps {
  orderId: string;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSuccess?: () => void;
}

export function AddPaymentDialog({ orderId, open, onOpenChange, onSuccess }: AddPaymentDialogProps) {
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      amount: "",
      paymentDate: "",
      receiptImage: "",
    },
  });

  const onSubmit = async (values: z.infer<typeof formSchema>) => {
    try {
      setLoading(true);
      const response = await fetch(`/api/admin/payments`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          orderId,
          amount: parseFloat(values.amount),
          paymentDate: values.paymentDate,
          receiptImage: values.receiptImage,
        }),
      });

      if (!response.ok) throw new Error('خطا در ثبت پرداخت');
      
      toast({
        title: "پرداخت ثبت شد",
        description: "پرداخت با موفقیت ثبت شد",
      });
      
      onSuccess?.();
      onOpenChange(false);
      form.reset();
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
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>ثبت پرداخت جدید</DialogTitle>
        </DialogHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <FormField
              control={form.control}
              name="amount"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>مبلغ پرداخت (تومان)</FormLabel>
                  <FormControl>
                    <Input type="number" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="paymentDate"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>تاریخ پرداخت</FormLabel>
                  <FormControl>
                    <Input type="date" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="receiptImage"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>تصویر رسید پرداخت</FormLabel>
                  <FormControl>
                    <Input type="file" accept="image/*" onChange={(e) => {
                      const file = e.target.files?.[0];
                      if (file) {
                        const reader = new FileReader();
                        reader.onloadend = () => {
                          field.onChange(reader.result);
                        };
                        reader.readAsDataURL(file);
                      }
                    }} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="flex justify-end">
              <Button type="submit" disabled={loading}>
                {loading && <Loader2 className="h-4 w-4 ml-2 animate-spin" />}
                ثبت پرداخت
              </Button>
            </div>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
} 