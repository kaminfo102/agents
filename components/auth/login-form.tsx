"use client";

import { useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import * as z from "zod";
import { Eye, EyeOff, LogIn } from "lucide-react";
import { signIn, useSession } from "next-auth/react";

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
  nationalId: z.string().length(10, {
    message: "کد ملی باید 10 رقم باشد",
  }),
  phoneNumber: z.string().length(11, {
    message: "شماره موبایل باید 11 رقم باشد",
  }),
});

type FormValues = z.infer<typeof formSchema>;

export function LoginForm() {
  const { toast } = useToast();
  const router = useRouter();
  const searchParams = useSearchParams();
  const { data: session } = useSession();
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      nationalId: "",
      phoneNumber: "",
    },
  });

  async function onSubmit(values: FormValues) {
    try {
      setIsLoading(true);
      
      const callbackUrl = searchParams.get("callbackUrl") || 
        (values.nationalId === "1234567890" ? "/admin/dashboard" : "/representative/dashboard");

      const result = await signIn("credentials", {
        nationalId: values.nationalId,
        phoneNumber: values.phoneNumber,
        redirect: false,
        callbackUrl,
      });

      if (result?.error) {
        toast({
          variant: "destructive",
          title: "خطا در ورود",
          description: result.error,
        });
        return;
      }

      toast({
        title: "ورود موفقیت‌آمیز",
        description: "به سامانه مدیریت نمایندگان خوش آمدید",
      });

      // Force a hard navigation to ensure session is updated
      window.location.href = callbackUrl;
    } catch (error) {
      toast({
        variant: "destructive",
        title: "خطا در ورود",
        description: "خطایی رخ داده است. لطفا دوباره تلاش کنید",
      });
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
        <FormField
          control={form.control}
          name="nationalId"
          render={({ field }) => (
            <FormItem>
              <FormLabel>کد ملی</FormLabel>
              <FormControl>
                <Input
                  placeholder="کد ملی خود را وارد کنید"
                  {...field}
                  disabled={isLoading}
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
                <div className="relative">
                  <Input
                    type={showPassword ? "text" : "password"}
                    placeholder="شماره موبایل خود را وارد کنید"
                    {...field}
                    disabled={isLoading}
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute left-2 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                  >
                    {showPassword ? (
                      <EyeOff className="h-4 w-4" />
                    ) : (
                      <Eye className="h-4 w-4" />
                    )}
                  </button>
                </div>
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <Button
          type="submit"
          className="w-full"
          disabled={isLoading}
        >
          {isLoading ? (
            <div className="flex items-center gap-2">
              <div className="h-4 w-4 animate-spin rounded-full border-2 border-background border-t-transparent" />
              در حال ورود...
            </div>
          ) : (
            <div className="flex items-center gap-2">
              <LogIn className="h-4 w-4" />
              ورود به سیستم
            </div>
          )}
        </Button>
      </form>
    </Form>
  );
}