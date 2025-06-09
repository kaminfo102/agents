"use client";

import { AdminOrderList } from "@/components/admin/orders/admin-order-list";
import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";
import { useRouter } from "next/navigation";

export default function OrdersPage() {
  const router = useRouter();

  return (
    <div className="container mx-auto px-4 py-6 space-y-6">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <h1 className="text-2xl font-bold">مدیریت سفارشات</h1>
        <Button onClick={() => router.push('/admin/orders/new')} className="w-full sm:w-auto">
          <Plus className="h-4 w-4 ml-2" />
          ثبت سفارش جدید
        </Button>
      </div>
      <div className="bg-card rounded-lg shadow-sm">
        <AdminOrderList />
      </div>
    </div>
  );
}