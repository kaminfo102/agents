"use client";

import { useState, useEffect } from "react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Search, Trash2, Edit } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { AddProductButton } from "./add-product-button";
import { EditProductDialog } from "./edit-product-dialog";
import { Card, CardContent } from "@/components/ui/card";
import Image from "next/image";

interface Product {
  id: string;
  title: string;
  description: string;
  price: number;
  image: string;
  category: string;
  stock: number;
  createdAt: string;
}

export function ProductList() {
  const [searchTerm, setSearchTerm] = useState("");
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const { toast } = useToast();
  
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
  
  const handleDelete = async (id: string) => {
    if (!confirm("آیا از حذف این محصول اطمینان دارید؟")) return;
    
    try {
      const response = await fetch(`/api/products/${id}`, {
        method: 'DELETE',
      });

      if (!response.ok) throw new Error('خطا در حذف محصول');
      
      setProducts(products => products.filter(p => p.id !== id));
      
      toast({
        title: "محصول حذف شد",
        description: "محصول با موفقیت حذف شد",
      });
    } catch (error) {
      toast({
        variant: "destructive",
        title: "خطا",
        description: "حذف محصول با مشکل مواجه شد",
      });
    }
  };
  
  const filteredData = products.filter(
    (product) =>
      product.title.includes(searchTerm) ||
      product.description.includes(searchTerm)
  );

  if (loading) {
    return <div className="text-center py-8">در حال بارگذاری...</div>;
  }

  return (
    <div className="space-y-4">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 p-4">
        <div className="relative w-full sm:w-[300px]">
          <Search className="absolute right-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
          <Input
            placeholder="جستجو در محصولات..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pr-10"
          />
        </div>
        <AddProductButton onSuccess={fetchProducts} />
      </div>

      {/* Mobile View */}
      <div className="block md:hidden space-y-4 p-4">
        {filteredData.map((product) => (
          <div key={product.id} className="bg-card p-4 rounded-lg border space-y-3">
            <div className="relative h-48 w-full overflow-hidden rounded-lg">
              <Image
                src={product.image}
                alt={product.title}
                fill
                className="object-cover"
              />
            </div>
            <div className="space-y-2">
              <h3 className="font-medium text-lg">{product.title}</h3>
              <p className="text-muted-foreground line-clamp-2">{product.description}</p>
              <div className="flex items-center justify-between">
                <span className="font-medium text-green-600">{product.price.toLocaleString()} تومان</span>
                <span className="text-sm text-muted-foreground">موجودی: {product.stock}</span>
              </div>
            </div>
            <div className="flex items-center justify-end gap-2 pt-2 border-t">
              <Button 
                variant="ghost" 
                size="icon" 
                className="hover:bg-blue-50"
                onClick={() => setEditingProduct(product)}
              >
                <Edit className="h-4 w-4 text-blue-600" />
              </Button>
              <Button
                variant="ghost"
                size="icon"
                onClick={() => handleDelete(product.id)}
                className="hover:bg-red-50"
              >
                <Trash2 className="h-4 w-4 text-red-600" />
              </Button>
            </div>
          </div>
        ))}
      </div>

      {/* Desktop View */}
      <div className="hidden md:block">
        <div className="rounded-md border">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="w-[100px]">تصویر</TableHead>
                <TableHead>عنوان</TableHead>
                <TableHead>توضیحات</TableHead>
                <TableHead className="w-[150px]">قیمت</TableHead>
                <TableHead className="w-[100px]">عملیات</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredData.map((product) => (
                <TableRow key={product.id}>
                  <TableCell>
                    <div className="relative h-16 w-16 overflow-hidden rounded-md">
                      <Image
                        src={product.image}
                        alt={product.title}
                        fill
                        className="object-cover"
                      />
                    </div>
                  </TableCell>
                  <TableCell className="font-medium">{product.title}</TableCell>
                  <TableCell className="max-w-[300px] truncate">{product.description}</TableCell>
                  <TableCell className="font-medium text-green-600">{product.price.toLocaleString()} تومان</TableCell>
                  <TableCell>
                    <div className="flex items-center gap-2">
                      <Button 
                        variant="ghost" 
                        size="icon" 
                        className="hover:bg-blue-50"
                        onClick={() => setEditingProduct(product)}
                      >
                        <Edit className="h-4 w-4 text-blue-600" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => handleDelete(product.id)}
                        className="hover:bg-red-50"
                      >
                        <Trash2 className="h-4 w-4 text-red-600" />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      </div>

      {editingProduct && (
        <EditProductDialog
          product={editingProduct}
          open={!!editingProduct}
          onOpenChange={(open) => !open && setEditingProduct(null)}
          onSuccess={fetchProducts}
        />
      )}
    </div>
  );
}