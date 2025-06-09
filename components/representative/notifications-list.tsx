"use client";

import { formatDistanceJalali } from "@/lib/date-utils";
import { Bell, Check, Info, AlertTriangle } from "lucide-react";
import { Button } from "@/components/ui/button";

// Mock data for demonstration
const notifications = [
  {
    id: "1",
    title: "سفارش جدید تایید شد",
    message: "سفارش شماره ۱۲۳۴۵ تایید و برای ارسال آماده‌سازی شد.",
    date: new Date(Date.now() - 1000 * 60 * 30), // 30 minutes ago
    read: false,
    type: "success",
  },
  {
    id: "2",
    title: "پیام جدید از مدیریت",
    message: "لطفا با بخش پشتیبانی تماس بگیرید.",
    date: new Date(Date.now() - 1000 * 60 * 60 * 2), // 2 hours ago
    read: true,
    type: "info",
  },
  {
    id: "3",
    title: "محصول جدید اضافه شد",
    message: "محصول جدید «کتاب ریاضی پایه هفتم» به فهرست محصولات اضافه شد.",
    date: new Date(Date.now() - 1000 * 60 * 60 * 24), // 1 day ago
    read: true,
    type: "info",
  },
  {
    id: "4",
    title: "هشدار موجودی",
    message: "برخی از محصولات سفارش شما موجود نیست.",
    date: new Date(Date.now() - 1000 * 60 * 60 * 24 * 2), // 2 days ago
    read: false,
    type: "warning",
  },
];

function NotificationIcon({ type }: { type: string }) {
  switch (type) {
    case "success":
      return <Check className="h-5 w-5 text-success" />;
    case "warning":
      return <AlertTriangle className="h-5 w-5 text-warning" />;
    case "info":
    default:
      return <Info className="h-5 w-5 text-primary" />;
  }
}

export function NotificationsList() {
  return (
    <div className="space-y-4">
      {notifications.length === 0 ? (
        <div className="text-center py-6">
          <Bell className="h-8 w-8 text-muted-foreground mx-auto mb-2" />
          <p className="text-muted-foreground">هیچ اعلانی وجود ندارد.</p>
        </div>
      ) : (
        <div className="space-y-3">
          {notifications.map((notification) => (
            <div
              key={notification.id}
              className={`p-3 rounded-lg border ${
                notification.read ? "bg-card" : "bg-accent/20"
              } hover:bg-accent/40 transition-colors`}
            >
              <div className="flex items-start gap-3">
                <div className="flex-shrink-0 mt-1">
                  <NotificationIcon type={notification.type} />
                </div>
                
                <div className="flex-1 min-w-0">
                  <div className="flex justify-between items-start">
                    <p className="font-medium">{notification.title}</p>
                    <span className="text-xs text-muted-foreground whitespace-nowrap mr-2">
                      {formatDistanceJalali(notification.date)}
                    </span>
                  </div>
                  
                  <p className="text-sm text-muted-foreground mt-1">
                    {notification.message}
                  </p>
                </div>
              </div>
            </div>
          ))}
          
          <div className="text-center mt-4">
            <Button variant="outline" size="sm">
              مشاهده همه اعلانات
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}