"use client";

import { useState, useEffect } from "react";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import * as z from "zod";
import { Loader2 } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Input } from "@/components/ui/input";

const formSchema = z.object({
  productId: z.string({
    required_error: "انتخاب محصول الزامی است",
  }),
  quantity: z.string().refine((val) => !isNaN(Number(val)) && Number(val) > 0, {
    message: "تعداد باید عدد مثبت باشد",
  }),
  price: z.string().refine((val) => !isNaN(Number(val)) && Number(val) > 0, {
    message: "قیمت باید عدد مثبت باشد",
  }),
});

interface Product {
  id: string;
  title: string;
  price: number;
}

interface AddOrderItemDialogProps {
  orderId: string;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSuccess: () => void;
}

export function AddOrderItemDialog({
  orderId,
  open,
  onOpenChange,
  onSuccess,
}: AddOrderItemDialogProps) {
  const [loading, setLoading] = useState(false);
  const [products, setProducts] = useState<Product[]>([]);
  const { toast } = useToast();

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      productId: "",
      quantity: "1",
      price: "",
    },
  });

  useEffect(() => {
    if (open) {
      fetchProducts();
    }
  }, [open]);

  const fetchProducts = async () => {
    try {
      const response = await fetch('/api/admin/products');
      if (!response.ok) throw new Error('خطا در دریافت محصولات');
      const data = await response.json();
      setProducts(data);
    } catch (error) {
      toast({
        variant: "destructive",
        title: "خطا",
        description: "دریافت لیست محصولات با مشکل مواجه شد",
      });
    }
  };

  const onSubmit = async (values: z.infer<typeof formSchema>) => {
    try {
      setLoading(true);
      const response = await fetch(`/api/admin/orders/${orderId}/items`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          productId: values.productId,
          quantity: parseInt(values.quantity),
          price: parseInt(values.price),
        }),
      });

      if (!response.ok) throw new Error('خطا در افزودن محصول');
      
      toast({
        title: "محصول اضافه شد",
        description: "محصول با موفقیت به سفارش اضافه شد",
      });
      onSuccess();
      onOpenChange(false);
      form.reset();
    } catch (error) {
      toast({
        variant: "destructive",
        title: "خطا",
        description: "افزودن محصول با مشکل مواجه شد",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleProductChange = (productId: string) => {
    const selectedProduct = products.find(p => p.id === productId);
    if (selectedProduct) {
      form.setValue('price', selectedProduct.price.toString());
    }
  };

  const calculateTotalPrice = () => {
    const quantity = parseInt(form.watch('quantity') || '0');
    const price = parseInt(form.watch('price') || '0');
    return (quantity * price).toLocaleString();
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>افزودن محصول به سفارش</DialogTitle>
          <DialogDescription>
            محصول مورد نظر را انتخاب کنید و تعداد و قیمت را مشخص کنید
          </DialogDescription>
        </DialogHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <FormField
              control={form.control}
              name="productId"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>محصول</FormLabel>
                  <Select
                    onValueChange={(value) => {
                      field.onChange(value);
                      handleProductChange(value);
                    }}
                    defaultValue={field.value}
                  >
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="انتخاب محصول" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {products.map((product) => (
                        <SelectItem key={product.id} value={product.id}>
                          {product.title}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="quantity"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>تعداد</FormLabel>
                  <FormControl>
                    <Input
                      type="number"
                      min="1"
                      {...field}
                      onChange={(e) => {
                        field.onChange(e.target.value);
                        form.trigger('quantity');
                      }}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="price"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>قیمت واحد (تومان)</FormLabel>
                  <FormControl>
                    <Input
                      type="number"
                      min="0"
                      {...field}
                      onChange={(e) => {
                        field.onChange(e.target.value);
                        form.trigger('price');
                      }}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="flex justify-between items-center p-4 bg-muted rounded-lg">
              <span className="font-medium">قیمت کل:</span>
              <span className="text-lg font-bold">{calculateTotalPrice()} تومان</span>
            </div>

            <DialogFooter>
              <Button type="submit" disabled={loading}>
                {loading && <Loader2 className="h-4 w-4 ml-2 animate-spin" />}
                افزودن محصول
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
} 