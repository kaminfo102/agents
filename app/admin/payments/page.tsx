import { AdminPaymentList } from "@/components/admin/payments/admin-payment-list";

export default function AdminPaymentsPage() {
  return (
    <div className="container mx-auto py-6">
      <h1 className="text-2xl font-bold mb-6">لیست پرداخت‌های نمایندگان</h1>
      <AdminPaymentList />
    </div>
  );
} 