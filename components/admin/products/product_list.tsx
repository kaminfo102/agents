"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Plus, Pencil, Trash2, Search, Edit } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

import { Button } from "@/components/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Input } from "@/components/ui/input";

interface Product {
  id: string;
  title: string;
  description: string | null;
  category: string;
  purchasePrice: number;
  salePrice: number;
  image: string | null;
  createdAt: string;
}

export default function ProductsPage() {
  const [searchTerm, setSearchTerm] = useState("");
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();
  const router = useRouter();

  useEffect(() => {
    fetchProducts();
  }, []);

  const fetchProducts = async () => {
    try {
      const response = await fetch("/api/products");
      if (!response.ok) {
        throw new Error("خطا در دریافت محصولات");
      }
      const data = await response.json();
      setProducts(data);
    } catch (error) {
      toast({
        variant: "destructive",
        title: "خطا",
        description: "دریافت محصولات با مشکل مواجه شد",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("آیا از حذف این محصول اطمینان دارید؟")) {
      return;
    }

    try {
      const response = await fetch(`/api/products/${id}`, {
        method: "DELETE",
      });

      if (!response.ok) {
        throw new Error("خطا در حذف محصول");
      }

      toast({
        title: "محصول با موفقیت حذف شد",
      });

      fetchProducts();
    } catch (error) {
      toast({
        variant: "destructive",
        title: "خطا",
        description: "حذف محصول با مشکل مواجه شد",
      });
    }
  };

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat("fa-IR").format(price);
  };

  const getCategoryName = (category: string) => {
    const categories: { [key: string]: string } = {
      items: "اقلام",
      books: "کتاب",
    };
    return categories[category] || category;
  };

  return (
    <div className="space-y-4">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 p-4">
        <Search className="absolute right-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
          <Input
            placeholder="جستجو در محصولات..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pr-10"
          />
        <Button onClick={() => router.push("/admin/products/add")}>
          <Plus className="h-4 w-4 ml-2" />
          افزودن محصول
        </Button>
        
      </div>
      {/* Mobile View */}
      <div className="block md:hidden space-y-4 p-4">
        {(Array.isArray(products) ? products.filter(product =>
          product.title?.toLowerCase().includes(searchTerm.toLowerCase())
        ) : []).map((product: any) => (
          <div key={product.id} className="bg-card p-4 rounded-lg border space-y-3">
            <div className="relative h-48 w-full overflow-hidden rounded-lg">
              <img
                src={product.image}
                alt={product.title}
                className="object-cover w-full h-full absolute inset-0"
              />
            </div>
            <div className="space-y-2">
              <h3 className="font-medium text-lg">{product.title}</h3>
              <p className="text-muted-foreground line-clamp-2">{product.description}</p>
              <div className="flex items-center justify-between">
                <span className="font-medium text-green-600">{formatPrice(product.purchasePrice)} تومان</span>
                <span className="font-medium text-green-600">{formatPrice(product.salePrice)} تومان</span>
                
              </div>
            </div>
            <div className="flex items-center justify-end gap-2 pt-2 border-t">
              <Button 
                variant="ghost" 
                size="icon" 
                className="hover:bg-blue-50"
                // onClick={() => setEditingProduct(product)}
                onClick={() => router.push(`/admin/products/${product.id}`)}
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
      

      <div className="rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>تصویر</TableHead>
              <TableHead>عنوان</TableHead>
              <TableHead>دسته‌بندی</TableHead>
              <TableHead>قیمت خرید</TableHead>
              <TableHead>قیمت فروش</TableHead>
              <TableHead>عملیات</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {products.map((product) => (
              <TableRow key={product.id}>
                <TableCell>
                  {product.image ? (
                    <img
                      src={product.image}
                      alt={product.title}
                      className="w-16 h-16 object-cover rounded"
                    />
                  ) : (
                    <div className="w-16 h-16 bg-gray-100 rounded flex items-center justify-center">
                      <span className="text-gray-400">بدون تصویر</span>
                    </div>
                  )}
                </TableCell>
                <TableCell>{product.title}</TableCell>
                <TableCell>{getCategoryName(product.category)}</TableCell>
                <TableCell>{formatPrice(product.purchasePrice)} تومان</TableCell>
                <TableCell>{formatPrice(product.salePrice)} تومان</TableCell>
                <TableCell>
                  <div className="flex gap-2">
                    <Button
                      variant="outline"
                      size="icon"
                      onClick={() => router.push(`/admin/products/${product.id}`)}
                    >
                      <Pencil className="h-4 w-4" />
                    </Button>
                    <Button
                      variant="destructive"
                      size="icon"
                      onClick={() => handleDelete(product.id)}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}