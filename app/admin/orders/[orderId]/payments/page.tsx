"use client";

import { OrderPaymentsList } from "@/components/admin/orders/order-payments-list";
import { Button } from "@/components/ui/button";
import { ArrowRight } from "lucide-react";
import Link from "next/link";

export default function OrderPaymentsPage({
  params,
}: {
  params: { orderId: string };
}) {
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">جزئیات پرداخت‌های سفارش</h1>
        <Link href="/admin/orders">
          <Button variant="outline">
            <ArrowRight className="h-4 w-4 ml-2" />
            بازگشت به لیست سفارشات
          </Button>
        </Link>
      </div>
      <OrderPaymentsList orderId={params.orderId} />
    </div>
  );
} 