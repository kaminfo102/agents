"use client";

import { useState } from "react";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import * as z from "zod";
import { Plus, Loader2, Upload, X } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import Image from "next/image";

import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
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
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

const formSchema = z.object({
  title: z.string().min(2, {
    message: "عنوان محصول باید حداقل 2 کاراکتر باشد",
  }),
  description: z.string().min(10, {
    message: "توضیحات محصول باید حداقل 10 کاراکتر باشد",
  }),
  price: z.string().min(1, {
    message: "قیمت محصول الزامی است",
  }),
  category: z.string({
    required_error: "دسته‌بندی محصول الزامی است",
  }),
  stock: z.string().min(1, {
    message: "موجودی محصول الزامی است",
  }),
  image: z.string().min(1, {
    message: "تصویر محصول الزامی است",
  }),
});

const categories = [
  { id: "electronics", name: "الکترونیک" },
  { id: "clothing", name: "پوشاک" },
  { id: "books", name: "کتاب" },
  { id: "home", name: "خانه و آشپزخانه" },
];

interface AddProductButtonProps {
  onSuccess?: () => void;
}

export function AddProductButton({ onSuccess }: AddProductButtonProps) {
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const { toast } = useToast();

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      title: "",
      description: "",
      price: "",
      category: "",
      stock: "",
      image: "",
    },
  });

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setImagePreview(reader.result as string);
        form.setValue("image", reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const removeImage = () => {
    setImagePreview(null);
    form.setValue("image", "");
  };

  async function onSubmit(values: z.infer<typeof formSchema>) {
    try {
      setLoading(true);
      const response = await fetch("/api/products", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          ...values,
          price: parseFloat(values.price),
          stock: parseInt(values.stock),
        }),
      });

      if (!response.ok) {
        throw new Error("خطا در ایجاد محصول");
      }

      toast({
        title: "محصول با موفقیت ایجاد شد",
        description: "محصول جدید به لیست محصولات اضافه شد",
      });

      form.reset();
      setImagePreview(null);
      setOpen(false);
      onSuccess?.();
    } catch (error) {
      toast({
        variant: "destructive",
        title: "خطا",
        description: "ایجاد محصول با مشکل مواجه شد",
      });
    } finally {
      setLoading(false);
    }
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button>
          <Plus className="h-4 w-4 ml-2" />
          افزودن محصول
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[600px]">
        <DialogHeader>
          <DialogTitle>افزودن محصول جدید</DialogTitle>
        </DialogHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="title"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>عنوان محصول</FormLabel>
                    <FormControl>
                      <Input placeholder="عنوان محصول را وارد کنید" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="category"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>دسته‌بندی</FormLabel>
                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="دسته‌بندی را انتخاب کنید" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {categories.map((category) => (
                          <SelectItem key={category.id} value={category.id}>
                            {category.name}
                          </SelectItem>
                        ))}
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
                      placeholder="توضیحات محصول را وارد کنید"
                      className="min-h-[100px]"
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="grid grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="price"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>قیمت (تومان)</FormLabel>
                    <FormControl>
                      <Input
                        type="number"
                        placeholder="قیمت محصول را وارد کنید"
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="stock"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>موجودی</FormLabel>
                    <FormControl>
                      <Input
                        type="number"
                        placeholder="موجودی محصول را وارد کنید"
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <FormField
              control={form.control}
              name="image"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>تصویر محصول</FormLabel>
                  <FormControl>
                    <div className="space-y-4">
                      {imagePreview ? (
                        <div className="relative w-full h-[200px] rounded-lg overflow-hidden">
                          <Image
                            src={imagePreview}
                            alt="Preview"
                            fill
                            className="object-cover"
                          />
                          <Button
                            type="button"
                            variant="destructive"
                            size="icon"
                            className="absolute top-2 right-2"
                            onClick={removeImage}
                          >
                            <X className="h-4 w-4" />
                          </Button>
                        </div>
                      ) : (
                        <div className="border-2 border-dashed rounded-lg p-8 text-center">
                          <Input
                            type="file"
                            accept="image/*"
                            className="hidden"
                            id="image-upload"
                            onChange={handleImageChange}
                          />
                          <label
                            htmlFor="image-upload"
                            className="cursor-pointer flex flex-col items-center gap-2"
                          >
                            <Upload className="h-8 w-8 text-muted-foreground" />
                            <span className="text-sm text-muted-foreground">
                              برای آپلود تصویر کلیک کنید
                            </span>
                          </label>
                        </div>
                      )}
                    </div>
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <Button type="submit" className="w-full" disabled={loading}>
              {loading && <Loader2 className="h-4 w-4 ml-2 animate-spin" />}
              {loading ? "در حال ایجاد..." : "ایجاد محصول"}
            </Button>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}