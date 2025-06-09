"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import * as z from "zod";
import { UserPlus, Loader2 } from "lucide-react";

import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
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
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import { eventEmitter, EVENTS } from "@/lib/events";

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
  nationalId: z.string().length(10, {
    message: "کد ملی باید 10 رقم باشد",
  }),
  phoneNumber: z.string().length(11, {
    message: "شماره موبایل باید 11 رقم باشد",
  }),
  city: z.string().min(2, {
    message: "شهر باید انتخاب شود",
  }),
  educationCenter: z.string().min(2, {
    message: "مرکز آموزشی باید حداقل 2 حرف باشد",
  }),
});

type FormValues = z.infer<typeof formSchema>;

export function AddRepresentativeButton() {
  const [open, setOpen] = useState(false);
  const { toast } = useToast();
  const router = useRouter();

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      firstName: "",
      lastName: "",
      nationalId: "",
      phoneNumber: "",
      city: "",
      educationCenter: "",
    },
  });

  const onSubmit = async (values: FormValues) => {
    try {
      const response = await fetch("/api/representatives", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(values),
      });

      if (!response.ok) {
        const error = await response.text();
        throw new Error(error);
      }

      const newRepresentative = await response.json();

      toast({
        title: "نماینده جدید ایجاد شد",
        description: "نماینده با موفقیت به سیستم اضافه شد",
      });

      setOpen(false);
      form.reset();
      
      // Emit event and refresh the page
      eventEmitter.emit(EVENTS.REPRESENTATIVE_CREATED, newRepresentative);
      router.refresh();
    } catch (error) {
      toast({
        variant: "destructive",
        title: "خطا",
        description: error instanceof Error ? error.message : "خطایی رخ داده است",
      });
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button>
          <UserPlus className="ml-2 h-4 w-4" />
          افزودن نماینده
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>افزودن نماینده جدید</DialogTitle>
          <DialogDescription>
            اطلاعات نماینده جدید را وارد کنید.
          </DialogDescription>
        </DialogHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="firstName"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>نام</FormLabel>
                    <FormControl>
                      <Input placeholder="نام نماینده" {...field} />
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
                      <Input placeholder="نام خانوادگی نماینده" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="nationalId"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>کد ملی</FormLabel>
                    <FormControl>
                      <Input placeholder="1234567890" {...field} />
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
                      <Input placeholder="09123456789" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="city"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>شهرستان</FormLabel>
                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="انتخاب شهرستان" />
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
                name="educationCenter"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>مرکز آموزشی</FormLabel>
                    <FormControl>
                      <Input placeholder="نام مرکز آموزشی" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <DialogFooter>
              <Button
                type="button"
                variant="outline"
                onClick={() => setOpen(false)}
              >
                انصراف
              </Button>
              <Button
                type="submit"
                disabled={form.formState.isSubmitting}
              >
                {form.formState.isSubmitting ? (
                  <div className="flex items-center gap-2">
                    <Loader2 className="h-4 w-4 animate-spin" />
                    در حال ثبت...
                  </div>
                ) : (
                  "ثبت نماینده"
                )}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}