"use client";

import { useState, useEffect } from "react";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import * as z from "zod";
import { Loader2, Plus, Minus, Trash2, ArrowRight } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import Image from "next/image";
import { useRouter } from "next/navigation";

import { Button } from "@/components/ui/button";
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
import { Input } from "@/components/ui/input";

const formSchema = z.object({
  representativeId: z.string({
    required_error: "انتخاب نماینده الزامی است",
  }),
  description: z.string().optional(),
  items: z.array(
    z.object({
      productId: z.string({
        required_error: "انتخاب محصول الزامی است",
      }),
      quantity: z.number().min(1, "تعداد باید حداقل 1 باشد"),
    })
  ).min(1, "حداقل یک محصول باید انتخاب شود"),
});

interface Product {
  id: string;
  title: string;
  price: number;
  image: string;
}

interface Representative {
  id: string;
  firstName: string;
  lastName: string;
  phoneNumber: string;
}

export default function NewOrderPage() {
  const [loading, setLoading] = useState(false);
  const [products, setProducts] = useState<Product[]>([]);
  const [representatives, setRepresentatives] = useState<Representative[]>([]);
  const [selectedItems, setSelectedItems] = useState<Array<{ productId: string; quantity: number }>>([]);
  const { toast } = useToast();
  const router = useRouter();

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      description: "",
      items: [],
    },
  });

  useEffect(() => {
    fetchProducts();
    fetchRepresentatives();
  }, []);

  const fetchProducts = async () => {
    try {
      const response = await fetch('/api/products');
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

  const fetchRepresentatives = async () => {
    try {
      const response = await fetch('/api/representatives');
      if (!response.ok) throw new Error('خطا در دریافت نمایندگان');
      const data = await response.json();
      setRepresentatives(data);
    } catch (error) {
      toast({
        variant: "destructive",
        title: "خطا",
        description: "دریافت لیست نمایندگان با مشکل مواجه شد",
      });
    }
  };

  const handleAddItem = () => {
    setSelectedItems([...selectedItems, { productId: "", quantity: 1 }]);
  };

  const handleRemoveItem = (index: number) => {
    setSelectedItems(selectedItems.filter((_, i) => i !== index));
  };

  const handleUpdateItem = (index: number, field: "productId" | "quantity", value: string | number) => {
    const newItems = [...selectedItems];
    newItems[index] = {
      ...newItems[index],
      [field]: field === "quantity" ? Number(value) : value,
    };
    setSelectedItems(newItems);
    form.setValue("items", newItems);
  };

  const calculateTotal = () => {
    return selectedItems.reduce((total, item) => {
      const product = products.find(p => p.id === item.productId);
      return total + (product?.price || 0) * item.quantity;
    }, 0);
  };

  async function onSubmit(values: z.infer<typeof formSchema>) {
    try {
      setLoading(true);
      const response = await fetch('/api/admin/orders', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(values),
      });

      if (!response.ok) {
        throw new Error('خطا در ثبت سفارش');
      }

      toast({
        title: "سفارش با موفقیت ثبت شد",
        description: "سفارش جدید با موفقیت ثبت شد",
      });

      router.push('/admin/orders');
    } catch (error) {
      toast({
        variant: "destructive",
        title: "خطا",
        description: "ثبت سفارش با مشکل مواجه شد",
      });
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="container mx-auto px-4 py-6 space-y-6">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <h1 className="text-2xl font-bold">ثبت سفارش جدید</h1>
        <Button variant="outline" onClick={() => router.push('/admin/orders')} className="w-full sm:w-auto">
          <ArrowRight className="h-4 w-4 ml-2" />
          بازگشت به لیست سفارشات
        </Button>
      </div>

      <div className="bg-card rounded-lg shadow-sm p-4 sm:p-6">
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
            <div className="space-y-6">
              <FormField
                control={form.control}
                name="representativeId"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-base">نماینده</FormLabel>
                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                      <FormControl>
                        <SelectTrigger className="h-12 text-base">
                          <SelectValue placeholder="نماینده را انتخاب کنید" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {representatives.map((rep) => (
                          <SelectItem key={rep.id} value={rep.id} className="text-base py-3">
                            {rep.firstName} {rep.lastName} - {rep.phoneNumber}
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
                name="description"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-base">توضیحات</FormLabel>
                    <FormControl>
                      <Textarea
                        placeholder="توضیحات سفارش را وارد کنید"
                        className="min-h-[120px] text-base"
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <div className="space-y-6">
              <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                <FormLabel className="text-base">محصولات</FormLabel>
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={handleAddItem}
                  className="w-full sm:w-auto h-12 text-base"
                >
                  <Plus className="h-5 w-5 ml-2" />
                  افزودن محصول
                </Button>
              </div>

              <div className="space-y-6">
                {selectedItems.map((item, index) => {
                  const product = products.find(p => p.id === item.productId);
                  return (
                    <div key={index} className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-6 p-4 border rounded-lg bg-background/50">
                      <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4 w-full sm:w-auto">
                        {product && (
                          <div className="relative h-24 w-24 sm:h-20 sm:w-20 overflow-hidden rounded-lg border">
                            <Image
                              src={product.image}
                              alt={product.title}
                              fill
                              className="object-cover"
                            />
                          </div>
                        )}
                        <div className="flex-1 w-full sm:w-auto">
                          <Select
                            value={item.productId}
                            onValueChange={(value) => handleUpdateItem(index, "productId", value)}
                          >
                            <SelectTrigger className="h-12 text-base">
                              <SelectValue placeholder="محصول را انتخاب کنید" />
                            </SelectTrigger>
                            <SelectContent>
                              {products.map((product) => (
                                <SelectItem key={product.id} value={product.id} className="text-base py-3">
                                  <div className="flex items-center gap-2">
                                    <span>{product.title}</span>
                                    <span className="text-muted-foreground">
                                      {product.price.toLocaleString()} تومان
                                    </span>
                                  </div>
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                        </div>
                      </div>
                      <div className="flex items-center gap-4 w-full sm:w-auto">
                        <div className="flex items-center gap-3 flex-1 sm:flex-none">
                          <Button
                            type="button"
                            variant="outline"
                            size="icon"
                            onClick={() => handleUpdateItem(index, "quantity", item.quantity - 1)}
                            disabled={item.quantity <= 1}
                            className="h-12 w-12"
                          >
                            <Minus className="h-5 w-5" />
                          </Button>
                          <Input
                            type="number"
                            min="1"
                            value={item.quantity}
                            onChange={(e) => handleUpdateItem(index, "quantity", parseInt(e.target.value))}
                            className="w-24 h-12 text-center text-base"
                          />
                          <Button
                            type="button"
                            variant="outline"
                            size="icon"
                            onClick={() => handleUpdateItem(index, "quantity", item.quantity + 1)}
                            className="h-12 w-12"
                          >
                            <Plus className="h-5 w-5" />
                          </Button>
                        </div>
                        <Button
                          type="button"
                          variant="ghost"
                          size="icon"
                          onClick={() => handleRemoveItem(index)}
                          className="h-12 w-12"
                        >
                          <Trash2 className="h-5 w-5 text-red-600" />
                        </Button>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            <div className="pt-6 border-t space-y-6">
              <div className="flex items-center justify-between">
                <span className="font-medium text-base">جمع کل:</span>
                <span className="font-bold text-xl">
                  {calculateTotal().toLocaleString()} تومان
                </span>
              </div>

              <Button type="submit" className="w-full h-14 text-base" disabled={loading}>
                {loading && <Loader2 className="h-5 w-5 ml-2 animate-spin" />}
                {loading ? "در حال ثبت..." : "ثبت سفارش"}
              </Button>
            </div>
          </form>
        </Form>
      </div>
    </div>
  );
} 