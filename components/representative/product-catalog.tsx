"use client";

import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Search, Plus, Minus, ShoppingCart, Trash2 } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import Image from "next/image";
import { Textarea } from "@/components/ui/textarea";

interface Product {
  id: string;
  title: string;
  description: string;
  price: number;
  image: string;
  stock: number;
}

interface CartItem {
  product: Product;
  quantity: number;
}

export function ProductCatalog() {
  const [products, setProducts] = useState<Product[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [cart, setCart] = useState<CartItem[]>([]);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();
  const [description, setDescription] = useState("");

  useEffect(() => {
    fetchProducts();
  }, []);

  const fetchProducts = async () => {
    try {
      const response = await fetch('/api/products');
      if (!response.ok) throw new Error('خطا در دریافت اطلاعات');
      const data = await response.json();
      setProducts(data);
    } catch (error) {
      toast({
        variant: "destructive",
        title: "خطا",
        description: "دریافت اطلاعات محصولات با مشکل مواجه شد",
      });
    } finally {
      setLoading(false);
    }
  };

  const addToCart = (product: Product) => {
    setCart(prevCart => {
      const existingItem = prevCart.find(item => item.product.id === product.id);
      if (existingItem) {
        return prevCart.map(item =>
          item.product.id === product.id
            ? { ...item, quantity: item.quantity + 1 }
            : item
        );
      }
      return [...prevCart, { product, quantity: 1 }];
    });
  };

  const removeFromCart = (productId: string) => {
    setCart(prevCart => prevCart.filter(item => item.product.id !== productId));
  };

  const updateQuantity = (productId: string, newQuantity: number) => {
    if (newQuantity < 1) return;
    setCart(prevCart =>
      prevCart.map(item =>
        item.product.id === productId
          ? { ...item, quantity: newQuantity }
          : item
      )
    );
  };

  const calculateTotal = () => {
    return cart.reduce((total, item) => total + (item.product.price * item.quantity), 0);
  };

  const handlePlaceOrder = async () => {
    if (cart.length === 0) {
      toast({
        variant: "destructive",
        title: "خطا",
        description: "سبد خرید خالی است",
      });
      return;
    }

    try {
      const response = await fetch('/api/orders', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          items: cart.map(item => ({
            productId: item.product.id,
            quantity: item.quantity,
          })),
          description,
        }),
      });

      if (!response.ok) throw new Error('خطا در ثبت سفارش');

      toast({
        title: "سفارش با موفقیت ثبت شد",
        description: "سفارش شما با موفقیت ثبت شد و در انتظار تایید است",
      });

      setCart([]);
      setDescription("");
    } catch (error) {
      toast({
        variant: "destructive",
        title: "خطا",
        description: "ثبت سفارش با مشکل مواجه شد",
      });
    }
  };

  const filteredProducts = products.filter(
    product =>
      product.title.includes(searchTerm) ||
      product.description.includes(searchTerm)
  );

  if (loading) {
    return <div className="text-center py-8">در حال بارگذاری...</div>;
  }

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
      <div className="lg:col-span-2">
        <Card>
          <CardHeader>
            <CardTitle>کاتالوگ محصولات</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {filteredProducts.map((product) => (
                <Card key={product.id}>
                  <CardContent className="p-4">
                    <div className="relative h-48 w-full mb-4">
                      <Image
                        src={product.image}
                        alt={product.title}
                        fill
                        className="object-cover rounded-md"
                      />
                    </div>
                    <h3 className="font-semibold text-lg mb-2">{product.title}</h3>
                    <p className="text-sm text-muted-foreground mb-2">{product.description}</p>
                    <div className="flex items-center justify-between">
                      <span className="font-medium text-green-600">
                        {product.price.toLocaleString()} تومان
                      </span>
                      <Button
                        onClick={() => addToCart(product)}
                        disabled={product.stock === 0}
                      >
                        افزودن به سبد خرید
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      <div>
        <Card>
          <CardHeader>
            <CardTitle>سبد خرید</CardTitle>
          </CardHeader>
          <CardContent>
            {cart.length === 0 ? (
              <div className="text-center py-4 text-muted-foreground">
                سبد خرید خالی است
              </div>
            ) : (
              <div className="space-y-4">
                {cart.map((item) => (
                  <div key={item.product.id} className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <img
                        src={item.product.image}
                        alt={item.product.title}
                        className="w-12 h-12 object-cover rounded"
                      />
                      <div>
                        <p className="font-medium">{item.product.title}</p>
                        <p className="text-sm text-muted-foreground">
                          {item.product.price.toLocaleString()} تومان
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <Button
                        variant="outline"
                        size="icon"
                        onClick={() => updateQuantity(item.product.id, item.quantity - 1)}
                        disabled={item.quantity <= 1}
                      >
                        -
                      </Button>
                      <span className="w-8 text-center">{item.quantity}</span>
                      <Button
                        variant="outline"
                        size="icon"
                        onClick={() => updateQuantity(item.product.id, item.quantity + 1)}
                      >
                        +
                      </Button>
                    </div>
                  </div>
                ))}

                <div className="pt-4 border-t">
                  <div className="mb-4">
                    <label className="text-sm font-medium mb-2 block">
                      توضیحات سفارش:
                    </label>
                    <Textarea
                      value={description}
                      onChange={(e) => setDescription(e.target.value)}
                      placeholder="توضیحات سفارش را وارد کنید..."
                      className="w-full"
                    />
                  </div>

                  <div className="flex items-center justify-between mb-4">
                    <span className="font-medium">جمع کل:</span>
                    <span className="font-bold">
                      {cart
                        .reduce((total, item) => total + item.product.price * item.quantity, 0)
                        .toLocaleString()}{" "}
                      تومان
                    </span>
                  </div>

                  <Button
                    className="w-full"
                    onClick={handlePlaceOrder}
                    disabled={cart.length === 0}
                  >
                    ثبت سفارش
                  </Button>
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}