"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";
import { Plus, Minus, Trash2, ArrowRight } from "lucide-react";
import Link from "next/link";

interface OrderItem {
  id: string;
  quantity: number;
  price: number;
  product: {
    id: string;
    title: string;
    image: string;
  };
}

interface Order {
  id: string;
  status: string;
  totalAmount: number;
  description?: string;
  createdAt: string;
  items: OrderItem[];
}

export default function EditOrderPage({ params }: { params: { orderId: string } }) {
  const [order, setOrder] = useState<Order | null>(null);
  const [description, setDescription] = useState("");
  const [editingItems, setEditingItems] = useState<OrderItem[]>([]);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();
  const router = useRouter();

  useEffect(() => {
    fetchOrder();
  }, [params.orderId]);

  const fetchOrder = async () => {
    try {
      const response = await fetch(`/api/orders/${params.orderId}`);
      if (!response.ok) throw new Error('خطا در دریافت اطلاعات');
      const data = await response.json();
      setOrder(data);
      setDescription(data.description || "");
      setEditingItems([...data.items]);
    } catch (error) {
      toast({
        variant: "destructive",
        title: "خطا",
        description: "دریافت اطلاعات سفارش با مشکل مواجه شد",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateQuantity = (itemId: string, newQuantity: number) => {
    if (newQuantity < 1) return;
    setEditingItems(prevItems =>
      prevItems.map(item =>
        item.id === itemId ? { ...item, quantity: newQuantity } : item
      )
    );
  };

  const handleRemoveItem = (itemId: string) => {
    setEditingItems(prevItems => prevItems.filter(item => item.id !== itemId));
  };

  const handleUpdateOrder = async () => {
    try {
      const response = await fetch(`/api/orders/${params.orderId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          description,
          items: editingItems.map(item => ({
            productId: item.product.id,
            quantity: item.quantity,
          })),
        }),
      });

      if (!response.ok) throw new Error('خطا در بروزرسانی سفارش');

      toast({
        title: "سفارش با موفقیت بروزرسانی شد",
        description: "سفارش با موفقیت بروزرسانی شد",
      });

      router.push('/representative/orders');
    } catch (error) {
      toast({
        variant: "destructive",
        title: "خطا",
        description: "بروزرسانی سفارش با مشکل مواجه شد",
      });
    }
  };

  const calculateTotal = (items: OrderItem[]) => {
    return items.reduce((total, item) => total + (item.price * item.quantity), 0);
  };

  if (loading) {
    return (
      <div className="container mx-auto py-6">
        <div className="text-center py-8">در حال بارگذاری...</div>
      </div>
    );
  }

  if (!order) {
    return (
      <div className="container mx-auto py-6">
        <div className="text-center py-8">سفارش یافت نشد</div>
      </div>
    );
  }

  return (
    <div className="container mx-auto py-6">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold">ویرایش سفارش</h1>
        <Link href="/representative/orders">
          <Button variant="outline">
            <ArrowRight className="h-4 w-4 ml-2" />
            بازگشت به لیست سفارشات
          </Button>
        </Link>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2">
          <Card>
            <CardHeader>
              <CardTitle>محصولات سفارش</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {editingItems.map((item) => (
                  <div key={item.id} className="flex items-center justify-between p-4 border rounded-lg">
                    <div className="flex items-center gap-4">
                      <img
                        src={item.product.image}
                        alt={item.product.title}
                        className="w-16 h-16 object-cover rounded"
                      />
                      <div>
                        <p className="font-medium text-lg">{item.product.title}</p>
                        <p className="text-muted-foreground">
                          {item.price.toLocaleString()} تومان
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center gap-6">
                      <div className="flex items-center gap-2">
                        <Button
                          variant="outline"
                          size="icon"
                          onClick={() => handleUpdateQuantity(item.id, item.quantity - 1)}
                          disabled={item.quantity <= 1}
                        >
                          <Minus className="h-4 w-4" />
                        </Button>
                        <span className="w-8 text-center text-lg">{item.quantity}</span>
                        <Button
                          variant="outline"
                          size="icon"
                          onClick={() => handleUpdateQuantity(item.id, item.quantity + 1)}
                        >
                          <Plus className="h-4 w-4" />
                        </Button>
                      </div>
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => handleRemoveItem(item.id)}
                      >
                        <Trash2 className="h-4 w-4 text-red-600" />
                      </Button>
                    </div>
                  </div>
                ))}
                {editingItems.length === 0 && (
                  <div className="text-center py-8 text-muted-foreground">
                    هیچ محصولی در سفارش وجود ندارد
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </div>

        <div>
          <Card>
            <CardHeader>
              <CardTitle>جزئیات سفارش</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-6">
                <div>
                  <label className="text-sm font-medium mb-2 block">
                    توضیحات سفارش:
                  </label>
                  <Textarea
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    placeholder="توضیحات سفارش را وارد کنید..."
                    className="w-full"
                    rows={4}
                  />
                </div>

                <div className="pt-4 border-t">
                  <div className="flex items-center justify-between mb-4">
                    <span className="font-medium">جمع کل:</span>
                    <span className="font-bold text-lg">
                      {calculateTotal(editingItems).toLocaleString()} تومان
                    </span>
                  </div>

                  <Button
                    className="w-full"
                    onClick={handleUpdateOrder}
                    disabled={editingItems.length === 0}
                  >
                    بروزرسانی سفارش
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
} 