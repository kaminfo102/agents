import { OrderStatusSummary } from "@/components/representative/order-status-summary";
import { NotificationsList } from "@/components/representative/notifications-list";

export default function RepresentativeDashboard() {
  return (
    <div className="container mx-auto py-6">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <OrderStatusSummary />
        <NotificationsList />
      </div>
    </div>
  );
}