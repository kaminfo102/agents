"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import * as z from "zod";
import { Loader2 } from "lucide-react";

import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { useToast } from "@/hooks/use-toast";

const formSchema = z.object({
  firstName: z.string().min(2, {
    message: "نام باید حداقل 2 حرف باشد",
  }),
  lastName: z.string().min(2, {
    message: "نام خانوادگی باید حداقل 2 حرف باشد",
  }),
  nationalId: z.string().length(10, {
    message: "کد ملی باید 10 رقم باشد",
  }),
  phoneNumber: z.string().length(11, {
    message: "شماره موبایل باید 11 رقم باشد",
  }),
  city: z.string().min(2, {
    message: "شهر باید حداقل 2 حرف باشد",
  }),
  educationCenter: z.string().min(2, {
    message: "مرکز آموزشی باید حداقل 2 حرف باشد",
  }),
});

type FormValues = z.infer<typeof formSchema>;

interface RepresentativeFormProps {
  initialData?: {
    id: string;
    firstName: string;
    lastName: string;
    nationalId: string;
    phoneNumber: string;
    city: string;
    educationCenter: string;
  };
}

export function RepresentativeForm({ initialData }: RepresentativeFormProps) {
  const { toast } = useToast();
  const router = useRouter();
  const [loading, setLoading] = useState(false);

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: initialData || {
      firstName: "",
      lastName: "",
      nationalId: "",
      phoneNumber: "",
      city: "",
      educationCenter: "",
    },
  });

  async function onSubmit(values: FormValues) {
    try {
      setLoading(true);

      const url = initialData
        ? `/api/representatives/${initialData.id}`
        : "/api/representatives";
      
      const method = initialData ? "PATCH" : "POST";

      const response = await fetch(url, {
        method,
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(values),
      });

      if (!response.ok) {
        throw new Error("خطا در ذخیره اطلاعات نماینده");
      }

      toast({
        title: initialData ? "نماینده بروزرسانی شد" : "نماینده جدید ایجاد شد",
        description: initialData
          ? "اطلاعات نماینده با موفقیت بروزرسانی شد"
          : "نماینده جدید با موفقیت ایجاد شد",
      });

      router.push("/admin/representatives");
      router.refresh();
    } catch (error) {
      toast({
        variant: "destructive",
        title: "خطا",
        description: "خطایی رخ داده است. لطفا دوباره تلاش کنید",
      });
    } finally {
      setLoading(false);
    }
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <FormField
            control={form.control}
            name="firstName"
            render={({ field }) => (
              <FormItem>
                <FormLabel>نام</FormLabel>
                <FormControl>
                  <Input
                    placeholder="نام نماینده"
                    {...field}
                    disabled={loading}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="lastName"
            render={({ field }) => (
              <FormItem>
                <FormLabel>نام خانوادگی</FormLabel>
                <FormControl>
                  <Input
                    placeholder="نام خانوادگی نماینده"
                    {...field}
                    disabled={loading}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="nationalId"
            render={({ field }) => (
              <FormItem>
                <FormLabel>کد ملی</FormLabel>
                <FormControl>
                  <Input
                    placeholder="کد ملی نماینده"
                    {...field}
                    disabled={loading}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="phoneNumber"
            render={({ field }) => (
              <FormItem>
                <FormLabel>شماره موبایل</FormLabel>
                <FormControl>
                  <Input
                    placeholder="شماره موبایل نماینده"
                    {...field}
                    disabled={loading}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="city"
            render={({ field }) => (
              <FormItem>
                <FormLabel>شهر</FormLabel>
                <FormControl>
                  <Input
                    placeholder="شهر نماینده"
                    {...field}
                    disabled={loading}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="educationCenter"
            render={({ field }) => (
              <FormItem>
                <FormLabel>مرکز آموزشی</FormLabel>
                <FormControl>
                  <Input
                    placeholder="مرکز آموزشی نماینده"
                    {...field}
                    disabled={loading}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>
        <Button
          type="submit"
          className="w-full"
          disabled={loading}
        >
          {loading ? (
            <div className="flex items-center gap-2">
              <Loader2 className="h-4 w-4 animate-spin" />
              {initialData ? "در حال بروزرسانی..." : "در حال ایجاد..."}
            </div>
          ) : (
            initialData ? "بروزرسانی نماینده" : "ایجاد نماینده جدید"
          )}
        </Button>
      </form>
    </Form>
  );
} 