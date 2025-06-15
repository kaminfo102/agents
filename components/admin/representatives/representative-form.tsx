"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import * as z from "zod";
import { Loader2, ArrowRight, Upload } from "lucide-react";
import Image from "next/image";

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
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";

// Mock list of cities in Kurdistan province
const cities = [
  "سنندج",
  "سقز",
  "مریوان",
  "بانه",
  "بیجار",
  "قروه",
  "کامیاران",
  "دیواندره",
  "دهگلان",
  "سروآباد",
];

const formSchema = z.object({
  firstName: z.string().min(2, {
    message: "نام باید حداقل 2 حرف باشد",
  }),
  lastName: z.string().min(2, {
    message: "نام خانوادگی باید حداقل 2 حرف باشد",
  }),
  fatherName: z.string().optional(),
  nationalId: z.string().length(10, {
    message: "کد ملی باید 10 رقم باشد",
  }),
  phoneNumber: z.string().length(11, {
    message: "شماره موبایل باید 11 رقم باشد",
  }),
  city: z.string().min(2, {
    message: "شهر باید انتخاب شود",
  }),
  address: z.string().optional(),
  educationCenter: z.string().optional(),
  isActive: z.boolean().default(true),
  profileImage: z.string().optional(),
});

type FormValues = z.infer<typeof formSchema>;

interface RepresentativeFormProps {
  initialData?: {
    id: string;
    firstName: string;
    lastName: string;
    fatherName?: string;
    nationalId: string;
    phoneNumber: string;
    city: string;
    address?: string;
    educationCenter?: string;
    isActive: boolean;
    profileImage?: string;
  };
}

export function RepresentativeForm({ initialData }: RepresentativeFormProps) {
  const { toast } = useToast();
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [uploading, setUploading] = useState(false);

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: initialData || {
      firstName: "",
      lastName: "",
      fatherName: "",
      nationalId: "",
      phoneNumber: "",
      city: "",
      address: "",
      educationCenter: "",
      isActive: true,
      profileImage: "",
    },
  });

  const handleProfileImageUpload = async (file: File) => {
    try {
      setUploading(true);
      const formData = new FormData();
      formData.append("file", file);

      const response = await fetch(`/api/representatives/${initialData?.id}/profile-image`, {
        method: "POST",
        body: formData,
      });

      if (!response.ok) throw new Error("Failed to upload profile image");

      const data = await response.json();
      form.setValue("profileImage", data.fileUrl);

      toast({
        title: "موفق",
        description: "تصویر پروفایل با موفقیت آپلود شد",
      });
    } catch (error) {
      toast({
        variant: "destructive",
        title: "خطا",
        description: "خطا در آپلود تصویر پروفایل",
      });
    } finally {
      setUploading(false);
    }
  };

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
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <Button
          variant="outline"
          onClick={() => router.back()}
          className="flex items-center gap-2"
        >
          <ArrowRight className="h-4 w-4" />
          بازگشت
        </Button>
      </div>

      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
          <div className="flex items-center gap-6">
            <div className="relative h-32 w-32">
              {form.watch("profileImage") ? (
                <Image
                  src={form.watch("profileImage") || ""}
                  alt="Profile"
                  fill
                  className="rounded-full object-cover"
                />
              ) : (
                <div className="h-32 w-32 rounded-full bg-muted flex items-center justify-center">
                  <span className="text-4xl">👤</span>
                </div>
              )}
            </div>
            <div className="space-y-2">
              <Button
                type="button"
                variant="outline"
                onClick={() => document.getElementById("profile-image-upload")?.click()}
                disabled={uploading}
              >
                {uploading ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  <Upload className="h-4 w-4" />
                )}
                <span className="mr-2">آپلود تصویر پروفایل</span>
              </Button>
              <input
                id="profile-image-upload"
                type="file"
                accept="image/*"
                className="hidden"
                onChange={(e) => {
                  const file = e.target.files?.[0];
                  if (file) handleProfileImageUpload(file);
                }}
              />
              <p className="text-sm text-muted-foreground">
                تصویر پروفایل نماینده را آپلود کنید
              </p>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
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
              name="fatherName"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>نام پدر</FormLabel>
                  <FormControl>
                    <Input
                      placeholder="نام پدر نماینده"
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
                  <Select onValueChange={field.onChange} defaultValue={field.value}>
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="انتخاب شهر" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {cities.map((city) => (
                        <SelectItem key={city} value={city}>
                          {city}
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
              name="address"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>آدرس</FormLabel>
                  <FormControl>
                    <Input
                      placeholder="آدرس نماینده"
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
            <FormField
              control={form.control}
              name="isActive"
              render={({ field }) => (
                <FormItem className="flex flex-row items-start space-x-3 space-y-0 rounded-md border p-4">
                  <FormControl>
                    <Checkbox
                      checked={field.value}
                      onCheckedChange={field.onChange}
                      disabled={loading}
                    />
                  </FormControl>
                  <div className="space-y-1 leading-none">
                    <FormLabel>فعال</FormLabel>
                  </div>
                </FormItem>
              )}
            />
          </div>

          <div className="flex justify-end gap-4">
            <Button
              type="button"
              variant="outline"
              onClick={() => router.back()}
              disabled={loading}
            >
              انصراف
            </Button>
            <Button
              type="submit"
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
          </div>
        </form>
      </Form>
    </div>
  );
} 