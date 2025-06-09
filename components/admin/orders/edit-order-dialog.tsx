"use client";

import { useState } from "react";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import * as z from "zod";
import { Loader2, Plus, Minus, Trash2 } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import Image from "next/image";

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
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

const formSchema = z.object({
  status: z.string({
    required_error: "وضعیت سفارش الزامی است",
  }),
  paymentStatus: z.string({
    required_error: "وضعیت پرداخت الزامی است",
  }),
  description: z.string().optional(),
  items: z.array(
    z.object({
      id: z.string(),
      productId: z.string(),
      quantity: z.number().min(1, "تعداد باید حداقل 1 باشد"),
      price: z.number(),
    })
  ),
});

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
  status: string;
  paymentStatus: string;
  description?: string;
  items: OrderItem[];
}

interface EditOrderDialogProps {
  order: Order;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSuccess?: () => void;
}

export function EditOrderDialog({ order, open, onOpenChange, onSuccess }: EditOrderDialogProps) {
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      status: order.status,
      paymentStatus: order.paymentStatus,
      description: order.description || "",
      items: order.items.map(item => ({
        id: item.id,
        productId: item.product.id,
        quantity: item.quantity,
        price: item.price,
      })),
    },
  });

  const handleUpdateQuantity = (itemId: string, newQuantity: number) => {
    if (newQuantity < 1) return;
    const currentItems = form.getValues("items");
    form.setValue(
      "items",
      currentItems.map(item =>
        item.id === itemId ? { ...item, quantity: newQuantity } : item
      )
    );
  };

  const handleRemoveItem = (itemId: string) => {
    const currentItems = form.getValues("items");
    form.setValue(
      "items",
      currentItems.filter(item => item.id !== itemId)
    );
  };

  async function onSubmit(values: z.infer<typeof formSchema>) {
    try {
      setLoading(true);
      const response = await fetch(`/api/admin/orders/${order.id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          status: values.status,
          paymentStatus: values.paymentStatus,
          description: values.description,
          items: values.items.map(item => ({
            productId: item.productId,
            quantity: item.quantity,
            price: item.price,
          })),
        }),
      });

      if (!response.ok) {
        throw new Error("خطا در بروزرسانی سفارش");
      }

      toast({
        title: "سفارش با موفقیت بروزرسانی شد",
        description: "اطلاعات سفارش با موفقیت بروزرسانی شد",
      });

      onOpenChange(false);
      onSuccess?.();
    } catch (error) {
      toast({
        variant: "destructive",
        title: "خطا",
        description: "بروزرسانی سفارش با مشکل مواجه شد",
      });
    } finally {
      setLoading(false);
    }
  }

  const calculateTotal = () => {
    const items = form.getValues("items");
    return items.reduce((total, item) => {
      const orderItem = order.items.find(i => i.id === item.id);
      return total + (orderItem?.price || 0) * item.quantity;
    }, 0);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[600px]">
        <DialogHeader>
          <DialogTitle>ویرایش سفارش</DialogTitle>
        </DialogHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="status"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>وضعیت سفارش</FormLabel>
                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="وضعیت سفارش را انتخاب کنید" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="CONFIRMED">تایید سفارش</SelectItem>
                        <SelectItem value="PROCESSING">در حال پردازش</SelectItem>
                        <SelectItem value="SHIPPED">ارسال سفارش</SelectItem>
                        <SelectItem value="COMPLETED">تکمیل سفارش</SelectItem>
                        <SelectItem value="CANCELLED">لغو سفارش</SelectItem>
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="paymentStatus"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>وضعیت پرداخت</FormLabel>
                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="وضعیت پرداخت را انتخاب کنید" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="PAID">پرداخت شده</SelectItem>
                        <SelectItem value="PARTIALLY_PAID">پرداخت جزئی</SelectItem>
                        <SelectItem value="UNPAID">پرداخت نشده</SelectItem>
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <FormField
              control={form.control}
              name="description"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>توضیحات</FormLabel>
                  <FormControl>
                    <Textarea
                      placeholder="توضیحات سفارش را وارد کنید"
                      className="min-h-[100px]"
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="space-y-4">
              <FormLabel>محصولات سفارش</FormLabel>
              <div className="space-y-4">
                {form.getValues("items").map((item) => {
                  const orderItem = order.items.find(i => i.id === item.id);
                  if (!orderItem) return null;

                  return (
                    <div key={item.id} className="flex items-center justify-between p-4 border rounded-lg">
                      <div className="flex items-center gap-4">
                        <div className="relative h-16 w-16 overflow-hidden rounded-md">
                          <Image
                            src={orderItem.product.image}
                            alt={orderItem.product.title}
                            fill
                            className="object-cover"
                          />
                        </div>
                        <div>
                          <p className="font-medium">{orderItem.product.title}</p>
                          <p className="text-muted-foreground">
                            {orderItem.price.toLocaleString()} تومان
                          </p>
                        </div>
                      </div>
                      <div className="flex items-center gap-6">
                        <div className="flex items-center gap-2">
                          <Button
                            variant="outline"
                            size="icon"
                            onClick={() => handleUpdateQuantity(item.id, item.quantity - 1)}
                            disabled={item.quantity <= 1}
                          >
                            <Minus className="h-4 w-4" />
                          </Button>
                          <span className="w-8 text-center">{item.quantity}</span>
                          <Button
                            variant="outline"
                            size="icon"
                            onClick={() => handleUpdateQuantity(item.id, item.quantity + 1)}
                          >
                            <Plus className="h-4 w-4" />
                          </Button>
                        </div>
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => handleRemoveItem(item.id)}
                        >
                          <Trash2 className="h-4 w-4 text-red-600" />
                        </Button>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            <div className="pt-4 border-t">
              <div className="flex items-center justify-between mb-4">
                <span className="font-medium">جمع کل:</span>
                <span className="font-bold text-lg">
                  {calculateTotal().toLocaleString()} تومان
                </span>
              </div>

              <Button type="submit" className="w-full" disabled={loading}>
                {loading && <Loader2 className="h-4 w-4 ml-2 animate-spin" />}
                {loading ? "در حال بروزرسانی..." : "بروزرسانی سفارش"}
              </Button>
            </div>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
} 